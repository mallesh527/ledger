import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-bold rounded-xl
      transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-[#060907]
      disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer tracking-tight
    `;

    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 border border-emerald-500 dark:border-emerald-400 shadow-md shadow-emerald-600/20 dark:shadow-emerald-500/20',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-[#0e1611] dark:text-neutral-100 dark:hover:bg-[#15231c] border border-neutral-200 dark:border-[#1d3326]',
      outline: 'bg-transparent text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 dark:hover:border-emerald-500',
      success: 'bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 border border-emerald-500',
      danger: 'bg-neutral-800 text-rose-400 hover:bg-neutral-900 border border-neutral-700 hover:border-rose-800',
      ghost: 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1 rounded-lg',
      sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/70 dark:text-emerald-400/70">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full ${icon ? 'pl-10' : 'px-3.5'} py-2.5 border rounded-xl bg-white dark:bg-[#0c140f]
              text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400
              transition-all duration-150
              ${error ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500' : 'border-neutral-200 dark:border-[#1d3326] hover:border-emerald-300 dark:hover:border-emerald-700/60'}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3.5 py-2.5 border rounded-xl bg-white dark:bg-[#0c140f]
            text-neutral-900 dark:text-neutral-100 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400
            transition-all duration-150 cursor-pointer
            ${error ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500' : 'border-neutral-200 dark:border-[#1d3326] hover:border-emerald-300 dark:hover:border-emerald-700/60'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0c140f] text-neutral-900 dark:text-neutral-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';