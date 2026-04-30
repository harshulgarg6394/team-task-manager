/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  LogOut, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  Bell
} from 'lucide-react';
import { api } from './api';

// Types
type Role = 'admin' | 'member';
type Status = 'todo' | 'in-progress' | 'completed';
type Priority = 'low' | 'medium' | 'high';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  memberIds: string[];
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  projectId: string;
  dueDate: string;
  createdAt: string;
}

// Components
const Navbar = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <nav className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
        <CheckSquare className="text-white w-5 h-5" />
      </div>
      <span className="font-semibold text-lg tracking-tight">TeamSync</span>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
          {user.name.charAt(0)}
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="p-2 text-gray-500 hover:text-black transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  </nav>
);

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'tasks', icon: CheckSquare, label: 'All Tasks' },
    { id: 'team', icon: Users, label: 'Team' },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/50 p-6 flex flex-col gap-2 h-[calc(100vh-64px)] overflow-y-auto">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id 
              ? 'bg-black text-white shadow-lg shadow-black/10' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </aside>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (authMode === 'login') {
        res = await api.auth.login({ email, password });
      } else {
        res = await api.auth.signup({ email, password, name, role });
      }
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F4] flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl border border-gray-200"
          id="auth-card"
        >
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center rotate-3 shadow-xl">
              <CheckSquare className="text-white w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center tracking-tight mb-2">
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-center text-gray-500 mb-8 font-serif italic text-sm">
            Manage tasks, sync with your team.
          </p>

          <form onSubmit={handleAuth} className="space-x-0 space-y-4">
            {authMode === 'signup' && (
              <div id="field-name">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div id="field-email">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
            <div id="field-password">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {authMode === 'signup' && (
              <div id="field-role">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Role</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('member')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'member' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                  >
                    Member
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'admin' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
            
            {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
              id="auth-submit"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="ml-1 text-black font-bold hover:underline"
              id="auth-toggle"
            >
              {authMode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-6xl mx-auto"
            >
              {activeTab === 'dashboard' && <DashboardView user={user} />}
              {activeTab === 'projects' && <ProjectsView user={user} />}
              {activeTab === 'tasks' && <TasksView user={user} />}
              {activeTab === 'team' && <TeamView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Sub-views
function DashboardView({ user }: { user: User }) {
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const tasks = await api.tasks.getAll();
        const now = new Date();
        const overdue = tasks.filter((t: any) => t.status !== 'completed' && new Date(t.dueDate) < now).length;
        
        setStats({
          total: tasks.length,
          todo: tasks.filter((t: any) => t.status === 'todo').length,
          inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
          completed: tasks.filter((t: any) => t.status === 'completed').length,
          overdue
        });
        setRecentTasks(tasks.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'bg-black' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-blue-500' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8" id="dashboard-view">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-gray-500 font-serif italic text-sm mt-1">Hello, {user.name}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
              +5
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-5 h-5 text-gray-900`} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Recent Activity</h3>
              <button className="text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTasks.length > 0 ? recentTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {task.status}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 italic font-serif">No recent tasks to show</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-2xl shadow-xl shadow-black/20">
            <h3 className="font-bold text-lg mb-4">Project Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400 italic font-serif">
                {stats.overdue > 0 
                  ? `You have ${stats.overdue} overdue tasks that need attention.`
                  : "Great work! All your projects are currently on track."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', memberIds: [] as string[] });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pData, uData] = await Promise.all([
        api.projects.getAll(),
        api.users.getAll()
      ]);
      setProjects(pData);
      setUsers(uData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleMember = (id: string) => {
    setNewProject(prev => {
      const exists = prev.memberIds.includes(id);
      if (exists) {
        return { ...prev, memberIds: prev.memberIds.filter(m => m !== id) };
      } else {
        return { ...prev, memberIds: [...prev.memberIds, id] };
      }
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.projects.create(newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', memberIds: [] });
      loadData();
    } catch (err) {
      alert("Error creating project");
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="space-y-8" id="projects-view">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-gray-500 font-serif italic text-sm mt-1">Organize your team's work into projects.</p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all"
            id="create-project-btn"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between hover:border-black transition-colors group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-black group-hover:text-white transition-colors">
                  {project.name.charAt(0)}
                </div>
                <div className="flex -space-x-2">
                  {project.memberIds.slice(0, 3).map(id => (
                    <div key={id} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-[8px] flex items-center justify-center font-bold">M</div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{project.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 italic font-serif leading-relaxed mb-6">{project.description}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-lg rounded-2xl p-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold mb-6">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Project Name</label>
                  <input 
                    type="text" 
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder="E.g. Website Redesign"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Description</label>
                  <textarea 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 h-24"
                    placeholder="What is this project about?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Assign Members</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newProject.memberIds.includes(u.id)}
                          onChange={() => toggleMember(u.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{u.name}</span>
                          <span className="text-[10px] text-gray-500">{u.role}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-black text-white py-3 rounded-xl font-bold shadow-lg shadow-black/10"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TasksView({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    projectId: '', 
    assigneeId: '', 
    priority: 'medium' as Priority,
    dueDate: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tData, uData, pData] = await Promise.all([
        api.tasks.getAll(),
        api.users.getAll(),
        api.projects.getAll()
      ]);
      setTasks(tData);
      setUsers(uData);
      setProjects(pData);
      if (pData.length > 0) setNewTask(prev => ({...prev, projectId: pData[0].id}));
      if (uData.length > 0) setNewTask(prev => ({...prev, assigneeId: uData[0].id}));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tasks.create(newTask);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Error creating task");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Status) => {
    try {
      await api.tasks.update(taskId, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="space-y-8" id="tasks-view">
       <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Tasks</h2>
          <p className="text-gray-500 font-serif italic text-sm mt-1">Track and manage individual action items.</p>
        </div>
        {(user.role === 'admin' || projects.some(p => p.managerId === user.id)) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all"
            id="create-task-btn"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        )}
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Task Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Project</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Assignee</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {tasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignee = users.find(u => u.id === task.assigneeId);
              return (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tighter">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {project?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-200 text-[8px] flex items-center justify-center font-bold">
                        {assignee?.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700">{assignee?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'text-red-600 bg-red-100' : 
                      task.priority === 'medium' ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                         task.status === 'completed' ? 'bg-green-500' : 
                         task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs font-medium capitalize">{task.status.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                      className="text-xs border-none bg-transparent font-bold cursor-pointer outline-none hover:bg-gray-200 p-1 rounded"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-lg rounded-2xl p-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold mb-6">Assign New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Task Title</label>
                    <input 
                      type="text" 
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                      placeholder="Enter task name"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Description</label>
                    <textarea 
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 h-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Project</label>
                    <select 
                      value={newTask.projectId}
                      onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Assign To</label>
                    <select 
                      value={newTask.assigneeId}
                      onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    >
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Due Date</label>
                    <input 
                      type="date" 
                      value={newTask.dueDate}
                      onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold">Cancel</button>
                  <button type="submit" className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Assign Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamView() {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await api.users.getAll();
        setTeam(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  if (loading) return <div>Loading team...</div>;

  return (
    <div className="space-y-8" id="team-view">
      <header className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Team Directory</h2>
        <p className="text-gray-500 font-serif italic text-sm mt-1">Connect with your colleagues across projects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-gray-600">
              {member.name.charAt(0)}
            </div>
            <h3 className="font-bold">{member.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{member.email}</p>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
