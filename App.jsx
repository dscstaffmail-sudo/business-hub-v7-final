import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Building2, FolderKanban, Send, Plus, Search, Trash2, ArrowLeft,
  Users, CreditCard, Mail, Phone, MapPin, StickyNote, CheckCircle2,
  Clock, Circle, AlertCircle, ArrowRightCircle, Star, TrendingUp, BarChart3,
  FileText, CalendarDays, User, Briefcase, X, Eye, EyeOff, Flag, ChevronDown, ChevronUp,
  Layers, Target, Percent, Loader2, Camera, ImageIcon, Lock, LogOut, History, Shield,
  AlertTriangle, Settings, Shield as ShieldIcon, UserPlus, Edit2, Trash, Calendar
} from "lucide-react";

const INDUSTRIES = [
  // 👔 サービス業
  "ホテル・旅館",
  "ブライダル・結婚式場",
  "飲食店・レストラン",
  "カフェ・喫茶店",
  "居酒屋・バー",
  "美容室・ヘアサロン",
  "エステサロン",
  "フィットネス・ジム",
  "映画館・娯楽施設",
  
  // 🏪 小売業
  "百貨店・デパート",
  "スーパーマーケット",
  "コンビニエンスストア",
  "衣料品店",
  "靴・バッグ店",
  "家電販売店",
  "書店",
  "ドラッグストア",
  "ペットショップ",
  
  // 🏭 製造業
  "自動車製造",
  "電機・機械製造",
  "食品製造",
  "飲料製造",
  "化学・薬品製造",
  "繊維・衣料品製造",
  "家具製造",
  "建設機械製造",
  "精密機器製造",
  
  // 🏢 金融・保険
  "銀行",
  "証券会社",
  "保険会社",
  "カード会社",
  "消費者金融",
  "不動産投資会社",
  
  // 💻 情報通信
  "ソフトウェア開発",
  "ITコンサルティング",
  "Webサイト制作",
  "システム運用管理",
  "データセンター",
  "情報セキュリティ",
  "クラウドサービス",
  
  // 🏗️ 不動産・建設
  "不動産開発",
  "不動産仲介・売買",
  "建設会社",
  "建築設計事務所",
  "不動産管理",
  "土地開発",
  
  // 🚚 運輸・物流
  "運送会社",
  "配送・宅配",
  "倉庫・物流センター",
  "物流コンサルティング",
  "引越し業者",
  "タクシー・ハイヤー",
  "公共交通機関",
  
  // 🏥 医療・福祉
  "病院・診療所",
  "歯科医院",
  "薬局",
  "介護施設",
  "老人ホーム",
  "デイサービス",
  "障害者支援施設",
  "訪問看護ステーション",
  "リハビリテーション施設",
  
  // 📚 教育・訓練
  "大学・短大・高専",
  "高等学校",
  "中学校",
  "小学校",
  "幼稚園・保育園",
  "塾・予備校",
  "語学スクール",
  "職業訓練校",
  "研修センター",
  
  // 🌾 農業・漁業・鉱業
  "農業",
  "畜産業",
  "漁業",
  "林業",
  "鉱業",
  
  // ⚡ 電気・ガス・水道
  "電力会社",
  "ガス会社",
  "水道局",
  "廃棄物処理",
  "リサイクル業",
  
  // 📸 メディア・エンタメ
  "テレビ放送局",
  "ラジオ放送局",
  "新聞社",
  "出版社",
  "音楽制作",
  "映画制作",
  "広告代理店",
  "デザイン事務所",
  
  // 🔧 その他専門サービス
  "法律事務所",
  "会計事務所・税理士",
  "経営コンサルティング",
  "人材派遣・紹介",
  "採用支援",
  "マーケティング",
  "PR・広報",
  "翻訳・通訳",
  "清掃業",
  "警備業",
  
  // 🏛️ 公務・団体
  "国家公務員",
  "地方公務員",
  "自治会・町内会",
  "NPO法人",
  "社会福祉法人",
  "労働組合",
  
  // その他
  "その他"
];
const USERS_KEY = "business-hub-users";
const LOGS_KEY = "business-hub-logs";
const SESSION_TIMEOUT = 30 * 60 * 1000;
const uid = () => Math.random().toString(36).slice(2, 10);

const encrypt = (text, key) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const decrypt = (encrypted, key) => {
  try {
    const text = atob(encrypted);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return null;
  }
};

const hashPassword = (pwd) => {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// 権限定義
const PERMISSIONS = {
  owner: {
    viewDashboard: true, manageClients: true, manageProjects: true, manageContacts: true,
    manageTasks: true, sendDM: true, viewLogs: true, manageUsers: true, securitySettings: true,
  },
  admin: {
    viewDashboard: true, manageClients: true, manageProjects: true, manageContacts: true,
    manageTasks: true, sendDM: true, viewLogs: false, manageUsers: true, securitySettings: false,
  },
  member: {
    viewDashboard: true, manageClients: true, manageProjects: true, manageContacts: true,
    manageTasks: true, sendDM: true, viewLogs: false, manageUsers: false, securitySettings: false,
  },
};

const defaultData = {
  clients: [
    { id: "c1", company: "ホテルグランヴィア京都", industry: "ホテル", status: "商談中", address: "京都府京都市下京区烏丸通塩小路下ル", phone: "075-344-8888", notes: "秋シーズン",
      contacts: [
        { id: "ct1", name: "田中 太郎", position: "人事部長", email: "tanaka@example.com", phone: "090-1234-5678" },
        { id: "ct2", name: "佐藤 花子", position: "採用担当", email: "sato@example.com", phone: "090-8765-4321" },
      ],
      projects: [{ id: "p1", name: "秋季ホテル人材確保", tasks: [
        { id: "t1", title: "求人票作成", status: "完了", assignee: "松永", due: "2026-06-15", priority: "高" },
        { id: "t2", title: "候補者リストアップ", status: "進行中", assignee: "松永", due: "2026-06-20", priority: "高" },
      ]}],
    },
  ],
  dmHistory: [{ id: "dm1", subject: "秋季スタッフ増員", sentAt: "2026-06-01", recipients: 12, opened: 8 }],
};

const STATUS_CFG = {
  "リード": { grad: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", text: "#4338CA", dot: "#6366F1" },
  "商談中": { grad: "linear-gradient(135deg,#FFF7ED,#FFEDD5)", text: "#C2410C", dot: "#F97316" },
  "契約中": { grad: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", text: "#065F46", dot: "#10B981" },
  "休眠": { grad: "linear-gradient(135deg,#F9FAFB,#F3F4F6)", text: "#6B7280", dot: "#9CA3AF" },
};
const TS = {
  "未着手": { bg: "#F8FAFC", border: "#E2E8F0", accent: "#94A3B8", text: "#475569" },
  "進行中": { bg: "#EFF6FF", border: "#BFDBFE", accent: "#3B82F6", text: "#1E40AF" },
  "完了": { bg: "#F0FDF4", border: "#BBF7D0", accent: "#22C55E", text: "#166534" },
};
const PRI = { "高": { color: "#EF4444", bg: "#FEF2F2" }, "中": { color: "#F59E0B", bg: "#FFFBEB" }, "低": { color: "#94A3B8", bg: "#F8FAFC" } };

const ROLE_LABELS = { owner: "オーナー", admin: "管理者", member: "メンバー" };
const ROLE_COLORS = { owner: "#8B5CF6", admin: "#3B82F6", member: "#64748B" };

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [setupUser, setSetupUser] = useState("");
  const [setupPass, setSetupPass] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");

  const [data, setData] = useState(null);
  const [view, setView] = useState("dashboard");
  const [selClient, setSelClient] = useState(null);
  const [openProject, setOpenProject] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [dm, setDm] = useState({ subject: "", body: "", sel: [] });
  const [search, setSearch] = useState("");
  const [mob, setMob] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const [schedules, setSchedules] = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);
  
  const [formStep, setFormStep] = useState(1);
  const CLIENT_FORM_STEPS = 5;

  // 新機能用の state
  const [deals, setDeals] = useState([
    { id: "d1", name: "ホテルグランヴィア 秋季派遣", clientId: "c1", clientName: "ホテルグランヴィア京都", amount: 5000000, stage: "商談", probability: 80, assignee: "松永", startDate: "2026-06-01", closeDate: "2026-07-15", notes: "大型案件、契約寸前" },
    { id: "d2", name: "ウェスティン 通年契約", clientId: "c2", clientName: "ウェスティンホテル東京", amount: 10000000, stage: "契約", probability: 100, assignee: "松永", startDate: "2025-04-01", closeDate: "2026-03-31", notes: "年間契約" },
    { id: "d3", name: "新規ホテルチェーン拡大", clientId: "c1", clientName: "ホテルグランヴィア京都", amount: 3000000, stage: "提案", probability: 45, assignee: "田中", startDate: "2026-06-10", closeDate: "2026-08-01", notes: "提案資料作成中" },
    { id: "d4", name: "レストラン求人紹介", clientId: "c1", clientName: "ホテルグランヴィア京都", amount: 800000, stage: "完了", probability: 100, assignee: "佐藤", startDate: "2026-03-01", closeDate: "2026-05-20", notes: "成約済み" },
  ]); // パイプライン案件管理
  const [automationRules, setAutomationRules] = useState([]); // 自動化ルール
  const [aiPredictions, setAiPredictions] = useState({}); // AI予測結果
  const [selectedDeal, setSelectedDeal] = useState(null); // 選択された案件

  useEffect(() => { const c = () => setMob(window.innerWidth < 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    const savedLogs = localStorage.getItem(LOGS_KEY);
    if (savedLogs) setAccessLogs(JSON.parse(savedLogs));
    if (!savedUsers) { setSetupMode(true); }
    else { setUsers(JSON.parse(savedUsers)); }
  }, []);

  const can = (permission) => currentUser && PERMISSIONS[currentUser.role]?.[permission];

  const addLog = (action) => {
    const log = { timestamp: new Date().toISOString(), action, user: currentUser?.username };
    const newLogs = [log, ...accessLogs].slice(0, 100);
    setAccessLogs(newLogs);
    localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
  };

  const fetchMultipleCalendars = useCallback(async (weekOffset = 0) => {
    setScheduleLoading(true);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + weekOffset * 7 - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

    const newSchedules = {};
    for (const user of users) {
      if (!user.googleCalendarId) continue;
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: "You are a calendar assistant. When returning event data, respond ONLY with a JSON array (no markdown, no backticks, no preamble). Each event: {title, start, end, location}. start/end in ISO 8601.",
            messages: [{ role: "user", content: `List all events for ${user.googleCalendarId} from ${startStr} to ${endStr}. Return as JSON array.` }],
          }),
        });
        const data = await res.json();
        const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
        try {
          const cleaned = text.replace(/```json|```/g, "").trim();
          const events = JSON.parse(cleaned);
          newSchedules[user.id] = Array.isArray(events) ? events : [];
        } catch { newSchedules[user.id] = []; }
      } catch { newSchedules[user.id] = []; }
    }
    setSchedules(newSchedules);
    setScheduleLoading(false);
  }, [users]);

  const setupOwner = () => {
    if (!setupUser || setupUser.length < 3) { setLoginError("ユーザー名は3文字以上"); return; }
    if (!setupPass || setupPass.length < 6) { setLoginError("パスワードは6文字以上"); return; }
    if (setupPass !== setupConfirm) { setLoginError("パスワードが一致しません"); return; }
    const owner = { id: uid(), username: setupUser, passwordHash: hashPassword(setupPass), role: "owner", createdAt: new Date().toISOString() };
    const newUsers = [owner];
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    setUsers(newUsers);
    setCurrentUser(owner);
    addLog("初期オーナーアカウント作成");
    setSetupMode(false);
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const decrypted = decrypt(r.value, setupPass);
          if (decrypted) setData(JSON.parse(decrypted));
          else setData(defaultData);
        } else setData(defaultData);
      } catch { setData(defaultData); }
    })();
  };

  const login = () => {
    const user = users.find(u => u.username === loginUser);
    if (!user || user.passwordHash !== hashPassword(loginPass)) { setLoginError("ユーザー名またはパスワードが正しくありません"); return; }
    setCurrentUser(user);
    setLoginError("");
    addLog("ログイン");
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const decrypted = decrypt(r.value, loginPass);
          if (decrypted) setData(JSON.parse(decrypted));
          else setData(defaultData);
        } else setData(defaultData);
      } catch { setData(defaultData); }
    })();
  };

  const logout = () => {
    addLog("ログアウト");
    setCurrentUser(null);
    setData(null);
    setLoginUser("");
    setLoginPass("");
  };

  const save = useCallback(async (d, encKey) => {
    setData(d);
    if (currentUser && encKey) {
      try {
        const encrypted = encrypt(JSON.stringify(d), encKey);
        await window.storage.set(STORAGE_KEY, encrypted);
        addLog("データ保存");
      } catch {}
    }
  }, [currentUser]);

  const updateClient = (cid, fn, encKey) => save({ ...data, clients: data.clients.map(c => c.id === cid ? fn(c) : c) }, encKey);

  if (!currentUser) {
    if (setupMode) {
      return (
        <div style={{ fontFamily: "'Inter','Noto Sans JP',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "linear-gradient(135deg,#0F172A,#1E293B)", padding: 16 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ background: "#FFF", borderRadius: 24, padding: mob ? 24 : 40, width: "100%", maxWidth: 420, boxShadow: "0 25px 60px rgba(0,0,0,.25)" }}>
            <div style={{ width: 60, height: 60, borderRadius: 12, background: "linear-gradient(135deg,#8B5CF6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><Shield size={28} color="#FFF" /></div>
            <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", color: "#0F172A", margin: "0 0 8px" }}>Business Hub</h1>
            <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 28 }}>初回セットアップ — オーナーアカウント作成</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>ユーザー名（3文字以上）</label>
              <input style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" }} type="text" value={setupUser} onChange={e => { setSetupUser(e.target.value); setLoginError(""); }} placeholder="例: owner" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>パスワード（6文字以上）</label>
              <input style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" }} type="password" value={setupPass} onChange={e => { setSetupPass(e.target.value); setLoginError(""); }} placeholder="パスワード" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>パスワード確認</label>
              <input style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" }} type="password" value={setupConfirm} onChange={e => { setSetupConfirm(e.target.value); setLoginError(""); }} placeholder="もう一度入力" />
            </div>
            {loginError && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={16} />{loginError}</div>}
            <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }} onClick={setupOwner}>セットアップ完了</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ fontFamily: "'Inter','Noto Sans JP',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "linear-gradient(135deg,#0F172A,#1E293B)", padding: 16 }}>
        <div style={{ background: "#FFF", borderRadius: 24, padding: mob ? 24 : 40, width: "100%", maxWidth: 380, boxShadow: "0 25px 60px rgba(0,0,0,.25)" }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "linear-gradient(135deg,#3B82F6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><Lock size={28} color="#FFF" /></div>
          <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#0F172A", margin: "0 0 8px" }}>Business Hub</h1>
          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 28 }}>ユーザー名とパスワードでログイン</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>ユーザー名</label>
            <input style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" }} type="text" value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginError(""); }} placeholder="ユーザー名" />
          </div>
          <div style={{ marginBottom: 6, position: "relative" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>パスワード</label>
            <input style={{ width: "100%", padding: "10px 14px", paddingRight: 38, borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" }} type="password" value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginError(""); }} onKeyPress={e => e.key === "Enter" && login()} placeholder="パスワード" />
          </div>
          {loginError && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: "#DC2626" }}>{loginError}</div>}
          <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }} onClick={login}>ログイン</button>
        </div>
      </div>
    );
  }

  if (!data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Inter',sans-serif", color: "#94A3B8" }}>読み込み中...</div>;

  const allProjects = data.clients.flatMap(c => (c.projects || []).map(p => ({ ...p, clientId: c.id, clientName: c.company })));
  const allTasks = allProjects.flatMap(p => p.tasks || []);
  const stats = {
    clients: data.clients.length, contacts: data.clients.reduce((s, c) => s + c.contacts.length, 0),
    projects: allProjects.length, active: allTasks.filter(t => t.status !== "完了").length,
    done: allTasks.filter(t => t.status === "完了").length, dmTotal: data.dmHistory.reduce((s, d) => s + d.recipients, 0),
  };

  const go = k => { setView(k); setSelClient(null); setOpenProject(null); };
  const nav = [
    { key: "dashboard", Icon: LayoutDashboard, label: "トップページ" }, 
    { key: "pipeline", Icon: Target, label: "営業パイプライン" }, 
    { key: "clients", Icon: Building2, label: "クライアント" }, 
    { key: "projects", Icon: FolderKanban, label: "プロジェクト" }, 
    { key: "schedule", Icon: Calendar, label: "スケジュール" },
    { key: "analytics", Icon: BarChart3, label: "分析・レポート" },
    { key: "dm", Icon: Send, label: "DM送信" }
  ];
  if (can("manageUsers")) nav.push({ key: "users", Icon: Users, label: "ユーザー管理" });
  if (can("securitySettings")) nav.push({ key: "automation", Icon: Settings, label: "自動化" });

  const Pill = ({ status }) => { const c = STATUS_CFG[status]; return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.grad, color: c.text }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />{status}</span>; };
  const Btn = ({ children, variant = "primary", onClick, disabled }) => {
    const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1, fontFamily: "inherit" };
    const v = { primary: { background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF" }, ghost: { background: "transparent", color: "#64748B", border: "1px solid #E2E8F0" }, danger: { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }, sm: { background: "transparent", color: "#64748B", border: "1px solid #E2E8F0", padding: "5px 12px", fontSize: 12, borderRadius: 8 } };
    return <button style={{ ...base, ...v[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
  };
  const Field = ({ label, children }) => (<div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>{label}</label>{children}</div>);
  const inputS = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFBFC" };
  const selS = { ...inputS, appearance: "auto" };
  const Modal = ({ title, icon: Ic, onClose, onSave, children, step, maxStep }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#FFF", borderRadius: 20, padding: mob ? 20 : 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ic && <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3B82F6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={18} color="#FFF" /></div>}
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          </div>
          <button style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={onClose}><X size={16} color="#94A3B8" /></button>
        </div>
        
        {step && maxStep && maxStep > 1 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {Array.from({ length: maxStep }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < step ? "linear-gradient(135deg,#3B82F6,#6366F1)" : "#E2E8F0", transition: "all .3s" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>ステップ {step} / {maxStep}</div>
          </div>
        )}
        
        {children}
        
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, fontWeight: 600, background: "transparent", color: "#64748B", cursor: "pointer", fontFamily: "inherit" }} onClick={onClose}>キャンセル</button>
          {step && maxStep && step < maxStep ? (
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF", cursor: "pointer", fontFamily: "inherit" }} onClick={onSave}>次へ</button>
          ) : (
            onSave && <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF", cursor: "pointer", fontFamily: "inherit" }} onClick={onSave}>保存</button>
          )}
        </div>
      </div>
    </div>
  );
  const ProgressBar = ({ tasks, height = 8 }) => { const total = tasks.length; const d = tasks.filter(t => t.status === "完了").length; return (<div style={{ display: "flex", gap: 2, height, borderRadius: height, overflow: "hidden", background: "#F1F5F9" }}>{total > 0 && <div style={{ width: `${(d / total) * 100}%`, background: "linear-gradient(90deg,#22C55E,#10B981)", borderRadius: height }} />}</div>); };
  const StatCard = ({ icon: Ic, label, value, color, accent }) => (
    <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? "16px" : "20px 24px", flex: 1, minWidth: mob ? "calc(50% - 8px)" : 140, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: .08 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={16} color={color} /></div><span style={{ fontSize: 12, color: "#94A3B8" }}>{label}</span></div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  const handleBusinessCardCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const base64 = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.readAsDataURL(file); });
      setOcrPreview(`data:${file.type};base64,${base64}`);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "Extract info from business card. Respond ONLY with JSON: {\"name\": \"氏名\", \"position\": \"役職\", \"email\": \"メール\", \"phone\": \"電話\"}.",
          messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } }, { type: "text", text: "名刺情報をJSON形式で返してください。" }] }]
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(prev => ({ ...prev, name: parsed.name || "", position: parsed.position || "", email: parsed.email || "", phone: parsed.phone || "" }));
      addLog("名刺をOCRで読み取り");
    } catch { alert("読み取りに失敗しました。"); }
    setOcrLoading(false);
  };

  const renderDash = () => (
    <div>
      <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, marginBottom: 4, color: "#0F172A" }}>トップページ</h1>
      <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28 }}>ようこそ、{currentUser.username}さん ({ROLE_LABELS[currentUser.role]})</p>
      
      {/* 📊 KPI ダッシュボード */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>📊 今月の営業実績</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <StatCard icon={TrendingUp} label="当月売上" value={`¥${(data.clients.reduce((sum, c) => sum + (c.contractAmount ? parseInt(c.contractAmount.replace(/万円|万|円/g, "")) * 10000 : 0), 0)).toLocaleString()}`} color="#10B981" accent="#10B981" />
          <StatCard icon={Target} label="商談中案件" value={deals.filter(d => d.stage === "商談").length} color="#3B82F6" accent="#3B82F6" />
          <StatCard icon={CheckCircle2} label="当月成約数" value={deals.filter(d => d.stage === "完了" && new Date(d.closeDate).getMonth() === new Date().getMonth()).length} color="#8B5CF6" accent="#8B5CF6" />
          <StatCard icon={Percent} label="平均成約確度" value={`${Math.round(deals.filter(d => d.probability).reduce((sum, d) => sum + d.probability, 0) / Math.max(deals.length, 1))}%`} color="#F59E0B" accent="#F59E0B" />
        </div>
      </div>

      {/* クライアント統計 */}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>クライアント状況</h3>
          {[
            { label: "リード", count: data.clients.filter(c => c.status === "リード").length, color: "#6366F1" },
            { label: "商談中", count: data.clients.filter(c => c.status === "商談中").length, color: "#F97316" },
            { label: "契約中", count: data.clients.filter(c => c.status === "契約中").length, color: "#10B981" },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "#64748B", fontSize: 13 }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
            </div>
          ))}
        </div>
        
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>ステージ別案件</h3>
          {["提案", "商談", "契約", "完了"].map((stage, i) => {
            const count = deals.filter(d => d.stage === stage).length;
            const total = deals.length || 1;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: "#1E293B" }}>{stage}</span>
                  <span style={{ color: "#64748B" }}>{count}件</span>
                </div>
                <div style={{ background: "#F1F5F9", height: 6, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(count / total) * 100}%`, height: "100%", background: ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"][i] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最新クライアント */}
      <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>最新のクライアント</h3>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
          {data.clients.slice(0, 4).map(c => (
            <div key={c.id} style={{ padding: 12, background: "#FAFBFC", borderRadius: 10, border: "1px solid #F1F5F9" }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.company}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{c.industry}</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>取引額: {c.contractAmount || "未設定"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPipeline = () => (
    <div>
      <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, marginBottom: 4, color: "#0F172A" }}>営業パイプライン</h1>
      <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>営業案件をステージ別で管理</p>
      
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: 14 }}>
        {["提案", "商談", "契約", "完了"].map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
          return (
            <div key={stage} style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, minHeight: 400 }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "#0F172A" }}>{stage}</h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {stageDeals.length}件 / ¥{stageAmount.toLocaleString()}
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stageDeals.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#CBD5E1", fontSize: 12 }}>案件なし</div>
                ) : (
                  stageDeals.map(deal => (
                    <div 
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      style={{
                        background: "#FFF",
                        padding: 12,
                        borderRadius: 10,
                        border: `2px solid ${deal.probability > 70 ? "#22C55E" : deal.probability > 40 ? "#F59E0B" : "#EF4444"}`,
                        cursor: "pointer",
                        transition: "all .2s"
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#0F172A" }}>{deal.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>¥{deal.amount.toLocaleString()}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
                        <span style={{ color: "#94A3B8" }}>{deal.assignee}</span>
                        <span style={{ fontWeight: 700, color: deal.probability > 70 ? "#22C55E" : deal.probability > 40 ? "#F59E0B" : "#EF4444" }}>
                          {deal.probability}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 案件詳細モーダル */}
      {selectedDeal && (
        <Modal 
          title="案件詳細" 
          icon={Target} 
          onClose={() => setSelectedDeal(null)}
        >
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#0F172A" }}>{selectedDeal.name}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>契約金額</label><div style={{ fontSize: 16, fontWeight: 700, color: "#3B82F6" }}>¥{selectedDeal.amount.toLocaleString()}</div></div>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>成約確度</label><div style={{ fontSize: 16, fontWeight: 700, color: selectedDeal.probability > 70 ? "#22C55E" : "#F59E0B" }}>{selectedDeal.probability}%</div></div>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>ステージ</label><div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{selectedDeal.stage}</div></div>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>クローズ予定日</label><div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{selectedDeal.closeDate}</div></div>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>担当者</label><div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{selectedDeal.assignee}</div></div>
              <div><label style={{ fontSize: 11, color: "#94A3B8" }}>クライアント</label><div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{selectedDeal.clientName}</div></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, color: "#94A3B8" }}>メモ</label>
              <div style={{ fontSize: 13, color: "#1E293B", padding: 10, background: "#F8FAFC", borderRadius: 8, marginTop: 4 }}>{selectedDeal.notes || "—"}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, marginBottom: 4, color: "#0F172A" }}>分析・レポート</h1>
      <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>営業実績の分析とレポート生成</p>
      
      <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🎯 営業実績サマリー</h3>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 16, background: "linear-gradient(135deg,#EFF6FF,#E0E7FF)", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#1E40AF", fontWeight: 600, marginBottom: 8 }}>総取引額</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#3B82F6" }}>¥{deals.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</div>
          </div>
          <div style={{ padding: 16, background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginBottom: 8 }}>成約案件数</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#22C55E" }}>{deals.filter(d => d.stage === "完了").length}件</div>
          </div>
        </div>

        <div style={{ padding: 16, background: "#FAFBFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>📋 詳細レポートはプロフェッショナルプラン以上で利用可能</p>
          <button style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            📥 レポートをダウンロード（近日公開）
          </button>
        </div>
      </div>
    </div>
  );

  const renderClients = () => {
    if (selClient) {
      const cl = data.clients.find(c => c.id === selClient);
      if (!cl) { setSelClient(null); return null; }
      const projects = cl.projects || [];
      return (
        <div>
          <button onClick={() => setSelClient(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: "inherit" }}><ArrowLeft size={16} />一覧に戻る</button>
          <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, marginBottom: 8, color: "#0F172A" }}>{cl.company}</h1>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}><Pill status={cl.status} /><span style={{ padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#F1F5F9", color: "#475569" }}>{cl.industry}</span></div>

          <div style={{ display: "flex", gap: 16, flexDirection: mob ? "column" : "row", marginBottom: 16 }}>
            <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 20, flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>基本情報</h3>
              {[[MapPin, "住所", cl.address], [Phone, "電話", cl.phone]].map(([Ic, l, v]) => (<div key={l} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, marginBottom: 8 }}><Ic size={14} color="#CBD5E1" style={{ marginTop: 2 }} /><div><div style={{ color: "#94A3B8", fontSize: 11 }}>{l}</div><div style={{ color: "#1E293B", fontWeight: 500 }}>{v || "—"}</div></div></div>))}
            </div>

            {can("manageContacts") && (
              <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 20, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>名刺</h3><Btn variant="sm" onClick={() => { setForm({ clientId: cl.id, name: "", position: "", email: "", phone: "" }); setOcrPreview(null); setModal("addContact"); }}><Plus size={12} />追加</Btn></div>
                {cl.contacts.map(ct => (<div key={ct.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}><div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 13, fontWeight: 700 }}>{ct.name[0]}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ct.name}</div><div style={{ fontSize: 11, color: "#8B5CF6" }}>{ct.position}</div></div><button onClick={() => { addLog(`名刺削除: ${ct.name}`); updateClient(cl.id, c => ({ ...c, contacts: c.contacts.filter(x => x.id !== ct.id) }), loginPass); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={13} color="#CBD5E1" /></button></div>))}
              </div>
            )}
          </div>

          {can("manageProjects") && (
            <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>プロジェクト</h3><Btn onClick={() => { setForm({ clientId: cl.id, name: "" }); setModal("addProject"); }}><Plus size={14} />新規</Btn></div>
              {projects.map(p => (
                <div key={p.id} style={{ border: "1.5px solid #F1F5F9", borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
                  <div onClick={() => setOpenProject(openProject === p.id ? null : p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer", background: "#FAFBFC" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}><FolderKanban size={16} color="#94A3B8" /></div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{p.tasks.filter(t => t.status === "完了").length}/{p.tasks.length} 完了</div></div>
                    {openProject === p.id ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#CBD5E1" />}
                  </div>
                  {openProject === p.id && (
                    <div style={{ padding: "16px 18px", borderTop: "1px solid #F1F5F9", background: "#FBFCFE" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                        {can("manageTasks") && (
                          <>
                            <Btn variant="sm" onClick={() => { setForm({ clientId: cl.id, projectId: p.id, title: "", status: "未着手", assignee: "", due: "", priority: "中" }); setModal("addTask"); }}><Plus size={12} />タスク</Btn>
                            <Btn variant="danger" style={{ padding: "5px 10px" }} onClick={() => { if (confirm("削除しますか？")) { addLog(`プロジェクト削除: ${p.name}`); updateClient(cl.id, c => ({ ...c, projects: c.projects.filter(x => x.id !== p.id) }), loginPass); } }}><Trash size={12} /></Btn>
                          </>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                        {Object.entries(TS).map(([status, st]) => { const tasks = p.tasks.filter(t => t.status === status); return (
                          <div key={status} style={{ background: st.bg, borderRadius: 12, padding: 12, minHeight: 100, border: `1px solid ${st.border}` }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 13, fontWeight: 700, color: st.text }}>{status}</span><span style={{ marginLeft: "auto", background: "rgba(255,255,255,.7)", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tasks.length}</span></div>
                            {tasks.map(t => (
                              <div key={t.id} style={{ background: "#FFF", borderRadius: 8, padding: 10, marginBottom: 6, border: `1px solid ${st.border}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontWeight: 600, fontSize: 12 }}>{t.title}</div>{can("manageTasks") && <button onClick={() => { addLog(`タスク削除: ${t.title}`); updateClient(cl.id, c => ({ ...c, projects: c.projects.map(pr => pr.id !== p.id ? pr : { ...pr, tasks: pr.tasks.filter(tk => tk.id !== t.id) }) }), loginPass); }} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={10} color="#CBD5E1" /></button>}</div>
                              </div>
                            ))}
                          </div>
                        ); })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const filtered = data.clients.filter(c => !search || c.company.includes(search));
    return (
      <div>
        <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: "#0F172A" }}>クライアント管理</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>会社単位でクライアント情報を管理</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1 }}><Search size={16} color="#CBD5E1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} /><input style={{ ...inputS, paddingLeft: 38 }} placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          {can("manageClients") && <Btn onClick={() => { setForm({ company: "", industry: "ホテル", status: "リード", address: "", phone: "", notes: "" }); setModal("addClient"); }}><Plus size={14} />新規</Btn>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14 }}>
          {filtered.map(c => { const pjs = c.projects || []; const pjT = pjs.flatMap(p => p.tasks); const d = pjT.filter(t => t.status === "完了").length; return (
            <div key={c.id} onClick={() => setSelClient(c.id)} style={{ background: "#FFF", borderRadius: 16, border: "1.5px solid #F1F5F9", padding: mob ? 16 : 20, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{c.company}</div><Pill status={c.status} /></div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{c.industry} — {pjs.length} プロジェクト</div>
              <ProgressBar tasks={pjT} height={5} />
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>{d}/{pjT.length} 完了</div>
            </div>
          ); })}
        </div>
      </div>
    );
  };

  const renderDM = () => (
    can("sendDM") ? (
      <div>
        <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: "#0F172A" }}>DM一斉送信</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>クライアント別に選択して配信</p>
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 24 }}>
          <Field label="件名"><input style={inputS} value={dm.subject} onChange={e => setDm({ ...dm, subject: e.target.value })} placeholder="件名" /></Field>
          <Field label="本文"><textarea style={{ ...inputS, minHeight: 120 }} value={dm.body} onChange={e => setDm({ ...dm, body: e.target.value })} placeholder="本文" /></Field>
          <Field label="送信先">
            <div style={{ maxHeight: 150, overflow: "auto", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: 6 }}>
              {data.clients.map(c => (<label key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", cursor: "pointer", borderRadius: 10, background: dm.sel.includes(c.id) ? "#EFF6FF" : "transparent" }}><input type="checkbox" checked={dm.sel.includes(c.id)} onChange={e => { const s = e.target.checked ? [...dm.sel, c.id] : dm.sel.filter(x => x !== c.id); setDm({ ...dm, sel: s }); }} style={{ accentColor: "#3B82F6" }} /><span style={{ fontWeight: 600 }}>{c.company}</span></label>))}
            </div>
          </Field>
          <Btn disabled={!dm.subject || dm.sel.length === 0} onClick={() => { const rc = dm.sel.reduce((s, cid) => s + (data.clients.find(c => c.id === cid)?.contacts.length || 0), 0); save({ ...data, dmHistory: [{ id: uid(), subject: dm.subject, sentAt: new Date().toISOString().split("T")[0], recipients: rc, opened: 0 }, ...data.dmHistory] }, loginPass); addLog(`DM送信: ${dm.subject}`); setDm({ subject: "", body: "", sel: [] }); setModal("dmSent"); }}><Send size={14} />送信</Btn>
        </div>
      </div>
    ) : (
      <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
        <AlertCircle size={40} style={{ margin: "0 auto 16px", display: "block", opacity: .5 }} />
        <p style={{ fontSize: 16, fontWeight: 600 }}>この機能へのアクセス権限がありません</p>
        <p style={{ fontSize: 13 }}>ユーザー管理者に確認してください</p>
      </div>
    )
  );

  const renderSchedules = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + scheduleWeekOffset * 7 - weekStart.getDay() + 1);
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
    const dayNames = ["月", "火", "水", "木", "金", "土", "日"];
    const isToday = (day) => day.toISOString().split("T")[0] === now.toISOString().split("T")[0];
    const weekLabel = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 〜 ${days[6].getMonth() + 1}月${days[6].getDate()}日`;
    const eventColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1"];
    const getEventColor = (idx) => eventColors[idx % eventColors.length];
    const usersWithCals = users.filter(u => u.googleCalendarId);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: "#0F172A" }}>スケジュール管理</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => fetchMultipleCalendars(scheduleWeekOffset)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#FFF", cursor: "pointer", fontFamily: "inherit" }}>🔄 更新</button>
            <button onClick={() => setScheduleWeekOffset(scheduleWeekOffset - 1)} style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>◀</button>
            <button onClick={() => setScheduleWeekOffset(scheduleWeekOffset + 1)} style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>▶</button>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>全メンバーのスケジュール（{usersWithCals.length}名）</p>
        <div style={{ textAlign: "center", marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{weekLabel}</div>{scheduleWeekOffset !== 0 && <button onClick={() => setScheduleWeekOffset(0)} style={{ background: "none", border: "none", color: "#3B82F6", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginTop: 4 }}>今週に戻る</button>}</div>
        {scheduleLoading ? <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>📅 読み込み中...</div> : usersWithCals.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}><AlertCircle size={40} style={{ margin: "0 auto 16px", display: "block", opacity: .5 }} /><p style={{ fontSize: 16, fontWeight: 600 }}>Google カレンダーを連携したユーザーがいません</p><p style={{ fontSize: 13 }}>ユーザー管理でカレンダーIDを設定してください</p></div> : (
          <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `150px ${Array(7).fill(1).map(() => "1fr").join(" ")}`, minWidth: "100%", borderBottom: "2px solid #E2E8F0" }}>
              <div style={{ padding: 12, fontWeight: 700, fontSize: 12, textAlign: "center", background: "#F8FAFC" }}>ユーザー</div>
              {days.map((d, i) => (<div key={i} style={{ padding: 12, textAlign: "center", borderLeft: "1px solid #F8FAFC", background: isToday(d) ? "#EFF6FF" : "#FFF" }}><div style={{ fontSize: 11, fontWeight: 600, color: i >= 5 ? "#3B82F6" : "#94A3B8" }}>{dayNames[i]}</div><div style={{ fontSize: 16, fontWeight: 700, color: isToday(d) ? "#3B82F6" : "#1E293B", marginTop: 2 }}>{d.getDate()}</div></div>))}
            </div>
            {usersWithCals.map((user, userIdx) => { const userSchedules = schedules[user.id] || []; return (
              <div key={user.id} style={{ display: "grid", gridTemplateColumns: `150px ${Array(7).fill(1).map(() => "1fr").join(" ")}`, minWidth: "100%", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ padding: 12, fontSize: 12, fontWeight: 600, color: "#475569", background: "#FAFBFC", borderRight: "1px solid #F8FAFC" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: getEventColor(userIdx), flexShrink: 0 }} />{user.username}</div><div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{ROLE_LABELS[user.role]}</div></div>
                {days.map((d, dayIdx) => { const dayStr = d.toISOString().split("T")[0]; const dayEvents = userSchedules.filter(e => (e.start || "").split("T")[0] === dayStr); return (
                  <div key={dayIdx} style={{ padding: 8, borderLeft: "1px solid #F8FAFC", background: isToday(d) ? "#FAFCFF" : "transparent", minHeight: 80 }}>
                    {dayEvents.map((e, ei) => (<div key={ei} style={{ padding: 4, borderRadius: 6, background: getEventColor(userIdx) + "18", borderLeft: `3px solid ${getEventColor(userIdx)}`, marginBottom: 4, cursor: "pointer" }}><div style={{ fontSize: 10, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div><div style={{ fontSize: 9, color: "#64748B" }}>{(e.start || "").includes("T") ? (e.start || "").split("T")[1].substring(0, 5) : ""}</div></div>))}
                  </div>
                ); })}
              </div>
            ); })}
          </div>
        )}
      </div>
    );
  };

  const renderProjects = () => (
    can("manageProjects") ? (
      <div>
        <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: "#0F172A" }}>プロジェクト・タスク管理</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28 }}>すべてのプロジェクトとタスクを一元管理</p>
        
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
          {allProjects.map(p => {
            const cl = data.clients.find(c => c.id === p.clientId);
            const d = p.tasks.filter(t => t.status === "完了").length;
            const pct = p.tasks.length > 0 ? Math.round((d / p.tasks.length) * 100) : 0;
            return (
              <div key={p.id} style={{ background: "#FFF", borderRadius: 16, border: "1.5px solid #F1F5F9", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#3B82F6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 18, flexShrink: 0 }}>📁</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{cl?.company}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {Object.entries(TS).map(([status, st]) => { const tasks = p.tasks.filter(t => t.status === status); return (
                    <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: st.bg, color: st.text }}>
                      {status} {tasks.length}
                    </span>
                  ); })}
                </div>
                
                <ProgressBar tasks={p.tasks} height={6} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#64748B" }}>
                  <span>{p.tasks.length} タスク</span>
                  <span style={{ fontWeight: 700, color: pct === 100 ? "#10B981" : "#3B82F6" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {allProjects.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
            <FolderKanban size={40} style={{ margin: "0 auto 16px", display: "block", opacity: .5 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>プロジェクトがまだありません</p>
            <p style={{ fontSize: 13 }}>クライアント管理からプロジェクトを作成してください</p>
          </div>
        )}
      </div>
    ) : (
      <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
        <AlertCircle size={40} style={{ margin: "0 auto 16px", display: "block", opacity: .5 }} />
        <p style={{ fontSize: 16, fontWeight: 600 }}>アクセス権限がありません</p>
      </div>
    )
  );

  const renderUsers = () => (
    can("manageUsers") ? (
      <div>
        <h1 style={{ fontSize: mob ? 22 : 28, fontWeight: 800, color: "#0F172A" }}>ユーザー管理</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28 }}>チームメンバーの権限設定</p>
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>登録済みユーザー</h3><Btn onClick={() => { setForm({ username: "", password: "", role: "member" }); setModal("addUser"); }}><Plus size={14} />ユーザー追加</Btn></div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
            {users.map(u => (
              <div key={u.id} style={{ padding: 16, borderRadius: 12, border: "1px solid #F1F5F9", background: u.id === currentUser.id ? "#EFF6FF" : "#FAFBFC" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</div>
                    <span style={{ display: "inline-block", marginTop: 6, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: ROLE_COLORS[u.role] + "18", color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                    {u.googleCalendarId && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>📅 {u.googleCalendarId}</div>}
                  </div>
                  {u.id === currentUser.id ? <span style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600 }}>（現在のユーザー）</span> : <button onClick={() => { if (confirm("このユーザーを削除しますか？")) { const newUsers = users.filter(x => x.id !== u.id); setUsers(newUsers); localStorage.setItem(USERS_KEY, JSON.stringify(newUsers)); addLog(`ユーザー削除: ${u.username}`); } }} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, color: "#DC2626", padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>削除</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 権限表 */}
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #F1F5F9", padding: mob ? 16 : 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>権限一覧</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                  <th style={{ textAlign: "left", padding: 10, fontWeight: 700, color: "#64748B" }}>機能</th>
                  <th style={{ textAlign: "center", padding: 10, fontWeight: 700, color: ROLE_COLORS.owner }}>オーナー</th>
                  <th style={{ textAlign: "center", padding: 10, fontWeight: 700, color: ROLE_COLORS.admin }}>管理者</th>
                  <th style={{ textAlign: "center", padding: 10, fontWeight: 700, color: ROLE_COLORS.member }}>メンバー</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "ダッシュボード表示", key: "viewDashboard" },
                  { name: "クライアント管理", key: "manageClients" },
                  { name: "プロジェクト管理", key: "manageProjects" },
                  { name: "名刺管理", key: "manageContacts" },
                  { name: "タスク管理", key: "manageTasks" },
                  { name: "DM送信", key: "sendDM" },
                  { name: "アクセスログ", key: "viewLogs" },
                  { name: "ユーザー管理", key: "manageUsers" },
                  { name: "セキュリティ設定", key: "securitySettings" },
                ].map(item => (
                  <tr key={item.key} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 10, color: "#1E293B" }}>{item.name}</td>
                    <td style={{ textAlign: "center", padding: 10 }}>{PERMISSIONS.owner[item.key] ? "✓" : "—"}</td>
                    <td style={{ textAlign: "center", padding: 10 }}>{PERMISSIONS.admin[item.key] ? "✓" : "—"}</td>
                    <td style={{ textAlign: "center", padding: 10 }}>{PERMISSIONS.member[item.key] ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ) : (
      <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
        <ShieldIcon size={40} style={{ margin: "0 auto 16px", display: "block", opacity: .5 }} />
        <p style={{ fontSize: 16, fontWeight: 600 }}>アクセス権限がありません</p>
      </div>
    )
  );

  return (
    <div style={{ fontFamily: "'Inter','Noto Sans JP',system-ui,sans-serif", display: "flex", flexDirection: mob ? "column" : "row", height: "100vh", background: "#F4F6FA", color: "#1E293B", overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <nav style={{ width: mob ? "100%" : 320, background: "linear-gradient(180deg,#0F172A,#1E293B)", display: "flex", flexDirection: mob ? "row" : "column", flexShrink: 0, ...(mob ? { order: 1, borderTop: "1px solid rgba(255,255,255,.06)" } : {}) }}>
        {!mob && <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#3B82F6", marginBottom: 4 }}>DAIEI SERVICE</div><div style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9" }}>Business Hub</div></div>}
        <div style={{ display: "flex", flexDirection: mob ? "row" : "column", flex: 1 }}>
          {nav.map(({ key, Icon, label }) => { const active = view === key; return (
            <div key={key} onClick={() => go(key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: mob ? "10px 0" : "14px 20px", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#F1F5F9" : "#94A3B8", background: active ? "rgba(59,130,246,.15)" : "transparent", flex: mob ? 1 : "none", justifyContent: mob ? "center" : "flex-start", flexDirection: mob ? "column" : "row", borderLeft: !mob && active ? "3px solid #3B82F6" : !mob ? "3px solid transparent" : "none", transition: "all .15s" }}>
              <Icon size={18} /><span style={{ fontSize: 12 }}>{label}</span>
            </div>
          ); })}
        </div>
        <div style={{ padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 6 }}>
          {can("viewLogs") && <button onClick={() => setShowLogs(!showLogs)} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#CBD5E1", padding: "8px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}><History size={14} />ログ</button>}
          <button onClick={logout} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#CBD5E1", padding: "8px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}><LogOut size={14} />ログアウト</button>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: "auto", padding: mob ? 16 : 28, background: "#FFF" }}>
        {view === "dashboard" && renderDash()}
        {view === "pipeline" && renderPipeline()}
        {view === "clients" && renderClients()}
        {view === "projects" && renderProjects()}
        {view === "schedule" && renderSchedules()}
        {view === "analytics" && renderAnalytics()}
        {view === "dm" && renderDM()}
        {view === "users" && renderUsers()}
      </main>

      {showLogs && (
        <div style={{ position: "fixed", top: mob ? 0 : 36, right: mob ? 0 : 36, width: mob ? "100%" : 320, maxHeight: mob ? "50vh" : "calc(100vh - 72px)", background: "#FFF", borderRadius: mob ? 0 : 16, border: "1px solid #F1F5F9", boxShadow: "0 25px 60px rgba(0,0,0,.15)", display: "flex", flexDirection: "column", zIndex: 500 }}>
          <div style={{ padding: 16, borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>アクセスログ</h3>
            <button onClick={() => setShowLogs(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color="#94A3B8" /></button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
            {accessLogs.length === 0 ? <p style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", padding: 20 }}>ログなし</p> :
              accessLogs.map((log, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #F8FAFC", fontSize: 11 }}>
                  <div style={{ color: "#64748B", fontWeight: 500 }}>{log.action}</div>
                  <div style={{ color: "#CBD5E1", fontSize: 10, marginTop: 2 }}>{log.user} | {new Date(log.timestamp).toLocaleString("ja-JP")}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {modal === "addClient" && can("manageClients") && <Modal 
        title="クライアント新規登録" 
        icon={Building2} 
        onClose={() => { setModal(null); setFormStep(1); }} 
        step={formStep} 
        maxStep={CLIENT_FORM_STEPS}
        onSave={() => { 
          if (formStep < CLIENT_FORM_STEPS) {
            setFormStep(formStep + 1);
          } else {
            addLog(`クライアント追加: ${form.company}`);
            save({ 
              ...data, 
              clients: [...data.clients, { id: uid(), ...form, contacts: [], projects: [] }] 
            }, loginPass);
            setModal(null);
            setFormStep(1);
          }
        }}
      >
        
        {/* ステップ1: 取引先基本情報 */}
        {formStep === 1 && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>① 取引先基本情報</h4>
            <Field label="会社名 *"><input style={inputS} value={form.company || ""} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="例: ホテルグランヴィア京都" /></Field>
            <Field label="所在地"><input style={inputS} value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="例: 京都府京都市下京区..." /></Field>
            <Field label="事業内容"><input style={inputS} value={form.businessContent || ""} onChange={e => setForm({ ...form, businessContent: e.target.value })} placeholder="例: 宿泊施設運営" /></Field>
            <Field label="企業規模"><select style={selS} value={form.companyScale || ""} onChange={e => setForm({ ...form, companyScale: e.target.value })}><option value="">選択してください</option><option>大規模企業</option><option>中規模企業</option><option>小規模企業</option><option>個人事業主</option></select></Field>
            <Field label="公式サイト"><input style={inputS} value={form.website || ""} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" /></Field>
            <Field label="業種"><select style={selS} value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>{INDUSTRIES.map((ind, i) => <option key={i}>{ind}</option>)}</select></Field>
            <Field label="ステータス"><select style={selS} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
        )}
        
        {/* ステップ2: 担当者情報 */}
        {formStep === 2 && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>② 担当者情報</h4>
            <Field label="担当者名"><input style={inputS} value={form.primaryContactName || ""} onChange={e => setForm({ ...form, primaryContactName: e.target.value })} placeholder="例: 田中 太郎" /></Field>
            <Field label="部署・役職"><input style={inputS} value={form.primaryContactDept || ""} onChange={e => setForm({ ...form, primaryContactDept: e.target.value })} placeholder="例: 人事部長" /></Field>
            <Field label="電話番号"><input style={inputS} value={form.primaryContactPhone || ""} onChange={e => setForm({ ...form, primaryContactPhone: e.target.value })} placeholder="例: 075-344-8888" /></Field>
            <Field label="メールアドレス"><input style={inputS} type="email" value={form.primaryContactEmail || ""} onChange={e => setForm({ ...form, primaryContactEmail: e.target.value })} placeholder="例: tanaka@example.com" /></Field>
            <Field label="決裁者（キーパーソン）"><input style={inputS} value={form.keyPerson || ""} onChange={e => setForm({ ...form, keyPerson: e.target.value })} placeholder="例: 山田 部長" /></Field>
          </div>
        )}
        
        {/* ステップ3: 取引内容 */}
        {formStep === 3 && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>③ 取引内容</h4>
            <Field label="何を提供する会社か"><input style={inputS} value={form.serviceProvided || ""} onChange={e => setForm({ ...form, serviceProvided: e.target.value })} placeholder="例: 人材派遣・採用支援" /></Field>
            <Field label="どのサービス・商品を利用するか"><input style={inputS} value={form.servicesToUse || ""} onChange={e => setForm({ ...form, servicesToUse: e.target.value })} placeholder="例: ホテルスタッフの一時派遣" /></Field>
            <Field label="契約開始日"><input style={inputS} type="date" value={form.contractStartDate || ""} onChange={e => setForm({ ...form, contractStartDate: e.target.value })} /></Field>
            <Field label="契約期間"><input style={inputS} value={form.contractPeriod || ""} onChange={e => setForm({ ...form, contractPeriod: e.target.value })} placeholder="例: 1年" /></Field>
            <Field label="契約金額"><input style={inputS} value={form.contractAmount || ""} onChange={e => setForm({ ...form, contractAmount: e.target.value })} placeholder="例: 500万円" /></Field>
          </div>
        )}
        
        {/* ステップ4: 連絡・運用ルール */}
        {formStep === 4 && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>④ 連絡・運用ルール</h4>
            <Field label="問い合わせ窓口"><input style={inputS} value={form.contactPoint || ""} onChange={e => setForm({ ...form, contactPoint: e.target.value })} placeholder="例: 田中 太郎" /></Field>
            <Field label="緊急時連絡先"><input style={inputS} value={form.emergencyContact || ""} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="090-XXXX-XXXX" /></Field>
            <Field label="定例会の有無"><input style={inputS} value={form.regularMeeting || ""} onChange={e => setForm({ ...form, regularMeeting: e.target.value })} placeholder="例: 月1回（第1火曜日14:00）" /></Field>
            <Field label="コミュニケーション方法"><input style={inputS} value={form.communicationMethod || ""} onChange={e => setForm({ ...form, communicationMethod: e.target.value })} placeholder="例: メール、Slack、Teams" /></Field>
          </div>
        )}
        
        {/* ステップ5: 注意事項 */}
        {formStep === 5 && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>⑤ 注意事項</h4>
            <Field label="特有のルール"><textarea style={{ ...inputS, minHeight: 80, resize: "vertical" }} value={form.specialRules || ""} onChange={e => setForm({ ...form, specialRules: e.target.value })} placeholder="例: セキュリティ対応が厳格" /></Field>
            <Field label="納品・請求ルール"><textarea style={{ ...inputS, minHeight: 80, resize: "vertical" }} value={form.billingRules || ""} onChange={e => setForm({ ...form, billingRules: e.target.value })} placeholder="例: 月末締め・翌月15日請求" /></Field>
            <Field label="その他メモ"><textarea style={{ ...inputS, minHeight: 60, resize: "vertical" }} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="その他注記事項" /></Field>
          </div>
        )}
      </Modal>}

      {modal === "addContact" && can("manageContacts") && <Modal title="名刺登録" icon={CreditCard} onClose={() => { setModal(null); setOcrPreview(null); }} onSave={() => { const { clientId, ...rest } = form; addLog(`名刺追加: ${rest.name}`); updateClient(clientId, c => ({ ...c, contacts: [...c.contacts, { id: uid(), ...rest }] }), loginPass); setModal(null); setOcrPreview(null); }}>
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, border: "2px dashed #BFDBFE", background: "#F8FBFF" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>名刺スキャン（AI自動読み取り）</div>
          {ocrPreview && <img src={ocrPreview} alt="名刺" style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 6, marginBottom: 8 }} />}
          {ocrLoading ? <div style={{ textAlign: "center", padding: 10, color: "#6366F1" }}>読み取り中...</div> :
            <div style={{ display: "flex", gap: 6 }}>
              <label style={{ flex: 1, padding: "6px", textAlign: "center", borderRadius: 6, background: "#3B82F6", color: "#FFF", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>撮影<input type="file" accept="image/*" capture="environment" onChange={handleBusinessCardCapture} style={{ display: "none" }} /></label>
              <label style={{ flex: 1, padding: "6px", textAlign: "center", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>選択<input type="file" accept="image/*" onChange={handleBusinessCardCapture} style={{ display: "none" }} /></label>
            </div>}
        </div>
        <Field label="氏名"><input style={inputS} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="役職"><input style={inputS} value={form.position || ""} onChange={e => setForm({ ...form, position: e.target.value })} /></Field>
        <Field label="メール"><input style={inputS} value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="電話"><input style={inputS} value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
      </Modal>}

      {modal === "addProject" && can("manageProjects") && <Modal title="プロジェクト新規作成" icon={FolderKanban} onClose={() => setModal(null)} onSave={() => { addLog(`プロジェクト追加: ${form.name}`); updateClient(form.clientId, c => ({ ...c, projects: [...(c.projects || []), { id: uid(), name: form.name, tasks: [] }] }), loginPass); setModal(null); }}>
        <Field label="プロジェクト名"><input style={inputS} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
      </Modal>}

      {modal === "addTask" && can("manageTasks") && <Modal title="タスク追加" icon={CheckCircle2} onClose={() => setModal(null)} onSave={() => { const { clientId, projectId, ...rest } = form; addLog(`タスク追加: ${rest.title}`); updateClient(clientId, c => ({ ...c, projects: c.projects.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, { id: uid(), ...rest }] } : p) }), loginPass); setModal(null); }}>
        <Field label="タスク名"><input style={inputS} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="ステータス"><select style={selS} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(TS).map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="優先度"><select style={selS} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>高</option><option>中</option><option>低</option></select></Field>
      </Modal>}

      {modal === "addUser" && can("manageUsers") && <Modal title="ユーザー追加" icon={UserPlus} onClose={() => setModal(null)} onSave={() => { const nu = { id: uid(), username: form.username, passwordHash: hashPassword(form.password), role: form.role, googleCalendarId: form.googleCalendarId || "", createdAt: new Date().toISOString() }; const newUsers = [...users, nu]; setUsers(newUsers); localStorage.setItem(USERS_KEY, JSON.stringify(newUsers)); addLog(`ユーザー追加: ${form.username} (${ROLE_LABELS[form.role]})`); setModal(null); }}>
        <Field label="ユーザー名"><input style={inputS} value={form.username || ""} onChange={e => setForm({ ...form, username: e.target.value })} /></Field>
        <Field label="パスワード"><input style={inputS} type="password" value={form.password || ""} onChange={e => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="役割"><select style={selS} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="member">メンバー</option><option value="admin">管理者</option><option value="owner">オーナー</option></select></Field>
        <Field label="Google カレンダーID（メールアドレス）"><input style={inputS} type="email" value={form.googleCalendarId || ""} onChange={e => setForm({ ...form, googleCalendarId: e.target.value })} placeholder="例: user@gmail.com" /></Field>
      </Modal>}

      {modal === "dmSent" && <Modal title="送信完了" icon={CheckCircle2} onClose={() => setModal(null)}>
        <div style={{ textAlign: "center", padding: "20px 0" }}><CheckCircle2 size={40} color="#10B981" style={{ margin: "0 auto 12px", display: "block" }} /><p style={{ fontSize: 16, fontWeight: 700, color: "#10B981", margin: 0 }}>DM送信完了</p></div>
      </Modal>}
    </div>
  );
}
