import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ChartDataPoint = {
  subject: string;
  score: number;
  fullMark: number;
};

interface RadarChartVisualProps {
  data: ChartDataPoint[];
}

export function RadarChartVisual({ data }: RadarChartVisualProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="border-t border-slate-100 p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">
        Behavioral Breakdown
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, "dataMax"]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
