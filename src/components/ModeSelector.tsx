import { AudioLines, Disc3, FileAudio, Gauge, Headphones, Mic2, SlidersHorizontal, SplitSquareHorizontal, Timer, Wand2 } from './icons';
import type { EnabledFeatures } from '../types';

const featureCards: Array<{
  id: keyof EnabledFeatures | 'style' | 'voice' | 'stems' | 'accompaniment';
  title: string;
  description: string;
  badge: string;
  isReal: boolean;
  isToggleable: boolean;
  icon: typeof Wand2;
}> = [
  {
    id: 'trim',
    title: '音频裁剪',
    description: '设置开始与结束秒数',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: Timer,
  },
  {
    id: 'tempo',
    title: '节奏变速',
    description: '0.8x / 1.0x / 1.2x / 1.5x',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: SlidersHorizontal,
  },
  {
    id: 'volume',
    title: '音量调整',
    description: '-6dB 到 +6dB',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: Gauge,
  },
  {
    id: 'fade',
    title: '淡入淡出',
    description: '0 / 1 / 3 / 5 秒',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: AudioLines,
  },
  {
    id: 'normalize',
    title: '音量标准化',
    description: 'loudnorm 均衡响度',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: Headphones,
  },
  {
    id: 'format',
    title: '格式转换',
    description: 'mp3 / wav / m4a',
    badge: '真实处理',
    isReal: true,
    isToggleable: true,
    icon: FileAudio,
  },
  { id: 'style', title: '改风格', description: 'AI 音乐风格转换', badge: 'Mock preview', isReal: false, isToggleable: false, icon: Wand2 },
  { id: 'voice', title: '换人声', description: 'RVC 声线占位', badge: '即将支持', isReal: false, isToggleable: false, icon: Mic2 },
  {
    id: 'stems',
    title: '分离音轨',
    description: '人声 / 伴奏 / 鼓贝斯',
    badge: 'Mock preview',
    isReal: false,
    isToggleable: false,
    icon: SplitSquareHorizontal,
  },
  {
    id: 'accompaniment',
    title: '重生成伴奏',
    description: '改编曲与氛围',
    badge: '即将支持',
    isReal: false,
    isToggleable: false,
    icon: Disc3,
  },
];

type ModeSelectorProps = {
  enabledFeatures: EnabledFeatures;
  disabled: boolean;
  onToggleFeature: (feature: keyof EnabledFeatures) => void;
};

export function ModeSelector({ enabledFeatures, disabled, onToggleFeature }: ModeSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 02</span>
        <h2>选择处理功能</h2>
      </div>

      <div className="mode-grid">
        {featureCards.map((feature) => {
          const Icon = feature.icon;
          const isEnabled =
            feature.id === 'trim' ||
            feature.id === 'tempo' ||
            feature.id === 'volume' ||
            feature.id === 'fade' ||
            feature.id === 'normalize' ||
            feature.id === 'format'
              ? enabledFeatures[feature.id]
              : false;

          return (
            <button
              aria-pressed={feature.isToggleable ? isEnabled : undefined}
              className={`mode-card ${isEnabled ? 'is-active' : ''} ${!feature.isToggleable ? 'is-muted' : ''}`}
              disabled={disabled || !feature.isToggleable}
              key={feature.id}
              onClick={() => feature.isToggleable && onToggleFeature(feature.id as keyof EnabledFeatures)}
              type="button"
            >
              <span>
                <Icon size={22} />
              </span>
              <strong>{feature.title}</strong>
              <small>{feature.description}</small>
              <em className={`status-pill ${feature.isReal ? 'is-real' : 'is-mock'}`}>
                {feature.isToggleable && isEnabled ? '已开启' : feature.badge}
              </em>
            </button>
          );
        })}
      </div>

      <div className="inline-note">
        <AudioLines size={16} />
        可同时开启多个真实功能；处理顺序为裁剪、变速、音量、淡入淡出、标准化、格式转换。
      </div>
    </section>
  );
}
