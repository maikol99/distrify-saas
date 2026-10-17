#!/usr/bin/env python3
"""
apply_alevia_customizations.py
Aplica las mejoras solicitadas:
1. Buscador superior principal con el diseño fachero de la Imagen 1:
   - Forma de píldora redondeada (border-radius 20px, altura 50px).
   - Borde naranja suave (#fdba74) con brillo al enfocar (#f97316).
   - Icono escáner a la izquierda, separador vertical sutil, selector 'Buscar por código v'.
   - Botón de lupa naranja vibrante (#f97316) con border-radius 14px y lupa blanca.
2. Eliminación total del espacio muerto entre la tarjeta 'MONTO RECIBIDO' y los botones:
   - Se quita el 'margin-top: auto' de la botonera inferior para que el botón morado quede pegado a la tarjeta de monto recibido (con solo un espacio natural de 8px).
   - Se agrupan los botones morado, verde y rojo de forma compacta y continua.
3. Se mantiene el diseño de las tarjetas de comprobante, ticket, búsqueda de clientes y egresos con sus categorías.
"""

BASE = '/var/www/html/sys_tienda'

# ─────────────────────────────────────────────────────────────────────────────
# 1. ACTUALIZAR modules/pos.php
# ─────────────────────────────────────────────────────────────────────────────
pos_php_content = r"""<?php
$extraCss[] = BASE_URL . '/assets/css/pos_alevia.css?v=' . ASSET_V;
$extraJs[] = BASE_URL . '/assets/js/pos.js?v=' . ASSET_V;
$igv = cfg('igv', '0');
?>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/pos_alevia.css?v=<?= ASSET_V ?>">
<script>
window.POS_IGV = <?= (float)$igv ?>;
window.POS_EMPRESA = <?= json_encode(cfg('empresa_nombre')) ?>;
window.POS_COT = <?= (int)($_GET['cot'] ?? 0) ?>;
document.body.classList.add('pos-page');
window.addEventListener('beforeunload', function(){ document.body.classList.remove('pos-page'); });
</script>

<div class="alevia-pos-container" id="pos">
  <!-- Barra Superior: Diseño Fachero Redondeado con Borde Naranja (Imagen 1) -->
  <div class="alevia-topbar">
    <div class="alevia-search-box">
      <i class="bi bi-upc-scan fs-5 text-muted ms-1"></i>
      <input type="text" id="pSearch" placeholder="Buscar producto por código de barras o nombre… (F3)" autocomplete="off" autofocus>
      <div class="search-sep"></div>
      <select id="searchMode">
        <option value="codigo">Buscar por código</option>
        <option value="nombre">Buscar por nombre</option>
      </select>
      <button class="alevia-btn-search" id="btnSearchGo" title="Buscar"><i class="bi bi-search"></i></button>
    </div>
    
    <div class="alevia-top-actions">
      <button class="btn-alevia-action btn-alevia-orange" id="btnQuickSale"><i class="bi bi-lightning-charge-fill"></i> Venta Rápida (F6)</button>
      <button class="btn-alevia-action btn-alevia-green" id="btnIngreso"><i class="bi bi-plus-circle"></i> Ingreso</button>
      <button class="btn-alevia-action btn-alevia-red" id="btnEgreso"><i class="bi bi-dash-circle"></i> Egreso</button>
    </div>
  </div>

  <!-- Contenedor Principal: Carrito Izquierda / Resumen Derecha -->
  <div class="alevia-pos-body">
    
    <!-- LADO IZQUIERDO: Carrito de productos -->
    <div class="alevia-cart-card">
      <div class="alevia-cart-head">
        <h5>Carrito de productos</h5>
        <div class="alevia-cart-actions">
          <button class="btn-icon-soft text-primary" id="btnCatalogToggle" title="Abrir catálogo / categorías (F2)"><i class="bi bi-grid-3x3-gap"></i></button>
          <button class="btn-icon-soft" id="btnHold" title="Ventas en espera"><i class="bi bi-pause-circle"></i> <span class="badge bg-primary text-white rounded-pill ms-1" id="holdCount" style="font-size:.65rem">0</span></button>
          <button class="btn-icon-soft danger" id="btnClear" title="Vaciar carrito (F4)"><i class="bi bi-trash3"></i></button>
        </div>
      </div>

      <!-- Área de productos en carrito -->
      <div class="alevia-cart-content" id="cart"></div>

      <!-- Pie del carrito: Resumen de métricas -->
      <div class="alevia-cart-footer">
        <div class="alevia-metric-box">
          <div class="alevia-metric-ic" style="background:#ffedd5;color:#f97316"><i class="bi bi-bag"></i></div>
          <div><small>Productos</small><b id="statProds">0</b></div>
        </div>
        <div class="alevia-metric-box">
          <div class="alevia-metric-ic" style="background:#e0f2fe;color:#0284c7"><i class="bi bi-grid"></i></div>
          <div><small>Ítems</small><b id="statItems">0</b></div>
        </div>
        <div class="alevia-metric-box">
          <div class="alevia-metric-ic" style="background:#dcfce7;color:#16a34a"><i class="bi bi-percent"></i></div>
          <div><small>Descuento</small><b id="statDesc"><?= e(moneda()) ?> 0,00</b></div>
        </div>
      </div>
    </div>

    <!-- LADO DERECHO: Resumen de Venta -->
    <div class="alevia-summary-card">
      <div class="alevia-summary-head">
        <h6>Resumen de Venta</h6>
        <button class="btn btn-sm btn-light text-primary p-1" style="border-radius:8px" title="Estadísticas de venta"><i class="bi bi-graph-up-arrow"></i></button>
      </div>

      <!-- Cliente: Diseño exacto (borde suave, lupa pastel naranja) -->
      <div class="alevia-client-input" id="cliBox">
        <i class="bi bi-person"></i>
        <input type="text" id="cliNameInput" value="Cliente Varios" placeholder="Buscar cliente" readonly>
        <button class="alevia-client-btn" id="btnSearchCli"><i class="bi bi-search"></i></button>
      </div>

      <!-- Botón Mostrar más / Ocultar (Pill Naranja suave) -->
      <div class="mb-1">
        <button type="button" class="btn-pill-orange" id="btnCliMore">Mostrar más</button>
      </div>

      <!-- Panel Desplegable de Descuento, Recargo, IVA -->
      <div id="boxMore" style="display:none;" class="mb-2 p-2 bg-light rounded-3 border">
        <!-- Descuento -->
        <div class="row g-2 align-items-center mb-2">
          <div class="col-4 small fw-semibold text-muted">Descuento:</div>
          <div class="col-5">
            <input type="number" min="0" step="any" id="descVal" class="form-control form-control-sm text-end" value="0">
          </div>
          <div class="col-3">
            <select id="descTipo" class="form-select form-select-sm">
              <option value="$">$</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>

        <!-- Recargo -->
        <div class="row g-2 align-items-center mb-2">
          <div class="col-4 small fw-semibold text-muted">Recargo:</div>
          <div class="col-5">
            <input type="number" min="0" step="any" id="recargoVal" class="form-control form-control-sm text-end" value="0">
          </div>
          <div class="col-3">
            <select id="recargoTipo" class="form-select form-select-sm">
              <option value="$">$</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>

        <!-- IVA (21%) -->
        <div class="row g-2 align-items-center">
          <div class="col-4 small fw-semibold text-muted">IVA (21%):</div>
          <div class="col-4">
            <button type="button" id="btnIvaToggle" class="btn btn-sm btn-outline-secondary py-0 px-2 fw-semibold" style="font-size:.78rem">Activar</button>
          </div>
          <div class="col-4 text-end small fw-bold" id="lblIvaMonto">$0.00</div>
        </div>
      </div>

      <!-- Subtotal permanente -->
      <div class="d-flex justify-content-between align-items-center small text-muted px-1 mb-1">
        <span class="fw-semibold">Subtotal:</span>
        <b class="fs-6 text-dark" id="tSub"><?= e(moneda()) ?> 0,00</b>
      </div>
      
      <div id="extraRows" class="small px-1"></div>
      
      <div id="ptsRow" class="d-flex justify-content-between align-items-center small mb-1 px-1" style="display:none!important">
        <span><i class="bi bi-stars text-warning"></i> Puntos <b id="ptsDisp">0</b></span>
        <span class="d-flex align-items-center gap-1">Canjear <input type="number" min="0" step="1" id="canje" class="form-control form-control-sm text-end" style="width:65px;height:24px" value="0"><button class="btn-soft" id="canjeMax" style="padding:0 .4rem;font-size:.68rem">Máx</button></span>
      </div>

      <!-- TOTAL A COBRAR (Card Oscura Alevia) -->
      <div class="alevia-total-card">
        <div>
          <div class="lbl">TOTAL A COBRAR</div>
          <div class="val" id="tTotal"><?= e(moneda()) ?> 0,00</div>
        </div>
        <div class="alevia-total-badge-ic">
          <i class="bi bi-cash-stack"></i>
        </div>
      </div>

      <!-- Método de Pago -->
      <span class="alevia-label">MÉTODO DE PAGO:</span>
      <select class="form-select alevia-pay-select mb-2" id="selectMetodo">
        <option value="EFECTIVO" selected>💵 Efectivo</option>
        <option value="MERCADOPAGO">📱 Mercado Pago (QR)</option>
        <option value="TRANSFERENCIA">🏦 Transferencia (Alias/CBU)</option>
        <option value="DEBITO">💳 Tarjeta Débito</option>
        <option value="TARJETA">💳 Tarjeta Crédito</option>
        <option value="CREDITO">📓 Fiado / Cta Cte</option>
      </select>

      <!-- Tarjeta: Imprimir ticket automáticamente -->
      <div class="alevia-ticket-card">
        <label class="alevia-ticket-check" for="checkPrintAuto">
          <input type="checkbox" id="checkPrintAuto" checked>
          <span class="custom-chk"></span>
          <span class="lbl-text">Imprimir ticket automáticamente</span>
        </label>
      </div>

      <!-- Tarjeta: MONTO RECIBIDO ($) -->
      <div id="cashBox" class="alevia-cash-card">
        <span class="alevia-card-label">MONTO RECIBIDO ($)</span>
        
        <div class="alevia-received-input">
          <span class="curr">$</span>
          <input type="number" step="any" min="0" id="recibido" placeholder="0">
        </div>

        <div class="alevia-quick-bills" id="quickBills">
          <button type="button" class="alevia-bill-btn active" data-v="exacto">Exacto</button>
          <button type="button" class="alevia-bill-btn" data-v="2000">$2.000</button>
          <button type="button" class="alevia-bill-btn" data-v="5000">$5.000</button>
          <button type="button" class="alevia-bill-btn" data-v="10000">$10.000</button>
          <button type="button" class="alevia-bill-btn" data-v="20000">$20.000</button>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-2 px-1 border-top" style="border-color:#f1f5f9!important">
          <small class="text-muted fw-semibold">Vuelto:</small>
          <b class="fs-5 num text-dark" id="vuelto"><?= e(moneda()) ?> 0,00</b>
        </div>
      </div>

      <!-- Botonera Inferior: Sin espacios vacíos, pegada directamente debajo de la card de monto -->
      <div class="alevia-action-footer">
        <!-- Botón Múltiples Medios (Morado con letras blancas) -->
        <button type="button" class="btn-multi-pago" id="btnMultiPago">
          <i class="bi bi-credit-card-2-front fs-5"></i>
          <span>Múltiples medios de pago</span>
        </button>

        <!-- Fila de VENTA y CANCELAR -->
        <div class="alevia-dual-btns">
          <button type="button" class="btn-alevia-venta" id="btnCobrar">
            <span class="d-flex align-items-center gap-2">
              <i class="bi bi-check2-circle fs-5"></i>
              <span>VENTA</span>
            </span>
            <span class="btn-badge-kbd">F4</span>
          </button>
          <button type="button" class="btn-alevia-cancel" id="btnCancelSale">
            <span class="d-flex align-items-center gap-2">
              <i class="bi bi-x-circle fs-5"></i>
              <span>CANCELAR</span>
            </span>
            <span class="btn-badge-kbd">ESC</span>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Caja cerrada overlay -->
  <div class="pos-lock" id="lock" style="display:none">
    <div class="cardx text-center" style="max-width:380px;border-radius:20px;padding:2rem">
      <div class="kpi-ic ic-amber mx-auto mb-3" style="width:64px;height:64px;font-size:1.8rem"><i class="bi bi-safe2"></i></div>
      <h5 class="fw-bold">Abre tu caja para vender</h5>
      <p class="text-muted small">Ingresa el efectivo inicial con el que empiezas el turno.</p>
      <input type="number" step="100" min="0" class="form-control form-control-lg text-center mb-3 fw-bold" id="apertura" placeholder="Monto inicial (<?= e(moneda()) ?>)" value="5000">
      <button class="btn-pos w-100 justify-content-center" id="btnAbrir"><i class="bi bi-unlock"></i> Abrir caja</button>
    </div>
  </div>
</div>

<!-- Modal Catálogo de Productos / Cuadrícula -->
<div class="modal fade" id="mdlCatalog" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content border-0" style="border-radius:22px">
      <div class="modal-header border-0 pb-0 px-4 pt-4">
        <h5 class="modal-title fw-bold"><i class="bi bi-grid me-2 text-primary"></i>Catálogo de Productos</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4">
        <div class="chips mb-3" id="chips"></div>
        <div class="prod-grid" id="grid" style="max-height:480px;overflow-y:auto"></div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Venta Rápida (F6) - Estilo Alevia Pay -->
<div class="modal fade" id="mdlQuick" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered" style="max-width: 440px">
    <div class="modal-content border-0 shadow-lg" style="border-radius:24px">
      <div class="modal-header border-0 pb-0 px-4 pt-4 d-flex align-items-start justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div style="width:48px;height:48px;border-radius:14px;background:#fff7ed;color:#f59e0b;display:grid;place-items:center;font-size:1.4rem;flex-shrink:0">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <div>
            <h5 class="fw-bold mb-0 text-dark">Venta Rápida</h5>
            <small class="text-muted">Para productos sin código de barras</small>
          </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body px-4 pt-3 pb-4">
        <!-- CONCEPTOS RÁPIDOS -->
        <label class="small fw-bold text-muted text-uppercase mb-2 d-block" style="letter-spacing:.05em">Conceptos Rápidos</label>
        <div class="d-flex flex-wrap gap-2 mb-3" id="quickConcepts">
          <button type="button" class="btn-quick-concept">Pan</button>
          <button type="button" class="btn-quick-concept">Caramelos</button>
          <button type="button" class="btn-quick-concept">Cigarrillos</button>
          <button type="button" class="btn-quick-concept">Hielo</button>
          <button type="button" class="btn-quick-concept">Fotocopias</button>
          <button type="button" class="btn-quick-concept">Bolsa</button>
          <button type="button" class="btn-quick-concept">Varios</button>
        </div>

        <!-- Producto / Concepto -->
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Producto / Concepto</label>
          <input type="text" class="form-control form-control-lg fs-6" id="qkConcepto" placeholder="Ej: Pan, Caramelos sueltos, Fotocopias" style="border-radius:12px;border:1.5px solid #fdba74">
        </div>

        <!-- Precio / Monto y Cantidad -->
        <div class="row g-2 mb-4">
          <div class="col-8">
            <label class="form-label small fw-bold text-dark mb-1">Precio / Monto ($)</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 fw-bold" style="border-radius:12px 0 0 12px">$</span>
              <input type="number" step="any" min="0" id="qkMonto" class="form-control form-control-lg fs-6 fw-bold border-start-0" placeholder="0.00" style="border-radius:0 12px 12px 0">
            </div>
          </div>
          <div class="col-4">
            <label class="form-label small fw-bold text-dark mb-1">Cantidad</label>
            <input type="number" step="any" min="1" id="qkCant" class="form-control form-control-lg fs-6 fw-bold text-center" value="1" style="border-radius:12px">
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-light px-3 py-2 fw-semibold text-muted" data-bs-dismiss="modal" style="border-radius:12px">Cancelar (ESC)</button>
          <button type="button" class="btn text-white px-3 py-2 fw-bold" id="btnQkAdd" style="background:#ea580c;border:0;border-radius:12px">
            <i class="bi bi-lightning-charge-fill me-1"></i> Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Movimientos de Caja (Ingreso / Egreso Rápido) -->
<div class="modal fade" id="mdlMovCaja" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered" style="max-width: 420px">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px">
      <div class="modal-header border-0 pb-0 px-4 pt-4">
        <h5 class="modal-title fw-bold text-dark" id="movTitle">Registrar Ingreso Rápido</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4 pt-3 pb-4">
        <input type="hidden" id="movTipo" value="INGRESO">
        
        <div class="mb-3">
          <input type="text" class="form-control form-control-lg fs-6" id="movDesc" placeholder="Descripción" style="border-radius:10px">
        </div>
        
        <div class="mb-3">
          <input type="number" step="any" min="0" class="form-control form-control-lg fs-6" id="movMonto" placeholder="0" style="border-radius:10px">
        </div>
        
        <div class="mb-3">
          <select class="form-select form-select-lg fs-6" id="movCat" style="border-radius:10px">
            <!-- Rellenado dinámicamente por JS según sea INGRESO o EGRESO -->
          </select>
        </div>
        
        <div class="mb-4">
          <select class="form-select form-select-lg fs-6" id="movMetodo" style="border-radius:10px">
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta de crédito">Tarjeta de crédito</option>
            <option value="Tarjeta de débito">Tarjeta de débito</option>
          </select>
        </div>
        
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-light px-4 py-2 fw-semibold text-muted" data-bs-dismiss="modal" style="border-radius:10px">Cancelar</button>
          <button type="button" class="btn btn-success px-4 py-2 fw-bold" id="btnMovSave" style="background:#10b981;border:0;border-radius:10px">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Clientes -->
<div class="modal fade" id="mdlCli" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0" style="border-radius:20px">
      <div class="modal-body p-4">
        <div class="d-flex justify-content-between mb-3"><h6 class="fw-bold m-0">Seleccionar cliente</h6><button class="btn-close" data-bs-dismiss="modal"></button></div>
        <input type="text" class="form-control mb-2" id="cliQ" placeholder="Buscar por nombre o documento…" autocomplete="off">
        <div id="cliList" style="max-height:260px;overflow:auto"></div>
        <hr><div class="fw-semibold small mb-2">Nuevo cliente rápido</div>
        <div class="row g-2">
          <div class="col-4"><select class="form-select form-select-sm" id="ncTipo"><option>DNI</option><option>CUIT</option><option>CUIL</option></select></div>
          <div class="col-8"><input class="form-control form-control-sm" id="ncDoc" placeholder="N° documento"></div>
          <div class="col-12"><input class="form-control form-control-sm" id="ncNombre" placeholder="Nombre / Razón social"></div>
          <div class="col-12"><button class="btn-soft w-100 justify-content-center" id="ncSave"><i class="bi bi-person-plus"></i> Guardar y usar</button></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Ventas en espera -->
<div class="modal fade" id="mdlHold" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0" style="border-radius:20px">
      <div class="modal-body p-4">
        <div class="d-flex justify-content-between mb-3"><h6 class="fw-bold m-0">Ventas en espera</h6><button class="btn-close" data-bs-dismiss="modal"></button></div>
        <div id="holdList"></div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Éxito Venta -->
<div class="modal fade" id="mdlOk" tabindex="-1" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content border-0 text-center" style="border-radius:22px">
      <div class="modal-body p-4">
        <div class="ok-ring mx-auto mb-3"><i class="bi bi-check-lg"></i></div>
        <h5 class="fw-bold mb-0">¡Venta registrada!</h5>
        <div class="text-muted small mb-2" id="okNro"></div>
        <div class="fs-2 fw-800 text-success mb-1" id="okTotal"></div>
        <div class="small text-muted mb-2" id="okVuelto"></div>
        <div class="small mb-3" id="okPts"></div>
        <div class="d-grid gap-2">
          <button class="btn btn-primary fw-bold" id="okPrint"><i class="bi bi-printer"></i> Imprimir ticket</button>
          <button class="btn text-white fw-bold" style="background:#25d366" id="okWa"><i class="bi bi-whatsapp me-1"></i> WhatsApp</button>
          <button class="btn btn-light fw-bold" id="okNew">Nueva venta <kbd>Enter</kbd></button>
        </div>
      </div>
    </div>
  </div>
</div>
"""

with open(f'{BASE}/modules/pos.php', 'w') as f:
    f.write(pos_php_content)
print("✅ modules/pos.php actualizado")

# ─────────────────────────────────────────────────────────────────────────────
# 2. ACTUALIZAR assets/css/pos_alevia.css
# ─────────────────────────────────────────────────────────────────────────────
pos_css_content = r"""/* ===== Alevia Pay POS Style ===== */

/* Contenedor principal del POS */
.alevia-pos-container {
  display: flex;
  flex-direction: column;
  gap: .85rem;
  min-height: calc(100vh - var(--top-h, 68px) - 2.5rem);
  color: #1e293b;
}

/* ─── Barra superior (Buscador Fachero con borde naranja) ─── */
.alevia-topbar {
  display: flex;
  align-items: center;
  gap: .75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.alevia-search-box {
  flex: 1;
  min-width: 280px;
  background: #ffffff;
  border: 1.5px solid #fdba74;
  border-radius: 20px;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 4px 6px 4px 14px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.06);
  transition: .15s;
}
.alevia-search-box:focus-within {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
}
.alevia-search-box input {
  border: 0;
  outline: none;
  font-size: .95rem;
  width: 100%;
  padding: .2rem .6rem;
  background: transparent;
  color: #1e293b;
}
.alevia-search-box input::placeholder {
  color: #94a3b8;
}
.alevia-search-box .search-sep {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 .4rem;
  flex-shrink: 0;
}
.alevia-search-box select {
  border: 0;
  outline: none;
  font-size: .86rem;
  font-weight: 500;
  color: #475569;
  background: transparent;
  padding: .2rem .5rem;
  cursor: pointer;
  flex-shrink: 0;
}
.alevia-btn-search {
  background: #f97316 !important;
  color: #ffffff !important;
  border: 0;
  border-radius: 14px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
  transition: .15s;
}
.alevia-btn-search:hover {
  background: #ea580c !important;
  transform: translateY(-1px);
}
.alevia-btn-search i {
  color: #ffffff !important;
}

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

/* ─── Grid Principal: Carrito (izq) y Resumen (der, 460px) ─── */
.alevia-pos-body {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 460px !important;
  gap: 1.15rem !important;
  flex: 1;
  min-height: 540px;
  align-items: start;
}

/* Card Carrito (izquierda) */
.alevia-cart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  min-height: 540px;
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

/* ─── Card Resumen (derecha, sin huecos verticales) ─── */
.alevia-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.alevia-summary-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .65rem;
}
.alevia-summary-head h6 { font-weight: 700; font-size: 1.05rem; margin: 0; }

/* Buscador de Cliente */
.alevia-client-input {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  height: 48px;
  padding: 4px 6px 4px 16px;
  margin-bottom: .5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: .15s;
}
.alevia-client-input:hover { border-color: #cbd5e1; }
.alevia-client-input i {
  color: #64748b;
  font-size: 1.15rem;
  margin-right: .5rem;
}
.alevia-client-input input {
  border: 0;
  outline: none;
  width: 100%;
  font-size: .95rem;
  color: #334155;
  background: transparent;
  cursor: pointer;
}
.alevia-client-btn {
  background: #fdba74 !important;
  color: #ffffff !important;
  border: 0;
  border-radius: 14px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: .15s;
}
.alevia-client-btn:hover { background: #fb923c !important; }
.alevia-client-btn i {
  color: #ffffff !important;
  font-size: .95rem !important;
  margin: 0 !important;
}

/* Botón Mostrar más / Ocultar */
.btn-pill-orange {
  background: #fff7ed;
  color: #ea580c;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
  font-size: .84rem;
  padding: .28rem .8rem;
  cursor: pointer;
  transition: .15s;
  display: inline-block;
}
.btn-pill-orange:hover {
  background: #ffedd5;
  color: #c2410c;
}

/* Tarjeta Oscura TOTAL A COBRAR */
.alevia-total-card {
  background: linear-gradient(135deg, #1e2235 0%, #0f172a 100%);
  color: #ffffff;
  border-radius: 14px;
  padding: 1rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: .5rem 0;
  box-shadow: 0 6px 18px -4px rgba(15,23,42,0.3);
}
.alevia-total-card .lbl {
  font-size: .7rem; font-weight: 700;
  letter-spacing: .08em; color: #cbd5e1;
  text-transform: uppercase;
}
.alevia-total-card .val {
  font-size: 1.95rem; font-weight: 800;
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
  letter-spacing: .05em; margin-bottom: .25rem; display: block;
}
.alevia-pay-select {
  border-radius: 10px; font-weight: 600;
  border-color: #cbd5e1; padding: .45rem .75rem; font-size: .9rem;
}

/* ─── Tarjeta: Imprimir ticket automáticamente ─── */
.alevia-ticket-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: .65rem .85rem;
  margin-bottom: .45rem;
  display: flex;
  align-items: center;
}
.alevia-ticket-check {
  display: flex;
  align-items: center;
  gap: .65rem;
  margin: 0;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.alevia-ticket-check input {
  display: none;
}
.alevia-ticket-check .custom-chk {
  width: 22px;
  height: 22px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  display: inline-grid;
  place-items: center;
  transition: .15s;
  flex-shrink: 0;
}
.alevia-ticket-check input:checked + .custom-chk {
  background: #10b981;
  border-color: #10b981;
}
.alevia-ticket-check input:checked + .custom-chk::after {
  content: "✓";
  color: #ffffff;
  font-size: .8rem;
  font-weight: 800;
}
.alevia-ticket-check .lbl-text {
  font-size: .88rem;
  font-weight: 500;
  color: #334155;
}

/* ─── Tarjeta: MONTO RECIBIDO ($) ─── */
.alevia-cash-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: .75rem .95rem;
  margin-bottom: .5rem;
}
.alevia-card-label {
  display: block;
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: .06em;
  color: #334155;
  text-transform: uppercase;
  margin-bottom: .4rem;
}
.alevia-received-input {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: .4rem .85rem;
  margin-bottom: .5rem;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
}
.alevia-received-input .curr {
  font-size: 1.05rem;
  font-weight: 700;
  color: #64748b;
  margin-right: .6rem;
}
.alevia-received-input input {
  border: 0;
  outline: none;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  width: 100%;
  background: transparent;
}

/* Billetes rápidos idénticos a la foto */
.alevia-quick-bills {
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
  margin-bottom: .55rem;
}
.alevia-bill-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  border-radius: 8px;
  padding: .3rem .65rem;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: .15s;
}
.alevia-bill-btn:hover {
  border-color: #f97316;
  color: #f97316;
}
.alevia-bill-btn.active {
  background: #f97316 !important;
  color: #ffffff !important;
  border-color: #f97316 !important;
  font-weight: 700;
}

/* ─── BOTONERA DE ACCIÓN INFERIOR: Pegada inmediatamente sin hueco ─── */
.alevia-action-footer {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-top: .15rem !important;
  padding-top: 0 !important;
}

/* Botón Múltiples Medios (Morado Grueso) */
.btn-multi-pago {
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
}

/* Fila de Venta y Cancelar */
.alevia-dual-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .5rem;
}

/* Botón VENTA (Grueso y Sólido con badge F4) */
.btn-alevia-venta {
  background: #10b981 !important;
  color: #ffffff !important;
  border: 0 !important;
  border-radius: 14px !important;
  font-weight: 800 !important;
  font-size: 1rem !important;
  height: 52px !important;
  padding: 0 1.15rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
  transition: .15s !important;
}
.btn-alevia-venta:hover {
  background: #059669 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

/* Botón CANCELAR (Grueso y Sólido con badge ESC) */
.btn-alevia-cancel {
  background: #ef4444 !important;
  color: #ffffff !important;
  border: 0 !important;
  border-radius: 14px !important;
  font-weight: 800 !important;
  font-size: 1rem !important;
  height: 52px !important;
  padding: 0 1.15rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3) !important;
  transition: .15s !important;
}
.btn-alevia-cancel:hover {
  background: #dc2626 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

/* Badge KBD translúcido dentro de los botones */
.btn-badge-kbd {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  border-radius: 8px;
  padding: .2rem .55rem;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .02em;
}

/* Botones de conceptos rápidos en Venta Rápida */
.btn-quick-concept {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: .84rem;
  padding: .35rem .75rem;
  border-radius: 9px;
  border: 0;
  transition: .15s;
  cursor: pointer;
}
.btn-quick-concept:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.btn-quick-concept.active {
  background: #ffedd5;
  color: #ea580c;
  font-weight: 700;
}

@media (max-width: 991px) {
  .alevia-pos-body {
    grid-template-columns: 1fr !important;
  }
}
"""

with open(f'{BASE}/assets/css/pos_alevia.css', 'w') as f:
    f.write(pos_css_content)
print("✅ assets/css/pos_alevia.css actualizado")

# ─────────────────────────────────────────────────────────────────────────────
# 3. ACTUALIZAR assets/js/pos.js
# ─────────────────────────────────────────────────────────────────────────────
pos_js_content = r"""/* Punto de Venta · Alevia Pay Style */
(function () {
  const $ = (s) => document.querySelector(s);
  const IGV = 0.21; // 21% IVA
  const CLI0 = { id: 1, nombre: 'Cliente Varios', documento: '', tipo_doc: '', saldo_deuda: 0, limite_credito: 0, puntos: 0, cumple: false, telefono: '' };
  const S = {
    cart: [],
    cli: { ...CLI0 },
    tipo: 'TICKET',
    metodo: 'EFECTIVO',
    cat: 0,
    busy: false,
    promos: [],
    fid: { cada: 1000, valor: 10, cumple: 10 },
    canje: 0,
    cot: 0,
    last: null,
    ivaActivo: false
  };
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  
  const mCli = new bootstrap.Modal($('#mdlCli'));
  const mHold = new bootstrap.Modal($('#mdlHold'));
  const mOk = new bootstrap.Modal($('#mdlOk'));
  const mCatalog = new bootstrap.Modal($('#mdlCatalog'));
  const mQuick = new bootstrap.Modal($('#mdlQuick'));
  const mMov = new bootstrap.Modal($('#mdlMovCaja'));
  
  let lastId = 0, prods = [];

  // ---------- Motor de Precios ----------
  function calcLinea(i) {
    let precio = +i.precio_venta;
    if (+i.cantidad_mayor > 0 && +i.precio_mayor > 0 && i.cant >= +i.cantidad_mayor) precio = +i.precio_mayor;
    const base = r2(i.cant * precio); let best = 0, name = null;
    for (const pr of S.promos) {
      const ok = pr.alcance === 'TODO' || (pr.alcance === 'PRODUCTO' && +pr.producto_id === +i.id) || (pr.alcance === 'CATEGORIA' && +pr.categoria_id === +i.categoria_id);
      if (!ok) continue; let d = 0;
      if (pr.tipo === 'PORCENTAJE') d = base * pr.valor / 100;
      else if (pr.tipo === 'MONTO') d = Math.min(base, pr.valor * i.cant);
      else if (pr.tipo === 'NXM' && pr.lleva > pr.paga && pr.lleva > 0) d = Math.floor(i.cant / pr.lleva) * (pr.lleva - pr.paga) * precio;
      d = r2(Math.min(d, base)); if (d > best) { best = d; name = pr.nombre; }
    }
    return { precio, base, desc: best, promo: name, sub: r2(base - best), mayor: precio !== +i.precio_venta && precio === +i.precio_mayor };
  }

  function calc() {
    let bruto = 0, dPromo = 0;
    S.cart.forEach((i) => { i.c = calcLinea(i); bruto += i.c.base; dPromo += i.c.desc; });
    let neto = r2(bruto - dPromo);

    // Descuento manual ($ o %)
    const dVal = +$('#descVal').value || 0;
    const dTipo = $('#descTipo').value;
    let manual = dTipo === '%' ? r2(neto * dVal / 100) : Math.min(dVal, neto);
    neto = r2(neto - manual);

    // Recargo manual ($ o %)
    const rVal = +$('#recargoVal').value || 0;
    const rTipo = $('#recargoTipo').value;
    let recargo = rTipo === '%' ? r2(neto * rVal / 100) : rVal;
    neto = r2(neto + recargo);

    // Cumpleaños
    const dCumple = S.cli.id !== 1 && S.cli.cumple ? r2(neto * S.fid.cumple / 100) : 0;
    neto = r2(neto - dCumple);

    // Puntos
    let canje = S.cli.id !== 1 ? Math.min(Math.max(0, Math.floor(S.canje)), S.cli.puntos || 0) : 0;
    let dPuntos = r2(canje * S.fid.valor);
    if (dPuntos > neto) { canje = Math.floor(neto / S.fid.valor); dPuntos = r2(canje * S.fid.valor); }
    neto = r2(neto - dPuntos);

    // IVA (21%) opcional
    let montoIva = 0;
    if (S.ivaActivo) {
      montoIva = r2(neto * IGV);
      neto = r2(neto + montoIva);
    }

    return { bruto, dPromo, manual, recargo, dCumple, dPuntos, canje, montoIva, total: Math.max(0, neto) };
  }

  const total = () => calc().total;

  // ---------- Caja ----------
  async function checkCaja() {
    const r = await api('caja.php?a=estado');
    $('#lock').style.display = r.caja ? 'none' : 'grid';
    if (!r.caja) setTimeout(() => $('#apertura').select(), 200);
  }
  $('#btnAbrir').onclick = async () => {
    try { await api('caja.php', { a: 'abrir', monto: $('#apertura').value }); toast('Caja abierta'); checkCaja(); $('#pSearch').focus(); } catch (e) { toast(e.message, 'danger'); }
  };

  // ---------- Catálogo ----------
  async function loadCats() {
    const r = await api('pos.php?a=categorias');
    $('#chips').innerHTML = `<button class="chip on" data-c="0"><i class="bi bi-grid"></i>Todos</button>` + r.rows.map((c) => `<button class="chip" data-c="${c.id}"><i class="bi ${esc(c.icono)}"></i>${esc(c.nombre)}</button>`).join('');
  }
  async function loadProds() {
    const r = await api(`pos.php?a=productos&q=${encodeURIComponent($('#pSearch').value.trim())}&cat=${S.cat}`);
    prods = r.rows; S.promos = r.promos || [];
    $('#grid').innerHTML = prods.length ? prods.map((p) => {
      const enCarrito = (S.cart.find((x) => x.id === p.id) || {}).cant || 0, disp = p.stock - enCarrito;
      return `<button class="pcard ${disp <= 0 ? 'out' : ''}" data-id="${p.id}">
        <div class="pi" style="background:${p.color}22;color:${p.color}">${p.imagen ? `<img src="${APP.base}/assets/uploads/productos/${esc(p.imagen)}" alt="">` : `<i class="bi ${esc(p.icono)}"></i>`}</div>
        <div class="pn">${esc(p.nombre)}</div><div class="pp">${money(p.precio_venta)}</div>${S.promos.some((q) => q.alcance === 'TODO' || (q.alcance === 'PRODUCTO' && +q.producto_id === +p.id) || (q.alcance === 'CATEGORIA' && +q.categoria_id === +p.categoria_id)) ? '<span class="promo-tag"><i class="bi bi-percent"></i>Promo</span>' : ''}${+p.cantidad_mayor > 0 && +p.precio_mayor > 0 ? `<div class="pm">Desde ${fmt(p.cantidad_mayor, 0)}: ${money(p.precio_mayor)}</div>` : ''}
        <div class="ps ${p.stock <= p.stock_minimo ? 'low' : ''}">${disp <= 0 ? 'Sin stock' : 'Stock: ' + fmt(disp, disp % 1 ? 2 : 0) + ' ' + esc(p.unidad)}</div></button>`;
    }).join('') : '<div class="empty" style="grid-column:1/-1"><i class="bi bi-search"></i>Sin productos para esta búsqueda</div>';
  }

  $('#chips').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; document.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); b.classList.add('on'); S.cat = +b.dataset.c; loadProds(); });
  $('#grid').addEventListener('click', (e) => { const b = e.target.closest('.pcard'); if (!b) return; const p = prods.find((x) => x.id === +b.dataset.id); b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 250); add(p); mCatalog.hide(); });
  $('#btnCatalogToggle').onclick = () => { mCatalog.show(); loadCats(); loadProds(); };

  // ---------- Búsqueda y Código de Barras ----------
  async function searchBarcodeOrName() {
    const v = $('#pSearch').value.trim();
    if (!v) return;
    const mode = $('#searchMode').value;
    const r = await api(`pos.php?a=productos&q=${encodeURIComponent(v)}&cat=0`);
    let exact = null;
    if (mode === 'codigo') {
      exact = r.rows.find((p) => p.codigo_barras === v || p.codigo.toLowerCase() === v.toLowerCase());
    } else {
      exact = r.rows.length === 1 ? r.rows[0] : r.rows.find((p) => p.nombre.toLowerCase() === v.toLowerCase());
    }
    if (exact) {
      add(exact);
      $('#pSearch').value = '';
    } else if (r.rows.length > 0) {
      prods = r.rows;
      mCatalog.show();
      loadCats();
      loadProds();
    } else {
      toast('Producto no encontrado', 'warning');
    }
  }

  $('#btnSearchGo').onclick = searchBarcodeOrName;
  $('#pSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBarcodeOrName();
    }
  });

  // ---------- Carrito ----------
  function add(p, n = 1) {
    let it = S.cart.find((x) => x.id === p.id);
    const nuevo = (it ? it.cant : 0) + n;
    if (nuevo > p.stock) return toast(`Stock máximo disponible: ${fmt(p.stock, p.stock % 1 ? 2 : 0)}`, 'warning');
    if (it) it.cant = nuevo;
    else S.cart.push({ id: p.id, nombre: p.nombre, unidad: p.unidad || 'UND', precio_venta: +p.precio_venta, precio_mayor: +p.precio_mayor || 0, cantidad_mayor: +p.cantidad_mayor || 0, categoria_id: p.categoria_id, cant: n, stock: +p.stock });
    render();
    const c = $('#cart'); c.scrollTop = c.scrollHeight;
  }

  function render() {
    const T = calc(), t = T.total;
    const totalItems = S.cart.reduce((a, b) => a + b.cant, 0);
    const totalDesc = T.dPromo + T.manual + T.dCumple + T.dPuntos;

    $('#statProds').textContent = S.cart.length;
    $('#statItems').textContent = totalItems % 1 ? fmt(totalItems, 2) : totalItems;
    $('#statDesc').textContent = money(totalDesc);

    if (!S.cart.length) {
      $('#cart').innerHTML = `
        <div class="alevia-empty-state">
          <div class="alevia-empty-circle">
            <i class="bi bi-cart3"></i>
          </div>
          <h5 class="fw-bold mb-1">Tu carrito está vacío</h5>
          <p class="text-muted small">Escaneá un código de barras o buscá un producto para comenzar</p>
        </div>`;
    } else {
      let rowsHtml = S.cart.map((i) => `
        <tr class="alevia-cart-row" data-id="${i.id}">
          <td style="width:48%">
            <div class="fw-bold text-dark text-truncate" style="max-width:240px">${esc(i.nombre)}</div>
            <div class="small text-muted">${money(i.c.precio)} / ${esc(i.unidad)}${i.c.promo ? ' <span class="badge bg-success-subtle text-success border border-success-subtle">' + esc(i.c.promo) + '</span>' : ''}</div>
          </td>
          <td style="width:22%">
            <div class="alevia-cart-stepper">
              <button data-q="-">−</button>
              <input type="number" step="any" min="0" value="${i.cant}" data-in>
              <button data-q="+">+</button>
            </div>
          </td>
          <td class="text-end fw-bold" style="width:20%">
            ${i.c.desc ? '<s class="text-muted small fw-normal d-block">' + money(i.c.base) + '</s>' : ''}
            ${money(i.c.sub)}
          </td>
          <td class="text-end" style="width:10%">
            <button class="btn btn-sm btn-light text-danger p-1" data-rm title="Quitar"><i class="bi bi-trash3"></i></button>
          </td>
        </tr>`).join('');

      $('#cart').innerHTML = `
        <div class="table-responsive">
          <table class="alevia-cart-table">
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th class="text-end">Subtotal</th><th></th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
    }

    const row = (l, v, c) => `<div class="d-flex justify-content-between ${c || 'text-success'}"><span>${l}</span><b class="num">− ${money(v)}</b></div>`;
    $('#extraRows').innerHTML = (T.dPromo ? row('<i class="bi bi-percent"></i> Promociones', T.dPromo) : '') + (T.dCumple ? row('<i class="bi bi-gift"></i> Cumpleaños', T.dCumple) : '') + (T.dPuntos ? row('<i class="bi bi-stars"></i> Puntos canjeados (' + T.canje + ')', T.dPuntos) : '');
    
    const pr = $('#ptsRow'), tiene = S.cli.id !== 1 && S.cli.puntos > 0;
    pr.style.setProperty('display', tiene ? 'flex' : 'none', 'important');
    $('#ptsDisp').textContent = S.cli.puntos || 0;

    $('#tSub').textContent = money(T.bruto);
    $('#lblIvaMonto').textContent = money(T.montoIva);
    $('#tTotal').textContent = money(t);
    vuelto();
    $('#btnCobrar').disabled = !S.cart.length || S.busy;
  }

  $('#cart').addEventListener('click', (e) => {
    const row = e.target.closest('.alevia-cart-row'); if (!row) return; const it = S.cart.find((x) => x.id === +row.dataset.id);
    if (e.target.closest('[data-rm]')) S.cart = S.cart.filter((x) => x !== it);
    const q = e.target.closest('[data-q]');
    if (q) {
      const n = it.cant + (q.dataset.q === '+' ? 1 : -1);
      if (n <= 0) S.cart = S.cart.filter((x) => x !== it);
      else if (n > it.stock) return toast('Sin más stock disponible', 'warning');
      else it.cant = n;
    }
    render();
  });

  $('#cart').addEventListener('change', (e) => {
    if (!e.target.matches('[data-in]')) return;
    const it = S.cart.find((x) => x.id === +e.target.closest('.alevia-cart-row').dataset.id);
    let n = parseFloat(e.target.value);
    if (!(n > 0)) S.cart = S.cart.filter((x) => x !== it);
    else if (n > it.stock) { toast(`Stock máximo: ${it.stock}`, 'warning'); it.cant = it.stock; }
    else it.cant = Math.round(n * 100) / 100;
    render();
  });

  // ---------- Mostrar más / Ocultar ----------
  $('#btnCliMore').onclick = () => {
    const box = $('#boxMore');
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';
    $('#btnCliMore').textContent = isHidden ? 'Ocultar' : 'Mostrar más';
  };

  $('#descVal').addEventListener('input', render);
  $('#descTipo').addEventListener('change', render);
  $('#recargoVal').addEventListener('input', render);
  $('#recargoTipo').addEventListener('change', render);

  $('#btnIvaToggle').onclick = () => {
    S.ivaActivo = !S.ivaActivo;
    $('#btnIvaToggle').textContent = S.ivaActivo ? 'Desactivar' : 'Activar';
    $('#btnIvaToggle').className = S.ivaActivo ? 'btn btn-sm btn-primary py-0 px-2 fw-semibold' : 'btn btn-sm btn-outline-secondary py-0 px-2 fw-semibold';
    render();
  };

  $('#canje').addEventListener('input', () => { S.canje = Math.max(0, parseInt($('#canje').value) || 0); render(); });
  $('#canjeMax').onclick = () => { S.canje = S.cli.puntos; render(); const T = calc(); S.canje = T.canje; $('#canje').value = T.canje; render(); };
  
  $('#btnClear').onclick = async () => {
    if (S.cart.length && await confirmBox('Se quitarán todos los productos de la venta actual.', '¿Vaciar carrito?', 'Vaciar', true)) reset();
  };
  $('#btnCancelSale').onclick = () => $('#btnClear').click();

  function reset() {
    S.cart = []; S.cot = 0; $('#descVal').value = 0; $('#recargoVal').value = 0; $('#recibido').value = '';
    S.ivaActivo = false; $('#btnIvaToggle').textContent = 'Activar'; $('#btnIvaToggle').className = 'btn btn-sm btn-outline-secondary py-0 px-2 fw-semibold';
    setCli({ ...CLI0 }); setMetodo('EFECTIVO');
    render(); $('#pSearch').focus();
  }

  // ---------- Pago y Billetes ----------
  function vuelto() {
    const v = (+$('#recibido').value || 0) - total();
    $('#vuelto').textContent = money(v > 0 ? v : 0);
    $('#vuelto').style.color = v < 0 && $('#recibido').value ? 'var(--rose)' : '';
  }
  $('#recibido').addEventListener('input', vuelto);

  $('#quickBills').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    document.querySelectorAll('#quickBills button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    const v = b.dataset.v;
    if (v === 'exacto') $('#recibido').value = total().toFixed(2);
    else $('#recibido').value = (+v).toFixed(2);
    vuelto();
  });

  function setMetodo(m) {
    S.metodo = m;
    $('#selectMetodo').value = m;
    $('#cashBox').style.display = m === 'EFECTIVO' ? '' : 'none';
    if (m === 'EFECTIVO') $('#recibido').focus();
  }
  $('#selectMetodo').addEventListener('change', (e) => setMetodo(e.target.value));

  // ---------- Cliente ----------
  function setCli(c) {
    S.cli = c;
    $('#cliNameInput').value = c.nombre;
    render();
  }
  $('#cliBox').onclick = () => { mCli.show(); $('#cliQ').value = ''; loadCli(); setTimeout(() => $('#cliQ').focus(), 300); };
  $('#btnSearchCli').onclick = (e) => { e.stopPropagation(); $('#cliBox').click(); };

  async function loadCli() {
    const r = await api(`pos.php?a=clientes&q=${encodeURIComponent($('#cliQ').value.trim())}`);
    $('#cliList').innerHTML = r.rows.map((c) => `
      <div class="cl-item p-2 border-bottom" data-id="${c.id}">
        <div><b>${esc(c.nombre)}</b> <small class="text-muted">· ${c.documento || 'Sin doc'}</small></div>
        <span class="badge bg-light text-dark border">Seleccionar</span>
      </div>`).join('');
  }
  $('#cliQ').addEventListener('input', debounce(loadCli, 200));
  $('#cliList').addEventListener('click', async (e) => {
    const row = e.target.closest('.cl-item'); if (!row) return;
    const r = await api(`pos.php?a=cliente&id=${row.dataset.id}`);
    setCli(r.cliente); mCli.hide();
  });

  $('#ncSave').onclick = async () => {
    const d = { tipo_doc: $('#ncTipo').value, documento: $('#ncDoc').value.trim(), nombre: $('#ncNombre').value.trim() };
    if (!d.nombre) return toast('Ingresa el nombre del cliente', 'warning');
    try {
      const r = await api('pos.php', { a: 'cliente_nuevo', ...d });
      setCli(r.cliente); mCli.hide(); toast('Cliente registrado');
    } catch (e) { toast(e.message, 'danger'); }
  };

  // ---------- Modal Venta Rápida (F6) ----------
  $('#btnQuickSale').onclick = () => {
    mQuick.show();
    $('#qkMonto').value = '';
    $('#qkCant').value = 1;
    $('#qkConcepto').value = '';
    document.querySelectorAll('.btn-quick-concept').forEach(b => b.classList.remove('active'));
    setTimeout(() => $('#qkConcepto').focus(), 300);
  };

  $('#quickConcepts').addEventListener('click', (e) => {
    const b = e.target.closest('.btn-quick-concept');
    if (!b) return;
    document.querySelectorAll('.btn-quick-concept').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $('#qkConcepto').value = b.textContent.trim();
    $('#qkMonto').focus();
  });

  $('#btnQkAdd').onclick = () => {
    const m = parseFloat($('#qkMonto').value);
    const cant = parseFloat($('#qkCant').value) || 1;
    if (!(m > 0)) return toast('Ingresa un monto válido', 'warning');
    const nom = $('#qkConcepto').value.trim() || 'Venta rápida';
    add({ id: 999000 + Math.floor(Math.random()*999), nombre: nom, unidad: 'UND', precio_venta: m, precio_mayor: 0, cantidad_mayor: 0, categoria_id: 1, stock: 9999 }, cant);
    mQuick.hide();
  };

  // ---------- Modal Movimientos de Caja (Ingreso / Egreso Rápido) ----------
  function openMovCaja(tipo) {
    $('#movTipo').value = tipo;
    const isIngreso = tipo === 'INGRESO';
    $('#movTitle').textContent = isIngreso ? 'Registrar Ingreso Rápido' : 'Registrar Egreso Rápido';
    $('#btnMovSave').className = isIngreso ? 'btn btn-success px-4 py-2 fw-bold' : 'btn btn-danger px-4 py-2 fw-bold';
    $('#btnMovSave').style.background = isIngreso ? '#10b981' : '#ef4444';
    $('#movDesc').value = '';
    $('#movMonto').value = '';

    const catSelect = $('#movCat');
    if (isIngreso) {
      catSelect.innerHTML = `
        <option value="Ventas">Ventas</option>
        <option value="Cobro de cuenta corriente">Cobro de cuenta corriente</option>
        <option value="Aporte de socios">Aporte de socios</option>
        <option value="Otros">Otros</option>
      `;
    } else {
      catSelect.innerHTML = `
        <option value="Otros">Otros</option>
        <option value="Alquiler">Alquiler</option>
        <option value="Servicios">Servicios</option>
        <option value="Sueldos">Sueldos</option>
        <option value="Impuestos">Impuestos</option>
      `;
    }

    $('#movMetodo').value = 'Efectivo';
    mMov.show();
    setTimeout(() => $('#movDesc').focus(), 300);
  }
  $('#btnIngreso').onclick = () => openMovCaja('INGRESO');
  $('#btnEgreso').onclick = () => openMovCaja('EGRESO');

  $('#btnMovSave').onclick = async () => {
    const tipo = $('#movTipo').value;
    const desc = $('#movDesc').value.trim();
    const monto = parseFloat($('#movMonto').value);
    const cat = $('#movCat').value;
    const metodo = $('#movMetodo').value;

    if (!(monto > 0)) return toast('Ingresa un monto válido mayor a 0', 'warning');
    const concepto = `${cat} · ${metodo}${desc ? ': ' + desc : ''}`;

    try {
      await api('caja.php', { a: 'movimiento', tipo, concepto, monto });
      toast(`${tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado con éxito`);
      mMov.hide();
    } catch (e) { toast(e.message, 'danger'); }
  };

  // ---------- Cobrar ----------
  async function cobrar() {
    if (!S.cart.length || S.busy) return;
    const t = total();
    if (S.metodo === 'EFECTIVO' && !(+$('#recibido').value >= t)) {
      $('#recibido').focus();
      return toast('Ingresa el monto recibido (≥ total)', 'warning');
    }
    S.busy = true;
    $('#btnCobrar').disabled = true;
    $('#btnCobrar').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando…';
    try {
      const T = calc(), snap = { items: S.cart.map((i) => ({ n: i.nombre, q: i.cant, s: i.c.sub })), cli: S.cli };
      const r = await api('pos.php', {
        a: 'venta',
        items: S.cart.map((i) => ({ id: i.id, cant: i.cant })),
        cliente_id: S.cli.id,
        tipo: 'TICKET',
        metodo: S.metodo,
        recibido: +$('#recibido').value || 0,
        descuento: T.manual,
        canje_puntos: T.canje,
        cotizacion_id: S.cot
      });
      S.last = { ...snap, nro: r.nro, total: r.total, tel: r.telefono, pts: r.puntos };
      lastId = r.id;
      $('#okNro').textContent = r.nro;
      $('#okTotal').textContent = money(r.total);
      $('#okVuelto').textContent = r.vuelto !== null ? 'Vuelto: ' + money(r.vuelto) : 'Pago: ' + S.metodo.toLowerCase();
      $('#okPts').innerHTML = r.puntos ? `<i class="bi bi-stars text-warning"></i> Puntos ganados: <b>${r.puntos}</b>` : '';
      mOk.show();
      setTimeout(() => $('#okNew').focus(), 300);

      // Impresión de ticket si está marcado
      if ($('#checkPrintAuto').checked && Imprimir.directa()) {
        Imprimir.ticket(lastId);
      }
    } catch (e) {
      toast(e.message, 'danger');
    }
    S.busy = false;
    $('#btnCobrar').innerHTML = `
      <span class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-circle fs-5"></i>
        <span>VENTA</span>
      </span>
      <span class="btn-badge-kbd">F4</span>
    `;
    render();
  }

  $('#btnCobrar').onclick = cobrar;
  $('#okNew').onclick = () => { mOk.hide(); reset(); };
  $('#okPrint').onclick = () => Imprimir.ticket(lastId);

  // ---------- Atajos de Teclado ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') { e.preventDefault(); $('#btnCatalogToggle').click(); }
    if (e.key === 'F3') { e.preventDefault(); $('#pSearch').focus(); $('#pSearch').select(); }
    if (e.key === 'F4') { e.preventDefault(); cobrar(); }
    if (e.key === 'F6') { e.preventDefault(); $('#btnQuickSale').click(); }
    if (e.key === 'Escape') {
      if (document.querySelector('.modal.show')) return;
      e.preventDefault();
      $('#btnCancelSale').click();
    }
  });

  // Inicio
  checkCaja();
  render();
})();
"""

with open(f'{BASE}/assets/js/pos.js', 'w') as f:
    f.write(pos_js_content)
print("✅ assets/js/pos.js actualizado")

print("\n🎉 ¡Buscador fachero y eliminación de espacios en blanco completados!")
