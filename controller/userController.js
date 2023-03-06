const User = require(".././model/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.body.id);
      res.status(200).send("delete  users successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteManyUsers: async (req, res) => {
    try {
      const users = await User.deleteMany({ _id: { $in: req.body.arr } });

      res.status(200).send("delete many users successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  editUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.body.id, {
        username: req.body.username,
        email: req.body.email,
        money: req.body.money,
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  forgotPassWord: async (req, res) => {
    const email = req.body.email;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      const token = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      await user.save();

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.ACCOUNT_GMAIL,
          pass: process.env.PASSWORD_GMAIL,
        },
      });

      const mailOptions = {
        from: process.env.ACCOUNT_GMAIL,
        to: email,
        subject: "Yêu cầu đặt lại mật khẩu",
        text: `Xin chào ${user.username}! Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\n
        Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quy trình:\n\n
        http://${req.headers.host}/user/change-password/${token}\n\n
        Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: "Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.params.token;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      // Render the password reset form
      // res.render("reset-password", { token });
      res.redirect(
        `${process.env.LOCALHOST_URL}/user/change-password/${token}`
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.params.token;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      // Render the password reset form
      // res.render("reset-password", { token });
      res.redirect(`http://localhost:3000/user/change-password/${token}`);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  confirmPasswordChange: async (req, res) => {
    try {
      const token = req.params.token;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = userController;
