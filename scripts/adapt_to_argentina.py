import os
import re
import shutil

BASE_DIR = "/var/www/html/sys_tienda"

def backup_and_replace(filepath, search_str, replace_str):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if search_str not in content:
        print(f"Search string not found in {filepath}")
        return False
    if not os.path.exists(filepath + ".bak"):
        shutil.copy2(filepath, filepath + ".bak")
    new_content = content.replace(search_str, replace_str, 1)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully updated: {filepath}")
    return True

print("=== Adaptando SysTienda 100% a Argentina / Lógica Alevia Pay ===")

# 1. config/config.php - Zona horaria
backup_and_replace(
    os.path.join(BASE_DIR, "config/config.php"),
    "if (!defined('TIMEZONE')) define('TIMEZONE', 'America/Lima');",
    "if (!defined('TIMEZONE')) define('TIMEZONE', 'America/Argentina/Buenos_Aires');"
)

# 2. includes/format.php - Moneda y separadores argentinos
backup_and_replace(
    os.path.join(BASE_DIR, "includes/format.php"),
    "$d = ['moneda' => 'S/', 'moneda_codigo' => 'PEN', 'moneda_decimales' => '2', 'sep_decimal' => '.', 'sep_miles' => ',', 'moneda_posicion' => 'antes'];",
    "$d = ['moneda' => '$', 'moneda_codigo' => 'ARS', 'moneda_decimales' => '2', 'sep_decimal' => ',', 'sep_miles' => '.', 'moneda_posicion' => 'antes'];"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/format.php"),
    "function impuesto(): string { return cfg('impuesto_nombre', 'IGV'); }",
    "function impuesto(): string { return cfg('impuesto_nombre', 'IVA'); }"
)

# 3. api/empresa.php - Defaults argentinos (IVA 0% / final, $, ARS)
backup_and_replace(
    os.path.join(BASE_DIR, "api/empresa.php"),
    "$def = ['empresa_nombre' => '', 'moneda' => 'S/', 'moneda_codigo' => 'PEN', 'moneda_decimales' => '2', 'sep_decimal' => '.', 'sep_miles' => ',', 'moneda_posicion' => 'antes', 'igv' => '18', 'impuesto_nombre' => 'IGV',",
    "$def = ['empresa_nombre' => '', 'moneda' => '$', 'moneda_codigo' => 'ARS', 'moneda_decimales' => '2', 'sep_decimal' => ',', 'sep_miles' => '.', 'moneda_posicion' => 'antes', 'igv' => '0', 'impuesto_nombre' => 'IVA',"
)

# 4. api/pos.php - Cálculo limpio de venta (sin quita de IGV) y comprobantes argentinos
old_pos = """        $total = round($neto, 2);
        if ($total <= 0) throw new RuntimeException('El total debe ser mayor a 0.');
        $descTotal = round($dPromo + $manual + $dCumple + $dPuntos, 2);
        $igvPct = (float)cfg('igv', '18'); $subtotal = round($total / (1 + $igvPct / 100), 2); $igv = round($total - $subtotal, 2);

        if ($tipo === 'FACTURA' && !($cli['tipo_doc'] === 'RUC' && strlen((string)$cli['documento']) === 11)) throw new RuntimeException('Para factura el cliente debe tener RUC válido.');
        if ($tipo === 'BOLETA' && $total >= 700 && $clienteId === 1) throw new RuntimeException('Boletas desde ' . money(700) . ' requieren identificar al cliente (DNI).');"""

new_pos = """        $total = round($neto, 2);
        if ($total <= 0) throw new RuntimeException('El total debe ser mayor a 0.');
        $descTotal = round($dPromo + $manual + $dCumple + $dPuntos, 2);
        $igvPct = (float)cfg('igv', '0');
        if ($igvPct > 0) {
            $subtotal = round($total / (1 + $igvPct / 100), 2);
            $igv = round($total - $subtotal, 2);
        } else {
            $subtotal = $total;
            $igv = 0.00;
        }

        if ($tipo === 'FACTURA' && empty($cli['documento']) && $clienteId === 1) throw new RuntimeException('Para emitir factura ingresa el CUIT o DNI del cliente.');"""

backup_and_replace(os.path.join(BASE_DIR, "api/pos.php"), old_pos, new_pos)

# 5. modules/pos.php - Comprobantes, métodos de pago argentinos y modal cliente
old_grid = """    <div class="pay-grid" id="payGrid">
      <button data-m="EFECTIVO" class="on"><i class="bi bi-cash-coin"></i>Efectivo</button>
      <button data-m="YAPE"><i class="bi bi-phone"></i>Yape</button>
      <button data-m="PLIN"><i class="bi bi-phone-vibrate"></i>Plin</button>
      <button data-m="TARJETA"><i class="bi bi-credit-card-2-front"></i>Tarjeta</button>
      <button data-m="TRANSFERENCIA"><i class="bi bi-bank"></i>Transf.</button>
      <button data-m="CREDITO"><i class="bi bi-journal-text"></i>Crédito</button>
    </div>"""

new_grid = """    <div class="pay-grid" id="payGrid">
      <button data-m="EFECTIVO" class="on"><i class="bi bi-cash-coin"></i>Efectivo</button>
      <button data-m="MERCADOPAGO"><i class="bi bi-qr-code-scan"></i>Mercado Pago</button>
      <button data-m="TRANSFERENCIA"><i class="bi bi-bank"></i>Transferencia</button>
      <button data-m="DEBITO"><i class="bi bi-credit-card-2-front"></i>Débito</button>
      <button data-m="TARJETA"><i class="bi bi-credit-card"></i>Crédito</button>
      <button data-m="CREDITO"><i class="bi bi-journal-text"></i>Fiado / Cta Cte</button>
    </div>"""

backup_and_replace(os.path.join(BASE_DIR, "modules/pos.php"), old_grid, new_grid)

# Comprobantes en POS
backup_and_replace(
    os.path.join(BASE_DIR, "modules/pos.php"),
    '<button data-t="TICKET" class="on flex-fill">Ticket</button><button data-t="BOLETA" class="flex-fill">Boleta</button><button data-t="FACTURA" class="flex-fill">Factura</button>',
    '<button data-t="TICKET" class="on flex-fill">Ticket</button><button data-t="BOLETA" class="flex-fill">Factura B</button><button data-t="FACTURA" class="flex-fill">Factura A</button>'
)

# Documentos en modal nuevo cliente POS
backup_and_replace(
    os.path.join(BASE_DIR, "modules/pos.php"),
    '<option>DNI</option><option>RUC</option><option>CE</option>',
    '<option>DNI</option><option>CUIT</option><option>CUIL</option>'
)

backup_and_replace(os.path.join(BASE_DIR, "modules/pos.php"), 'id="tTotal">S/ 0.00</span>', 'id="tTotal"><?= e(moneda()) ?> 0.00</span>')
backup_and_replace(os.path.join(BASE_DIR, "modules/pos.php"), 'id="vuelto">S/ 0.00</b>', 'id="vuelto"><?= e(moneda()) ?> 0.00</b>')

# 6. modules/ventas.php - Filtros de métodos de pago y tipo
backup_and_replace(
    os.path.join(BASE_DIR, "modules/ventas.php"),
    "['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA', 'CREDITO']",
    "['EFECTIVO', 'MERCADOPAGO', 'TRANSFERENCIA', 'DEBITO', 'TARJETA', 'CREDITO']"
)
backup_and_replace(
    os.path.join(BASE_DIR, "modules/ventas.php"),
    "<option>TICKET</option><option>BOLETA</option><option>FACTURA</option>",
    "<option value='TICKET'>Ticket</option><option value='BOLETA'>Factura B</option><option value='FACTURA'>Factura A</option>"
)

# 7. modules/empresa.php - Etiquetas CUIT / IVA
backup_and_replace(
    os.path.join(BASE_DIR, "modules/empresa.php"),
    '<label class="form-label">RUC / NIT / RFC</label><input class="form-control" name="empresa_ruc" maxlength="20">',
    '<label class="form-label">CUIT / Identificación fiscal</label><input class="form-control" name="empresa_ruc" maxlength="20" placeholder="20-12345678-9">'
)
backup_and_replace(
    os.path.join(BASE_DIR, "modules/empresa.php"),
    '<label class="form-label">Nombre del impuesto</label><input class="form-control" name="impuesto_nombre" maxlength="10" placeholder="IGV">',
    '<label class="form-label">Nombre del impuesto</label><input class="form-control" name="impuesto_nombre" maxlength="10" placeholder="IVA">'
)

# 8. includes/crud_config.php - CUIT en clientes y proveedores, margen en productos, sin soles
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crud_config.php"),
    "['ruc', 'RUC', 'text']",
    "['ruc', 'CUIT', 'text']"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crud_config.php"),
    "['ruc', 'RUC', 'text', 4]",
    "['ruc', 'CUIT / CUIL', 'text', 4]"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crud_config.php"),
    "['tipo_doc', 'Tipo doc.', 'select', 3, ['DNI' => 'DNI', 'RUC' => 'RUC', 'CE' => 'C. Extranjería', 'OTRO' => 'Otro']]",
    "['tipo_doc', 'Tipo doc.', 'select', 3, ['DNI' => 'DNI', 'CUIT' => 'CUIT/CUIL', 'OTRO' => 'Otro']]"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crud_config.php"),
    "if (($d['tipo_doc'] ?? '') === 'RUC' && !empty($d['documento']) && !preg_match('/^\d{11}$/', $d['documento'])) throw new RuntimeException('El RUC debe tener 11 dígitos.');",
    "if (($d['tipo_doc'] ?? '') === 'CUIT' && !empty($d['documento']) && strlen(preg_replace('/[^0-9]/','',$d['documento'])) !== 11) throw new RuntimeException('El CUIT debe tener 11 dígitos.');"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crud_config.php"),
    "throw new RuntimeException('Indica el descuento en soles por unidad.');",
    "throw new RuntimeException('Indica el monto de descuento por unidad.');"
)

# 9. includes/escpos.php - Tickets con CUIT y tipos de comprobantes
backup_and_replace(
    os.path.join(BASE_DIR, "includes/escpos.php"),
    "$tit = ['TICKET' => 'TICKET DE VENTA', 'BOLETA' => 'BOLETA DE VENTA', 'FACTURA' => 'FACTURA'][$v['tipo_comprobante']] ?? 'COMPROBANTE';",
    "$tit = ['TICKET' => 'TICKET DE VENTA', 'BOLETA' => 'FACTURA B / COMPROBANTE', 'FACTURA' => 'FACTURA A'][$v['tipo_comprobante']] ?? 'COMPROBANTE';"
)
backup_and_replace(
    os.path.join(BASE_DIR, "includes/escpos.php"),
    "$p->ln('RUC: ' . cfg('empresa_ruc'))",
    "$p->ln('CUIT: ' . cfg('empresa_ruc'))"
)

# 10. includes/crm.php - Mensajes sin Yape/Plin
backup_and_replace(
    os.path.join(BASE_DIR, "includes/crm.php"),
    "Puedes pagar en tienda o por Yape/Plin. ¡Gracias!",
    "Puedes pagar en tienda o por Mercado Pago / Transferencia. ¡Gracias!"
)

# 11. api/config.php - Textos de fidelización sin soles
backup_and_replace(
    os.path.join(BASE_DIR, "api/config.php"),
    "['puntos_cada' => 'Soles por punto', 'puntos_valor' => 'Valor del punto', 'cumple_descuento' => '% de cumpleaños']",
    "['puntos_cada' => 'Pesos por punto', 'puntos_valor' => 'Valor del punto', 'cumple_descuento' => '% de cumpleaños']"
)
backup_and_replace(
    os.path.join(BASE_DIR, "api/config.php"),
    "json_fail('Los soles por punto deben ser mayores a 0.');",
    "json_fail('Los pesos por punto deben ser mayores a 0.');"
)

# 12. api/creditos.php - Cobro de fiado con métodos argentinos
backup_and_replace(
    os.path.join(BASE_DIR, "api/creditos.php"),
    "['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA']",
    "['EFECTIVO', 'MERCADOPAGO', 'TRANSFERENCIA', 'DEBITO', 'TARJETA']"
)

# 13. assets/js/pos.js - Denominaciones rápidas en pesos
backup_and_replace(
    os.path.join(BASE_DIR, "assets/js/pos.js"),
    "const base = Math.ceil(t / 10) * 10, opts = [...new Set([t, base, base + 10, 50, 100, 200].filter((v) => v >= t && v > 0))].slice(0, 5);",
    "const base = Math.ceil(t / 100) * 100, opts = [...new Set([t, base, 1000, 2000, 5000, 10000, 20000].filter((v) => v >= t && v > 0))].slice(0, 5);"
)

# 14. assets/js/crud.js - Margen del 50% automático (Markup Alevia Pay)
old_crud_open = """      $('#mdlTitle').textContent = (id ? 'Editar ' : C.nuevo + ' ') + C.singular.toLowerCase();
      $('#fields').innerHTML = C.fields.filter((f) => !(f.flag === 'only_new' && id)).map((f) => `<div class="col-md-${f.w}">${input(f, r.row[f.name])}</div>`).join('');
      if (C.entity === 'productos') $('#fields').insertAdjacentHTML('afterbegin', photoBox(id, r.row.imagen));
      modal.show(); setTimeout(() => $('#fields input,#fields select')?.focus(), 400);"""

new_crud_open = """      $('#mdlTitle').textContent = (id ? 'Editar ' : C.nuevo + ' ') + C.singular.toLowerCase();
      $('#fields').innerHTML = C.fields.filter((f) => !(f.flag === 'only_new' && id)).map((f) => `<div class="col-md-${f.w}">${input(f, r.row[f.name])}</div>`).join('');
      if (C.entity === 'productos') {
        $('#fields').insertAdjacentHTML('afterbegin', photoBox(id, r.row.imagen));
        // Lógica Alevia Pay: Margen de ganancia (markup) automático con 50% por defecto
        const cIni = parseFloat(r.row.precio_compra) || 0;
        const vIni = parseFloat(r.row.precio_venta) || 0;
        let mIni = 50;
        if (cIni > 0 && vIni > 0) {
          mIni = Math.round(((vIni - cIni) / cIni) * 100);
        }
        const boxCompra = $('#f_precio_compra')?.closest('div[class*="col-"]');
        if (boxCompra) {
          boxCompra.insertAdjacentHTML('afterend', `
            <div class="col-md-4" id="box_margen_calc">
              <label class="form-label d-flex justify-content-between align-items-center mb-1">
                <span class="fw-semibold text-success"><i class="bi bi-graph-up me-1"></i>% Ganancia</span>
                <span class="badge bg-success-subtle text-success border border-success-subtle" style="font-size:.68rem">+50% por defecto</span>
              </label>
              <div class="input-group">
                <input type="number" step="1" min="0" class="form-control fw-bold text-success" id="f_margen_pct" value="${mIni}">
                <span class="input-group-text fw-bold text-success">%</span>
              </div>
              <div class="form-text small mt-1 text-muted" id="txt_ganancia_pesos">${cIni > 0 && vIni > 0 ? 'Ganancia: ' + money(Math.max(0, vIni - cIni)) : 'Calcula el precio sumando margen al costo'}</div>
            </div>
          `);

          const elC = $('#f_precio_compra');
          const elV = $('#f_precio_venta');
          const elM = $('#f_margen_pct');
          const elT = $('#txt_ganancia_pesos');

          const recalcFromCostoOrMargen = () => {
            const c = parseFloat(elC.value) || 0;
            const m = parseFloat(elM.value) || 0;
            if (c > 0) {
              const v = Math.round(c * (1 + m / 100) * 100) / 100;
              elV.value = v.toFixed(2);
              elT.innerHTML = 'Ganancia agregada: <b class="text-success">' + money(v - c) + '</b>';
            } else {
              elT.textContent = 'Ingresa el costo de compra';
            }
          };

          const recalcFromVenta = () => {
            const c = parseFloat(elC.value) || 0;
            const v = parseFloat(elVenta.value) || 0;
            if (c > 0 && v >= c) {
              const m = Math.round(((v - c) / c) * 100);
              elM.value = m;
              elT.innerHTML = 'Ganancia agregada: <b class="text-success">' + money(v - c) + '</b>';
            }
          };

          elC.addEventListener('input', recalcFromCostoOrMargen);
          elM.addEventListener('input', recalcFromCostoOrMargen);
          elV.addEventListener('input', recalcFromVenta);

          if (!id && cIni > 0) recalcFromCostoOrMargen();
        }
      }
      modal.show(); setTimeout(() => $('#fields input,#fields select')?.focus(), 400);"""

backup_and_replace(os.path.join(BASE_DIR, "assets/js/crud.js"), old_crud_open, new_crud_open)

# 15. config/database.php - Auto-migración en MySQL (modificar metodo_pago y actualizar config inicial)
old_db = """            $tz = TIMEZONE;
            try { $v = $pdo->query("SELECT valor FROM configuracion WHERE clave='zona_horaria'")->fetchColumn(); if ($v && in_array($v, timezone_identifiers_list(), true)) $tz = $v; } catch (Throwable $e) {}
            date_default_timezone_set($tz);
            $pdo->exec("SET time_zone = '" . date('P') . "'");"""

new_db = """            $tz = TIMEZONE;
            try { $v = $pdo->query("SELECT valor FROM configuracion WHERE clave='zona_horaria'")->fetchColumn(); if ($v && in_array($v, timezone_identifiers_list(), true)) $tz = $v; } catch (Throwable $e) {}
            date_default_timezone_set($tz);
            $pdo->exec("SET time_zone = '" . date('P') . "'");

            // Auto-adaptación a Argentina / Alevia Pay
            static $ar_migrated = false;
            if (!$ar_migrated) {
                $ar_migrated = true;
                try {
                    $col = $pdo->query("SHOW COLUMNS FROM ventas LIKE 'metodo_pago'")->fetch();
                    if ($col && stripos($col['Type'], 'enum') !== false) {
                        $pdo->exec("ALTER TABLE ventas MODIFY COLUMN metodo_pago VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO'");
                    }
                    $cMon = $pdo->query("SELECT valor FROM configuracion WHERE clave='moneda'")->fetchColumn();
                    if ($cMon === false || $cMon === 'S/' || $cMon === 'PEN') {
                        $pdo->exec("INSERT INTO configuracion (clave, valor) VALUES 
                            ('moneda', '$'),
                            ('moneda_codigo', 'ARS'),
                            ('moneda_decimales', '2'),
                            ('sep_decimal', ','),
                            ('sep_miles', '.'),
                            ('moneda_posicion', 'antes'),
                            ('igv', '0'),
                            ('impuesto_nombre', 'IVA'),
                            ('zona_horaria', 'America/Argentina/Buenos_Aires')
                            ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
                    }
                } catch (Throwable $e) {}
            }"""

backup_and_replace(os.path.join(BASE_DIR, "config/database.php"), old_db, new_db)

# 16. dashboard.php - Reemplazar S/ por símbolos de moneda dinámicos
dash_file = os.path.join(BASE_DIR, "dashboard.php")
if os.path.exists(dash_file):
    with open(dash_file, "r", encoding="utf-8") as f:
        dcontent = f.read()
    dcontent = dcontent.replace('<b id="heroVentas">S/ 0.00</b>', '<b id="heroVentas"><?= e(moneda()) ?> 0.00</b>')
    dcontent = dcontent.replace('id="metaTxt">S/ 0</div>', 'id="metaTxt"><?= e(moneda()) ?> 0</div>')
    dcontent = dcontent.replace('id="cajaEsperado">S/ 0.00</div>', 'id="cajaEsperado"><?= e(moneda()) ?> 0.00</div>')
    dcontent = dcontent.replace('id="kVentas"><span class="sk">S/ 0,000</span>', 'id="kVentas"><span class="sk"><?= e(moneda()) ?> 0,000</span>')
    dcontent = dcontent.replace('id="kUtil"><span class="sk">S/ 0,000</span>', 'id="kUtil"><span class="sk"><?= e(moneda()) ?> 0,000</span>')
    dcontent = dcontent.replace('id="kMes"><span class="sk">S/ 00,000</span>', 'id="kMes"><span class="sk"><?= e(moneda()) ?> 00,000</span>')
    with open(dash_file, "w", encoding="utf-8") as f:
        f.write(dcontent)
    print("Dashboard actualizado con formato de moneda dinámico.")

print("=== Adaptaciones 100% completadas exitosamente ===")
