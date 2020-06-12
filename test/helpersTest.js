/* eslint-disable space-before-function-paren */
const { assert } = require('chai');
const {
  getUserIDByEmail,
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  getHashedPassword,
  urlsForUser,
  updateURL,
  addURLtoDB,
  getStats,
  logVisit
} = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const testURlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' }
};

const testLogData = {
  d9ETam: [
    { timestamp: '2020-06-12T13:12:37.558Z', visitor_id: 'sQ8_4cg' },
    { timestamp: '2020-06-12T13:12:49.623Z', visitor_id: 'sQ8_4cg' }
  ],
  oDSLiS: [{ timestamp: '2020-06-12T13:12:28.939Z', visitor_id: 'sQ8_4cg' }],
  q7AbLs: [
    { timestamp: '2020-06-12T13:12:20.252Z', visitor_id: 'sQ8_4cg' },
    { timestamp: '2020-06-12T13:13:14.152Z', visitor_id: 'sQ8_4cg' },
    { timestamp: '2020-06-12T13:13:24.866Z', visitor_id: 'gB6_Dh4' },
    { timestamp: '2020-06-12T13:13:34.622Z', visitor_id: 'gB6_Dh4' }
  ]
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserIDByEmail(testUsers, 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined with invalid email', function () {
    const user = getUserIDByEmail(testUsers, 'fakeuser@example.com');
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

describe('generateRandomString', function () {
  it('should return a random string of n length', function () {
    const actualLength = generateRandomString(6).length;
    const expectedLength = 6;
    assert.strictEqual(actualLength, expectedLength);
  });
});

describe('getUserByID', function () {
  it('should return the user with the given ID', function () {
    const actualOutput = getUserByID(testUsers, 'user2RandomID');
    const expectedOutput = {
      id: 'user2RandomID',
      email: 'user2@example.com',
      password: 'dishwasher-funk'
    };
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe('addUserToDB', function () {
  it('should add a user object to the given user database', function () {
    const userDatabase = {};
    addUserToDB(userDatabase, 'user1234', 'xyz@yahoo.com', 'samplepassword');
    const expectedOutput = {
      user1234: {
        id: 'user1234',
        email: 'xyz@yahoo.com',
        password: 'samplepassword'
      }
    };

    assert.deepEqual(userDatabase, expectedOutput);
  });
});

describe('isEmailRegistered', function () {
  it('should return true if user with email is found', function () {
    assert.isTrue(isEmailRegistered(testUsers, 'user@example.com'));
  });

  it('should return false if user with email is not found', function () {
    assert.isFalse(isEmailRegistered(testUsers, 'user@yahoo.com'));
  });
});

describe('getHashedPassword', function () {
  it('should return saved hashed passport from the given users Db', function () {
    const actualOutput = getHashedPassword(testUsers, 'user@example.com');
    const expectedOutput = 'purple-monkey-dinosaur';
    assert.strictEqual(actualOutput, expectedOutput);
  });
});

describe('urlsForUser', function () {
  it('should return list of URLs assigned to given user in given URL Database', function () {
    const actualOutput = urlsForUser(testURlDatabase, 'userRandomID');
    const expectedOutput = {
      b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' }
    };
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe('updateURL', function () {
  it('should update the given short url with the new long URL in given database', function () {
    updateURL(testURlDatabase, 'b6UTxQ', 'http://www.lighthouselabs.com');
    const actualOutput = testURlDatabase['b6UTxQ'].longURL;
    const expectedOutput = 'http://www.lighthouselabs.com';
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe('addURLtoDB', function () {
  it('should add new short url to the given url database', function () {
    addURLtoDB(
      testURlDatabase,
      'http://www.yahoo.com',
      'abcdef',
      'User3Random'
    );
    const actualOutput = testURlDatabase['abcdef'];
    const expectedOutput = {
      longURL: 'http://www.yahoo.com',
      userID: 'User3Random'
    };
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe('getStats', function () {
  it('should return number of visits & unique visits from the given array containing log data', function () {
    const shortURLLogArray = testLogData['q7AbLs'];
    const actualOutput = getStats(shortURLLogArray);
    const expectedOutput = { count: 4, uniqueCount: 2 };
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe('logVisit', function () {
  it("should log the visit data to the given logging database (create new entry if it doesn't exists.", function () {
    logVisit('test_vis', 'tesurl', testLogData);
    const actualOutput = testLogData['tesurl'];
    assert.isArray(actualOutput);
  });

  it('should log the visit data to the given logging database (update existing entry if it exists.', function () {
    logVisit('test_vis', 'tesurl', testLogData);
    const actualOutput = testLogData['tesurl'];
    assert.lengthOf(actualOutput, 2, 'log entry for URL is now 2');
  });
});
