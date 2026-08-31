import type { ChangeEventHandler } from "react";

type SearchInputProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  ariaLabel?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  ariaLabel = "Search",
}: SearchInputProps) {
  return (
    <label className="flex min-w-0 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm sm:w-80">
      <span className="text-slate-400" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        aria-label={ariaLabel}
      />
    </label>
  );
}
