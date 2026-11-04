import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';

type Task = { id: string; title: string; description?: string; status: string; priority: string; due_date?: string };

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('tf_token'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    const r = await fetch(`${API}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setTasks(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, [token]);

  async function auth(path: string) {
    const r = await fetch(`${API}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    if (d.token) { localStorage.setItem('tf_token', d.token); setToken(d.token); }
  }
  async function addTask() {
    if (!title.trim()) return;
    await fetch(`${API}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, priority }) });
    setTitle(''); load();
  }
  async function toggle(t: Task) {
    await fetch(`${API}/api/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: t.status === 'done' ? 'todo' : 'done' }) });
    load();
  }
  async function remove(id: string) {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);
  const done = tasks.filter(t => t.status === 'done').length;
  const prioColor: any = { low: 'bg-emerald-500/15 text-emerald-400', medium: 'bg-amber-500/15 text-amber-400', high: 'bg-rose-500/15 text-rose-400' };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TaskFlow</h1>
            <p className="text-zinc-400 mt-1">Ship faster. Stay organized.</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4">
              <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => auth('login')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold transition shadow-lg shadow-indigo-600/20">Sign in</button>
                <button onClick={() => auth('register')} className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl py-3 font-semibold transition">Create account</button>
              </div>
            </div>
          </div>
          <p className="text-center text-zinc-600 text-sm mt-6">Free tier · AWS · Open source</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/60 backdrop-blur sticky top-0 z-10 bg-zinc-950/70">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <span className="font-bold text-lg">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{done}/{tasks.length} done</span>
            <button onClick={() => { localStorage.removeItem('tf_token'); setToken(null); }} className="text-sm text-zinc-400 hover:text-white transition">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-6 flex gap-3 items-center shadow-xl">
          <input className="flex-1 bg-transparent outline-none placeholder-zinc-500" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
          <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 py-2 font-semibold transition shadow-lg shadow-indigo-600/20">Add</button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all','todo','done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-zinc-800/60 text-zinc-400 hover:text-white'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-12">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">✨</div>
            <p className="text-zinc-400">No tasks here. Add one above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(t => (
              <li key={t.id} className="group bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition">
                <button onClick={() => toggle(t)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${t.status === 'done' ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-600 hover:border-indigo-500'}`}>
                  {t.status === 'done' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${t.status === 'done' ? 'line-through text-zinc-500' : ''}`}>{t.title}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioColor[t.priority]}`}>{t.priority}</span>
                <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
