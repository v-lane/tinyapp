const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const userObj = getUserByEmail(testUsers, "user@example.com");
    const user = userObj.user;
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id,expectedUserID)
  });
  it('should return undefined with non-existent email', () => {
    const userObj = getUserByEmail(testUsers, "wrongemail@example.com");
    const user = userObj.user;
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID); 
  })
});

