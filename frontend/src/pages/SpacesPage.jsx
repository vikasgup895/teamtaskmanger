import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, X, Compass, Users, LayoutList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';

function CreateSpaceModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Space name is required.');

    setLoading(true);
    try {
      const res = await api.post('/spaces', form);
      onCreate(res.data.space);
      toast.success('Space created successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create space.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create a Space</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              placeholder="e.g., Marketing Team, Mobile App Redesign"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              placeholder="What's this space for?"
              rows={3}
            />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]">
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function SpacesPage() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/spaces')
      .then((res) => setSpaces(res.data.spaces))
      .catch(() => setError('Failed to load spaces.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Spaces</h1>
          <p className="mt-1 text-sm text-slate-500">Collaborative areas for your team's work.</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5 gap-2 shadow-sm">
            <Plus size={16} />
            New Space
          </button>
        )}
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <Compass size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No spaces found</h3>
          <p className="mt-1 text-slate-500">
            {user?.role === 'admin' ? 'Create a space to organize tasks.' : 'You haven\'t been added to any spaces yet.'}
          </p>
          {user?.role === 'admin' && (
            <button onClick={() => setShowCreate(true)} className="mt-6 btn-primary rounded-full px-6">
              Create First Space
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map(space => (
            <Link 
              key={space._id} 
              to={`/spaces/${space._id}/board`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <LayoutList size={24} />
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Users size={14} />
                  {space.members?.length || 0}
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-slate-900">{space.name}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {space.description || 'No description provided.'}
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
                Created {format(new Date(space.createdAt), 'MMM d, yyyy')}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateSpaceModal onClose={() => setShowCreate(false)} onCreate={s => setSpaces(p => [s, ...p])} />}
    </div>
  );
}
