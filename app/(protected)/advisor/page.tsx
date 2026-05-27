'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { advisorService } from '@/services/advisor';
import { useAuthStore } from '@/store/authStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIAdvisor() {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const studyTopic = searchParams.get('study'); // e.g. ?study=Machine+Learning
  const autoSentRef = useRef(false);    // prevent double auto-send
  const sessionInitRef = useRef(false); // prevent duplicate session creation
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // 1. Fetch all sessions
  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['advisorSessions'],
    queryFn: advisorService.getSessions,
  });

  // 2. Fetch messages for active session
  const { data: activeSession, isLoading: loadingMessages } = useQuery({
    queryKey: ['advisorSession', activeSessionId],
    queryFn: () => advisorService.getSession(activeSessionId!),
    enabled: !!activeSessionId,
  });

  // Auto-select or create session
  const createSessionMutation = useMutation({
    mutationFn: advisorService.startSession,
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['advisorSessions'] });
      setActiveSessionId(newSession.id);
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => advisorService.deleteSession(sessionId),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['advisorSessions'] });
      // If deleted session was active, select another
      if (activeSessionId === deletedId) {
        const remaining = (sessions || []).filter(s => s.id !== deletedId);
        setActiveSessionId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
    }
  });

  useEffect(() => {
    // Guard: only run once, and only when sessions have loaded
    if (!sessions || activeSessionId || sessionInitRef.current) return;
    sessionInitRef.current = true; // lock — never run again for this mount

    if (studyTopic) {
      // Arriving from Skill Gap "Study" button — create a single fresh session
      createSessionMutation.mutate();
    } else if (sessions.length > 0) {
      // Resume the most recent existing session
      setActiveSessionId(sessions[sessions.length - 1].id);
    } else {
      // No sessions at all — create the first one
      createSessionMutation.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]); // ← only re-run when sessions data changes; ref guards against multiple fires

  // 3. Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => advisorService.sendMessage(activeSessionId!, content),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['advisorSession', activeSessionId] });
      const previousSession = queryClient.getQueryData(['advisorSession', activeSessionId]);
      queryClient.setQueryData(['advisorSession', activeSessionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            { id: Date.now().toString(), role: 'user', content: newContent, timestamp: new Date().toISOString() }
          ]
        };
      });
      return { previousSession };
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['advisorSession', activeSessionId], (old: any) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, newMessage] };
      });
    },
    onError: (_err, _newContent, context) => {
      queryClient.setQueryData(['advisorSession', activeSessionId], context?.previousSession);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorSession', activeSessionId] });
    }
  });

  // Auto-send study message once session is ready (after mutation is declared)
  useEffect(() => {
    if (studyTopic && activeSessionId && !autoSentRef.current) {
      autoSentRef.current = true;
      const msg = `I need to learn "${decodeURIComponent(studyTopic)}" to close a skill gap for my target role. Please give me:
1. A brief explanation of what this skill is and why it matters
2. A step-by-step learning roadmap (beginner → job-ready)
3. The top 3 free resources to get started
4. A quick self-assessment question to test my understanding`;
      sendMessageMutation.mutate(msg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyTopic, activeSessionId]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input);
    setInput('');
  };

  const messages = activeSession?.messages || [];
  const isPending = sendMessageMutation.isPending;

  // Auto-scroll to bottom on new messages or while typing
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);


  return (
    <div className="flex h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Chat History Panel */}
      <div className="w-56 flex-shrink-0 flex flex-col border-r" style={{ background: '#0d1627', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Sessions</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingSessions ? (
            <div className="text-xs text-slate-500 px-2">Loading...</div>
          ) : sessions?.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">No past sessions</div>
          ) : (
            sessions?.map(session => (
              <div
                key={session.id}
                className="group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: activeSessionId === session.id ? 'rgba(0,196,204,0.1)' : 'transparent',
                }}
                onClick={() => setActiveSessionId(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate font-medium"
                    style={{ color: activeSessionId === session.id ? '#00c4cc' : '#94a3b8' }}>
                    {session.title && session.title !== 'New Session' ? session.title : 'New Session'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
                    {new Date(session.started_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this session and all its messages?')) {
                      deleteSessionMutation.mutate(session.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/20"
                  style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}
                  title="Delete session"
                >
                  <span className="material-icons" style={{ fontSize: '14px' }}>delete</span>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button 
            onClick={() => createSessionMutation.mutate()}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-colors mb-3"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#f1f5f9' }}
          >
            + New Session
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#00c4cc', color: '#0a0f1e' }}>
              {user?.first_name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#f1f5f9' }}>{user?.first_name} {user?.last_name}</p>
              <p className="text-xs" style={{ color: '#475569' }}>Student Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Main */}
      <div className="flex-1 flex flex-col relative">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,22,39,0.5)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,196,204,0.12)' }}>
                <span className="material-icons" style={{ color: '#00c4cc', fontSize: '17px' }}>smart_toy</span>
              </div>
              <div>
                <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>AI Career Advisor</h1>
                <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Powered by Gemini 2.5 Flash</p>
              </div>
              {isPending && (
                <span className="text-xs ml-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,196,204,0.1)', color: '#00c4cc', fontSize: '0.7rem', fontWeight: 600 }}>
                  ● responding
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && !loadingMessages && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,196,204,0.1)' }}>
                <span className="material-icons" style={{ color: '#00c4cc', fontSize: '32px' }}>smart_toy</span>
              </div>
              <p className="font-medium" style={{ color: '#94a3b8' }}>Hi! I'm your AI career advisor.</p>
              <p className="text-sm mt-1" style={{ color: '#475569' }}>Ask me how to prepare for interviews or what skills you need.</p>
            </div>
          )}
          {messages.map((msg: any, i: number) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fp-in`}>
              {msg.role === 'advisor' && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1" style={{ background: 'rgba(0,196,204,0.2)' }}>
                  <span className="material-icons" style={{ fontSize: '14px', color: '#00c4cc' }}>smart_toy</span>
                </div>
              )}
              <div
                className="max-w-[70%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? '#00c4cc' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#0a0f1e' : '#c8d3e0',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: msg.role === 'advisor' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  whiteSpace: msg.role === 'user' ? 'pre-line' : 'normal',
                }}
              >
                {msg.role === 'advisor' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Headings
                      h1: ({children}) => <h1 style={{fontSize:'1.1em',fontWeight:700,color:'#f1f5f9',marginBottom:'0.5em',marginTop:'0.75em'}}>{children}</h1>,
                      h2: ({children}) => <h2 style={{fontSize:'1em',fontWeight:700,color:'#f1f5f9',marginBottom:'0.4em',marginTop:'0.75em'}}>{children}</h2>,
                      h3: ({children}) => <h3 style={{fontSize:'0.95em',fontWeight:600,color:'#e2e8f0',marginBottom:'0.3em',marginTop:'0.6em'}}>{children}</h3>,
                      // Paragraphs
                      p: ({children}) => <p style={{marginBottom:'0.6em',lineHeight:1.7}}>{children}</p>,
                      // Bold
                      strong: ({children}) => <strong style={{color:'#f1f5f9',fontWeight:600}}>{children}</strong>,
                      // Italic
                      em: ({children}) => <em style={{color:'#a5b4fc'}}>{children}</em>,
                      // Ordered + unordered lists
                      ul: ({children}) => <ul style={{paddingLeft:'1.2em',marginBottom:'0.6em',listStyleType:'disc'}}>{children}</ul>,
                      ol: ({children}) => <ol style={{paddingLeft:'1.2em',marginBottom:'0.6em',listStyleType:'decimal'}}>{children}</ol>,
                      li: ({children}) => <li style={{marginBottom:'0.25em',lineHeight:1.6}}>{children}</li>,
                      // Inline code
                      code: ({children, className}) => {
                        const isBlock = className?.includes('language-');
                        return isBlock
                          ? <code style={{display:'block',background:'rgba(0,0,0,0.3)',padding:'0.75em',borderRadius:'8px',fontSize:'0.85em',color:'#7dd3fc',overflowX:'auto',marginBottom:'0.5em'}}>{children}</code>
                          : <code style={{background:'rgba(0,0,0,0.25)',padding:'0.15em 0.4em',borderRadius:'4px',fontSize:'0.85em',color:'#7dd3fc'}}>{children}</code>;
                      },
                      // Blockquote
                      blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid #00c4cc',paddingLeft:'1em',marginBottom:'0.5em',color:'#94a3b8'}}>{children}</blockquote>,
                      // Horizontal rule
                      hr: () => <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,0.1)',margin:'0.75em 0'}} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* ── Typing indicator ── */}
          {isPending && (
            <div className="flex justify-start animate-fp-in">
              {/* Bot avatar */}
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1"
                style={{ background: 'rgba(0,196,204,0.2)' }}>
                <span className="material-icons" style={{ fontSize: '14px', color: '#00c4cc' }}>smart_toy</span>
              </div>
              {/* Bubble with dots */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '18px 18px 18px 4px',
                  minWidth: '64px',
                }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span className="text-xs pl-1" style={{ color: '#334155' }}>Gemini is writing...</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-center mb-3" style={{ color: '#334155' }}>AI models can make mistakes. Verify critical career advice.</p>
          <form onSubmit={send} className="flex items-center gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your career question..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              disabled={sendMessageMutation.isPending || !activeSessionId}
            />
            <button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !activeSessionId}
              className="p-2.5 rounded-xl transition-all disabled:opacity-50" 
              style={{ background: '#00c4cc', color: '#0a0f1e', border: 'none', cursor: 'pointer' }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
