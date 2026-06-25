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
    <div className="glass-card glass-card-hover p-6 md:p-10 rounded-2xl max-w-3xl mx-auto mb-10 relative overflow-hidden z-10 transition-all duration-300">
      <div className="relative z-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-950 tracking-tight">Upload Your Resume</h2>
          <p className="text-slate-600 mt-3 text-sm">PDF format only. We'll extract your skills automatically using our AI engine.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-7">
          <div 
            className={`relative flex flex-col items-center justify-center px-5 pt-10 pb-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${dragActive ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_18px_35px_rgba(15,118,110,0.14)]' : 'border-borderLight bg-bgLight/50 hover:border-primary/40 hover:bg-white hover:shadow-sm'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="space-y-4 text-center relative z-10">
              <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-2xl transition-colors duration-300 ${dragActive || file ? 'bg-primary/10 text-primary shadow-sm' : 'bg-white text-slate-400 border border-borderLight shadow-sm'}`}>
                <svg className="h-9 w-9" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-wrap text-sm text-slate-600 justify-center font-medium mt-4">
                <span className="relative rounded-md text-primary hover:text-primary-light hover:underline transition-all">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} ref={inputRef} />
                </span>
                <p className="pl-2">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500 font-medium break-all">
                {file ? <span className="font-semibold text-textMain bg-white border border-borderLight px-4 py-1.5 rounded-full shadow-sm">{file.name}</span> : 'PDF up to 10MB'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <button 
              type="submit" 
              disabled={loading || !file}
              className={`w-full sm:w-2/3 py-3.5 px-8 rounded-xl text-base font-bold transform transition-all duration-300 relative overflow-hidden group
                ${loading || !file 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-borderLight' 
                  : 'text-white hero-gradient hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border border-transparent'}`}
            >
              {loading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <span className="flex flex-col items-center justify-center space-y-1">
                    <span className="flex items-center text-sm font-semibold tracking-wide">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {statusText || 'Processing...'}
                    </span>
                  </span>
                ) : 'Analyze & Match Jobs'}
              </div>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{error}</p>
          </div>
        )}
        
        {extractedSkills.length > 0 && !loading && (
          <div className="mt-10 pt-8 border-t border-borderLight animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              Extracted Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {extractedSkills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F3EEFF] text-[#723EC3] border border-[#D8B4FE] transition-all hover:bg-[#E9D5FF] cursor-default">
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
