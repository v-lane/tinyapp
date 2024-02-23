const bcrypt = require("bcryptjs");

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
 * Verifies if user exists in database by checking if email exists. Returns user object containing error and user details. 
 * @param {object} users - object with all users data
 * @param {string} email - email to check against
 * @returns {object} - contains error and user data
 */
const getUserByEmail = ((users, email) => {
  if (!email) {
    return { err: { code: 400, message: "Error 400: email cannot be empty" }, user: undefined };
  }
  for (const user in users) {
    if (users[user].email === email) {
      return { err: undefined, user: users[user] };
    }
  }
  return { err: { code: 403, message: "Error 403: user not found" }, user: undefined };
});

/**
 * Verifies if login details match stored user login details. Returns user object containing error and user details. 
 * @param {object} users - object with all users data
 * @param {string} email - email to check against user data
 * @param {string} password - password to check against user data
 * @returns {object} - contains error and user data
 */
const authenticateUser = ((users, email, password) => {
  if (!email || !password) {
    return { err: { code: 400, message: "Error 400: email and/or password cannot be empty" }, user: undefined };
  }
  const userObj = getUserByEmail(users, email);
  if (userObj.err) {
    return userObj;
  }
  if (email !== userObj.user.email) {
    return { err: { code: 403, message: "Error 403: incorrect email" }, user: undefined };
  }
  if (!bcrypt.compareSync(password, userObj.user.password)){
    return { err: { code: 403, message: "Error 403: incorrect password" }, user: undefined };
  }
  return { err: undefined, user: userObj.user };
});

/**
 * Verifies if user account exists. If not, creates new user object. Returns user object containing error and user details. 
 * @param {object} users - object with all users data
 * @param {string} email - email to check against user data
 * @param {string} password - password to check against user data
 * @returns {object} - contains error and user data
 */
const createNewUser = ((users, email, password) => {
  if (!email || !password) {
    return { err: { code: 400, message: "Error 400: email and/or password cannot be empty" }, user: undefined };
  }
  const hashedPass = bcrypt.hashSync(password, 10);
  const userObj = getUserByEmail(users, email);
  if (userObj.user) {
    return { err: { code: 400, message: "Error 400: User already exists" }, user: undefined };
  }
  const id = generateRandomString();
  const newUser = { id, email, password: hashedPass };
  return { err: undefined, user: newUser };
});

/**
 * Returns boolean confirming if user_id value from cookies matches user in users object.
 * @param {object} users - object with all users data
 * @param {string} cookie_id - user_id value from cookies
 * @returns {boolean} 
 */
const isUserLoggedIn = function(users, cookie_id) {
  if (cookie_id === undefined) return false;
  if (users[cookie_id]) return true;
  return false;
};


// URL related functions

/**
 * Returns boolean confirming if id value exists in URL database 
 * @param {object} urls - object with all saved url data
 * @param {string} id - shortURL ID
 * @returns {boolean}
 */
const isExistingShortUrl = function(urls, id) {
  if (id === undefined) return false;
  if (urls[id] !== undefined) return true;
  return false;
};

/**
 * Returns object of urlIDs and associated object data for any urlIDs that contain the userID 'id' param. 
 * @param {object} urls - object with all saved url data
 * @param {string} id - userID 
 * @returns {object} 
 */
const urlsForUser = function(urls, id) {
  const returnObj = {};
  if (typeof id !== "string") return returnObj;
  for (const urlID in urls) {
    if (id === urls[urlID].userID)
      returnObj[urlID] = urls[urlID];
  }
  return returnObj;
};

/**
 * Return true if urlID is owned by logged-in user, otherwise returns false.
 * @param {object} urls - object with all saved url data
 * @param {string} urlID - urlID for short URL
 * @param {string} cookieUserID - userID for logged in user 
 * @returns {boolean}
 */
const isUrlOwnedByUser = function(urls, urlID, cookieUserID) {
  if (!urlID || !cookieUserID) return false;
  if (cookieUserID === urls[urlID].userID) return true;
  return false;
};


module.exports = { isUserLoggedIn, createNewUser, isExistingShortUrl, urlsForUser, isUrlOwnedByUser, generateRandomString, authenticateUser };