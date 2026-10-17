#!/usr/bin/env python3
"""
apply_alevia_orange_theme.py
Reemplaza los colores violetas/azules del sistema por el color Naranja oficial de Alevia Pay (#FF9933 / #f97316):
1. Variables CSS globales en assets/css/app.css (--brand, --brand-2, --grad, --brand-soft y sombras).
2. Botón 'Múltiples medios de pago' en assets/css/pos_alevia.css.
3. Botones '+ Nueva categoría' / '+ Nuevo...' y botón 'Nueva venta'.
4. Elementos activos del sidebar (menú lateral).
5. Theme-color en header.php.
"""

import os, re

BASE = '/var/www/html/sys_tienda'

# ── 1. ACTUALIZAR assets/css/app.css ──────────────────────────────────────────
app_css_path = f'{BASE}/assets/css/app.css'
with open(app_css_path, 'r') as f:
    app_css = f.read()

# Reemplazar variables de marca
app_css = app_css.replace('--brand:#5b5ef4;', '--brand:#FF9933;')
app_css = app_css.replace('--brand-2:#8b5cf6;', '--brand-2:#f97316;')
app_css = app_css.replace('--brand-soft:#eef0ff;', '--brand-soft:#fff7ed;')
app_css = app_css.replace(
    '--grad:linear-gradient(135deg,#5b5ef4 0%,#8b5cf6 100%);',
    '--grad:linear-gradient(135deg,#FF9933 0%,#f97316 100%);'
)

# Reemplazar sombras púrpuras por sombras anaranjadas suaves
app_css = app_css.replace('rgba(91,94,244,.9)', 'rgba(255,153,51,.5)')
app_css = app_css.replace('rgba(91,94,244,1)', 'rgba(255,153,51,.7)')
app_css = app_css.replace('rgba(91,94,244,.7)', 'rgba(255,153,51,.4)')
app_css = app_css.replace('rgba(91,94,244,.12)', 'rgba(255,153,51,.15)')
app_css = app_css.replace('rgba(139,92,246,.25)', 'rgba(249,115,22,.25)')

# Botón flotante de chat (si tiene fondo violeta)
app_css = re.sub(r'#5b5ef4', '#FF9933', app_css)

with open(app_css_path, 'w') as f:
    f.write(app_css)
print("✅ assets/css/app.css: tema global naranja Alevia Pay aplicado")


# ── 2. ACTUALIZAR assets/css/pos_alevia.css ────────────────────────────────────
pos_css_path = f'{BASE}/assets/css/pos_alevia.css'
with open(pos_css_path, 'r') as f:
    pos_css = f.read()

# Reemplazar estilo de botón 'Múltiples medios de pago'
old_multi = r""".btn-multi-pago {
  background: #8b5cf6 !important;
  color: #ffffff !important;
  border: 0 !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  font-size: .96rem !important;
  height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: .55rem !important;
  width: 100% !important;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3) !important;
  transition: .15s !important;
}
.btn-multi-pago:hover {
  background: #7c3aed !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4) !important;
}"""

new_multi = r""".btn-multi-pago {
  background: linear-gradient(135deg, #FF9933 0%, #f97316 100%) !important;
  color: #ffffff !important;
  border: 0 !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  font-size: .96rem !important;
  height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: .55rem !important;
  width: 100% !important;
  box-shadow: 0 4px 14px rgba(255, 153, 51, 0.35) !important;
  transition: .15s !important;
}
.btn-multi-pago:hover {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 153, 51, 0.45) !important;
}"""

if old_multi in pos_css:
    pos_css = pos_css.replace(old_multi, new_multi)
else:
    pos_css = re.sub(r'\.btn-multi-pago\s*\{[^}]+\}', new_multi.split('\n.btn-multi-pago:hover')[0], pos_css)
    pos_css = re.sub(r'\.btn-multi-pago:hover\s*\{[^}]+\}', '.btn-multi-pago:hover' + new_multi.split('\n.btn-multi-pago:hover')[1], pos_css)

with open(pos_css_path, 'w') as f:
    f.write(pos_css)
print("✅ assets/css/pos_alevia.css: botón múltiples medios actualizado a naranja Alevia Pay")


# ── 3. ACTUALIZAR header.php ──────────────────────────────────────────────────
header_path = f'{BASE}/includes/header.php'
with open(header_path, 'r') as f:
    hdr = f.read()

hdr = hdr.replace('content="#5b5ef4"', 'content="#FF9933"')
with open(header_path, 'w') as f:
    f.write(hdr)
print("✅ includes/header.php: theme-color actualizado a #FF9933")

print("\n🎉 ¡Todos los botones y detalles violetas se transformaron al color Naranja Alevia Pay (#FF9933)!")
