import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Plus, FolderOpen, GitBranch, Eye, FileText,
  Package, AlertTriangle, ChevronRight, ArrowLeft, Network,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService, type ResolvedDep, type Report } from "@/lib/api";
import { FileUpload } from "@/components/FileUpload";
import { DependencyTree } from "@/components/DependencyTree";
import { DependencyGraph } from "@/components/DependencyGraph";
import { VulnerabilityTable } from "@/components/VulnerabilityTable";
import { StatsCard } from "@/components/StatsCard";
import { SeverityBadge } from "@/components/SeverityBadge";

type Step = "project" | "upload" | "resolve" | "scan" | "report";

const steps: { key: Step; label: string; icon: typeof Shield }[] = [
  { key: "project", label: "Project", icon: FolderOpen },
  { key: "upload", label: "Upload", icon: FileText },
  { key: "resolve", label: "Resolve", icon: GitBranch },
  { key: "scan", label: "Scan", icon: Eye },
  { key: "report", label: "Report", icon: Shield },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("project");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedDeps, setParsedDeps] = useState<string[]>([]);
  const [resolvedDeps, setResolvedDeps] = useState<ResolvedDep[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  const createProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    try {
      const { data } = await apiService.createProject(projectName);
      setProjectId(data.Project_Id);
      toast.success(`Project "${projectName}" created`);
      setCurrentStep("upload");
    } catch {
      toast.error("Failed to create project. Is the API server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (content: string) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await apiService.uploadDependencies(projectId, content);
      setFileContent(content);
      setParsedDeps(data.parsed?.map((d: { name: string; version_constraint: string }) => `${d.name}${d.version_constraint}`) || []);
      toast.success(`Parsed ${data.count} dependencies`);
      setCurrentStep("resolve");
    } catch {
      toast.error("Failed to upload dependencies");
    } finally {
      setLoading(false);
    }
  };

  const resolveDeps = async () => {
    if (!projectId || !fileContent) return;
    setLoading(true);
    try {
      const { data } = await apiService.resolveDependencies(projectId, fileContent);
      setResolvedDeps(data.resolved || []);
      toast.success(`Resolved ${data.total_packages} packages`);
      setCurrentStep("scan");
    } catch {
      toast.error("Failed to resolve dependencies");
    } finally {
      setLoading(false);
    }
  };

  const scanVulns = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await apiService.scanVulnerabilities(projectId);
      toast.success(`Found ${data.vulnerabilities_found} vulnerabilities`);
    } catch {
      toast.error("Failed to scan for vulnerabilities");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
    try {
      const reportRes = await apiService.getReport(projectId);
      setReport(reportRes.data);
    } catch {
      toast.error("Scan complete but failed to load the report. Try refreshing.");
    } finally {
      setLoading(false);
      setCurrentStep("report");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">
              <span className="text-primary">Secure</span>Mapper
            </span>
          </button>

          {/* Progress steps */}
          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => i <= stepIndex && setCurrentStep(s.key)}
                  disabled={i > stepIndex}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    i === stepIndex
                      ? "bg-primary/15 text-primary"
                      : i < stepIndex
                      ? "text-primary/60 hover:bg-muted/30"
                      : "text-muted-foreground/40"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 mx-1" />}
              </div>
            ))}
          </div>

          {projectId && (
            <span className="text-xs font-mono text-muted-foreground">
              Project #{projectId}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* PROJECT STEP */}
          {currentStep === "project" && (
            <motion.div key="project" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Create Project</h2>
                <p className="text-sm text-muted-foreground">Start by creating a new project to analyze</p>
              </div>
              <div className="glass-panel p-6 max-w-md space-y-4">
                <label className="text-sm font-medium">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                  placeholder="e.g., my-web-app"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-glass-border text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  onClick={createProject}
                  disabled={loading || !projectName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Project
                </button>
              </div>
            </motion.div>
          )}

          {/* UPLOAD STEP */}
          {currentStep === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Upload Dependencies</h2>
                <p className="text-sm text-muted-foreground">Upload your requirements.txt to begin analysis</p>
              </div>
              <div className="glass-panel p-6 max-w-lg">
                <FileUpload onUpload={handleUpload} isLoading={loading} />
              </div>
            </motion.div>
          )}

          {/* RESOLVE STEP */}
          {currentStep === "resolve" && (
            <motion.div key="resolve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Resolve Dependencies</h2>
                  <p className="text-sm text-muted-foreground">{parsedDeps.length} direct dependencies parsed</p>
                </div>
                <button
                  onClick={resolveDeps}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                  Resolve Dependency Tree
                </button>
              </div>

              <div className="glass-panel p-5">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Parsed dependencies</p>
                <div className="flex flex-wrap gap-2">
                  {parsedDeps.map((d) => (
                    <span key={d} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-mono text-xs text-primary">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="glass-panel p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Resolving transitive dependencies via PyPI...</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">This may take 30-60 seconds</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SCAN STEP */}
          {currentStep === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Vulnerability Scan</h2>
                  <p className="text-sm text-muted-foreground">{resolvedDeps.length} packages in dependency tree</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGraph(!showGraph)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-glass-border text-sm hover:bg-muted/30 transition-all"
                  >
                    <Network className="w-4 h-4" />
                    {showGraph ? "Tree View" : "Graph View"}
                  </button>
                  <button
                    onClick={scanVulns}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Scan for Vulnerabilities
                  </button>
                </div>
              </div>

              {showGraph ? (
                <DependencyGraph dependencies={resolvedDeps} />
              ) : (
                <div className="glass-panel p-5">
                  <DependencyTree dependencies={resolvedDeps} />
                </div>
              )}

              {loading && (
                <div className="glass-panel p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Scanning packages against OSV.dev...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* REPORT STEP */}
          {currentStep === "report" && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Security Report</h2>
                  <p className="text-sm text-muted-foreground">
                    Overall risk: <SeverityBadge severity={report.overall_risk} />
                  </p>
                </div>
                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-glass-border text-sm hover:bg-muted/30 transition-all"
                >
                  <Network className="w-4 h-4" />
                  {showGraph ? "Table View" : "Graph View"}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard icon={Package} label="Total Packages" value={report.total_packages} color="cyan" />
                <StatsCard icon={AlertTriangle} label="Vulnerabilities" value={report.total_vulnerabilities} color="critical" />
                <StatsCard icon={Shield} label="Critical" value={report.severity_counts?.CRITICAL || 0} color="critical" />
                <StatsCard icon={Eye} label="High" value={report.severity_counts?.HIGH || 0} color="high" />
              </div>

              {/* Severity breakdown */}
              <div className="glass-panel p-5">
                <p className="text-sm font-medium mb-3">Severity Breakdown</p>
                <div className="flex gap-3">
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"].map((s) => {
                    const count = report.severity_counts?.[s] || 0;
                    const total = report.total_vulnerabilities || 1;
                    return (
                      <div key={s} className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <SeverityBadge severity={s} />
                          <span className="font-mono text-sm">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / total) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full rounded-full ${
                              s === "CRITICAL" ? "bg-severity-critical" :
                              s === "HIGH" ? "bg-severity-high" :
                              s === "MEDIUM" ? "bg-severity-medium" :
                              s === "LOW" ? "bg-severity-low" : "bg-muted-foreground"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graph or Table */}
              {showGraph ? (
                <DependencyGraph
                  dependencies={resolvedDeps}
                  vulnerabilities={report.findings?.map((f) => ({
                    osv_id: f.vulnerability_id,
                    cve_id: f.cve_id,
                    severity: f.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
                    cvss_score: f.cvss_score,
                    summary: f.summary,
                    package: f.package,
                    version: f.version,
                  }))}
                />
              ) : (
                <VulnerabilityTable findings={report.findings || []} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
