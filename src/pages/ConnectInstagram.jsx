import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Instagram = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ConnectInstagram() {
  const { user, updateIgConnection } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if we just returned from OAuth with a token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const igUserId = params.get('ig_user_id');
    
    if (token) {
      handleTokenConnection(token, igUserId);
    }
  }, [location]);

  const handleTokenConnection = async (token, igUserId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ig/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ accessToken: token, ig_user_id: igUserId })
      });
      const data = await res.json();
      
      if (res.ok) {
        updateIgConnection(true);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Failed to connect Instagram account');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ig/auth-url`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to generate OAuth URL');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const styles = `
    .connect-wrapper {
      min-height: 100vh;
      background: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .bg-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 400px;
      background: rgba(249, 115, 22, 0.15);
      filter: blur(120px);
      border-radius: 9999px;
      pointer-events: none;
    }
    .connect-card {
      background: rgba(31, 41, 55, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(55, 65, 81, 0.5);
      border-radius: 1.5rem;
      max-width: 28rem;
      width: 100%;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 10;
    }
    .ig-icon-box {
      width: 5rem;
      height: 5rem;
      margin: 0 auto 1.5rem;
      background: linear-gradient(to top right, #facc15, #f97316, #a855f7);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: rotate(-6deg);
    }
    .connect-title {
      font-size: 1.5rem;
      font-bold: 700;
      color: white;
      margin-bottom: 0.5rem;
    }
    .connect-subtitle {
      color: #9ca3af;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .req-box {
      background: rgba(55, 65, 81, 0.5);
      border: 1px solid #4b5563;
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 2rem;
      text-align: left;
    }
    .req-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #fb923c;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    .req-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      color: #d1d5db;
      font-size: 0.875rem;
    }
    .req-item:last-child { margin-bottom: 0; }
    .connect-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(to right, #a855f7, #f97316, #eab308);
      color: white;
      font-weight: 700;
      padding: 0.875rem;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .connect-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .logout-link {
      margin-top: 1.5rem;
      display: block;
      color: #6b7280;
      font-size: 0.875rem;
      text-decoration: none;
      background: none;
      border: none;
      width: 100%;
      cursor: pointer;
    }
    .logout-link:hover { color: #d1d5db; }
  `;

  return (
    <div className="connect-wrapper">
      <style>{styles}</style>
      <div className="bg-glow" />
      
      <div className="connect-card">
        <div className="ig-icon-box">
          <Instagram size={40} color="white" />
        </div>

        <h1 className="connect-title">Connect your Instagram</h1>
        <p className="connect-subtitle">
          You need to link your Instagram Business Account to unlock DM automation features.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div className="req-box">
          <p className="req-title">Requirements for Business Login:</p>
          <div className="req-item">
            <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
            <p>Must be a <strong>Professional (Business or Creator)</strong> Account</p>
          </div>
          <div className="req-item">
            <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
            <p>You must <strong>accept the Tester invite</strong> in IG Settings</p>
          </div>
          <div className="req-item">
            <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
            <p>Meta Dashboard Redirect URI must match exactly</p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          disabled={loading}
          className="connect-btn"
        >
          {loading ? 'Connecting...' : (
            <>
              <Instagram size={20} />
              Connect with Meta
            </>
          )}
        </button>

        <button 
          onClick={() => {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
          }}
          className="logout-link"
        >
          Log out and connect later
        </button>
      </div>
    </div>
  );
}
