const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const history = require("connect-history-api-fallback");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/courses");

const app = express();
const port = 5002;

dotenv.config();

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGODB TO CONNECTED");
  })
  .catch((err) => {
    console.error(`connection error: ${err}`);
  });
// app.use(
//   history({
//     verbose: true,
//     // options
//   })
// );
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://janpanese-fontend.onrender.com"],
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
  })
);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/courses", courseRoutes);

app.listen(port, () => console.log(`App listening on port ${port}`));
