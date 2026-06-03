export type AppStatus = 'idle' | 'uploaded' | 'configuring' | 'processing' | 'completed' | 'error';

export type RemixMode = 'pipeline' | 'style' | 'voice' | 'tempo' | 'format' | 'stems' | 'accompaniment';

export type TempoValue = '0.8' | '1.0' | '1.2' | '1.5';

export type TargetFormat = 'mp3' | 'wav' | 'm4a';

export type EnabledFeatures = {
  tempo: boolean;
  format: boolean;
};

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
  enabledFeatures: EnabledFeatures;
  style: string;
  voice: string;
  tempo: TempoValue;
  customBpm: number;
  targetFormat: TargetFormat;
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
  appliedFeatures?: Array<'tempo' | 'format'>;
  tempo?: TempoValue;
  format?: TargetFormat;
};

export type ProcessingSnapshot = {
  progress: number;
  step: string;
};

export type MockGenerationInput = {
  audio: AudioFileInfo;
  settings: GenerationSettings;
};
