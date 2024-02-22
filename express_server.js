const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  b2xVn2: {
    urlID: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    urlID: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "9sm5xK"
  }
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

// user-related functions
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

// URL related functions

/**
 * Returns boolean confirming if id value exists in URL database 
 * @param {string} id - shortURL ID
 * @returns {boolean}
 */
const isExistingShortUrl = function(id) {
  if (id === undefined) return false;
  if (urlDatabase[id] !== undefined) return true;
  return false;
};


// home
app.get("/", (req, res) => {
  res.send("Hello!");
});

// login
app.get('/login', (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  if (isUserLoggedIn(cookie_user_id)) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: userData(cookie_user_id, isUserLoggedIn),
    };
    res.render("login", templateVars);
  };
});

app.post("/login", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user = getUserByEmail(user_email);
  if (user_email === "" || user_password === "") {
    res.status(400).send("Error 400: email and/or password cannot be empty");
  } else if (user === null) {
    res.status(403).send('Error 403: user account not found.');
  } else if (user_password !== users[user].password) {
    res.status(403).send("Error 403: incorrect password.");
  } else {
    res.cookie("user_id", users[user].id);
    res.redirect('/urls');
  }
});

// register
app.get('/register', (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  if (isUserLoggedIn(cookie_user_id)) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: userData(cookie_user_id, isUserLoggedIn),
    };
    res.render("register", templateVars);
  };
});[];

app.post('/register', (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user = getUserByEmail(user_email);
  if (user_email === "" || user_password === "") {
    res.status(400).send("Error 400: email and/or password cannot be empty");
  } else if (user === null) {
    const user_id = generateRandomString();
    users[user_id] = { id: user_id, email: user_email, password: user_password };
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  } else if (user_email === users[user].email) {
    res.status(400).send("Error 400: User already exists.");
  } else {
    res.status(400).send("Error 400: unknown error with registration input");
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// urls
app.get("/urls", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  // debugging teste below
  console.log(`active user ${JSON.stringify(users[cookie_user_id])}`);
  console.log(`all users ${JSON.stringify(users)}`);
  console.log(`urlDatabase ${JSON.stringify(urlDatabase)}`);
  // debugging tests above
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const longURL = req.body.longURL;
  if (!isUserLoggedIn(cookie_user_id)) {
    res.status(401).send("Error 401: Cannot shorten URL. Please log in to shorten URLs.");
  } else {
    const urlID = generateRandomString();
    urlDatabase[urlID] = { urlID: urlID, longURL: longURL, userID: cookie_user_id };
    res.redirect(`/urls/${urlID}`);
  }
});

// new short URL
app.get("/urls/new", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  if (!isUserLoggedIn(cookie_user_id)) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: userData(cookie_user_id, isUserLoggedIn),
    };
    res.render("urls_new", templateVars);
  }
});

// short url in detail
app.get("/urls/:id", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const urlID = req.params.id;
  const longURL = urlDatabase[urlID].longURL;
  const templateVars = {
    user: userData(cookie_user_id, isUserLoggedIn),
    urlID: urlID,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const updatedURL = req.body.updatedLongURL;
  urlDatabase[urlID].longURL = updatedURL;
  res.redirect('/urls');
});

// short url - edit
app.post("/urls/:id/edit", (req, res) => {
  const urlID = req.params.id;
  res.redirect(`/urls/${urlID}`);
});

// short url - delete
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect('/urls');
});

// external redirect
app.get('/u/:id', (req, res) => {
  const urlID = req.params.id;
  if (isExistingShortUrl(urlID)) {
    const longURL = urlDatabase[urlID].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('Error 404: Short URL does not exist.');
  };
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});