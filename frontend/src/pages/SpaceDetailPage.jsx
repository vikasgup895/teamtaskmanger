import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [space, setSpace] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/spaces/${id}`),
      api.get('/auth/users')
    ])
      .then(([spaceRes, usersRes]) => {
        setSpace(spaceRes.data.space);
        setAllUsers(usersRes.data.users);
      })
      .catch(() => toast.error('Failed to load space details.'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedUserEmail) return toast.error('Select a user to add.');

    setAddLoading(true);
    try {
      const res = await api.post(`/spaces/${id}/members`, { email: selectedUserEmail });
      setSpace(res.data.space);
      setSelectedUserEmail('');
      toast.success('Member added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/spaces/${id}/members/${memberId}`);
      setSpace(res.data.space);
      toast.success('Member removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const deleteSpace = async () => {
    if (!confirm('Are you absolutely sure? This will delete all tasks inside this space.')) return;
    setDeleting(true);
    try {
      await api.delete(`/spaces/${id}`);
      toast.success('Space deleted.');
      navigate('/spaces');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete space.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="h-32 rounded-2xl bg-slate-100 animate-pulse max-w-3xl" />;
  }

  if (!space) {
    return <div className="text-red-600">Space not found.</div>;
  }

  const isOwner = space.createdBy?._id === user?._id;
  const canManage = user?.role === 'admin' && isOwner;
  const availableUsers = allUsers.filter(u => !space.members?.some(m => m._id === u._id));

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/spaces" className="hover:text-indigo-600">Spaces</Link>
        <span>/</span>
        <Link to={`/spaces/${id}/board`} className="hover:text-indigo-600">{space.name}</Link>
        <span>/</span>
        <span className="text-slate-900">Settings</span>
      </div>

      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings size={28} className="text-slate-400" />
            Space Settings
          </h1>
          <p className="mt-2 text-slate-500">{space.description}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Team Members
          </h2>
        </div>
        
        <div className="p-6">
          {canManage && (
            <form onSubmit={addMember} className="mb-6 flex items-center gap-3">
              <select
                value={selectedUserEmail}
                onChange={e => setSelectedUserEmail(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="">Select a user to add...</option>
                {availableUsers.map(u => (
                  <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button type="submit" disabled={addLoading} className="btn-primary rounded-xl px-5 py-2.5">
                {addLoading ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {space.members?.map(member => (
              <div key={member._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${member.role === 'admin' ? 'text-violet-600' : 'text-blue-600'}`}>
                    {member.role}
                  </span>
                  {canManage && member._id !== user._id && (
                    <button
                      onClick={() => removeMember(member._id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {canManage && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Deleting this space will permanently delete all tasks associated with it. This action cannot be undone.
          </p>
          <button
            onClick={deleteSpace}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Space'}
          </button>
        </section>
      )}
    </div>
  );
}
