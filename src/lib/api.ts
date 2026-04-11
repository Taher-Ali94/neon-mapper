import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

export interface Project {
  Project_Id: number;
  P_name: string;
  Created_At?: string;
}

export interface ParsedDep {
  name: string;
  version_constraint: string;
  ecosystem: string;
}

export interface ResolvedDep {
  name: string;
  version: string;
  depth: number;
  type: "direct" | "transitive";
  path: string;
}

export interface Vulnerability {
  osv_id: string;
  cve_id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  cvss_score: number;
  summary: string;
  package: string;
  version: string;
}

export interface ReportFinding {
  package: string;
  version: string;
  dependency_type: string;
  depth: number;
  dependency_chain: string;
  vulnerability_id: string;
  cve_id: string;
  severity: string;
  cvss_score: number;
  summary: string;
  references: string[];
  published: string;
  modified: string;
}

export interface Report {
  project_id: number;
  total_packages: number;
  total_vulnerabilities: number;
  severity_counts: Record<string, number>;
  overall_risk: string;
  findings: ReportFinding[];
}

export const apiService = {
  healthCheck: () => api.get("/health"),

  createProject: (name: string) => api.post<Project>("/projects", { P_name: name }),
  getProjects: () => api.get<Project[]>("/projects"),
  getProject: (id: number) => api.get<Project>(`/projects/${id}`),

  uploadDependencies: (projectId: number, content: string) =>
    api.post(`/projects/${projectId}/dependencies/upload`, { content, filename: "requirements.txt" }),

  resolveDependencies: (projectId: number, content: string) =>
    api.post(`/projects/${projectId}/resolve`, { content }),

  scanVulnerabilities: (projectId: number) =>
    api.post(`/projects/${projectId}/scan`),

  getDependencies: (projectId: number) =>
    api.get(`/projects/${projectId}/dependencies`),

  getVulnerabilities: (projectId: number) =>
    api.get(`/projects/${projectId}/vulnerabilities`),

  getReport: (projectId: number) =>
    api.get<Report>(`/projects/${projectId}/report`),
};
