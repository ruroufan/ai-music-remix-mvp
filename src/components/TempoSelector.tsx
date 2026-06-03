import { Gauge } from './icons';
import type { TempoValue } from '../types';

const tempoOptions: Array<{ label: string; value: TempoValue }> = [
  { label: '慢速 0.8x', value: '0.8' },
  { label: '原速 1.0x', value: '1.0' },
  { label: '加速 1.2x', value: '1.2' },
  { label: '加速 1.5x', value: '1.5' },
];

type TempoSelectorProps = {
  value: TempoValue;
  disabled: boolean;
  onTempoChange: (value: TempoValue) => void;
};

export function TempoSelector({ value, disabled, onTempoChange }: TempoSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Tempo</span>
        <h2>节奏变速</h2>
        <p>选择本次组合处理中的播放速度。</p>
      </div>

      <div className="option-grid">
        {tempoOptions.map((option) => (
          <button
            className={`option-chip ${value === option.value ? 'is-active' : ''}`}
            disabled={disabled}
            key={option.value}
            onClick={() => onTempoChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="inline-note">
        <Gauge size={16} />
        1.0x 会保持原速，仅用于和格式转换等功能组合。
      </div>
    </section>
  );
}
