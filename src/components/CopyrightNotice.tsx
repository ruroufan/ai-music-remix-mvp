import { ShieldCheck } from './icons';

export function CopyrightNotice() {
  return (
    <footer className="copyright">
      <ShieldCheck size={20} />
      <p>
        请仅上传自己拥有版权或已获得授权的音频。不要上传他人未授权歌曲。人声转换功能不得用于冒充真实人物或侵犯他人声音权益。
      </p>
    </footer>
  );
}
