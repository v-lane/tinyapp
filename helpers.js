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


const authenticateUser = ((users, email, password) => {
  if (!email || !password) {
    return { err: { code: 400, message: "Error 400: email and/or password cannot be empty" }, user: undefined };
  }
  const userObj = getUserByEmail(users, email) 
  if (userObj.err) {
    return userObj;
  }
  if (email !== userObj.user.email) {
    return { err: { code: 403, message: "Error 403: incorrect email" }, user: undefined };
  }
  if (password !== userObj.user.password) {
    return { err: { code: 403, message: "Error 403: incorrect password" }, user: undefined };
  }
  return { err: undefined, user: userObj.user };
});


const createNewUser = ((users, email, password) => {
  if (!email || !password) {
    return { err: { code: 400, message: "Error 400: email and/or password cannot be empty" }, user: undefined };
  }
  const userObj = getUserByEmail(users, email)
  if (userObj.user) {
    return { err: { code: 400, message: "Error 400: User already exists" }, user: undefined };
  }
  const id = generateRandomString();
  const newUser = { id, email, password };
  return {err: undefined, user: newUser}
})



/**
 * Returns boolean confirming if user_id value from cookies matches user in users object.
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
 * @param {string} id - shortURL ID
 * @returns {boolean}
 */
const isExistingShortUrl = function(id) {
  if (id === undefined) return false;
  if (urlDatabase[id] !== undefined) return true;
  return false;
};

/**
 * Returns object of urlIDs and associated object data for any urlIDs that contain the userID 'id' param. 
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
 * @param {string} urlID - urlID for short URL
 * @param {string} cookieUserID - userID for logged in user 
 * @returns {boolean}
 */
const isUserOwnsUrl = function(urls, urlID, cookieUserID) {
  if (urlID === undefined) return false;
  if (cookieUserID === urls[urlID].userID) return true;
  return false;
};





module.exports = { getUserByEmail, isUserLoggedIn, createNewUser, isExistingShortUrl, urlsForUser, isUserOwnsUrl, generateRandomString, authenticateUser };