import { auth, db, onAuthStateChanged, signOut, doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from './firebase.js';

export const $ = (id) => document.getElementById(id);
export const rm = (n) => 'RM ' + Number(n || 0).toFixed(2);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icon = (m) => m.emoji || '🍽️';
export const STATUS = { new: ['New', 'bad'], preparing: ['Preparing', 'prep'], done: ['Done', 'done'] };

// today as YYYY-MM-DD in local time
export const today = () => {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function toast(t) {
  const e = $('toast'); e.textContent = t; e.classList.add('on');
  clearTimeout(e.t); e.t = setTimeout(() => e.classList.remove('on'), 2500);
}

export const ROLE_PAGES = {
  admin:   ['dashboard', 'orders', 'menu', 'inventory', 'waste', 'insights', 'account', 'admin'],
  manager: ['dashboard', 'orders', 'menu', 'inventory', 'waste', 'insights', 'account'],
  kitchen: ['orders', 'inventory', 'waste', 'insights', 'account'],
};
export const HOME = { admin: 'dashboard.html', manager: 'dashboard.html', kitchen: 'orders.html' };
const NAV = {
  dashboard: ['🏠', 'Dashboard'], orders: ['🧾', 'Orders'], menu: ['📖', 'Menu'], inventory: ['📦', 'Inventory'],
  waste: ['🗑️', 'Waste'], insights: ['✨', 'AI Insights'], account: ['⚙️', 'Account'], admin: ['🏢', 'Platform'],
};

// Call at the top of every protected page. Returns { user, role, profile }.
export function requireLogin(page) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return location.replace('index.html');
      const role = (await user.getIdTokenResult()).claims.role;
      if (!ROLE_PAGES[role]) { await signOut(auth); return location.replace('index.html'); }
      if (!ROLE_PAGES[role].includes(page)) return location.replace(HOME[role]);
      const snap = await getDoc(doc(db, 'users', user.uid));          // grab this account's profile
      const profile = snap.exists() ? snap.data() : { email: user.email, role };
      drawShell(page, user, role);
      resolve({ user, role, profile });
    });
  });
}

function drawShell(page, user, role) {
  $('top').innerHTML = `
    <div class="logo"><i>M</i>MegaBite OS</div><div class="sp"></div>
    <span class="b prep">${role}</span>
    <div class="date">📅 ${new Date().toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
    <div class="user"><div class="av">${esc(user.email[0].toUpperCase())}</div><span>${esc(user.email)}</span></div>
    <button class="btn sec sm" id="out" style="color:#fff;border-color:#fff">Log out</button>`;
  $('side').innerHTML = ROLE_PAGES[role].map((p) =>
    `<a href="${p}.html" class="${p === page ? 'on' : ''}"><span>${NAV[p][0]}</span>${NAV[p][1]}</a>`).join('');
  $('out').onclick = async () => { await signOut(auth); location.href = 'index.html'; };
  $('app').style.display = 'block';   // show the page only after the login check passes
}

export async function loadMenu() {
  const snap = await getDocs(collection(db, 'menu_items'));
  const list = snap.docs.map((d) => d.data()).sort((a, b) => a.item_id - b.item_id);
  return { list, byId: Object.fromEntries(list.map((m) => [m.item_id, m])) };
}

export async function loadInventory() {
  const snap = await getDocs(collection(db, 'inventory'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name));
}

// Writes one line to audit_logs. It never blocks the page if it fails.
export async function logAudit(user, role, action, detail = {}) {
  try {
    await setDoc(doc(collection(db, 'audit_logs')),
      { action, by: user.email, role, ...detail, created_at: serverTimestamp() });
  } catch (e) { console.warn('audit log failed', e); }
}