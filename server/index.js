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
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isSupported = ['.mp3', '.wav', '.m4a'].includes(extension);
    callback(isSupported ? null : new Error('Only mp3, wav, and m4a files are supported.'), isSupported);
  },
});

const runFfmpegTempo = ({ inputPath, outputPath, tempo }) =>
  new Promise((resolve, reject) => {
    const ffmpeg = ffmpegPath || 'ffmpeg';
    const child = spawn(ffmpeg, [
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

    let errorOutput = '';
    child.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(errorOutput || `FFmpeg exited with code ${code}`));
    });
  });

app.use('/outputs', express.static(outputDir));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'ai-music-remix-tempo-api',
    ffmpeg: Boolean(ffmpegPath),
  });
});

app.post('/api/change-tempo', (request, response) => {
  upload.single('audio')(request, response, async (uploadError) => {
    if (uploadError) {
      response.status(400).json({
        error: uploadError instanceof Error ? uploadError.message : 'Audio upload failed.',
      });
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
      await runFfmpegTempo({
        inputPath: file.path,
        outputPath,
        tempo,
      });

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
      response.status(500).json({
        error: error instanceof Error ? error.message : 'FFmpeg processing failed.',
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
