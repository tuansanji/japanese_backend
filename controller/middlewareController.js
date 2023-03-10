const User = require("../model/User");
const jwt = require("jsonwebtoken");

const middlewareController = {
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    const refreshToken = req.cookies.refreshtoken;

    if (token) {
      const accessToken = token.split(" ")[1];

      jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
        if (err) {
          return res.status(403).send(" token is not valid");
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).send("you are not authenticated");
    }
  },
  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id == req.body.id || req.user.isAdmin) {
        next();
      } else {
        return res
          .status(401)
          .json("you are not admin or you are not authenticated");
      }
    });
  },
};

module.exports = middlewareController;
