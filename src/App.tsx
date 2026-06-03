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
import { TrimSelector } from './components/TrimSelector';
import { UploadArea } from './components/UploadArea';
import { FadeSelector, NormalizeSelector, VolumeSelector } from './components/EnhancementSelectors';
import { processAudio } from './lib/api';
import type { AppStatus, AudioFileInfo, EnabledFeatures, GenerationResult, GenerationSettings, TargetFormat } from './types';

const formatOptions: TargetFormat[] = ['mp3', 'wav', 'm4a'];

const defaultSettings: GenerationSettings = {
  mode: 'pipeline',
  enabledFeatures: {
    trim: false,
    tempo: false,
    volume: false,
    fade: false,
    normalize: false,
    format: false,
  },
  trimStartTime: 0,
  trimEndTime: 30,
  volumeGain: '0dB',
  fadeInDuration: 0,
  fadeOutDuration: 0,
  style: 'City Pop',
  voice: '清透女声',
  tempo: '1.0',
  customBpm: 120,
  targetFormat: 'mp3',
  stem: '提取伴奏',
  accompaniment: '保留原旋律',
};

const hasSelectedRealFeature = (features: EnabledFeatures) =>
  features.trim || features.tempo || features.volume || features.fade || features.normalize || features.format;

function App() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [audio, setAudio] = useState<AudioFileInfo | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [processing, setProcessing] = useState({ progress: 0, step: '等待上传' });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState('');

  const isProcessing = status === 'processing';

  const heroStats = useMemo(
    () => [
      ['2', '可组合真实功能'],
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
    setSettings((current) => ({
      ...current,
      trimStartTime: 0,
      trimEndTime: Math.min(30, Math.max(1, Math.floor(nextAudio.duration || 30))),
    }));
  };

  const toggleFeature = (feature: keyof EnabledFeatures) => {
    setSettings((current) => ({
      ...current,
      enabledFeatures: {
        ...current.enabledFeatures,
        [feature]: !current.enabledFeatures[feature],
      },
    }));
    setStatus(audio ? 'configuring' : 'idle');
  };

  const startGeneration = async () => {
    if (!audio || isProcessing || !hasSelectedRealFeature(settings.enabledFeatures)) return;
    if (settings.enabledFeatures.trim) {
      if (settings.trimStartTime < 0) {
        setStatus('error');
        setError('裁剪开始时间必须大于或等于 0。');
        return;
      }

      if (settings.trimEndTime <= settings.trimStartTime) {
        setStatus('error');
        setError('裁剪结束时间必须大于开始时间。');
        return;
      }

      if (settings.trimEndTime > audio.duration) {
        setStatus('error');
        setError('裁剪结束时间不能超过音频总时长。');
        return;
      }
    }

    setStatus('processing');
    setError('');
    setProcessing({ progress: 0, step: '分析音频' });

    try {
      setProcessing({ progress: 18, step: '上传到后端' });
      setProcessing({ progress: 42, step: 'FFmpeg 组合处理' });
      const nextResult = await processAudio({ audio, settings });
      setProcessing({ progress: 100, step: '完成' });
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
            一次选择多个真实处理功能，后端按顺序执行 FFmpeg pipeline。当前支持节奏变速和格式转换。
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
          <ModeSelector disabled={isProcessing} enabledFeatures={settings.enabledFeatures} onToggleFeature={toggleFeature} />

          {settings.enabledFeatures.trim && (
            <TrimSelector
              audio={audio}
              disabled={isProcessing}
              endTime={settings.trimEndTime}
              onChange={({ startTime, endTime }) => {
                setSettings((current) => ({ ...current, trimStartTime: startTime, trimEndTime: endTime }));
                if (audio) setStatus('configuring');
              }}
              startTime={settings.trimStartTime}
            />
          )}

          {settings.enabledFeatures.tempo && (
            <TempoSelector
              disabled={isProcessing}
              onTempoChange={(tempo) => {
                setSettings((current) => ({ ...current, tempo }));
                if (audio) setStatus('configuring');
              }}
              value={settings.tempo}
            />
          )}

          {settings.enabledFeatures.volume && (
            <VolumeSelector
              disabled={isProcessing}
              onChange={(volumeGain) => {
                setSettings((current) => ({ ...current, volumeGain }));
                if (audio) setStatus('configuring');
              }}
              value={settings.volumeGain}
            />
          )}

          {settings.enabledFeatures.fade && (
            <FadeSelector
              disabled={isProcessing}
              fadeInDuration={settings.fadeInDuration}
              fadeOutDuration={settings.fadeOutDuration}
              onChange={(values) => {
                setSettings((current) => ({ ...current, ...values }));
                if (audio) setStatus('configuring');
              }}
            />
          )}

          {settings.enabledFeatures.normalize && <NormalizeSelector />}

          {settings.enabledFeatures.format && (
            <OptionSelector
              disabled={isProcessing}
              onChange={(value) => {
                setSettings((current) => ({ ...current, targetFormat: value as TargetFormat }));
                if (audio) setStatus('configuring');
              }}
              options={formatOptions}
              subtitle="选择最终输出音频格式。"
              title="格式转换"
              value={settings.targetFormat}
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
