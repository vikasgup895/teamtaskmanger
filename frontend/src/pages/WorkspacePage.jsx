import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ── Status badge ────────────────────── */
function StatusBadge({ status }) {
  const cls = {
    Todo: 'badge badge-todo',
    'In Progress': 'badge badge-progress',
    Done: 'badge badge-done',
  }[status] || 'badge-todo';
  return <span className={cls}>{status}</span>;
}

export default function WorkspacePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/workspace')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load workspace data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-1/3 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 rounded-xl bg-slate-100" />
          <div className="h-64 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>;
  }

  const { myTasks, todayTasks, overdueTasks, recentActivity, stats } = data;
  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Quick Actions */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good {getGreeting()}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/spaces" className="btn-secondary rounded-full px-5">
            Browse Spaces
          </Link>
          {user?.role === 'admin' && (
            <Link to="/spaces" className="btn-primary rounded-full px-5 gap-2 shadow-sm">
              <Plus size={16} />
              New Space
            </Link>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column (My Tasks First) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Important & Upcoming Tasks */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" />
              My Tasks First
            </h2>
            
            {myTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                <CheckCircle2 size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="font-medium text-slate-700">You're all caught up!</p>
                <p className="text-sm text-slate-500 mt-1">No pending tasks assigned to you right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 5).map(task => (
                  <Link 
                    to={`/spaces/${task.spaceId._id}/board`} 
                    key={task._id} 
                    className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {task.isImportant ? (
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-300 group-hover:border-indigo-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <span className="font-medium text-slate-600">{task.spaceId?.name}</span>
                            <span>•</span>
                            {task.deadline && (
                              <span className={isPast(new Date(task.deadline)) ? 'text-red-600 font-medium' : ''}>
                                Due {format(new Date(task.deadline), 'MMM d')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Recent Activity
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No recent activity.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentActivity.map(task => (
                    <li key={task._id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-900">{task.assignedTo?.name || 'Someone'}</span>
                        <span className="text-slate-500"> updated </span>
                        <span className="font-medium text-slate-900">{task.title}</span>
                        <span className="text-slate-500"> in </span>
                        <span className="font-medium text-slate-900">{task.spaceId?.name}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(task.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (Insights) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress Widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Your Progress</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-slate-900">{completionPct}%</span>
              <span className="text-sm text-slate-500 mb-1">{stats.completed} of {stats.total} tasks</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Alerts Widget */}
          {overdueTasks.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-red-900 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600" />
                Action Needed
              </h3>
              <ul className="space-y-3">
                {overdueTasks.slice(0, 3).map(task => (
                  <li key={task._id} className="text-sm">
                    <p className="font-semibold text-red-800 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-red-600 mt-0.5">Overdue since {format(new Date(task.deadline), 'MMM d')}</p>
                  </li>
                ))}
              </ul>
              {overdueTasks.length > 3 && (
                <p className="text-xs text-red-600 font-medium mt-3">+ {overdueTasks.length - 3} more overdue tasks</p>
              )}
            </div>
          )}

          {/* Today Widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Due Today</h3>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing due today.</p>
            ) : (
              <ul className="space-y-3">
                {todayTasks.map(task => (
                  <li key={task._id} className="flex items-start gap-2">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 leading-tight">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.spaceId?.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
