import type { GenerationResult, MockGenerationInput } from '../types';

export type ApiJobInput = MockGenerationInput & {
  jobId?: string;
};

const reservedOnly = async <T>(message: string): Promise<T> => {
  throw new Error(`${message} is reserved for the production backend.`);
};

export const uploadAudio = (file: File) =>
  reservedOnly<{ uploadId: string; fileName: string }>('POST /api/upload');

export const separateAudio = (input: ApiJobInput) =>
  reservedOnly<{ jobId: string }>('POST /api/separate');

export const convertVoice = (input: ApiJobInput) =>
  reservedOnly<{ jobId: string }>('POST /api/convert-voice');

export const changeStyle = (input: ApiJobInput) =>
  reservedOnly<{ jobId: string }>('POST /api/change-style');

const createAudioFormData = (input: ApiJobInput) => {
  const formData = new FormData();
  formData.append('audio', input.audio.file);
  return formData;
};

const readPayload = async (response: Response) => response.json().catch(() => ({ error: '' }));

export const processAudio = async (input: ApiJobInput): Promise<GenerationResult> => {
  const formData = createAudioFormData(input);
  formData.append('startTime', String(input.settings.trimStartTime));
  formData.append('endTime', String(input.settings.trimEndTime));
  formData.append('tempo', input.settings.tempo);
  formData.append('volumeGain', input.settings.volumeGain);
  formData.append('fadeInDuration', String(input.settings.fadeInDuration));
  formData.append('fadeOutDuration', String(input.settings.fadeOutDuration));
  formData.append('targetFormat', input.settings.targetFormat);
  formData.append('enabledFeatures', JSON.stringify(input.settings.enabledFeatures));

  const response = await fetch('/api/process-audio', {
    method: 'POST',
    body: formData,
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(payload.error || 'FFmpeg 组合处理失败，请换一个音频文件后重试。');
  }

  return {
    id: payload.id,
    name: payload.name,
    mode: 'pipeline',
    settings: input.settings,
    audioUrl: payload.url,
    createdAt: new Date().toISOString(),
    resultType: 'real',
    appliedFeatures: payload.appliedFeatures,
    trim: payload.trim,
    tempo: payload.tempo,
    volumeGain: payload.volumeGain,
    fade: payload.fade,
    normalize: payload.normalize,
    format: payload.format,
  };
};

export const changeTempo = async (input: ApiJobInput): Promise<GenerationResult> => {
  const formData = createAudioFormData(input);
  formData.append('tempo', input.settings.tempo);

  const response = await fetch('/api/change-tempo', {
    method: 'POST',
    body: formData,
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(payload.error || 'FFmpeg 处理失败，请换一个音频文件后重试。');
  }

  return {
    id: payload.id,
    name: payload.name,
    mode: 'tempo',
    settings: input.settings,
    audioUrl: payload.url,
    createdAt: new Date().toISOString(),
    resultType: 'real',
    appliedFeatures: ['tempo'],
    tempo: input.settings.tempo,
  };
};

export const convertFormat = async (input: ApiJobInput): Promise<GenerationResult> => {
  const formData = createAudioFormData(input);
  formData.append('targetFormat', input.settings.targetFormat);

  const response = await fetch('/api/convert-format', {
    method: 'POST',
    body: formData,
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(payload.error || 'FFmpeg 格式转换失败，请换一个音频文件后重试。');
  }

  return {
    id: payload.id,
    name: payload.name,
    mode: 'format',
    settings: input.settings,
    audioUrl: payload.url,
    createdAt: new Date().toISOString(),
    resultType: 'real',
    appliedFeatures: ['format'],
    format: input.settings.targetFormat,
  };
};

export const generateRemix = (input: ApiJobInput) =>
  reservedOnly<{ jobId: string }>('POST /api/generate');

export const getJob = (jobId: string) =>
  reservedOnly<{ id: string; status: string; progress: number }>(`GET /api/jobs/${jobId}`);

export const getDownloadUrl = (resultId: string) =>
  reservedOnly<{ url: string }>(`GET /api/download/${resultId}`);
