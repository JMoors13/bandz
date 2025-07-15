// FileInput.tsx
'use client';

import { useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

interface FileInputProps {
  id: string;
  label: string;
  accept?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: React.FC<FileInputProps> = ({
  id,
  label,
  accept,
  disabled,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || null);
    onChange?.(e); // Pass back to react-hook-form
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-md text-neutral-300">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <span
          className={twMerge(
            'text-md w-lg bg-neutral-700 px-3 py-3 rounded-md',
            fileName ? 'text-white' : 'text-neutral-500',
          )}
        >
          {fileName || 'No file selected'}
        </span>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="px-3 py-3.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiUpload className="text-xl cursor-pointer" />
        </button>
      </div>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileInput;
