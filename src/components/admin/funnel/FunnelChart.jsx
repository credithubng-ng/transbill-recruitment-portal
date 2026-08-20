import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { STAGE_COLORS } from './funnelColors';

export default function FunnelChart({ aggregates, onSegmentClick }) {
  const data = aggregates.map(a => ({
    label: a.label,
    count: a.count,
    stage: a.stage,
    color: STAGE_COLORS[a.stage],
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-4">
      <h3 className="text-sm font-bold text-white mb-3">Funnel Volume</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
          <XAxis type="number" domain={[0, maxCount]} hide />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            width={130}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#1E3A5F', fillOpacity: 0.3 }}
            contentStyle={{ background: '#0B1120', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#fff' }}
            formatter={(v) => [v.toLocaleString(), 'Count']}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} onClick={(d) => onSegmentClick(d.stage)} cursor="pointer">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: '#fff', fontSize: 11, fontWeight: 600 }}
              formatter={(v) => v.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-[#64748B] mt-2 text-center">Click any bar to view the stage drill-down</p>
    </div>
  );
}