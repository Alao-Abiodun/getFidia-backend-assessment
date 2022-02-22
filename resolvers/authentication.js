const { ForbiddenError, AuthenticationError } = require("apollo-server");
const { skip } = require("graphql-resolvers");

exports.isAuthenticated = (parent, args, { payload }) => {
  console.log(payload, "from middleware")
  payload ? skip : new AuthenticationError("You must login to view details");
};
