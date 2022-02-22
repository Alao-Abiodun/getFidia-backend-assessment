// @ts-nocheck
const jwt = require("jsonwebtoken");

const { privateKey, publicKey } = require("../constant/index");

const config = {
  privateKey,
  publicKey,
  options: {
    expiresIn: "1hr",
    algorithm: "RS256",
  },
};

exports.sign = async (payload) => {
  try {
    const token = await jwt.sign(payload, config.privateKey, config.options);
    return token;
  } catch (error) {
    console.log(error);
    return error;
  }
};

exports.verifyToken = async (token) => {
  try {
    const signatory = await jwt.verify(
      token,
      config.publicKey,
      config.options.algorithm
    );
    return signatory;
  } catch (error) {
    throw new Error("Error verifying token");
  }
};

exports.decoded = (token) => jwt.decode(token, { complete: true });
