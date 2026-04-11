import { motion } from "framer-motion";
import { GitBranch, Package } from "lucide-react";
import type { ResolvedDep } from "@/lib/api";

export const DependencyTree = ({ dependencies }: { dependencies: ResolvedDep[] }) => {
  const direct = dependencies.filter((d) => d.type === "direct");
  const transitive = dependencies.filter((d) => d.type === "transitive");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-mono text-primary">{direct.length}</span>
          <span className="text-muted-foreground">direct</span>
        </span>
        <span className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-secondary" />
          <span className="font-mono text-secondary">{transitive.length}</span>
          <span className="text-muted-foreground">transitive</span>
        </span>
      </div>

      <div className="space-y-1 max-h-80 overflow-auto pr-2">
        {dependencies.map((dep, i) => (
          <motion.div
            key={`${dep.name}-${dep.version}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-muted/30 transition-colors group"
            style={{ paddingLeft: `${dep.depth * 20 + 12}px` }}
          >
            {dep.depth > 0 && (
              <span className="text-muted-foreground/40 font-mono text-xs">└─</span>
            )}
            <span className={`w-2 h-2 rounded-full ${dep.type === "direct" ? "bg-primary" : "bg-secondary"}`} />
            <span className="font-mono text-sm">{dep.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{dep.version}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {dep.path}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
