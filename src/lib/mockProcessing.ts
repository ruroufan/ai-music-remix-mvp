import type { GenerationResult, MockGenerationInput, ProcessingSnapshot } from '../types';

export const processingSteps = [
  '分析音频',
  '分离人声和伴奏',
  '应用风格',
  '调整节奏',
  '合成新版本',
  '完成',
];

export const createMockResultName = (fileName: string, label: string) => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName} - ${label} AI Remix`;
};

export const runMockGeneration = (
  input: MockGenerationInput,
  onProgress: (snapshot: ProcessingSnapshot) => void,
) => {
  const totalMs = 3800 + Math.round(Math.random() * 900);
  const startedAt = Date.now();

  return new Promise<GenerationResult>((resolve) => {
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));
      const stepIndex = Math.min(
        processingSteps.length - 1,
        Math.floor((progress / 100) * processingSteps.length),
      );

      onProgress({
        progress,
        step: processingSteps[stepIndex],
      });

      if (progress >= 100) {
        window.clearInterval(timer);
        const result: GenerationResult = {
          id: crypto.randomUUID(),
          name: createMockResultName(input.audio.name, input.settings.style),
          mode: input.settings.mode,
          settings: input.settings,
          audioUrl: input.audio.url,
          createdAt: new Date().toISOString(),
          resultType: 'mock',
        };
        resolve(result);
      }
    }, 120);
  });
};
