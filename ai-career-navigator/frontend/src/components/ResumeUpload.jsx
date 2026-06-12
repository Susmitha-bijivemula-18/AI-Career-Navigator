// src/components/ResumeUpload.jsx - PDF file input + upload trigger
import React, { useState, useRef } from 'react';
import { uploadResume, fetchJobMatches } from '../api/client';

export default function ResumeUpload({ onMatchesFound, onJobsReset }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadResume(file);
      const skills = data.extracted_skills;
      setExtractedSkills(skills);

      if (skills.length === 0) {
        setError("No recognizable skills found in the resume.");
        onJobsReset();
      } else {
        const matches = await fetchJobMatches(skills);
        onMatchesFound(matches);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during upload.");
      onJobsReset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-[2rem] max-w-3xl mx-auto mb-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Upload Your Resume</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">PDF format only. We'll extract your skills automatically.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div 
            className={`relative flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-inner' : 'border-gray-300 hover:border-indigo-400 hover:bg-white/50 hover:shadow-md'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="space-y-3 text-center relative z-10">
              <svg className={`mx-auto h-14 w-14 transition-colors duration-300 ${dragActive || file ? 'text-indigo-500 drop-shadow-md' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center font-medium">
                <span className="relative rounded-md text-indigo-600 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} ref={inputRef} />
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {file ? <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{file.name}</span> : 'PDF up to 10MB'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <button 
              type="submit" 
              disabled={loading || !file}
              className={`w-full sm:w-2/3 py-3.5 px-6 rounded-xl shadow-lg text-base font-bold text-white transform transition-all duration-300 
                ${loading || !file 
                  ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Resume...
                </span>
              ) : 'Analyze & Match Jobs ✨'}
            </button>
          </div>
        </form>
        
        {extractedSkills.length > 0 && !loading && (
          <div className="mt-8 pt-6 border-t border-gray-200/60">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-4">Extracted Skills</h3>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-100 shadow-sm transition-transform hover:scale-105 hover:bg-indigo-50 cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
