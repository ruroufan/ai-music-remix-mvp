import { UploadCloud, Music2, AlertCircle } from './icons';
import type { AudioFileInfo } from '../types';

const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a'];
const acceptedExtensions = ['mp3', 'wav', 'm4a'];

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

const isSupportedFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return acceptedExtensions.includes(extension) || acceptedTypes.includes(file.type);
};

export function UploadArea({ audio, disabled, error, onUpload, onError }: UploadAreaProps) {
  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;
    if (!isSupportedFile(file)) {
      onError('请上传 mp3、wav 或 m4a 格式的音频文件。');
      return;
    }

    const url = URL.createObjectURL(file);
    const duration = await readDuration(url);

    onUpload({
      file,
      name: file.name,
      size: file.size,
      duration,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'Audio',
      url,
    });
  };

  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 01</span>
        <h2>上传歌曲</h2>
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
        <span className="upload-copy">支持 mp3、wav、m4a。第一版会使用本地文件做 mock 试听结果。</span>
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
