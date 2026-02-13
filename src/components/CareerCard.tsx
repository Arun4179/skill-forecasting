
import React from 'react';
import { CareerRecommendation } from '../types';
import { SkillVisualizer } from './SkillVisualizer';

interface CareerCardProps {
  career: CareerRecommendation;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
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
            {career.learningPath.map((step, idx) => (
              <li key={idx} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold mr-3 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-600">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {career.marketTrendSource && career.marketTrendSource.length > 0 && (
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
