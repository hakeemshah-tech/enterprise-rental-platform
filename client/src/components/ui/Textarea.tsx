'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-slate-300"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`
            w-full rounded-xl border bg-slate-800/50 backdrop-blur-sm
            px-4 py-2.5 text-sm text-white placeholder-slate-500
            transition-all duration-300 resize-y min-h-[100px]
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
                />
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                {helperText && !error && (
                    <p className="text-xs text-slate-500 mt-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
