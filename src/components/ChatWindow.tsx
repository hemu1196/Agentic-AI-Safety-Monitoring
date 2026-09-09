import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Upload, ShieldCheck, ShieldAlert, Sparkles, RefreshCw, X, AlertTriangle, CheckSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    type?: 'text' | 'photo_upload' | 'ai_diagnostic';
    timestamp: string;
    diagnosticResult?: {
        imageName: string;
        isCompliant: boolean;
        items: { name: string; status: 'PASS' | 'FAIL' }[];
    };
}

interface ChatWindowProps {
    onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Hello ${user?.name || 'there'}! I am your Site Sentinel AI safety assistant. You can ask me safety status questions, or upload a photo to simulate a real-time YOLO compliance scan.`,
            type: 'text',
            timestamp: 'Just now'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            sender: 'user',
            text,
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            let reply = '';
            const textLower = text.toLowerCase();

            if (textLower.includes('ppe') || textLower.includes('helmet') || textLower.includes('safety')) {
                reply = 'According to current telemetry, safety compliance scores in Zone A and Zone B stand at 94%. Check the Safety Monitoring logs for active alerts.';
            } else if (textLower.includes('weather') || textLower.includes('rain')) {
                reply = 'The physical sensor node reports light clouds, temperature 32.4°C. Conditions are safe for high-elevation works.';
            } else if (textLower.includes('hello') || textLower.includes('hi')) {
                reply = `Hi! How can I assist you with site telemetry or worker access status monitoring?`;
            } else {
                reply = 'I have parsed our database logs regarding your request. You can also press "Inspect Photo" below to simulate an automated visual audit.';
            }

            setMessages(prev => [...prev, {
                id: `b-${Date.now()}`,
                sender: 'bot',
                text: reply,
                type: 'text',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 1000);
    };

    const handleSimulateUpload = () => {
        setUploadingImage(true);
        setTimeout(() => {
            const isCompliantResult = Math.random() > 0.45;
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const userPhotoMsg: Message = {
                id: `u-img-${Date.now()}`,
                sender: 'user',
                text: 'Uploaded target photo: site_worker_entry_cam_2.jpg',
                type: 'photo_upload',
                timestamp
            };

            const botResultMsg: Message = {
                id: `b-diag-${Date.now()}`,
                sender: 'bot',
                text: isCompliantResult
                    ? 'Scan completed: All mandatory safety items detected.'
                    : 'Scan completed: PPE deviation detected! Worker is missing required safety items.',
                type: 'ai_diagnostic',
                timestamp,
                diagnosticResult: {
                    imageName: 'site_worker_entry_cam_2.jpg',
                    isCompliant: isCompliantResult,
                    items: [
                        { name: 'Hard Hat / Helmet', status: 'PASS' },
                        { name: 'Reflective Safety Vest', status: 'PASS' },
                        { name: 'Steel Toe Safety Shoes', status: isCompliantResult ? 'PASS' : 'FAIL' },
                        { name: 'Eye Protection Goggles', status: 'PASS' }
                    ]
                }
            };

            setMessages(prev => [...prev, userPhotoMsg]);

            setTimeout(() => {
                setMessages(prev => [...prev, botResultMsg]);
                setUploadingImage(false);
            }, 800);
        }, 1200);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-2xl w-80 sm:w-85 h-100 mb-3 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-orange-500 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <div>
                        <h4 className="text-xs font-bold font-sans uppercase tracking-wider">Sentinel AI Agent</h4>
                        <p className="text-[9px] opacity-90 font-mono">VISION CORRELATION ENGINE ACTIVE</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:text-slate-100 font-extrabold text-[10px] uppercase cursor-pointer bg-orange-600 px-2 py-0.5 rounded"
                >
                    Hide
                </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] font-bold text-slate-400 px-1.5 mb-0.5">{m.timestamp}</span>

                        {m.type === 'photo_upload' && (
                            <div className="p-3 bg-slate-950 text-white border border-slate-850 rounded-xl rounded-tr-none max-w-[85%] text-xs font-mono">
                                <div className="flex items-center gap-2 mb-1.5 text-orange-500 font-sans font-bold text-[10px]">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>PHOTO INGESTION TARGET</span>
                                </div>
                                <span className="opacity-95">{m.text}</span>
                            </div>
                        )}

                        {m.type === 'ai_diagnostic' && m.diagnosticResult && (
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl rounded-tl-none max-w-[90%] text-xs space-y-3 font-semibold">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-850 pb-1.5">
                                    <span className="font-mono text-[9px] text-slate-400 uppercase">YOLOv8 segmenter</span>
                                    <span className={`inline-flex items-center text-[8px] font-black px-1 rounded ${m.diagnosticResult.isCompliant
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                            : 'bg-red-50 text-red-600 dark:bg-red-955/20 text-red-500'
                                        }`}>
                                        {m.diagnosticResult.isCompliant ? 'COMPLIANT' : 'HAZARD DELTA'}
                                    </span>
                                </div>

                                <div className="space-y-1.5 font-mono text-[10px]">
                                    {m.diagnosticResult.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                            <span>{item.name}</span>
                                            <span className={`font-black ${item.status === 'PASS' ? 'text-emerald-600' : 'text-red-500 animate-pulse'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal border-t border-slate-205 dark:border-slate-850 pt-1.5 italic font-sans font-medium">
                                    {m.text}
                                </p>
                            </div>
                        )}

                        {(!m.type || m.type === 'text') && (
                            <div className={`p-2.5 rounded-xl text-xs font-semibold max-w-[85%] leading-relaxed ${m.sender === 'user'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none'
                                : 'bg-orange-50 dark:bg-orange-950/20 text-slate-700 dark:text-slate-350 rounded-tl-none border border-orange-100/50 dark:border-orange-900/25'
                                }`}>
                                {m.text}
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-1 items-center bg-slate-50 dark:bg-slate-955 px-3 py-2 rounded-xl rounded-tl-none border border-slate-150 dark:border-slate-850 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-405 bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
                <div ref={messageEndRef} />
            </div>

            {/* Image Upload Assistant Bar */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border-t border-slate-150 dark:border-slate-850 flex justify-between items-center text-[10px] font-bold text-slate-500 font-sans">
                <span className="uppercase tracking-wider text-slate-400 font-extrabold text-[8px]">PPE INGESTION AGENT</span>
                <button
                    onClick={handleSimulateUpload}
                    disabled={uploadingImage}
                    className="flex items-center gap-1.5 text-orange-500 hover:text-orange-650 transition uppercase cursor-pointer"
                >
                    {uploadingImage ? (
                        <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>PROCESSING...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-3.5 h-3.5 animate-pulse" />
                            <span>INSPECT PHOTO</span>
                        </>
                    )}
                </button>
            </div>

            {/* Input Form */}
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleSend(input);
                }}
                className="p-3 border-t border-slate-150 dark:border-slate-850 flex gap-2 bg-white dark:bg-slate-900"
            >
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask Sentinel AI..."
                    className="flex-1 px-3.5 py-1.5 border border-slate-205 dark:border-slate-805 dark:border-slate-700/80 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                    type="submit"
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                    <Send className="w-3.5 h-3.5" />
                </button>
            </form>
        </div>
    );
}
