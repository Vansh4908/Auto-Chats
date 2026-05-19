const fs = require('fs');
let code = fs.readFileSync('c:/projects/foodchow-app/src/App.jsx', 'utf-8');

// Dashboard changes
code = code.replace(
  /const Dashboard = \(\{ setPage, onUpgrade \}\) => \{[\s\S]*?const campaigns = \[[^\]]*\];/,
  `const Dashboard = ({ setPage, onUpgrade, campaigns, userProfile }) => {`
);

code = code.replace(
  /<p style=\{\{ color: C\.mid, fontSize: 13\.5, marginTop: 3 \}\}>1 \/ 25,000 DMs used this month<\/p>\n\s*<\/div>\n\s*<button className="btn btn-primary" onClick=\{\(\) => setPage\("campaigns"\)\}/,
  `<p style={{ color: C.mid, fontSize: 13.5, marginTop: 3 }}>1 / 25,000 DMs used this month</p>
        </div>
        {userProfile && userProfile.instagram && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, padding: "8px 16px", borderRadius: 12, border: \`1px solid \${C.border}\` }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{userProfile.instagram.profilePic}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{userProfile.instagram.username}</p>
              <p style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>✓ Business Account</p>
            </div>
            <div style={{ marginLeft: 10, paddingLeft: 10, borderLeft: \`1px solid \${C.border}\` }}>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{userProfile.instagram.followers}</p>
              <p style={{ fontSize: 11, color: C.muted }}>Followers</p>
            </div>
          </div>
        )}
        <button className="btn btn-primary" onClick={() => setPage("campaigns")}`
);

// CampaignsPage changes
code = code.replace(
  /const CampaignsPage = \(\) => \{[\s\S]*?const filtered = tab === "all" \? campaigns : campaigns\.filter\(c => c\.status === tab\);/,
  `const CampaignsPage = ({ posts, campaigns, onToggleStatus }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? campaigns : campaigns.filter(c => c.status === tab);`
);

code = code.replace(
  /\{c\.status === "active" \? <button className="btn btn-ghost btn-sm"><Icon name="pause" size=\{13\} \/><\/button>\n\s*: c\.status === "paused" \? <button className="btn btn-ghost btn-sm"><Icon name="play" size=\{13\} \/><\/button>\n\s*: <button className="btn btn-primary btn-sm" style=\{\{ fontSize: 12 \}\}>Setup →<\/button>\}/,
  `{c.status === "active" ? <button className="btn btn-ghost btn-sm" onClick={() => onToggleStatus(c.id, "active")}><Icon name="pause" size={13} /></button>
                : c.status === "paused" ? <button className="btn btn-ghost btn-sm" onClick={() => onToggleStatus(c.id, "paused")}><Icon name="play" size={13} /></button>
                : <button className="btn btn-primary btn-sm" style={{ fontSize: 12 }} onClick={() => onToggleStatus(c.id, "setup")}>Setup →</button>}`
);

// SidebarNav changes
code = code.replace(
  /const SidebarNav = \(\{ page, setPage, onUpgrade, isConnected, connectedPlatform \}\) => \{/,
  `const SidebarNav = ({ page, setPage, onUpgrade, isConnected, connectedPlatform, userProfile }) => {`
);

code = code.replace(
  /<p className="user-name">Jordan Garcia<\/p>\n\s*<p className=\{`user-status \$\{isConnected \? "connected" : ""\}`\}>\n\s*\{isConnected \? `● \$\{connectedPlatform\} connected` : "● IG not connected"\}\n\s*<\/p>/,
  `<p className="user-name">{userProfile ? \`\${userProfile.firstName} \${userProfile.lastName}\` : "User"}</p>
          <p className={\`user-status \${isConnected ? "connected" : ""}\`}>
            {isConnected ? \`● \${connectedPlatform} connected\` : "● IG not connected"}
          </p>`
);

// App changes
code = code.replace(
  /const handleConnected = \(platform\) => \{[\s\S]*?setShowDemo\(true\);\n  \};/,
  `const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:5000/api/posts');
      setPosts(await pRes.json());
      const cRes = await fetch('http://localhost:5000/api/campaigns');
      setCampaigns(await cRes.json());
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  React.useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  const handleConnected = (platform, profile) => {
    setIsConnected(true);
    setConnectedPlatform(platform === "instagram" ? "Instagram" : "Facebook");
    if (profile) setUserProfile(profile);
    setPage("dashboard");
    setShowDemo(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await fetch(\`http://localhost:5000/api/campaigns/\${id}/status\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData(); // Refresh campaigns
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };`
);

code = code.replace(
  /import \{ useState, useCallback \} from "react";/,
  `import React, { useState, useCallback } from "react";`
);

code = code.replace(
  /<SidebarNav page=\{page\} setPage=\{setPage\} onUpgrade=\{\(\) => setShowUpgrade\(true\)\} isConnected=\{isConnected\} connectedPlatform=\{connectedPlatform\} \/>\n\s*<div className="main">\n\s*\{page === "dashboard" && <Dashboard setPage=\{p => setPage\(p\)\} onUpgrade=\{\(\) => setShowUpgrade\(true\)\} \/>\}\n\s*\{page === "campaigns" && <CampaignsPage \/>\}/,
  `<SidebarNav page={page} setPage={setPage} onUpgrade={() => setShowUpgrade(true)} isConnected={isConnected} connectedPlatform={connectedPlatform} userProfile={userProfile} />
            <div className="main">
              {page === "dashboard" && <Dashboard setPage={p => setPage(p)} onUpgrade={() => setShowUpgrade(true)} campaigns={campaigns} userProfile={userProfile} />}
              {page === "campaigns" && <CampaignsPage posts={posts} campaigns={campaigns} onToggleStatus={handleToggleStatus} />}`
);

fs.writeFileSync('c:/projects/foodchow-app/src/App.jsx', code);
