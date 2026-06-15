import React, { type ReactNode } from 'react';

// A lightweight wrapper. React Hook Form is usually wired via standard props 
// inside the actual Form components. This is just a convenience wrapper if needed.

export interface FormFieldProps {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
