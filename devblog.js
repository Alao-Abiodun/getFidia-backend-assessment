const { RESTDataSource } = require("apollo-datasource-rest");

class DevBlogsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://localhost:8080";
  }

  willSendRequest(request) {
    request.headers.set("Authorization", this.context.token);
  }

  async login(username, password) {
    return this.post("/user/signin", {
      username,
      password,
    });
  }
  async getUser(id) {
    return this.get(`/user/${id}`);
  }
}

module.exports = DevBlogsAPI;
