import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Plus, LayoutDashboard, Calendar, ClipboardList,
  CheckCircle2, Circle, Trash2, Edit, Loader2, Check,
  LogOut, User, Menu, Bell, Search, Moon, Sun,
  Filter, ArrowUpDown, TrendingUp, RefreshCw, BarChart,
  Clock, AlertTriangle, X, ChevronRight, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('dueDate');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [activeFilter, sortBy]);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchTasks = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get(`/tasks?filter=${activeFilter}&sort=${sortBy}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);

    // Additional visibility filter for tabs
    if (activeFilter === 'pending') return task.status === 'pending' && (titleMatch || descMatch);
    if (activeFilter === 'completed') return task.status === 'completed' && (titleMatch || descMatch);
    return titleMatch || descMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask._id}`, newTask);
        setTasks(tasks.map(t => t._id === editingTask._id ? response.data : t));
        setNotification('Task updated successfully');
      } else {
        const response = await api.post('/tasks', newTask);
        setTasks([response.data, ...tasks]);
        setNotification('Task created successfully');
      }
      setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' });
      setIsAdding(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task', error);
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    try {
      const response = await api.put(`/tasks/${id}`, updatedData);
      setTasks(tasks.map(t => t._id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      setNotification('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const overdueCount = tasks.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }).length;

  const stats = [
    { id: 'all', label: 'Total Tasks', value: tasks.length, icon: <LayoutDashboard size={24} />, color: '#4F46E5' },
    { id: 'pending', label: 'Pending Tasks', value: pendingCount, icon: <Clock size={24} />, color: '#F59E0B' },
    { id: 'completed', label: 'Completed Tasks', value: completedCount, icon: <CheckCircle2 size={24} />, color: '#22C55E' },
    { id: 'overdue', label: 'Overdue Tasks', value: overdueCount, icon: <AlertTriangle size={24} />, color: '#EF4444' },
  ];

  return (
    <div className="dashboard-container">
      {/* 📌 SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-close-btn" 
          onClick={() => setIsSidebarOpen(false)}
          style={{ display: window.innerWidth <= 1024 ? 'block' : 'none' }}
        >
          <X size={24} />
        </button>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <ClipboardList size={24} />
          </div>
          <span>TaskMind<br /><small style={{ fontSize: '10px', opacity: 0.6 }}>intelligent task System</small></span>
        </div>

        <div className="sidebar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveFilter('all')}
            className={`sidebar-item ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>All Tasks</span>
            <span className="badge-count">{tasks.length}</span>
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`sidebar-item ${activeFilter === 'today' ? 'active' : ''}`}
          >
            <Calendar size={20} />
            <span>Today</span>
          </button>
          <button
            onClick={() => setActiveFilter('week')}
            className={`sidebar-item ${activeFilter === 'week' ? 'active' : ''}`}
          >
            <TrendingUp size={20} />
            <span>This Week</span>
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`sidebar-item ${activeFilter === 'pending' ? 'active' : ''}`}
          >
            <Clock size={20} />
            <span>Pending</span>
            <span className="badge-count" style={{ background: '#F59E0B' }}>{pendingCount}</span>
          </button>
          <button
            onClick={() => setActiveFilter('overdue')}
            className={`sidebar-item ${activeFilter === 'overdue' ? 'active' : ''}`}
          >
            <AlertTriangle size={20} />
            <span>Overdue</span>
            <span className="badge-count" style={{ background: '#EF4444' }}>{overdueCount}</span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`sidebar-item ${activeFilter === 'completed' ? 'active' : ''}`}
          >
            <CheckCircle2 size={20} />
            <span>Completed</span>
            <span className="badge-count" style={{ background: '#22C55E' }}>{completedCount}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-section">
            <div className="user-avatar-circle">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT */}
      <main className="main-content">
        <header className="navbar">
          <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Quick search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="navbar-actions">
            <button className="btn-add-task" onClick={() => setIsAdding(true)}>
              <Plus size={18} />
              <span>Add Task</span>
            </button>

            <button
              className="btn-icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'var(--bg-main)', borderRadius: '12px' }}
            >
              {theme === 'dark' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} />}
            </button>

            <button className="notification-btn btn-icon">
              <Bell size={20} />
              <span className="pulse-badge"></span>
            </button>

            <div className="user-avatar-circle" style={{ width: '38px', height: '38px', cursor: 'pointer' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <section className="greeting-section animate-slide-up">
            <h1>Good Evening, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here's what's on your plate today.</p>
          </section>

          <section className="stats-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={`stat-card ${activeFilter === stat.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(stat.id)}
                whileHover={{ y: -8, boxShadow: 'var(--shadow-lg)' }}
                style={{ 
                  cursor: 'pointer',
                  border: activeFilter === stat.id ? `2px solid ${stat.color}` : '1px solid var(--border-color)',
                  boxShadow: activeFilter === stat.id ? `0 10px 25px ${stat.color}25` : 'var(--shadow-sm)'
                }}
              >
                <div className="stat-icon-wrapper" style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                {activeFilter === stat.id && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="active-glow"
                    style={{ background: stat.color }}
                  />
                )}
              </motion.div>
            ))}
          </section>

          <section className="tasks-container animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="filter-sort-wrapper">
              <div className="filter-group">
                {[
                  { id: 'all', label: 'All Tasks', icon: <Hash size={16} /> },
                  { id: 'today', label: 'Today', icon: <Calendar size={16} /> },
                  { id: 'week', label: 'This Week', icon: <TrendingUp size={16} /> },
                  { id: 'pending', label: 'Pending', icon: <Clock size={16} /> },
                  { id: 'overdue', label: 'Overdue', icon: <AlertTriangle size={16} /> },
                  { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={16} /> },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>

              <div className="sort-group">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Nearest Due Date</option>
                  <option value="priority">Priority Wise</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="tasks-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="task-card skeleton" style={{ height: '180px' }}></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ClipboardList size={64} style={{ opacity: 0.2 }} />
                </div>
                <h3 className="text-xl font-bold">No tasks found</h3>
                <p className="text-muted">Stay organized by adding your first task!</p>
                <button className="btn-add-task" style={{ margin: '20px auto' }} onClick={() => setIsAdding(true)}>
                  <Plus size={18} />
                  <span>Create Your First Task</span>
                </button>
              </div>
            ) : (
              <div className="tasks-grid">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      key={task._id}
                      className={`task-card ${task.dueStatus?.includes('Overdue') ? 'overdue-highlight' : ''}`}
                      style={{
                        borderLeft: `5px solid ${task.dueStatus === 'Completed' ? '#3B82F6' :
                          task.dueStatus?.includes('Overdue') ? '#EF4444' :
                            task.dueStatus === 'Due Today' ? '#F59E0B' : '#22C55E'
                          }`
                      }}
                    >
                      <div className="task-card-header">
                        <div className={`due-status-badge ${task.dueStatus === 'Completed' ? 'due-status-completed' :
                          task.dueStatus?.includes('Overdue') ? 'due-status-overdue' :
                            task.dueStatus === 'Due Today' ? 'due-status-today' : 'due-status-upcoming'
                          }`}>
                          {task.dueStatus?.includes('Overdue') && <AlertTriangle size={12} />}
                          {task.dueStatus === 'Due Today' && <Clock size={12} />}
                          {task.dueStatus?.includes('Due in') && <RefreshCw size={12} />}
                          {task.dueStatus === 'Completed' && <Check size={12} />}
                          <span>{task.dueStatus}</span>
                        </div>
                        <div className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                          {task.priority || 'Medium'}
                        </div>
                      </div>

                      <h3>{task.title}</h3>
                      <p>{task.description}</p>

                      <div className="task-card-footer">
                        <div className="due-date">
                          <Calendar size={14} />
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'No date'}</span>
                        </div>
                        <div className="task-card-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleUpdateTask(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                            style={{ color: task.status === 'completed' ? '#3B82F6' : 'inherit' }}
                          >
                            <CheckCircle2 size={18} strokeWidth={task.status === 'completed' ? 3 : 2} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setEditingTask(task);
                              setNewTask({
                                title: task.title,
                                description: task.description,
                                priority: task.priority || 'Medium',
                                dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
                              });
                              setIsAdding(true);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDeleteTask(task._id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 🚀 ADD/EDIT MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="modal-overlay" onClick={() => { setIsAdding(false); setEditingTask(null); }}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                <button className="btn-icon" onClick={() => { setIsAdding(false); setEditingTask(null); }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design System Update"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the task details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  ></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => { setIsAdding(false); setEditingTask(null); }}>Discard</button>
                  <button type="submit" className="btn-primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              right: '40px',
              background: 'var(--primary)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '16px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Check size={20} />
            {notification}
            <button onClick={() => setNotification('')} style={{ color: 'white', opacity: 0.5, marginLeft: '12px' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 🚀 SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
