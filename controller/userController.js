const User = require(".././model/User");
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
      console.log(req.params.id);
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
