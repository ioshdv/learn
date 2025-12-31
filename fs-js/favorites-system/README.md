# Favorites System – React

Minimal product management system implementing global state, favorites, caching, persistence, and cross-tab sync.

## Stack

**Frontend:** React (Create React App)
**State:** React Context + useReducer
**HTTP:** Axios
**Optional / Comparison:** Zustand, @tanstack/react-query
**Dev Env:** VS Code + WSL (Ubuntu)

## Features (Exercise Requirements)

* Global state management for products and favorites
* Product CRUD with loading and error handling
* Favorites system: add/remove favorites
* Favorites persist in `localStorage` across reloads and browser restarts
* Cross-tab synchronization of favorites using `storage` event
* Cache products in `localStorage` with 5-minute TTL
* Memoized components to prevent unnecessary re-renders

## Setup

```bash
cd favorites-system
npm install
npm start
```

Runs on:

[http://localhost:3000](http://localhost:3000)

## Usage

* View products on the main page
* Add or remove favorites using the button
* Favorites persist after page reloads
* Open multiple tabs to see cross-tab synchronization
* Cache automatically reduces API calls; expires after TTL

## Testing Features

* **Add/Remove Favorites:** Click the button on a product. Favorites persist across page reloads.
* **Cross-Tab Synchronization:** Open multiple tabs; adding/removing favorites updates all tabs.
* **Cache TTL:** Products are cached for 5 minutes. For testing, TTL can be shortened in `productService.js` or forced via `localStorage`.
* **Error Handling:** Disconnect API or change URL to simulate errors; error messages appear correctly.
* **Optimized Rendering:** Only updated components re-render when favorites change (check with React DevTools).

## Notes

* Products are fetched from a public fake store API
* All state and favorites are managed in memory and localStorage
* No backend or database integration (exercise scope)
* Focused strictly on state management, caching, and persistence.