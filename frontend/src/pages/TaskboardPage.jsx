import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { Plus, X, Trash2, Clock, Star, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const STATUSES = ['Todo', 'In Progress', 'Done'];

/* ── Create task modal ────────────────── */
function CreateTaskModal({ space, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium', isImportant: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Task title is required.');
    if (!form.assignedTo) return setError('Please assign this task to a member.');

    setLoading(true);
    try {
      const res = await api.post('/tasks', {
        ...form,
        spaceId: space._id,
        deadline: form.deadline || undefined,
      });
      onCreate(res.data.task);
      toast.success('Task created!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create Task</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-field"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input-field"
              placeholder="Optional details…"
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Assign To <span className="text-red-500">*</span></label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                className="input-field"
              >
                <option value="">Select member</option>
                {space.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="important"
              checked={form.isImportant}
              onChange={(e) => setForm((p) => ({ ...p, isImportant: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="important" className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              Mark as Important
            </label>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ── Task card ────────────────────────── */
function TaskCard({ task, canManage, onDelete, onUpdate }) {
  const { user } = useAuth();
  const toast = useToast();
  const [updating, setUpdating] = useState(false);

  const isAssignee = task.assignedTo?._id === user?._id;
  const canUpdate = canManage || isAssignee;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'Done';

  const updateField = async (field, value) => {
    if (task[field] === value) return;
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/${task._id}`, { [field]: value });
      onUpdate(res.data.task);
    } catch {
      toast.error(`Failed to update ${field}.`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  return (
    <div className={`group relative rounded-xl border p-4 shadow-sm transition-all ${
      task.isImportant ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
    }`}>
      {/* Important Toggle */}
      {canUpdate && (
        <button 
          onClick={() => updateField('isImportant', !task.isImportant)}
          className="absolute right-3 top-3 p-1 rounded-full text-slate-300 hover:bg-slate-100 hover:text-amber-500 transition-colors"
        >
          <Star size={16} className={task.isImportant ? "text-amber-500 fill-amber-500" : ""} />
        </button>
      )}

      <div className="pr-8">
        <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
        {task.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600" title={task.assignedTo?.name}>
            {task.assignedTo?.name?.charAt(0)}
          </div>
          {task.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'font-semibold text-red-600' : ''}`}>
              <Clock size={12} />
              {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d')}
            </div>
          )}
        </div>
      </div>

      {canUpdate && (
        <div className="mt-3 flex gap-2">
          <select
            value={task.status}
            onChange={(e) => updateField('status', e.target.value)}
            disabled={updating}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {canManage && (
            <button onClick={handleDelete} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Kanban column ────────────────────── */
function Column({ status, tasks, canManage, onDelete, onUpdate }) {
  return (
    <div className="flex flex-col rounded-2xl bg-slate-50/50 border border-slate-200/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{status}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm border border-slate-200">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs font-medium text-slate-400">
            No tasks here
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task._id} task={task} canManage={canManage} onDelete={onDelete} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────── */
export default function TaskBoardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [space, setSpace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spaceRes, taskRes] = await Promise.all([
          api.get(`/spaces/${id}`),
          api.get(`/tasks?spaceId=${id}`),
        ]);
        setSpace(spaceRes.data.space);
        setTasks(taskRes.data.tasks);
      } catch {
        toast.error('Failed to load space board.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-1/4 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-96 rounded-2xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  if (!space) {
    return <div className="text-red-600">Space not found.</div>;
  }

  const isOwner = space.createdBy?._id === user?._id;
  const canManage = user?.role === 'admin' && isOwner;

  const filteredTasks = filter === 'mine'
    ? tasks.filter(t => t.assignedTo?._id === user?._id)
    : tasks;

  const handleCreate = (task) => setTasks(p => [task, ...p]);
  const handleUpdate = (updated) => setTasks(p => p.map(t => t._id === updated._id ? updated : t));
  const handleDelete = (taskId) => setTasks(p => p.filter(t => t._id !== taskId));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/spaces" className="hover:text-indigo-600">Spaces</Link>
        <span>/</span>
        <span className="text-slate-900">{space.name}</span>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{space.name} Board</h1>
          <p className="mt-2 text-sm text-slate-500">
            {tasks.length} tasks total
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Team Tasks
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${filter === 'mine' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Tasks
            </button>
          </div>
          
          <Link to={`/spaces/${id}`} className="btn-secondary rounded-xl p-2 h-[36px]" title="Space Settings">
            <Settings size={18} />
          </Link>

          {canManage && (
            <button onClick={() => setShowCreate(true)} className="btn-primary rounded-xl px-4 py-1.5 h-[36px] gap-2 shadow-sm">
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            tasks={filteredTasks.filter(t => t.status === status)}
            canManage={canManage}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {showCreate && <CreateTaskModal space={space} onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
