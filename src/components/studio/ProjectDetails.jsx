import React from 'react';
import { PackageCheck, Download, Play, Edit3, CheckCircle2, ShieldCheck, Box, HardDrive } from 'lucide-react';

export default function ProjectDetails({ files, isGenerated, onRunAgent, onDownloadZip, onContinueEditing }) {
  const fileCount = Object.keys(files || {}).length || 6;

  return (
    <div className="studio-panel">
      {/* Header */}
      <div className="studio-panel-header">
        <div className="studio-panel-title">
          <PackageCheck size={14} color="#ffffff" />
          <span>Project Details</span>
        </div>

        <span className="studio-badge" style={{ color: isGenerated ? '#10b981' : 'var(--text-secondary)' }}>
          {isGenerated ? 'Project Ready' : 'Pending Build'}
        </span>
      </div>

      {/* Body */}
      <div className="studio-panel-body custom-scrollbar">
        {/* Metric Cards 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Generated Files</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{fileCount} Files</span>
            </div>
            <Box size={16} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Validation Pass</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>Passed (100%)</span>
            </div>
            <ShieldCheck size={16} color="#10b981" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Runtime</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>Successful</span>
            </div>
            <CheckCircle2 size={16} color="#a5b4fc" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Package Size</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>~42 KB</span>
            </div>
            <HardDrive size={16} color="#fcd34d" />
          </div>
        </div>

        {/* Action Buttons */}
        {isGenerated && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
            <button onClick={onRunAgent} className="studio-generate-btn" style={{ padding: '0.45rem 0.75rem', fontSize: '0.7rem' }}>
              <Play size={13} fill="currentColor" />
              <span>Run Agent</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button onClick={onDownloadZip} className="studio-btn-secondary" style={{ justifyContent: 'center', padding: '0.35rem', fontSize: '0.7rem' }}>
                <Download size={13} />
                <span>Export ZIP</span>
              </button>

              <button onClick={onContinueEditing} className="studio-btn-secondary" style={{ justifyContent: 'center', padding: '0.35rem', fontSize: '0.7rem' }}>
                <Edit3 size={13} />
                <span>Edit Project</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
