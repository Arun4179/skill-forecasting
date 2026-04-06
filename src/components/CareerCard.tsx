import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerRecommendation } from '../types';
import { SkillVisualizer } from './SkillVisualizer';
import api from '../services/api';

interface CareerCardProps {
  career: CareerRecommendation;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleEnroll = async (course: any) => {
    try {
      setEnrolling(course.name);
      const res = await api.post("/api/courses/enroll", course);
      
      setEnrolledCourses(prev => [...prev, course.name]);
      if (res.data && res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.error === "You are already enrolled in this course") {
        setEnrolledCourses(prev => [...prev, course.name]);
        const fallbackUrl = course.url || `https://www.google.com/search?q=${encodeURIComponent(course.name + " " + (course.platform || "course"))}`;
        window.open(fallbackUrl, '_blank');
      } else {
        alert("Failed to enroll: " + (err.response?.data?.error || err.message));
      }
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase mb-2">
              Future Market Value
            </span>
            <h3 className="text-2xl font-bold text-slate-900">{career.title}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
            <i className="fas fa-star mr-1.5 text-indigo-400"></i>
            {career.relevanceScore}% Match
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed">
          {career.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <i className="fas fa-chart-line mr-2 text-indigo-500"></i>
              Growth Forecast
            </h4>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {career.growthForecast}
            </p>
            
            <h4 className="font-semibold text-slate-900 mt-4 mb-3 flex items-center">
              <i className="fas fa-wallet mr-2 text-indigo-500"></i>
              Projected Earnings
            </h4>
            <p className="text-lg font-bold text-slate-800">
              {career.averageSalary}
            </p>
          </div>
          
          <div className="bg-slate-50/50 rounded-xl p-2 border border-slate-100">
            <SkillVisualizer skills={career.keySkills} careerTitle={career.title} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
            <i className="fas fa-map-signs mr-2 text-indigo-500"></i>
            Transition Strategy
          </h4>
          <ul className="space-y-3">
            {Array.isArray(career.learningPath) ? career.learningPath.map((step, idx) => (
              <li key={idx} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold mr-3 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-600">{step}</span>
              </li>
            )) : <li className="text-sm text-slate-600">{String(career.learningPath || 'No structured path available.')}</li>}
          </ul>
        </div>

        {Array.isArray(career.suggestedCourses) && career.suggestedCourses.length > 0 && (
          <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
              <i className="fas fa-graduation-cap mr-2 text-indigo-500"></i>
              Recommended Upskilling Courses
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {career.suggestedCourses.map((course: any, idx) => {
                const isEnrolled = enrolledCourses.includes(course.name);
                const isEnrolling = enrolling === course.name;
                
                return (
                  <div key={idx} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 hover:bg-indigo-100/50 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-slate-800 text-sm leading-tight">{course.name || course.title || 'Course'}</h5>
                        <span className="text-xs font-semibold px-2 py-1 bg-white text-indigo-600 rounded drop-shadow-sm ml-2 whitespace-nowrap">
                          {course.platform || 'General'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{course.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-indigo-100">
                      <div className="flex items-center text-xs text-indigo-500 font-bold bg-white px-2 py-1 rounded-md shadow-sm">
                        <i className="far fa-clock mr-1.5 opacity-70"></i>
                        {course.estimatedHours || 'Self-paced'}
                      </div>
                      <button 
                        onClick={() => handleEnroll(course)}
                        disabled={isEnrolled || isEnrolling}
                        className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                          isEnrolled 
                            ? 'bg-emerald-100 text-emerald-700 opacity-80 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow transform hover:-translate-y-0.5'
                        }`}
                      >
                        {isEnrolled ? (
                          <><i className="fas fa-check-circle"></i> Studying</>
                        ) : isEnrolling ? (
                          <><i className="fas fa-spinner fa-spin"></i> ...</>
                        ) : (
                          <><i className="fas fa-play"></i> Study Now</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {Array.isArray(career.marketTrendSource) && career.marketTrendSource.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verified Market Sources</h4>
            <div className="flex flex-wrap gap-2">
              {career.marketTrendSource.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <i className="fas fa-external-link-alt mr-1.5"></i>
                  {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
