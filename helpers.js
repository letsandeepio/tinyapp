const generateRandomString = (n) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUXYZ123456789';
  let random = '';
  while (random.length < n) {
    let randomAlpha = alphabet[Math.floor(Math.random() * alphabet.length)];
    random += Math.round(Math.random())
      ? randomAlpha
      : randomAlpha.toLowerCase();
  }
  return random;
};

const addURLtoDB = (db, longURL, shortURL, userID) => {
  db[shortURL] = { longURL, userID };
};

const getUserByID = (users, ID) => {
  return users[ID];
};

const addUserToDB = (users, id, email, password) => {
  users[id] = {
    id,
    email,
    password
  };
};

const isEmailRegistered = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) return true;
  }
  return false;
};

const getHashedPassword = (users, email) => {
  return Object.values(users).find((user) => user.email === email).password;
};

const getUserIDByEmail = (users, email) => {
  const user = Object.values(users).find((user) => user.email === email);
  return user ? user.id : undefined;
};

const urlsForUser = (database, id) => {
  return Object.keys(database).reduce((r, e) => {
    if (database[e].userID === id) r[e] = database[e];
    return r;
  }, {});
};

const updateURL = (db, shortURL, newURL) => {
  db[shortURL].longURL = newURL;
};

const getStats = (array) => {
  const count = array.length;
  const uniqueCount = caculateUniqueVisits(array, 'visitor_id');
  return { count, uniqueCount };
};

const caculateUniqueVisits = (array, attribute) => {
  let unique = [];
  for (const item of array) {
    if (!unique.includes(item[attribute])) unique.push(item[attribute]);
  }
  return unique.length;
};

module.exports = {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  getHashedPassword,
  getUserIDByEmail,
  urlsForUser,
  updateURL,
  addURLtoDB,
  getStats
};
