"use strict";

// Datos ficticios
const SERVICES = [
  { id: "s1", name: "Diagnóstico", desc: "Revisión para identificar la causa de la falla." },
  { id: "s2", name: "Reparación", desc: "Corrección de fallas de hardware o software." },
  { id: "s3", name: "Mantenimiento preventivo", desc: "Limpieza y revisión general del equipo." },
  { id: "s4", name: "Instalación y configuración", desc: "Sistema, programas, red o dispositivos." },
  { id: "s5", name: "Recuperación de información", desc: "Evaluación para intentar recuperar archivos." }
];
const DEVICES = [
  { id: "d1", name: "Laptop" },
  { id: "d2", name: "PC de escritorio" },
  { id: "d3", name: "Celular" },
  { id: "d4", name: "Tablet" },
  { id: "d5", name: "Impresora" },
  { id: "d6", name: "Router o Wi-Fi" }
];
const MODES = [
  { id: "m1", name: "En local", desc: "Llevas el equipo al taller." },
  { id: "m2", name: "A domicilio", desc: "El técnico va donde estás." }
];
const EXAMPLES = ["No enciende", "Funciona muy lento", "Pantalla dañada", "No carga", "Se calienta mucho", "No conecta a Wi-Fi", "Hace ruidos extraños"];
const MAX = 300;

const state = { service: null, device: null, mode: null, issue: "" };
const $ = id => document.getElementById(id);
const pick = (list, id) => list.find(x => x.id === id);

// ---------- Render ----------
function cards(list, group) {
  return list.map(x => `
    <label class="card">
      <input type="radio" name="${group}" value="${x.id}">
      <span class="top">${x.name}</span>
      ${x.desc ? `<span class="sub">${x.desc}</span>` : ""}
    </label>`).join("");
}

function renderStatic() {
  $("services").innerHTML = cards(SERVICES, "servicio");
  $("devices").innerHTML = cards(DEVICES, "equipo");
  $("modes").innerHTML = cards(MODES, "modalidad");
  $("chips").innerHTML = EXAMPLES.map(t => `<button type="button" class="chip" data-t="${t}">${t}</button>`).join("");
}

function modeNote() {
  if (state.mode === "m2") return "No pedimos tu dirección exacta. En un servicio real, esos detalles se coordinarían aparte con el equipo.";
  if (state.mode === "m1") return "En un servicio real, el equipo sería evaluado en el taller.";
  return "";
}

function summaryText() {
  const s = pick(SERVICES, state.service), d = pick(DEVICES, state.device), m = pick(MODES, state.mode);
  const issue = state.issue.trim();
  return [
    "PUNTO TÉCNICO — CONSULTA DE DEMOSTRACIÓN",
    "(Servicio ficticio: no es una solicitud real ni se envió a nadie)",
    "",
    `Servicio: ${s ? s.name : "— pendiente"}`,
    `Equipo: ${d ? d.name : "— pendiente"}`,
    `Modalidad: ${m ? m.name : "— pendiente"}`,
    "Falla descrita:",
    issue ? issue : "— pendiente",
    "",
    "Diagnóstico, precio y plazo: requieren evaluación del equipo por parte del técnico."
  ].join("\n");
}

function missingList() {
  const m = [];
  if (!state.service) m.push("servicio");
  if (!state.device) m.push("equipo");
  if (state.issue.trim().length < 5) m.push("descripción de la falla");
  if (!state.mode) m.push("modalidad");
  return m;
}

function render() {
  const m = missingList();
  $("summary").textContent = summaryText();
  $("missing").textContent = m.length ? "Falta: " + m.join(", ") + "." : "Todo listo para copiar.";
  $("copy").disabled = m.length > 0;
  $("reset").disabled = !(state.service || state.device || state.mode || state.issue.trim());
  $("mode-note").textContent = modeNote();
  $("count").textContent = `${state.issue.length} / ${MAX}`;
}

// ---------- Eventos ----------
document.addEventListener("change", e => {
  const n = e.target.name;
  if (n === "servicio") state.service = e.target.value;
  else if (n === "equipo") state.device = e.target.value;
  else if (n === "modalidad") state.mode = e.target.value;
  else return;
  $("status").textContent = "";
  render();
});

$("issue").addEventListener("input", () => {
  state.issue = $("issue").value;
  $("status").textContent = "";
  render();
});

$("chips").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  const base = state.issue.trim().replace(/[.,;\s]+$/, "");
  state.issue = (base ? base + ". " : "") + b.dataset.t + ".";
  if (state.issue.length > MAX) state.issue = state.issue.slice(0, MAX);
  $("issue").value = state.issue;
  $("status").textContent = "";
  render();
});

$("reset").addEventListener("click", () => {
  Object.assign(state, { service: null, device: null, mode: null, issue: "" });
  document.querySelectorAll("input[type=radio]").forEach(r => { r.checked = false; });
  $("issue").value = "";
  $("status").textContent = "Consulta reiniciada.";
  render();
});

$("copy").addEventListener("click", async () => {
  const text = summaryText();
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    // Respaldo si el navegador bloquea el portapapeles en archivos locales
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }
  $("status").textContent = ok
    ? "Resumen copiado. Recuerda: es solo una demo, no se envió nada."
    : "No se pudo copiar. Selecciona el texto del resumen y usa Ctrl + C.";
});

renderStatic();
render();
