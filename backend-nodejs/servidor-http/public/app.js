async function cargar() {
  const apiKey = document.getElementById("apiKey").value.trim();

  if (!apiKey) {
    alert("Ingresa la API KEY");
    return;
  }

  // --- TAREAS ---
  const tareasResp = await fetch("/api/tareas", {
    headers: { "x-api-key": apiKey }
  });

  if (!tareasResp.ok) {
    alert("Error cargando tareas");
    return;
  }

  const tareas = await tareasResp.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  tareas.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.titulo} [${t.prioridad}] - ${t.completada ? "✔️" : "❌"}`;
    lista.appendChild(li);
  });

  // --- ESTADÍSTICAS ---
  const statsResp = await fetch("/api/estadisticas", {
    headers: { "x-api-key": apiKey }
  });

  const statsEl = document.getElementById("stats");

  if (!statsResp.ok) {
    statsEl.textContent = "No autorizado o error al cargar estadísticas";
    return;
  }

  const stats = await statsResp.json();
  statsEl.textContent = JSON.stringify(stats, null, 2);
}
