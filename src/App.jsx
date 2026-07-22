import React, { useState, useEffect } from 'react';
import VideoBackground from './components/VideoBackground';
import Navbar from './components/Navbar';
import GlassForgeBar from './components/GlassForgeBar';
import OrchestratorPanel from './components/OrchestratorPanel';
import WorkspacePanel from './components/WorkspacePanel';
import ArchitectureGrid from './components/ArchitectureGrid';
import RAGSection from './components/RAGSection';
import MCPServerDocsSection from './components/MCPServerDocsSection';
import AgentShowcase from './components/AgentShowcase';
import StudioLayout from './components/studio/StudioLayout';
import { DEMO_SCENARIOS } from './data/mockData';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'studio'
  const [prompt, setPrompt] = useState('');
  const [initialFiles, setInitialFiles] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showOrchestrator, setShowOrchestrator] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState([]);
  const [generatedFiles, setGeneratedFiles] = useState(null);

  const [customAgents, setCustomAgents] = useState(() => {
    try {
      const saved = localStorage.getItem('agentforge_custom_agents');
      const agents = saved ? JSON.parse(saved) : [];
      return agents.slice(0, 3);
    } catch (e) {
      return [];
    }
  });

  const MAX_AGENTS = 3;

  useEffect(() => {
    try {
      const agentsToSave = customAgents.slice(0, MAX_AGENTS);
      localStorage.setItem('agentforge_custom_agents', JSON.stringify(agentsToSave));
    } catch (e) { }
  }, [customAgents]);

  const addLog = (text, type = "info") => {
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs((prev) => [...prev, { time: timeStr, text, type }]);
  };

  // Clicking "Build Agent" saves initial prompt and navigates to Studio IDE
  const handleForge = (customPrompt = null) => {
    const targetPrompt = customPrompt || prompt || "GitHub Repository Error Finder";
    setPrompt(targetPrompt);
    setInitialFiles(null);
    setViewMode('studio');
  };

  const handleReset = () => {
    setShowOrchestrator(false);
    setGeneratedFiles(null);
    setPrompt('');
    setInitialFiles(null);
    setIsBuilding(false);
  };

  const handleSaveAgent = (newAgent) => {
    setCustomAgents((prev) => {
      const updated = [newAgent, ...prev.filter((a) => a.title !== newAgent.title)].slice(0, MAX_AGENTS);
      try {
        localStorage.setItem('agentforge_custom_agents', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearCache = () => {
    setCustomAgents([]);
    addLog("Agent cache cleared - all slots available", "info");
  };

  return (
    <>
      <VideoBackground />

      {viewMode === 'studio' ? (
        <StudioLayout
          prompt={prompt}
          initialFiles={initialFiles}
          onSaveAgent={handleSaveAgent}
          onBackToHome={() => {
            setInitialFiles(null);
            setViewMode('landing');
          }}
        />
      ) : (
        <div className="app-wrapper">
          <Navbar />

          <main className="hero-container" id="hero">
            <section className="hero-content">

              <div className="hero-badge animate-fade-in">
                <span className="star-icon">⚡</span>
                <span>AgentForge Studio v2.0 is live</span>
              </div>

              <h1 className="hero-title animate-slide-up">
                Forge Custom <span className="gradient-text">AI Agents</span><br />
                From Natural Language.
              </h1>

              <p className="hero-description animate-slide-up delay-1">
                Input your idea into AgentForge. Launch into AgentForge Studio IDE to collaborate with a Senior AI Architect, customize specifications, and generate multi-file agent projects.
              </p>

              <GlassForgeBar
                prompt={prompt}
                setPrompt={setPrompt}
                onForge={handleForge}
                isBuilding={isBuilding}
              />

              {showOrchestrator && (
                <OrchestratorPanel
                  activeStep={activeStep}
                  logs={logs}
                  elapsedTime={elapsedTime}
                  onReset={handleReset}
                />
              )}

              {generatedFiles && (
                <WorkspacePanel generatedFiles={generatedFiles} />
              )}

            </section>

            <section className="hero-character-space">
              {/* Space kept clean for background visual */}
            </section>
          </main>

          <ArchitectureGrid />

          <RAGSection activePrompt={generatedFiles?.prompt || prompt} />

          <MCPServerDocsSection />

          <AgentShowcase
            agents={customAgents}
            onSelectScenario={(scPrompt, scFiles) => {
              setPrompt(scPrompt);
              setInitialFiles(scFiles);
              setViewMode('studio');
            }}
            onClearCache={handleClearCache}
          />

          <footer className="footer glass-card">
            <div className="footer-content">
              <div className="footer-brand-col">
                <span className="brand-name">Agent<span className="highlight">Forge</span></span>
                <p>Google AI Partner Hackathon • Automation & AI Agents Track</p>
              </div>

              <div className="footer-status-col">
                <div className="status-indicator">
                  <span className="status-dot green" />
                  <span>All Systems Operational ({customAgents.length} Agents Forged)</span>
                </div>
                <p>© 2026 AgentForge Team. Built with Google Gemini 2.0 Flash & ADK.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
