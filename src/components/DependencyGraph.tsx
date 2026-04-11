import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ResolvedDep, Vulnerability } from "@/lib/api";

interface Props {
  dependencies: ResolvedDep[];
  vulnerabilities?: Vulnerability[];
}

export const DependencyGraph = ({ dependencies, vulnerabilities = [] }: Props) => {
  const vulnPackages = useMemo(
    () => new Set(vulnerabilities.map((v) => `${v.package}@${v.version}`)),
    [vulnerabilities]
  );

  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    const levelCounts: Record<number, number> = {};

    dependencies.forEach((dep) => {
      const id = `${dep.name}@${dep.version}`;
      if (!levelCounts[dep.depth]) levelCounts[dep.depth] = 0;
      const idx = levelCounts[dep.depth]++;
      const isVuln = vulnPackages.has(id);

      nodeMap.set(id, {
        id,
        position: { x: dep.depth * 280, y: idx * 80 },
        data: {
          label: (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-mono font-semibold">{dep.name}</span>
              <span className="text-[10px] font-mono opacity-60">{dep.version}</span>
            </div>
          ),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: isVuln ? "rgba(220, 38, 38, 0.15)" : "rgba(0, 220, 255, 0.08)",
          border: isVuln ? "1px solid rgba(220, 38, 38, 0.5)" : "1px solid rgba(0, 220, 255, 0.2)",
          borderRadius: "10px",
          padding: "8px 14px",
          color: isVuln ? "#fca5a5" : "#e0f7ff",
          boxShadow: isVuln
            ? "0 0 15px rgba(220, 38, 38, 0.2)"
            : "0 0 10px rgba(0, 220, 255, 0.1)",
        },
      });

      if (dep.depth > 0 && dep.path.includes(" -> ")) {
        const parts = dep.path.split(" -> ");
        const parentName = parts[parts.length - 2];
        const parentDep = dependencies.find(
          (d) => d.name === parentName && d.depth === dep.depth - 1
        );
        if (parentDep) {
          const parentId = `${parentDep.name}@${parentDep.version}`;
          edgeList.push({
            id: `${parentId}-${id}`,
            source: parentId,
            target: id,
            style: { stroke: isVuln ? "rgba(220, 38, 38, 0.4)" : "rgba(0, 220, 255, 0.15)" },
            markerEnd: { type: MarkerType.ArrowClosed, color: isVuln ? "#dc2626" : "#00dcff", width: 12, height: 12 },
            animated: isVuln,
          });
        }
      }
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [dependencies, vulnPackages]);

  return (
    <div className="w-full h-[500px] rounded-xl border border-glass-border overflow-hidden bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="rgba(0,220,255,0.03)" gap={20} />
        <Controls
          style={{
            background: "rgba(15,20,35,0.8)",
            borderRadius: "8px",
            border: "1px solid rgba(0,220,255,0.1)",
          }}
        />
      </ReactFlow>
    </div>
  );
};
