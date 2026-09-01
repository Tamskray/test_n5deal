type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
};

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required,
  placeholder,
  min,
  max,
}: FormFieldProps) {
  return (
    <label className="text-sm font-medium text-slate-700">
      <div className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-600">*</span>}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none transition-colors ${
          error
            ? "border-rose-500 bg-rose-50 focus:border-rose-600 focus:ring-1 focus:ring-rose-200"
            : "border-slate-300 focus:border-blue-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}

type FormSelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
};

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
}: FormSelectProps) {
  return (
    <label className="text-sm font-medium text-slate-700">
      <div className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-600">*</span>}
      </div>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-normal outline-none transition-colors ${
          error
            ? "border-rose-500 bg-rose-50 focus:border-rose-600 focus:ring-1 focus:ring-rose-200"
            : "border-slate-300 focus:border-blue-500"
        }`}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}

type FormTextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
};

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  rows = 3,
}: FormTextareaProps) {
  return (
    <label className="text-sm font-medium text-slate-700">
      <div className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-600">*</span>}
      </div>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none transition-colors ${
          error
            ? "border-rose-500 bg-rose-50 focus:border-rose-600 focus:ring-1 focus:ring-rose-200"
            : "border-slate-300 focus:border-blue-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
