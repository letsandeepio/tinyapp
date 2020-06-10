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
    console.log(users[user].email + '===' + email);
    if (users[user].email === email) return true;
  }
  return false;
};

const validate = (users, email, password) => {
  return (
    Object.values(users).find((user) => user.email === email).password ===
    password
  );
};

const getUserByEmail = (users, email) => {
  return Object.values(users).find((user) => user.email === email);
};

module.exports = {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  validate,
  getUserByEmail
};
