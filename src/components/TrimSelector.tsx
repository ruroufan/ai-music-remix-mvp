import type { AudioFileInfo } from '../types';
import { formatDuration } from '../lib/format';

type TrimSelectorProps = {
  audio: AudioFileInfo | null;
  startTime: number;
  endTime: number;
  disabled: boolean;
  onChange: (values: { startTime: number; endTime: number }) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function TrimSelector({ audio, startTime, endTime, disabled, onChange }: TrimSelectorProps) {
  const duration = Math.max(0, audio?.duration ?? 0);
  const quickDurations = [15, 30, 60];

  const updateStart = (value: number) => {
    const nextStart = clamp(value, 0, duration);
    onChange({ startTime: nextStart, endTime: Math.max(endTime, nextStart + 1) });
  };

  const updateEnd = (value: number) => {
    onChange({ startTime, endTime: clamp(value, startTime + 1, duration || value) });
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Trim</span>
        <h2>音频裁剪</h2>
        <p>当前音频时长：{duration ? formatDuration(duration) : '--:--'}</p>
      </div>

      <div className="trim-grid">
        <label className="time-input">
          <span>开始秒数</span>
          <input
            disabled={disabled}
            min="0"
            onChange={(event) => updateStart(Number(event.target.value))}
            step="0.1"
            type="number"
            value={startTime}
          />
        </label>
        <label className="time-input">
          <span>结束秒数</span>
          <input
            disabled={disabled}
            min="0"
            onChange={(event) => updateEnd(Number(event.target.value))}
            step="0.1"
            type="number"
            value={endTime}
          />
        </label>
      </div>

      <div className="option-grid compact-options">
        {quickDurations.map((seconds) => (
          <button
            className="option-chip"
            disabled={disabled || !duration}
            key={seconds}
            onClick={() => onChange({ startTime: 0, endTime: Math.min(seconds, duration || seconds) })}
            type="button"
          >
            前 {seconds} 秒
          </button>
        ))}
      </div>
    </section>
  );
}
