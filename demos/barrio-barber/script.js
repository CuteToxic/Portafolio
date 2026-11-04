"use strict";

// Datos ficticios
const SERVICES = [
  { id: "s1", name: "Corte clásico", price: 25, min: 30, desc: "Tijera y máquina, con acabado a navaja." },
  { id: "s2", name: "Corte + barba", price: 40, min: 50, desc: "Corte completo y perfilado de barba." },
  { id: "s3", name: "Perfilado de barba", price: 18, min: 20, desc: "Diseño y definición de contornos." },
  { id: "s4", name: "Afeitado con toalla caliente", price: 30, min: 30, desc: "Afeitado tradicional con navaja." },
  { id: "s5", name: "Corte para niño", price: 20, min: 25, desc: "Hasta 12 años." }
];
const BARBERS = [
  { id: "b0", name: "Cualquier barbero", desc: "El que esté libre" },
  { id: "b1", name: "Rodrigo", desc: "Cortes clásicos" },
  { id: "b2", name: "Mateo", desc: "Barba y navaja" },
  { id: "b3", name: "Lucho", desc: "Degradados" }
];
const OPEN = 10 * 60;   // 10:00
const CLOSE = 20 * 60;  // 20:00
const STEP = 30;        // minutos entre horarios
const MAX_DAYS = 60;

const state = { service: null, barber: null, date: null, time: null, name: "" };
const $ = id => document.getElementById(id);

// ---------- Utilidades de fecha ----------
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const todayISO = () => iso(new Date());
const maxISO = () => { const d = new Date(); d.setDate(d.getDate() + MAX_DAYS); return iso(d); };
const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const longDate = s => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const money = n => "S/ " + n.toFixed(2);
const svc = () => SERVICES.find(s => s.id === state.service);
const brb = () => BARBERS.find(b => b.id === state.barber);

function refreshDateLimits() {
  $("date").min = todayISO();
  $("date").max = maxISO();
}

// ---------- Render ----------
function renderChoices() {
  $("services").innerHTML = SERVICES.map(s => `
    <label class="card">
      <input type="radio" name="servicio" value="${s.id}">
      <span class="top"><span>${s.name}</span><span class="price">${money(s.price)}</span></span>
      <span class="sub">${s.min} min · ${s.desc}</span>
    </label>`).join("");
  $("barbers").innerHTML = BARBERS.map(b => `
    <label class="card">
      <input type="radio" name="barbero" value="${b.id}">
      <span class="top"><span>${b.name}</span></span>
      <span class="sub">${b.desc}</span>
    </label>`).join("");
}

function renderSlots() {
  const box = $("slots");
  if (!state.service || !state.date) {
    box.innerHTML = `<p class="note">${!state.service ? "Elige un servicio" : "Elige una fecha"} para ver horarios de ejemplo.</p>`;
    return;
  }
  const dur = svc().min;
  const isToday = state.date === todayISO();
  const now = nowMinutes();
  if (state.time !== null && (state.time + dur > CLOSE || (isToday && state.time <= now))) state.time = null;
  let html = "", usable = 0;
  for (let s = OPEN; s + dur <= CLOSE; s += STEP) {
    const past = isToday && s <= now;
    if (!past) usable++;
    html += `<button type="button" class="slot" data-time="${s}" aria-pressed="${state.time === s}" ${past ? "disabled" : ""}>${hm(s)}</button>`;
  }
  box.innerHTML = html + (usable ? "" : `<p class="note">Ya no quedan horarios de ejemplo hoy. Prueba con otra fecha.</p>`);
  if (state.time !== null && (state.time + dur > CLOSE || (isToday && state.time <= now))) state.time = null;
}

function summaryText() {
  const s = svc(), b = brb();
  return [
    "BARRIO BARBER — SOLICITUD DE DEMOSTRACIÓN",
    "(Barbería ficticia: no es una reserva ni hay confirmación)",
    "",
    `Cliente: ${state.name.trim() ? state.name.trim() + " (nombre ficticio)" : "— pendiente"}`,
    `Servicio: ${s ? s.name : "— pendiente"}`,
    `Duración: ${s ? s.min + " min" : "—"}`,
    `Precio: ${s ? money(s.price) : "—"}`,
    `Barbero: ${b ? b.name : "— pendiente"}`,
    `Fecha: ${state.date ? longDate(state.date) : "— pendiente"}`,
    `Hora: ${state.time !== null ? hm(state.time) + " – " + hm(state.time + s.min) : "— pendiente"}`
  ].join("\n");
}

function missingList() {
  const m = [];
  if (!state.service) m.push("servicio");
  if (!state.barber) m.push("barbero");
  if (!state.date) m.push("fecha");
  if (state.date && state.time === null) m.push("hora");
  if (!state.name.trim()) m.push("nombre ficticio");
  return m;
}

function renderSummary() {
  const m = missingList();
  $("summary").textContent = summaryText();
  $("missing").textContent = m.length ? "Falta: " + m.join(", ") + "." : "Todo listo para copiar.";
  $("copy").disabled = m.length > 0;
  const any = state.service || state.barber || state.date || state.name.trim();
  $("reset").disabled = !any;
}

// ---------- Eventos ----------
document.addEventListener("change", e => {
  if (e.target.name === "servicio") { state.service = e.target.value; renderSlots(); }
  if (e.target.name === "barbero") state.barber = e.target.value;
  $("status").textContent = "";
  renderSummary();
});

$("date").addEventListener("change", () => {
  const v = $("date").value;
  $("status").textContent = "";
  if (!v) { state.date = null; state.time = null; $("date-err").textContent = ""; }
  else if (v < todayISO()) {
    $("date-err").textContent = "Esa fecha ya pasó. Elige hoy o una fecha futura.";
    $("date").value = ""; state.date = null; state.time = null;
  } else if (v > maxISO()) {
    $("date-err").textContent = `Elige una fecha dentro de los próximos ${MAX_DAYS} días.`;
    $("date").value = ""; state.date = null; state.time = null;
  } else {
    $("date-err").textContent = "";
    if (state.date !== v) state.time = null;
    state.date = v;
  }
  renderSlots();
  renderSummary();
});

$("slots").addEventListener("click", e => {
  const b = e.target.closest(".slot");
  if (!b || b.disabled) return;
  state.time = Number(b.dataset.time);
  document.querySelectorAll(".slot").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  $("status").textContent = "";
  renderSummary();
});

$("name").addEventListener("input", () => {
  state.name = $("name").value;
  $("status").textContent = "";
  renderSummary();
});

$("sample").addEventListener("click", () => {
  $("name").value = "Cliente Demo";
  state.name = "Cliente Demo";
  renderSummary();
});

$("reset").addEventListener("click", () => {
  Object.assign(state, { service: null, barber: null, date: null, time: null, name: "" });
  document.querySelectorAll('input[type=radio]').forEach(r => { r.checked = false; });
  $("date").value = "";
  $("name").value = "";
  $("date-err").textContent = "";
  $("status").textContent = "Selección cancelada.";
  renderSlots();
  renderSummary();
});

$("copy").addEventListener("click", async () => {
  refreshDateLimits();
  // Revalida por si la página quedó abierta pasada la medianoche
  if (state.date && state.date < todayISO()) {
    state.date = null; state.time = null; $("date").value = "";
    $("date-err").textContent = "La fecha elegida ya pasó. Elige otra.";
    renderSlots(); renderSummary();
    return;
  }
  renderSlots(); renderSummary();
  if (missingList().length) { $("status").textContent = "Revisa la fecha y el horario antes de copiar."; return; }
  const text = summaryText();
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }
  $("status").textContent = ok
    ? "Resumen copiado. Recuerda: es solo una demo, no hay reserva."
    : "No se pudo copiar. Selecciona el texto del resumen y usa Ctrl + C.";
});

refreshDateLimits();
renderChoices();
renderSlots();
renderSummary();

// Flujo de cinco pasos. Los datos se mantienen solo en esta página.
let wizardStage = 0;
const wizardSections = [...document.querySelectorAll('.step'), document.querySelector('.panel')];
function showWizardStage(n) {
 wizardStage=n;
 wizardSections.forEach((el,i)=>el.hidden=i!==n);
 document.querySelectorAll('[data-stage]').forEach((b,i)=>{b.setAttribute('aria-current',i===n?'step':'false');b.disabled=i>n;});
 $('wizard-progress').textContent=String(n+1).padStart(2,'0')+' / 05';
 $('wizard-prev').hidden=n===0;
 $('wizard-next').hidden=n===4;
 $('wizard-next').textContent=n===3?'Ver resumen →':'Continuar →';
 $('wizard-error').textContent='';
 const heading=wizardSections[n].querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});
}
$('wizard-next').addEventListener('click',()=>{
 renderSlots();renderSummary();
 const errors=[!state.service?'Elige un servicio para continuar.':'',!state.barber?'Elige un barbero para continuar.':'',(!state.date||state.time===null)?'Elige una fecha y un horario válidos.':'',!state.name.trim()?'Escribe un nombre ficticio o usa el de ejemplo.':''];
 if(errors[wizardStage]){$('wizard-error').textContent=errors[wizardStage];return;}
 showWizardStage(Math.min(4,wizardStage+1));
});
$('wizard-prev').addEventListener('click',()=>showWizardStage(Math.max(0,wizardStage-1)));
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>showWizardStage(Number(b.dataset.stage))));
$('reset').addEventListener('click',()=>showWizardStage(0));
showWizardStage(0);
