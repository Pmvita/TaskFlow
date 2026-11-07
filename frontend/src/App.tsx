import { useState, useEffect } from 'react';
import { TaskItem } from './components/TaskItem';
import type { Task } from './types';

const API = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('tf_token'));
  const [bootstrapping, setBootstrapping] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error('Failed to load tasks');
      setTasks(await r.json());
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }
  useEffect(() => {
    (async () => {
      if (token) await load();
      setBootstrapping(false);
    })();
  }, [token]);

  async function auth(path: string) {
    setAuthError(''); setAuthLoading(true);
    if (!email || !password) { setAuthError('Email and password required'); setAuthLoading(false); return; }
    try {
      const r = await fetch(`${API}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Auth failed');
      localStorage.setItem('tf_token', d.token); setToken(d.token);
    } catch (e: any) { setAuthError(e.message); }
    setAuthLoading(false);
  }

  async function addTask() {
    if (!title.trim()) return;
    await fetch(`${API}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, description: description || undefined, priority, due_date: dueDate || undefined }) });
    setTitle(''); setDescription(''); setDueDate(''); load();
  }
  async function toggle(t: Task) {
    await fetch(`${API}/api/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: t.status === 'done' ? 'todo' : 'done' }) });
    load();
  }
  async function remove(id: string) {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  }
  async function saveEdit() {
    if (!editing) return;
    await fetch(`${API}/api/tasks/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: editing.title, description: editing.description, priority: editing.priority, due_date: editing.due_date, status: editing.status }) });
    setEditing(null); load();
  }
  function signOut() { localStorage.removeItem('tf_token'); setToken(null); setTasks([]); }

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);
  const done = tasks.filter(t => t.status === 'done').length;

  if (bootstrapping && token) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-400">Loading…</div>;
  }

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
              {authError && <p className="text-rose-400 text-sm">{authError}</p>}
              <div className="flex gap-3">
                <button disabled={authLoading} onClick={() => auth('login')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3 font-semibold transition shadow-lg shadow-indigo-600/20">Sign in</button>
                <button disabled={authLoading} onClick={() => auth('register')} className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl py-3 font-semibold transition">Create account</button>
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
            <button onClick={signOut} className="text-sm text-zinc-400 hover:text-white transition">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-6 shadow-xl space-y-3">
          <input className="w-full bg-transparent outline-none placeholder-zinc-500" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="w-full bg-transparent outline-none placeholder-zinc-500 text-sm" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="flex gap-3 items-center">
            <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button onClick={addTask} className="ml-auto bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 py-2 font-semibold transition shadow-lg shadow-indigo-600/20">Add</button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {['all','todo','done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-zinc-800/60 text-zinc-400 hover:text-white'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
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
              <TaskItem key={t.id} task={t} onToggle={toggle} onDelete={remove} onEdit={setEditing} />
            ))}
          </ul>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-20">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-bold text-lg">Edit task</h2>
            <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <textarea className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3" rows={3} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <div className="flex gap-3">
              <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={editing.priority} onChange={e => setEditing({ ...editing, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                <option value="todo">Todo</option><option value="in_progress">In progress</option><option value="done">Done</option>
              </select>
              <input type="date" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" value={editing.due_date || ''} onChange={e => setEditing({ ...editing, due_date: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
