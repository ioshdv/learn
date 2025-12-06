// import db from '../db/connection.js'; // Uncomment when using a real DB
import { users } from "../data/users.js";

export function findUserById(id) {
  return new Promise((resolve, reject) => {

    // Example for real DB query (commented)
    /*
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else if (results.length === 0) reject(`User with id ${id} not found`);
      else resolve(results[0]);
    });
    */

    // Using mock data
    const user = users.find((u) => u.id === id);

    if (user) {
      resolve(user);
    } else {
      reject(`User with id ${id} not found`);
    }
  });
}
