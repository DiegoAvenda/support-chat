/**
 * SSE (Server-Sent Events) Manager
 * Manages connected SSE clients and broadcasts events to all of them.
 */

/** @type {Set<import('express').Response>} */
const clients = new Set();

/**
 * Add an SSE client response to the pool.
 * @param {import('express').Response} res
 */
export function addClient(res) {
  clients.add(res);
  console.log(`📡 SSE client connected. Total: ${clients.size}`);
}

/**
 * Remove an SSE client response from the pool.
 * @param {import('express').Response} res
 */
export function removeClient(res) {
  clients.delete(res);
  console.log(`🔌 SSE client disconnected. Total: ${clients.size}`);
}

/**
 * Broadcast a message event to all connected SSE clients.
 * @param {object} data - The payload to send (will be JSON-serialized)
 */
export function broadcastMessage(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  for (const client of clients) {
    try {
      client.write(payload);
    } catch (err) {
      console.error('Error writing to SSE client, removing:', err.message);
      clients.delete(client);
    }
  }
}

/**
 * Send a heartbeat (comment) to all clients to keep connections alive.
 */
export function sendHeartbeat() {
  const heartbeat = ': heartbeat\n\n';
  for (const client of clients) {
    try {
      client.write(heartbeat);
    } catch {
      clients.delete(client);
    }
  }
}

/**
 * Get the current number of connected SSE clients.
 * @returns {number}
 */
export function getClientCount() {
  return clients.size;
}
