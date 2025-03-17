const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

app.get("/", (req, res) => {
  res.send("WebSocket server is running 🤔 ");
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
