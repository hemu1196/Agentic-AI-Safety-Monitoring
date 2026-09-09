import React, { useState, Suspense } from 'react';
import { MessageSquare, X } from 'lucide-react';

const ChatWindow = React.lazy(() => import('./ChatWindow'));

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-40 select-none flex flex-col items-end">
            {isOpen && (
                <Suspense fallback={
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-80 h-96 mb-3 flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
                    </div>
                }>
                    <ChatWindow onClose={() => setIsOpen(false)} />
                </Suspense>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-100 cursor-pointer"
                aria-label="Toggle Assistant"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
