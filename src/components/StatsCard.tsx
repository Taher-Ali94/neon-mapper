import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: "cyan" | "purple" | "blue" | "critical" | "high" | "medium" | "low";
}

const colorMap = {
  cyan: { icon: "text-neon-cyan", glow: "neon-glow-cyan" },
  purple: { icon: "text-neon-purple", glow: "neon-glow-purple" },
  blue: { icon: "text-neon-blue", glow: "" },
  critical: { icon: "text-severity-critical", glow: "" },
  high: { icon: "text-severity-high", glow: "" },
  medium: { icon: "text-severity-medium", glow: "" },
  low: { icon: "text-severity-low", glow: "" },
};

export const StatsCard = ({ icon: Icon, label, value, color = "cyan" }: StatsCardProps) => {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel p-5 ${c.glow}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted/30`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-2xl font-bold font-mono">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};
