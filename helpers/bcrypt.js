const bcrypt = require("bcryptjs");

const salt = bcrypt.genSaltSync(15);

exports.bcryptHash = async (password) => {
  const hashedPassword = await bcrypt.hashSync(password, salt);
  return hashedPassword;
};

exports.bcryptCompare = async (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
