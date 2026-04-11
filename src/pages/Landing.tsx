import { motion } from "framer-motion";
import { Shield, ArrowRight, GitBranch, Eye, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NetworkBackground } from "@/components/NetworkBackground";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NetworkBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 animate-glow"
          >
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-primary neon-text-cyan">Secure</span>
            <span className="text-foreground">Mapper</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-3 font-light">
            Recursive Dependency & Vulnerability Mapping System
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-lg mx-auto mb-10">
            Upload your requirements.txt, resolve the full dependency tree, and scan for known vulnerabilities — all in one pipeline.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg neon-glow-cyan hover:opacity-90 transition-opacity"
          >
            Start Scanning
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl w-full px-4"
        >
          {[
            { icon: GitBranch, title: "Recursive Resolution", desc: "Full transitive dependency tree via PyPI" },
            { icon: Eye, title: "Live Vulnerability Scan", desc: "Real-time data from OSV.dev database" },
            { icon: Zap, title: "Risk Analysis", desc: "SQL CTE-powered security reports" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="glass-panel p-6 text-center hover:border-primary/30 transition-colors"
            >
              <f.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
