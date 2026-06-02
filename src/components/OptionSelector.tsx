type OptionSelectorProps = {
  title: string;
  subtitle: string;
  options: string[];
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function OptionSelector({ title, subtitle, options, value, disabled, onChange }: OptionSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Step 03</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="option-grid">
        {options.map((option) => (
          <button
            className={`option-chip ${value === option ? 'is-active' : ''}`}
            disabled={disabled}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
