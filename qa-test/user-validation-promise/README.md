# JavaScript Promise and Error Handling Exercise

## 1. Overview
This exercise is designed to practice basic handling of Promises and error management in JavaScript.
The project is intentionally simple and structured in a clean, scalable way, following standard practices used in QA Automation environments.
Its purpose is to demonstrate basic concepts related to:
- Creating a Promise
- Handling resolve and reject
- Managing errors using try/catch
- Consuming asynchronous operations with async/await/await and reject. 

## 2. Exercise Requirements
The following requirements were provided and implemented in this project:
- Simulate user validation using a Promise.
- Create a function called buscarUsuarioPorId(id) that returns a Promise.
- The function must search for the user inside a fake "database" (an array of user objects).
- If the user exists, the Promise must resolve with user data.
- If the user is not found, the Promise must reject with an error message.
- Consume that Promise using async/await inside a function called mostrarUsuario.
- Use try/catch to properly handle errors.

## 3. Project Structure

user-validation-promise/
├── package.json # Project configuration and scripts
├── README.md # Documentation
└── src/
    ├── app/
    │   └── index.js # Application entry point
    ├── data/
    │   └── users.js # Mocked user data
    ├── services/
    │   └── userService.js # Business logic for user lookup
    └── db/
        └── connection.js





## 4. Installation
---bash
npm install

## 5. Running the Exercise
To execute the example:
 --- bash
node src/app/index.js

Expected output:
User found: { id: 2, name: 'Luis' }

If the user does not exist, expected output:

Error: User not found
