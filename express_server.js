const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// data
const { urlDatabase, users } = require('./data');

//functions
const { getUserByEmail, isUserLoggedIn, createNewUser, isExistingShortUrl, urlsForUser, isUserOwnsUrl, generateRandomString, authenticateUser } = require('./helpers');


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
      user: {},
    };
    res.render("login", templateVars);
  };
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userObj = authenticateUser(users, email, password);
  if (userObj.err) {
    return res.status(userObj.err.code).send(userObj.err.message);
  }
  res.cookie("user_id", userObj.user.id);
  return res.redirect('/urls');
});

// register
app.get('/register', (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  if (isUserLoggedIn(users, cookie_user_id)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: {},
  };
  return res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const userObj = createNewUser(users, email, password);
  if (userObj.err) {
    return res.status(userObj.err.code).send(userObj.err.message);
  }
  const newUserID = userObj.user.id;
  users[newUserID] = userObj.user;
  res.cookie("user_id", newUserID);
  return res.redirect('/urls');
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// urls
app.get("/urls", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  // debugging tests below
  console.log(`active user ${JSON.stringify(users[cookie_user_id])}`);
  console.log(`all users ${JSON.stringify(users)}`);
  console.log(`urlDatabase ${JSON.stringify(urlDatabase)}`);
  // debugging tests above

  if (!isUserLoggedIn(users, cookie_user_id)) {
    return res.status(401).send("Error 401: Please log in or register to access page.");
  };
  const userURLS = urlsForUser(urlDatabase, cookie_user_id);
  //test below
  console.log(`userURLS ${JSON.stringify(userURLS)}`);
  //test above
  const user = users[cookie_user_id];
  const templateVars = {
    user: user,
    urls: userURLS
  };
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const longURL = req.body.longURL;
  if (!isUserLoggedIn(users, cookie_user_id)) {
    return res.status(401).send("Error 401: Cannot shorten URL. Please log in to shorten URLs.");
  }
  const urlID = generateRandomString();
  urlDatabase[urlID] = { urlID: urlID, longURL: longURL, userID: cookie_user_id };
  return res.redirect(`/urls/${urlID}`);
});

// new short URL
app.get("/urls/new", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  if (!isUserLoggedIn(users, cookie_user_id)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[cookie_user_id],
  };
  return res.render("urls_new", templateVars);
});

// short url in detail
app.get("/urls/:id", (req, res) => {
  const cookie_user_id = req.cookies["user_id"];
  const urlID = req.params.id;
  if (!isUserLoggedIn(users, cookie_user_id)) {
    res.status(401).send("Error 401: Please log in to access URL details.");
  }
  if (!isUserOwnsUrl(urlDatabase, urlID, cookie_user_id)) {
    res.status(401).send("Error 401: Access denied. User does not own URL.");
  }
  const longURL = urlDatabase[urlID].longURL;
  const templateVars = {
    user: users[cookie_user_id],
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