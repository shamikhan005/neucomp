import { useState } from 'react';

interface QualitySelectorProps {
  quality: number;
  onChange: (quality: number) => void;
  disabled: boolean;
}

export default function QualitySelector({ quality, onChange, disabled }: QualitySelectorProps) {
  const qualityOptions = [
    { value: 1, label: '1 - Highest Compression' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4 - Balanced' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8 - Highest Quality' },
  ];

  return (
    <div className="w-full">
      <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
        Compression Quality
      </label>
      <div className="flex flex-col space-y-4">
        <select
          id="quality"
          value={quality}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-primary-500 focus:ring-primary-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {qualityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="w-full">
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={quality}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Higher Compression</span>
            <span>Higher Quality</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">Quality Level Guidance:</p>
          <ul className="space-y-1">
            <li><strong>1-2:</strong> Highest compression, suitable for thumbnails or previews</li>
            <li><strong>3-5:</strong> Good balance between quality and file size</li>
            <li><strong>6-8:</strong> Higher quality, larger file size</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
