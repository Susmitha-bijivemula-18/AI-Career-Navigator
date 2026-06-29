import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJobById } from '../api/jobsApi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import Toast from '../components/ui/Toast';
import { 
  IconMapPin, 
  IconBriefcase, 
  IconClock, 
  IconCoin, 
  IconArrowLeft,
  IconCheck,
  IconX,
  IconBuilding,
  IconReportAnalytics,
  IconLock,
  IconChecklist
} from '@tabler/icons-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-apply if returning from login with autoApply=true
  useEffect(() => {
    if (user && job && searchParams.get('autoApply') === 'true' && !isApplied && !applying) {
      handleApplyInternal();
    }
  }, [user, job, searchParams]);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const data = await fetchJobById(id);
        // Normalize fields
        setJob({
          ...data,
          company: data.company || data.company_name,
          job_apply_link: data.job_apply_link || data.apply_url || data.apply_link,
          required_skills: data.required_skills || data.skills_required || []
        });

        // Check if already applied or saved
        if (user) {
          const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', data.id)
            .maybeSingle();
          if (existingApp) setIsApplied(true);

          const { data: existingSaved } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', data.id)
            .maybeSingle();
          if (existingSaved) setIsSaved(true);
        }
      } catch (err) {
        setError('Failed to load job details. It might have been removed.');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, user]);

  const handleApplyInternal = async () => {
    if (isApplied || applying || !job) return;
    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: job.id
        });
      
      // If error is duplicate key, it means already applied
      if (error && error.code !== '23505') {
        throw error;
      }
      
      setIsApplied(true);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    handleApplyInternal();
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (saving || !job) return;
    setSaving(true);
    try {
      if (isSaved) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);
        setIsSaved(false);
        setToastMessage("Job removed from saved list.");
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: job.id });
        setIsSaved(true);
        setToastMessage("Job saved successfully!");
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to update saved status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl max-w-lg border border-red-100 dark:border-red-900/30">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || 'Job not found.'}</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="mt-6 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-bold shadow-sm border border-slate-200 dark:border-slate-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // Generate domain for logo
  const domain = job.company ? `${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;

  // Mock Gap Analysis
  const mockMatchedSkills = job.required_skills.slice(0, Math.ceil(job.required_skills.length / 2));
  const mockMissingSkills = job.required_skills.slice(Math.ceil(job.required_skills.length / 2));
  const matchPct = job.required_skills.length > 0 
    ? Math.round((mockMatchedSkills.length / job.required_skills.length) * 100) 
    : 85;

  const getHiringProcess = (companyName) => {
    const name = (companyName || '').toLowerCase();
    if (['google', 'meta', 'facebook', 'amazon', 'apple', 'netflix', 'microsoft'].includes(name)) {
      return [
        { step: 1, title: 'Application Review', desc: 'Recruiter screens your resume.' },
        { step: 2, title: 'Online Assessment', desc: 'Coding or technical test (usually 90 mins).' },
        { step: 3, title: 'Phone Screen', desc: 'Technical interview with an engineer (45 mins).' },
        { step: 4, title: 'Virtual Onsite', desc: '4-5 rounds of coding, system design, and behavioral.' },
        { step: 5, title: 'Offer & Team Match', desc: 'Finalizing compensation and finding your specific team.' }
      ];
    } else if (['stripe', 'uber', 'airbnb', 'doordash', 'lyft'].includes(name)) {
      return [
        { step: 1, title: 'Recruiter Chat', desc: 'Initial call to discuss your background.' },
        { step: 2, title: 'Technical Screen', desc: 'Live coding session or take-home project.' },
        { step: 3, title: 'Onsite Interviews', desc: 'Deep dive into architecture, coding, and culture fit.' },
        { step: 4, title: 'Offer Stage', desc: 'Final approval from hiring committee.' }
      ];
    } else {
      return [
        { step: 1, title: 'Initial Screening', desc: 'Call with HR or recruiter (30 mins).' },
        { step: 2, title: 'Technical Interview', desc: 'Live technical assessment or whiteboard session.' },
        { step: 3, title: 'Culture Fit / Manager Chat', desc: 'Conversation with the hiring manager.' },
        { step: 4, title: 'Offer Stage', desc: 'Reference checks and offer negotiation.' }
      ];
    }
  };
  
  const hiringSteps = getHiringProcess(job.company);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            <IconArrowLeft size={18} />
            Back to Results
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-8">
            
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-3">
                  <img 
                    src={`https://icon.horse/icon/${domain}`} 
                    alt={job.company} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      if (e.target.src.includes('icon.horse')) {
                        e.target.src = `https://ui-avatars.com/api/?name=${job.company || 'C'}&background=e0e7ff&color=4f46e5`;
                      }
                    }} 
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {job.role}
                  </h1>
                  <p className="text-lg text-indigo-600 dark:text-indigo-400 font-bold mt-1 flex items-center gap-2">
                    <IconBuilding size={20} />
                    {job.company}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                      <IconMapPin size={16} className="text-slate-400" />
                      {job.location || 'Remote'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                      <IconBriefcase size={16} className="text-slate-400" />
                      {job.employment_type || 'Full-time'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                      <IconClock size={16} className="text-slate-400" />
                      {job.experience_level || 'Mid Level'}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <IconCoin size={16} />
                        {job.salary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <IconReportAnalytics className="text-indigo-500" />
                Job Description
              </h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p className="whitespace-pre-line leading-relaxed">
                  {job.job_description || "We are looking for a talented professional to join our team. The ideal candidate will have strong technical skills and a passion for building great products."}
                </p>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">Key Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Design, develop, and maintain high-performance software applications.</li>
                  <li>Collaborate with cross-functional teams to define and ship new features.</li>
                  <li>Identify and correct bottlenecks and fix bugs.</li>
                  <li>Help maintain code quality, organization, and automatization.</li>
                </ul>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">Preferred Qualifications</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Previous experience in a fast-paced startup environment.</li>
                  <li>Familiarity with cloud platforms like AWS or GCP.</li>
                  <li>Excellent communication and problem-solving skills.</li>
                </ul>
              </div>
            </div>

            {/* Hiring Process Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <IconChecklist className="text-indigo-500" />
                Estimated Hiring Process
              </h2>
              
              <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-4 space-y-8 pb-4">
                {hiringSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute -left-[17px] bg-indigo-100 dark:bg-indigo-900/50 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 italic text-right">* This process is estimated based on company trends.</p>
            </div>
            
          </div>

          {/* Right Sidebar (Sticky on Desktop) */}
          <div className="w-full lg:w-[400px] space-y-6">
            
            {/* Sticky Apply Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleApplyClick}
                  disabled={isApplied || applying}
                  className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-md ${
                    isApplied 
                      ? 'bg-emerald-600 cursor-not-allowed shadow-none hover:bg-emerald-600' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                  }`}
                >
                  {applying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg> Applying...
                    </span>
                  ) : isApplied ? (
                    <span className="flex items-center justify-center gap-2">
                      <IconCheck size={24} /> Applied
                    </span>
                  ) : (
                    'Apply Now'
                  )}
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={saving}
                  className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all border ${
                    isSaved
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {saving ? 'Processing...' : isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                Posted {new Date(job.posted_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            {/* Why This Job Matches You Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Why This Matches You</h2>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-black text-sm rounded-lg border border-indigo-100 dark:border-indigo-800">
                  {matchPct}% Match
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Matched Skills */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockMatchedSkills.length > 0 ? mockMatchedSkills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                        <IconCheck size={14} />
                        {skill}
                      </span>
                    )) : (
                      <span className="text-sm text-slate-500">None</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Skills to Improve</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockMissingSkills.length > 0 ? mockMissingSkills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800/50">
                        <IconX size={14} />
                        {skill}
                      </span>
                    )) : (
                      <span className="text-sm text-slate-500">None missing!</span>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Suggestions to increase match</h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4">
                    {mockMissingSkills.length > 0 ? (
                      <li>Take a crash course in <strong>{mockMissingSkills[0]}</strong> and build a small project.</li>
                    ) : (
                      <li>Highlight your leadership experience in your cover letter.</li>
                    )}
                    <li>Update your resume summary to match the job's core responsibilities.</li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowAuthModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-fadeIn text-center border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <IconLock size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Authentication Required</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Please login to continue. Your applied jobs and progress will be securely saved to your account.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate(`/login?redirectTo=/jobs/${id}&autoApply=true`)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-0.5"
              >
                Sign In to Apply
              </button>
              <button 
                onClick={() => navigate(`/signup?redirectTo=/jobs/${id}&autoApply=true`)}
                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold transition-all"
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-fadeIn text-center border border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <IconCheck size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Applied Successfully!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Your application has been applied and you can see your processes in your application tracker.
            </p>
            <button 
              onClick={() => navigate('/applications')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-0.5"
            >
              View in Application Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
