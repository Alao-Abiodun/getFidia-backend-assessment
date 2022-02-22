"use strict";

// @ts-nocheck
var _require = require("apollo-server-express"),
    ApolloServer = _require.ApolloServer;

var _require2 = require("express-graphql"),
    graphqlHTTP = _require2.graphqlHTTP;

var express = require("express");

var mongoose = require("mongoose");

var models = require("./models/index");

var typeDefs = require("./schema");

var resolvers = require("./resolvers");

var _require3 = require("./helpers/index"),
    error = _require3.error;

var cors = require("cors");

var server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  tracing: true,
  context: function context(_ref) {
    var req, _ref2, payload;

    return regeneratorRuntime.async(function context$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            req = _ref.req;
            _context.next = 3;
            return regeneratorRuntime.awrap(models.User.verifyToken(req));

          case 3:
            _ref2 = _context.sent;
            payload = _ref2.payload;
            return _context.abrupt("return", {
              models: models,
              payload: payload
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  formatError: error
});
var app = express();
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use("/graphql", function (error, req, res, next) {
  console.log(error);
  var status = error.statusCode;
  var message = error.message;
  return res.status(status).json({
    message: message,
    status: status
  });
});
app.use(cors());
server.applyMiddleware({
  app: app
});
mongoose.connect("mongodb+srv://grazac_store:12345@cluster0.rfnom.mongodb.net/getFidia_backend_DB?retryWrites=true&w=majority\n    ", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function (res) {
  console.log("MongoDB Connected");
  app.listen(4100, function () {
    console.log("🚀 Server ready at http://localhost:4100/graphql");
  });
})["catch"](function (err) {
  console.log(err);
}); // mongoose
//   .connect(
//     `mongodb+srv://grazac_store:12345@cluster0.rfnom.mongodb.net/getFidia_backend_DB?retryWrites=true&w=majority`,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     console.log("MongoDB Connected");
//     return server.listen(5000);
//   })
//   .then((res) => {
//     console.log(`Server running at ${res.url}`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });