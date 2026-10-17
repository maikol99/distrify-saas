#!/usr/bin/env python3
"""
fix_cart_height.py
Hace que la tarjeta de 'Carrito de productos' (izquierda) tenga exactamente la misma altura
y llegue hasta el mismo fondo que la tarjeta de 'Resumen de Venta' (derecha), alineadas a la perfección.
"""

BASE = '/var/www/html/sys_tienda'
pos_css_path = f'{BASE}/assets/css/pos_alevia.css'

with open(pos_css_path, 'r') as f:
    css = f.read()

# 1. Cambiar align-items: start por align-items: stretch en .alevia-pos-body
css = css.replace('align-items: start;', 'align-items: stretch !important;')

# 2. Asegurar que .alevia-cart-card tenga height: 100% y su footer empuje hacia abajo
old_cart_card = """.alevia-cart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  min-height: 540px;
}"""

new_cart_card = """.alevia-cart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  height: 100%;
}"""

if old_cart_card in css:
    css = css.replace(old_cart_card, new_cart_card)

# 3. Asegurar que el footer del carrito tenga margin-top: auto para quedar bien abajo
css = css.replace('margin-top: .6rem;', 'margin-top: auto !important;')

with open(pos_css_path, 'w') as f:
    f.write(css)

print("✅ assets/css/pos_alevia.css actualizado: ambas tarjetas ahora tienen la misma altura exacta hasta abajo.")
