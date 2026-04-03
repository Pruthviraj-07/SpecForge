const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log("Dispatcher connected:", socket.id);

  const interval = setInterval(async () => {
    try {
      const Hospital = require("./models/hospital.model");
      const hospitals = await Hospital.find();
      socket.emit("hospital-update", hospitals);
    } catch (error) {
      console.error("Socket error:", error.message);
    }
  }, 30000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("Dispatcher disconnected");
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} ✅`);
    });
  })
  .catch((err) => console.log(err));