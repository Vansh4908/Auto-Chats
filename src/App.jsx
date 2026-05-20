import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";

const C = {
  orange: "#00bfa5", orangeLight: "#e0f2f1", orangeMid: "#b2dfdb",
  indigo: "#004d40", indigoLight: "#e0f2f1",
  dark: "#1C1917", mid: "#44403C", muted: "#A8A29E",
  border: "#E7E5E4", bg: "#FAFAF9", white: "#FFFFFF",
  green: "#22C55E", greenLight: "#F0FDF4",
  blue: "#3B82F6", blueLight: "#EFF6FF",
  red: "#EF4444", redLight: "#FEF2F2",
  purple: "#A855F7", purpleLight: "#F5F3FF",
  teal: "#20C997",
  tealLight: "#E8F8F4",
  tealMid: "#B7EAD5",
  amber: "#F8981D",
  amberLight: "#FFF4EB"
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.dark};}
  h1,h2,h3,h4{font-family:'DM Sans',sans-serif;}

  .app{min-height:100vh;display:flex;}
  .sidebar{width:236px;flex-shrink:0;background:${C.white};border-right:1px solid ${C.border};display:flex;flex-direction:column;min-height:100vh;position:sticky;top:0;overflow-y:auto;}
  .sidebar-logo{padding:1.2rem 1.4rem;border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:8px;font-family:inherit;font-weight:800;font-size:18px;color:${C.dark};}
  .sidebar-logo span{color:${C.orange};}
  .sidebar-logo svg{width:26px;height:26px;flex-shrink:0;}
  .sidebar-user{padding:1rem 1.2rem;display:flex;align-items:center;gap:10px;border-bottom:1px solid ${C.border};}
  .user-avatar{width:38px;height:38px;border-radius:10px;background:${C.indigo};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;}
  .user-name{font-size:14px;font-weight:700;line-height:1.2;color:${C.dark};}
  .user-status{font-size:11px;color:${C.muted};display:flex;align-items:center;gap:4px;font-weight:500;}
  .user-status.connected{color:${C.green};}
  .nav-section{padding:0.8rem 0.8rem 0;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;color:${C.mid};transition:all 0.2s;border:none;background:transparent;width:100%;text-align:left;position:relative;margin-bottom:2px;}
  .nav-item:hover{background:${C.orangeLight};color:${C.orange};}
  .nav-item.active{background:${C.orange};color:white;box-shadow:0 4px 12px rgba(249,115,22,0.25);}
  .nav-item.active svg{stroke:white !important;}
  .nav-badge{background:${C.red};color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:auto;}
  .nav-new{background:${C.orangeLight};color:${C.orange};font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;letter-spacing:0.05em;margin-left:auto;}
  .sidebar-bottom{margin-top:auto;padding:1rem;border-top:1px solid ${C.border};}
  .usage-row{margin-bottom:10px;}
  .usage-label{display:flex;justify-content:space-between;font-size:11.5px;color:${C.muted};margin-bottom:4px;font-weight:500;}
  .usage-track{height:6px;border-radius:3px;background:${C.border};}
  .usage-fill{height:100%;border-radius:3px;background:${C.orange};transition:width 0.5s;}
  .upgrade-btn{width:100%;padding:10px;background:${C.indigo};color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;transition:all 0.2s;}
  .upgrade-btn:hover{background:#4F46E5;transform:translateY(-1px);}
  .support-btn{width:100%;padding:10px;background:#25D366;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;}
  .support-btn:hover{opacity:0.9;transform:scale(0.98);}
  .logout-btn{width:100%;padding:8px;background:transparent;color:${C.muted};border:none;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;transition:all 0.2s;}
  .logout-btn:hover{background:${C.redLight};color:${C.red};}

  .main{flex:1;overflow-y:auto;background:white;}
  .page{max-width:1000px;margin:0 auto;padding:2rem;}

  .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;border:1.5px solid transparent;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-primary{background:${C.teal};color:white;border-color:${C.teal};}
  .btn-primary:hover{background:#24B2A5;border-color:#24B2A5;transform:translateY(-2px);box-shadow:0 8px 15px rgba(46,196,182,0.25);}
  .btn-primary:disabled{opacity:0.4;cursor:default;transform:none !important;box-shadow:none;}
  .btn-secondary{background:white;color:${C.dark};border-color:${C.border};}
  .btn-secondary:hover{background:${C.bg};border-color:${C.muted};}
  .btn-ghost{background:transparent;border-color:transparent;color:${C.mid};padding:6px 10px;}
  .btn-ghost:hover{color:${C.dark};background:${C.tealLight};}
  .btn-sm{padding:5px 12px;font-size:13px;border-radius:8px;}
  .btn-indigo{background:${C.indigo};color:white;border-color:${C.indigo};}
  .btn-indigo:hover{background:#4F46E5;transform:translateY(-2px);box-shadow:0 8px 15px rgba(99,102,241,0.25);}

  .card{background:${C.white};border-radius:12px;border:1px solid ${C.border};padding:1.5rem;}
  .card-sm{padding:1rem 1.25rem;}

  input,select,textarea{font-family:'DM Sans',sans-serif;font-size:13.5px;color:${C.dark};background:${C.white};border:1.5px solid ${C.border};border-radius:8px;padding:8px 12px;width:100%;outline:none;transition:border-color 0.14s;}
  input:focus,select:focus,textarea:focus{border-color:${C.orange};}
  textarea{resize:vertical;min-height:80px;}
  label{font-size:12.5px;font-weight:500;color:${C.mid};display:block;margin-bottom:4px;}

  .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:500;}
  .tag-orange{background:${C.orangeLight};color:${C.orange};}
  .tag-green{background:${C.greenLight};color:${C.green};}
  .tag-blue{background:${C.blueLight};color:${C.blue};}
  .tag-red{background:${C.redLight};color:${C.red};}
  .tag-purple{background:${C.purpleLight};color:${C.purple};}
  .tag-muted{background:${C.bg};color:${C.mid};border:1px solid ${C.border};}
  .tag-indigo{background:${C.indigoLight};color:${C.indigo};}

  .stat-card{background:${C.white};border:1px solid ${C.border};border-radius:10px;padding:1rem 1.25rem;}
  .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:${C.muted};font-weight:600;margin-bottom:4px;}
  .stat-value{font-family:'DM Sans',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.03em;color:${C.dark};}
  .stat-sub{font-size:11px;color:${C.muted};margin-top:3px;}

  .radio-card{border:1.5px solid ${C.border};border-radius:10px;padding:12px 14px;cursor:pointer;transition:all 0.14s;display:flex;gap:10px;align-items:flex-start;}
  .radio-card:hover{border-color:${C.orange};background:${C.orangeLight};}
  .radio-card.selected{border-color:${C.orange};background:${C.orangeLight};}
  .radio-dot{width:17px;height:17px;border-radius:50%;border:2px solid ${C.border};margin-top:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
  .radio-dot.selected{border-color:${C.orange};}
  .radio-dot.selected::after{content:'';width:7px;height:7px;border-radius:50%;background:${C.orange};}

  .check-card{border:1.5px solid ${C.border};border-radius:10px;padding:12px 14px;cursor:pointer;transition:all 0.14s;display:flex;gap:10px;align-items:flex-start;}
  .check-card:hover{border-color:${C.orange};}
  .check-card.selected{border-color:${C.orange};background:${C.orangeLight};}
  .check-box{width:17px;height:17px;border-radius:4px;border:2px solid ${C.border};margin-top:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
  .check-box.selected{border-color:${C.orange};background:${C.orange};}
  .check-box.selected::after{content:'✓';color:white;font-size:10px;font-weight:700;}

  .keyword-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 8px 3px 10px;background:${C.orangeLight};color:${C.orange};border-radius:20px;font-size:12px;font-weight:500;}
  .keyword-tag button{background:none;border:none;cursor:pointer;color:${C.orange};font-size:14px;line-height:1;padding:0;opacity:0.7;}
  .keyword-tag button:hover{opacity:1;}

  .toggle{width:38px;height:21px;border-radius:11px;background:${C.border};cursor:pointer;position:relative;transition:background 0.2s;border:none;flex-shrink:0;}
  .toggle.on{background:${C.orange};}
  .toggle::after{content:'';position:absolute;width:15px;height:15px;border-radius:50%;background:white;top:3px;left:3px;transition:transform 0.2s;}
  .toggle.on::after{transform:translateX(17px);}

  .modal-overlay{position:fixed;inset:0;background:rgba(28,25,23,0.55);display:flex;align-items:center;justify-content:center;z-index:200;padding:1rem;}
  .modal{background:${C.white};border-radius:16px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.18);}
  .modal-header{padding:1.5rem 1.5rem 0;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;}
  .modal-body{padding:0 1.5rem 1.5rem;}

  .step-indicator{display:flex;align-items:center;margin-bottom:1.25rem;}
  .step-num{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;font-family:'DM Sans',sans-serif;}
  .step-num.done{background:${C.green};color:white;}
  .step-num.active{background:${C.orange};color:white;}
  .step-num.todo{background:${C.border};color:${C.muted};}
  .step-connector{flex:1;min-width:12px;max-width:36px;height:1px;background:${C.border};margin:0 6px;}
  .step-connector.done{background:${C.green};}

  .bar{height:6px;border-radius:3px;background:${C.border};overflow:hidden;}
  .bar-fill{height:100%;border-radius:3px;background:${C.orange};transition:width 0.5s;}

  .tab-row{display:flex;gap:4px;border-bottom:1px solid ${C.border};margin-bottom:1.5rem;}
  .tab-btn{padding:8px 16px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;color:${C.muted};cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.14s;}
  .tab-btn.active{color:${C.orange};border-bottom-color:${C.orange};}

  .divider{height:1px;background:${C.border};margin:1.25rem 0;}
  .section-title{font-family:'DM Sans',sans-serif;font-size:17px;font-weight:700;margin-bottom:4px;}
  .section-sub{font-size:13.5px;color:${C.mid};margin-bottom:1.25rem;}

  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}

  .post-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
  .post-card{border:2px solid ${C.border};border-radius:12px;overflow:hidden;cursor:pointer;transition:all 0.15s;background:${C.white};}
  .post-card:hover{border-color:${C.orange};transform:translateY(-2px);box-shadow:0 6px 20px rgba(249,115,22,0.15);}
  .post-card.selected{border-color:${C.orange};box-shadow:0 0 0 3px rgba(249,115,22,0.15);}
  .post-thumb{height:120px;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(135deg,${C.orangeLight},${C.bg});position:relative;}
  .post-info{padding:10px 12px;}
  .post-title{font-size:12.5px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .post-meta{font-size:11px;color:${C.muted};}

  .empty-state{text-align:center;padding:3rem 2rem;}
  .empty-icon{font-size:38px;margin-bottom:1rem;}
  .empty-title{font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;margin-bottom:6px;}
  .empty-sub{font-size:13.5px;color:${C.mid};margin-bottom:1.5rem;}

  .flow-node{background:${C.white};border:1.5px solid ${C.border};border-radius:10px;padding:10px 14px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;}
  .flow-node.trigger{border-color:${C.orange};background:${C.orangeLight};}
  .flow-node.action{border-color:${C.blue};background:${C.blueLight};}
  .flow-node.condition{border-color:${C.purple};background:${C.purpleLight};}
  .flow-arrow{display:flex;justify-content:center;color:${C.muted};font-size:18px;margin:4px 0;}

  .video-card{background:${C.white};border:1px solid ${C.border};border-radius:12px;overflow:hidden;transition:all 0.15s;cursor:pointer;}
  .video-card:hover{border-color:${C.orange};box-shadow:0 4px 16px rgba(249,115,22,0.12);}
  .video-thumb{height:110px;display:flex;align-items:center;justify-content:center;font-size:36px;position:relative;}
  .video-play{position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;}
  .video-lock{position:absolute;top:8px;right:8px;background:rgba(28,25,23,0.7);color:white;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600;}
  .video-info{padding:10px 12px;}
  .video-title{font-size:13px;font-weight:600;margin-bottom:3px;}
  .video-meta{font-size:11px;color:${C.muted};}

  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .fade-in{animation:fadeIn 0.22s ease;}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
  .slide-up{animation:slideUp 0.3s ease;}

  .connect-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${C.bg};padding:2rem;flex:1;position:relative;overflow:hidden;}
  .connect-page::before{content:'';position:absolute;width:600px;height:600px;background:${C.tealLight};border-radius:50%;top:-200px;right:-200px;z-index:0;opacity:0.5;}
  .connect-page::after{content:'';position:absolute;width:400px;height:400px;background:${C.orangeLight};border-radius:50%;bottom:-100px;left:-100px;z-index:0;opacity:0.4;}
  .connect-card{background:${C.white};border-radius:32px;border:1px solid ${C.border};max-width:440px;width:100%;padding:3rem;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.08);position:relative;z-index:1;}
  .meta-badge{background:${C.tealLight};border:1px solid ${C.tealMid};border-radius:20px;padding:16px 20px;margin:1.5rem 0;text-align:left;}
  .ig-btn{width:100%;padding:16px;background:linear-gradient(135deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%);color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:800;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.2s;box-shadow:0 8px 20px rgba(253,29,29,0.25);}
  .ig-btn:hover{transform:translateY(-3px);box-shadow:0 12px 25px rgba(253,29,29,0.35);}
  .fb-btn{width:100%;padding:14px;background:#1877F2;color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:800;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.2s;margin-top:12px;box-shadow:0 8px 20px rgba(24,119,242,0.2);}
  .fb-btn:hover{transform:translateY(-2px);opacity:0.95;}

  .upgrade-modal{display:grid;grid-template-columns:1fr 1fr;max-width:720px;border-radius:16px;overflow:hidden;}
  .upgrade-left{background:linear-gradient(145deg,${C.indigo} 0%,${C.purple} 100%);padding:2.5rem;color:white;}
  .upgrade-right{padding:2rem;background:${C.white};}
  .feature-item{display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:13.5px;}
  .feature-check{width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .plan-card{border:2px solid ${C.border};border-radius:12px;padding:14px 16px;cursor:pointer;transition:all 0.15s;margin-bottom:10px;display:flex;align-items:center;gap:12px;}
  .plan-card.selected{border-color:${C.green};background:${C.greenLight};}
  .plan-badge{font-size:10px;font-weight:700;background:${C.green};color:white;padding:2px 8px;border-radius:4px;letter-spacing:0.05em;}

  .ig-account-card{display:flex;align-items:center;gap:12px;padding:14px;border:1.5px solid ${C.border};border-radius:12px;margin-bottom:10px;}
  .ig-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#833AB4,#FCB045);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;flex-shrink:0;}

  .dashboard-banner{border-radius:12px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}
  .table-wrap{width:100%;border-collapse:collapse;font-size:13px;}
  .table-wrap th{text-align:left;padding:6px 10px;color:${C.muted};font-weight:500;font-size:12px;border-bottom:1px solid ${C.border};}
  .table-wrap td{padding:10px 10px;border-bottom:1px solid ${C.bg};}

  .revenue-card{background:linear-gradient(135deg,${C.orange},#EF4444);border-radius:12px;padding:1.25rem;color:white;}

  .onboard-step{display:flex;align-items:flex-start;gap:16px;padding:14px 0;border-bottom:1px solid ${C.bg};}
  .onboard-num{width:30px;height:30px;border-radius:50%;background:${C.orangeLight};color:${C.orange};display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;flex-shrink:0;}

  /* ── Custom Wizard Split Layout ── */
  .wizard-split{display:flex;gap:0;max-width:980px;width:100%;border-radius:16px;overflow:hidden;background:${C.white};box-shadow:0 24px 60px rgba(0,0,0,0.18);}
  .wizard-left{flex:1;min-width:0;display:flex;flex-direction:column;max-height:90vh;}
  .wizard-left-scroll{flex:1;overflow-y:auto;}
  .wizard-footer{padding:1rem 1.5rem;border-top:1px solid ${C.border};display:flex;justify-content:space-between;align-items:center;background:${C.white};}
  .wizard-right{width:272px;flex-shrink:0;border-left:1px solid ${C.border};display:flex;flex-direction:column;background:${C.bg};max-height:90vh;overflow-y:auto;}
  .preview-head{padding:0.9rem 1rem;border-bottom:1px solid ${C.border};background:${C.white};}
  .preview-head p{font-size:10px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.08em;}
  .preview-scroll{flex:1;padding:1rem;display:flex;flex-direction:column;align-items:center;gap:12px;}
  .preview-controls{padding:1rem;border-top:1px solid ${C.border};background:${C.white};}
  .preview-controls p{font-size:10px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;}

  /* phone frame */
  .phone-frame{width:192px;background:#111;border-radius:34px;padding:7px;box-shadow:0 8px 28px rgba(0,0,0,0.32);}
  .phone-inner{background:#fff;border-radius:28px;overflow:hidden;min-height:360px;display:flex;flex-direction:column;}
  .phone-topbar{background:#fff;padding:9px 11px 5px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:7px;}
  .phone-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#833AB4,#FCB045);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0;}
  .phone-name{font-size:9.5px;font-weight:700;color:#111;}
  .phone-sub-text{font-size:8px;color:#888;}
  .phone-msgs{flex:1;padding:9px 9px 5px;display:flex;flex-direction:column;gap:5px;}
  .ph-bubble{max-width:83%;border-radius:13px;padding:6px 9px;font-size:9px;line-height:1.4;word-break:break-word;}
  .ph-bubble.in{background:#f0f0f0;color:#222;align-self:flex-start;border-bottom-left-radius:3px;}
  .ph-bubble.out{background:${C.orange};color:#fff;align-self:flex-end;border-bottom-right-radius:3px;}
  .phone-btns-area{padding:5px 9px 9px;display:flex;flex-direction:column;gap:4px;}
  .ph-cta-btn{width:100%;padding:6px 8px;border-radius:20px;font-size:8.5px;font-weight:700;border:1.5px solid ${C.orange};color:${C.orange};background:#fff;text-align:center;}
  .ph-cta-btn.filled{background:${C.orange};color:#fff;border-color:${C.orange};}
  .ph-btn-row{display:flex;gap:4px;}
  .ph-btn-row .ph-cta-btn{flex:1;}

  /* template style chips */
  .tpl-chip{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;border:1.5px solid ${C.border};cursor:pointer;transition:all 0.14s;font-size:11.5px;font-weight:500;color:${C.mid};width:100%;background:transparent;text-align:left;margin-bottom:5px;}
  .tpl-chip:hover{border-color:${C.orange};color:${C.dark};}
  .tpl-chip.active{border-color:${C.orange};background:${C.orangeLight};color:${C.orange};}
  .tpl-dot{width:7px;height:7px;border-radius:50%;background:${C.border};flex-shrink:0;transition:background 0.14s;}
  .tpl-chip.active .tpl-dot{background:${C.orange};}

  /* upload zone */
  .upload-zone{border:2px dashed ${C.border};border-radius:10px;padding:18px;text-align:center;cursor:pointer;transition:all 0.15s;}
  .upload-zone:hover{border-color:${C.orange};background:${C.orangeLight};}
  .upload-zone.has-file{border-color:${C.green};background:${C.greenLight};border-style:solid;}

  /* promo input */
  .promo-input-wrap{display:flex;align-items:center;gap:0;border:1.5px solid ${C.border};border-radius:8px;overflow:hidden;background:${C.orangeLight};}
  .promo-prefix{padding:8px 12px;font-size:18px;border-right:1.5px solid ${C.border};background:${C.orangeLight};display:flex;align-items:center;}
  .promo-input{border:none;background:transparent;font-size:14px;font-weight:700;color:${C.orange};letter-spacing:0.1em;text-transform:uppercase;padding:8px 12px;flex:1;width:auto;}
  .promo-input:focus{outline:none;border:none;}

  /* link input with icon */
  .link-input-wrap{position:relative;}
  .link-input-wrap input{padding-left:36px;}
  .link-input-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;}

  /* preview badges */
  .preview-badges{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;}
`;

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color }) => {
  const p = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    campaign: "M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    chart: "M18 20V10M12 20V4M6 20v-6",
    planner: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    plus: "M12 5v14M5 12h14",
    check: "M5 13l4 4L19 7",
    x: "M18 6L6 18M6 6l12 12",
    arrow_right: "M5 12h14M12 5l7 7-7 7",
    arrow_left: "M19 12H5M12 19l-7-7 7-7",
    instagram: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
    facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    bot: "M12 8V4H8 M4 8h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z M9 13h.01M15 13h.01",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    gift: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
    clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    food: "M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3M10 1v3M14 1v3",
    copy: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4M12 8h.01",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    delete: "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M9 6V4h6v2",
    pause: "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
    play: "M5 3l14 9-14 9V3z",
    learn: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    crown: "M2 20h20M5 20V9l7-7 7 7v11",
    lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M17 11V7a5 5 0 00-10 0v4",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    pizza: "M12 2L2 12h20L12 2z M12 22l-4-4h8l-4 4z M7 12v2M12 10v4M17 12v2",
    burger: "M2 12h20M2 15h20a5 5 0 01-5 5H7a5 5 0 01-5-5z M22 9a10 10 0 00-20 0v3h20V9z",
    coffee: "M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3M10 1v3M14 1v3",
    up: "M5 15l7-7 7 7",
    package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
    dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(p[name] || "").split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
    </svg>
  );
};

// ── Phone DM Preview ──────────────────────────────────────────────────────
const PhonePreview = ({ data, post }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [btnClicked, setBtnClicked] = useState(false);
  const [clicksCount, setClicksCount] = useState(0);

  // Reset simulation when follow settings change
  useEffect(() => {
    setBtnClicked(false);
    setClicksCount(0);
  }, [data.requireFollow, data.followMessage, data.followBtnLabel, data.ctaUrls, data.hasPdf, data.tplType]);

  const triggerWord = data.keywords?.[0] || "Link";
  
  // Decide what messages to render
  const messageList = [];
  
  // 1. Initial comment trigger
  messageList.push({ type: "in", text: `"${triggerWord}" 👀` });

  // 2. Initial DM message
  const initialText = (data.tplType === "text" ? data.textMessage : data.dmMessage) || "";
  messageList.push({ type: "out", text: initialText.replace(/\{\{name\}\}/g, "@pizza_lover") });

  // 3. Follow check logic
  if (data.requireFollow) {
    // If follow check is active, initially we send the follow message
    messageList.push({ type: "out", text: (data.followMessage || "To claim your link, you must follow our account first! Click below to follow.").replace(/\{\{name\}\}/g, "@pizza_lover") });
    
    // If they clicked the button
    if (btnClicked) {
      for (let i = 0; i < clicksCount; i++) {
        if (isFollowing) {
          // Deliver links & PDF!
          const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
          if (validUrls.length > 0) {
            validUrls.forEach(url => {
              const shortUrl = url.replace(/^https?:\/\//, "").slice(0, 26) + (url.replace(/^https?:\/\//, "").length > 26 ? "…" : "");
              messageList.push({ type: "out", text: `🔗 Tap to claim: ${shortUrl}` });
            });
          }
          if (data.hasPdf && data.pdfName) {
            messageList.push({ type: "out", text: `📄 Attached Flyer: ${data.pdfName}` });
          }
          if (data.promoCode) {
            messageList.push({ type: "out", text: `🎟️ Promo code: ${data.promoCode}` });
          }
          break; // Stop repeating warning
        } else {
          // Repeat follow warning!
          messageList.push({ type: "out", text: (data.followMessage || "To claim your link, you must follow our account first! Click below to follow.").replace(/\{\{name\}\}/g, "@pizza_lover") });
        }
      }
    }
  } else {
    // Deliver directly
    const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
    if (validUrls.length > 0) {
      validUrls.forEach(url => {
        const shortUrl = url.replace(/^https?:\/\//, "").slice(0, 26) + (url.replace(/^https?:\/\//, "").length > 26 ? "…" : "");
        messageList.push({ type: "out", text: `🔗 Tap to claim: ${shortUrl}` });
      });
    }
    if (data.hasPdf && data.pdfName) {
      messageList.push({ type: "out", text: `📄 Attached Flyer: ${data.pdfName}` });
    }
    if (data.promoCode) {
      messageList.push({ type: "out", text: `🎟️ Promo code: ${data.promoCode}` });
    }
  }

  return (
    <div className="phone-frame">
      <div className="phone-inner">
        {/* top bar */}
        <div className="phone-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="phone-av">FC</div>
            <div>
              <div className="phone-name">@myfoodchow</div>
              <div className="phone-sub-text">Instagram · Active now</div>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              borderRadius: 20,
              fontWeight: 700,
              backgroundColor: isFollowing ? "#EFEFEF" : C.orange,
              color: isFollowing ? C.dark : "white",
              border: "none",
              cursor: "pointer",
              height: "auto",
              minHeight: "auto",
              boxShadow: "none"
            }}
            onClick={() => setIsFollowing(prev => !prev)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* messages */}
        <div className="phone-msgs">
          {messageList.map((m, i) => (
            <div key={i} className={`ph-bubble ${m.type}`}>{m.text}</div>
          ))}
        </div>

        {/* CTA buttons area */}
        {data.requireFollow && (!btnClicked || !isFollowing) ? (
          <div className="phone-btns-area" style={{ borderTop: `1px solid ${C.border}`, padding: 8 }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", fontSize: 12, padding: "8px 0", borderRadius: 8, fontWeight: 700 }}
              onClick={() => {
                setBtnClicked(true);
                setClicksCount(c => c + 1);
              }}
            >
              👇 {data.followBtnLabel || "Send Link"}
            </button>
          </div>
        ) : !data.requireFollow && data.tplType === "button" && (data.ctaUrls || []).filter(url => url.trim().startsWith('https://')).length > 0 ? (
          <div className="phone-btns-area" style={{ borderTop: `1px solid ${C.border}`, padding: 8 }}>
            <div className="ph-btn-row" style={{ display: "flex", gap: 4 }}>
              {(data.btnLabels || []).filter(l => l.trim()).slice(0, 3).map((lbl, i) => (
                <div key={i} className="ph-cta-btn" style={{ flex: 1, minWidth: "60px", textAlign: "center", fontSize: 11 }}>{lbl}</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ── Upgrade Modal ──────────────────────────────────────────────────────────
const UpgradeModal = ({ onClose }) => {
  const [plan, setPlan] = useState("annual");
  const features = ["Remove FoodChow DM Branding", "Unlimited DMs", "Unlimited Contacts", "Follower Growth Feature", "Retrigger Comments", "Advanced Analytics"];
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upgrade-modal slide-up" style={{ maxWidth: 720, width: "100%", borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div className="upgrade-left">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", fontSize: 28 }}>👑</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>Unlock your<br /><span style={{ color: "#FCD34D" }}>Growth</span></h2>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: "1.5rem" }}>Scale beyond the limits of the free plan.</p>
          {features.map(f => (
            <div key={f} className="feature-item">
              <div className="feature-check"><Icon name="check" size={12} /></div>
              <span style={{ opacity: 0.92 }}>{f}</span>
            </div>
          ))}
        </div>
        <div className="upgrade-right">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
            <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          {[
            { id: "monthly", label: "Monthly", billing: "Billed monthly", price: "₹499", suffix: "/mo", badge: null },
            { id: "annual", label: "Annual", billing: "Billed yearly", price: "₹399", suffix: "/mo", badge: "SAVE ₹1,200", total: "Total: ₹4788/yr" },
          ].map(p => (
            <div key={p.id} className={`plan-card ${plan === p.id ? "selected" : ""}`} onClick={() => setPlan(p.id)}>
              <div className={`radio-dot ${plan === p.id ? "selected" : ""}`} style={{ borderColor: plan === p.id ? C.green : C.border }} />
              <div style={{ flex: 1 }}>
                {p.badge && <div style={{ marginBottom: 3 }}><span className="plan-badge">{p.badge}</span></div>}
                <p style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{p.billing}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 800, fontSize: 20, fontFamily: "'DM Sans',sans-serif" }}>{p.price}<span style={{ fontSize: 13, fontWeight: 500 }}>{p.suffix}</span></p>
                {p.total && <p style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{p.total}</p>}
              </div>
            </div>
          ))}
          <button className="btn btn-indigo" style={{ width: "100%", padding: "12px", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, marginTop: 6 }}>Upgrade Now</button>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 10, textAlign: "center" }}>
            <strong>Price Lock Guarantee:</strong> You keep paying this price as long as you remain subscribed.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Connect Instagram Page ────────────────────────────────────────────────
const ConnectPage = ({ onConnected }) => {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      // Fetch the Instagram OAuth URL from the backend
      const res = await fetch(`${API_BASE_URL}/api/ig/auth-url`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to get auth URL');
      const data = await res.json();
      // Redirect to Instagram's login page
      window.location.href = data.url;
    } catch (e) {
      setError('Could not connect to Instagram. Please try again.');
      setConnecting(false);
    }
  };

  return (
    <div className="connect-page">
      <div className="connect-card slide-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: "1.5rem" }}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill={C.orange} />
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="14" r="2" fill="white" />
          </svg>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 18, color: C.dark }}>Auto Chats</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Connect Instagram Account ✨</h1>
        <p style={{ fontSize: 13.5, color: C.mid, marginBottom: 0 }}>Only a few steps away from more orders!</p>
        {error && <div style={{ marginTop: 10, padding: 10, background: C.redLight, color: C.red, borderRadius: 8, fontSize: 13 }}>{error}</div>}
        <div className="meta-badge">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🔷</span>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: C.indigo }}>We're a Meta-verified business</span>
          </div>
          <p style={{ fontSize: 12.5, color: C.mid, marginBottom: 10 }}>We only use official Instagram APIs and processes. Your account is secure and you stay in full control.</p>
          {["Official Meta OAuth login", "Safe and Secure", "Used by 1000+ restaurants"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.greenLight, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={10} color={C.green} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>
        <button className="ig-btn" onClick={handleConnect} disabled={connecting}>
          {connecting
            ? <><span style={{ fontSize: 16, marginRight: 6 }}>⏳</span> Connecting Instagram…</>
            : <><span style={{ fontSize: 20 }}>📷</span> Login with Instagram</>}
        </button>
        <p style={{ fontSize: 11.5, color: C.muted, marginTop: "1.25rem" }}>
          By continuing, you agree to FoodChow DM's <span style={{ color: C.orange, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: C.orange, cursor: "pointer" }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

// ── Demo / Onboarding Modal ───────────────────────────────────────────────
const DemoModal = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Welcome to FoodChow DM 👋",
      sub: "Automate Instagram & Facebook DMs to drive more orders — in 3 easy steps.",
      content: (
        <div>
          {[
            { n: 1, t: "Connect your account", d: "Link your Instagram or Facebook page." },
            { n: 2, t: "Create a campaign", d: "Pick a post, set keywords, configure your DM or use a template." },
            { n: 3, t: "Watch it grow", d: "Track DMs sent, clicks, and conversions from your dashboard." },
          ].map((s, i) => (
            <div key={i} className="onboard-step" style={i === 2 ? { borderBottom: "none" } : {}}>
              <div className="onboard-num">{s.n}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: C.mid }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "How campaigns work",
      sub: "Someone comments on your post → they get an automated DM with your offer.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="flow-node trigger"><Icon name="instagram" size={14} /> Customer comments "Link" on your post</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-node action"><Icon name="check" size={14} color={C.blue} /> System checks if they follow you</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-node condition"><Icon name="mail" size={14} color={C.purple} /> DM sent with Dine-in / Takeaway / Order options</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-node action"><Icon name="gift" size={14} color={C.blue} /> Exclusive offer link delivered via FoodChow</div>
        </div>
      ),
    },
    {
      title: "Pick your starting point",
      sub: "You can always change this later.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="radio-card selected" onClick={() => onDone("template")}>
            <div className="radio-dot selected" />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Use a ready template</p>
              <p style={{ fontSize: 13, color: C.mid }}>Pre-built DM flows — select a post and activate in minutes.</p>
            </div>
          </div>
          <div className="radio-card" onClick={() => onDone("custom")}>
            <div className="radio-dot" />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Build my own campaign</p>
              <p style={{ fontSize: 13, color: C.mid }}>Full control over triggers, messages, and offer logic.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];
  const cur = steps[step];
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && step === 0 && onDone("skip")}>
      <div className="modal fade-in" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Step {step + 1} of {steps.length}</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{cur.title}</h2>
            <p style={{ fontSize: 13.5, color: C.mid }}>{cur.sub}</p>
          </div>
        </div>
        <div className="modal-body">
          {cur.content}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {steps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === step ? C.orange : C.border }} />)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setStep(s => s - 1)}>Back</button>}
              {step < steps.length - 1
                ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Next <Icon name="arrow_right" size={13} /></button>
                : <button className="btn btn-primary btn-sm" onClick={() => onDone("new_campaign")}>Start <Icon name="arrow_right" size={13} /></button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Template Campaign Wizard ──────────────────────────────────────────────
const TemplateCampaignWizard = ({ post, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    { id: "offer", name: "Offer Campaign", desc: "Send exclusive discount links when someone comments", icon: "gift", keywords: ["Link", "Deal"] },
    { id: "menu", name: "Menu Link", desc: "Auto-send your menu link to interested commenters", icon: "food", keywords: ["Menu", "Link"] },
    { id: "booking", name: "Table Booking", desc: "Drive reservations from your posts automatically", icon: "clock", keywords: ["Book", "Reserve"] },
    { id: "followup", name: "Follow-up DM", desc: "Re-engage customers who clicked but didn't order", icon: "mail", keywords: ["Link", "More"] },
  ]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/templates`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setTemplates(data.map(t => ({
              id: t._id,
              name: t.title,
              desc: t.content,
              icon: "gift",
              keywords: t.triggerKeywords ? t.triggerKeywords.split(',').map(k => k.trim()) : [],
              replyMessage: t.replyMessage,
              emoji: t.emoji || '🍽️'
            })));
          }
        }
      } catch (e) { /* keep defaults */ }
    };
    fetchTemplates();
  }, []);

  const [saving, setSaving] = useState(false);
  const chosen = templates.find(t => t.id === template);

  const handleActivate = async () => {
    setSaving(true);
    try {
      const body = {
        title: chosen?.name || 'Template Campaign',
        triggerKeywords: chosen?.keywords?.join(',') || 'Link',
        replyMessage: chosen?.replyMessage || `Hey {{name}}! 👋 Here's what you asked for: ${chosen?.name}`,
        postId: post.igPostId || post._id || post.id,
        status: 'active'
      };
      const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onClose();
      } else {
        const err = await res.json();
        alert('Failed to create campaign: ' + (err.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal fade-in" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <p style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Quick Campaign</p>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{step === 0 ? "Choose a Template" : "Confirm & Activate"}</h2>
          </div>
          <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
          <div className="step-indicator">
            {["Pick Template", "Activate"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 1 ? 1 : "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div className={`step-num ${i < step ? "done" : i === step ? "active" : "todo"}`}>
                    {i < step ? <Icon name="check" size={11} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: i === step ? C.dark : C.muted, fontWeight: 500 }}>{s}</span>
                </div>
                {i < 1 && <div className={`step-connector ${i < step ? "done" : ""}`} style={{ marginBottom: 14 }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-body">
          {step === 0 ? (
            <div className="fade-in">
              <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeMid}`, borderRadius: 10, padding: "10px 12px", marginBottom: "1rem", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{post.emoji}</span>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600 }}>{post.title}</p>
                  <p style={{ fontSize: 11, color: C.mid }}>{post.platform} · {post.date}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {templates.map(t => (
                  <div key={t.id} className={`radio-card ${template === t.id ? "selected" : ""}`} onClick={() => setTemplate(t.id)}>
                    <div className={`radio-dot ${template === t.id ? "selected" : ""}`} />
                    <Icon name={t.icon} size={16} color={template === t.id ? C.orange : C.mid} />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: C.mid }}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ background: C.greenLight, border: `1px solid ${C.green}30`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8, marginBottom: "1rem" }}>
                <Icon name="check" size={16} color={C.green} />
                <p style={{ fontSize: 13, color: C.green, fontWeight: 500 }}>Your campaign is ready to activate!</p>
              </div>
              {[
                { label: "Post", value: post.title },
                { label: "Template", value: chosen?.name },
                { label: "Keywords", value: chosen?.keywords?.join(", ") },
                { label: "DM Mode", value: "Comment → DM" },
                { label: "Require Follow", value: "Yes" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 13.5 }}>
                  <span style={{ color: C.mid, fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem" }}>
            <button className="btn btn-secondary" onClick={() => step > 0 ? setStep(0) : onClose()}>
              {step > 0 ? <><Icon name="arrow_left" size={13} /> Back</> : "Cancel"}
            </button>
            <button className="btn btn-primary"
              disabled={(step === 0 && !template) || saving}
              style={step === 0 && !template ? { opacity: 0.5 } : {}}
              onClick={() => step === 0 ? setStep(1) : handleActivate()}>
              {step === 0 ? <>Next <Icon name="arrow_right" size={13} /></> : (saving ? <><Icon name="zap" size={13} /> Activating...</> : <><Icon name="zap" size={13} /> Activate Campaign</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Custom Campaign Wizard (5 steps + live preview sidebar) ───────────────
const CustomCampaignWizard = ({ post, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    // Step 0 – DM Setup
    tplType: "button",
    dmMessage: "Hey {{name}}! 👋 Thanks for commenting. Here's your exclusive offer:",
    textMessage: "Hey {{name}}! 👋 Here is your text offer: ",
    useAI: false,
    aiInstruction: "",
    btnLabels: ["🍽️ Dine-in", "🥡 Takeaway", "📱 Order Online"],
    // Step 1 – Trigger
    triggerType: "keyword",
    keywords: ["Link", "Shop"],
    newKw: "",
    accessMode: "comment_then_dm",
    requireFollow: false,
    followMessage: "To claim your link, you must follow our account first! Click below to follow.",
    followBtnLabel: "Send Link",
    // Step 2 – Offer & Links
    ctaUrls: [""],
    promoCode: "",
    hasPdf: false,
    pdfName: "",
    offerTypes: ["dine-in", "takeaway"],
    // Step 3 – Offer Logic (existing)
    // Step 4 – Review
  });

  const STEPS = ["DM Setup", "Trigger", "Offer & Links", "Offer Logic", "Review"];

  const set = useCallback((key, val) => setData(d => ({ ...d, [key]: val })), []);

  const handleActivate = async () => {
    setSaving(true);
    try {
      const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
      const linksText = validUrls.map(url => `🔗 ${url}`).join('\n');
      const pdfText = data.hasPdf ? `\n📄 PDF Flyer: ${data.pdfName}` : '';
      const replyMessage = (data.tplType === "text" ? data.textMessage : data.dmMessage) + (linksText ? `\n\n${linksText}` : '') + pdfText + (data.promoCode ? `\n🎟️ Code: ${data.promoCode}` : '');

      const body = {
        title: post.title || post.caption?.slice(0, 60) || "Instagram Campaign",
        triggerKeywords: data.keywords.join(','),
        replyMessage: replyMessage,
        postId: post.igPostId || post._id || post.id,
        status: 'active',
        ctaUrls: validUrls,
        hasPdf: data.hasPdf,
        pdfName: data.pdfName,
        promoCode: data.promoCode,
        requireFollow: data.requireFollow,
        followMessage: data.followMessage || 'To claim your link, you must follow our account first! Click below to follow.',
        followBtnLabel: data.followBtnLabel || 'Send Link'
      };
      const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onClose();
      } else {
        const err = await res.json();
        alert('Failed to create campaign: ' + (err.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
    setSaving(false);
  };

  const addKw = () => {
    if (data.newKw.trim() && !data.keywords.includes(data.newKw.trim())) {
      set("keywords", [...data.keywords, data.newKw.trim()]);
      set("newKw", "");
    }
  };
  const removeKw = kw => set("keywords", data.keywords.filter(k => k !== kw));
  const toggleOffer = type => set("offerTypes", data.offerTypes.includes(type)
    ? data.offerTypes.filter(t => t !== type)
    : [...data.offerTypes, type]);

  // ── Step 0: DM Setup ──
  const renderStep0 = () => (
    <div className="fade-in">
      {/* post badge */}
      <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeMid}`, borderRadius: 10, padding: "10px 12px", marginBottom: "1rem", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>{post.emoji}</span>
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 600 }}>{post.title}</p>
          <p style={{ fontSize: 11, color: C.mid }}>{post.platform} · {post.date}</p>
        </div>
      </div>

      {/* message template style */}
      <div style={{ marginBottom: 14 }}>
        <label>Message template style</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
          {[
            ["button", "Button template", "Show CTA buttons (Dine-in / Takeaway / Online)"],
            ["text", "Text template", "Plain message with your link embedded"],
            ["mention", "Mention template", "Personalise with customer's @username"],
          ].map(([v, l, d]) => (
            <button key={v} className={`tpl-chip ${data.tplType === v ? "active" : ""}`} onClick={() => set("tplType", v)}>
              <div className="tpl-dot" />
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span>
                <span style={{ display: "block", fontSize: 11, color: C.muted, fontWeight: 400, marginTop: 1 }}>{d}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DM message */}
      {data.tplType === "text" ? (
        <div style={{ marginBottom: 14 }}>
          <label>Text message template response</label>
          <textarea value={data.textMessage} onChange={e => set("textMessage", e.target.value)} rows={3} placeholder="e.g. Hey {{name}}! Here is your exclusive offer:" />
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Use {"{{name}}"} to insert the customer's username</p>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label>DM message</label>
          <textarea value={data.dmMessage} onChange={e => set("dmMessage", e.target.value)} rows={3} />
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Use {"{{name}}"} to insert the customer's username</p>
        </div>
      )}

      {/* button labels (only for button template) */}
      {data.tplType === "button" && (
        <div style={{ marginBottom: 14 }}>
          <label>Button labels (up to 3)</label>
          {data.btnLabels.map((lbl, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <input
                placeholder={`Button ${i + 1} label`}
                value={lbl}
                onChange={e => {
                  const next = [...data.btnLabels];
                  next[i] = e.target.value;
                  set("btnLabels", next);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      {/* AI toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className={`toggle ${data.useAI ? "on" : ""}`} onClick={() => set("useAI", !data.useAI)} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600 }}>AI-powered replies</p>
          <p style={{ fontSize: 12, color: C.mid }}>Let AI handle follow-up questions from customers</p>
        </div>
      </div>
      {data.useAI && (
        <div style={{ marginTop: 10 }}>
          <label>AI instruction (optional)</label>
          <textarea placeholder="e.g. Be friendly, answer menu questions, always end with a CTA..." value={data.aiInstruction} onChange={e => set("aiInstruction", e.target.value)} rows={2} />
        </div>
      )}
    </div>
  );

  // ── Step 1: Trigger ──
  const renderStep1 = () => (
    <div className="fade-in">
      <div style={{ background: C.blueLight, border: `1px solid #BFDBFE`, borderRadius: 10, padding: "10px 12px", marginBottom: "1rem", display: "flex", gap: 8, fontSize: 12.5, color: C.blue }}>
        ⚡ When a customer comments (or DMs), the system automatically sends your configured DM with offer.
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Trigger type</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["keyword", "any_comment", "story_mention"].map(t => (
            <button key={t} className={`btn btn-sm ${data.triggerType === t ? "btn-primary" : "btn-secondary"}`} onClick={() => set("triggerType", t)}>
              {t === "keyword" ? "Keywords" : t === "any_comment" ? "Any Comment" : "Story Mention"}
            </button>
          ))}
        </div>
      </div>
      {data.triggerType === "keyword" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Keyword triggers</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {data.keywords.map(kw => (
              <span key={kw} className="keyword-tag">{kw}<button onClick={() => removeKw(kw)}>×</button></span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ flex: 1 }} placeholder="Add keyword..." value={data.newKw} onChange={e => set("newKw", e.target.value)} onKeyDown={e => e.key === "Enter" && addKw()} />
            <button className="btn btn-secondary btn-sm" onClick={addKw}>Add</button>
          </div>
        </div>
      )}
      <div className="divider" />
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Access mode</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { val: "comment_then_dm", label: "Comment → DM", desc: "Customer comments first, then receives DM" },
          { val: "dm_only", label: "DM only", desc: "Customer DMs you directly to receive the offer" },
          { val: "both", label: "Comment or DM", desc: "Either way works" },
        ].map(o => (
          <div key={o.val} className={`radio-card ${data.accessMode === o.val ? "selected" : ""}`} onClick={() => set("accessMode", o.val)}>
            <div className={`radio-dot ${data.accessMode === o.val ? "selected" : ""}`} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</p>
              <p style={{ fontSize: 12, color: C.mid }}>{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Step 2: Offer & Links (NEW) ──
  const renderStep2 = () => {
    const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
    const hasValidLinks = validUrls.length > 0;
    const hasPdf = data.hasPdf && data.pdfName;
    const isFormValid = hasValidLinks || hasPdf;
    return (
      <div className="fade-in">
        {/* CTA Links — required unless PDF is present */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <label style={{ margin: 0 }}>🔗 CTA / Offer links</label>
            <span className="tag tag-red" style={{ fontSize: 10, padding: "2px 8px" }}>{hasPdf ? "Optional" : "Required"}</span>
          </div>
          <p style={{ fontSize: 12, color: C.mid, marginBottom: 7 }}>The links customers tap in the DM to claim your offer. Each link MUST start with "https://".</p>
          
          {(data.ctaUrls || [""]).map((url, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="link-input-wrap" style={{ flex: 1 }}>
                  <span className="link-input-icon">🔗</span>
                  <input
                    placeholder="https://foodchow.com/restaurant/your-menu"
                    value={url}
                    onChange={e => {
                      const next = [...data.ctaUrls];
                      next[i] = e.target.value;
                      set("ctaUrls", next);
                    }}
                  />
                </div>
                {data.ctaUrls.length > 1 && (
                  <button
                    className="btn btn-ghost"
                    style={{ color: C.red, padding: 8, height: 38, width: 38, minWidth: 38 }}
                    onClick={() => {
                      const next = data.ctaUrls.filter((_, idx) => idx !== i);
                      set("ctaUrls", next);
                    }}
                  >
                    <Icon name="delete" size={15} />
                  </button>
                )}
              </div>
              {url.trim() && !url.trim().startsWith("https://") && (
                <p style={{ fontSize: 11, color: C.red, margin: "2px 0 0 34px" }}>⚠️ Link must start with https://</p>
              )}
            </div>
          ))}

          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12 }}
            onClick={() => set("ctaUrls", [...data.ctaUrls, ""])}
          >
            <Icon name="plus" size={11} /> Add CTA Link
          </button>
        </div>

        <div className="divider" />

        {/* Promo code */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <label style={{ margin: 0 }}>🎟️ Promo / Discount code</label>
            <span style={{ fontSize: 11, color: C.muted }}>optional</span>
          </div>
          <p style={{ fontSize: 12, color: C.mid, marginBottom: 7 }}>Sent inside the DM after the customer triggers the automation.</p>
          <div className="promo-input-wrap">
            <span className="promo-prefix">🎟️</span>
            <input
              className="promo-input"
              placeholder="e.g. PIZZA20"
              value={data.promoCode}
              onChange={e => set("promoCode", e.target.value.toUpperCase())}
            />
            {data.promoCode && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 12px", color: C.muted, fontSize: 12, fontWeight: 600 }}
                onClick={() => navigator.clipboard && navigator.clipboard.writeText(data.promoCode)}
              >Copy</button>
            )}
          </div>
        </div>

        <div className="divider" />

        {/* PDF upload */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <label style={{ margin: 0 }}>📄 Attach menu PDF or promo flyer</label>
            <span style={{ fontSize: 11, color: C.muted }}>optional</span>
          </div>
          <p style={{ fontSize: 12, color: C.mid, marginBottom: 7 }}>Customers receive this as a link in the DM. Useful for menus, offers, or vouchers.</p>
          <input
            type="file"
            accept="application/pdf"
            id="system-pdf-picker-wizard"
            style={{ display: "none" }}
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                set("hasPdf", true);
                set("pdfName", file.name);
              }
            }}
          />
          <div
            className={`upload-zone ${data.hasPdf ? "has-file" : ""}`}
            onClick={() => {
              if (data.hasPdf) return;
              document.getElementById("system-pdf-picker-wizard").click();
            }}
            style={{ cursor: "pointer" }}
          >
            {data.hasPdf ? (
              <>
                <div style={{ fontSize: 22, marginBottom: 5 }}>✅</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{data.pdfName}</p>
                <p style={{ fontSize: 11, color: C.mid, marginBottom: 8 }}>PDF attached — will be shared as a link in the DM</p>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ color: C.red, borderColor: C.redLight, fontSize: 11 }}
                  onClick={e => { e.stopPropagation(); set("hasPdf", false); set("pdfName", ""); }}
                >Remove</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Drop PDF here or click to upload</p>
                <p style={{ fontSize: 11, color: C.mid }}>Menu PDF, promo flyer, or voucher · Max 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Validation warning */}
        {!isFormValid && (
          <div style={{ background: C.amberLight, border: `1px solid #FCD34D`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: C.amber, display: "flex", gap: 8 }}>
            <Icon name="info" size={14} color={C.amber} />
            <span>Either at least one valid CTA link (starting with https://) or an attached PDF is required to activate this campaign.</span>
          </div>
        )}
      </div>
    );
  };

  // ── Step 3: Offer Logic ──
  const renderStep3 = () => (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem", padding: "12px 14px", background: C.orangeLight, borderRadius: 10, border: `1px solid ${C.orangeMid}` }}>
        <button className={`toggle ${data.requireFollow ? "on" : ""}`} onClick={() => set("requireFollow", !data.requireFollow)} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: C.orange }}>Require follow to get link</p>
          <p style={{ fontSize: 12, color: C.mid }}>Customer must follow before receiving the offer link</p>
        </div>
      </div>
      {data.requireFollow && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: 10 }} className="fade-in">
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Custom follow-check warning message</label>
            <textarea
              style={{ fontSize: 12.5 }}
              value={data.followMessage}
              onChange={e => set("followMessage", e.target.value)}
              rows={2}
              placeholder="e.g. To claim your link, you must follow our account first! Click below to follow."
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Button label (e.g. Send Link or Send PDF)</label>
            <input
              style={{ fontSize: 12.5 }}
              value={data.followBtnLabel}
              onChange={e => set("followBtnLabel", e.target.value)}
              placeholder="e.g. Send Link"
            />
          </div>
        </div>
      )}
      <label style={{ marginBottom: 8 }}>Offer available for</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { id: "dine-in", icon: "🍽️", label: "Dine-in", desc: "Customers visit your restaurant" },
          { id: "takeaway", icon: "🥡", label: "Takeaway", desc: "Customers collect their order" },
          { id: "online", icon: "📱", label: "Online ordering", desc: "Via FoodChow app" },
        ].map(o => (
          <div key={o.id} className={`check-card ${data.offerTypes.includes(o.id) ? "selected" : ""}`} onClick={() => toggleOffer(o.id)}>
            <div className={`check-box ${data.offerTypes.includes(o.id) ? "selected" : ""}`} />
            <span style={{ fontSize: 20 }}>{o.icon}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</p>
              <p style={{ fontSize: 12, color: C.mid }}>{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Step 4: Review ──
  const renderStep4 = () => {
    const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
    const hasValidLinks = validUrls.length > 0;
    const hasPdf = data.hasPdf && data.pdfName;
    const isReady = hasValidLinks || hasPdf;
    return (
      <div className="fade-in">
        {isReady ? (
          <div style={{ background: C.greenLight, border: `1px solid ${C.green}30`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8, marginBottom: "1rem" }}>
            <Icon name="check" size={16} color={C.green} />
            <p style={{ fontSize: 13, color: C.green, fontWeight: 500 }}>Your campaign is ready. Activate it to start receiving automated DMs.</p>
          </div>
        ) : (
          <div style={{ background: C.redLight, border: `1px solid #FECACA`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8, marginBottom: "1rem" }}>
            <Icon name="info" size={16} color={C.red} />
            <p style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>⚠️ CTA link or PDF flyer is missing. Go back to <strong>Offer & Links</strong> and add your FoodChow link or PDF before activating.</p>
          </div>
        )}
        {[
          { label: "Post", value: post.title },
          { label: "Template", value: data.tplType === "button" ? "Button template" : data.tplType === "text" ? "Text template" : "Mention template" },
          { label: "Trigger", value: data.triggerType === "keyword" ? `Keywords: ${data.keywords.join(", ")}` : data.triggerType === "any_comment" ? "Any comment" : "Story mention" },
          { label: "Access mode", value: data.accessMode === "comment_then_dm" ? "Comment → DM" : data.accessMode === "dm_only" ? "DM only" : "Comment or DM" },
          { label: "Require follow", value: data.requireFollow ? "Yes" : "No" },
          { label: "CTA links", value: validUrls.join(", ") || "⚠️ Not set" },
          { label: "Promo code", value: data.promoCode || "—" },
          { label: "PDF attached", value: data.hasPdf ? data.pdfName : "No" },
          { label: "Offer types", value: data.offerTypes.join(", ") || "None selected" },
          { label: "AI replies", value: data.useAI ? "On" : "Off" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 13.5 }}>
            <span style={{ color: C.mid, fontWeight: 500 }}>{r.label}</span>
            <span style={{ fontWeight: 600, maxWidth: "58%", textAlign: "right", wordBreak: "break-all", color: r.label === "CTA links" && !isReady ? C.red : C.dark }}>{r.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
    }
  };

  const validUrls = (data.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
  const hasValidLinks = validUrls.length > 0;
  const hasPdf = data.hasPdf && data.pdfName;
  const canNext = step === 2 ? (hasValidLinks || hasPdf) : true;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="modal-overlay">
      <div className="wizard-split slide-up">

        {/* ── LEFT: wizard form ── */}
        <div className="wizard-left">
          {/* header */}
          <div style={{ padding: "1.25rem 1.5rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Custom Campaign</p>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{STEPS[step]}</h2>
              </div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}><Icon name="x" size={18} /></button>
            </div>
            {/* step indicator */}
            <div className="step-indicator">
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div className={`step-num ${i < step ? "done" : i === step ? "active" : "todo"}`}>
                      {i < step ? <Icon name="check" size={11} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 9.5, color: i === step ? C.dark : C.muted, fontWeight: 500, whiteSpace: "nowrap" }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`step-connector ${i < step ? "done" : ""}`} style={{ marginBottom: 14 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* scrollable body */}
          <div className="wizard-left-scroll" style={{ padding: "0 1.5rem 1rem" }}>
            {renderStep()}
          </div>

          {/* footer */}
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}>
              {step > 0 ? <><Icon name="arrow_left" size={13} /> Back</> : "Cancel"}
            </button>
            <div style={{ display: "flex", align: "center", gap: 8 }}>
              {step === 2 && !(hasValidLinks || hasPdf) && (
                <span style={{ fontSize: 11.5, color: C.red, alignSelf: "center" }}>* Link or PDF required</span>
              )}
              <button
                className="btn btn-primary"
                disabled={!canNext || saving}
                onClick={() => isLastStep ? handleActivate() : setStep(s => s + 1)}
              >
                {isLastStep ? (saving ? <><Icon name="zap" size={13} /> Activating...</> : <><Icon name="zap" size={13} /> Activate Campaign</>) : <>Next <Icon name="arrow_right" size={13} /></>}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: live preview panel ── */}
        <div className="wizard-right">
          <div className="preview-head">
            <p>Live DM Preview</p>
          </div>

          <div className="preview-scroll">
            <PhonePreview data={data} post={post} />

            {/* status badges */}
            <div className="preview-badges">
              {(data.ctaUrls || []).some(url => url.trim().startsWith('https://')) ? (
                <span className="tag tag-green" style={{ fontSize: 10 }}>✓ CTA link</span>
              ) : (
                <span className="tag tag-red" style={{ fontSize: 10 }}>⚠️ No CTA link</span>
              )}
              {data.promoCode && <span className="tag tag-orange" style={{ fontSize: 10 }}>🎟️ {data.promoCode}</span>}
              {data.hasPdf && <span className="tag tag-orange" style={{ fontSize: 10 }}>📄 PDF</span>}
              {data.useAI && <span className="tag tag-indigo" style={{ fontSize: 10 }}>🤖 AI on</span>}
            </div>
          </div>

          {/* template style quick-switch */}
          <div className="preview-controls">
            <p>Template style</p>
            {[
              ["button", "Button template"],
              ["text", "Text template"],
              ["mention", "Mention template"],
            ].map(([v, l]) => (
              <button key={v} className={`tpl-chip ${data.tplType === v ? "active" : ""}`} onClick={() => set("tplType", v)}>
                <div className="tpl-dot" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{l}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Dashboard Page ───────────────────────────────────────────────────────
const Dashboard = ({ setPage, onUpgrade, campaigns, userProfile }) => {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const totalSent = safeCampaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  const totalClicks = safeCampaigns.reduce((acc, c) => acc + (c.stats?.clicks || 0), 0);
  
  // Dashboard "Active Rules" should specifically count DM Planner global rules
  const globalRules = safeCampaigns.filter(c => c.isGlobal);
  const activeCount = globalRules.filter(c => c.status === 'active' && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length;
  const pausedCount = globalRules.filter(c => c.status === 'paused' || (c.expiresAt && new Date(c.expiresAt) <= new Date())).length;
  
  const isConnected = !!userProfile?.instagram?.username;
  const igUser = userProfile?.instagram;

  return (
    <div className="page fade-in">
      <div className="dashboard-banner" style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`, color: "white", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>🚀 {isConnected ? 'Automations Active' : 'Unlock Pro Power!'}</p>
          <p style={{ fontSize: 12.5, opacity: 0.85 }}>{isConnected ? `Your account @${igUser.username} is fully connected.` : 'Get unlimited automations, contacts & advanced analytics.'}</p>
        </div>
        {!isConnected && <button className="btn" style={{ background: "white", color: C.indigo, fontWeight: 700, fontSize: 13, flexShrink: 0 }} onClick={onUpgrade}>Upgrade to Pro</button>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: C.mid, fontSize: 14, marginTop: 4 }}>
            {isConnected 
              ? `Connected to @${igUser.username} · ${(igUser.followers || 0).toLocaleString()} followers` 
              : "Grow your business with automated Instagram marketing."}
          </p>
        </div>
        {isConnected && igUser.profilePic && (
          <img src={igUser.profilePic} alt="IG" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.indigo}` }} />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setPage("planner")}><Icon name="planner" size={14} /> Manage Rules</button>
          <button className="btn btn-primary" onClick={() => setPage("campaigns")}><Icon name="plus" size={14} /> New Campaign</button>
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
        <div className="card" style={{ borderBottom: `4px solid ${C.teal}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Total DMs Sent</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: C.teal, marginBottom: 4 }}>{totalSent}</p>
          <p style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>📩 Order inquiries</p>
        </div>
        <div className="card" style={{ borderBottom: `4px solid ${C.orange}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Link Clicks</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: C.orange, marginBottom: 4 }}>{totalClicks}</p>
          <p style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>🍔 Menu views</p>
        </div>
        <div className="card" style={{ borderBottom: `4px solid ${C.green}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Active Rules</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: C.green, marginBottom: 4 }}>{activeCount}</p>
          <p style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>⚙️ {pausedCount} paused</p>
        </div>
        <div className="card" style={{ borderBottom: `4px solid ${C.indigo}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Total Followers</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: C.indigo, marginBottom: 4 }}>{igUser?.followers ? igUser.followers.toLocaleString() : 0}</p>
          <p style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>👥 Connected audience</p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15 }}>Campaigns</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}>View all</button>
        </div>
        <table className="table-wrap">
          <thead>
            <tr>{["Post", "Status", "Sent", "Clicks", "CTR", ""].map(h => <th key={h} style={h !== "Post" ? { textAlign: "center" } : {}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {safeCampaigns.map(c => (
              <tr key={c._id || c.id}>
                <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{c.emoji}</span><span style={{ fontWeight: 500, fontSize: 13.5 }}>{c.title}</span></div></td>
                <td style={{ textAlign: "center" }}><span className={`tag ${c.status === "active" ? "tag-green" : c.status === "paused" ? "tag-orange" : "tag-muted"}`}>{c.status}</span></td>
                <td style={{ textAlign: "center", fontWeight: 500 }}>{c.stats?.sent || 0}</td>
                <td style={{ textAlign: "center", fontWeight: 500 }}>{c.stats?.clicks || 0}</td>
                <td style={{ textAlign: "center", color: c.ctr !== "—" ? C.green : C.muted, fontWeight: 700 }}>{c.ctr}</td>
                <td style={{ textAlign: "center" }}><button className="btn btn-ghost btn-sm" onClick={() => setPage("campaigns")}><Icon name="edit" size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15 }}>DMs over time</h3>
          <span className="tag tag-muted">Last 14 days</span>
        </div>
        <div style={{ display: "flex", gap: 3, height: 80, alignItems: "flex-end" }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // For now, map all totalSent to today since we don't have a time-series DB yet.
            const val = i === 13 ? totalSent : 0;
            const maxVal = Math.max(totalSent, 10); // So the bar doesn't look gigantic for 1 DM
            const heightPct = val > 0 ? Math.max((val / maxVal) * 100, 15) : 0; // Minimum 15% height if > 0

            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", background: C.tealLight, borderRadius: "4px 4px 0 0", height: `${heightPct}%`, transition: 'height 0.3s ease' }}>
                  <div style={{ width: "100%", background: C.teal, borderRadius: "4px 4px 0 0", height: "100%" }} />
                </div>
                {i % 4 === 0 && <span style={{ fontSize: 9, color: C.muted, fontWeight: 600, whiteSpace: "nowrap" }}>{dateStr}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Campaigns Page ────────────────────────────────────────────────────────
const CampaignsPage = ({ posts, campaigns, onToggleStatus, onCampaignCreated, onDeleteCampaign, onSimulate }) => {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [tab, setTab] = useState("all");
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safePosts = Array.isArray(posts) ? posts : [];
  const filtered = tab === "all" ? safeCampaigns : safeCampaigns.filter(c => c.status === tab);

  // Normalise post — works for both mock data (post.id) and real DB posts (post._id)
  const getPostId = (post) => post._id || post.id;
  const isSelected = (post) => selectedPost && getPostId(selectedPost) === getPostId(post);

  // Build a preview-friendly post object regardless of source
  const normalisePost = (post) => ({
    id: getPostId(post),
    _id: getPostId(post),
    title: post.title || post.caption?.slice(0, 60) || "Instagram Post",
    emoji: post.emoji || (post.mediaType === "VIDEO" ? "🎬" : post.mediaType === "CAROUSEL_ALBUM" ? "📷" : "🖼️"),
    type: post.type || (post.mediaType === "VIDEO" ? "reel" : post.mediaType === "CAROUSEL_ALBUM" ? "carousel" : "post"),
    platform: post.platform || "Instagram",
    date: post.date || (post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ""),
    likes: post.likeCount ?? post.likes ?? 0,
    mediaUrl: post.mediaUrl || null,
    igPostId: post.igPostId || post.id,
    permalink: post.permalink || null,
  });

  const normalisedPosts = safePosts.map(normalisePost);

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Campaigns</h1>
        <p style={{ color: C.mid, fontSize: 13.5 }}>Select a post to create a campaign, or manage existing ones below</p>
      </div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Select a Post</h3>
            <p style={{ fontSize: 12.5, color: C.mid }}>Pick any post or reel to create a DM campaign for it</p>
          </div>
          {selectedPost && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setWizard("template")}><Icon name="zap" size={13} /> Use Template</button>
              <button className="btn btn-primary btn-sm" onClick={() => setWizard("custom")}><Icon name="plus" size={13} /> Build Campaign</button>
            </div>
          )}
        </div>

        {normalisedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍕</div>
            <p className="empty-title">No menu posts found</p>
            <p className="empty-sub">Connect your professional Instagram account to see your delicious food posts here.</p>
          </div>
        ) : (
          <div className="post-grid">
            {normalisedPosts.map(post => (
              <div
                key={post.id}
                className={`post-card ${isSelected(post) ? "selected" : ""}`}
                onClick={() => setSelectedPost(isSelected(post) ? null : post)}
              >
                <div className="post-thumb" style={{ overflow: "hidden" }}>
                  {post.mediaUrl ? (
                    post.type === "reel" || post.mediaType === "VIDEO" ? (
                      <video src={post.mediaUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                    ) : (
                      <img src={post.mediaUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )
                  ) : (
                    <span style={{ fontSize: 36 }}>{post.emoji}</span>
                  )}
                  {isSelected(post) && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="check" size={13} color="white" />
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    <span className={`tag ${post.type === "reel" || post.type === "VIDEO" ? "tag-purple" : post.type === "carousel" ? "tag-blue" : "tag-blue"}`} style={{ fontSize: 10, padding: "2px 7px" }}>{post.type}</span>
                  </div>
                </div>
                <div className="post-info">
                  <p className="post-title">{post.title}</p>
                  <p className="post-meta">{post.platform} · {post.date} · ❤️ {post.likes}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPost && (
          <div style={{ marginTop: "1rem", padding: "16px 20px", background: C.tealLight, border: `1px solid ${C.tealMid}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 4px 12px ${C.teal}15` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{selectedPost.emoji}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{selectedPost.title}</p>
                <p style={{ fontSize: 12, color: C.mid, fontWeight: 500 }}>Ready to automate! Choose your setup below:</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setWizard("template")}><Icon name="zap" size={13} /> Quick Template</button>
              <button className="btn btn-primary btn-sm" onClick={() => setWizard("custom")}><Icon name="plus" size={13} /> Build Custom</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15 }}>Existing Campaigns</h3>
      </div>
      <div className="tab-row">
        {["all", "active", "paused", "setup"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t !== "all" && <span style={{ marginLeft: 6, background: tab === t ? C.teal : C.bg, color: tab === t ? "white" : C.muted, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{safeCampaigns.filter(c => c.status === t).length}</span>}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📣</div>
            <p className="empty-title">No active food campaigns</p>
            <p className="empty-sub">Select a dish from your posts above to start your first automation!</p>
          </div>
        )}
        {filtered.map(c => (
          <div key={c._id || c.id} className="card card-sm" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 26, width: 44, textAlign: "center", flexShrink: 0 }}>{c.emoji || (c.isGlobal ? "⚡" : "📣")}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <p style={{ fontWeight: 600, fontSize: 13.5 }}>{c.title || c.name}</p>
                {c.isGlobal && <span className="tag tag-blue" style={{ fontSize: 10.5 }}>auto-apply</span>}
                <span className={`tag ${c.status === "active" ? "tag-green" : c.status === "paused" ? "tag-orange" : "tag-muted"}`} style={{ fontSize: 10.5 }}>{c.status}</span>
              </div>
              <p style={{ fontSize: 12, color: C.muted }}>
                {Array.isArray(c.keywords) && c.keywords.length > 0 
                  ? `Keywords: ${c.keywords.join(", ")}` 
                  : Array.isArray(c.triggerKeywords) && c.triggerKeywords.length > 0 
                    ? `Keywords: ${c.triggerKeywords.join(", ")}` 
                    : typeof c.triggerKeywords === 'string' && c.triggerKeywords 
                      ? `Keywords: ${c.triggerKeywords}`
                      : "No keywords set"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 18, textAlign: "center", flexShrink: 0 }}>
              <div><p style={{ fontSize: 15, fontWeight: 700 }}>{c.stats?.sent ?? c.sent ?? 0}</p><p style={{ fontSize: 11, color: C.muted }}>Sent</p></div>
              <div><p style={{ fontSize: 15, fontWeight: 700 }}>{c.stats?.clicks ?? c.clicks ?? 0}</p><p style={{ fontSize: 11, color: C.muted }}>Clicks</p></div>
              <div><p style={{ fontSize: 15, fontWeight: 700, color: C.green }}>{c.ctr || "—"}</p><p style={{ fontSize: 11, color: C.muted }}>CTR</p></div>
            </div>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => onSimulate(c)}
                disabled={c.status !== 'active'}
                style={{ fontSize: 11, padding: "4px 8px" }}
                title="Simulate a comment webhook to test this campaign"
              >
                <Icon name="play" size={12} /> Test
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onToggleStatus(c._id || c.id, c.status)}><Icon name={c.status === 'active' ? 'pause' : 'play'} size={13} /></button>
              <button className="btn btn-ghost btn-sm" style={{ color: C.red }} onClick={() => onDeleteCampaign(c._id || c.id)}><Icon name="delete" size={13} /></button>
            </div>
          </div>
        ))}
      </div>
      {wizard === "template" && selectedPost && <TemplateCampaignWizard post={selectedPost} onClose={() => { setWizard(null); setSelectedPost(null); if (onCampaignCreated) onCampaignCreated(); }} />}
      {wizard === "custom" && selectedPost && <CustomCampaignWizard post={selectedPost} onClose={() => { setWizard(null); setSelectedPost(null); if (onCampaignCreated) onCampaignCreated(); }} />}
    </div>
  );
};

// ── Analytics Page ───────────────────────────────────────────────────────
const AnalyticsPage = ({ onUpgrade, campaigns, userProfile }) => {
  const totalSent = campaigns?.reduce((acc, c) => acc + (c.stats?.sent || 0), 0) || 0;
  const totalClicks = campaigns?.reduce((acc, c) => acc + (c.stats?.clicks || 0), 0) || 0;
  const ctr = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0.0";
  const estimatedRevenue = totalClicks * 170;
  const orders = Math.floor(totalClicks * 0.35);

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: C.mid, fontSize: 13.5 }}>Performance overview for @{userProfile?.instagram?.username || "user"}</p>
      </div>
      <div className="grid-2" style={{ marginBottom: "1.25rem" }}>
        <div className="revenue-card" style={{ background: `linear-gradient(135deg, ${C.teal}, #1A9E92)`, borderRadius: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Orders via DM Flow</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 4 }}>{orders}</p>
          <p style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}><Icon name="up" size={14} /> Delivered by FoodChow</p>
        </div>
        <div className="card" style={{ background: C.greenLight, borderColor: `${C.green}30`, borderRadius: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Estimated Ad Revenue</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: C.green, marginBottom: 4 }}>₹{estimatedRevenue.toLocaleString()}</p>
          <p style={{ fontSize: 13, color: C.green, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}><Icon name="up" size={14} /> lifetime value</p>
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
        <div className="card">
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>DMs Sent</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.orange, marginBottom: 4 }}>{totalSent}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Link Clicks</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.blue, marginBottom: 4 }}>{totalClicks}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Click-Through Rate</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.green, marginBottom: 4 }}>{ctr}%</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Comments Replied</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.purple, marginBottom: 4 }}>{totalSent}</p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: "1.25rem" }}>DM Conversion Funnel</h3>
        {[
          { label: "Comments received", count: totalSent, pct: totalSent > 0 ? 100 : 0, color: C.blue },
          { label: "DMs sent", count: totalSent, pct: totalSent > 0 ? 100 : 0, color: C.orange },
          { label: "Link clicks", count: totalClicks, pct: totalSent > 0 ? Math.round((totalClicks/totalSent)*100) : 0, color: C.purple },
          { label: "Orders placed", count: orders, pct: totalSent > 0 ? Math.round((orders/totalSent)*100) : 0, color: C.green },
        ].map(o => (
          <div key={o.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</span>
              <span style={{ fontSize: 12, color: C.mid }}>{o.count} · {o.pct}%</span>
            </div>
            <div className="bar"><div className="bar-fill" style={{ width: `${o.pct}%`, background: o.color }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── DM Planner Page ──────────────────────────────────────────────────────
const PlannerPage = ({ campaigns, onToggleStatus, onDeleteCampaign, onCampaignCreated }) => {
  const { user } = useAuth();
  const globalRules = Array.isArray(campaigns) ? campaigns.filter(c => c.isGlobal) : [];
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rule, setRule] = useState({
    name: "",
    trigger: "keyword",
    keywords: [],
    newKw: "",
    dmMessage: "Hey {{name}}! 👋 Thanks for commenting on our post. Here's your exclusive link:",
    ctaUrls: [""],
    hasPdf: false,
    pdfName: "",
    promoCode: "",
    expiresAt: "",  // empty = never expires
    requireFollow: false,
    followMessage: "To claim your link, you must follow our account first! Click below to follow.",
    followBtnLabel: "Send Link"
  });

  const setR = (key, val) => setRule(r => ({ ...r, [key]: val }));
  const addKw = () => {
    if (rule.newKw.trim() && !rule.keywords.includes(rule.newKw.trim())) {
      setR('keywords', [...rule.keywords, rule.newKw.trim()]);
      setR('newKw', '');
    }
  };
  const removeKw = kw => setR('keywords', rule.keywords.filter(k => k !== kw));

  const handleSave = async () => {
    if (!rule.name.trim()) return alert('Please enter a rule name.');
    if (!rule.dmMessage.trim()) return alert('Please enter a DM message.');

    const validUrls = (rule.ctaUrls || []).filter(url => url.trim().startsWith('https://'));
    const hasValidLinks = validUrls.length > 0;
    const hasPdf = rule.hasPdf && rule.pdfName;
    if (!hasValidLinks && !hasPdf) {
      return alert('Either at least one valid CTA link (starting with https://) or an attached PDF is required.');
    }

    setSaving(true);
    try {
      const linksText = validUrls.map(url => `🔗 ${url}`).join('\n');
      const pdfText = rule.hasPdf ? `\n📄 PDF Flyer: ${rule.pdfName}` : '';
      const replyMessage = rule.dmMessage + (linksText ? `\n\n${linksText}` : '') + pdfText + (rule.promoCode ? `\n🎟️ Code: ${rule.promoCode}` : '');

      const body = {
        title: rule.name,
        triggerKeywords: rule.keywords.join(','),
        replyMessage: replyMessage,
        postId: null,
        status: 'active',
        isGlobal: true,
        expiresAt: rule.expiresAt ? new Date(rule.expiresAt).toISOString() : null,
        ctaUrls: validUrls,
        hasPdf: rule.hasPdf,
        pdfName: rule.pdfName,
        promoCode: rule.promoCode,
        requireFollow: rule.requireFollow,
        followMessage: rule.followMessage || 'To claim your link, you must follow our account first! Click below to follow.',
        followBtnLabel: rule.followBtnLabel || 'Send Link'
      };
      const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowNew(false);
        setRule({
          name: '',
          trigger: 'keyword',
          keywords: [],
          newKw: '',
          dmMessage: "Hey {{name}}! 👋 Thanks for commenting on our post. Here's your exclusive link:",
          ctaUrls: [''],
          hasPdf: false,
          pdfName: '',
          promoCode: '',
          expiresAt: '',
          requireFollow: false,
          followMessage: 'To claim your link, you must follow our account first! Click below to follow.',
          followBtnLabel: 'Send Link'
        });
        if (onCampaignCreated) onCampaignCreated();
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="page fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>DM Planner</h1>
          <p style={{ color: C.mid, fontSize: 13.5 }}>Auto-apply campaigns to every new post you publish</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={14} /> Add Rule</button>
      </div>

      <div style={{ background: C.amberLight, border: `1px solid #FCD34D`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <Icon name="info" size={15} color={C.amber} />
        <p style={{ fontSize: 13, color: C.amber }}>Planner rules automatically activate on new posts. Toggle them off anytime to pause for a specific post.</p>
      </div>

      {/* Existing Rules List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        {globalRules.length === 0 && !showNew && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p className="empty-title">No planner rules yet</p>
            <p className="empty-sub">Add a rule to auto-apply a campaign to every new post you publish.</p>
          </div>
        )}
        {globalRules.map(plan => {
          const isExpired = plan.expiresAt && new Date(plan.expiresAt) < new Date();
          return (
            <div key={plan._id || plan.id} className="card card-sm" style={{ display: "flex", alignItems: "center", gap: 14, opacity: isExpired ? 0.5 : 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5 }}>{plan.title}</p>
                  <span className="tag tag-blue" style={{ fontSize: 10.5 }}>auto-apply</span>
                  {isExpired && <span className="tag tag-red" style={{ fontSize: 10.5 }}>Expired</span>}
                </div>
                <p style={{ fontSize: 12, color: C.muted }}>
                  Keywords: {Array.isArray(plan.triggerKeywords) ? plan.triggerKeywords.join(', ') : plan.triggerKeywords || 'Any comment'}
                  {plan.expiresAt && <span style={{ marginLeft: 8 }}>· Expires: {new Date(plan.expiresAt).toLocaleDateString()}</span>}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: plan.status === 'active' && !isExpired ? C.green : C.muted, fontWeight: 600 }}>
                  {isExpired ? 'Expired' : plan.status === 'active' ? 'Active' : 'Paused'}
                </span>
                <button
                  className={`toggle ${plan.status === 'active' && !isExpired ? 'on' : ''}`}
                  onClick={() => onToggleStatus(plan._id || plan.id, plan.status)}
                />
                <button className="btn btn-ghost btn-sm" style={{ color: C.red }} onClick={() => onDeleteCampaign(plan._id || plan.id)}>
                  <Icon name="delete" size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Rule Modal */}
      {showNew && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <p style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>DM Planner</p>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>New Global Rule</h2>
              </div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowNew(false)}><Icon name="x" size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Rule Name */}
              <div>
                <label>Rule name</label>
                <input placeholder="e.g. Weekend Promo, New Menu Launch" value={rule.name} onChange={e => setR('name', e.target.value)} />
              </div>

              {/* Trigger */}
              <div>
                <label>Trigger type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[['keyword', 'Keywords'], ['any_comment', 'Any Comment']].map(([v, l]) => (
                    <button key={v} className={`btn btn-sm ${rule.trigger === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setR('trigger', v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              {rule.trigger === 'keyword' && (
                <div>
                  <label>Trigger keywords</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {rule.keywords.map(kw => (
                      <span key={kw} className="keyword-tag">{kw}<button onClick={() => removeKw(kw)}>×</button></span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ flex: 1 }} placeholder="e.g. MENU, LINK, ORDER" value={rule.newKw} onChange={e => setR('newKw', e.target.value)} onKeyDown={e => e.key === 'Enter' && addKw()} />
                    <button className="btn btn-secondary btn-sm" onClick={addKw}>Add</button>
                  </div>
                </div>
              )}

              {/* DM Message */}
              <div>
                <label>Automated DM message</label>
                <textarea rows={3} value={rule.dmMessage} onChange={e => setR('dmMessage', e.target.value)} />
                <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Use {"{{name}}"} to insert the customer's username</p>
              </div>

              {/* CTA Links Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>🔗 CTA / Offer links</label>
                  <span className="tag tag-red" style={{ fontSize: 10, padding: "2px 8px" }}>{rule.hasPdf ? "Optional" : "Required"}</span>
                </div>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>All links must start with "https://".</p>
                {(rule.ctaUrls || [""]).map((url, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        placeholder="https://foodchow.com/restaurant/your-menu"
                        value={url}
                        onChange={e => {
                          const next = [...rule.ctaUrls];
                          next[i] = e.target.value;
                          setR("ctaUrls", next);
                        }}
                      />
                      {rule.ctaUrls.length > 1 && (
                        <button
                          className="btn btn-ghost"
                          style={{ color: C.red, padding: 8, height: 38, width: 38, minWidth: 38 }}
                          onClick={() => {
                            const next = rule.ctaUrls.filter((_, idx) => idx !== i);
                            setR("ctaUrls", next);
                          }}
                        >
                          <Icon name="delete" size={15} />
                        </button>
                      )}
                    </div>
                    {url.trim() && !url.trim().startsWith("https://") && (
                      <p style={{ fontSize: 11, color: C.red, margin: "2px 0 0 4px" }}>⚠️ Link must start with https://</p>
                    )}
                  </div>
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setR("ctaUrls", [...rule.ctaUrls, ""])}
                >
                  <Icon name="plus" size={11} /> Add CTA Link
                </button>
              </div>

              {/* PDF upload */}
              <div>
                <label style={{ display: "block", marginBottom: 4 }}>📄 Attach menu PDF or promo flyer <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="file"
                  accept="application/pdf"
                  id="system-pdf-picker-planner"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setR("hasPdf", true);
                      setR("pdfName", file.name);
                    }
                  }}
                />
                <div
                  className={`upload-zone ${rule.hasPdf ? "has-file" : ""}`}
                  onClick={() => {
                    if (rule.hasPdf) return;
                    document.getElementById("system-pdf-picker-planner").click();
                  }}
                  style={{ cursor: "pointer", border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "16px", textAlign: "center", background: rule.hasPdf ? C.greenLight : "none" }}
                >
                  {rule.hasPdf ? (
                    <>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>✅</div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.green }}>{rule.pdfName}</p>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ color: C.red, borderColor: C.redLight, fontSize: 10.5, marginTop: 6 }}
                        onClick={e => { e.stopPropagation(); setR("hasPdf", false); setR("pdfName", ""); }}
                      >Remove</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>📄</div>
                      <p style={{ fontSize: 12.5, fontWeight: 600 }}>Click to attach local PDF</p>
                    </>
                  )}
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label>🎟️ Promo code <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
                <input placeholder="e.g. PIZZA20" value={rule.promoCode} onChange={e => setR('promoCode', e.target.value.toUpperCase())} />
              </div>

              {/* Require Follow Switch & Custom Fields */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.orangeLight, borderRadius: 10, border: `1px solid ${C.orangeMid}` }}>
                <button className={`toggle ${rule.requireFollow ? "on" : ""}`} onClick={() => setR("requireFollow", !rule.requireFollow)} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.orange, margin: 0 }}>Require follow to get link</p>
                  <p style={{ fontSize: 11.5, color: C.mid, margin: 0 }}>Customer must follow before receiving the offer link</p>
                </div>
              </div>
              {rule.requireFollow && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }} className="fade-in">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Custom follow-check warning message</label>
                    <textarea
                      style={{ fontSize: 12.5 }}
                      value={rule.followMessage}
                      onChange={e => setR("followMessage", e.target.value)}
                      rows={2}
                      placeholder="e.g. To claim your link, you must follow our account first! Click below to follow."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Button label (e.g. Send Link or Send PDF)</label>
                    <input
                      style={{ fontSize: 12.5 }}
                      value={rule.followBtnLabel}
                      onChange={e => setR("followBtnLabel", e.target.value)}
                      placeholder="e.g. Send Link"
                    />
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: C.border }} />

              {/* Expiry Date */}
              <div>
                <label>📅 Rule expiry date <span style={{ color: C.muted, fontWeight: 400 }}>(leave blank = never expires)</span></label>
                <input type="date" value={rule.expiresAt} onChange={e => setR('expiresAt', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                {rule.expiresAt && (
                  <p style={{ fontSize: 12, color: C.teal, marginTop: 5 }}>✓ Rule will stop auto-assigning after {new Date(rule.expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
                <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving || !rule.name.trim()} onClick={handleSave}>
                  {saving ? <><Icon name="zap" size={13} /> Saving...</> : <><Icon name="zap" size={13} /> Save Rule</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Learn Page ───────────────────────────────────────────────────────────
const LearnPage = ({ onUpgrade }) => {
  const { user } = useAuth();
  const [liveVideos, setLiveVideos] = useState([]);
  const staticVideos = [];
  const videos = staticVideos;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/videos`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLiveVideos(data);
        }
      } catch (e) { /* ignore */ }
    };
    fetchVideos();
  }, []);
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Learn</h1>
        <p style={{ color: C.mid, fontSize: 13.5 }}>Master FoodChow DM with step-by-step video tutorials</p>
      </div>
      <div className="dashboard-banner" style={{ background: `linear-gradient(135deg,${C.indigo},${C.purple})`, color: "white", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 36 }}>🎓</div>
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Start with the Auto Chats masterclass</p>
            <p style={{ fontSize: 12.5, opacity: 0.85 }}>Unlock all premium tutorials — grow your restaurant faster</p>
          </div>
        </div>
        <button className="btn" style={{ background: "white", color: C.indigo, fontWeight: 700, flexShrink: 0 }} onClick={onUpgrade}>Unlock All Videos</button>
      </div>

      {/* Live videos uploaded by admin */}
      {liveVideos.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: "1rem" }}>📹 Videos from Auto Chats Team</h3>
          <div className="grid-3">
            {liveVideos.map(v => (
              <div key={v._id} className="video-card">
                <div style={{ borderRadius: "10px 10px 0 0", overflow: "hidden", background: "#1C1917" }}>
                  <video
                    src={`${API_BASE_URL}${v.videoUrl}`}
                    style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                    controls
                  />
                </div>
                <div className="video-info">
                  <p className="video-title">{v.title}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p className="video-meta">{new Date(v.createdAt).toLocaleDateString()}</p>
                    <span className="tag tag-green" style={{ fontSize: 10 }}>Free</span>
                  </div>
                  {v.description && <p style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{v.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Static guide videos */}
      {liveVideos.length === 0 && (
        <div className="card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: "1rem" }}>📹</div>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No Tutorials Yet</h3>
          <p style={{ color: C.mid, fontSize: 13.5, margin: 0 }}>We are busy preparing high-quality detailed video courses for you. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

// ── Settings Page ────────────────────────────────────────────────────────
const SettingsPage = ({ onUpgrade, userProfile, totalSent, onProfileUpdate }) => {
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [profile, setProfile] = useState({ 
    firstName: userProfile?.firstName || "", 
    lastName: userProfile?.lastName || "", 
    email: userProfile?.email || "", 
    phone: userProfile?.phone || "",
    notifs: {
      dm_sent: userProfile?.notifs?.dm_sent ?? true,
      clicks: userProfile?.notifs?.clicks ?? true,
      weekly: userProfile?.notifs?.weekly ?? true
    }
  });

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone, notifs: profile.notifs })
      });
      if (res.ok) {
        const updated = await res.json();
        setSaveMsg('\u2705 Saved successfully!');
        if (onProfileUpdate) onProfileUpdate(updated);
      } else {
        setSaveMsg('\u274c Failed to save. Try again.');
      }
    } catch (e) {
      setSaveMsg('\u274c Network error. Try again.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const disconnectIg = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ig/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        window.location.href = '/connect-ig';
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: C.mid, fontSize: 13.5 }}>Manage your account and preferences</p>
      </div>
      <div className="tab-row">
        {["general", "instagram", "billing"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "general" ? "General" : t === "instagram" ? "Instagram Accounts" : "Billing"}
          </button>
        ))}
      </div>
      {tab === "general" && (
        <div className="card fade-in" style={{ maxWidth: 560 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>General Settings</h3>
          <p style={{ fontSize: 13, color: C.mid, marginBottom: "1.5rem" }}>Manage your workspace preferences</p>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div><label>First Name</label><input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div><label>Last Name</label><input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label>Email</label><input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
          <div style={{ marginBottom: "1.5rem" }}><label>Phone Number</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
          <div className="divider" />
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Notification Preferences</p>
            {[{ id: "dm_sent", label: "DM sent notifications", desc: "Get notified when DMs are sent" },
              { id: "clicks", label: "Click alerts", desc: "Alert when someone clicks your offer link" },
              { id: "weekly", label: "Weekly report", desc: "Receive weekly performance summary" }].map(n => (
              <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bg}` }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 500 }}>{n.label}</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{n.desc}</p>
                </div>
                <button className={`toggle ${profile.notifs?.[n.id] ? "on" : ""}`} onClick={() => setProfile(p => ({ ...p, notifs: { ...p.notifs, [n.id]: !p.notifs[n.id] } }))} />
              </div>
            ))}
          </div>
          {saveMsg && <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: saveMsg.startsWith('\u2705') ? C.green : C.red }}>{saveMsg}</p>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      )}
      {tab === "instagram" && (
        <div className="fade-in" style={{ maxWidth: 560 }}>
          {userProfile?.instagram ? (
            <div className="ig-account-card" style={{ borderColor: C.green, background: C.greenLight }}>
              <div className="ig-avatar">
                {userProfile.instagram.profilePic ? <img src={userProfile.instagram.profilePic} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : "📷"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>@{userProfile.instagram.username}</p>
                <p style={{ fontSize: 12, color: C.green }}>✓ Connected · {userProfile.instagram.followers?.toLocaleString() || 0} followers</p>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ color: C.red, borderColor: C.redLight }} onClick={disconnectIg}>Disconnect</button>
            </div>
          ) : (
            <div className="ig-account-card" style={{ background: C.bg }}>
              <p style={{ fontSize: 13.5, color: C.mid }}>No Instagram Account Connected</p>
            </div>
          )}
          <div className="ig-account-card" style={{ borderStyle: "dashed", marginBottom: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="plus" size={18} color={C.muted} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13.5, color: C.mid }}>Add another Instagram account</p>
              <p style={{ fontSize: 12, color: C.muted }}>Connect up to 3 accounts on Pro plan</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Connect</button>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <div className="ig-account-card">
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="facebook" size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13.5 }}>Facebook not connected</p>
                <p style={{ fontSize: 12, color: C.muted }}>Connect your Facebook page for more reach</p>
              </div>
              <button className="btn btn-secondary btn-sm">Connect</button>
            </div>
          </div>
        </div>
      )}
      {tab === "billing" && (
        <div className="fade-in" style={{ maxWidth: 560 }}>
          <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeMid}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Current Plan</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Free Plan</p>
                <p style={{ fontSize: 13, color: C.mid }}>1,000 DMs · 1,000 contacts per month</p>
              </div>
              <button className="btn btn-primary" onClick={onUpgrade}>Upgrade to Pro</button>
            </div>
          </div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: "1rem" }}>Plan Usage</h3>
            {[{ label: "DMs", used: totalSent || 0, max: 1000 }, { label: "Contacts", used: 0, max: 1000 }].map(u => (
              <div key={u.label} style={{ marginBottom: 14 }}>
                <div className="usage-label" style={{ fontSize: 13 }}><span>{u.label}</span><span style={{ color: C.muted }}>{u.used} / {u.max.toLocaleString()}</span></div>
                <div className="usage-track" style={{ height: 8, borderRadius: 4 }}><div className="usage-fill" style={{ width: `${(u.used / u.max) * 100}%`, borderRadius: 4 }} /></div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: "1rem" }}>Billing History</h3>
            <div className="empty-state" style={{ padding: "2rem" }}>
              <div className="empty-icon">🧾</div>
              <p className="empty-title">No billing history yet</p>
              <p className="empty-sub">Upgrade to Pro to start your billing cycle.</p>
              <button className="btn btn-primary" onClick={onUpgrade}>Upgrade to Pro →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sidebar Nav ──────────────────────────────────────────────────────────
const SidebarNav = ({ page, setPage, onUpgrade, isConnected, connectedPlatform, userProfile, campaignCount }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "campaigns", label: "Campaigns", icon: "campaign", badge: campaignCount || 0 },
    { id: "planner", label: "DM Planner", icon: "planner" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "learn", label: "Learn", icon: "learn", isNew: true },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ width: 32, height: 32, background: C.orange, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 900 }}>AC</div>
        <div>Auto<span>Chats</span></div>
      </div>
      <div className="sidebar-user" style={{ cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = C.orangeLight} onMouseOut={e => e.currentTarget.style.background = 'transparent'} onClick={() => setPage('settings')}>
        {userProfile?.instagram?.profilePic ? (
          <img src={userProfile.instagram.profilePic} alt="Profile" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />
        ) : (
          <div className="user-avatar">{userProfile ? userProfile.firstName[0] + userProfile.lastName[0] : "JG"}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <p className="user-name">{userProfile?.instagram?.username ? `@${userProfile.instagram.username}` : (userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "User")}</p>
          <p className={`user-status ${isConnected ? "connected" : ""}`}>
            {isConnected ? `● ${connectedPlatform}` : "● Instagram offline"}
          </p>
        </div>
      </div>
      <div className="nav-section">
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <Icon name={item.icon} size={16} />
            {item.label}
            {typeof item.badge === 'number' && item.badge > 0 && page !== item.id && <span className="nav-badge">{item.badge}</span>}
            {item.isNew && <span className="nav-new">NEW</span>}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="usage-row">
          <div className="usage-label"><span>{(userProfile?.usageStats?.dms ?? 0).toLocaleString()}/1000 DMs</span><span>per month</span></div>
          <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min(((userProfile?.usageStats?.dms ?? 0)/1000)*100, 100)}%` }} /></div>
        </div>
        <div className="usage-row">
          <div className="usage-label"><span>0/1000 contacts</span><span>per month</span></div>
          <div className="usage-track"><div className="usage-fill" style={{ width: "0%" }} /></div>
        </div>
        <button className="upgrade-btn" onClick={onUpgrade}>👑 Upgrade to Pro</button>
        <button className="support-btn">
          <Icon name="wa" size={14} /> Support / Feedback
        </button>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }}><Icon name="logout" size={13} /> Logout</button>
      </div>
    </div>
  );
};

// ── Tutorial Wizard for New Users ────────────────────────────────────────
const TutorialModal = ({ onComplete }) => {
  const [slide, setSlide] = useState(0);
  
  const slides = [
    {
      icon: "📣",
      title: "Step 1: How to Make a Campaign",
      desc: "Go to the Campaigns tab, select any of your Instagram posts or reels, and click 'Build Campaign'. Set your trigger keywords (e.g. 'DEAL') and customize your reply DM. When a customer comments that keyword, our system automatically sends them your configured link or PDF flyer instantly!",
      color: C.orange, bg: C.orangeLight
    },
    {
      icon: "📅",
      title: "Step 2: How to Use DM Planner",
      desc: "Go to the DM Planner tab and click 'Add Rule'. You can set global rules that automatically apply a specific campaign (like a discount code) to every new post you publish in the future. You can set start/end dates and toggle these rules on or off at any time for total automation!",
      color: C.teal, bg: C.tealLight
    },
    {
      icon: "🎓",
      title: "Step 3: Watch Learning Videos",
      desc: "If you need more help or want to learn advanced marketing strategies, check out our Learn section! It features detailed video tutorials created by the Auto Chats team showing you exactly how to set up, optimize, and scale your DM flows to drive more sales.",
      color: C.indigo, bg: C.indigoLight
    }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, backdropFilter: "blur(4px)" }}>
      <div className="modal slide-up" style={{ maxWidth: 460, overflow: "hidden", position: "relative" }}>
        
        {/* Progress bar at top */}
        <div style={{ display: "flex", height: 4 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ flex: 1, background: i <= slide ? slides[slide].color : C.border, transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ padding: "2.5rem 2rem 2rem", textAlign: "center" }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 24, margin: "0 auto 1.5rem", 
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
            background: slides[slide].bg, border: `2px solid ${slides[slide].color}30`,
            transition: "all 0.3s"
          }}>
            {slides[slide].icon}
          </div>
          
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>
            {slides[slide].title}
          </h2>
          <p style={{ fontSize: 14.5, color: C.mid, lineHeight: 1.5, marginBottom: "2rem", minHeight: 66 }}>
            {slides[slide].desc}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            {slide > 0 && (
              <button className="btn btn-secondary" style={{ flex: 1, justifySelf: "stretch" }} onClick={() => setSlide(s => s - 1)}>
                Back
              </button>
            )}
            <button 
              className="btn" 
              style={{ flex: 2, justifySelf: "stretch", background: slides[slide].color, color: "white", borderColor: slides[slide].color }} 
              onClick={() => {
                if (slide === slides.length - 1) onComplete();
                else setSlide(s => s + 1);
              }}
            >
              {slide === slides.length - 1 ? "Let's Go! 🚀" : "Next Step"}
            </button>
          </div>
          
          <button 
            style={{ marginTop: "1rem", background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8, transition: "color 0.2s" }}
            onMouseOver={e => e.target.style.color = C.dark}
            onMouseOut={e => e.target.style.color = C.muted}
            onClick={onComplete}
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [showDemo, setShowDemo] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [learnToast, setLearnToast] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const totalSent = Array.isArray(campaigns) ? campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0) : 0;

  const handleProfileUpdate = (updated) => {
    setUserProfile(prev => ({ ...prev, ...updated }));
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      
      const pRes = await fetch(`${API_BASE_URL}/api/ig/posts`, { headers });
      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(Array.isArray(pData) ? pData : []);
      } else {
        setPosts([]);
      }
      
      const cRes = await fetch(`${API_BASE_URL}/api/campaigns`, { headers });
      if (cRes.ok) {
        const cData = await cRes.json();
        setCampaigns(Array.isArray(cData) ? cData : []);
      } else {
        setCampaigns([]);
      }
      
      const uRes = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
      if (uRes.ok) {
        const userData = await uRes.json();
        setUserProfile(userData);
      }
      
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for real-time feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const userId = user.email || user._id || 'guest';
      const dismissed = localStorage.getItem(`tutorialDismissed_${userId}`) || localStorage.getItem('tutorialDismissed');
      if (!dismissed) {
        setShowTutorial(true);
      } else {
        setShowTutorial(false);
      }
    } else {
      setShowTutorial(false);
    }
  }, [user]);

  const handleTutorialComplete = () => {
    if (user) {
      const userId = user.email || user._id || 'guest';
      localStorage.setItem(`tutorialDismissed_${userId}`, 'true');
    }
    localStorage.setItem('tutorialDismissed', 'true');
    setShowTutorial(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData(); // Refresh campaigns
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (e) {
      console.error("Failed to delete campaign", e);
    }
  };

  const handleSimulate = async (campaign) => {
    if (!campaign || campaign.status !== 'active') return;
    
    // Use the first keyword, or 'test' if none
    let keyword = 'test';
    if (Array.isArray(campaign.triggerKeywords) && campaign.triggerKeywords.length > 0) {
      keyword = campaign.triggerKeywords[0];
    } else if (typeof campaign.triggerKeywords === 'string' && campaign.triggerKeywords) {
      keyword = campaign.triggerKeywords.split(',')[0];
    }
    
    const accountId = userProfile?.instagram?.accountId || 'simulated_account_id';
    
    const payload = {
      object: 'instagram',
      entry: [{
        id: accountId,
        time: Date.now(),
        changes: [{
          field: 'comments',
          value: {
            verb: 'add',
            from: { id: accountId, username: 'simulated_tester' },
            media: { id: campaign.postId },
            id: 'simulated_comment_id_' + Date.now(),
            text: keyword
          }
        }]
      }]
    };
    
    try {
      await fetch(`${API_BASE_URL}/api/ig/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Give the backend a second to process and save stats, then refresh
      setTimeout(fetchData, 1000);
      alert(`Simulation sent! Check your terminal for the backend log, and watch your Campaign stats update!`);
    } catch (e) {
      console.error(e);
      alert('Failed to send simulation');
    }
  };

  const handleDemoAction = (action) => {
    setShowDemo(false);
    if (action === "skip") { setLearnToast(true); setTimeout(() => setLearnToast(false), 5000); }
    else if (action === "template" || action === "custom" || action === "new_campaign") setPage("campaigns");
    else setPage("dashboard");
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <SidebarNav 
          page={page} 
          setPage={setPage} 
          onUpgrade={() => setShowUpgrade(true)} 
          isConnected={!!userProfile?.instagram?.accountId} 
          connectedPlatform="Instagram" 
          userProfile={userProfile}
          campaignCount={campaigns.length}
        />
        <div className="main">
          {page === "dashboard" && <Dashboard setPage={p => setPage(p)} onUpgrade={() => setShowUpgrade(true)} campaigns={campaigns} userProfile={userProfile} />}
          {page === "campaigns" && <CampaignsPage posts={posts} campaigns={campaigns} onToggleStatus={handleToggleStatus} onDeleteCampaign={handleDeleteCampaign} onCampaignCreated={fetchData} onSimulate={handleSimulate} />}
          {page === "analytics" && <AnalyticsPage onUpgrade={() => setShowUpgrade(true)} campaigns={campaigns} userProfile={userProfile} />}
          {page === "planner" && <PlannerPage campaigns={campaigns} onToggleStatus={handleToggleStatus} onDeleteCampaign={handleDeleteCampaign} onCampaignCreated={fetchData} />}
          {page === "learn" && <LearnPage onUpgrade={() => setShowUpgrade(true)} />}
          {page === "settings" && <SettingsPage onUpgrade={() => setShowUpgrade(true)} userProfile={userProfile} totalSent={totalSent} onProfileUpdate={handleProfileUpdate} />}
        </div>
        {learnToast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "white", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease" }}>
            <Icon name="learn" size={16} color={C.orange} />
            <span style={{ fontSize: 13.5 }}>Not sure where to start? Check out the <button onClick={() => { setPage("learn"); setLearnToast(false); }} style={{ background: "none", border: "none", color: C.orange, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>Learn tab</button> for video tutorials!</span>
            <button onClick={() => setLearnToast(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0 }}><Icon name="x" size={14} /></button>
          </div>
        )}
        {showDemo && <DemoModal onDone={handleDemoAction} />}
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        {showTutorial && <TutorialModal onComplete={handleTutorialComplete} />}
      </div>
    </>
  );
}