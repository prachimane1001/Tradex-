function AuthModal({ mode = 'login', onClose, onLoginSuccess, showToast }) {
  const [authMode, setAuthMode] = React.useState(mode);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('user');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (authMode === 'register' && !name)) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const body = authMode === 'login' 
        ? { email, password }
        : { name, email, password, role };

      const res = await window.API.post(endpoint, body);
      if (res.success) {
        window.API.setToken(res.token);
        showToast(res.message, 'success');
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@tradex.com');
      setPassword('admin123');
    } else {
      setEmail('user@tradex.com');
      setPassword('password123');
    }
    setAuthMode('login');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {authMode === 'login' ? 'Log In to TradeX' : 'Create Trader Account'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Quick Fill Demo Credentials */}
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            ⚡ QUICK DEMO LOGIN LOGIN:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
              onClick={() => fillDemoAccount('user')}
            >
              Demo Trader ($100k)
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1, borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--amber)' }}
              onClick={() => fillDemoAccount('admin')}
            >
              Admin Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {authMode === 'register' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input 
                type="text" 
                className="input-glass"
                placeholder="John Trader"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              className="input-glass"
              placeholder="trader@tradex.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              className="input-glass"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account Role</label>
              <select className="input-glass" value={role} onChange={e => setRole(e.target.value)}>
                <option value="user">Trader (Paper Trading Account - $100k Virtual Funds)</option>
                <option value="admin">Administrator (Stock Listing & Trading Controls)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {authMode === 'login' ? (
            <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); }} style={{ color: 'var(--cyan)' }}>Register now</a></span>
          ) : (
            <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); }} style={{ color: 'var(--cyan)' }}>Log in</a></span>
          )}
        </div>
      </div>
    </div>
  );
}

window.AuthModal = AuthModal;
