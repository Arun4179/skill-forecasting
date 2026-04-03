import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AssessmentState } from '../types';
import { getCareerIntelligence } from '../services/geminiService';
import { CareerCard } from '../components/CareerCard';
import { Button } from '../components/ui/Button';

const Assessment: React.FC = () => {
  const [state, setState] = useState<AssessmentState>({
    step: 0,
    profile: {
      currentRole: '',
      skills: [],
      interests: [],
      experienceLevel: 'mid',
    },
    loading: false,
    recommendations: [],
    error: null,
  });

  const navigate = useNavigate();

  // pull user info from storage so we can show their name in the header
  let user: { name?: string } | null = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch (err) {
    // corrupted value – clear it and continue gracefully
    console.warn("Failed to parse stored user", err);
    localStorage.removeItem("user");
    user = null;
  }

  const [roleInput, setRoleInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const roleOptions = [
    'Software Engineer',
    'Product Manager',
    'Data Analyst',
    'Growth Marketer',
    'UX Designer',
    'DevOps Engineer',
    'AI Specialist',
    'Project Manager',
    'Sales Engineer',
    'Customer Success Manager'
  ];

  const skillOptions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'SQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'UI/UX Design',
    'Project Management',
    'Data Analysis',
    'Marketing Strategy',
    'Machine Learning',
    'Communication'
  ];

  const interestOptions = [
    'Sustainability',
    'Fintech',
    'HealthTech',
    'AI Ethics',
    'Climate Technology',
    'Blockchain',
    'Remote Work',
    'Cybersecurity',
    'Human-Centered Design',
    'Smart Cities',
    'EdTech',
    'Data Privacy',
    'Autonomous Systems',
    'Quantum Computing',
    'Space Tech'
  ];

  const handleNextStep = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handlePrevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !state.profile.skills.includes(val)) {
      setState(prev => ({
        ...prev,
        profile: { ...prev.profile, skills: [...prev.profile.skills, val] }
      }));
      setSkillInput('');
    }
  };

  const addSkillFromSuggestion = (skill: string) => {
    if (!state.profile.skills.includes(skill)) {
      setState(prev => ({
        ...prev,
        profile: { ...prev.profile, skills: [...prev.profile.skills, skill] }
      }));
    }
    setSkillInput('');
  };

  const addInterest = () => {
    const val = interestInput.trim();
    if (val && !state.profile.interests.includes(val)) {
      setState(prev => ({
        ...prev,
        profile: { ...prev.profile, interests: [...prev.profile.interests, val] }
      }));
      setInterestInput('');
    }
  };

  const removeSkill = (index: number) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter((_, i) => i !== index)
      }
    }));
  };

  const removeInterest = (index: number) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        interests: prev.profile.interests.filter((_, i) => i !== index)
      }
    }));
  };

  const generateRecommendations = async () => {
    // Basic validation before firing the API
    if (state.profile.skills.length === 0 || !state.profile.currentRole) {
      setState(prev => ({ ...prev, error: "Missing required information (Role and Skills)." }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, step: 4 }));
    try {
      const results = await getCareerIntelligence(state.profile);
      setState(prev => ({ ...prev, recommendations: results, loading: false }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : "Failed to forecast future careers.", 
        loading: false 
      }));
    }
  };

  const reset = () => {
    setState({
      step: 0,
      profile: {
        currentRole: '',
        skills: [],
        interests: [],
        experienceLevel: 'mid',
      },
      loading: false,
      recommendations: [],
      error: null,
    });
    setRoleInput('');
    setSkillInput('');
    setInterestInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirm) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await api.delete("/api/auth/me");

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error:
          err.response?.data?.error ||
          err.message ||
          'Unable to delete your account. Please try again.',
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <i className="fas fa-compass text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-slate-900">
                FuturePath <span className="text-indigo-600 italic">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <span className="text-sm font-medium text-slate-700">
                  Welcome, <strong>{user.name}</strong>
                </span>
              )}
        
              <Button variant="outline" size="sm" onClick={reset}>New Session</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>Settings</Button>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {state.step === 0 && (
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-6 border border-indigo-100">
              <i className="fas fa-sparkles"></i>
              MARKET ANALYSIS ACTIVE
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Bridge the gap between your skills and <span className="text-indigo-600">future wealth.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-6 leading-relaxed">
              Analyze your unique skill profile against forecasted market shifts to discover high-growth roles 5-10 years before they peak.
            </p>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-10 text-indigo-600 font-medium">
              "Ensures users choose career paths aligned with skills that will have high demand in the future."
            </div>
            <Button size="lg" className="rounded-xl px-12 py-5 text-xl shadow-2xl hover:scale-105 transition-transform" onClick={handleNextStep}>
              Begin Intelligence Scan
            </Button>
          </div>
        )}

        {state.step > 0 && state.step < 4 && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="bg-slate-100 h-2 w-full">
              <div 
                className="bg-indigo-600 h-full transition-all duration-700 ease-in-out" 
                style={{ width: `${(state.step / 3) * 100}%` }}
              ></div>
            </div>
            
            <div className="p-8 sm:p-12">
              {state.step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-slate-900">Current Base</h2>
                  <p className="text-slate-500">Establishing your baseline career foundation.</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role / Title</label>
                    <input 
                      type="text"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. Creative Lead, Project Manager..."
                      value={roleInput || state.profile.currentRole}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoleInput(value);
                        setState(prev => ({ ...prev, profile: { ...prev.profile, currentRole: value } }));
                      }}
                    />
                    {roleInput.trim().length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl mt-2 p-2 max-h-44 overflow-auto">
                        {(() => {
                          const suggestions = roleOptions
                            .filter(role =>
                              role.toLowerCase().includes(roleInput.toLowerCase()) &&
                              role.toLowerCase() !== roleInput.toLowerCase()
                            )
                            .slice(0, 6);

                          if (suggestions.length > 0) {
                            return suggestions.map((role) => (
                              <button
                                key={role}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-50"
                                onClick={() => {
                                  setState(prev => ({ ...prev, profile: { ...prev.profile, currentRole: role } }));
                                  setRoleInput(role);
                                }}
                              >
                                {role}
                              </button>
                            ));
                          }

                          if (roleOptions.some(role => role.toLowerCase() === roleInput.toLowerCase())) {
                            return <p className="text-xs text-slate-400 px-3 py-2">Role selected.</p>;
                          }

                          return <p className="text-xs text-slate-400 px-3 py-2">No role suggestions found.</p>;
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seniority</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['entry', 'mid', 'senior'].map((level) => (
                        <button
                          key={level}
                          className={`py-4 rounded-2xl border-2 transition-all font-bold capitalize ${
                            state.profile.experienceLevel === level 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-slate-50 bg-slate-50 text-slate-400'
                          }`}
                          onClick={() => setState(prev => ({ ...prev, profile: { ...prev.profile, experienceLevel: level as any } }))}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {state.step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-slate-900">Your Expertise</h2>
                  <p className="text-slate-500">Add the skills you've mastered to see where they carry the most value.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="secondary" className="rounded-2xl px-6">Add</Button>
                  </div>
                  {skillInput.trim().length > 0 && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        const suggestions = skillOptions
                          .filter(skill =>
                            skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                            !state.profile.skills.includes(skill)
                          )
                          .slice(0, 8);

                        if (suggestions.length > 0) {
                          return suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="text-left px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-indigo-50"
                              onClick={() => addSkillFromSuggestion(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ));
                        }

                        if (state.profile.skills.includes(skillInput.trim())) {
                          return <p className="text-xs text-slate-400 px-3 py-2">Skill already added.</p>;
                        }

                        return <p className="text-xs text-slate-400 px-3 py-2">No matching skill suggestions.</p>;
                      })()}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-4 min-h-[140px] bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                    {state.profile.skills.length === 0 && (
                      <p className="text-slate-400 text-sm italic w-full text-center py-8">Enter your primary professional skills.</p>
                    )}
                    {state.profile.skills.map((skill, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-sm animate-fade-in">
                        {skill}
                        <button onClick={() => removeSkill(idx)} className="ml-3 text-slate-300 hover:text-red-500 transition-colors">
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {state.step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-slate-900">Growth Interests</h2>
                  <p className="text-slate-500">Which industries or movements catch your attention?</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Ethics, Logistics, Automation..."
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} variant="secondary" className="rounded-2xl px-6">Add</Button>
                  </div>
                  {interestInput.trim().length > 0 && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        const suggestions = interestOptions
                          .filter(interest =>
                            interest.toLowerCase().includes(interestInput.toLowerCase()) &&
                            !state.profile.interests.includes(interest)
                          )
                          .slice(0, 8);

                        if (suggestions.length > 0) {
                          return suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="text-left px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-emerald-50"
                              onClick={() => {
                                if (!state.profile.interests.includes(suggestion)) {
                                  setState(prev => ({
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      interests: [...prev.profile.interests, suggestion],
                                    },
                                  }));
                                }
                                setInterestInput('');
                              }}
                            >
                              {suggestion}
                            </button>
                          ));
                        }

                        if (state.profile.interests.includes(interestInput.trim())) {
                          return <p className="text-xs text-slate-400 px-3 py-2">Interest already added.</p>;
                        }

                        return <p className="text-xs text-slate-400 px-3 py-2">No matching interest suggestions.</p>;
                      })()}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4 min-h-[140px] bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                    {state.profile.interests.length === 0 && (
                      <p className="text-slate-400 text-sm italic w-full text-center py-8">What motivates your professional growth?</p>
                    )}
                    {state.profile.interests.map((interest, idx) => (
                      <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-sm animate-fade-in">
                        {interest}
                        <button onClick={() => removeInterest(idx)} className="ml-3 text-emerald-300 hover:text-red-500 transition-colors">
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 flex justify-between items-center gap-4">
                <button onClick={handlePrevStep} className="text-slate-400 hover:text-slate-900 font-bold px-4">
                  <i className="fas fa-arrow-left mr-2"></i> Back
                </button>
                {state.step === 3 ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 rounded-2xl shadow-xl bg-indigo-600 hover:bg-indigo-700"
                    onClick={generateRecommendations}
                    disabled={state.profile.skills.length < 1}
                  >
                    Generate Forecast <i className="fas fa-bolt ml-2 text-yellow-400"></i>
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 rounded-2xl shadow-xl"
                    onClick={handleNextStep}
                    disabled={
                      (state.step === 1 && !state.profile.currentRole) ||
                      (state.step === 2 && state.profile.skills.length < 1)
                    }
                  >
                    Continue <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {state.step === 4 && (
          <div className="animate-fade-in">
            {state.loading ? (
              <div className="max-w-md mx-auto text-center py-24 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-radar text-indigo-600 text-2xl animate-pulse"></i>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Thinking Deeply...</h2>
                  <p className="text-slate-500 font-medium tracking-tight">Cross-referencing global growth signals & market demand.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
                  <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden relative">
                    <div className="h-full bg-indigo-600 shimmer absolute top-0 left-0 w-full"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Gathering Data</span>
                    <span>Validating Trends</span>
                    <span>Synthesizing Paths</span>
                  </div>
                </div>
              </div>
            ) : state.error ? (
              <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-3xl shadow-2xl p-12 border-2 border-red-50">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto">
                  <i className="fas fa-unlink text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Signal Lost</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">{state.error}</p>
                <div className="flex gap-4">
                  <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-2xl">Adjust My Info</Button>
                  <Button onClick={reset} variant="primary" className="flex-1 rounded-2xl">Full Reset</Button>
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live Market Alignment</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900">Forecast Intelligence</h2>
                    <p className="text-slate-500 font-medium">Top 3 career evolutions optimized for <span className="text-indigo-600">you.</span></p>
                  </div>
                  <Button variant="outline" className="rounded-2xl" onClick={reset}>
                    <i className="fas fa-redo mr-2"></i> Recalibrate Data
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {state.recommendations.map((career, idx) => (
                    <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                      <CareerCard career={career} />
                    </div>
                  ))}
                </div>
                
                <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl overflow-hidden relative border border-slate-800">
                   <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                      <i className="fas fa-brain text-9xl"></i>
                   </div>
                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div>
                        <h3 className="text-3xl font-bold mb-6">Strategic Outlook</h3>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                          The paths above represent high-growth vectors identified by our AI scanning current macroeconomic shifts. The most successful transition involves bridging 60-70% of your current skills into these emerging territories.
                        </p>
                        <div className="flex flex-wrap gap-4">
                           <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                              <i className="fas fa-shield-check text-emerald-400"></i>
                              <span className="text-sm font-bold">Validated Demand</span>
                           </div>
                           <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                              <i className="fas fa-money-bill-trend-up text-indigo-400"></i>
                              <span className="text-sm font-bold">Salary Optimized</span>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-bold text-indigo-300 mb-2">Immediate Step 1:</h4>
                            <p className="text-sm text-slate-400">Identify the 'Skill Gap Alpha'—the single technical skill in the radar charts where you have the largest divergence from market demand.</p>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-bold text-emerald-300 mb-2">Immediate Step 2:</h4>
                            <p className="text-sm text-slate-400">Utilize the "Verified Sources" above to subscribe to top industry newsletters for your primary career recommendation.</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          <div className="flex justify-center items-center gap-2 grayscale opacity-50">
            <i className="fas fa-compass text-indigo-600 text-2xl"></i>
            <span className="text-xl font-bold text-slate-900">FuturePath AI</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 FuturePath AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Assessment;
