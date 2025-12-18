const express = require("express");
const cors = require("cors");

const {
  LoadBalancer,
  generateRandomIP,
  simulateTraffic,
  nodes,
  metrics,
  setNodeHealth
} = require("./app");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Load Balancer Assignment API" });
});

/**
 * ROUTE A GIVEN IP
 */
app.post("/route", (req, res) => {
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);

  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({
      error: "IP is required in request body"
    });
  }

  const node = LoadBalancer(ip);
  res.json({ ip, routedTo: node });
});


/**
 * ROUTE RANDOM IP
 */
app.get("/route/random", (req, res) => {
  const ip = generateRandomIP();
  res.json({ ip, routedTo: LoadBalancer(ip) });
});

/**
 * METRICS
 */
app.get("/metrics", (req, res) => {
  res.json(metrics);
});

/**
 * NODE STATUS
 */
app.get("/nodes", (req, res) => {
  res.json(nodes);
});

/**
 * UPDATE NODE HEALTH
 */
app.post("/nodes/health", (req, res) => {
  const { name, healthy } = req.body;
  setNodeHealth(name, healthy);
  res.json({ message: "Health updated", nodes });
});

/**
 * SIMULATE TRAFFIC
 */
app.post("/simulate", (req, res) => {
  simulateTraffic(req.body.count || 10);
  res.json({ message: "Traffic simulated" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
