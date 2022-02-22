"use strict";

// @ts-nocheck
var mongoose = require("mongoose");

var Token = require("./token");

var _require = require("apollo-server"),
    AuthenticationError = _require.AuthenticationError,
    UserInputError = _require.UserInputError;

var _require2 = require("../helpers/response"),
    errorResMsg = _require2.errorResMsg,
    successResMsg = _require2.successResMsg;

var AppError = require("../helpers/appError");

var crypto = require("crypto");

var _require3 = require("../helpers/index"),
    bcryptCompare = _require3.bcryptCompare,
    bcryptHash = _require3.bcryptHash,
    decoded = _require3.decoded,
    handleError = _require3.handleError,
    sendMail = _require3.sendMail,
    sign = _require3.sign,
    verifyToken = _require3.verifyToken;

var Schema = mongoose.Schema;
var userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile_number: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    "default": false
  }
}, {
  id: false,
  timestamps: true
});
var User = mongoose.model("User", userSchema);

User.createUser = function _callee(_ref) {
  var name, email, username, password, mobile_number, country, regex, userByEmail, userByUsername, hashPassword, user, config, code, token, verificationUrl, emailConfig;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          name = _ref.name, email = _ref.email, username = _ref.username, password = _ref.password, mobile_number = _ref.mobile_number, country = _ref.country;
          _context.prev = 1;
          console.log(email);
          regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

          if (regex.test(email)) {
            _context.next = 6;
            break;
          }

          throw new UserInputError("Invalid email address");

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 8:
          userByEmail = _context.sent;
          console.log(userByEmail);

          if (!userByEmail) {
            _context.next = 12;
            break;
          }

          throw new AuthenticationError("User already registered with the email address");

        case 12:
          _context.next = 14;
          return regeneratorRuntime.awrap(User.findOne({
            username: username
          }));

        case 14:
          userByUsername = _context.sent;

          if (!userByUsername) {
            _context.next = 17;
            break;
          }

          throw new AuthenticationError("User already registered with the username");

        case 17:
          if (!(password.length < 6)) {
            _context.next = 19;
            break;
          }

          throw new UserInputError("Password must be more than 6 letters");

        case 19:
          _context.next = 21;
          return regeneratorRuntime.awrap(bcryptHash(password));

        case 21:
          hashPassword = _context.sent;
          user = new User({
            name: name,
            email: email,
            username: username,
            password: hashPassword,
            mobile_number: mobile_number,
            country: country
          });
          console.log(user);
          config = {
            to: email,
            subject: "Registration Successful",
            html: "<h1 style=\"font-size: 28px\">Successful Registration</h1>\n      <p style=\"font-size: 12px; color: grey\">Proceed to verify your email account by clicking on the link in the next mail that will forwarded to you soon</p>"
          };
          code = ("" + Math.random()).substring(2, 10);
          token = new Token({
            token: code,
            userId: user._id
          });
          verificationUrl = "".concat(URL, "/auth/email/verify/?verification_token=").concat(code);
          emailConfig = {
            to: email,
            subject: "Email Confirmation",
            html: "<p>Your code is</p>\n      <p style=\"width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px\"><a href=\"".concat(verificationUrl, "\">click here</a> to verify your email.</p>\n     ")
          };
          _context.t0 = console;
          _context.next = 32;
          return regeneratorRuntime.awrap(sendMail(config));

        case 32:
          _context.t1 = _context.sent;

          _context.t0.log.call(_context.t0, _context.t1);

          _context.t2 = console;
          _context.next = 37;
          return regeneratorRuntime.awrap(sendMail(emailConfig));

        case 37:
          _context.t3 = _context.sent;

          _context.t2.log.call(_context.t2, _context.t3);

          _context.next = 41;
          return regeneratorRuntime.awrap(token.save());

        case 41:
          _context.next = 43;
          return regeneratorRuntime.awrap(user.save());

        case 43:
          console.log(user);
          return _context.abrupt("return", user);

        case 47:
          _context.prev = 47;
          _context.t4 = _context["catch"](1);
          handleError(_context.t4); // return errorResMsg(res, 500, error.message);

        case 50:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 47]]);
};

User.verifyEmail = function _callee2(code) {
  var token, user, dataInfo;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Token.findOne({
            token: code
          }));

        case 3:
          token = _context2.sent;

          if (token) {
            _context2.next = 6;
            break;
          }

          throw new Error("Invalid token");

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(User.findOne({
            _id: token.userId
          }));

        case 8:
          user = _context2.sent;

          if (!user.verified) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", next(new AppError("User already verified, kindly proceed to login")));

        case 11:
          user.verified = true;
          _context2.next = 14;
          return regeneratorRuntime.awrap(user.save());

        case 14:
          _context2.next = 16;
          return regeneratorRuntime.awrap(Token.deleteOne({
            token: code
          }));

        case 16:
          dataInfo = {
            message: "Email verified"
          };
          return _context2.abrupt("return", successResMsg(res, 200, dataInfo));

        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0.message);

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 20]]);
};

User.resendEmailVerification = function _callee3(_ref2, next) {
  var email, user, data, code, token, verificationUrl, emailConfig, dataInfo;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          email = _ref2.email;
          _context3.prev = 1;

          if (email) {
            _context3.next = 4;
            break;
          }

          throw new Error("Please provide email");

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+verified"));

        case 6:
          user = _context3.sent;

          if (user) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Email has not been registered", 401)));

        case 9:
          if (!user.verified) {
            _context3.next = 11;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Email has already been verified", 401)));

        case 11:
          data = {
            email: email
          };
          code = ("" + Math.random()).substring(2, 10);
          token = new Token({
            token: code,
            userId: user._id
          });
          verificationUrl = "".concat(URL, "/auth/email/verify/?verification_token=").concat(code);
          emailConfig = {
            to: data.email,
            subject: "Verify Email!",
            html: "<p>Your new Resend verification email is:</p>\n      <p style=\"width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px\"><a href=\"".concat(verificationUrl, "\">click here</a> to verify your email.</p>\n     ")
          };
          _context3.t0 = console;
          _context3.next = 19;
          return regeneratorRuntime.awrap(sendMail(emailConfig));

        case 19:
          _context3.t1 = _context3.sent;

          _context3.t0.log.call(_context3.t0, _context3.t1);

          _context3.next = 23;
          return regeneratorRuntime.awrap(token.save());

        case 23:
          _context3.next = 25;
          return regeneratorRuntime.awrap(user.save());

        case 25:
          dataInfo = {
            message: "Email verified successfully"
          };
          return _context3.abrupt("return", successResMsg(res, 200, dataInfo));

        case 29:
          _context3.prev = 29;
          _context3.t2 = _context3["catch"](1);
          return _context3.abrupt("return", errorResMsg(res, 500, _context3.t2.message));

        case 32:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 29]]);
};

User.login = function _callee4(_ref3, next) {
  var email, password, user, doMatch, payload, token, dataInfo;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          email = _ref3.email, password = _ref3.password;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 4:
          user = _context4.sent;

          if (user) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", next("No user registered with email address", 401));

        case 7:
          _context4.next = 9;
          return regeneratorRuntime.awrap(bcryptCompare(password, user.password));

        case 9:
          doMatch = _context4.sent;

          if (doMatch) {
            _context4.next = 12;
            break;
          }

          return _context4.abrupt("return", next("Incorrect Password", 401));

        case 12:
          if (user.verified) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", next("Pls confirm your email address sent to your email address", 401));

        case 14:
          payload = {
            email: user.email,
            username: user.username,
            userId: user._id
          };
          _context4.next = 17;
          return regeneratorRuntime.awrap(sign(payload));

        case 17:
          token = _context4.sent;
          dataInfo = {
            message: "Logged In Successsfully",
            token: token,
            user: user
          };
          return _context4.abrupt("return", successResMsg(res, 200, dataInfo));

        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](1);
          handleError(_context4.t0);

        case 25:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 22]]);
};

User.fetchAllUsers = function _callee5() {
  var users;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(User.find());

        case 3:
          users = _context5.sent;
          return _context5.abrupt("return", users);

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          handleError(_context5.t0);

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

User.getUser = function _callee6(id) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findById(id));

        case 3:
          user = _context6.sent;
          return _context6.abrupt("return", user);

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          handleError(_context6.t0);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

User.verifyToken = function _callee7(req, next) {
  var token, signatory, payload;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = req.headers.token;

          if (!token) {
            _context7.next = 23;
            break;
          }

          _context7.prev = 2;
          _context7.next = 5;
          return regeneratorRuntime.awrap(verifyToken(token));

        case 5:
          signatory = _context7.sent;

          if (!signatory) {
            _context7.next = 15;
            break;
          }

          _context7.next = 9;
          return regeneratorRuntime.awrap(decoded(token));

        case 9:
          payload = _context7.sent;

          if (!(payload.exp > Date.now())) {
            _context7.next = 12;
            break;
          }

          return _context7.abrupt("return", next(new AppError("Token already expired", 401)));

        case 12:
          return _context7.abrupt("return", payload);

        case 15:
          return _context7.abrupt("return", next(new AppError("Cannot Verify Token", 401)));

        case 16:
          _context7.next = 21;
          break;

        case 18:
          _context7.prev = 18;
          _context7.t0 = _context7["catch"](2);
          return _context7.abrupt("return", errorResMsg(res, 500, _context7.t0.message));

        case 21:
          _context7.next = 24;
          break;

        case 23:
          return _context7.abrupt("return", {
            payload: false
          });

        case 24:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[2, 18]]);
};

module.exports = User;