const fs = require('fs');
const path = require('path');
const dbFile = path.join(__dirname, '../../db.json');

exports.get = () => {
  if (!fs.existsSync(dbFile)) {
    const initialData = { 
      posts: [], 
      comments: [], 
      users: [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "autor", password: "autor123", role: "author" }
      ] 
    };
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
};

exports.save = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};