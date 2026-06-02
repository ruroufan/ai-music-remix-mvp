import { Loader2, Sparkles } from './icons';
import type { AppStatus, AudioFileInfo, GenerationSettings, ProcessingSnapshot } from '../types';
import { ProgressBar } from './ProgressBar';

type GeneratePanelProps = {
  audio: AudioFileInfo | null;
  status: AppStatus;
  settings: GenerationSettings;
  processing: ProcessingSnapshot;
  onGenerate: () => void;
};

const settingLabel = (settings: GenerationSettings) => {
  if (settings.mode === 'voice') return settings.voice;
  if (settings.mode === 'tempo') return settings.tempo === '自定义 BPM' ? `${settings.customBpm} BPM` : settings.tempo;
  if (settings.mode === 'stems') return settings.stem;
  if (settings.mode === 'accompaniment') return settings.accompaniment;
  return settings.style;
};

export function GeneratePanel({ audio, status, settings, processing, onGenerate }: GeneratePanelProps) {
  const isProcessing = status === 'processing';
  const canGenerate = Boolean(audio) && !isProcessing;
  const isRealTempo = settings.mode === 'tempo' && ['慢速 0.8x', '加速 1.2x', '加速 1.5x'].includes(settings.tempo);
  const actionLabel = isRealTempo ? '生成真实变速版本' : '生成模拟预览';

  return (
    <section className="panel generate-panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 04</span>
        <h2>生成新版本</h2>
        <p>当前参数：{settingLabel(settings)}</p>
      </div>

      <div className={`processing-banner ${isRealTempo ? 'is-real' : 'is-mock'}`}>
        <strong>{isRealTempo ? '节奏变速已支持真实处理' : '当前功能为 mock preview'}</strong>
        <span>{isRealTempo ? '后端将使用 FFmpeg 输出真实变速音频。' : '会生成可试听的模拟结果，真实 AI 引擎稍后接入。'}</span>
      </div>

      <button className="primary-action" disabled={!canGenerate} onClick={onGenerate} type="button">
        {isProcessing ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
        {isProcessing ? '生成中...' : actionLabel}
      </button>

      {(isProcessing || status === 'completed') && <ProgressBar snapshot={processing} />}
    </section>
  );
}
