export type AppStatus = 'idle' | 'uploaded' | 'configuring' | 'processing' | 'completed' | 'error';

export type RemixMode = 'style' | 'voice' | 'tempo' | 'format' | 'stems' | 'accompaniment';

export type AudioFileInfo = {
  file: File;
  name: string;
  size: number;
  duration: number;
  type: string;
  url: string;
};

export type GenerationSettings = {
  mode: RemixMode;
  style: string;
  voice: string;
  tempo: string;
  customBpm: number;
  targetFormat: 'mp3' | 'wav' | 'm4a';
  stem: string;
  accompaniment: string;
};

export type GenerationResult = {
  id: string;
  name: string;
  mode: RemixMode;
  settings: GenerationSettings;
  audioUrl: string;
  createdAt: string;
  resultType: 'real' | 'mock';
};

export type ProcessingSnapshot = {
  progress: number;
  step: string;
};

export type MockGenerationInput = {
  audio: AudioFileInfo;
  settings: GenerationSettings;
};
