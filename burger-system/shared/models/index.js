/**
 * SHARED MODELS — burger-system/shared/models/index.js
 *
 * Fonte de verdade para todos os tipos de dados.
 * Quando conectar ao backend real, substituir por chamadas à API.
 * Estes modelos devem espelhar exatamente o schema do banco de dados.
 */

// ─── Mesas válidas ────────────────────────────────────────────────────────────
// FUTURA INTEGRAÇÃO: buscar do backend via GET /tables
export const VALID_TABLES = [1, 2, 3, 4];

// ─── Tokens fixos por mesa (simulação) ────────────────────────────────────────
// FUTURA INTEGRAÇÃO: tokens gerados dinamicamente pelo backend, rotativos por sessão
export const TABLE_TOKENS = {
  1: "tok_mesa1_abc123",
  2: "tok_mesa2_def456",
  3: "tok_mesa3_ghi789",
  4: "tok_mesa4_jkl012",
};

// ─── Status possíveis de um pedido ────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: "pending", // Pedido enviado, aguardando cozinha
  PREPARING: "preparing", // Em preparo na cozinha
  DONE: "done", // Pronto para entrega
  DELIVERED: "delivered", // Entregue na mesa
};

export const ORDER_STATUS_LABELS = {
  pending: "Aguardando",
  preparing: "Em Preparo",
  done: "Pronto! 🔔",
  delivered: "Entregue",
};

// ─── Cardápio (simulado) ──────────────────────────────────────────────────────
// FUTURA INTEGRAÇÃO: GET /products — suportar paginação, categorias e disponibilidade
export const PRODUCTS = [
  {
    id: 1,
    nome: "Smash Clássico",
    preco: 28.9,
    categoria: "burger",
    descricao: "Blend 180g, queijo cheddar, alface, tomate",
    emoji: "🍔",
  },
  {
    id: 2,
    nome: "Double Smash",
    preco: 38.9,
    categoria: "burger",
    descricao: "Dois blends 180g, duplo cheddar, bacon crocante",
    emoji: "🍔",
  },
  {
    id: 3,
    nome: "Crispy Chicken",
    preco: 32.9,
    categoria: "burger",
    descricao: "Frango empanado, maionese de mel, picles",
    emoji: "🍗",
  },
  {
    id: 4,
    nome: "Veggie Smash",
    preco: 29.9,
    categoria: "burger",
    descricao: "Blend de grão-de-bico, queijo vegano, rúcula",
    emoji: "🥬",
  },
  {
    id: 5,
    nome: "BBQ Bacon",
    preco: 36.9,
    categoria: "burger",
    descricao: "Blend 200g, cheddar defumado, onion rings, BBQ",
    emoji: "🥩",
  },
  {
    id: 6,
    nome: "Batata Frita P",
    preco: 12.9,
    categoria: "acomp",
    descricao: "Batata crocante com sal e ervas",
    emoji: "🍟",
  },
  {
    id: 7,
    nome: "Batata Frita G",
    preco: 18.9,
    categoria: "acomp",
    descricao: "Porção grande para compartilhar",
    emoji: "🍟",
  },
  {
    id: 8,
    nome: "Onion Rings",
    preco: 16.9,
    categoria: "acomp",
    descricao: "Anéis de cebola empanados",
    emoji: "🧅",
  },
  {
    id: 9,
    nome: "Refrigerante Lata",
    preco: 7.9,
    categoria: "bebida",
    descricao: "Coca-Cola, Guaraná ou Sprite",
    emoji: "🥤",
  },
  {
    id: 10,
    nome: "Milk Shake",
    preco: 19.9,
    categoria: "bebida",
    descricao: "Chocolate, Baunilha ou Morango — 400ml",
    emoji: "🥛",
  },
  {
    id: 11,
    nome: "Água Mineral",
    preco: 5.9,
    categoria: "bebida",
    descricao: "500ml com ou sem gás",
    emoji: "💧",
  },
  {
    id: 12,
    nome: "Brownie",
    preco: 11.9,
    categoria: "sobremesa",
    descricao: "Brownie quente com sorvete de creme",
    emoji: "🍫",
  },
];

/**
 * Cria um objeto de pedido padrão.
 * @param {number} mesa - Número da mesa
 * @param {string} token - Token da sessão
 * @param {Array}  itens - Array de itens do pedido
 */
export function createOrder(mesa, token, itens) {
  return {
    orderId: `order_${mesa}_${Date.now()}`,
    mesa: Number(mesa),
    token,
    itens: itens.map((item) => ({
      id: item.id,
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
    })),
    status: ORDER_STATUS.PENDING,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Calcula o total de um pedido.
 * @param {Object} order
 * @returns {number}
 */
export function calcOrderTotal(order) {
  return order.itens.reduce(
    (sum, item) => sum + item.preco * item.quantidade,
    0,
  );
}

/**
 * Formata valor monetário em BRL.
 * @param {number} value
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}