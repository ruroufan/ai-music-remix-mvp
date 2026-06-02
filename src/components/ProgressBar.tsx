import type { ProcessingSnapshot } from '../types';

type ProgressBarProps = {
  snapshot: ProcessingSnapshot;
};

export function ProgressBar({ snapshot }: ProgressBarProps) {
  return (
    <div className="progress-block">
      <div className="progress-copy">
        <span>{snapshot.step}</span>
        <strong>{snapshot.progress}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${snapshot.progress}%` }} />
      </div>
    </div>
  );
}
