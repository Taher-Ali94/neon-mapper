import { cn } from "@/lib/utils";

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: "bg-severity-critical/15", text: "text-severity-critical", dot: "bg-severity-critical" },
  HIGH: { bg: "bg-severity-high/15", text: "text-severity-high", dot: "bg-severity-high" },
  MEDIUM: { bg: "bg-severity-medium/15", text: "text-severity-medium", dot: "bg-severity-medium" },
  LOW: { bg: "bg-severity-low/15", text: "text-severity-low", dot: "bg-severity-low" },
  NONE: { bg: "bg-muted/30", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export const SeverityBadge = ({ severity }: { severity: string }) => {
  const config = severityConfig[severity] || severityConfig.NONE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold", config.bg, config.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {severity}
    </span>
  );
};
