import type { Task } from '../types';

export const prioColor: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-rose-500/15 text-rose-400',
};

export function TaskItem({ task, onToggle, onDelete, onEdit }: { task: Task; onToggle: (t: Task) => void; onDelete: (id: string) => void; onEdit: (t: Task) => void }) {
  return (
    <li className="group bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition">
      <button onClick={() => onToggle(task)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.status === 'done' ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-600 hover:border-indigo-500'}`}>
        {task.status === 'done' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-zinc-500' : ''}`}>{task.title}</p>
        {task.description && <p className="text-sm text-zinc-500 truncate">{task.description}</p>}
        {task.due_date && <p className="text-xs text-zinc-600 mt-1">Due {task.due_date}</p>}
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioColor[task.priority]}`}>{task.priority}</span>
      <button onClick={() => onEdit(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-indigo-400 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      </button>
      <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </li>
  );
}
