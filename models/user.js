// @ts-nocheck
const mongoose = require("mongoose");
const Token = require("./token");
const { AuthenticationError, UserInputError } = require("apollo-server");
const { errorResMsg, successResMsg } = require("../helpers/response");
const AppError = require("../helpers/appError");

const crypto = require("crypto");

const {
  bcryptCompare,
  bcryptHash,
  decoded,
  handleError,
  sendMail,
  sign,
  verifyToken,
} = require("../helpers/index");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    id: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

User.createUser = async ({
  name,
  email,
  username,
  password,
  mobile_number,
  country,
}) => {
  try {
    const regex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!regex.test(email)) {
      throw new UserInputError("Invalid email address");
    }
    const userByEmail = await User.findOne({ email: email });
    if (userByEmail) {
      throw new AuthenticationError(
        "User already registered with the email address"
      );
    }
    const userByUsername = await User.findOne({ username: username });
    if (userByUsername) {
      throw new AuthenticationError(
        "User already registered with the username"
      );
    }
    if (password.length < 6) {
      throw new UserInputError("Password must be more than 6 letters");
    }
    const hashPassword = await bcryptHash(password);
    const user = new User({
      name,
      email,
      username,
      password: hashPassword,
      mobile_number,
      country,
    });
    const config = {
      to: email,
      subject: "Registration Successful",
      html: `<h1 style="font-size: 28px">Successful Registration</h1>
      <p style="font-size: 12px; color: grey">Proceed to verify your email account by clicking on the link in the next mail that will forwarded to you soon</p>`,
    };
    const code = ("" + Math.random()).substring(2, 10);
    const token = new Token({
      token: code,
      userId: user._id,
    });

    const verificationUrl = `${URL}/auth/email/verify/?verification_token=${code}`;

    const emailConfig = {
      to: email,
      subject: "Email Confirmation",
      html: `<p>Your code is</p>
      <p style="width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px"><a href="${verificationUrl}">click here</a> to verify your email.</p>
     `,
    };
    console.log(await sendMail(config));
    console.log(await sendMail(emailConfig));
    await token.save();
    await user.save();
    return user;
    // const dataInfo = { message: "Usr created successfully", user };
    // return successResMsg(res, 201, dataInfo);
  } catch (error) {
    handleError(error);
    // return errorResMsg(res, 500, error.message);
  }
};

User.verifyEmail = async (code) => {
  try {
    const token = await Token.findOne({ token: code });
    if (!token) {
      throw new Error("Invalid token");
    }
    const user = await User.findOne({ _id: token.userId });
    if (user.verified) {
      return next(
        new AppError("User already verified, kindly proceed to login")
      );
    }
    user.verified = true;
    await user.save();
    await Token.deleteOne({ token: code });
    const dataInfo = { message: "Email verified" };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    throw new Error(error.message);
  }
};

User.resendEmailVerification = async ({ email }, next) => {
  try {
    if (!email) {
      throw new Error("Please provide email");
    }

    const user = await User.findOne({ email }).select("+verified");

    if (!user) {
      return next(new AppError("Email has not been registered", 401));
    }
    if (user.verified) {
      return next(new AppError("Email has already been verified", 401));
    }

    const data = {
      email,
    };
    const code = ("" + Math.random()).substring(2, 10);
    const token = new Token({
      token: code,
      userId: user._id,
    });

    const verificationUrl = `${URL}/auth/email/verify/?verification_token=${code}`;

    const emailConfig = {
      to: data.email,
      subject: "Verify Email!",
      html: `<p>Your new Resend verification email is:</p>
      <p style="width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px"><a href="${verificationUrl}">click here</a> to verify your email.</p>
     `,
    };
    console.log(await sendMail(emailConfig));
    await token.save();
    await user.save();
    const dataInfo = { message: "Email verified successfully" };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return errorResMsg(res, 500, error.message);
  }
};

User.login = async ({ email, password }, next) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return next("No user registered with email address", 401);
      // throw new Error("No user registered with email address");
    }
    const doMatch = await bcryptCompare(password, user.password);
    if (!doMatch) {
      return next("Incorrect Password", 401);
      // throw new Error("Incorrect Password");
    }
    if (!user.verified) {
      return next(
        "Pls confirm your email address sent to your email address",
        401
      );
      // throw new Error ("Pls confirm your email address sent to your email address")
    }
    const payload = {
      email: user.email,
      username: user.username,
      userId: user._id,
    };
    const token = await sign(payload);
    const dataInfo = { message: "Logged In Successsfully", token, user };
    return successResMsg(res, 200, dataInfo);
    // return {
    //   token,
    //   message: "Logged In Successsfully",
    //   success: true,
    // };
  } catch (error) {
    handleError(error);
  }
};

User.fetchAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    handleError(error);
  }
};

User.getUser = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    handleError(error);
  }
};

User.verifyToken = async (req, next) => {
  const { token } = req.headers;
  if (token) {
    try {
      const signatory = await verifyToken(token);
      if (signatory) {
        const payload = await decoded(token);
        if (payload.exp > Date.now()) {
          return next(new AppError("Token already expired", 401));
          // throw new Error("Token already expired");
        }
        return payload;
      } else {
        return next(new AppError("Cannot Verify Token", 401));
        // throw new Error("Cannot Verify Token");
      }
    } catch (error) {
      return errorResMsg(res, 500, error.message);
      // throw new Error(error.message);
    }
  } else {
    return {
      payload: false,
    };
  }
};

module.exports = User;
