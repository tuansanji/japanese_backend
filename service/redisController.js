const redis = require("redis");
require("dotenv").config();
const client = redis.createClient({
  password: process.env.PASSWORD_REDIS,
  socket: {
    host: process.env.HOST_REDIS,
    port: 15369,
  },
});
client.on("connect", () => {
  console.log("Redis client is connected");
});
client.on("error", (err) => {
  console.log("Redis Client Error", err);
  client.quit();
});
client.connect();

module.exports = client;
