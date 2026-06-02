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

const tempoValueByLabel: Record<string, string> = {
  '慢速 0.8x': '0.8',
  '加速 1.2x': '1.2',
  '加速 1.5x': '1.5',
};

export const canUseRealTempo = (label: string) => label in tempoValueByLabel;

export const changeTempo = async (input: ApiJobInput): Promise<GenerationResult> => {
  const tempo = tempoValueByLabel[input.settings.tempo];

  if (!tempo) {
    throw new Error('当前真实后端仅支持 0.8x、1.2x、1.5x 变速。');
  }

  const formData = new FormData();
  formData.append('audio', input.audio.file);
  formData.append('tempo', tempo);

  const response = await fetch('/api/change-tempo', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'FFmpeg 变速处理失败。');
  }

  return {
    id: payload.id,
    name: payload.name,
    mode: 'tempo',
    settings: input.settings,
    audioUrl: payload.url,
    createdAt: new Date().toISOString(),
    resultType: 'real',
  };
};

export const generateRemix = (input: ApiJobInput) =>
  reservedOnly<{ jobId: string }>('POST /api/generate');

export const getJob = (jobId: string) =>
  reservedOnly<{ id: string; status: string; progress: number }>(`GET /api/jobs/${jobId}`);

export const getDownloadUrl = (resultId: string) =>
  reservedOnly<{ url: string }>(`GET /api/download/${resultId}`);
