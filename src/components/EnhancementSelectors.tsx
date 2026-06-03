import type { GenerationSettings } from '../types';

type VolumeSelectorProps = {
  value: GenerationSettings['volumeGain'];
  disabled: boolean;
  onChange: (value: GenerationSettings['volumeGain']) => void;
};

type FadeSelectorProps = {
  fadeInDuration: GenerationSettings['fadeInDuration'];
  fadeOutDuration: GenerationSettings['fadeOutDuration'];
  disabled: boolean;
  onChange: (values: {
    fadeInDuration: GenerationSettings['fadeInDuration'];
    fadeOutDuration: GenerationSettings['fadeOutDuration'];
  }) => void;
};

const volumeOptions: Array<GenerationSettings['volumeGain']> = ['-6dB', '-3dB', '0dB', '+3dB', '+6dB'];
const fadeOptions: Array<GenerationSettings['fadeInDuration']> = [0, 1, 3, 5];

export function VolumeSelector({ value, disabled, onChange }: VolumeSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Volume</span>
        <h2>音量调整</h2>
        <p>使用 FFmpeg volume filter 调整整体音量。</p>
      </div>

      <div className="option-grid">
        {volumeOptions.map((option) => (
          <button
            className={`option-chip ${value === option ? 'is-active' : ''}`}
            disabled={disabled}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

export function FadeSelector({ fadeInDuration, fadeOutDuration, disabled, onChange }: FadeSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Fade</span>
        <h2>淡入淡出</h2>
        <p>fade out 会根据处理后的音频时长自动计算开始时间。</p>
      </div>

      <div className="enhance-grid">
        <div>
          <span className="field-label">淡入</span>
          <div className="option-grid compact-options">
            {fadeOptions.map((option) => (
              <button
                className={`option-chip ${fadeInDuration === option ? 'is-active' : ''}`}
                disabled={disabled}
                key={`in-${option}`}
                onClick={() => onChange({ fadeInDuration: option, fadeOutDuration })}
                type="button"
              >
                {option} 秒
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="field-label">淡出</span>
          <div className="option-grid compact-options">
            {fadeOptions.map((option) => (
              <button
                className={`option-chip ${fadeOutDuration === option ? 'is-active' : ''}`}
                disabled={disabled}
                key={`out-${option}`}
                onClick={() => onChange({ fadeInDuration, fadeOutDuration: option })}
                type="button"
              >
                {option} 秒
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function NormalizeSelector() {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Normalize</span>
        <h2>音量标准化</h2>
        <p>使用 FFmpeg loudnorm 让音量更均衡，适合短视频发布。</p>
      </div>
      <div className="processing-banner is-real">
        <strong>标准化已开启</strong>
        <span>会在裁剪、变速、音量和淡入淡出之后执行。</span>
      </div>
    </section>
  );
}
