import React, { useState } from 'react';
import { FileText, Folder, FolderOpen, CheckCircle, Code, Settings, Cpu, ChevronRight, ChevronDown } from 'lucide-react';

export default function FileExplorer({ files, selectedFile, onSelectFile, isBuilding, creatingFiles, projectName }) {
  const fileList = Object.keys(files || {});
  const folderName = projectName ? (projectName.endsWith('-agent') || projectName.endsWith('/') ? projectName : `${projectName}/`) : 'traveling-agent/';

  const [openFolders, setOpenFolders] = useState({ 'src': true, 'src/core': true, 'src/domain': true });

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getIcon = (filename) => {
    if (filename.endsWith('.py')) return <Code size={13} color="#10b981" />;
    if (filename.endsWith('.json')) return <Settings size={13} color="#f59e0b" />;
    if (filename.endsWith('.md')) return <FileText size={13} color="#60a5fa" />;
    if (filename.endsWith('.txt')) return <FileText size={13} color="#94a3b8" />;
    return <FileText size={13} color="#94a3b8" />;
  };

  // Build nested tree structure from flat file keys
  const buildTree = (paths) => {
    const root = {};
    paths.forEach((path) => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          current[part] = { _type: 'file', fullPath: path };
        } else {
          if (!current[part]) {
            current[part] = { _type: 'folder', _fullPath: parts.slice(0, idx + 1).join('/'), _children: {} };
          }
          current = current[part]._children;
        }
      });
    });
    return root;
  };

  const renderTree = (node, depth = 0) => {
    return Object.entries(node).map(([name, item]) => {
      if (item._type === 'folder') {
        const folderPath = item._fullPath;
        const isOpen = openFolders[folderPath] !== false; // default open
        return (
          <div key={folderPath} style={{ marginLeft: `${depth * 10}px` }}>
            <div
              onClick={() => toggleFolder(folderPath)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.4rem',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary, #cbd5e1)',
                userSelect: 'none'
              }}
              className="folder-item-header hover:bg-slate-800/50"
            >
              {isOpen ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronRight size={12} color="#94a3b8" />}
              {isOpen ? <FolderOpen size={13} color="#f59e0b" /> : <Folder size={13} color="#f59e0b" />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            </div>
            {isOpen && renderTree(item._children, depth + 1)}
          </div>
        );
      } else {
        const fullPath = item.fullPath;
        const isSelected = selectedFile === fullPath;
        const isCreated = creatingFiles ? creatingFiles.includes(fullPath) : true;
        const displayName = name;

        return (
          <div key={fullPath} style={{ marginLeft: `${depth * 10}px` }}>
            <button
              onClick={() => onSelectFile(fullPath)}
              className={`file-item ${isSelected ? 'selected' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.2rem 0.4rem',
                fontSize: '0.75rem',
                textAlign: 'left',
                background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: '4px',
                margin: '1px 0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getIcon(fullPath)}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#ffffff' : 'var(--text-secondary, #cbd5e1)' }}>
                  {displayName}
                </span>
              </div>

              {isCreated ? (
                <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0 }} />
              ) : (
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              )}
            </button>
          </div>
        );
      }
    });
  };

  const treeData = buildTree(fileList);

  return (
    <div className="studio-panel">
      <div className="studio-panel-header">
        <div className="studio-panel-title">
          <Folder size={14} color="#ffffff" />
          <span>Project Explorer</span>
        </div>
        <span className="studio-badge">{fileList.length} Files</span>
      </div>

      <div className="studio-panel-body custom-scrollbar" style={{ padding: '0.5rem' }}>
        {fileList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Cpu size={28} color="#475569" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No project generated yet</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Complete the AI Engineer questionnaire to generate files.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
              <FolderOpen size={14} color="#f59e0b" />
              <span>{folderName.endsWith('/') ? folderName : `${folderName}/`}</span>
            </div>

            {renderTree(treeData)}
          </div>
        )}
      </div>
    </div>
  );
}
