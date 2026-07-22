import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Layers, Code2, ShieldCheck, Check, Loader2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function PipelineExecutionView({ stage = 1, logs = [], prompt = '' }) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const logContainerRef = useRef(null);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll logs to bottom whenever logs array updates
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const formatTime = (ms) => {
    const totalSec = (ms / 1000).toFixed(1);
    return `${totalSec}s`;
  };

  const stagesData = [
    {
      id: 1,
      title: 'Requirement & Spec Extractor',
      badge: 'Specification JSON',
      icon: Cpu,
      details: 'Parsing conversation requirements into structured AST schema...'
    },
    {
      id: 2,
      title: 'Topological Architecture Planner',
      badge: "Kahn's DAG + Contracts",
      icon: Layers,
      details: 'Generating explicit module interface contracts & computing dependency topological sort order...'
    },
    {
      id: 3,
      title: 'Contract-Driven Code Generator',
      badge: 'Sequential Generator',
      icon: Code2,
      details: 'Synthesizing codebase module-by-module using clean interface contract summaries...'
    },
    {
      id: 4,
      title: 'Sandbox Execution & Quality Gate',
      badge: 'AST Symbol Table & compileall',
      icon: ShieldCheck,
      details: 'Building temporary workspace, running AST symbol checks, compileall, and entrypoint tests...'
    }
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        zIndex: 10,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}
      >
        {/* Top Header - Vercel/Linear Dialog Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid #18181b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: '#18181b',
                border: '1px solid #27272a',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#a1a1aa'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              COMPILER PIPELINE
            </div>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 500 }}>
              Phase {stage} of 4
            </span>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#71717a',
              background: '#18181b',
              border: '1px solid #27272a',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px'
            }}
          >
            {formatTime(elapsedMs)}
          </div>
        </div>

        {/* Vertical Step Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', gap: '0.85rem' }}>
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: 'absolute',
              left: '9px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: '#18181b',
              zIndex: 0
            }}
          />

          {stagesData.map((stg) => {
            const isDone = stage > stg.id;
            const isCurrent = stage === stg.id;

            return (
              <div
                key={stg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Step Indicator Circle */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isDone ? '#10b9811f' : isCurrent ? '#ffffff' : '#09090b',
                    border: isDone
                      ? '1px solid #10b98155'
                      : isCurrent
                      ? '1px solid #ffffff'
                      : '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                    boxShadow: isCurrent ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isDone ? (
                    <Check size={11} color="#10b981" />
                  ) : isCurrent ? (
                    <Loader2 size={12} className="fa-spin" color="#000000" style={{ transformOrigin: 'center' }} />
                  ) : (
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3f3f46' }} />
                  )}
                </div>

                {/* Step Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: isCurrent ? 600 : 500,
                        color: isCurrent ? '#f4f4f5' : isDone ? '#a1a1aa' : '#52525b'
                      }}
                    >
                      {stg.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: isCurrent ? '#a1a1aa' : '#3f3f46',
                        background: '#18181b',
                        border: '1px solid #27272a',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}
                    >
                      {stg.badge}
                    </span>
                  </div>

                  {isCurrent && (
                    <div style={{ fontSize: '0.74rem', color: '#71717a', lineHeight: 1.45, marginTop: '0.1rem' }}>
                      {stg.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Telemetry Log Stream */}
        <div
          style={{
            background: '#000000',
            border: '1px solid #18181b',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.7rem',
            color: '#a1a1aa',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Console Header Bar with Toggle */}
          <div
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              paddingBottom: isConsoleExpanded ? '0.4rem' : '0',
              borderBottom: isConsoleExpanded ? '1px solid #18181b' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#71717a', fontSize: '0.65rem', letterSpacing: '0.05em', fontWeight: 600 }}>
              <Terminal size={12} color="#71717a" />
              <span>TELEMETRY STREAM</span>
              <span style={{ color: '#10b981', marginLeft: '0.3rem', fontSize: '0.62rem' }}>● LIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#52525b' }}>
                {(logs || []).length} events
              </span>
              {isConsoleExpanded ? <ChevronUp size={13} color="#71717a" /> : <ChevronDown size={13} color="#71717a" />}
            </div>
          </div>

          {/* Expandable Scrollable Log Feed */}
          {isConsoleExpanded && (
            <div
              ref={logContainerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                maxHeight: '110px',
                overflowY: 'auto',
                paddingRight: '0.2rem'
              }}
            >
              {(logs || []).length === 0 ? (
                <div style={{ color: '#52525b', fontStyle: 'italic' }}>$ initializing telemetry log stream...</div>
              ) : (
                (logs || []).map((l, idx) => {
                  const logText = typeof l === 'string' ? l : l.text || l.log || JSON.stringify(l);
                  const isSuccess = l.status === 'success' || logText.includes('[OK]') || logText.includes('SUCCESS');
                  const isErr = l.status === 'error' || logText.includes('[ERR]') || logText.includes('ERROR');

                  return (
                    <div
                      key={idx}
                      style={{
                        color: isSuccess ? '#10b981' : isErr ? '#ef4444' : '#a1a1aa',
                        lineHeight: 1.45,
                        wordBreak: 'break-word'
                      }}
                    >
                      <span style={{ color: '#3f3f46', marginRight: '0.4rem' }}>$</span>
                      {logText}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
