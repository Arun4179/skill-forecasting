
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';


interface SkillVisualizerProps {
  skills: any[];
  careerTitle: string;
}

export const SkillVisualizer: React.FC<SkillVisualizerProps> = ({ skills, careerTitle }) => {
  const data = Array.isArray(skills) ? skills.map((s: any) => ({
    subject: s.name || s.title || 'Unknown',
    A: s.demandScore || 50,
    fullMark: 100,
  })) : [];

  return (
    <div className="w-full h-[300px] mt-4">
      <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Demand Profile: {careerTitle}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Demand Score"
            dataKey="A"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
