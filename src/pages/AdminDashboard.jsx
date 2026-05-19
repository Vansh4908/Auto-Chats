import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Video, Upload, Plus, Trash2, LogOut, Tag, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({ users: [], templates: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Template form state
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    triggerKeywords: '',
    replyMessage: '',
    emoji: '🍽️'
  });

  // Video form state
  const [newVideo, setNewVideo] = useState({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [usersRes, templatesRes, videosRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers }),
        fetch('http://localhost:5000/api/admin/templates', { headers }),
        fetch('http://localhost:5000/api/admin/videos', { headers })
      ]);
      const users = await usersRes.json();
      const templates = await templatesRes.json();
      const videos = await videosRes.json();
      setData({
        users: Array.isArray(users) ? users : [],
        templates: Array.isArray(templates) ? templates : [],
        videos: Array.isArray(videos) ? videos : []
      });
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
    setLoading(false);
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(newTemplate)
      });
      if (res.ok) {
        setNewTemplate({ title: '', content: '', triggerKeywords: '', replyMessage: '', emoji: '🍽️' });
        fetchData();
        showToast('✅ Template created successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this template? Users will no longer see it.')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
      showToast('🗑️ Template deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!newVideo.file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('title', newVideo.title);
    formData.append('description', newVideo.description);
    formData.append('video', newVideo.file);
    try {
      const res = await fetch('http://localhost:5000/api/admin/videos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });
      if (res.ok) {
        setNewVideo({ title: '', description: '', file: null });
        fetchData();
        showToast('✅ Video uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video? It will be removed for all users.')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
      showToast('🗑️ Video deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', background: '#FAFAF9' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👑</div>
        <p style={{ color: '#78716C' }}>Loading Admin Panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9', fontFamily: 'DM Sans, sans-serif', color: '#1C1917' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          background: '#1C1917', color: 'white', padding: '12px 20px',
          borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toast}
        </div>
      )}

      {/* Admin Sidebar */}
      <div style={{ width: 240, background: 'white', borderRight: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px', borderBottom: '1px solid #E7E5E4' }}>
          <h1 style={{ color: '#F97316', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            👑 Admin Panel
          </h1>
        </div>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { id: 'users', label: 'Users', Icon: Users },
            { id: 'templates', label: 'Templates', Icon: FileText },
            { id: 'videos', label: 'Learning Videos', Icon: Video }
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14,
                background: activeTab === id ? '#FFF7ED' : 'transparent',
                color: activeTab === id ? '#F97316' : '#57534E',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} /> {label}
              {id === 'templates' && data.templates.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#F97316', color: 'white', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  {data.templates.length}
                </span>
              )}
              {id === 'videos' && data.videos.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#6366F1', color: 'white', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  {data.videos.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #E7E5E4' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#EF4444', background: 'transparent', fontWeight: 500, fontSize: 14 }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* ── Users Tab ── */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 24 }}>
                Registered Users <span style={{ fontSize: 16, color: '#A8A29E', fontFamily: 'DM Sans' }}>({data.users.length})</span>
              </h2>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E7E5E4', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#FAFAF9', borderBottom: '1px solid #E7E5E4' }}>
                      {['Name', 'Email', 'Joined', 'IG Connected'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#A8A29E', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: 32, textAlign: 'center', color: '#A8A29E' }}>No users found.</td></tr>
                    ) : data.users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                        <td style={{ padding: '12px 16px', color: '#57534E' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', color: '#A8A29E' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {u.instagram?.accountId ? (
                            <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✓ @{u.instagram.username}</span>
                          ) : (
                            <span style={{ background: '#F5F5F4', color: '#A8A29E', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Not connected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Templates Tab ── */}
          {activeTab === 'templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Manage Templates</h2>
                  <p style={{ color: '#78716C', fontSize: 14 }}>These appear as default campaign templates for all users in the Campaign Wizard.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
                {/* Create Form */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E7E5E4', padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>➕ Add New Template</h3>
                  <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Emoji</label>
                      <input
                        type="text" maxLength={2} required
                        value={newTemplate.emoji}
                        onChange={e => setNewTemplate({ ...newTemplate, emoji: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 20, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Template Title *</label>
                      <input
                        type="text" required placeholder="e.g. Offer Campaign"
                        value={newTemplate.title}
                        onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Description / Content *</label>
                      <textarea
                        required rows={3} placeholder="What does this template do?"
                        value={newTemplate.content}
                        onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Default Trigger Keywords</label>
                      <input
                        type="text" placeholder="e.g. Link, Deal, Menu"
                        value={newTemplate.triggerKeywords}
                        onChange={e => setNewTemplate({ ...newTemplate, triggerKeywords: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      />
                      <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>Comma-separated keywords that trigger the DM</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Default DM Reply Message</label>
                      <textarea
                        rows={2} placeholder="Hey {{name}}! Here's your exclusive offer:"
                        value={newTemplate.replyMessage}
                        onChange={e => setNewTemplate({ ...newTemplate, replyMessage: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ background: '#F97316', color: 'white', padding: '12px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Plus size={16} /> Create Template
                    </button>
                  </form>
                </div>

                {/* Templates List */}
                <div>
                  {data.templates.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, background: 'white', borderRadius: 16, border: '2px dashed #E7E5E4' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No templates yet</p>
                      <p style={{ color: '#A8A29E', fontSize: 13 }}>Create your first template to show users in the Campaign Wizard</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {data.templates.map(t => (
                        <div key={t._id} style={{ background: 'white', borderRadius: 14, border: '1px solid #E7E5E4', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ background: '#FFF7ED', padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 28 }}>{t.emoji || '🍽️'}</span>
                            <h4 style={{ fontWeight: 700, fontSize: 15, color: '#F97316', flex: 1 }}>{t.title}</h4>
                          </div>
                          <div style={{ padding: '12px 16px', flex: 1 }}>
                            <p style={{ fontSize: 13, color: '#57534E', marginBottom: 10, lineHeight: 1.5 }}>{t.content}</p>
                            {t.triggerKeywords && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Tag size={11} color="#A8A29E" />
                                <span style={{ fontSize: 12, color: '#A8A29E' }}>Keywords: {t.triggerKeywords}</span>
                              </div>
                            )}
                            {t.replyMessage && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <MessageSquare size={11} color="#A8A29E" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: '#A8A29E', lineHeight: 1.4 }}>"{t.replyMessage.slice(0, 60)}{t.replyMessage.length > 60 ? '...' : ''}"</span>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '10px 16px', borderTop: '1px solid #F5F5F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#A8A29E' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => handleDeleteTemplate(t._id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Videos Tab ── */}
          {activeTab === 'videos' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Manage Learning Videos</h2>
                <p style={{ color: '#78716C', fontSize: 14 }}>Videos uploaded here appear in the "Learn" tab for all users.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
                {/* Upload Form */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E7E5E4', padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>📤 Upload Video</h3>
                  <form onSubmit={handleUploadVideo} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Video Title *</label>
                      <input
                        type="text" required placeholder="e.g. How to create campaigns"
                        value={newVideo.title}
                        onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#57534E', marginBottom: 6 }}>Description</label>
                      <textarea
                        rows={2} placeholder="Brief description of this video"
                        value={newVideo.description}
                        onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                        style={{ width: '100%', border: '1px solid #E7E5E4', padding: '10px 12px', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <label style={{ border: '2px dashed #E7E5E4', borderRadius: 12, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: '#FAFAF9', transition: 'border-color 0.15s' }}>
                      <Upload size={24} color={newVideo.file ? '#F97316' : '#A8A29E'} style={{ marginBottom: 8 }} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: newVideo.file ? '#F97316' : '#57534E' }}>
                        {newVideo.file ? newVideo.file.name : 'Click to select MP4 file'}
                      </span>
                      {newVideo.file && (
                        <span style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>
                          {(newVideo.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                      <input type="file" accept="video/mp4,video/quicktime" className="hidden" style={{ display: 'none' }}
                        onChange={e => setNewVideo({ ...newVideo, file: e.target.files[0] })} />
                    </label>
                    <button
                      type="submit" disabled={!newVideo.file || uploading}
                      style={{ background: (!newVideo.file || uploading) ? '#E7E5E4' : '#F97316', color: (!newVideo.file || uploading) ? '#A8A29E' : 'white', padding: '12px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: (!newVideo.file || uploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </form>
                </div>

                {/* Videos List */}
                <div>
                  {data.videos.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, background: 'white', borderRadius: 16, border: '2px dashed #E7E5E4' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No videos uploaded yet</p>
                      <p style={{ color: '#A8A29E', fontSize: 13 }}>Upload your first learning video to help users</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {data.videos.map(v => (
                        <div key={v._id} style={{ background: 'white', borderRadius: 14, border: '1px solid #E7E5E4', overflow: 'hidden' }}>
                          <video
                            src={`http://localhost:5000${v.videoUrl}`}
                            style={{ width: '100%', height: 160, objectFit: 'cover', background: '#1C1917', display: 'block' }}
                            controls
                          />
                          <div style={{ padding: '12px 14px' }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.title}</h4>
                            <p style={{ fontSize: 11, color: '#A8A29E', marginBottom: 6 }}>{new Date(v.createdAt).toLocaleDateString()}</p>
                            {v.description && <p style={{ fontSize: 12, color: '#57534E', marginBottom: 10, lineHeight: 1.4 }}>{v.description}</p>}
                            <button
                              onClick={() => handleDeleteVideo(v._id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                            >
                              <Trash2 size={12} /> Delete Video
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
