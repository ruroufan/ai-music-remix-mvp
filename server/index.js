import express from 'express';
import ffmpegPath from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const uploadDir = path.join(projectRoot, 'server', 'uploads');
const outputDir = path.join(projectRoot, 'server', 'outputs');
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 5174);
const allowedTempos = new Set(['0.8', '1.0', '1.2', '1.5']);
const allowedTargetFormats = new Set(['mp3', 'wav', 'm4a']);
const allowedVolumeGains = new Set(['-6dB', '-3dB', '0dB', '+3dB', '+6dB']);
const allowedFadeDurations = new Set(['0', '1', '3', '5']);
const maxAudioSizeBytes = 20 * 1024 * 1024;
const maxAudioDurationSeconds = 5 * 60;
const outputMaxAgeMs = Number(process.env.OUTPUT_MAX_AGE_MS || 60 * 60 * 1000);
const cleanupIntervalMs = Number(process.env.CLEANUP_INTERVAL_MS || 15 * 60 * 1000);
const allowedExtensions = new Set(['.mp3', '.wav', '.m4a']);
const allowedMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'application/octet-stream',
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.mp3';
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxAudioSizeBytes,
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const hasSupportedExtension = allowedExtensions.has(extension);
    const hasSupportedMime = !file.mimetype || allowedMimeTypes.has(file.mimetype);
    const isSupported = hasSupportedExtension && hasSupportedMime;
    callback(isSupported ? null : new Error('只支持 mp3、wav、m4a 音频文件。'), isSupported);
  },
});

const cleanupOldOutputs = () => {
  const now = Date.now();

  for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;

    const filePath = path.join(outputDir, entry.name);
    let stats;

    try {
      stats = fs.statSync(filePath);
    } catch {
      continue;
    }

    if (now - stats.mtimeMs > outputMaxAgeMs) {
      fs.rmSync(filePath, { force: true });
    }
  }
};

cleanupOldOutputs();
setInterval(cleanupOldOutputs, cleanupIntervalMs).unref();

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const ffmpeg = ffmpegPath || 'ffmpeg';
    const child = spawn(ffmpeg, args);
    let errorOutput = '';

    child.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(errorOutput);
        return;
      }

      reject(new Error(errorOutput || `FFmpeg exited with code ${code}`));
    });
  });

const getAudioDuration = async (inputPath) => {
  const ffmpegOutput = await runFfmpeg(['-i', inputPath]).catch((error) => {
    if (error instanceof Error && error.message.includes('Duration:')) return error.message;
    throw error;
  });

  const match = String(ffmpegOutput).match(/Duration:\s(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);

  if (!match) {
    throw new Error('无法读取音频时长，请确认文件是有效音频。');
  }

  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const ensureValidDuration = async (filePath) => {
  const duration = await getAudioDuration(filePath);

  if (duration > maxAudioDurationSeconds) {
    throw new Error('音频太长。第一版最大支持 5 分钟。');
  }
};

const runFfmpegTempo = ({ inputPath, outputPath, tempo }) =>
  runFfmpeg([
    '-y',
    '-i',
    inputPath,
    '-filter:a',
    `atempo=${tempo}`,
    '-vn',
    '-codec:a',
    'libmp3lame',
    '-q:a',
    '2',
    outputPath,
  ]);

const runFfmpegTrim = ({ inputPath, outputPath, startTime, endTime }) =>
  runFfmpeg(['-y', '-ss', String(startTime), '-to', String(endTime), '-i', inputPath, '-vn', '-codec:a', 'libmp3lame', '-q:a', '2', outputPath]);

const runFfmpegFilter = ({ inputPath, outputPath, filter }) =>
  runFfmpeg(['-y', '-i', inputPath, '-vn', '-filter:a', filter, '-codec:a', 'libmp3lame', '-q:a', '2', outputPath]);

const formatArgs = {
  mp3: ['-codec:a', 'libmp3lame', '-q:a', '2'],
  wav: ['-codec:a', 'pcm_s16le'],
  m4a: ['-codec:a', 'aac', '-b:a', '192k'],
};

const runFfmpegFormat = ({ inputPath, outputPath, targetFormat }) =>
  runFfmpeg(['-y', '-i', inputPath, '-vn', ...formatArgs[targetFormat], outputPath]);

const handleUploadError = (error, response) => {
  const isSizeError = error instanceof Error && error.message.includes('File too large');

  response.status(400).json({
    error: isSizeError ? '文件太大。第一版最大支持 20MB 音频。' : error instanceof Error ? error.message : '上传失败。',
  });
};

const statusForProcessingError = (error) => {
  const message = error instanceof Error ? error.message : '';
  return message.includes('5 分钟') ||
    message.includes('无法读取音频时长') ||
    message.includes('裁剪开始时间') ||
    message.includes('裁剪结束时间')
    ? 400
    : 500;
};

app.use('/outputs', express.static(outputDir));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'ai-music-remix-ffmpeg-api',
    ffmpeg: Boolean(ffmpegPath),
    features: ['process-audio', 'change-tempo', 'convert-format'],
  });
});

app.post('/api/process-audio', (request, response) => {
  upload.single('audio')(request, response, async (uploadError) => {
    if (uploadError) {
      handleUploadError(uploadError, response);
      return;
    }

    const file = request.file;
    const startTime = Number(request.body.startTime);
    const endTime = Number(request.body.endTime);
    const tempo = String(request.body.tempo || '1.0');
    const volumeGain = String(request.body.volumeGain || '0dB');
    const fadeInDuration = String(request.body.fadeInDuration ?? '0');
    const fadeOutDuration = String(request.body.fadeOutDuration ?? '0');
    const targetFormat = String(request.body.targetFormat || 'mp3').toLowerCase();

    let enabledFeatures;
    try {
      enabledFeatures = JSON.parse(String(request.body.enabledFeatures || '{}'));
    } catch {
      enabledFeatures = {};
    }

    const useTempo = enabledFeatures.tempo === true;
    const useVolume = enabledFeatures.volume === true;
    const useFade = enabledFeatures.fade === true;
    const useNormalize = enabledFeatures.normalize === true;
    const useFormat = enabledFeatures.format === true;
    const useTrim = enabledFeatures.trim === true;

    if (!file) {
      response.status(400).json({ error: 'Audio file is required.' });
      return;
    }

    if (!useTrim && !useTempo && !useVolume && !useFade && !useNormalize && !useFormat) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'Please enable at least one real processing feature.' });
      return;
    }

    if (useTempo && !allowedTempos.has(tempo)) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'Tempo must be 0.8, 1.0, 1.2, or 1.5.' });
      return;
    }

    if (useFormat && !allowedTargetFormats.has(targetFormat)) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'targetFormat must be mp3, wav, or m4a.' });
      return;
    }

    if (useVolume && !allowedVolumeGains.has(volumeGain)) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'volumeGain must be -6dB, -3dB, 0dB, +3dB, or +6dB.' });
      return;
    }

    if (useFade && (!allowedFadeDurations.has(fadeInDuration) || !allowedFadeDurations.has(fadeOutDuration))) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'fade durations must be 0, 1, 3, or 5 seconds.' });
      return;
    }

    const id = randomUUID();
    const safeBaseName = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^\w.-]+/g, '-');
    const finalFormat = useFormat ? targetFormat : 'mp3';
    const outputName = `${safeBaseName || 'audio'}-processed-${id}.${finalFormat}`;
    const outputPath = path.join(outputDir, outputName);
    const tempFiles = [];
    let currentPath = file.path;

    try {
      const duration = await getAudioDuration(file.path);

      if (duration > maxAudioDurationSeconds) {
        throw new Error('音频太长。第一版最大支持 5 分钟。');
      }

      if (useTrim) {
        if (!Number.isFinite(startTime) || startTime < 0) {
          throw new Error('裁剪开始时间必须大于或等于 0。');
        }

        if (!Number.isFinite(endTime) || endTime <= startTime) {
          throw new Error('裁剪结束时间必须大于开始时间。');
        }

        if (endTime > duration) {
          throw new Error('裁剪结束时间不能超过音频总时长。');
        }

        const trimOutputPath = useTempo || useFormat ? path.join(outputDir, `${safeBaseName || 'audio'}-trim-${id}.mp3`) : outputPath;
        await runFfmpegTrim({ inputPath: currentPath, outputPath: trimOutputPath, startTime, endTime });
        currentPath = trimOutputPath;
        if (useTempo || useFormat) tempFiles.push(trimOutputPath);
      }

      if (useTempo && tempo !== '1.0') {
        const tempoOutputPath =
          useVolume || useFade || useNormalize || useFormat ? path.join(outputDir, `${safeBaseName || 'audio'}-tempo-${id}.mp3`) : outputPath;
        await runFfmpegTempo({ inputPath: currentPath, outputPath: tempoOutputPath, tempo });
        currentPath = tempoOutputPath;
        if (useVolume || useFade || useNormalize || useFormat) tempFiles.push(tempoOutputPath);
      }

      if (useVolume) {
        const volumeOutputPath = useFade || useNormalize || useFormat ? path.join(outputDir, `${safeBaseName || 'audio'}-volume-${id}.mp3`) : outputPath;
        await runFfmpegFilter({ inputPath: currentPath, outputPath: volumeOutputPath, filter: `volume=${volumeGain}` });
        currentPath = volumeOutputPath;
        if (useFade || useNormalize || useFormat) tempFiles.push(volumeOutputPath);
      }

      if (useFade) {
        const fadeIn = Number(fadeInDuration);
        const fadeOut = Number(fadeOutDuration);
        const currentDuration = await getAudioDuration(currentPath);
        const filters = [];
        if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${Math.min(fadeIn, currentDuration)}`);
        if (fadeOut > 0) filters.push(`afade=t=out:st=${Math.max(0, currentDuration - fadeOut)}:d=${Math.min(fadeOut, currentDuration)}`);

        if (filters.length > 0) {
          const fadeOutputPath = useNormalize || useFormat ? path.join(outputDir, `${safeBaseName || 'audio'}-fade-${id}.mp3`) : outputPath;
          await runFfmpegFilter({ inputPath: currentPath, outputPath: fadeOutputPath, filter: filters.join(',') });
          currentPath = fadeOutputPath;
          if (useNormalize || useFormat) tempFiles.push(fadeOutputPath);
        }
      }

      if (useNormalize) {
        const normalizeOutputPath = useFormat ? path.join(outputDir, `${safeBaseName || 'audio'}-normalize-${id}.mp3`) : outputPath;
        await runFfmpegFilter({ inputPath: currentPath, outputPath: normalizeOutputPath, filter: 'loudnorm=I=-16:TP=-1.5:LRA=11' });
        currentPath = normalizeOutputPath;
        if (useFormat) tempFiles.push(normalizeOutputPath);
      }

      if (useFormat) {
        await runFfmpegFormat({ inputPath: currentPath, outputPath, targetFormat });
      } else if (
        (!useTrim && (!useTempo || tempo === '1.0') && !useVolume && !useFade && !useNormalize) ||
        currentPath === file.path
      ) {
        await runFfmpegFormat({ inputPath: currentPath, outputPath, targetFormat: finalFormat });
      }

      fs.rmSync(file.path, { force: true });
      tempFiles.forEach((tempFile) => fs.rmSync(tempFile, { force: true }));

      const appliedFeatures = [];
      if (useTrim) appliedFeatures.push('trim');
      if (useTempo) appliedFeatures.push('tempo');
      if (useVolume) appliedFeatures.push('volume');
      if (useFade) appliedFeatures.push('fade');
      if (useNormalize) appliedFeatures.push('normalize');
      if (useFormat) appliedFeatures.push('format');

      response.json({
        id,
        name: `${safeBaseName || 'audio'} - FFmpeg Pipeline`,
        url: `/outputs/${outputName}`,
        resultType: 'real',
        appliedFeatures,
        trim: useTrim ? { startTime, endTime } : undefined,
        tempo: useTempo ? tempo : undefined,
        volumeGain: useVolume ? volumeGain : undefined,
        fade: useFade ? { fadeInDuration: Number(fadeInDuration), fadeOutDuration: Number(fadeOutDuration) } : undefined,
        normalize: useNormalize || undefined,
        format: finalFormat,
      });
    } catch (error) {
      fs.rmSync(file.path, { force: true });
      fs.rmSync(outputPath, { force: true });
      tempFiles.forEach((tempFile) => fs.rmSync(tempFile, { force: true }));
      response.status(statusForProcessingError(error)).json({
        error: error instanceof Error ? error.message : 'FFmpeg pipeline processing failed.',
      });
    }
  });
});

app.post('/api/change-tempo', (request, response) => {
  upload.single('audio')(request, response, async (uploadError) => {
    if (uploadError) {
      handleUploadError(uploadError, response);
      return;
    }

    const file = request.file;
    const tempo = String(request.body.tempo || '');

    if (!file) {
      response.status(400).json({ error: 'Audio file is required.' });
      return;
    }

    if (!allowedTempos.has(tempo)) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'Tempo must be 0.8, 1.0, 1.2, or 1.5.' });
      return;
    }

    const id = randomUUID();
    const safeBaseName = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^\w.-]+/g, '-');
    const outputName = `${safeBaseName || 'audio'}-${tempo}x-${id}.mp3`;
    const outputPath = path.join(outputDir, outputName);

    try {
      await ensureValidDuration(file.path);
      await runFfmpegTempo({ inputPath: file.path, outputPath, tempo });
      fs.rmSync(file.path, { force: true });

      response.json({
        id,
        name: `${safeBaseName || 'audio'} - ${tempo}x Tempo`,
        tempo,
        url: `/outputs/${outputName}`,
      });
    } catch (error) {
      fs.rmSync(file.path, { force: true });
      fs.rmSync(outputPath, { force: true });
      response.status(statusForProcessingError(error)).json({
        error: error instanceof Error ? error.message : 'FFmpeg processing failed.',
      });
    }
  });
});

app.post('/api/convert-format', (request, response) => {
  upload.single('audio')(request, response, async (uploadError) => {
    if (uploadError) {
      handleUploadError(uploadError, response);
      return;
    }

    const file = request.file;
    const targetFormat = String(request.body.targetFormat || '').toLowerCase();

    if (!file) {
      response.status(400).json({ error: 'Audio file is required.' });
      return;
    }

    if (!allowedTargetFormats.has(targetFormat)) {
      fs.rmSync(file.path, { force: true });
      response.status(400).json({ error: 'targetFormat must be mp3, wav, or m4a.' });
      return;
    }

    const id = randomUUID();
    const safeBaseName = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^\w.-]+/g, '-');
    const outputName = `${safeBaseName || 'audio'}-${targetFormat}-${id}.${targetFormat}`;
    const outputPath = path.join(outputDir, outputName);

    try {
      await ensureValidDuration(file.path);
      await runFfmpegFormat({ inputPath: file.path, outputPath, targetFormat });
      fs.rmSync(file.path, { force: true });

      response.json({
        id,
        name: `${safeBaseName || 'audio'} - ${targetFormat.toUpperCase()} Format`,
        format: targetFormat,
        url: `/outputs/${outputName}`,
        resultType: 'real',
      });
    } catch (error) {
      fs.rmSync(file.path, { force: true });
      fs.rmSync(outputPath, { force: true });
      response.status(statusForProcessingError(error)).json({
        error: error instanceof Error ? error.message : 'FFmpeg format conversion failed.',
      });
    }
  });
});

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distDir));

  app.get(/.*/, (_request, response) => {
    response.sendFile(indexHtmlPath);
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
