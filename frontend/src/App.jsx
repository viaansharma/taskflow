import React, { useState, useEffect, useCallback } from 'react';
import { authAPI, projectsAPI, tasksAPI, usersAPI } from './api';
import './App.css';

// ─── helpers ───────────────────────────────────────────────────────────────
const COLORS = ['#4f8ef7','#34d399','#fbbf24','#a78bfa','#f87171','#38bdf8'];
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
const isOverdue = date => date && date < new Date().toISOString().split('T')[0];
const today = () => new Date().toISOString().split('T')[0];

// ─── Auth ───────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const fn = tab === 'login' ? authAPI.login : authAPI.signup;
      const { data } = await fn(form);
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-mark">TF</div>
          <h1>TaskFlow</h1>
          <p>Team Task Manager</p>
        </div>
        <div className="auth-tabs">
          <div className={`auth-tab${tab==='login'?' active':''}`} onClick={()=>{setTab('login');setErr('')}}>Sign in</div>
          <div className={`auth-tab${tab==='signup'?' active':''}`} onClick={()=>{setTab('signup');setErr('')}}>Create account</div>
        </div>
        {err && <div className="auth-err">{err}</div>}
        <form onSubmit={submit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'10px'}} disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ user, view, onNav, projects, myTaskCount, overdueCount }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">TF</div>
        <div><div className="logo-text">TaskFlow</div><div className="logo-sub">v2.0</div></div>
      </div>
      <div className="sidebar-section">Menu</div>
      {[
        { key: 'dashboard', label: 'Dashboard', icon: '▦' },
        { key: 'projects', label: 'Projects', icon: '⊞', badge: projects.length },
        { key: 'mytasks', label: 'My Tasks', icon: '✓', badge: myTaskCount, badgeRed: overdueCount > 0 },
      ].map(item => (
        <div key={item.key} className={`nav-item${view===item.key?' active':''}`} onClick={() => onNav(item.key)}>
          <span style={{fontSize:13}}>{item.icon}</span> {item.label}
          {item.badge !== undefined && <span className={`nav-badge${item.badgeRed?' red':''}`}>{item.badge}</span>}
        </div>
      ))}
      {user.role === 'admin' && <>
        <div className="sidebar-section">Admin</div>
        <div className={`nav-item${view==='members'?' active':''}`} onClick={() => onNav('members')}>
          <span style={{fontSize:13}}>◉</span> Members
        </div>
      </>}
      <div className="sidebar-section">Account</div>
      <div className={`nav-item${view==='profile'?' active':''}`} onClick={() => onNav('profile')}>
        <span style={{fontSize:13}}>⊙</span> Profile
      </div>
      <div className="sidebar-footer">
        <div className="user-chip" onClick={() => onNav('profile')}>
          <div className="avatar" style={{background:user.color+'22',color:user.color}}>{initials(user.name)}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ user, projects, tasks, users }) {
  const myProjects = projects.filter(p => p.memberIds?.some(m => (m._id||m) === user._id));
  const allTasks = tasks;
  const stats = {
    total: allTasks.length,
    todo: allTasks.filter(t => t.status === 'todo').length,
    inprog: allTasks.filter(t => t.status === 'in-progress').length,
    done: allTasks.filter(t => t.status === 'done').length,
    overdue: allTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length,
  };
  const total = stats.total || 1;

  const tasksByUser = users.map(u => ({
    ...u,
    count: allTasks.filter(t => (t.assigneeId?._id||t.assigneeId) === u._id).length
  })).filter(u => u.count > 0).sort((a, b) => b.count - a.count);
  const maxCount = tasksByUser[0]?.count || 1;

  return (
    <div>
      <div className="grid g4" style={{marginBottom:20}}>
        {[
          { val: stats.total, label: 'Total tasks', color: 'var(--accent2)', sub: `${projects.length} projects` },
          { val: stats.inprog, label: 'In progress', color: 'var(--amber)', pct: Math.round(stats.inprog/total*100) },
          { val: stats.done, label: 'Completed', color: 'var(--green)', pct: Math.round(stats.done/total*100) },
          { val: stats.overdue, label: 'Overdue', color: 'var(--red)', sub: stats.overdue > 0 ? 'Needs attention' : 'All on track' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-val" style={{color:s.color}}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
            {s.pct !== undefined ? <div className="prog-bar"><div className="prog-fill" style={{width:s.pct+'%',background:s.color}}/></div>
              : <div className="stat-change" style={{color:'var(--text3)'}}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <div className="grid g2" style={{marginBottom:20}}>
        <div className="card">
          <div className="section-title">TASKS BY STATUS</div>
          {[
            { label: 'To Do', count: stats.todo, color: 'var(--text2)', pct: Math.round(stats.todo/total*100) },
            { label: 'In Progress', count: stats.inprog, color: 'var(--amber)', pct: Math.round(stats.inprog/total*100) },
            { label: 'Done', count: stats.done, color: 'var(--green)', pct: Math.round(stats.done/total*100) },
            { label: 'Overdue', count: stats.overdue, color: 'var(--red)', pct: Math.round(stats.overdue/total*100) },
          ].map(r => (
            <div key={r.label} className="chart-row">
              <span className="chart-label">{r.label}</span>
              <div className="chart-bar-wrap"><div className="chart-bar-fill" style={{width:r.pct+'%',background:r.color}}/></div>
              <span className="chart-val">{r.count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">TASKS PER MEMBER</div>
          {tasksByUser.length === 0 ? <div className="empty"><div className="empty-text">No data</div></div>
            : tasksByUser.map(u => (
              <div key={u._id} className="chart-row">
                <span className="chart-label" style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className="avatar" style={{width:20,height:20,fontSize:9,background:u.color+'22',color:u.color}}>{initials(u.name)}</span>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name?.split(' ')[0]}</span>
                </span>
                <div className="chart-bar-wrap"><div className="chart-bar-fill" style={{width:Math.round(u.count/maxCount*100)+'%',background:u.color}}/></div>
                <span className="chart-val">{u.count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Projects List ───────────────────────────────────────────────────────────
function Projects({ user, projects, tasks, onOpenProject, onCreateProject }) {
  return (
    <div className="grid g3">
      {projects.map(p => {
        const ptasks = tasks.filter(t => t.projectId === p._id);
        const done = ptasks.filter(t => t.status === 'done').length;
        const pct = ptasks.length ? Math.round(done/ptasks.length*100) : 0;
        const isAdmin = (p.adminId?._id||p.adminId) === user._id || user.role === 'admin';
        return (
          <div key={p._id} className="proj-card" onClick={() => onOpenProject(p._id)}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:p.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{p.name[0]}</div>
              <span className={`tag tag-${isAdmin?'admin':'member'}`}>{isAdmin?'Admin':'Member'}</span>
            </div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{p.name}</div>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:14,minHeight:32}}>{p.desc}</div>
            <div style={{display:'flex',marginBottom:12}}>
              {(p.memberIds||[]).slice(0,4).map(m => {
                const member = typeof m === 'object' ? m : null;
                return member ? <div key={member._id} className="avatar" style={{width:24,height:24,fontSize:9,background:member.color+'22',color:member.color,border:'2px solid var(--bg2)',marginRight:-4}}>{initials(member.name)}</div> : null;
              })}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text3)',marginBottom:6}}>
              <span>{ptasks.length} tasks</span><span>{pct}% done</span>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{width:pct+'%',background:p.color}}/></div>
          </div>
        );
      })}
      {user.role === 'admin' && (
        <div className="proj-card" style={{borderStyle:'dashed',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200,color:'var(--text3)'}} onClick={onCreateProject}>
          <div style={{fontSize:28,marginBottom:8,opacity:.4}}>+</div>
          <div style={{fontSize:13}}>New Project</div>
        </div>
      )}
    </div>
  );
}

// ─── Task Board ──────────────────────────────────────────────────────────────
function TaskBoard({ user, project, tasks, users, onCreateTask, onOpenTask, onUpdateTask }) {
  if (!project) return <div className="empty"><div className="empty-text">Project not found</div></div>;
  const isAdmin = (project.adminId?._id||project.adminId) === user._id || user.role === 'admin';
  const cols = [
    { key: 'todo', label: 'To Do', color: 'var(--text3)' },
    { key: 'in-progress', label: 'In Progress', color: 'var(--amber)' },
    { key: 'done', label: 'Done', color: 'var(--green)' },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{width:40,height:40,borderRadius:10,background:project.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{project.name[0]}</div>
        <div>
          <div style={{fontSize:15,fontWeight:600}}>{project.name}</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>{project.desc}</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          {(project.memberIds||[]).slice(0,5).map(m => {
            const member = typeof m === 'object' ? m : null;
            return member ? <div key={member._id} className="avatar" style={{width:28,height:28,fontSize:11,background:member.color+'22',color:member.color}} title={member.name}>{initials(member.name)}</div> : null;
          })}
        </div>
      </div>
      <div className="board">
        {cols.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="column">
              <div className="col-header">
                <div className="col-title">
                  <div className="col-dot" style={{background:col.color}}/>
                  {col.label}
                </div>
                <span className="col-count">{colTasks.length}</span>
              </div>
              <div className="col-tasks">
                {colTasks.map(t => {
                  const assignee = typeof t.assigneeId === 'object' ? t.assigneeId : users.find(u => u._id === t.assigneeId);
                  const od = isOverdue(t.dueDate) && t.status !== 'done';
                  return (
                    <div key={t._id} className="task-card" onClick={() => onOpenTask(t)}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                        <div className="task-title" style={{flex:1}}>{t.title}</div>
                        <span className={`tag tag-${t.priority}`} style={{marginLeft:6,flexShrink:0}}>{t.priority}</span>
                      </div>
                      {t.desc && <div className="task-desc">{t.desc}</div>}
                      <div className="task-meta">
                        {assignee && <div className="assignee-chip"><div className="avatar" style={{width:18,height:18,fontSize:8,background:assignee.color+'22',color:assignee.color}}>{initials(assignee.name)}</div>{assignee.name?.split(' ')[0]}</div>}
                        {t.dueDate && <span className={`due-date${od?' due-overdue':''}`}>{od?'⚠ ':''}{t.dueDate}</span>}
                      </div>
                    </div>
                  );
                })}
                {isAdmin && (
                  <div style={{textAlign:'center',padding:10,cursor:'pointer',color:'var(--text3)',fontSize:12,border:'1px dashed var(--border)',borderRadius:8}} onClick={() => onCreateTask(col.key)}>
                    + Add task
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── My Tasks ────────────────────────────────────────────────────────────────
function MyTasks({ user, tasks, projects }) {
  const [tab, setTab] = useState('all');
  const myTasks = tasks.filter(t => (t.assigneeId?._id||t.assigneeId) === user._id);
  const filtered = tab === 'all' ? myTasks : myTasks.filter(t => t.status === tab);
  const tabs = [
    { k: 'all', l: 'All', count: myTasks.length },
    { k: 'todo', l: 'To Do', count: myTasks.filter(t=>t.status==='todo').length },
    { k: 'in-progress', l: 'In Progress', count: myTasks.filter(t=>t.status==='in-progress').length },
    { k: 'done', l: 'Done', count: myTasks.filter(t=>t.status==='done').length },
  ];

  return (
    <div>
      <div className="tabs">
        {tabs.map(t => (
          <div key={t.k} className={`tab${tab===t.k?' active':''}`} onClick={() => setTab(t.k)}>
            {t.l} <span style={{fontSize:11,color:'var(--text3)'}}>{t.count}</span>
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">✓</div><div className="empty-text">No tasks here</div></div>
      ) : filtered.map(t => {
        const p = projects.find(pr => pr._id === (t.projectId?._id||t.projectId));
        const od = isOverdue(t.dueDate) && t.status !== 'done';
        return (
          <div key={t._id} className="card-sm" style={{marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:4,height:48,borderRadius:2,background:t.priority==='high'?'var(--red)':t.priority==='medium'?'var(--amber)':'var(--green)'}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:500}}>{t.title}</span>
                  <span className={`tag tag-${t.status==='in-progress'?'progress':t.status}`}>{t.status==='in-progress'?'In Progress':t.status==='todo'?'To Do':'Done'}</span>
                  <span className={`tag tag-${t.priority}`}>{t.priority}</span>
                  {od && <span className="overdue-badge">Overdue</span>}
                </div>
                <div style={{fontSize:12,color:'var(--text3)'}}>{p?.name||''}{t.dueDate ? ` • Due ${t.dueDate}` : ''}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Members ─────────────────────────────────────────────────────────────────
function Members({ user, users, tasks, onUpdateRole, onInvite }) {
  return (
    <div className="card">
      {users.map(u => (
        <div key={u._id} className="member-row">
          <div className="avatar" style={{width:38,height:38,fontSize:14,background:u.color+'22',color:u.color}}>{initials(u.name)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:500}}>{u.name}</div>
            <div style={{fontSize:12,color:'var(--text3)'}}>{u.email}</div>
          </div>
          <span className={`tag tag-${u.role}`}>{u.role}</span>
          <span style={{fontSize:12,color:'var(--text3)',marginLeft:12}}>{tasks.filter(t=>(t.assigneeId?._id||t.assigneeId)===u._id).length} tasks</span>
          {user.role === 'admin' && u._id !== user._id && (
            <button className="btn btn-ghost btn-sm" onClick={() => onUpdateRole(u._id, u.role==='admin'?'member':'admin')}>
              {u.role==='admin'?'Make Member':'Make Admin'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function Profile({ user, projects, tasks, onSave }) {
  const [name, setName] = useState(user.name);
  const myTasks = tasks.filter(t => (t.assigneeId?._id||t.assigneeId) === user._id);

  return (
    <div className="grid g2">
      <div className="card">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 0'}}>
          <div className="avatar" style={{width:72,height:72,fontSize:26,background:user.color+'22',color:user.color,marginBottom:16}}>{initials(user.name)}</div>
          <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>{user.name}</div>
          <div style={{fontSize:13,color:'var(--text3)',marginBottom:12}}>{user.email}</div>
          <span className={`tag tag-${user.role}`}>{user.role}</span>
        </div>
        <div className="divider"/>
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => onSave(name)}>Save changes</button>
      </div>
      <div>
        <div className="card" style={{marginBottom:16}}>
          <div className="section-title">MY STATS</div>
          <div className="grid g2" style={{gap:10}}>
            {[
              { v: myTasks.length, l: 'Total tasks', c: 'var(--accent2)' },
              { v: myTasks.filter(t=>t.status==='done').length, l: 'Completed', c: 'var(--green)' },
              { v: myTasks.filter(t=>t.status==='in-progress').length, l: 'In progress', c: 'var(--amber)' },
              { v: myTasks.filter(t=>isOverdue(t.dueDate)&&t.status!=='done').length, l: 'Overdue', c: 'var(--red)' },
            ].map(s => <div key={s.l} className="stat-card"><div className="stat-val" style={{color:s.c}}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}
          </div>
        </div>
        <div className="card">
          <div className="section-title">MY PROJECTS</div>
          {projects.filter(p=>p.memberIds?.some(m=>(m._id||m)===user._id)).map(p => (
            <div key={p._id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:p.color,display:'inline-block'}}/>
              <span style={{fontSize:13,fontWeight:500}}>{p.name}</span>
              <span style={{marginLeft:'auto',fontSize:11,color:'var(--text3)'}}>{tasks.filter(t=>t.projectId===p._id).length} tasks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e=>{if(e.target.classList.contains('modal-overlay'))onClose()}}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function CreateProjectModal({ users, currentUser, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', desc: '', color: COLORS[0], memberIds: [] });
  const other = users.filter(u => u._id !== currentUser._id);

  return (
    <Modal title="New Project" onClose={onClose} footer={
      <><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onSubmit(form)}>Create Project</button></>
    }>
      <div className="form-group"><label className="form-label">Project Name</label>
        <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Website Redesign" /></div>
      <div className="form-group"><label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Brief description..." /></div>
      <div className="form-group"><label className="form-label">Color</label>
        <div style={{display:'flex',gap:8}}>
          {COLORS.map(c => <div key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid white':'3px solid transparent'}}/>)}
        </div>
      </div>
      <div className="form-group"><label className="form-label">Add Members</label>
        <select className="form-select" multiple style={{height:100}} onChange={e=>setForm({...form,memberIds:Array.from(e.target.selectedOptions).map(o=>o.value)})}>
          {other.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
        </select>
      </div>
    </Modal>
  );
}

function CreateTaskModal({ project, users, defaultStatus, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', desc: '', priority: 'medium', status: defaultStatus||'todo', assigneeId: '', dueDate: '' });
  const members = (project?.memberIds||[]).filter(m => typeof m === 'object');

  return (
    <Modal title="New Task" onClose={onClose} footer={
      <><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onSubmit(form)}>Create Task</button></>
    }>
      <div className="form-group"><label className="form-label">Title</label>
        <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title" /></div>
      <div className="form-group"><label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Optional..." /></div>
      <div className="grid g2" style={{gap:12}}>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select></div>
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
          </select></div>
      </div>
      <div className="grid g2" style={{gap:12}}>
        <div className="form-group"><label className="form-label">Assignee</label>
          <select className="form-select" value={form.assigneeId} onChange={e=>setForm({...form,assigneeId:e.target.value})}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} /></div>
      </div>
    </Modal>
  );
}

function TaskDetailModal({ task, project, users, currentUser, onClose, onUpdate, onDelete }) {
  const assignee = typeof task.assigneeId === 'object' ? task.assigneeId : users.find(u => u._id === task.assigneeId);
  const creator = typeof task.createdBy === 'object' ? task.createdBy : users.find(u => u._id === task.createdBy);
  const isAdmin = (project?.adminId?._id||project?.adminId) === currentUser._id || currentUser.role === 'admin';
  const isAssignee = (task.assigneeId?._id||task.assigneeId) === currentUser._id;

  return (
    <Modal title={task.title} onClose={onClose} footer={
      isAdmin ? <><button className="btn btn-danger" onClick={() => onDelete(task._id)}>Delete Task</button></> : null
    }>
      {task.desc && <p style={{fontSize:14,color:'var(--text2)',marginBottom:16,lineHeight:1.6}}>{task.desc}</p>}
      <div className="grid g2" style={{gap:12,marginBottom:16}}>
        <div><div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>STATUS</div>
          {(isAdmin||isAssignee) ? (
            <select className="form-select" defaultValue={task.status} onChange={e=>onUpdate(task._id,{status:e.target.value})}>
              <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
            </select>
          ) : <span className={`tag tag-${task.status==='in-progress'?'progress':task.status}`}>{task.status}</span>}
        </div>
        <div><div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>PRIORITY</div><span className={`tag tag-${task.priority}`}>{task.priority}</span></div>
        <div><div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>ASSIGNEE</div>
          {assignee ? <div style={{display:'flex',alignItems:'center',gap:6}}><div className="avatar" style={{width:22,height:22,fontSize:9,background:assignee.color+'22',color:assignee.color}}>{initials(assignee.name)}</div><span style={{fontSize:13}}>{assignee.name}</span></div> : <span style={{fontSize:13,color:'var(--text3)'}}>Unassigned</span>}
        </div>
        <div><div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>DUE DATE</div>
          <span style={{fontSize:13,color:isOverdue(task.dueDate)&&task.status!=='done'?'var(--red)':'inherit'}}>{task.dueDate||'Not set'}</span>
        </div>
      </div>
      {creator && <div style={{fontSize:11,color:'var(--text3)'}}>Created by {creator.name}</div>}
    </Modal>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [modal, setModal] = useState(null);

  // Load current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me().then(({ data }) => { setUser(data); setLoading(false); }).catch(() => { localStorage.removeItem('token'); setLoading(false); });
    } else { setLoading(false); }
  }, []);

  // Load data when user is set
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getMyTasks(user._id),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      if (user.role === 'admin') {
        const usersRes = await usersAPI.getAll();
        setUsers(usersRes.data);
      } else {
        setUsers([user]);
      }
    } catch (err) { console.error(err); }
  };

  const loadProjectTasks = async (projectId) => {
    const res = await tasksAPI.getByProject(projectId);
    setTasks(prev => {
      const filtered = prev.filter(t => t.projectId !== projectId);
      return [...filtered, ...res.data];
    });
  };

  const nav = (v, projId) => {
    setView(v);
    if (projId) { setCurrentProjectId(projId); loadProjectTasks(projId); }
    setModal(null);
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text3)',background:'var(--bg)'}}>Loading...</div>;
  if (!user) return <AuthPage onLogin={u => { setUser(u); }} />;

  const currentProject = projects.find(p => p._id === currentProjectId);
  const projectTasks = tasks.filter(t => (t.projectId?._id||t.projectId) === currentProjectId);
  const myTasks = tasks.filter(t => (t.assigneeId?._id||t.assigneeId) === user._id);
  const overdueCount = myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length;

  const handleCreateProject = async (form) => {
    try {
      const res = await projectsAPI.create(form);
      setProjects(prev => [...prev, res.data]);
      setModal(null);
      nav('project', res.data._id);
    } catch (err) { alert(err.response?.data?.error || 'Error creating project'); }
  };

  const handleCreateTask = async (form) => {
    try {
      const res = await tasksAPI.create({ ...form, projectId: currentProjectId });
      setTasks(prev => [...prev, res.data]);
      setModal(null);
    } catch (err) { alert(err.response?.data?.error || 'Error creating task'); }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await tasksAPI.update(taskId, updates);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setModal(null);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const res = await usersAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
    } catch (err) { alert('Error'); }
  };

  const handleSaveProfile = async (name) => {
    try {
      const res = await usersAPI.updateMe({ name });
      setUser(res.data);
    } catch (err) { alert('Error'); }
  };

  const topbarActions = () => {
    if (view === 'projects' && user.role === 'admin')
      return <button className="btn btn-primary btn-sm" onClick={() => setModal('create-project')}>+ New Project</button>;
    if (view === 'project' && (currentProject?.adminId?._id||currentProject?.adminId) === user._id || (view === 'project' && user.role === 'admin'))
      return <button className="btn btn-primary btn-sm" onClick={() => setModal('create-task')}>+ Add Task</button>;
    if (view === 'members' && user.role === 'admin')
      return <button className="btn btn-primary btn-sm" onClick={() => setModal('invite')}>+ Invite User</button>;
    if (view === 'profile')
      return <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem('token'); setUser(null); }}>Sign out</button>;
    return null;
  };

  const viewTitles = { dashboard: 'Dashboard', projects: 'Projects', project: currentProject?.name||'Project', mytasks: 'My Tasks', members: 'Team Members', profile: 'Profile' };

  return (
    <div className="app">
      <Sidebar user={user} view={view} onNav={nav} projects={projects} myTaskCount={myTasks.filter(t=>t.status!=='done').length} overdueCount={overdueCount} />
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">{viewTitles[view]||'TaskFlow'}</span>
          {topbarActions()}
          <div className="avatar" style={{background:user.color+'22',color:user.color,cursor:'pointer'}} onClick={()=>nav('profile')}>{initials(user.name)}</div>
        </div>
        <div className="content">
          {view === 'dashboard' && <Dashboard user={user} projects={projects} tasks={tasks} users={users} />}
          {view === 'projects' && <Projects user={user} projects={projects} tasks={tasks} onOpenProject={id=>nav('project',id)} onCreateProject={()=>setModal('create-project')} />}
          {view === 'project' && <TaskBoard user={user} project={currentProject} tasks={projectTasks} users={users} onCreateTask={s=>setModal({type:'create-task',status:s})} onOpenTask={t=>setModal({type:'task-detail',task:t})} onUpdateTask={handleUpdateTask} />}
          {view === 'mytasks' && <MyTasks user={user} tasks={tasks} projects={projects} />}
          {view === 'members' && <Members user={user} users={users} tasks={tasks} onUpdateRole={handleUpdateRole} />}
          {view === 'profile' && <Profile user={user} projects={projects} tasks={tasks} onSave={handleSaveProfile} />}
        </div>
      </div>

      {modal === 'create-project' && <CreateProjectModal users={users} currentUser={user} onClose={()=>setModal(null)} onSubmit={handleCreateProject} />}
      {(modal?.type === 'create-task' || modal === 'create-task') && <CreateTaskModal project={currentProject} users={users} defaultStatus={modal?.status||'todo'} onClose={()=>setModal(null)} onSubmit={handleCreateTask} />}
      {modal?.type === 'task-detail' && <TaskDetailModal task={modal.task} project={currentProject} users={users} currentUser={user} onClose={()=>setModal(null)} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />}
      {modal === 'invite' && (
        <Modal title="Invite User" onClose={()=>setModal(null)} footer={<><button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={async()=>{const name=document.getElementById('inv-name')?.value?.trim();const email=document.getElementById('inv-email')?.value?.trim();const pass=document.getElementById('inv-pass')?.value;const role=document.getElementById('inv-role')?.value;if(!name||!email||!pass)return;try{const r=await authAPI.signup({name,email,password:pass});const rr=await usersAPI.updateRole(r.data.user._id,role);setUsers(prev=>[...prev,rr.data]);setModal(null);}catch(e){alert(e.response?.data?.error||'Error');}}}>Add User</button></>}>
          <div className="form-group"><label className="form-label">Name</label><input className="form-input" id="inv-name" placeholder="Full name" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" id="inv-email" type="email" placeholder="user@example.com" /></div>
          <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" id="inv-pass" type="password" placeholder="Min 6 chars" /></div>
          <div className="form-group"><label className="form-label">Role</label><select className="form-select" id="inv-role"><option value="member">Member</option><option value="admin">Admin</option></select></div>
        </Modal>
      )}
    </div>
  );
}
