const { gql } = require("apollo-server-express");

const userSchema = gql`
  extend type Query {
    user(id: ID!): User
    users: [User]!
  }
  extend type Mutation {
    createUser(input: CreateUserInput): CreateUserResponse!
    login(input: LoginInput): LoginResponse!
    verifyEmail(code: Int!): MutationResponse!
    resendEmailVerification(
      input: ResendEmailVerificationInput
    ): MutationResponse!
  }

  type CreateUserResponse {
    message: String!
    status: Boolean!
    user: User!
  }

  type LoginResponse {
    token: String!
    message: String!
    success: Boolean!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    username: String!
    password: String!
    mobile_number: String!
    country: String
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    username: String!
    password: String!
    mobile_number: String!
    country: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ResendEmailVerificationInput {
    email: String!
  }
`;

module.exports = userSchema;
