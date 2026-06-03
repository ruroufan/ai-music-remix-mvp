import { UploadCloud, Music2, AlertCircle } from './icons';
import type { AudioFileInfo } from '../types';
import {
  AUDIO_LIMIT_COPY,
  MAX_AUDIO_DURATION_SECONDS,
  MAX_AUDIO_SIZE_BYTES,
  SUPPORTED_AUDIO_EXTENSIONS,
} from '../lib/limits';

const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a'];

type UploadAreaProps = {
  audio: AudioFileInfo | null;
  disabled: boolean;
  error: string;
  onUpload: (audio: AudioFileInfo) => void;
  onError: (message: string) => void;
};

const readDuration = (url: string) =>
  new Promise<number>((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => resolve(0);
    audio.src = url;
  });

const getExtension = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? '';

const isSupportedFile = (file: File) => {
  const extension = getExtension(file);
  return SUPPORTED_AUDIO_EXTENSIONS.includes(extension) && (!file.type || acceptedTypes.includes(file.type));
};

export function UploadArea({ audio, disabled, error, onUpload, onError }: UploadAreaProps) {
  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;

    if (!isSupportedFile(file)) {
      onError('格式不支持。请上传 mp3、wav 或 m4a 音频文件。');
      return;
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      onError('文件太大。第一版最大支持 20MB 音频。');
      return;
    }

    const url = URL.createObjectURL(file);
    const duration = await readDuration(url);

    if (duration > MAX_AUDIO_DURATION_SECONDS) {
      URL.revokeObjectURL(url);
      onError('音频太长。第一版最大支持 5 分钟。');
      return;
    }

    onUpload({
      file,
      name: file.name,
      size: file.size,
      duration,
      type: file.type || getExtension(file).toUpperCase() || 'Audio',
      url,
    });
  };

  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 01</span>
        <h2>上传歌曲</h2>
        <p>{AUDIO_LIMIT_COPY}</p>
      </div>

      <label
        className={`upload-drop ${disabled ? 'is-disabled' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
          disabled={disabled}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <span className="upload-icon">
          {audio ? <Music2 size={28} /> : <UploadCloud size={30} />}
        </span>
        <span className="upload-title">{audio ? '已载入音频' : '拖入音频或点击上传'}</span>
        <span className="upload-copy">
          {audio ? '选择节奏调整 0.8x / 1.2x / 1.5x 可进行真实 FFmpeg 变速。' : AUDIO_LIMIT_COPY}
        </span>
      </label>

      {error && (
        <p className="error-text">
          <AlertCircle size={16} />
          {error}
        </p>
      )}
    </section>
  );
}
