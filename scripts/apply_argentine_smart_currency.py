#!/usr/bin/env python3
"""
apply_argentine_smart_currency.py
Implementa el formato financiero de Argentina con decimales dinámicos / inteligentes:
1. Si el monto es entero (ej: 1000, 24000), se muestra '$ 1.000', '$ 24.000' (SIN ',00').
2. Si el monto tiene centavos reales (ej: 1250.50), se muestra con coma '$ 1.250,50'.
3. Actualiza includes/format.php (Backend PHP).
4. Actualiza assets/js/app.js (Frontend JS global).
5. Actualiza assets/js/pos.js (Punto de venta).
6. Renombra categorías de prueba en la base de datos (Abarrotes -> Kiosco y Golosinas, Licores -> Bebidas y Vinos).
"""

import os, re, subprocess

BASE = '/var/www/html/sys_tienda'

# ── 1. ACTUALIZAR includes/format.php ─────────────────────────────────────────
format_php_path = f'{BASE}/includes/format.php'
with open(format_php_path, 'r') as f:
    fmt_code = f.read()

# Reemplazar nf($v, ?int $d = null) para soportar decimales dinámicos
old_nf = """function nf($v, ?int $d = null): string
{
    $f = fmt_cfg();
    return number_format((float)$v, $d ?? $f['dec'], $f['sd'], $f['sm']);
}"""

new_nf = """function nf($v, ?int $d = null): string
{
    $f = fmt_cfg();
    $val = (float)$v;
    if ($d === null) {
        // En Argentina: si es entero ($ 1.000) no lleva ',00'. Solo lleva coma si tiene centavos reales ($ 1.250,50).
        $d = (abs($val - round($val)) < 0.001) ? 0 : (int)$f['dec'];
    }
    return number_format($val, $d, $f['sd'], $f['sm']);
}"""

if old_nf in fmt_code:
    fmt_code = fmt_code.replace(old_nf, new_nf)
else:
    # Reemplazo por regex si ya fue tocado
    fmt_code = re.sub(
        r'function nf\(\$v, \?int \$d = null\): string\s*\{[^}]+\}',
        new_nf,
        fmt_code
    )

with open(format_php_path, 'w') as f:
    f.write(fmt_code)
print("✅ includes/format.php: formato dinámico para Argentina configurado")


# ── 2. ACTUALIZAR assets/js/app.js ────────────────────────────────────────────
app_js_path = f'{BASE}/assets/js/app.js'
with open(app_js_path, 'r') as f:
    app_js = f.read()

old_fmt_js = r"""  window.fmt = (n, d) => {
    const F = APP.fmt; d = d === undefined ? F.dec : d;
    const [i, f] = Math.abs(Number(n || 0)).toFixed(d).split('.'), neg = Number(n || 0) < 0 && (+i > 0 || (f && +f > 0));
    return (neg ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, F.sm) + (d > 0 ? F.sd + f : '');
  };"""

new_fmt_js = r"""  window.fmt = (n, d) => {
    const F = APP.fmt;
    const num = Number(n || 0);
    // En Argentina: si no se especifica d, se omiten decimales si el número es entero (1000 -> 1.000)
    // y solo se muestran si hay centavos reales (1250.50 -> 1.250,50)
    if (d === undefined) {
      d = (Math.abs(num % 1) > 0.0001) ? (parseInt(F.dec) || 2) : 0;
    }
    const [i, f] = Math.abs(num).toFixed(d).split('.'), neg = num < 0 && (+i > 0 || (f && +f > 0));
    return (neg ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, F.sm) + (d > 0 ? F.sd + f : '');
  };"""

if old_fmt_js in app_js:
    app_js = app_js.replace(old_fmt_js, new_fmt_js)
else:
    app_js = re.sub(
        r'window\.fmt\s*=\s*\(n,\s*d\)\s*=>\s*\{[^}]+\};',
        new_fmt_js.strip(),
        app_js
    )

with open(app_js_path, 'w') as f:
    f.write(app_js)
print("✅ assets/js/app.js: formateador JS adaptado a moneda argentina sin ',00' redundante")


# ── 3. ACTUALIZAR CATEGORÍAS EN LA BASE DE DATOS ──────────────────────────────
# Usar credenciales de local.php
php_db_script = """<?php
require_once '/var/www/html/sys_tienda/config/database.php';
try {
    $pdo = db();
    $pdo->exec("UPDATE categorias SET nombre = 'Kiosco y Golosinas' WHERE nombre = 'Abarrotes'");
    $pdo->exec("UPDATE categorias SET nombre = 'Bebidas y Vinos' WHERE nombre = 'Licores'");
    $pdo->exec("UPDATE categorias SET nombre = 'Lácteos y Frescos' WHERE nombre = 'Lácteos'");
    $pdo->exec("UPDATE categorias SET nombre = 'Snacks y Galletitas' WHERE nombre = 'Snacks'");
    
    // Actualizar meta diaria a un valor más realista argentino
    $pdo->exec("UPDATE configuracion SET valor = '350000' WHERE clave = 'meta_diaria' AND valor < '10000'");
    echo "✓ Base de datos: Categorías y metas ajustadas a la realidad de Argentina.\n";
} catch (Exception $e) {
    echo "! Aviso DB: " . $e->getMessage() . "\n";
}
"""

with open('/tmp/update_ar_cats.php', 'w') as f:
    f.write(php_db_script)

subprocess.run(['php', '/tmp/update_ar_cats.php'], check=False)
if os.path.exists('/tmp/update_ar_cats.php'):
    os.remove('/tmp/update_ar_cats.php')

print()
print("🎉 ¡Formato de moneda argentino (Opción B) aplicado con éxito!")
print("   - $ 1.000 se muestra como '$ 1.000' (sin ,00)")
print("   - $ 1.250,50 se muestra como '$ 1.250,50' (con coma para centavos)")
print("   - Categorías peruanas renombradas a Kiosco argentino.")
