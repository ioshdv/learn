document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnAdmin = document.getElementById('logout-btn-admin');
    const passInput = document.getElementById('pass');
    const commentBtn = document.getElementById('btn-enviar-comentario');
    const commentInput = document.getElementById('input-comentario');

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnAdmin) logoutBtnAdmin.addEventListener('click', handleLogout);
    
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    if (commentBtn && commentInput) {
        const productId = commentInput.getAttribute('data-product-id');
        commentBtn.addEventListener('click', () => enviarComentario(productId));
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarComentario(productId);
        });
    }

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = '/images/logo.png';
            this.style.opacity = '0.5';
        });
    });

    window.addEventListener('load', () => {
        const perf = window.performance.timing;
        const pageLoadTime = perf.loadEventEnd - perf.navigationStart;
        console.log(pageLoadTime);
    });
});

async function handleLogin() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    if(!user || !pass) return;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user, pass })
    });
    
    if(res.ok) location.reload();
    else alert("Error");
}

async function handleLogout() {
    const res = await fetch('/api/logout', { method: 'POST' });
    if(res.ok) location.href = '/';
}

async function enviarComentario(id) {
    const input = document.getElementById('input-comentario');
    const texto = input.value;
    if(!texto) return;

    const res = await fetch(`/api/productos/${id}/comentarios`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ texto })
    });
    
    if(res.ok) {
        input.value = '';
        location.reload();
    }
}