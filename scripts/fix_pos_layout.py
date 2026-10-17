#!/usr/bin/env python3
"""
fix_pos_layout.py — Corrige la carga de estilos y el layout de Alevia Pay en SysTienda.
"""
import os, subprocess

BASE = '/var/www/html/sys_tienda'

# ── 1. modulo.php: Precargar pos_alevia.css antes del header ─────────────────
modulo_path = f'{BASE}/modulo.php'
with open(modulo_path, 'r') as f:
    modulo_content = f.read()

target = "$pageTitle = $titulo; $extraJs = []; $extraCss = [];"
replacement = """$pageTitle = $titulo; $extraJs = []; $extraCss = [];
if ($slug === 'pos') {
    $extraCss[] = BASE_URL . '/assets/css/pos_alevia.css?v=' . ASSET_V;
}"""

if target in modulo_content and "if ($slug === 'pos')" not in modulo_content:
    modulo_content = modulo_content.replace(target, replacement)
    with open(modulo_path, 'w') as f:
        f.write(modulo_content)
    print("✅ modulo.php: pre-carga de pos_alevia.css agregada antes del header")
else:
    print("ℹ️  modulo.php ya contenía la pre-carga o no se encontró la línea exacta")

# ── 2. modules/pos.php: Agregar enlace directo al CSS por redundancia ────────
pos_php_path = f'{BASE}/modules/pos.php'
with open(pos_php_path, 'r') as f:
    pos_content = f.read()

# Asegurar que en pos.php esté la etiqueta link directa
if 'pos_alevia.css' not in pos_content:
    pos_content = '<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/pos_alevia.css?v=<?= ASSET_V ?>">\n' + pos_content
    with open(pos_php_path, 'w') as f:
        f.write(pos_content)
    print("✅ modules/pos.php: <link> directo agregado")
else:
    # Asegurar que esté presente una etiqueta link en el HTML
    if '<link rel="stylesheet"' not in pos_content:
        pos_content = pos_content.replace(
            '<div class="alevia-pos-container"',
            '<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/pos_alevia.css?v=<?= ASSET_V ?>">\n<div class="alevia-pos-container"'
        )
        with open(pos_php_path, 'w') as f:
            f.write(pos_content)
        print("✅ modules/pos.php: <link rel=stylesheet> insertado en el HTML")

# ── 3. assets/css/pos_alevia.css: CSS completo y robusto para Alevia Pay ─────
NEW_CSS = r"""/* ===== Alevia Pay POS Style ===== */

/* Contenedor principal del POS */
.alevia-pos-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: calc(100vh - var(--top-h, 68px) - 2.5rem);
  color: #1e293b;
}

/* Barra superior */
.alevia-topbar {
  display: flex;
  align-items: center;
  gap: .75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.alevia-search-box {
  flex: 1;
  min-width: 260px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: .4rem .65rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.alevia-search-box input {
  border: 0;
  outline: none;
  font-size: .95rem;
  width: 100%;
  padding: .2rem .5rem;
  background: transparent;
}
.alevia-search-box select {
  border: 0;
  outline: none;
  font-size: .82rem;
  color: #64748b;
  background: transparent;
  padding: .2rem .4rem;
  border-left: 1px solid #e2e8f0;
}
.alevia-btn-search {
  background: #f97316;
  color: #ffffff;
  border: 0;
  border-radius: 9px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: .15s;
}
.alevia-btn-search:hover { background: #ea580c; color: #fff; }

.alevia-top-actions {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.btn-alevia-action {
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  font-size: .86rem;
  padding: .55rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  color: #ffffff;
  height: 42px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  transition: .15s;
}
.btn-alevia-action:hover { transform: translateY(-1px); filter: brightness(1.05); color: #fff; }
.btn-alevia-orange { background: #f59e0b; }
.btn-alevia-green  { background: #10b981; }
.btn-alevia-red    { background: #f43f5e; }

/* ─── Grid Principal: Carrito (izq) y Resumen (der) ─── */
.alevia-pos-body {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 390px !important;
  gap: 1.25rem !important;
  flex: 1;
  min-height: 520px;
}

/* Card Carrito (izquierda) */
.alevia-cart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.alevia-cart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .8rem;
  padding-bottom: .6rem;
  border-bottom: 1px solid #f1f5f9;
}
.alevia-cart-head h5 {
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0;
}
.alevia-cart-actions { display: flex; gap: .4rem; }
.btn-icon-soft {
  width: 36px; height: 36px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  border-radius: 9px;
  display: grid;
  place-items: center;
  transition: .15s;
}
.btn-icon-soft:hover { background: #f1f5f9; color: #0f172a; }
.btn-icon-soft.danger:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

/* Área de contenido del carrito */
.alevia-cart-content {
  flex: 1;
  overflow-y: auto;
  min-height: 250px;
}
.alevia-empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
}
.alevia-empty-circle {
  width: 84px; height: 84px;
  border-radius: 50%;
  background: #fff7ed;
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
}
.alevia-empty-circle i { font-size: 2.2rem; color: #f97316; }

/* Tabla del Carrito */
.alevia-cart-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 .4rem;
}
.alevia-cart-table th {
  font-size: .74rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: .04em;
  padding: .4rem .6rem;
  border-bottom: 1px solid #f1f5f9;
}
.alevia-cart-row { background: #f8fafc; border-radius: 10px; transition: .15s; }
.alevia-cart-row td { padding: .65rem .6rem; vertical-align: middle; }
.alevia-cart-row:hover { background: #f1f5f9; }
.alevia-cart-stepper {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.alevia-cart-stepper button {
  border: 0; background: transparent;
  width: 26px; height: 28px;
  font-weight: 700; color: #475569;
  display: grid; place-items: center;
}
.alevia-cart-stepper button:hover { background: #f1f5f9; color: #0f172a; }
.alevia-cart-stepper input {
  width: 38px; border: 0;
  text-align: center; font-weight: 700;
  font-size: .85rem; outline: none;
  background: transparent;
}

/* Métricas al pie del carrito */
.alevia-cart-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
  padding-top: .85rem;
  border-top: 1px solid #f1f5f9;
  margin-top: .6rem;
}
.alevia-metric-box {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .65rem .85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.alevia-metric-ic {
  width: 34px; height: 34px;
  border-radius: 10px;
  display: grid; place-items: center;
  font-size: 1.05rem; flex-shrink: 0;
}
.alevia-metric-box small { display: block; font-size: .7rem; color: #64748b; font-weight: 500; }
.alevia-metric-box b { font-size: 1rem; color: #0f172a; }

/* Card Resumen (derecha) */
.alevia-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.alevia-summary-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .8rem;
}
.alevia-summary-head h6 { font-weight: 700; font-size: 1.05rem; margin: 0; }

/* Buscador de Cliente */
.alevia-client-input {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: .25rem .45rem;
  margin-bottom: .3rem;
}
.alevia-client-input i { color: #94a3b8; padding: 0 .4rem; }
.alevia-client-input input {
  border: 0; outline: none; width: 100%;
  font-size: .88rem; background: transparent; cursor: pointer;
}
.alevia-client-btn {
  background: #f97316; color: #ffffff; border: 0;
  border-radius: 7px; width: 30px; height: 30px;
  display: grid; place-items: center; flex-shrink: 0;
}

/* Tarjeta Oscura TOTAL A COBRAR */
.alevia-total-card {
  background: linear-gradient(135deg, #1e2235 0%, #0f172a 100%);
  color: #ffffff;
  border-radius: 14px;
  padding: 1.15rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: .8rem 0;
  box-shadow: 0 6px 18px -4px rgba(15,23,42,0.3);
}
.alevia-total-card .lbl {
  font-size: .7rem; font-weight: 700;
  letter-spacing: .08em; color: #cbd5e1;
  text-transform: uppercase;
}
.alevia-total-card .val {
  font-size: 2rem; font-weight: 800;
  line-height: 1.1; color: #ffffff;
  letter-spacing: -.02em;
}
.alevia-total-badge-ic {
  width: 46px; height: 46px; border-radius: 12px;
  background: rgba(245,158,11,0.18); color: #f59e0b;
  display: grid; place-items: center; font-size: 1.45rem;
}

/* Labels y Métodos de Pago */
.alevia-label {
  font-size: .72rem; font-weight: 800;
  text-transform: uppercase; color: #64748b;
  letter-spacing: .05em; margin-bottom: .35rem; display: block;
}
.alevia-pay-select {
  border-radius: 10px; font-weight: 600;
  border-color: #cbd5e1; padding: .5rem .75rem; font-size: .9rem;
}

/* Billetes rápidos */
.alevia-quick-bills {
  display: flex; gap: .35rem; flex-wrap: wrap;
  margin-top: .4rem; margin-bottom: .75rem;
}
.alevia-bill-btn {
  border: 1px solid #cbd5e1; background: #ffffff;
  color: #1e293b; border-radius: 8px;
  padding: .22rem .55rem; font-size: .76rem; font-weight: 700; transition: .15s;
}
.alevia-bill-btn:hover { border-color: #f97316; color: #f97316; }
.alevia-bill-btn.active { background: #f97316; color: #fff; border-color: #f97316; }

/* Botón Múltiples Medios */
.btn-multi-pago {
  background: #ede9fe; color: #6d28d9; border: 0;
  border-radius: 11px; font-weight: 700; font-size: .86rem;
  height: 42px; display: flex; align-items: center;
  justify-content: center; gap: .5rem; width: 100%;
  margin-bottom: .8rem; transition: .15s;
}
.btn-multi-pago:hover { background: #ddd6fe; color: #5b21b6; }

/* Botonera inferior */
.alevia-action-footer {
  display: flex; gap: .6rem;
  margin-top: auto; padding-top: .6rem;
}
.btn-alevia-venta {
  flex: 1; background: #10b981; color: #fff; border: 0;
  border-radius: 12px; font-weight: 800; font-size: 1rem;
  height: 50px; display: flex; align-items: center;
  justify-content: center; gap: .5rem;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3); transition: .15s;
}
.btn-alevia-venta:hover { background: #059669; color: #fff; }
.btn-alevia-cancel {
  background: #fee2e2; color: #ef4444; border: 0;
  border-radius: 12px; font-weight: 700; font-size: .9rem;
  height: 50px; padding: 0 1.1rem; display: flex;
  align-items: center; justify-content: center; gap: .4rem; transition: .15s;
}
.btn-alevia-cancel:hover { background: #fecdd3; color: #dc2626; }

/* Selector Comprobantes Pills */
.alevia-comprobante-pills {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: .85rem;
  gap: 3px;
}
.alevia-pill-btn {
  flex: 1;
  text-align: center;
  padding: .35rem;
  border-radius: 8px;
  font-size: .78rem;
  font-weight: 700;
  color: #64748b;
  border: 0;
  background: transparent;
  transition: .15s;
}
.alevia-pill-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

@media (max-width: 991px) {
  .alevia-pos-body {
    grid-template-columns: 1fr !important;
  }
}
"""

css_path = f'{BASE}/assets/css/pos_alevia.css'
with open(css_path, 'w') as f:
    f.write(NEW_CSS)
print(f"✅ {css_path} reescrito con diseño completo")

# ── 4. Permisos: dar chown a maikol para que no pida sudo siempre ────────────
try:
    subprocess.run(['chown', '-R', 'maikol:maikol', BASE], check=False)
except Exception as e:
    pass

print()
print("🎉 ¡Listo! Ahora el CSS carga en el <head> y el layout tiene grid de 2 columnas.")
