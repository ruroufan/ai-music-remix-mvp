export type AppStatus = 'idle' | 'uploaded' | 'configuring' | 'processing' | 'completed' | 'error';

export type RemixMode = 'pipeline' | 'style' | 'voice' | 'tempo' | 'format' | 'stems' | 'accompaniment';

export type TempoValue = '0.8' | '1.0' | '1.2' | '1.5';

export type TargetFormat = 'mp3' | 'wav' | 'm4a';

export type EnabledFeatures = {
  trim: boolean;
  tempo: boolean;
  volume: boolean;
  fade: boolean;
  normalize: boolean;
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
  trimStartTime: number;
  trimEndTime: number;
  volumeGain: '-6dB' | '-3dB' | '0dB' | '+3dB' | '+6dB';
  fadeInDuration: 0 | 1 | 3 | 5;
  fadeOutDuration: 0 | 1 | 3 | 5;
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
  appliedFeatures?: Array<'trim' | 'tempo' | 'volume' | 'fade' | 'normalize' | 'format'>;
  trim?: {
    startTime: number;
    endTime: number;
  };
  tempo?: TempoValue;
  volumeGain?: GenerationSettings['volumeGain'];
  fade?: {
    fadeInDuration: number;
    fadeOutDuration: number;
  };
  normalize?: boolean;
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
