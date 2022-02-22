const User = require("../../models/user");
const resolvers = require("../user");
const { setupDB } = require("../test-setup");

setupDB("users");

describe("getUser", () => {
  it("Should save user to database", async (done) => {
    const newUser = new User({
      name: "alao",
      email: "abiodu@gmail.com",
      username: "abbey",
      password: "plop",
      mobile_number: "0091838384",
      country: "Ghana",
    });
    await newUser.save();

    const fetchedUser = await resolvers.Query.getUser(
      {},
      { id: newUser.id },
      { userId: newUser.id }
    );

    expect(fetchedUser.id).toBe(newUser.id);

    done();
  });

  it("Should throw if not authenticated", async (done) => {
    const newUser = new User({
      name: "alao",
      email: "abiodu@gmail.com",
      username: "abbey",
      password: "plop",
      mobile_number: "0091838384",
      country: "Ghana",
    });
    await newUser.save();

    await expect(
      resolvers.Query.getUser({}, { id: newUser.id }, {})
    ).rejects.toThrow(/must be authenticated/);

    done();
  });

  it("Should throw if not right user", async (done) => {
    const newUser = new User({
      name: "alao",
      email: "abiodu@gmail.com",
      username: "abbey",
      password: "plop",
      mobile_number: "0091838384",
      country: "Ghana",
    });
    await newUser.save();

    await expect(
      resolvers.Query.getUser({}, { id: newUser.id }, { userId: "123" })
    ).rejects.toThrow(/own datas/);

    done();
  });

  it("should fetch all the list of registered users", async (done) => {
    const registeredUser = {
      email: "abiodu@gmail.com",
      password: "plop",
    };

    await expect(resolvers.Query.getUser({}, {}, {})).rejects.toThrow(
      "/user login/"
    );

    done();
  });
});
