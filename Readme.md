# Load Balancer Assignment

## Objective

The objective of this assignment is to redesign a load balancer by replacing a random request routing strategy with a proper load balancing algorithm. The redesigned system ensures that the same client IP address is always routed to the same backend node, even when the number of backend nodes changes or when the same IP appears again later.

---

## Algorithm Used: Consistent Hashing

This project uses **Consistent Hashing**, a deterministic load balancing algorithm commonly used in distributed systems. In this approach, both client IP addresses and server nodes are mapped onto a circular hash ring. Each request is routed to the nearest clockwise node on the ring.

Consistent hashing provides stability by ensuring that when nodes are added or removed, only a small subset of IP addresses are remapped, while the rest continue to be routed to their original nodes.

---

## Implementation Overview

The load balancer logic is implemented entirely using in-memory data structures such as arrays and objects. No databases, files, or external services are used. The system is designed to be simple, beginner-friendly, and easy to explain.

The backend is implemented using **Node.js and Express.js**, exposing API endpoints to route requests, simulate traffic, view metrics, and manage node health.

---

## Features and Functionality

### Deterministic Routing

Each incoming request is routed based on the hash of its IP address. Because hashing is deterministic, the same IP address always maps to the same position on the hash ring and therefore reaches the same backend node every time.

### Minimal Remapping on Node Changes

When a backend node is marked unhealthy or removed, only the IP addresses mapped to that specific node are reassigned. All other IP-to-node mappings remain unchanged, satisfying the requirement of minimal remapping.

### Logging

For every routed request, the system logs the incoming IP address and the selected node using the provided logging function. This allows clear visibility into routing decisions during execution.

### In-Memory Implementation

All logic, including routing, metrics, health checks, and rate limiting, is implemented in memory. This satisfies the assignment constraint of not using persistent storage or concurrency mechanisms.

### Health Checks

Each backend node has a health status flag. Unhealthy nodes are excluded from the hash ring and do not receive traffic until they are marked healthy again. Health status can be updated manually using an API endpoint.

### Weighted Routing

Nodes can be assigned different weights. A higher weight gives a node more virtual positions on the hash ring, increasing the likelihood that incoming requests are routed to it. This allows prioritization of stronger servers.

### Metrics Dashboard

The system tracks runtime metrics such as total number of requests, number of requests handled by each node, per-IP request counts, and rate limit violations. These metrics are accessible through an API endpoint.

### Rate Limiting

A simple per-IP rate limiting mechanism is implemented. Each IP is allowed a fixed number of requests within a defined time window. Requests exceeding this limit are blocked and counted in the metrics.

---

## How to Reproduce and Verify the Functionality

**Deterministic Routing:** Send repeated requests with the same IP address to the routing endpoint. The response will always show the same backend node.

**Minimal Remapping:** Route an IP address, disable an unrelated node, and route the same IP again. The routing decision remains unchanged unless the originally selected node is disabled.

**Logging:** Observe the console output, which prints each IP-to-node mapping for every request.

**Weighted Routing and Metrics:** Simulate a large number of requests and then check the metrics endpoint. Nodes with higher weights will generally receive more requests.

**Health Checks:** Mark a node unhealthy and observe that it no longer receives traffic.

**Rate Limiting:** Send more requests than the configured limit from the same IP within the time window and observe that additional requests are blocked.

---

## API Endpoints

- `POST /route` – Route a request with a provided IP address
- `GET /route/random` – Route a request using a randomly generated IP
- `POST /simulate` – Simulate multiple incoming requests
- `GET /metrics` – View load balancer metrics
- `GET /nodes` – View backend node configuration
- `POST /nodes/health` – Enable or disable a backend node

---

## Run Instructions

```bash
npm install
node server.js
```

**Server URL:** The server starts at `http://localhost:3000`

---

## Conclusion

This project successfully replaces random routing with a consistent hashing-based load balancer. It guarantees deterministic routing, supports node changes with minimal remapping.