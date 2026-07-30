import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, helperText, className = "", id, ...props }, ref) {
    const inputId = id || React.useId();
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={
            "w-full h-12 px-4 rounded-xl border bg-surface text-text-primary text-sm " +
            "placeholder:text-text-muted/60 transition-colors focus-visible:outline-none " +
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 " +
            "focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none " +
            (error
              ? "border-danger focus-visible:ring-danger"
              : "border-border hover:border-text-muted/40") +
            " " +
            className
          }
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-danger flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, helperText, options, className = "", id, ...props }, ref) {
    const selectId = id || React.useId();
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={
            "w-full h-12 px-4 rounded-xl border bg-surface text-text-primary text-sm " +
            "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
            "focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
            (error
              ? "border-danger focus-visible:ring-danger"
              : "border-border hover:border-text-muted/40") +
            " " +
            className
          }
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs font-medium text-danger flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
