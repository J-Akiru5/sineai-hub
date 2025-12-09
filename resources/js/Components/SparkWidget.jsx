import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function SparkWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMessage = { sender: 'user', text: trimmed };
        setMessages((m) => [...m, userMessage]);
        setInput('');
        setIsThinking(true);

        try {
            const resp = await axios.post(route('ai.guest-chat'), { prompt: trimmed });
            const aiText = resp.data.response ?? resp.data.reply ?? "I'm having trouble connecting right now.";
            const aiMessage = { sender: 'ai', text: aiText };
            setMessages((m) => [...m, aiMessage]);
        } catch (err) {
            const errMsg = 'Sorry, Spark is unavailable right now.';
            setMessages((m) => [...m, { sender: 'ai', text: errMsg }]);
            console.error('SparkWidget error', err);
        } finally {
            setIsThinking(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Trigger button (fixed bottom-right) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    type="button"
                    aria-label="Open Spark assistant"
                    title="Spark Assistant"
                    onClick={() => setIsOpen((s) => !s)}
                    className="relative h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 ring-2 ring-amber-300/50 shadow-lg shadow-amber-900/40 transform transition-transform hover:scale-110 focus:outline-none"
                >
                    <img
                        src="/images/spark-head.png"
                        alt="Spark"
                        className="w-10 h-10 object-cover rounded-full m-auto mt-2 animate-pulse"
                    />

                    <span className="absolute top-0 right-0 -mt-1 -mr-1">
                        <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-500 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                    </span>
                </button>
            </div>

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-50">
                    <div className="w-80 h-96 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-amber-500/10">
                            <div className="text-amber-200 font-semibold">Spark Assistant</div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-300 hover:text-white focus:outline-none"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 px-3 py-2 overflow-auto space-y-3" style={{ maxHeight: 'calc(100% - 110px)' }}>
                            {messages.length === 0 && (
                                <div className="text-slate-400 text-sm">Say hello to Spark — ask for brainstorming help, beats, or story ideas.</div>
                            )}

                            {messages.map((m, idx) => (
                                <div key={idx} className={m.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                                    <div className={
                                        (m.sender === 'user'
                                            ? 'bg-slate-700 text-slate-100 rounded-lg px-3 py-2 max-w-[75%]'
                                            : 'bg-amber-600 text-slate-900 rounded-lg px-3 py-2 max-w-[75%]')
                                    }>
                                        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                                    </div>
                                </div>
                            ))}

                            {isThinking && (
                                <div className="text-slate-400 text-sm">Spark is thinking…</div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="px-3 py-2 border-t border-amber-500/10">
                            <div className="flex items-center gap-2">
                                <textarea
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Ask Spark something..."
                                    className="flex-1 resize-none rounded-xl px-3 py-2 bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isThinking || input.trim() === ''}
                                    className="inline-flex items-center px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
