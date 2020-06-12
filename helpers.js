//generate random string including alpha & numbers with n length
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

//add given url to the given url database
const addURLtoDB = (db, longURL, shortURL, userID, dateCreated) => {
  db[shortURL] = { longURL, userID, dateCreated };
};

//return user object with the given id
const getUserByID = (users, ID) => {
  return users[ID];
};

//add new user to the database
const addUserToDB = (users, id, email, password) => {
  users[id] = {
    id,
    email,
    password
  };
};

//check if user with the given email exists in the database or not
const isEmailRegistered = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) return true;
  }
  return false;
};

//return user password (which is already hashed &stored) in database
const getHashedPassword = (users, email) => {
  return Object.values(users).find((user) => user.email === email).password;
};

//find user ID by given email in database
const getUserIDByEmail = (users, email) => {
  const user = Object.values(users).find((user) => user.email === email);
  return user ? user.id : undefined;
};

//filter out the database for url belongig to this user
//then attach the stats (analytics object for each url) to each of the url (count & unique count)
const urlsForUser = (database, id, logDB) => {
  return Object.keys(database).reduce((r, e) => {
    if (database[e].userID === id) {
      r[e] = { ...database[e], ...getStats(logDB[e]) };
    }
    return r;
  }, {});
};

//update the given shortURl to the new given Long url
const updateURL = (db, shortURL, newURL) => {
  db[shortURL].longURL = newURL;
};

//return an object containing count & uniqueCount for the given log data in array
const getStats = (array) => {
  const count = array.length;
  const uniqueCount = caculateUniqueVisits(array, 'visitor_id');
  return { count, uniqueCount };
};

//utitliy helper function to calculate unique visits - uses in getStats
const caculateUniqueVisits = (array, attribute) => {
  let unique = [];
  for (const item of array) {
    if (!unique.includes(item[attribute])) unique.push(item[attribute]);
  }
  return unique.length;
};

//make a visitor entry log in the log database
const logVisit = (visitorID, shortURL, logDatabase) => {
  if (!logDatabase[shortURL]) logDatabase[shortURL] = [];
  logDatabase[shortURL].push({
    timestamp: new Date(),
    visitor_id: visitorID
  });
};

//add given URL to DB
const addURLtoLogDB = (loggingDatabase, shortURL) => {
  loggingDatabase[shortURL] = [];
};

//copied from stackoverflow to format the date properly for display
const formatDate = (date) => {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
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
  getStats,
  logVisit,
  addURLtoLogDB,
  formatDate
};
