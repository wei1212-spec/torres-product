import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now Log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-panel">
        <div className="auth-header">
          <span className="eyebrow">Secure access</span>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        </div>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <form onSubmit={submit}>
          <label>Username
            <input value={form.username} onChange={set('username')} required autoFocus />
          </label>
          {mode === 'register' && (
            <label>Email
              <input type="email" value={form.email} onChange={set('email')} required />
            </label>
          )}
          <label>Password
            <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
          </label>
          <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}</button>
        </form>

        {mode === 'login' && (
          <div className="demo-credentials">
            <span>Demo accounts</span>
            <strong>admin</strong> / <strong>admin123</strong>
            <span className="divider">•</span>
            <strong>user</strong> / <strong>user123</strong>
          </div>
        )}

        <p className="muted inline-link">
          {mode === 'login' ? 'No account yet? ' : 'Already registered? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Register' : 'Login'}
          </a>
        </p>
      </div>

      <aside className="auth-spotlight">
        <div className="spotlight-badge">Inventory control</div>
        <h2>Run your product operations with clarity.</h2>
        <ul>
          <li>Track stock and product activity</li>
          <li>Review pricing and performance</li>
          <li>Separate admin actions from viewer access</li>
        </ul>
      </aside>
    </div>
  );
}
