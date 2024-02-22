const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-dino12"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  ITqMS2: {
    id: "ITqMS2",
    email: "me@example.com",
    password: "me"
  }
};

/**
 * Generates pseudo-random 6 character string consisting of alphanumeric characters
 * @returns {string} 
 */
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let x = 0;
  let randomString = "";
  while (x < 6) {
    randomString += (characters[Math.floor(Math.random() * 62)]);
    x += 1;
  }
  return randomString;
};

/**
 * Given email, checks if user exists in users object.  
 * @param {string} email - email to check against
 * @returns {object | null} user object or null
 */
const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

/**
 * Returns boolean confirming if user_id value from cookies matches user in users object.
 * @param {string} cookie_id - user_id value from cookies
 * @returns {boolean} 
 */
const isUserLoggedIn = function(cookie_id) {
  if (cookie_id === undefined) return false;
  if (users[cookie_id]) return true;
  return false;
};

/**
 * Returns user object if callback returns true, otherwise returns empty object.
 * @param {string} user_id - unique user ID
 * @param {function} callback - must return boolean
 * @returns {object}
 */
const userData = function(user_id, callback) {
  let userObject = {};
  try {
    if (user_id === undefined || callback(user_id) === false) {
      return userObject;
    }
    if (callback(user_id) === true) {
      userObject = users[user_id];
      return userObject;
    }
  } catch (error) {
    console.log("!!!! Error in userData function. Check params are valid. user_id must be a string and callback function must return boolean.");
  }
};



// home
app.get("/", (req, res) => {
  res.send("Hello!");
});

// login
app.get('/login', (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  if (username !== "") {
    res.redirect('/urls');
  }
  // Likely should add error message to client that username cannot be empty
  res.redirect('/urls');
});

// register
app.get('/register', (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  if (user_email === "" || user_password === "") {
    res.status(400).send("Error 400: email and password cannot be empty");
  } else if (getUserByEmail(user_email) !== null) {
    res.status(400).send("Error 400: User already exists.");
  } else {
    const user_id = generateRandomString();
    users[user_id] = { id: user_id, email: user_email, password: user_password };
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// urls
app.get("/urls", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  // recommended by Nally for debugging
  console.log(`active user ${JSON.stringify(users[cookie_user_id])}`);
  console.log(`all users ${JSON.stringify(users)}`);
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// new short URL
app.get("/urls/new", (req, res) => {
  const cookie_user_id = req.cookies["cookie_user_id"];
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
  };
  res.render("urls_new", templateVars);
});

// short url in detail
app.get("/urls/:id", (req, res) => {
  const cookie_user_id = req.cookies["cookie_user_id"];
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.updatedLongURL;
  res.redirect('/urls');
});

// short url - edit
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

// short url - delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// external redirect
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});