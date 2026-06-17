// src/components/ResumeUpload.jsx - PDF file input + upload trigger
import React, { useState, useRef } from 'react';
import { uploadResume } from '../api/client';
import { aiClient } from '../api/aiClient';

export default function ResumeUpload({ onUploadComplete, onJobsReset }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusText, setStatusText] = useState('');
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
      setStatusText('Extracting text from PDF...');
      const data = await uploadResume(file);
      const skills = data.extracted_skills;
      const text = data.resume_text;
      setExtractedSkills(skills);

      if (!text || text.trim() === '') {
        setError("Could not extract text from the PDF.");
        onJobsReset();
        setLoading(false);
        return;
      }

      setStatusText('Running AI Resume Analysis...');
      const analysis = await aiClient.analyzeResume(text);

      setStatusText('Generating Personalized Recommendations...');
      const recommendations = await aiClient.getRecommendations(analysis.resume_id);

      setStatusText('Generating Career Suggestions...');
      const suggestions = await aiClient.getSuggestions(
        analysis.skills,
        analysis.experience_level,
        analysis.predicted_roles
      );

      onUploadComplete({
        analysis,
        recommendations,
        suggestions
      });

    } catch (err) {
      setError(err.response?.data?.detail || err.message || "An error occurred during processing.");
      onJobsReset();
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="glass-card glass-card-hover p-8 md:p-12 rounded-[2rem] max-w-3xl mx-auto mb-12 relative overflow-hidden group border-white/10 relative z-10 transition-all duration-500 hover:-translate-y-1">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Upload Your Resume</h2>
          <p className="text-slate-400 mt-3 text-sm font-light tracking-wide">PDF format only. We'll extract your skills automatically using our AI engine.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          <div 
            className={`relative flex flex-col items-center justify-center px-6 pt-12 pb-14 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${dragActive ? 'border-cyan-400 bg-cyan-900/20 scale-[1.02] shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'border-slate-700 hover:border-purple-400/50 hover:bg-white/5 hover:shadow-lg'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="space-y-4 text-center relative z-10">
              <div className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full transition-colors duration-300 ${dragActive || file ? 'bg-cyan-500/20 text-cyan-400 box-glow' : 'bg-slate-800 text-slate-400'}`}>
                <svg className="h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex text-sm text-slate-300 justify-center font-medium mt-4">
                <span className="relative rounded-md text-cyan-400 hover:text-cyan-300 hover:underline transition-all">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} ref={inputRef} />
                </span>
                <p className="pl-2">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {file ? <span className="font-bold text-white bg-slate-800 px-4 py-1.5 rounded-full shadow-inner">{file.name}</span> : 'PDF up to 10MB'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button 
              type="submit" 
              disabled={loading || !file}
              className={`w-full sm:w-2/3 py-4 px-8 rounded-xl text-lg font-bold text-white transform transition-all duration-300 relative overflow-hidden group
                ${loading || !file 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 border border-transparent'}`}
            >
              {loading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <span className="flex flex-col items-center justify-center space-y-1">
                    <span className="flex items-center text-sm font-semibold tracking-wide">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {statusText || 'Processing...'}
                    </span>
                  </span>
                ) : 'Analyze & Match Jobs ✨'}
              </div>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 text-red-400 rounded-xl text-sm font-medium border border-red-800/50 flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{error}</p>
          </div>
        )}
        
        {extractedSkills.length > 0 && !loading && (
          <div className="mt-10 pt-8 border-t border-slate-800 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Extracted Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {extractedSkills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-default">
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
