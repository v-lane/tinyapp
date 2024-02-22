const bcrypt = require("bcryptjs");

const urlDatabase = {
  b2xVn2: {
    urlID: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    urlID: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
  "0sm5xK": {
    urlID: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "fogitw"
  }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "hello@example.com",
    password: bcrypt.hashSync("hello", 10)
  }
};

module.exports = { urlDatabase, users };