import { format, isPast } from 'date-fns';

const statusClass = status => ({
  Todo: 'badge badge-todo',
  'In Progress': 'badge badge-progress',
  Done: 'badge badge-done',
}[status] || 'badge badge-todo');

const priorityClass = priority => ({
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
}[priority] || 'badge-low');

export default function TaskTable({ tasks }) {
  if (!tasks?.length) {
    return (
      <div className="py-10 text-center">
        <p className="font-medium text-slate-700">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">Assigned tasks will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <th className="py-2 pr-4 font-semibold">Task</th>
            <th className="py-2 pr-4 font-semibold">Project</th>
            <th className="py-2 pr-4 font-semibold">Assignee</th>
            <th className="py-2 pr-4 font-semibold">Priority</th>
            <th className="py-2 pr-4 font-semibold">Deadline</th>
            <th className="py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const overdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'Done';
            return (
              <tr key={task._id} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{task.title}</td>
                <td className="py-3 pr-4 text-slate-600">{task.projectId?.name || '-'}</td>
                <td className="py-3 pr-4 text-slate-600">{task.assignedTo?.name || '-'}</td>
                <td className="py-3 pr-4"><span className={priorityClass(task.priority)}>{task.priority}</span></td>
                <td className={`py-3 pr-4 ${overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                  {task.deadline ? `${overdue ? 'Overdue: ' : ''}${format(new Date(task.deadline), 'MMM d, yyyy')}` : '-'}
                </td>
                <td className="py-3"><span className={statusClass(task.status)}>{task.status}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
