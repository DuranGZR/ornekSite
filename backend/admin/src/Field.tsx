export function Field({
  label,
  value,
  onChange,
  type = "text",
  large = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  large?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {large ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
