import React, { useRef, useState } from 'react';
import { CheckCircle, FileUp, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '../../lib/http/apiClient';

export interface UploadedFileResult {
  publicId: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  resourceType: string;
}

interface FileUploaderProps {
  onUploadSuccess: (result: UploadedFileResult) => void;
  onUploadError?: (err: unknown) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const DEFAULT_ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';
const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']);
const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  label = 'Upload evidence',
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 10,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedMimeTypes.has(file.type) || !allowedExtensions.includes(extension)) {
      return 'Only PDF, PNG, JPG, and JPEG files are supported.';
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File must be ${maxSizeMB} MB or smaller.`;
    }

    return '';
  };

  const uploadSelectedFile = async (file: File) => {
    const validationError = validateFile(file);
    setFileName(file.name);

    if (validationError) {
      setError(validationError);
      setState('error');
      onUploadError?.(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setState('uploading');
      setProgress(0);
      setError('');

      const res = await apiClient.post('/upload/evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });

      setProgress(100);
      setState('success');
      onUploadSuccess(res.data.data);
    } catch (err: any) {
      const message = err?.message || 'Upload failed. Try again.';
      setError(message);
      setState('error');
      onUploadError?.(err);
    }
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void uploadSelectedFile(file);
  };

  const resetUploader = () => {
    setState('idle');
    setProgress(0);
    setFileName('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={clsx(
          'w-full rounded-lg border-2 border-dashed p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400',
          state === 'success' && 'border-green-400 bg-green-50',
          state === 'error' && 'border-red-300 bg-red-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div className="flex items-center gap-3">
          {state === 'uploading' ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : state === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : state === 'error' ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <FileUp className="h-5 w-5 text-gray-500" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {fileName || 'Drop a file here or click to browse'}
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG, JPEG up to {maxSizeMB} MB</p>
          </div>
        </div>

        {state === 'uploading' && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {state === 'success' && (
          <p className="mt-3 text-sm text-green-700">Uploaded {fileName}</p>
        )}

        {state === 'error' && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
              <RotateCcw className="h-3 w-3" /> Retry
            </span>
          </div>
        )}
      </button>
      {fileName && state !== 'uploading' && (
        <button type="button" onClick={resetUploader} className="text-xs font-medium text-gray-500 hover:text-gray-700">
          Clear {state === 'success' ? 'upload' : 'selection'}
        </button>
      )}
    </div>
  );
};

export { formatFileSize };
