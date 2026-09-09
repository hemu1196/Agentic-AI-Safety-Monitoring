import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../hooks/useProject';
import { mockAgentReplies, defaultAgentGreeting, ChatMessage } from '../data/mockData';
import {
  Sparkles,
  Bot,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  Eye,
  Calendar,
  Layers,
  Wrench,
  Search,
  MessageSquare
} from 'lucide-react';

interface PipelineStep {
  number: number;
  label: string;
  desc: string;
  status: 'pending' | 'active' | 'completed';
}

interface TaskItem {
  id: number;
  label: string;
  cmd: string;
  duration: string;
  status: 'pending' | 'running' | 'completed';
}

export const AgenticAI: React.FC = () => {
  const { projectData } = useProject();
  const [pipelineState, setPipelineState] = useState<PipelineStep[]>([
    { number: 1, label: 'User Goal', desc: 'Identify structural constraints & hazards', status: 'pending' },
    { number: 2, label: 'AI Analysis', desc: 'Parsing telemetry & video feeds', status: 'pending' },
    { number: 3, label: 'Planning', desc: 'Building dynamic scheduling offsets', status: 'pending' },
    { number: 4, label: 'Tools', desc: 'Querying databases & vision feeds', status: 'pending' },
    { number: 5, label: 'Decision', desc: 'Evaluating scheduling trade-offs', status: 'pending' },
    { number: 6, label: 'Action', desc: 'Deploying mitigation instructions', status: 'pending' },
    { number: 7, label: 'Result', desc: 'Generating PDF reports & alerts', status: 'pending' },
  ]);

  const [taskList, setTaskList] = useState<TaskItem[]>([
    { id: 1, label: "Analyze today's safety events", cmd: "events.query()", duration: "0.4s", status: 'pending' },
    { id: 2, label: "Check PPE compliance", cmd: "vision.analyze()", duration: "1.2s", status: 'pending' },
    { id: 3, label: "Evaluate project schedule", cmd: "schedule.predict()", duration: "0.8s", status: 'pending' },
    { id: 4, label: "Generate mitigation actions", cmd: "agent.plan()", duration: "1.0s", status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'g-1', sender: 'agent', text: defaultAgentGreeting, timestamp: '20:15' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Suggestions
  const suggestions = [
    "How many safety violations happened today?",
    "What is causing the current project risk?",
    "Which equipment needs maintenance?",
    "Will the project be delayed?",
    "Generate today's safety report."
  ];

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Run Workflow Animation
  const runWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset pipeline & tasks
    setPipelineState(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setTaskList(prev => prev.map(t => ({ ...t, status: 'pending' })));

    let step = 0;
    const interval = setInterval(() => {
      if (step >= 7) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      setPipelineState(prev =>
        prev.map((s, idx) => {
          if (idx === step) return { ...s, status: 'active' };
          if (idx < step) return { ...s, status: 'completed' };
          return s;
        })
      );

      // Trigger Task items at relevant points
      if (step === 1) {
        setTaskList(prev => prev.map((t, idx) => (idx === 0 ? { ...t, status: 'running' } : t)));
      } else if (step === 2) {
        setTaskList(prev =>
          prev.map((t, idx) => {
            if (idx === 0) return { ...t, status: 'completed' };
            if (idx === 1) return { ...t, status: 'running' };
            return t;
          })
        );
      } else if (step === 4) {
        setTaskList(prev =>
          prev.map((t, idx) => {
            if (idx === 1) return { ...t, status: 'completed' };
            if (idx === 2) return { ...t, status: 'running' };
            return t;
          })
        );
      } else if (step === 5) {
        setTaskList(prev =>
          prev.map((t, idx) => {
            if (idx === 2) return { ...t, status: 'completed' };
            if (idx === 3) return { ...t, status: 'running' };
            return t;
          })
        );
      } else if (step === 6) {
        setTaskList(prev => prev.map((t, idx) => (idx === 3 ? { ...t, status: 'completed' } : t)));
      }

      step++;
    }, 1000);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Reply simulation
    setTimeout(() => {
      const lowerQuery = textToSend.toLowerCase().trim();
      let replyText = '';

      // Check predefined replies
      if (mockAgentReplies[lowerQuery]) {
        replyText = mockAgentReplies[lowerQuery];
      } else {
        // Smart matching logic
        if (lowerQuery.includes('violation') || lowerQuery.includes('ppe') || lowerQuery.includes('helmet')) {
          replyText = mockAgentReplies["how many safety violations happened today?"];
        } else if (lowerQuery.includes('risk') || lowerQuery.includes('hazard')) {
          replyText = mockAgentReplies["what is causing the current project risk?"];
        } else if (lowerQuery.includes('equipment') || lowerQuery.includes('crane') || lowerQuery.includes('maintenance')) {
          replyText = mockAgentReplies["which equipment needs maintenance?"];
        } else if (lowerQuery.includes('delay') || lowerQuery.includes('schedule') || lowerQuery.includes('behind')) {
          replyText = mockAgentReplies["will the project be delayed?"];
        } else if (lowerQuery.includes('report') || lowerQuery.includes('summary')) {
          replyText = mockAgentReplies["generate today's safety report."];
        } else {
          replyText = `I have analyzed the current coordinates of ${projectData.name}. The safety rating is stable at ${projectData.safetyScore}% and risk factor remains ${projectData.riskLevel}. Let me know if you would like me to compile a specific compliance breakdown or coordinate maintenance options.`;
        }
      }

      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const getStepIconClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 border-emerald-500 text-white';
      case 'active':
        return 'bg-orange-500 border-orange-500 text-white animate-pulse';
      default:
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-orange-950/20 text-[9px] font-bold text-slate-100 dark:text-orange-400 w-fit border border-slate-800 dark:border-orange-900/50 uppercase tracking-widest mb-1.5">
            Autonomous Operations
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Agentic AI Control Center
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            A simulated agent loop across perception, reasoning, planning and action.
          </p>
        </div>
        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 duration-150 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run agent workflow</span>
        </button>
      </div>

      {/* Agentic Pipeline Diagram */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Agentic Reasoning Loop</h3>
        
        {/* Horizontal Pipeline Steps */}
        <div className="min-w-[800px] flex items-center justify-between relative py-4">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-700 -translate-y-6 z-0" />
          
          {pipelineState.map((s, idx) => (
            <div key={s.number} className="flex flex-col items-center text-center z-10 w-28 relative">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${getStepIconClass(s.status)}`}>
                {s.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{s.number}</span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5 leading-tight">{s.label}</p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 max-w-[100px] leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Task Execution Panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Live Task Execution</h3>
            <p className="text-xs font-semibold text-slate-400 mb-5">Subagent logs and command processes</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {taskList.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                  task.status === 'running'
                    ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/10 dark:border-orange-900/50'
                    : task.status === 'completed'
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700/50'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-60'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.label}</p>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{task.cmd}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">{task.duration}</span>
                  {task.status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  ) : task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[10px] text-slate-400 font-semibold text-center uppercase tracking-wider">
            {isRunning ? '● Inference running in browser sandboxed runtime' : 'Inference pipeline idle'}
          </div>
        </div>

        {/* Ask The Agent (AI Chat) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 flex flex-col h-[400px]">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Ask the Agent</h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-orange-500 text-white shadow-sm'
                }`}>
                  {msg.sender === 'user' ? 'SA' : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-xl text-xs font-semibold leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tr-none'
                    : 'bg-orange-50/50 dark:bg-orange-950/20 text-slate-700 dark:text-slate-300 rounded-tl-none border border-orange-100/50 dark:border-orange-900/30'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7.5 h-7.5 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl rounded-tl-none border border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Preset suggestions */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none select-none">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className="shrink-0 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask the Agent a question about schedule, safety, or logs..."
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95 duration-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
