import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Play } from 'lucide-react';

export default function CodeEditorPanel({ selectedFile, fileContent, onContentChange, onRunCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguage = (fname) => {
    if (!fname) return 'TEXT';
    if (fname.endsWith('.py')) return 'PYTHON';
    if (fname.endsWith('.json')) return 'JSON';
    if (fname.endsWith('.md')) return 'MARKDOWN';
    if (fname.endsWith('.txt')) return 'REQUIREMENTS';
    return 'CODE';
  };

  const lines = (fileContent || '').split('\n');

  return (
    <div className="studio-panel">
      {/* Header */}
      <div className="studio-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(3, 7, 18, 0.9)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            <FileCode size={14} color="#ffffff" />
            <span>{selectedFile || 'select_file.py'}</span>
          </div>
          <span className="studio-badge">{getLanguage(selectedFile)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {selectedFile?.endsWith('.py') && onRunCode && (
            <button onClick={() => onRunCode(fileContent)} className="studio-btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem' }}>
              <Play size={12} fill="currentColor" />
              <span>Run File</span>
            </button>
          )}

          <button onClick={handleCopy} className="studio-btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem' }}>
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} color="#94a3b8" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ flex: 1, display: 'flex', background: 'rgba(3, 7, 18, 0.95)', overflow: 'hidden' }}>
        {!selectedFile ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <Code2 size={32} color="#334155" style={{ marginBottom: '0.5rem' }} />
            <p>Select a file from Explorer to inspect or edit code.</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Line numbers column */}
            <div style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#475569', background: 'rgba(2, 6, 23, 0.8)', borderRight: '1px solid var(--border-subtle)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', lineHeight: '1.6', userSelect: 'none' }}>
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Code Area */}
            <div style={{ flex: 1, padding: '0.65rem', overflow: 'auto' }}>
              <textarea
                value={fileContent || ''}
                onChange={(e) => onContentChange && onContentChange(selectedFile, e.target.value)}
                className="editor-textarea custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div style={{ padding: '0.3rem 0.75rem', background: 'rgba(2, 6, 23, 0.9)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>Lines: {lines.length}</span>
          <span>Encoding: UTF-8</span>
          <span>Mode: Monaco Editor</span>
        </div>
        <span style={{ color: '#10b981' }}>● Ready</span>
      </div>
    </div>
  );
}
