'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
    label?: string;
    error?: string;
    startDate: Date | null;
    endDate: Date | null;
    onStartChange: (date: Date | null) => void;
    onEndChange: (date: Date | null) => void;
    minDate?: Date;
    excludeDateIntervals?: { start: Date; end: Date }[];
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    label,
    error,
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    minDate = new Date(),
    excludeDateIntervals,
}) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Check-in */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <DatePicker
                        selected={startDate}
                        onChange={onStartChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={minDate}
                        excludeDateIntervals={excludeDateIntervals}
                        placeholderText="Check-in"
                        dateFormat="MMM dd, yyyy"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm
              pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              hover:border-slate-600"
                    />
                </div>

                {/* Check-out */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <DatePicker
                        selected={endDate}
                        onChange={onEndChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || minDate}
                        excludeDateIntervals={excludeDateIntervals}
                        placeholderText="Check-out"
                        dateFormat="MMM dd, yyyy"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm
              pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              hover:border-slate-600"
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};

export default DateRangePicker;
