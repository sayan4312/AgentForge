import React, { useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play } from 'lucide-react';

export default function TerminalConsole({ logs, executionOutput, onRunAgent, isBuilding }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, executionOutput]);

  return (
    <div className="studio-panel">
      {/* Header */}
      <div className="studio-panel-header">
        <div className="studio-panel-title">
          <TerminalIcon size={14} color="#ffffff" />
          <span>Terminal / Console</span>
        </div>

        {onRunAgent && (
          <button
            onClick={onRunAgent}
            disabled={isBuilding}
            className="studio-btn-primary"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem' }}
          >
            <Play size={12} fill="currentColor" />
            <span>Run Agent</span>
          </button>
        )}
      </div>

      {/* Terminal Log Output */}
      <div className="studio-panel-body custom-scrollbar" style={{ background: 'rgba(2, 6, 23, 0.95)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        {logs && logs.length > 0 ? (
          logs.map((logItem, index) => {
            const text = typeof logItem === 'string' ? logItem : logItem.log || logItem.text || '';
            const status = typeof logItem === 'object' ? logItem.status : 'info';

            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: '1.5' }}>
                <span style={{ color: 'var(--text-muted)', userSelect: 'none' }}>$</span>
                <span
                  style={{
                    color:
                      status === 'success'
                        ? '#10b981'
                        : status === 'error'
                        ? '#f43f5e'
                        : status === 'warning'
                        ? '#f59e0b'
                        : 'var(--text-secondary)'
                  }}
                >
                  {text}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
            Initializing AgentForge Studio terminal environment...
          </div>
        )}

        {executionOutput && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', color: '#10b981' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Execution Output:
            </span>
            <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#10b981', fontSize: '0.65rem', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
              {executionOutput}
            </pre>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
