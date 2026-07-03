/**
 * Input.jsx
 * ----------------------------------------------------------------------
 * Three small form-field atoms sharing one visual language: Input,
 * Textarea, Select. Used by both the public ContactForm and every admin
 * CRUD form, so a label/error style only needs to change once.
 * ----------------------------------------------------------------------
 */
const FIELD_BASE =
  'w-full rounded-sm border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-faint focus:border-brand focus:ring-1 focus:ring-brand ' +
  'transition-colors duration-200 ease-smooth disabled:bg-surface-subtle disabled:cursor-not-allowed';

function FieldWrapper({ label, htmlFor, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Input({ label, id, error, required, className = '', ...rest }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} required={required}>
      <input
        id={id}
        required={required}
        className={`${FIELD_BASE} ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Textarea({ label, id, error, required, rows = 5, className = '', ...rest }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={`${FIELD_BASE} resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Select({ label, id, error, required, options = [], className = '', ...rest }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} required={required}>
      <select
        id={id}
        required={required}
        className={`${FIELD_BASE} ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

/** File-upload field used by admin forms — styled to match the rest of the design system. */
export function FileInput({ label, id, error, required, onChange, accept = 'image/*', ...rest }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} required={required}>
      <input
        id={id}
        type="file"
        accept={accept}
        required={required}
        onChange={onChange}
        className="block w-full text-sm text-ink-soft
          file:mr-4 file:rounded-sm file:border-0 file:bg-brand-light
          file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-dark
          hover:file:bg-sage-light cursor-pointer"
        {...rest}
      />
    </FieldWrapper>
  );
}
