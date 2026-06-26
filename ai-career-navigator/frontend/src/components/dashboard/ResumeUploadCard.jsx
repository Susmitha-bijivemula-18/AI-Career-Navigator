import React, { useState, useRef } from 'react';
import { IconUpload, IconCheck, IconLoader2 } from '@tabler/icons-react';

export default function ResumeUploadCard({ onUpload, isLoading, file, setFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm transition-all">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Upload Resume</h3>
      
      <div 
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".pdf" 
          onChange={handleChange}
          className="hidden" 
        />
        
        {file ? (
          <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
            <IconCheck className="w-12 h-12 mb-3" stroke={2} />
            <p className="font-semibold text-slate-900 dark:text-white text-center break-all">{file.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Click or drag to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
            <IconUpload className="w-12 h-12 mb-3 opacity-80" stroke={1.5} />
            <p className="font-medium text-slate-700 dark:text-slate-300">Drag & drop your PDF</p>
            <p className="text-sm mt-1">or click to browse files</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onUpload}
        disabled={!file || isLoading}
        className={`w-full mt-6 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-all ${
          !file || isLoading 
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
        }`}
      >
        {isLoading ? (
          <>
            <IconLoader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Resume'
        )}
      </button>
    </div>
  );
}
