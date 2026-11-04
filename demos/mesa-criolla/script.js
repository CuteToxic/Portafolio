"use strict";

// Datos ficticios de la carta (precios en soles)
const MENU = [
  { cat: "Entradas", items: [
    { id: "e1", name: "Ceviche clásico", desc: "Pescado del día, limón, ají limo, camote y choclo.", price: 38 },
    { id: "e2", name: "Causa limeña", desc: "Papa amarilla rellena de pollo, palta y mayonesa casera.", price: 24 },
    { id: "e3", name: "Anticuchos de corazón", desc: "Brochetas a la parrilla con papa dorada y ají panca.", price: 28 },
    { id: "e4", name: "Papa a la huancaína", desc: "Crema de ají amarillo y queso fresco sobre papa sancochada.", price: 18 }
  ]},
  { cat: "Fondos", items: [
    { id: "f1", name: "Lomo saltado", desc: "Res salteada al wok con cebolla, tomate, papas fritas y arroz.", price: 36 },
    { id: "f2", name: "Ají de gallina", desc: "Pollo deshilachado en crema de ají amarillo, con arroz y papa.", price: 30 },
    { id: "f3", name: "Arroz con pollo", desc: "Arroz al culantro con presa de pollo y zarza criolla.", price: 28 },
    { id: "f4", name: "Tallarines verdes con bistec", desc: "Pesto peruano de albahaca y espinaca, con bistec a la plancha.", price: 32 },
    { id: "f5", name: "Seco de res", desc: "Guiso de res al culantro con frejoles canarios y arroz.", price: 34 }
  ]},
  { cat: "Postres", items: [
    { id: "p1", name: "Suspiro a la limeña", desc: "Manjar blanco con merengue al oporto.", price: 14 },
    { id: "p2", name: "Picarones", desc: "Anillos de zapallo y camote con miel de chancaca.", price: 16 },
    { id: "p3", name: "Mazamorra morada", desc: "Maíz morado, frutas y canela, servida tibia.", price: 10 }
  ]},
  { cat: "Bebidas", items: [
    { id: "b1", name: "Chicha morada (jarra)", desc: "Maíz morado, piña, membrillo y canela. 1 litro.", price: 18 },
    { id: "b2", name: "Limonada frozen", desc: "Limón y hielo, con hierbabuena.", price: 12 },
    { id: "b3", name: "Jugo de maracuyá", desc: "Pulpa natural, sin azúcar añadida.", price: 10 },
    { id: "b4", name: "Inca Kola 500 ml", desc: "Bien fría.", price: 7 }
  ]}
];

const DELIVERY_FEE = 5;
const ALL = MENU.flatMap(c => c.items);
const find = id => ALL.find(i => i.id === id);
const money = n => "S/ " + n.toFixed(2);

const state = { cart: {}, mode: "recojo", cat: MENU[0].cat };
const $ = id => document.getElementById(id);

// ---------- Carta ----------
function renderTabs() {
  $("tabs").innerHTML = MENU.map(c =>
    `<button class="tab" data-cat="${c.cat}" aria-pressed="${c.cat === state.cat}">${c.cat}</button>`
  ).join("");
}

function renderMenu() {
  const cat = MENU.find(c => c.cat === state.cat);
  $("menu").innerHTML = cat.items.map(i => `
    <article class="dish">
      <h3>${i.name}</h3>
      <span class="price">${money(i.price)}</span>
      <p>${i.desc}</p>
      <button class="btn" data-add="${i.id}" aria-label="Agregar ${i.name} al pedido">Agregar</button>
    </article>`).join("");
}

// ---------- Carrito ----------
function totals() {
  const entries = Object.entries(state.cart);
  const subtotal = entries.reduce((s, [id, q]) => s + find(id).price * q, 0);
  const fee = entries.length && state.mode === "delivery" ? DELIVERY_FEE : 0;
  const count = entries.reduce((s, [, q]) => s + q, 0);
  return { entries, subtotal, fee, total: subtotal + fee, count };
}

function summaryText(t) {
  if (!t.entries.length) return "Tu resumen aparecerá aquí cuando agregues platos.";
  const lines = t.entries.map(([id, q]) => {
    const i = find(id);
    return `${q} x ${i.name} — ${money(i.price * q)}`;
  });
  return [
    "MESA CRIOLLA — PEDIDO DE DEMOSTRACIÓN",
    "(Restaurante ficticio, este pedido no es real)",
    "",
    ...lines,
    "",
    `Subtotal: ${money(t.subtotal)}`,
    `${state.mode === "delivery" ? "Delivery" : "Recojo en local"}: ${money(t.fee)}`,
    `TOTAL: ${money(t.total)}`
  ].join("\n");
}

function renderCart() {
  const t = totals();
  $("empty").hidden = t.entries.length > 0;
  $("lines").innerHTML = t.entries.map(([id, q]) => {
    const i = find(id);
    return `<li class="line">
      <span class="name">${i.name}</span>
      <span class="sub">${money(i.price * q)}</span>
      <span class="unit">${money(i.price)} c/u</span>
      <div class="qty">
        <button data-dec="${id}" aria-label="Quitar una unidad de ${i.name}">−</button>
        <span class="n" aria-live="polite">${q}</span>
        <button data-inc="${id}" aria-label="Agregar una unidad de ${i.name}">+</button>
        <button class="rm" data-rm="${id}" aria-label="Quitar ${i.name} del pedido">Quitar</button>
      </div>
    </li>`;
  }).join("");
  $("subtotal").textContent = money(t.subtotal);
  $("fee").textContent = money(t.fee);
  $("total").textContent = money(t.total);
  $("summary").textContent = summaryText(t);
  $("copy").disabled = !t.entries.length;
  $("clear").disabled = !t.entries.length;
  $("fab").hidden = !t.count;
  $("fab-n").textContent = t.count;
  $("fab-t").textContent = money(t.total);
}

function change(id, delta) {
  const q = (state.cart[id] || 0) + delta;
  if (q <= 0) delete state.cart[id]; else state.cart[id] = Math.min(q, 20);
  $("status").textContent = "";
  renderCart();
}

// ---------- Eventos ----------
$("tabs").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.cat = b.dataset.cat;
  renderTabs();
  renderMenu();
});

$("menu").addEventListener("click", e => {
  const b = e.target.closest("[data-add]");
  if (b) change(b.dataset.add, 1);
});

$("lines").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.inc) change(b.dataset.inc, 1);
  else if (b.dataset.dec) change(b.dataset.dec, -1);
  else if (b.dataset.rm) change(b.dataset.rm, -999);
});

document.querySelectorAll('input[name="modo"]').forEach(r =>
  r.addEventListener("change", () => { state.mode = r.value; $("status").textContent = ""; renderCart(); })
);

$("clear").addEventListener("click", () => {
  state.cart = {};
  $("status").textContent = "";
  renderCart();
});

$("copy").addEventListener("click", async () => {
  const text = summaryText(totals());
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    // Respaldo para cuando el navegador bloquea el portapapeles en archivos locales
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }
  $("status").textContent = ok
    ? "Resumen copiado. Recuerda: es solo una demo."
    : "No se pudo copiar. Selecciona el texto del resumen y cópialo con Ctrl + C.";
});

renderTabs();
renderMenu();
renderCart();
