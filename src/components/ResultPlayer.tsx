import { Download, RotateCcw, Wand2 } from './icons';
import type { GenerationResult } from '../types';

type ResultPlayerProps = {
  result: GenerationResult | null;
  onRegenerate: () => void;
};

export function ResultPlayer({ result, onRegenerate }: ResultPlayerProps) {
  if (!result) {
    return (
      <section className="panel result-panel">
        <div className="empty-state">生成完成后会在这里显示结果、播放器和下载按钮。</div>
      </section>
    );
  }

  const isReal = result.resultType === 'real';

  return (
    <section className="panel result-panel is-ready">
      <div className="result-header">
        <span className="result-icon">
          <Wand2 size={24} />
        </span>
        <div>
          <span className="eyebrow">Result</span>
          <h2>{result.name}</h2>
        </div>
      </div>

      <div className="result-status-row">
        <span className={`result-status ${isReal ? 'is-real' : 'is-mock'}`}>
          {isReal ? 'Real processed by FFmpeg' : 'Mock preview'}
        </span>
      </div>

      <div className="result-tags">
        <span>{result.settings.style}</span>
        <span>{result.settings.voice}</span>
        <span>{result.settings.tempo}</span>
      </div>

      <audio className="audio-control" controls src={result.audioUrl} />

      <div className="result-actions">
        <a className="download-button" download={`${result.name}.mp3`} href={result.audioUrl}>
          <Download size={18} />
          {isReal ? '下载处理后音频' : '下载模拟预览'}
        </a>
        <button className="ghost-button" onClick={onRegenerate} type="button">
          <RotateCcw size={18} />
          重新生成
        </button>
      </div>
    </section>
  );
}
