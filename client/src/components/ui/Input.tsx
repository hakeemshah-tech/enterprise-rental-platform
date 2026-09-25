'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, helperText, className = '', id, type, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
        const isPassword = type === 'password';
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        className={`
              w-full rounded-xl border bg-slate-800/50 backdrop-blur-sm
              px-4 py-2.5 text-sm text-white placeholder-slate-500
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${
                  error
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-slate-700 hover:border-slate-600'
              }
              ${className}
            `}
                        {...props}
                    />
                    {/* Password visibility toggle */}
                    {isPassword && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400
                hover:text-slate-200 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                {helperText && !error && (
                    <p className="text-xs text-slate-500 mt-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
