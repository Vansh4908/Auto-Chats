const fs = require('fs');
let code = fs.readFileSync('c:/projects/foodchow-app/src/App.jsx', 'utf-8');

// 1. Update ConnectPage to redirect
code = code.replace(
  /const handleConnect = async \(platform\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?\}[\s\S]*?\};\s*return \(/,
  `const handleConnect = (platform) => {
    if (platform === "facebook") {
      setConnecting(platform);
      setTimeout(() => { setConnecting(null); onConnected(platform, null); }, 1800);
      return;
    }
    setConnecting(platform);
    // Real OAuth Redirect
    window.location.href = "http://localhost:5000/api/auth/instagram";
  };
  return (`
);

// 2. Update App useEffect to check for token in URL
code = code.replace(
  /React\.useEffect\(\(\) => \{\n\s*if \(isConnected\) \{\n\s*fetchData\(\);\n\s*\}\n\s*\}, \[isConnected\]\);/,
  `React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !isConnected) {
      // Validate token and fetch user profile
      fetch('http://localhost:5000/api/user/me', {
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          handleConnected('instagram', data.profile);
          window.history.replaceState({}, document.title, window.location.pathname); // Clear token from URL
        }
      });
    }

    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);`
);

// 3. Make Sidebar Profile clickable
code = code.replace(
  /<div className="sidebar-user">\n\s*<div className="user-avatar">JG<\/div>/,
  `<div className="sidebar-user" style={{ cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} onClick={() => { if (userProfile?.instagram?.username) window.open(\`https://instagram.com/\${userProfile.instagram.username.replace('@','')}\`, '_blank'); }}>
        <div className="user-avatar">{userProfile ? userProfile.firstName[0] + userProfile.lastName[0] : "JG"}</div>`
);

fs.writeFileSync('c:/projects/foodchow-app/src/App.jsx', code);
