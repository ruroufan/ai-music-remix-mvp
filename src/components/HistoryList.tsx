import { Clock3 } from './icons';
import type { GenerationResult } from '../types';
import { formatTime } from '../lib/format';

type HistoryListProps = {
  history: GenerationResult[];
  activeId: string | null;
  onSelect: (result: GenerationResult) => void;
};

export function HistoryList({ history, activeId, onSelect }: HistoryListProps) {
  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <span className="eyebrow">Session</span>
        <h2>历史记录</h2>
      </div>

      {history.length === 0 ? (
        <div className="empty-state compact">本次页面会话内的生成结果会显示在这里。</div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button
              className={`history-item ${activeId === item.id ? 'is-active' : ''}`}
              key={item.id}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span>
                <strong>{item.name}</strong>
                <small>{item.settings.style} / {item.settings.voice} / {item.settings.tempo}</small>
              </span>
              <em>
                <Clock3 size={14} />
                {formatTime(item.createdAt)}
              </em>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
