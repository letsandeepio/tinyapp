const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1234'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' }
};

const logDB = {};

module.exports = { users, urlDatabase, logDB };
