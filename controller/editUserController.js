const fs = require("fs");
const path = require("path");
const User = require("../model/User");

const editUserController = {
  editImage: async (req, res) => {
    try {
      const user = req.user;
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath);
      const newUser = await User.findById(user.id);
      newUser.thumb = fileContent; // Lưu trữ dữ liệu ảnh dưới dạng binary

      await newUser.save();

      fs.unlinkSync(filePath); // Xóa file upload sau khi lưu trữ dữ liệu
      res.status(200).send("Thay ảnh đại diện thành công");
    } catch (error) {
      res.status(500).send("Có lỗi xảy ra. Vui lòng thử lại");
    }
  },
  getImage: (req, res) => {
    const userId = req.params.userId;
    User.findById(userId, (err, user) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.set("Content-Type", "image/png");
      res.send(user.thumb); // Trả về dữ liệu ảnh binary
    });
  },
};

module.exports = editUserController;
