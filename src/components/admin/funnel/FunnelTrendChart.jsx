import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { STAGE_COLORS, STAGE_KEYS, STAGE_LABELS } from './funnelColors';

export default function FunnelTrendChart({ timeSeries }) {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-4">
        <h3 className="text-sm font-bold text-white mb-3">Stage Volume Trend</h3>
        <div className="flex items-center justify-center h-[300px] text-[#64748B] text-sm">No events in the selected period.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-4">
      <h3 className="text-sm font-bold text-white mb-3">Stage Volume Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timeSeries} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#0B1120', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
          {STAGE_KEYS.map(key => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={STAGE_COLORS[key]}
              fill={STAGE_COLORS[key]}
              fillOpacity={0.15}
              name={STAGE_LABELS[key]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}