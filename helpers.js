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

const validateUser = (users, email, password) => {
  return (
    Object.values(users).find((user) => user.email === email).password ===
    password
  );
};

const getUserIDByEmail = (users, email) => {
  return Object.values(users).find((user) => user.email === email).id;
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

module.exports = {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  validateUser,
  getUserIDByEmail,
  urlsForUser,
  updateURL
};
