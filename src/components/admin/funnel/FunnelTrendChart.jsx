import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { STAGE_COLORS, STAGE_KEYS, STAGE_LABELS } from './funnelColors';

export default function FunnelTrendChart({ timeSeries }) {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
        <h3 className="text-sm font-bold text-[#0A2540] mb-3">Stage volume trend</h3>
        <div className="flex items-center justify-center h-[300px] text-[#9CA3AF] text-sm">No events in the selected period.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <h3 className="text-sm font-bold text-[#0A2540] mb-4">Stage volume trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timeSeries} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#0A2540', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#6B7280' }} />
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