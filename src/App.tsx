import { useMemo, useState } from 'react';
import { Cpu, Headphones, Sparkles } from './components/icons';
import { AudioPreview } from './components/AudioPreview';
import { CopyrightNotice } from './components/CopyrightNotice';
import { GeneratePanel } from './components/GeneratePanel';
import { HistoryList } from './components/HistoryList';
import { ModeSelector } from './components/ModeSelector';
import { OptionSelector } from './components/OptionSelector';
import { ResultPlayer } from './components/ResultPlayer';
import { TempoSelector } from './components/TempoSelector';
import { UploadArea } from './components/UploadArea';
import { canUseRealTempo, changeTempo, convertFormat } from './lib/api';
import { runMockGeneration } from './lib/mockProcessing';
import type { AppStatus, AudioFileInfo, GenerationResult, GenerationSettings, RemixMode } from './types';

const styles = [
  'J-Pop',
  'K-Pop',
  'City Pop',
  'Lo-fi',
  'EDM',
  'Rock',
  'Jazz',
  'Acoustic',
  'Piano Ballad',
  'Future Bass',
  'Anime Opening',
  'Vaporwave',
];

const voices = ['女声', '男声', '少年感', '低沉男声', '清透女声', '机器人声', '自定义声线占位'];
const stems = ['提取人声', '提取伴奏', '提取鼓点', '提取贝斯', '提取其他乐器'];
const accompaniments = ['保留原旋律', '保留原歌词', '改变编曲', '改变氛围', '改变速度', '改变乐器'];
const formats = ['mp3', 'wav', 'm4a'];

const defaultSettings: GenerationSettings = {
  mode: 'style',
  style: 'City Pop',
  voice: '清透女声',
  tempo: '保持原速',
  customBpm: 120,
  targetFormat: 'mp3',
  stem: '提取伴奏',
  accompaniment: '保留原旋律',
};

const modeCopy: Record<RemixMode, { title: string; subtitle: string; options: string[] }> = {
  style: {
    title: '风格替换',
    subtitle: '当前为 mock preview，后续可接 ACE-Step、MusicGen 或 Stable Audio。',
    options: styles,
  },
  voice: {
    title: '人声替换',
    subtitle: '当前为 UI 占位，不做真实 voice clone，后续可接 RVC 或 so-vits-svc。',
    options: voices,
  },
  tempo: {
    title: '节奏调整',
    subtitle: '0.8x / 1.2x / 1.5x 已支持真实 FFmpeg 变速。',
    options: [],
  },
  format: {
    title: '格式转换',
    subtitle: '使用 FFmpeg 真实转换为 mp3、wav 或 m4a。',
    options: formats,
  },
  stems: {
    title: '人声 / 伴奏分离',
    subtitle: '当前为 mock preview，后续可接 Demucs 或 UVR。',
    options: stems,
  },
  accompaniment: {
    title: '重新生成伴奏',
    subtitle: '当前为 mock preview，后续可接 ACE-Step、MusicGen 或 YuE。',
    options: accompaniments,
  },
};

const getModeValue = (settings: GenerationSettings) => {
  if (settings.mode === 'voice') return settings.voice;
  if (settings.mode === 'format') return settings.targetFormat;
  if (settings.mode === 'stems') return settings.stem;
  if (settings.mode === 'accompaniment') return settings.accompaniment;
  return settings.style;
};

function App() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [audio, setAudio] = useState<AudioFileInfo | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [processing, setProcessing] = useState({ progress: 0, step: '等待上传' });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState('');

  const activeMode = modeCopy[settings.mode];
  const isProcessing = status === 'processing';

  const heroStats = useMemo(
    () => [
      ['2', '真实 FFmpeg 功能'],
      ['20MB', '上传上限'],
      ['5min', '音频时长上限'],
    ],
    [],
  );

  const handleUpload = (nextAudio: AudioFileInfo) => {
    if (audio?.url) URL.revokeObjectURL(audio.url);
    setAudio(nextAudio);
    setStatus('uploaded');
    setError('');
    setResult(null);
    setProcessing({ progress: 0, step: '等待生成' });
  };

  const handleModeChange = (mode: RemixMode) => {
    setSettings((current) => ({ ...current, mode }));
    setStatus(audio ? 'configuring' : 'idle');
  };

  const updateActiveOption = (value: string) => {
    setSettings((current) => {
      if (current.mode === 'voice') return { ...current, voice: value };
      if (current.mode === 'format') return { ...current, targetFormat: value as GenerationSettings['targetFormat'] };
      if (current.mode === 'stems') return { ...current, stem: value };
      if (current.mode === 'accompaniment') return { ...current, accompaniment: value };
      return { ...current, style: value };
    });
    if (audio) setStatus('configuring');
  };

  const startGeneration = async () => {
    if (!audio || isProcessing) return;
    setStatus('processing');
    setError('');
    setProcessing({ progress: 0, step: '分析音频' });

    try {
      let nextResult: GenerationResult;

      if (settings.mode === 'tempo' && canUseRealTempo(settings.tempo)) {
        setProcessing({ progress: 18, step: '上传到后端' });
        setProcessing({ progress: 45, step: 'FFmpeg 调整节奏' });
        nextResult = await changeTempo({ audio, settings });
        setProcessing({ progress: 100, step: '完成' });
      } else if (settings.mode === 'format') {
        setProcessing({ progress: 18, step: '上传到后端' });
        setProcessing({ progress: 45, step: 'FFmpeg 转换格式' });
        nextResult = await convertFormat({ audio, settings });
        setProcessing({ progress: 100, step: '完成' });
      } else {
        nextResult = await runMockGeneration({ audio, settings }, setProcessing);
      }

      setResult(nextResult);
      setHistory((items) => [nextResult, ...items].slice(0, 8));
      setStatus('completed');
    } catch (caughtError) {
      setStatus('error');
      setProcessing({ progress: 0, step: '处理失败' });
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试。');
    }
  };

  const selectHistory = (item: GenerationResult) => {
    setResult(item);
    setSettings(item.settings);
    setStatus('completed');
  };

  return (
    <main className="app-shell text-white antialiased">
      <div className="background-grid" />
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={16} />
            AI Remix Studio MVP
          </span>
          <h1>把一首歌变成新的创作版本。</h1>
          <p>
            上传音频，选择节奏变速或格式转换即可调用真实 FFmpeg 处理；其他 AI 改编能力先保留 mock preview。
          </p>
          <div className="hero-stats">
            {heroStats.map(([value, label]) => (
              <span key={label}>
                <strong>{value}</strong>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-console" aria-hidden="true">
          <div className="console-top">
            <span />
            <span />
            <span />
          </div>
          <div className="console-wave">
            {Array.from({ length: 36 }).map((_, index) => (
              <i key={index} style={{ height: `${18 + ((index * 23) % 72)}%` }} />
            ))}
          </div>
          <div className="console-chips">
            <span>
              <Cpu size={14} />
              FFmpeg tempo
            </span>
            <span>
              <Headphones size={14} />
              FFmpeg format
            </span>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="left-stack">
          <UploadArea
            audio={audio}
            disabled={isProcessing}
            error={error}
            onError={(message) => {
              setStatus('error');
              setError(message);
            }}
            onUpload={handleUpload}
          />
          <AudioPreview audio={audio} />
          <HistoryList activeId={result?.id ?? null} history={history} onSelect={selectHistory} />
        </div>

        <div className="right-stack">
          <ModeSelector disabled={isProcessing} onChange={handleModeChange} value={settings.mode} />

          {settings.mode === 'tempo' ? (
            <TempoSelector
              customBpm={settings.customBpm}
              disabled={isProcessing}
              onBpmChange={(customBpm) => setSettings((current) => ({ ...current, customBpm }))}
              onTempoChange={(tempo) => {
                setSettings((current) => ({ ...current, tempo }));
                if (audio) setStatus('configuring');
              }}
              value={settings.tempo}
            />
          ) : (
            <OptionSelector
              disabled={isProcessing}
              onChange={updateActiveOption}
              options={activeMode.options}
              subtitle={activeMode.subtitle}
              title={activeMode.title}
              value={getModeValue(settings)}
            />
          )}

          <GeneratePanel
            audio={audio}
            onGenerate={startGeneration}
            processing={processing}
            settings={settings}
            status={status}
          />
          <ResultPlayer result={result} onRegenerate={startGeneration} />
        </div>
      </section>

      <CopyrightNotice />
    </main>
  );
}

export default App;
