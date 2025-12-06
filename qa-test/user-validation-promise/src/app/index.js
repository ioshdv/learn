import { findUserById } from '../services/userService.js';

async function showUser(id) {
  try {
    const user = await findUserById(id);
    console.log('User found:', user);
  } catch (error) {
    console.log('Error:', error);
  }
}

// Example calls
showUser(2); // Existing user
// showUser(10); // Non-existing user
