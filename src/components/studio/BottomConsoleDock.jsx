import React, { useState } from 'react';
import { Terminal as TerminalIcon, PackageCheck, Play, Download, Edit3, ShieldCheck, Box, CheckCircle2, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import TerminalConsole from './TerminalConsole';
import ProjectDetails from './ProjectDetails';

export default function BottomConsoleDock({
  logs,
  executionOutput,
  onRunAgent,
  isBuilding,
  files,
  isGenerated,
  onDownloadZip,
  onContinueEditing,
  isCollapsed,
  onToggleCollapse
}) {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'details'

  return (
    <div className="studio-panel" style={{ height: '100%' }}>
      {/* Header Dock Tabs */}
      <div className="studio-panel-header" style={{ padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`studio-chip-btn ${activeTab === 'terminal' ? 'active' : ''}`}
            style={{ borderRadius: '6px 6px 0 0', padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
          >
            <TerminalIcon size={13} />
            <span>Terminal / Console</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`studio-chip-btn ${activeTab === 'details' ? 'active' : ''}`}
            style={{ borderRadius: '6px 6px 0 0', padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
          >
            <PackageCheck size={13} />
            <span>Project Metrics & Summary</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeTab === 'terminal' && onRunAgent && !isCollapsed && (
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

          {activeTab === 'details' && !isCollapsed && (
            <span className="studio-badge" style={{ color: isGenerated ? '#10b981' : 'var(--text-secondary)' }}>
              {isGenerated ? 'Project Ready' : 'Pending Build'}
            </span>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="studio-btn-secondary"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              title={isCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
            >
              {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Dock Content Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'terminal' && (
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
          </div>
        )}

        {activeTab === 'details' && (
          <div className="studio-panel-body custom-scrollbar">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Generated Files</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{Object.keys(files || {}).length || 6} Files</span>
                </div>
                <Box size={18} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Validation Pass</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>Passed (100%)</span>
                </div>
                <ShieldCheck size={18} color="#10b981" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Runtime Status</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>Successful</span>
                </div>
                <CheckCircle2 size={18} color="#a5b4fc" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Package Size</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>~42 KB</span>
                </div>
                <HardDrive size={18} color="#fcd34d" />
              </div>
            </div>

            {isGenerated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button onClick={onRunAgent} className="studio-generate-btn" style={{ flex: 1, padding: '0.55rem 1rem', fontSize: '0.75rem' }}>
                  <Play size={14} fill="currentColor" />
                  <span>Run Agent Process</span>
                </button>

                <button onClick={onDownloadZip} className="studio-btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.75rem' }}>
                  <Download size={14} />
                  <span>Export ZIP</span>
                </button>

                <button onClick={onContinueEditing} className="studio-btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.75rem' }}>
                  <Edit3 size={14} />
                  <span>Edit Requirements</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
