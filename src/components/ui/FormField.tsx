import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  description,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-400 mt-1">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {description && !error && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
};

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  onValidate?: (value: string) => Promise<string | null>;
  description?: string;
  fieldKey?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  onValidate,
  description,
  fieldKey,
  required,
  className = '',
  onBlur,
  onChange,
  ...props
}) => {
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);
  const [isValidating, setIsValidating] = React.useState(false);

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (onValidate && fieldKey) {
      setIsValidating(true);
      try {
        const validationError = await onValidate(e.target.value);
        setLocalError(validationError || undefined);
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear local error on change
    if (localError) {
      setLocalError(undefined);
    }
    onChange?.(e);
  };

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  return (
    <FormField
      label={label}
      error={displayError}
      required={required}
      description={description}
      className={className}
    >
      <div className="relative">
        <input
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 transition-all duration-200
            ${hasError 
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-red-500/20' 
              : 'border-zinc-700 bg-zinc-800 focus:border-amber-500 focus:ring-amber-500/20'
            }
            ${isValidating ? 'opacity-70' : ''}
          `}
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </FormField>
  );
};

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  onValidate?: (value: string) => Promise<string | null>;
  description?: string;
  fieldKey?: string;
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  error,
  onValidate,
  description,
  fieldKey,
  required,
  className = '',
  onBlur,
  onChange,
  ...props
}) => {
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);
  const [isValidating, setIsValidating] = React.useState(false);

  const handleBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onValidate && fieldKey) {
      setIsValidating(true);
      try {
        const validationError = await onValidate(e.target.value);
        setLocalError(validationError || undefined);
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Clear local error on change
    if (localError) {
      setLocalError(undefined);
    }
    onChange?.(e);
  };

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  return (
    <FormField
      label={label}
      error={displayError}
      required={required}
      description={description}
      className={className}
    >
      <div className="relative">
        <textarea
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 transition-all duration-200 resize-vertical
            ${hasError 
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-red-500/20' 
              : 'border-zinc-700 bg-zinc-800 focus:border-amber-500 focus:ring-amber-500/20'
            }
            ${isValidating ? 'opacity-70' : ''}
          `}
        />
        {isValidating && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </FormField>
  );
};

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  onValidate?: (value: string) => Promise<string | null>;
  description?: string;
  fieldKey?: string;
  options: Array<{ value: string; label: string }>;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  error,
  onValidate,
  description,
  fieldKey,
  required,
  className = '',
  onBlur,
  onChange,
  options,
  ...props
}) => {
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);
  const [isValidating, setIsValidating] = React.useState(false);

  const handleBlur = async (e: React.FocusEvent<HTMLSelectElement>) => {
    if (onValidate && fieldKey) {
      setIsValidating(true);
      try {
        const validationError = await onValidate(e.target.value);
        setLocalError(validationError || undefined);
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Clear local error on change
    if (localError) {
      setLocalError(undefined);
    }
    onChange?.(e);
  };

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  return (
    <FormField
      label={label}
      error={displayError}
      required={required}
      description={description}
      className={className}
    >
      <div className="relative">
        <select
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 text-white 
            focus:outline-none focus:ring-2 transition-all duration-200
            ${hasError 
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-red-500/20' 
              : 'border-zinc-700 bg-zinc-800 focus:border-amber-500 focus:ring-amber-500/20'
            }
            ${isValidating ? 'opacity-70' : ''}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-800">
              {option.label}
            </option>
          ))}
        </select>
        {isValidating && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </FormField>
  );
};

export default FormField; 