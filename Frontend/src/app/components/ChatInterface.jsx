import React, { useState, useRef, useEffect } from 'react';
import UserMessage from './UserMessage';
import ArenaResponse from './ArenaResponse';
import axios from "axios";

const api = axios.create({ baseURL: 'https://ai-chat-arena.onrender.com', timeout: 60000 });

function ThinkingIndicator() {
  return (
    <div className="mt-5 flex min-h-16 items-center gap-3 rounded-2xl rounded-tl-sm border border-blue-100 bg-blue-50 px-5 py-4 text-blue-900 shadow-sm" role="status" aria-live="polite">
      <span className="flex gap-1" aria-hidden="true">
        <span className="thinking-dot h-2 w-2 rounded-full bg-blue-600" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-blue-600" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-blue-600" />
      </span>
      <span className="font-medium">Thinking<span className="sr-only">, please wait</span>…</span>
    </div>
  );
}

export default function ChatInterface() {
  const [ messages, setMessages ] = useState([]);
  const [ inputValue, setInputValue ] = useState('');
  const [ isSending, setIsSending ] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ messages, isSending ]);

  const handleSend = async (e) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (!message || isSending) return;

    const id = Date.now();
    setIsSending(true);
    setMessages((current) => [...current, { id, problem: message, status: 'pending' }]);

    try {
      const { data } = await api.post('/invoke', { input: message });
      if (!data?.success || !data?.result) throw new Error(data?.error?.message || 'The arena could not create a response.');

      setMessages((current) => current.map((item) => (
        item.id === id ? { ...item, status: 'complete', ...data.result } : item
      )));
      setInputValue('');
    } catch (error) {
      const message = error.code === 'ECONNABORTED'
        ? 'The request took too long. Please try again.'
        : error.response?.data?.error?.message || 'We couldn’t reach the arena. Check your connection and try again.';
      setMessages((current) => current.map((item) => (
        item.id === id ? { ...item, status: 'error', error: message } : item
      )));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 font-sans text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-bold text-white" aria-hidden="true">AI</span>
          <div><h1 className="text-lg font-semibold tracking-tight">AI Chat Arena</h1><p className="text-xs text-zinc-500">Compare answers, then choose the best approach.</p></div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <h2 className="text-2xl font-light mb-2 text-zinc-600 dark:text-zinc-300">Welcome to the Arena</h2>
              <p>Type a problem below to see two AI solutions go head-to-head.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-8 md:mb-12">
              <UserMessage message={msg.problem} />
              {msg.status === 'pending' && <ThinkingIndicator />}
              {msg.status === 'error' && <div className="mt-5 rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-5 py-4 text-red-900" role="alert"><p className="font-semibold">Something went wrong</p><p className="mt-1 text-sm">{msg.error}</p></div>}
              {msg.status === 'complete' && <ArenaResponse
                solution1={msg.solution_1}
                solution2={msg.solution_2}
                judge={msg.judge}
              />}
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </main>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-stretch gap-2 sm:gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a coding question..."
              aria-label="Coding question"
              disabled={isSending}
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 sm:px-5 sm:py-4"
            />
            <button
              type="submit"
              className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:px-5 sm:py-4"
              disabled={isSending || !inputValue.trim()}
              aria-busy={isSending}
            >
              {isSending ? 'Thinking…' : <><span>Send</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
