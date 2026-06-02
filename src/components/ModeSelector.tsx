import { AudioLines, Disc3, Mic2, SlidersHorizontal, SplitSquareHorizontal, Wand2 } from './icons';
import type { RemixMode } from '../types';

const modes: Array<{
  id: RemixMode;
  title: string;
  description: string;
  badge: string;
  isReal: boolean;
  icon: typeof Wand2;
}> = [
  { id: 'style', title: '改风格', description: 'AI 音乐风格转换', badge: 'Mock preview', isReal: false, icon: Wand2 },
  { id: 'voice', title: '换人声', description: 'RVC 声线占位', badge: '即将支持', isReal: false, icon: Mic2 },
  { id: 'tempo', title: '改节奏', description: '0.8x / 1.2x / 1.5x', badge: '真实处理', isReal: true, icon: SlidersHorizontal },
  {
    id: 'stems',
    title: '分离音轨',
    description: '人声 / 伴奏 / 鼓贝斯',
    badge: 'Mock preview',
    isReal: false,
    icon: SplitSquareHorizontal,
  },
  {
    id: 'accompaniment',
    title: '重生成伴奏',
    description: '改编曲与氛围',
    badge: '即将支持',
    isReal: false,
    icon: Disc3,
  },
];

type ModeSelectorProps = {
  value: RemixMode;
  disabled: boolean;
  onChange: (mode: RemixMode) => void;
};

export function ModeSelector({ value, disabled, onChange }: ModeSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 02</span>
        <h2>选择处理方式</h2>
      </div>

      <div className="mode-grid">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              className={`mode-card ${value === mode.id ? 'is-active' : ''}`}
              disabled={disabled}
              key={mode.id}
              onClick={() => onChange(mode.id)}
              type="button"
            >
              <span>
                <Icon size={22} />
              </span>
              <strong>{mode.title}</strong>
              <small>{mode.description}</small>
              <em className={`status-pill ${mode.isReal ? 'is-real' : 'is-mock'}`}>{mode.badge}</em>
            </button>
          );
        })}
      </div>

      <div className="inline-note">
        <AudioLines size={16} />
        节奏变速已支持真实 FFmpeg 处理；其他模式当前为 mock preview，后续再接 RVC、Demucs、ACE-Step。
      </div>
    </section>
  );
}
