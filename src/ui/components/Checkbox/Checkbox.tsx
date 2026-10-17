import { useId, type Ref } from 'react';
import styles from './Checkbox.module.css';
type CheckboxProps = {
  label: string;
  name?: string;
  visualLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};
export function Checkbox({
  label,
  name,
  visualLabel,
  checked,
  onChange,
  error,
  onBlur,
  ref,
}: CheckboxProps) {
  const id = useId();
  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        name={name}
        ref={ref}
        type="checkbox"
        className={styles.box}
        checked={checked}
        aria-label={visualLabel ? label : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id} className={styles.label}>
        {visualLabel ?? label}
      </label>
      {error && (
        <span role="alert" id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
