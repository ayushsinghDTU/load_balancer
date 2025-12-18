/*************************************************
 * GIVEN CODE (MUST BE INCLUDED – UNCHANGED)
 *************************************************/

// Random IP generator
function generateRandomIP() {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 256)
  ).join(".");
}

// Identify which node received the request
function identifyNode(ip, selectedNode) {
  console.log(`Incoming IP: ${ip} → Routed to: ${selectedNode}`);
}

/*************************************************
 * NODE CONFIGURATION (In-Memory)
 *************************************************/

const nodes = [
  { name: "Node-A", weight: 1, healthy: true },
  { name: "Node-B", weight: 2, healthy: true }, // weighted
  { name: "Node-C", weight: 1, healthy: true }
];

/*************************************************
 * METRICS (BONUS)
 *************************************************/

const metrics = {
  totalRequests: 0,
  requestsPerNode: {},
  requestsPerIP: {},
  rateLimitHits: 0
};

/*************************************************
 * RATE LIMITING (BONUS)
 *************************************************/

const rateLimitStore = {};
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip) {
  const now = Date.now();

  if (!rateLimitStore[ip] || now > rateLimitStore[ip].reset) {
    rateLimitStore[ip] = { count: 1, reset: now + RATE_WINDOW };
    return true;
  }

  if (rateLimitStore[ip].count >= RATE_LIMIT) {
    metrics.rateLimitHits++;
    return false;
  }

  rateLimitStore[ip].count++;
  return true;
}

/*************************************************
 * SIMPLE HASH FUNCTION
 *************************************************/

function hash(key, max = 360) {
 if (typeof key !== "string") {
    return 0;   // prevent crash
  }
   
  let h = 0;

  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i) * i) % max;
  }
  return h;
}

/*************************************************
 * CONSISTENT HASH RING (PROPER ALGORITHM)
 *************************************************/

function buildHashRing() {
  const ring = [];

  nodes.forEach(node => {
    if (!node.healthy) return;

    // virtual nodes based on weight
    for (let i = 0; i < node.weight * 3; i++) {
      ring.push({
        position: hash(node.name + i),
        node: node.name
      });
    }
  });

  ring.sort((a, b) => a.position - b.position);
  return ring;
}

/*************************************************
 * LOAD BALANCER (REPLACED RANDOM LOGIC)
 *************************************************/

function LoadBalancer(ip) {
   if (!ip || typeof ip !== "string") {
    return null;   // 🚨 critical fix
  }
  if (!checkRateLimit(ip)) {
    return null;
  }

  metrics.totalRequests++;
  metrics.requestsPerIP[ip] =
    (metrics.requestsPerIP[ip] || 0) + 1;

  const ring = buildHashRing();
  if (ring.length === 0) return null;

  const ipHash = hash(ip);

  for (const entry of ring) {
    if (ipHash <= entry.position) {
      identifyNode(ip, entry.node);
      metrics.requestsPerNode[entry.node] =
        (metrics.requestsPerNode[entry.node] || 0) + 1;
      return entry.node;
    }
  }

  // wrap-around
  identifyNode(ip, ring[0].node);
  metrics.requestsPerNode[ring[0].node] =
    (metrics.requestsPerNode[ring[0].node] || 0) + 1;
  return ring[0].node;
}

/*************************************************
 * SIMULATION (GIVEN IN PDF)
 *************************************************/

function simulateTraffic(requestCount = 5) {
  for (let i = 0; i < requestCount; i++) {
    const ip = generateRandomIP();
    LoadBalancer(ip);
  }
}

/*************************************************
 * HEALTH CHECK (MANUAL, IN-MEMORY)
 *************************************************/

function setNodeHealth(name, healthy) {
  const node = nodes.find(n => n.name === name);
  if (node) node.healthy = healthy;
}

/*************************************************
 * EXPORTS
 *************************************************/

module.exports = {
  generateRandomIP,
  identifyNode,
  LoadBalancer,
  simulateTraffic,
  nodes,
  metrics,
  setNodeHealth
};
