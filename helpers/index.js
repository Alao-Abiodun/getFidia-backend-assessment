const { bcryptCompare, bcryptHash } = require("./bcrypt");
const { error, handleError } = require("./error");
const { decoded, sign, verifyToken } = require("./jwt");
const { sendMail } = require("./sendEmail");

const index = {
  bcryptCompare,
  bcryptHash,
  error,
  handleError,
  decoded,
  sign,
  verifyToken,
  sendMail,
};

module.exports = index
