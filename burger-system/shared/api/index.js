/**
 * SHARED API LAYER — burger-system/shared/api/index.js
 *
 * Camada de serviços simulada que espelha contratos REST reais.
 * Todos os dados são persistidos em localStorage (chave global: burger_orders).
 *
 * FUTURA INTEGRAÇÃO:
 *   Substituir cada método por fetch() ao endpoint correspondente.
 *   O contrato de entrada/saída permanece idêntico.
 *   Adicionar interceptors para autenticação JWT e refresh token.
 *
 * FALHAS REAIS CONSIDERADAS:
 *   - Timeout de rede → rejeitar promise após N ms
 *   - Conflito de escrita simultânea (duas pessoas na mesma mesa)
 *     → Usar optimistic locking: campo `updatedAt` como ETag
 *   - localStorage cheio → capturar QuotaExceededError
 *   - Tab fechada durante POST → pedido pode ser perdido
 *     → Mitigação: salvar rascunho no localStorage antes de enviar
 */

import { createOrder, ORDER_STATUS, PRODUCTS } from "../models/index.js";

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "burger_orders_v1";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("[API] Falha ao ler localStorage:", e);
    return [];
  }
}

function writeStorage(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    // QuotaExceededError — real problem in production
    console.error("[API] Falha ao gravar localStorage (quota?):", e);
    throw new Error("Armazenamento local cheio. Contate o suporte.");
  }
}

// ─── Simulated network delay ──────────────────────────────────────────────────
// FUTURA INTEGRAÇÃO: remover isso — o delay real virá da rede
const delay = (ms = 200) =>
  new Promise((res) => setTimeout(res, ms + Math.random() * 100));

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * GET /products
 * Retorna o cardápio completo.
 * FUTURA INTEGRAÇÃO: suportar ?categoria= e paginação
 */
export async function getProducts() {
  await delay(150);
  return { data: PRODUCTS, error: null };
}

/**
 * POST /orders
 * Cria um novo pedido para a mesa.
 *
 * CENÁRIO REAL: Duas pessoas na mesma mesa enviando ao mesmo tempo.
 * Solução simulada: chave composta mesa+token garante isolamento.
 * No backend real: usar transaction + row-level locking.
 *
 * @param {number} mesa
 * @param {string} token
 * @param {Array}  itens
 */
export async function postOrder(mesa, token, itens) {
  await delay();

  if (!itens || itens.length === 0) {
    return {
      data: null,
      error: "Pedido vazio — adicione itens antes de enviar.",
    };
  }

  const orders = readStorage();
  const order = createOrder(mesa, token, itens);
  orders.push(order);
  writeStorage(orders);

  // FUTURA INTEGRAÇÃO: emitir evento WebSocket para admin após POST
  // socket.emit("order:new", order);

  return { data: order, error: null };
}

/**
 * GET /orders/:token
 * Retorna pedidos de uma mesa específica pelo token.
 * Isolamento: cliente só vê pedidos com seu token.
 *
 * FALHA REAL: token expirado ou inválido → retornar 401
 * @param {string} token
 */
export async function getOrdersByToken(token) {
  await delay();
  const orders = readStorage();
  const filtered = orders.filter((o) => o.token === token);
  return { data: filtered, error: null };
}

/**
 * GET /orders
 * Retorna TODOS os pedidos — exclusivo para o admin.
 *
 * FUTURA INTEGRAÇÃO:
 *   - Paginar resultados (cursor-based pagination)
 *   - Filtrar por status, data, mesa
 *   - Endpoint protegido por Bearer token de admin
 */
export async function getAllOrders() {
  await delay(100);
  const orders = readStorage();
  // Ordenar por mais recente primeiro
  return {
    data: orders.sort((a, b) => b.createdAt - a.createdAt),
    error: null,
  };
}

/**
 * PUT /orders/:id/status
 * Atualiza o status de um pedido (admin only).
 *
 * FUTURA INTEGRAÇÃO:
 *   - Verificar permissão admin via middleware
 *   - Emitir WebSocket para o cliente da mesa: socket.to(`mesa:${order.mesa}`).emit("order:status", ...)
 *   - Registrar histórico de mudança de status (audit log)
 *
 * @param {string} orderId
 * @param {string} status - Um dos valores de ORDER_STATUS
 */
export async function updateOrderStatus(orderId, status) {
  await delay();

  const validStatuses = Object.values(ORDER_STATUS);
  if (!validStatuses.includes(status)) {
    return { data: null, error: `Status inválido: ${status}` };
  }

  const orders = readStorage();
  const idx = orders.findIndex((o) => o.orderId === orderId);

  if (idx === -1) {
    return { data: null, error: `Pedido não encontrado: ${orderId}` };
  }

  orders[idx].status = status;
  orders[idx].updatedAt = Date.now();
  writeStorage(orders);

  return { data: orders[idx], error: null };
}

/**
 * DELETE /orders/:id (admin only)
 * Remove pedido entregue do storage local.
 * FUTURA INTEGRAÇÃO: soft-delete no banco, manter histórico
 */
export async function deleteOrder(orderId) {
  await delay();
  const orders = readStorage();
  const filtered = orders.filter((o) => o.orderId !== orderId);
  writeStorage(filtered);
  return { data: { deleted: orders.length - filtered.length }, error: null };
}

/**
 * WEBSOCKET STUB
 * Estrutura preparada para integração futura com Socket.io ou WebSocket nativo.
 *
 * FUTURA INTEGRAÇÃO:
 *   import { io } from "socket.io-client";
 *   const socket = io(BACKEND_URL);
 *
 *   // Admin assina todos os eventos
 *   socket.on("order:new", handler);
 *   socket.on("order:updated", handler);
 *
 *   // Cliente assina apenas sua mesa
 *   socket.emit("join:mesa", { mesa, token });
 *   socket.on("order:status", handler);
 */
export const wsStub = {
  connected: false,
  listeners: {},
  on(event, handler) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(handler);
  },
  emit(event, data) {
    // Simular broadcast local — útil para testes
    const handlers = this.listeners[event] || [];
    handlers.forEach((h) => h(data));
  },
};