const http = require('http');
const { URL } = require('url');

const users = new Map(); // email -> password
const sessions = new Map(); // sid -> email

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function readCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const [k, ...v] = part.trim().split('=');
    if (!k) return acc;
    acc[k] = decodeURIComponent(v.join('=') || '');
    return acc;
  }, {});
}

function setCookie(res, key, value) {
  res.setHeader('Set-Cookie', `${key}=${encodeURIComponent(value)}; Path=/; HttpOnly`);
}

function htmlPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    body{font-family:system-ui,Arial;margin:24px;max-width:720px}
    input,button{display:block;margin:10px 0;padding:10px;width:100%;max-width:420px}
    .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
    .card{border:1px solid #ddd;border-radius:8px;padding:12px;max-width:420px}
    .nav{display:flex;gap:12px;margin-bottom:16px}
    .nav button{max-width:200px}
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

const pages = {
  '/': () =>
    htmlPage(
      'Home',
      `<h1>E-commerce Mock</h1>
       <p>Use: /register /login /products /checkout</p>`
    ),

  '/register': () =>
    htmlPage(
      'Register',
      `<h1>Register</h1>
       <div class="card">
         <input data-cy="register-email" placeholder="Email"/>
         <input data-cy="register-password" placeholder="Password" type="password"/>
         <input data-cy="register-confirm-password" placeholder="Confirm Password" type="password"/>
         <button data-cy="register-submit">Create account</button>

         <div data-cy="register-success" style="display:none">Registered</div>
         <div data-cy="register-error" style="display:none"></div>
       </div>

       <script>
         const email = document.querySelector('[data-cy=register-email]');
         const pass = document.querySelector('[data-cy=register-password]');
         const conf = document.querySelector('[data-cy=register-confirm-password]');
         const btn  = document.querySelector('[data-cy=register-submit]');
         const ok   = document.querySelector('[data-cy=register-success]');
         const err  = document.querySelector('[data-cy=register-error]');

         btn.addEventListener('click', async () => {
           ok.style.display = 'none';
           err.style.display = 'none';
           err.textContent = '';

           if (pass.value !== conf.value) {
             err.textContent = 'Passwords do not match';
             err.style.display = 'block';
             return;
           }

           const r = await fetch('/api/users', {
             method: 'POST',
             headers: {'Content-Type':'application/json'},
             body: JSON.stringify({ email: email.value, password: pass.value })
           });

           if (r.status === 201) {
             ok.style.display = 'block';
             return;
           }

           const data = await r.json().catch(() => ({}));
           err.textContent = data.message || 'Registration failed';
           err.style.display = 'block';
         });
       </script>`
    ),

  '/login': () =>
    htmlPage(
      'Login',
      `<div class="nav">
         <button data-cy="nav-account" type="button">Account</button>
         <button data-cy="logout" type="button">Logout</button>
       </div>

       <h1>Login</h1>
       <div class="card">
         <input data-cy="login-email" placeholder="Email"/>
         <input data-cy="login-password" placeholder="Password" type="password"/>
         <button data-cy="login-submit">Login</button>

         <div data-cy="login-success" style="display:none">Logged in</div>
       </div>

       <script>
         const email = document.querySelector('[data-cy=login-email]');
         const pass  = document.querySelector('[data-cy=login-password]');
         const btn   = document.querySelector('[data-cy=login-submit]');
         const ok    = document.querySelector('[data-cy=login-success]');

         const accountMenu = document.querySelector('[data-cy=nav-account]');
         const logoutBtn = document.querySelector('[data-cy=logout]');

         btn.addEventListener('click', async () => {
           ok.style.display = 'none';
           const r = await fetch('/api/login', {
             method: 'POST',
             headers: {'Content-Type':'application/json'},
             body: JSON.stringify({ email: email.value, password: pass.value })
           });

           if (r.status === 200) {
             ok.style.display = 'block';
           }
         });

         accountMenu.addEventListener('click', () => {});

         logoutBtn.addEventListener('click', async () => {
           await fetch('/api/logout', { method: 'POST' });
           window.location.href = '/login';
         });
       </script>`
    ),

  '/products': () =>
    htmlPage(
      'Products',
      `<h1>Products</h1>

       <div class="row">
         <button data-cy="open-cart" style="max-width:200px">Open cart</button>
         <button data-cy="go-checkout" style="max-width:200px">Go to checkout</button>
       </div>

       <input data-cy="product-search" placeholder="Search product..."/>

       <div class="card" data-cy="product-card">
         <h3>Laptop</h3>
         <button data-cy="add-to-cart">Add to cart</button>
       </div>

       <script>
         let cartCount = 0;
         const add = document.querySelector('[data-cy=add-to-cart]');
         const openCart = document.querySelector('[data-cy=open-cart]');
         const goCheckout = document.querySelector('[data-cy=go-checkout]');

         add.addEventListener('click', () => { cartCount += 1; });
         openCart.addEventListener('click', () => {});
         goCheckout.addEventListener('click', () => { window.location.href = '/checkout'; });
       </script>`
    ),

  '/checkout': () =>
    htmlPage(
      'Checkout',
      `<h1>Checkout</h1>
       <div class="card">
         <input data-cy="shipping-fullname" placeholder="Full name"/>
         <input data-cy="shipping-address" placeholder="Address"/>
         <input data-cy="shipping-city" placeholder="City"/>
         <input data-cy="shipping-zip" placeholder="ZIP"/>
         <button data-cy="place-order">Place order</button>

         <div data-cy="order-confirmation" style="display:none">Order confirmed</div>
       </div>

       <script>
         const btn = document.querySelector('[data-cy=place-order]');
         const ok  = document.querySelector('[data-cy=order-confirmation]');
         btn.addEventListener('click', () => { ok.style.display = 'block'; });
       </script>`
    )
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const path = urlObj.pathname;

  if (req.method === 'POST' && path === '/api/users') {
    const body = await parseBody(req);
    const email = String(body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return json(res, 400, { message: 'Missing email or password' });
    }
    if (users.has(email)) {
      return json(res, 409, { message: 'Email already exists' });
    }
    users.set(email, password);
    return json(res, 201, { message: 'Created' });
  }

  if (req.method === 'POST' && path === '/api/login') {
    const body = await parseBody(req);
    const email = String(body.email || '').trim();
    const password = String(body.password || '').trim();

    if (users.get(email) !== password) {
      return json(res, 401, { message: 'Invalid credentials' });
    }

    const sid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessions.set(sid, email);
    setCookie(res, 'sid', sid);
    return json(res, 200, { message: 'Logged in' });
  }

  if (req.method === 'POST' && path === '/api/logout') {
    const cookies = readCookies(req);
    if (cookies.sid) sessions.delete(cookies.sid);
    setCookie(res, 'sid', '');
    return json(res, 200, { message: 'Logged out' });
  }

  if (req.method === 'GET') {
    if (pages[path]) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(pages[path]());
    }
    return notFound(res);
  }

  notFound(res);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Mock app running on http://localhost:3000');
});