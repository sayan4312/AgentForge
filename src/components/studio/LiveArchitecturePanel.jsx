import React from 'react';
import { Cpu, ShieldCheck, Database, Zap, Layers, Activity } from 'lucide-react';

export default function LiveArchitecturePanel({ architecture, isGenerating }) {
  const arch = architecture || {
    llm: 'Gemini Flash',
    framework: 'Google ADK',
    transport: 'FastMCP',
    storage: 'SQLite / ChromaDB',
    apis_enabled: ['GitHub REST API', 'Gemini API'],
    static_analysis: ['Bandit', 'Pylint', 'AST Check']
  };

  return (
    <div className="studio-panel">
      {/* Header */}
      <div className="studio-panel-header">
        <div className="studio-panel-title">
          <Activity size={14} color={isGenerating ? '#f59e0b' : '#10b981'} className={isGenerating ? 'fa-spin' : ''} />
          <span>Live Architecture</span>
        </div>

        <span className="studio-badge" style={{ color: '#10b981' }}>
          {isGenerating ? 'Synthesizing' : 'Synced'}
        </span>
      </div>

      {/* Body */}
      <div className="studio-panel-body custom-scrollbar">
        {/* 2x2 Specs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <Cpu size={16} color="#ffffff" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>LLM Engine</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{arch.llm || 'Gemini Flash'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <Layers size={16} color="#ffffff" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Framework</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{arch.framework || 'Google ADK'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <Zap size={16} color="#ffffff" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Transport</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{arch.transport || 'FastMCP'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <Database size={16} color="#ffffff" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Storage</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{arch.storage || 'SQLite'}</span>
            </div>
          </div>
        </div>

        {/* Enabled APIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>APIs Enabled:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(arch.apis_enabled || ['External REST APIs']).map((api, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {api}
              </span>
            ))}
          </div>
        </div>

        {/* Static Analysis Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Static Analysis & Tools:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(arch.static_analysis || ['Bandit', 'AST Check', 'Pylint']).map((tool, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
