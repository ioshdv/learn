const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const toggleBtn = document.getElementById("theme-toggle");

// Navbar lateral
hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Cambiar tema
toggleBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "light" ? "dark" : "light");
});
