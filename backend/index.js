const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const multer = require("multer");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

fs.ensureDirSync("./uploads");
fs.ensureFileSync("./data/products.json");
fs.ensureFileSync("./data/orders.json");

const upload = multer({ dest: "uploads/" });

const readJSON = (file) => fs.readJsonSync(file, { throws: false }) || [];
const writeJSON = (file, data) => fs.writeJsonSync(file, data, { spaces: 2 });

// --- Products CRUD --- //
app.get("/products", (req, res) => res.json(readJSON("./data/products.json")));

app.post("/products", (req, res) => {
  const products = readJSON("./data/products.json");
  const newProduct = { ...req.body, id: Date.now() };
  products.push(newProduct);
  writeJSON("./data/products.json", products);
  res.json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const products = readJSON("./data/products.json");
  const idx = products.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    products[idx] = { ...products[idx], ...req.body };
    writeJSON("./data/products.json", products);
    res.json(products[idx]);
  } else res.status(404).send("Product not found");
});

app.delete("/products/:id", (req, res) => {
  let products = readJSON("./data/products.json");
  products = products.filter(p => p.id != req.params.id);
  writeJSON("./data/products.json", products);
  res.send("Deleted");
});

// --- Image upload --- //
app.post("/products/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  const filePath = `/uploads/${req.file.filename}-${req.file.originalname}`;
  fs.renameSync(req.file.path, path.join(__dirname, filePath));
  res.json({ url: filePath });
});

// --- Orders --- //
app.get("/orders", (req, res) => res.json(readJSON("./data/orders.json")));

app.post("/orders", (req, res) => {
  const orders = readJSON("./data/orders.json");
  const newOrder = { ...req.body, id: Date.now(), status: "PLACED", createdAt: new Date() };
  orders.push(newOrder);
  writeJSON("./data/orders.json", orders);
  io.emit("newOrderPlaced", newOrder);
  res.json(newOrder);
});

app.put("/orders/:id/status", (req, res) => {
  const orders = readJSON("./data/orders.json");
  const idx = orders.findIndex(o => o.id == req.params.id);
  if (idx >= 0) {
    orders[idx].status = req.body.status;
    writeJSON("./data/orders.json", orders);
    io.emit("orderStatusUpdated", orders[idx]);
    res.json(orders[idx]);
  } else res.status(404).send("Order not found");
});

server.listen(4000, () => console.log("Backend running on http://localhost:4000"));
