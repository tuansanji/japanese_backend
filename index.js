const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const path = require("path");
const redis = require("redis");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/courses");
const session = require("express-session");
require("./controller/authGmail");
// require("./controller/redisController");
const app = express();
const port = 5002;
// Serve static files from the "public" directory in the frontend
// app.use(express.static(path.join(__dirname, '../frontend/public')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
// });
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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5002",
      "https://janpanese-fontend.onrender.com",
    ],
    methods: "GET,PUT,POST,DELETE,PATCH",
    credentials: true,
  })
);

app.use(
  session({
    secret: "minhtuan",
    resave: false,
    saveUninitialized: true,
  })
);

// Khởi tạo passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/courses", courseRoutes);

app.listen(port, () => console.log(`App listening on port ${port}`));
