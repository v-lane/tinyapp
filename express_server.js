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
  }
};

// returns string of 6 pseudo-random alphanumeric characters
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let x = 0;
  let randomString = "";
  while (x < 6) {
    randomString += (characters[Math.floor(Math.random() * 62)]);
    x += 1;
  }
  return randomString;
}

// home
app.get("/", (req, res) => {
  // recommended by Nally for debugging
  console.log(`users ${JSON.stringify(users)}`);
  res.send("Hello!");
});

// login
app.post("/login", (req, res) => {
  const username = req.body.username;
  if (username !== "") {
    res.cookie("username", username);
    res.redirect('/urls');
  }
  // Likely should add error message to client that username cannot be empty
  res.redirect('/urls');
});

// register
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  // should add test that username does not always exist in POST /register
  res.render("register", templateVars);
});

app.post('/register' , (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user_id = generateRandomString();
  users[user_id] = {id: user_id, email: user_email, password: user_password}
  res.cookie("user_id", user_id);
  res.redirect('/urls');
})

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// urls
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// short url in detail
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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