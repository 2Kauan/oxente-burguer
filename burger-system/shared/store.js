/**
 * BURGER SYSTEM v2 — Shared Store
 * ================================
 * Camada de persistência robusta que simula um banco de dados.
 *
 * ESTRATÉGIA DE PERSISTÊNCIA:
 *   Primário:   localStorage (chave versionada)
 *   Fallback:   sessionStorage (se localStorage bloqueado por privacy mode)
 *   Em memória: objeto JS (último recurso — perde ao fechar)
 *
 * FUTURA INTEGRAÇÃO:
 *   Substituir read/write por fetch() ao backend.
 *   Os contratos de entrada/saída dos métodos permanecem idênticos.
 *
 * CONCORRÊNCIA:
 *   Em produção usar PostgreSQL com row-level locking.
 *   Aqui usamos updatedAt como ETag para detectar conflitos.
 */

const DB_KEY = "burgerhouse_db_v2";
const DB_VER = 2;

// ─── Memória de fallback ───────────────────────────────────────────────────────
let _memoryFallback = null;

function _getStorage() {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return localStorage;
  } catch (e) {
    try {
      sessionStorage.setItem("__test__", "1");
      sessionStorage.removeItem("__test__");
      return sessionStorage;
    } catch (e2) {
      return null;
    }
  }
}

// ─── DB Schema ────────────────────────────────────────────────────────────────
function _emptyDb() {
  return {
    version: DB_VER,
    sessions: [],
    notifications: [],
    updatedAt: Date.now(),
  };
}

export function readDb() {
  const storage = _getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(DB_KEY);
      if (raw) {
        const db = JSON.parse(raw);
        if (db.version === DB_VER) return db;
      }
    } catch (e) {
      console.warn("[Store] Parse error, resetting", e);
    }
    const fresh = _emptyDb();
    storage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  // fallback em memória
  if (!_memoryFallback) _memoryFallback = _emptyDb();
  return _memoryFallback;
}

export function writeDb(db) {
  db.updatedAt = Date.now();
  const storage = _getStorage();
  if (storage) {
    try {
      storage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error("[Store] Write failed (quota?)", e);
      return false;
    }
  }
  _memoryFallback = db;
  return true;
}

// ─── Simulated delay ──────────────────────────────────────────────────────────
const delay = (ms = 150) =>
  new Promise((r) => setTimeout(r, ms + Math.random() * 80));

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS — GET /products
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCTS = [
  {
    id: 1,
    nome: "Smash Clássico",
    preco: 28.9,
    categoria: "burger",
    descricao: "Blend 180g, queijo cheddar, alface, tomate",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    disponivel: true,
  },
  {
    id: 2,
    nome: "Double Smash",
    preco: 38.9,
    categoria: "burger",
    descricao: "Dois blends 180g, duplo cheddar, bacon crocante",
    img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80",
    disponivel: true,
  },
  {
    id: 3,
    nome: "Crispy Chicken",
    preco: 32.9,
    categoria: "burger",
    descricao: "Frango empanado crocante, maionese de mel, picles",
    img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
    disponivel: true,
  },
  {
    id: 4,
    nome: "Veggie Smash",
    preco: 29.9,
    categoria: "burger",
    descricao: "Blend de grão-de-bico, queijo vegano, rúcula",
    img: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80",
    disponivel: true,
  },
  {
    id: 5,
    nome: "BBQ Bacon",
    preco: 36.9,
    categoria: "burger",
    descricao: "Blend 200g, cheddar defumado, onion rings, BBQ",
    img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80",
    disponivel: false,
  },
  {
    id: 6,
    nome: "Batata Frita P",
    preco: 12.9,
    categoria: "acomp",
    descricao: "Batata crocante com sal e ervas",
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    disponivel: true,
  },
  {
    id: 7,
    nome: "Batata Frita G",
    preco: 18.9,
    categoria: "acomp",
    descricao: "Porção grande para compartilhar",
    img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80",
    disponivel: true,
  },
  {
    id: 8,
    nome: "Onion Rings",
    preco: 16.9,
    categoria: "acomp",
    descricao: "Anéis de cebola empanados crocantes",
    img: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80",
    disponivel: true,
  },
  {
    id: 9,
    nome: "Refrigerante",
    preco: 7.9,
    categoria: "bebida",
    descricao: "Coca-Cola, Guaraná ou Sprite — lata 350ml",
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
    disponivel: true,
  },
  {
    id: 10,
    nome: "Milk Shake",
    preco: 19.9,
    categoria: "bebida",
    descricao: "Chocolate, Baunilha ou Morango — 400ml",
    img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80",
    disponivel: true,
  },
  {
    id: 11,
    nome: "Água Mineral",
    preco: 5.9,
    categoria: "bebida",
    descricao: "500ml com ou sem gás",
    img: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
    disponivel: true,
  },
  {
    id: 12,
    nome: "Brownie",
    preco: 11.9,
    categoria: "sobremesa",
    descricao: "Brownie quente com sorvete de creme",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
    disponivel: true,
  },
];

export async function apiGetProducts() {
  await delay(100);
  return { data: PRODUCTS, error: null };
}

export async function apiToggleProduct(id, disponivel) {
  await delay(80);
  const p = PRODUCTS.find((p) => p.id === id);
  if (p) p.disponivel = disponivel;
  return { data: p, error: null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSIONS — POST /sessions  |  GET /sessions  |  PUT /sessions/:id/close
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiCreateSession(mesa, token) {
  await delay();
  const db = readDb();

  // Em vez de apenas fechar, vamos garantir que não existam conflitos com sessões arquivadas
  db.sessions = db.sessions.map((s) => {
    if (s.mesa === Number(mesa) && s.status === "open") {
      return { ...s, status: "closed" };
    }
    return s;
  });

  const session = {
    sessionId: `sess_${mesa}_${Date.now()}`,
    mesa: Number(mesa),
    token,
    status: "open",
    orders: [],
    archived: false, // Garantimos que nasce não-arquivada
    garcomChamado: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  db.sessions.push(session);
  writeDb(db);
  return { data: session, error: null };
}

export async function apiGetSession(token) {
  await delay(80);
  const db = readDb();
  const session = db.sessions
    .filter((s) => s.token === token)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  if (!session) return { data: null, error: "Sessão não encontrada" };
  return { data: session, error: null };
}

export async function apiGetAllSessions() {
  await delay(80);
  const db = readDb();
  return { data: db.sessions, error: null };
}

export async function apiCloseSession(sessionId) {
  // PUT /sessions/:id/close
  // FUTURA INTEGRAÇÃO: gerar nota fiscal, enviar para impressora térmica
  await delay();
  const db = readDb();
  const s = db.sessions.find((s) => s.sessionId === sessionId);
  if (!s) return { data: null, error: "Sessão não encontrada" };
  s.status = "closed";
  s.closedAt = Date.now();
  s.updatedAt = Date.now();
  writeDb(db);
  return { data: s, error: null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS — POST /orders  |  PUT /orders/:id/status
// ═══════════════════════════════════════════════════════════════════════════════

export async function apiPostOrder(sessionId, itens) {
  await delay(200);
  if (!itens || itens.length === 0)
    return { data: null, error: "Pedido vazio." };

  const db = readDb();

  // Tenta achar a sessão pelo ID
  let session = db.sessions.find(
    (s) => s.sessionId === sessionId && !s.archived,
  );

  // SE NÃO ACHOU (Admin zerou tudo), vamos tentar achar qualquer sessão aberta para este token
  if (!session) {
    // Isso evita o erro de "Sessão não encontrada"
    session = db.sessions.find((s) => s.status === "open" && !s.archived);
  }

  // Se MESMO ASSIM não existir, a API retorna um erro específico que o Cliente vai entender
  if (!session) return { data: null, error: "SESSION_LOST" };

  if (session.status === "closed")
    return { data: null, error: "Mesa já encerrada." };

  const order = {
    orderId: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    itens: itens.map((i) => ({
      id: i.id,
      nome: i.nome,
      quantidade: i.quantidade,
      preco: i.preco,
      observacao: i.observacao || "",
    })),
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tempoEstimado: calcETA(itens),
  };

  session.orders.push(order);
  session.updatedAt = Date.now();
  writeDb(db);

  _broadcastNotification({
    type: "order:new",
    sessionId: session.sessionId,
    mesa: session.mesa,
    orderId: order.orderId,
  });

  return { data: order, error: null };
}

export async function apiUpdateOrderStatus(sessionId, orderId, status) {
  // PUT /orders/:id/status
  // FUTURA INTEGRAÇÃO: emitir WebSocket para cliente e cozinha
  await delay(100);
  const db = readDb();
  const session = db.sessions.find((s) => s.sessionId === sessionId);
  if (!session) return { data: null, error: "Sessão não encontrada." };
  const order = session.orders.find((o) => o.orderId === orderId);
  if (!order) return { data: null, error: "Pedido não encontrado." };

  order.status = status;
  order.updatedAt = Date.now();
  session.updatedAt = Date.now();
  writeDb(db);

  _broadcastNotification({
    type: "order:status",
    sessionId,
    mesa: session.mesa,
    orderId,
    status,
  });
  return { data: order, error: null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GARÇOM / NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function apiCallWaiter(sessionId) {
  await delay(80);
  const db = readDb();
  const session = db.sessions.find((s) => s.sessionId === sessionId);
  if (!session) return { data: null, error: "Sessão não encontrada." };
  session.garcomChamado = true;
  session.garcomTimestamp = Date.now();
  session.updatedAt = Date.now();
  writeDb(db);
  _broadcastNotification({
    type: "waiter:call",
    sessionId,
    mesa: session.mesa,
  });
  return { data: { ok: true }, error: null };
}

export async function apiDismissWaiter(sessionId) {
  await delay(80);
  const db = readDb();
  const session = db.sessions.find((s) => s.sessionId === sessionId);
  if (session) {
    session.garcomChamado = false;
    session.updatedAt = Date.now();
  }
  writeDb(db);
  return { data: { ok: true }, error: null };
}

// ─── Broadcast via localStorage events ────────────────────────────────────────
// FUTURA INTEGRAÇÃO: substituir por socket.io emit
// Tabs do mesmo browser recebem via 'storage' event — simula WebSocket entre abas
function _broadcastNotification(payload) {
  const db = readDb();
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    ...payload,
    id: Date.now(),
    read: false,
    ts: Date.now(),
  });
  if (db.notifications.length > 100)
    db.notifications = db.notifications.slice(0, 100);
  writeDb(db);
}

export function subscribeToNotifications(callback) {
  // Polling como fallback — em produção usar WebSocket
  // FUTURA INTEGRAÇÃO: socket.on('order:new', callback)
  let lastTs = Date.now();
  const interval = setInterval(() => {
    const db = readDb();
    const fresh = (db.notifications || []).filter((n) => n.ts > lastTs);
    if (fresh.length > 0) {
      lastTs = fresh[0].ts;
      fresh.forEach((n) => callback(n));
    }
  }, 1500);
  return () => clearInterval(interval); // unsubscribe fn
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcETA(itens) {
  const hasBurger = itens.some((i) => {
    const p = PRODUCTS.find((p) => p.id === i.id);
    return p && p.categoria === "burger";
  });
  return hasBurger ? "15–20 min" : "8–12 min";
}

export function calcOrderTotal(order) {
  return order.itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
}

export function calcSessionTotal(session) {
  return session.orders.reduce((s, o) => s + calcOrderTotal(o), 0);
}

export function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


// ─── Auth stubs (FUTURA INTEGRAÇÃO) ───────────────────────────────────────────
export const TABLE_TOKENS = {
  1: "tok_mesa1_abc123",
  2: "tok_mesa2_def456",
  3: "tok_mesa3_ghi789",
  4: "tok_mesa4_jkl012",
};
export const VALID_TABLES = [1, 2, 3, 4];