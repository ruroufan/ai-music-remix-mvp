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
const allowedTempos = new Set(['0.8', '1.2', '1.5']);
const allowedTargetFormats = new Set(['mp3', 'wav', 'm4a']);
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
  return message.includes('5 分钟') || message.includes('无法读取音频时长') ? 400 : 500;
};

app.use('/outputs', express.static(outputDir));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'ai-music-remix-ffmpeg-api',
    ffmpeg: Boolean(ffmpegPath),
    features: ['change-tempo', 'convert-format'],
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
      response.status(400).json({ error: 'Tempo must be 0.8, 1.2, or 1.5.' });
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
