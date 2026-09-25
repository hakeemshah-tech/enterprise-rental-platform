'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={`
              w-full rounded-xl border bg-slate-800/50 backdrop-blur-sm
              px-4 py-2.5 text-sm text-white appearance-none
              transition-all duration-300 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                  error
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-slate-700 hover:border-slate-600'
              }
              ${className}
            `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" className="bg-slate-800 text-slate-400">
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                className="bg-slate-800 text-white"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
