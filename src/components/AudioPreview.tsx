import { FileAudio, Timer, HardDrive, AudioWaveform } from './icons';
import type { AudioFileInfo } from '../types';
import { formatBytes, formatDuration } from '../lib/format';

type AudioPreviewProps = {
  audio: AudioFileInfo | null;
};

export function AudioPreview({ audio }: AudioPreviewProps) {
  return (
    <section className="panel audio-preview">
      <div className="panel-heading">
        <span className="eyebrow">Track</span>
        <h2>音频信息</h2>
      </div>

      {audio ? (
        <>
          <div className="track-title-row">
            <span className="track-art">
              <AudioWaveform size={26} />
            </span>
            <div>
              <h3>{audio.name}</h3>
              <p>{audio.type || 'Audio file'}</p>
            </div>
          </div>

          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 42 }).map((_, index) => (
              <span key={index} style={{ height: `${20 + ((index * 17) % 58)}%` }} />
            ))}
          </div>

          <div className="meta-grid">
            <span>
              <Timer size={16} />
              {formatDuration(audio.duration)}
            </span>
            <span>
              <HardDrive size={16} />
              {formatBytes(audio.size)}
            </span>
            <span>
              <FileAudio size={16} />
              本地预览
            </span>
          </div>

          <audio className="audio-control" controls src={audio.url} />
        </>
      ) : (
        <div className="empty-state">上传后会显示文件名、时长、大小和波形预览。</div>
      )}
    </section>
  );
}
