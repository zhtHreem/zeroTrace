import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './landing.css';
import useAuth from './useAuth';
import Logo from './Logo';

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function Nav() {
  const { user, uid, login, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const go = (id) => { setOpen(false); return pathname === '/' ? scrollTo(id) : navigate('/', { state: { scrollTo: id } }); };
  const cls = ({ isActive }) => (isActive ? 'on' : '');

  return (
    <nav className="zt-nav">
      <div className="zt-wrap zt-nav-in">
        <div className="zt-logo" onClick={() => (pathname === '/' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/'))}>
          <Logo />
        </div>
        <div className="zt-links">
          <button onClick={() => go('how')}>How it works</button>
          <NavLink to="/surveys" className={cls}>Surveys</NavLink>
          <NavLink to="/createform" className={cls}>Create</NavLink>
          {user && <NavLink to={`/user/${uid}`} className={cls}>My surveys</NavLink>}
        </div>
        <div className="zt-nav-right">
          <button className="zt-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button>
          {user ? (
            <>
              <Link to={`/user/${uid}`} title="Profile">
                <img className="zt-avatar" alt={user.name || 'Profile'} src={user.picture || user.imageUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${uid}`} />
              </Link>
              <button className="zt-btn sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <button className="zt-btn sm primary" onClick={() => login()}>Sign in with Google</button>
          )}
        </div>
      </div>
      {open && (
        <div className="zt-mobile">
          <button onClick={() => go('how')}>How it works</button>
          <Link to="/surveys">Surveys</Link>
          <Link to="/createform">Create</Link>
          {user && <Link to={`/user/${uid}`}>My surveys</Link>}
        </div>
      )}
    </nav>
  );
}

export function Foot() {
  return (
    <footer className="zt-foot">
      <div className="zt-wrap zt-foot-in">
        <div className="zt-logo"><Logo size={24} /></div>
        <span className="zt-mono">© {new Date().getFullYear()} · Surveys without a trace</span>
        <span className="zt-mono zt-foot-note">We count visits anonymously, with no cookies. Survey pages are never counted.</span>
      </div>
    </footer>
  );
}

// Wraps every page: themed shell + nav + footer + toasts.
export default function Shell({ children }) {
  return (
    <div className="zt">
      <Nav />
      <main className="zt-main">{children}</main>
      <Foot />
      <ToastContainer position="bottom-right" autoClose={4000} />
    </div>
  );
}
