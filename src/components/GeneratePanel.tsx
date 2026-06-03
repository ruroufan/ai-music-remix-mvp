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

const selectedFeatureCount = (settings: GenerationSettings) =>
  Number(settings.enabledFeatures.tempo) + Number(settings.enabledFeatures.format);

const selectedFeatureLabel = (settings: GenerationSettings) => {
  const labels = [];
  if (settings.enabledFeatures.trim) labels.push(`音频裁剪 ${settings.trimStartTime}s-${settings.trimEndTime}s`);
  if (settings.enabledFeatures.tempo) labels.push(`节奏变速 ${settings.tempo}x`);
  if (settings.enabledFeatures.volume) labels.push(`音量 ${settings.volumeGain}`);
  if (settings.enabledFeatures.fade) labels.push(`淡入 ${settings.fadeInDuration}秒 / 淡出 ${settings.fadeOutDuration}秒`);
  if (settings.enabledFeatures.normalize) labels.push('音量标准化');
  if (settings.enabledFeatures.format) labels.push(`格式转换 ${settings.targetFormat}`);
  return labels.join('、') || '未选择真实处理功能';
};

export function GeneratePanel({ audio, status, settings, processing, onGenerate }: GeneratePanelProps) {
  const isProcessing = status === 'processing';
  const hasRealFeatures = selectedFeatureCount(settings) > 0;
  const canGenerate = Boolean(audio) && !isProcessing && hasRealFeatures;
  const actionLabel = hasRealFeatures ? '生成真实组合处理版本' : '请选择至少一个真实处理功能';

  return (
    <section className="panel generate-panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 04</span>
        <h2>生成新版本</h2>
        <p>已选择：{selectedFeatureLabel(settings)}</p>
      </div>

      <div className={`processing-banner ${hasRealFeatures ? 'is-real' : 'is-mock'}`}>
        <strong>{hasRealFeatures ? '将使用 FFmpeg 执行组合处理' : '请选择至少一个真实处理功能'}</strong>
        <span>{hasRealFeatures ? '处理顺序：裁剪 -> 节奏变速 -> 音量 -> 淡入淡出 -> 标准化 -> 格式转换。最终只输出一个音频文件。' : 'mock preview 功能暂不参与真实组合处理。'}</span>
      </div>

      <button className="primary-action" disabled={!canGenerate} onClick={onGenerate} type="button">
        {isProcessing ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
        {isProcessing ? '处理中...' : actionLabel}
      </button>

      {(isProcessing || status === 'completed') && <ProgressBar snapshot={processing} />}
    </section>
  );
}
