import { Gauge } from './icons';

const tempoOptions = ['保持原速', '慢速 0.8x', '加速 1.2x', '加速 1.5x', '自定义 BPM', '更强鼓点', '更轻柔节奏'];

type TempoSelectorProps = {
  value: string;
  customBpm: number;
  disabled: boolean;
  onTempoChange: (value: string) => void;
  onBpmChange: (value: number) => void;
};

export function TempoSelector({ value, customBpm, disabled, onTempoChange, onBpmChange }: TempoSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 03</span>
        <h2>节奏调整</h2>
        <p>速度、BPM 和鼓点强度会在后续由 FFmpeg 与 AI 服务处理。</p>
      </div>

      <div className="option-grid">
        {tempoOptions.map((option) => (
          <button
            className={`option-chip ${value === option ? 'is-active' : ''}`}
            disabled={disabled}
            key={option}
            onClick={() => onTempoChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      {value === '自定义 BPM' && (
        <label className="bpm-control">
          <span>
            <Gauge size={18} />
            BPM {customBpm}
          </span>
          <input
            disabled={disabled}
            max="180"
            min="70"
            onChange={(event) => onBpmChange(Number(event.target.value))}
            type="range"
            value={customBpm}
          />
        </label>
      )}
    </section>
  );
}
