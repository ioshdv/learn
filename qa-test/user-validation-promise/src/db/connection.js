// Real DB module (PostgreSQL, commented)
// This module shows how to connect to a real PostgreSQL database.
// Currently, it is not active; the project uses mock data.

/*
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
  port: 5432 // default PostgreSQL port
});

client.connect(err => {
  if (err) {
    console.error('Error connecting to PostgreSQL DB:', err);
  } else {
    console.log('Connected to PostgreSQL DB successfully');
  }
});

export default client;
*/