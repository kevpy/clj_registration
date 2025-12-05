import React from 'react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  helperText,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`select-field ${error ? 'border-red-500' : ''} ${className}`}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default SelectField;