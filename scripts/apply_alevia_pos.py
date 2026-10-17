import os

BASE_DIR = "/var/www/html/sys_tienda"

# 1. Crear el archivo CSS específico para Alevia Pay POS
POS_CSS = """/* ===== Alevia Pay POS Style ===== */
.alevia-pos-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - var(--top-h) - 3rem);
  color: #1e293b;
}

/* Barra superior */
.alevia-topbar {
  display: flex;
  align-items: center;
  gap: .75rem;
  flex-wrap: wrap;
}
.alevia-search-box {
  flex: 1;
  min-width: 300px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: .35rem .6rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
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
.alevia-btn-search:hover {
  background: #ea580c;
  color: #ffffff;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  transition: .15s;
}
.btn-alevia-action:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  color: #ffffff;
}
.btn-alevia-orange { background: #f59e0b; }
.btn-alevia-green  { background: #10b981; }
.btn-alevia-red    { background: #f43f5e; }

/* Grid principal: Carrito a la izquierda, Resumen a la derecha */
.alevia-pos-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 1.25rem;
  flex: 1;
  min-height: 0;
}

/* Card Carrito */
.alevia-cart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.alevia-cart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .8rem;
  padding-bottom: .6rem;
}
.alevia-cart-head h5 {
  font-weight: 700;
  font-size: 1.15rem;
  margin: 0;
}
.alevia-cart-actions {
  display: flex;
  gap: .4rem;
}
.btn-icon-soft {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  border-radius: 9px;
  display: grid;
  place-items: center;
  transition: .15s;
}
.btn-icon-soft:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.btn-icon-soft.danger:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* Lista de Carrito */
.alevia-cart-content {
  flex: 1;
  overflow-y: auto;
  min-height: 180px;
}
.alevia-empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
.alevia-empty-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #fff7ed;
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
}
.alevia-empty-circle i {
  font-size: 2.2rem;
  color: #f97316;
}

/* Tabla del Carrito */
.alevia-cart-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 .4rem;
}
.alevia-cart-table th {
  font-size: .75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: .04em;
  padding: .4rem .6rem;
  border-bottom: 1px solid #f1f5f9;
}
.alevia-cart-row {
  background: #f8fafc;
  border-radius: 10px;
  transition: .15s;
}
.alevia-cart-row td {
  padding: .65rem .6rem;
  vertical-align: middle;
}
.alevia-cart-row:hover {
  background: #f1f5f9;
}
.alevia-cart-stepper {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.alevia-cart-stepper button {
  border: 0;
  background: transparent;
  width: 26px;
  height: 28px;
  font-weight: 700;
  color: #475569;
  display: grid;
  place-items: center;
}
.alevia-cart-stepper button:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.alevia-cart-stepper input {
  width: 38px;
  border: 0;
  text-align: center;
  font-weight: 700;
  font-size: .85rem;
  outline: none;
  background: transparent;
}

/* Tarjetas métricas al pie del carrito */
.alevia-cart-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
  padding-top: .9rem;
  border-top: 1px solid #f1f5f9;
  margin-top: .5rem;
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.alevia-metric-box small {
  display: block;
  font-size: .7rem;
  color: #64748b;
  font-weight: 500;
}
.alevia-metric-box b {
  font-size: 1.05rem;
  color: #0f172a;
}

/* Card Resumen de Venta */
.alevia-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.alevia-summary-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .8rem;
}
.alevia-summary-head h6 {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0;
}

/* Buscador de Cliente */
.alevia-client-input {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: .2rem .4rem;
  margin-bottom: .3rem;
}
.alevia-client-input i {
  color: #94a3b8;
  padding: 0 .4rem;
}
.alevia-client-input input {
  border: 0;
  outline: none;
  width: 100%;
  font-size: .88rem;
  background: transparent;
  cursor: pointer;
}
.alevia-client-btn {
  background: #f97316;
  color: #ffffff;
  border: 0;
  border-radius: 7px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* Tarjeta Oscura TOTAL A COBRAR */
.alevia-total-card {
  background: linear-gradient(135deg, #1e2235 0%, #0f172a 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 1.15rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: .8rem 0;
  box-shadow: 0 8px 20px -4px rgba(15,23,42,0.3);
}
.alevia-total-card .lbl {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  color: #cbd5e1;
  text-transform: uppercase;
}
.alevia-total-card .val {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -.02em;
}
.alevia-total-badge-ic {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(245,158,11,0.18);
  color: #f59e0b;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
}

/* Selector Método de Pago */
.alevia-label {
  font-size: .72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: .05em;
  margin-bottom: .35rem;
  display: block;
}
.alevia-pay-select {
  border-radius: 10px;
  font-weight: 600;
  border-color: #cbd5e1;
  padding: .5rem .75rem;
  font-size: .9rem;
}

/* Billetes rápidos */
.alevia-quick-bills {
  display: flex;
  gap: .35rem;
  flex-wrap: wrap;
  margin-top: .4rem;
  margin-bottom: .75rem;
}
.alevia-bill-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  border-radius: 8px;
  padding: .2rem .55rem;
  font-size: .76rem;
  font-weight: 700;
  transition: .15s;
}
.alevia-bill-btn:hover {
  border-color: #f97316;
  color: #f97316;
}
.alevia-bill-btn.active {
  background: #f97316;
  color: #ffffff;
  border-color: #f97316;
}

/* Botón Múltiples Medios */
.btn-multi-pago {
  background: #ede9fe;
  color: #6d28d9;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: .86rem;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  margin-bottom: .8rem;
  transition: .15s;
}
.btn-multi-pago:hover {
  background: #ddd6fe;
  color: #5b21b6;
}

/* Botonera de Acción Inferior */
.alevia-action-footer {
  display: flex;
  gap: .6rem;
  margin-top: auto;
  padding-top: .5rem;
}
.btn-alevia-venta {
  flex: 1;
  background: #10b981;
  color: #ffffff;
  border: 0;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  transition: .15s;
}
.btn-alevia-venta:hover {
  background: #059669;
  color: #ffffff;
}
.btn-alevia-cancel {
  background: #fee2e2;
  color: #ef4444;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: .9rem;
  height: 50px;
  padding: 0 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  transition: .15s;
}
.btn-alevia-cancel:hover {
  background: #fecdd3;
  color: #dc2626;
}

@media (max-width: 991px) {
  .alevia-pos-body {
    grid-template-columns: 1fr;
    height: auto;
  }
}
"""

with open(os.path.join(BASE_DIR, "assets/css/pos_alevia.css"), "w", encoding="utf-8") as f:
    f.write(POS_CSS)
print("✓ Creado assets/css/pos_alevia.css")


# 2. Actualizar modules/pos.php con la estructura exacta de Alevia Pay
NEW_POS_PHP = """<?php
$extraCss[] = BASE_URL . '/assets/css/pos_alevia.css?v=' . ASSET_V;
$extraJs[] = BASE_URL . '/assets/js/pos.js?v=' . ASSET_V;
$igv = cfg('igv', '0');
?>
<script>
window.POS_IGV = <?= (float)$igv ?>;
window.POS_EMPRESA = <?= json_encode(cfg('empresa_nombre')) ?>;
window.POS_COT = <?= (int)($_GET['cot'] ?? 0) ?>;
</script>

<div class="alevia-pos-container" id="pos">
  <!-- Barra Superior -->
  <div class="alevia-topbar">
    <div class="alevia-search-box">
      <i class="bi bi-upc-scan fs-5 text-muted ms-1"></i>
      <input type="text" id="pSearch" placeholder="Buscar producto por código de barras o nombre… (F3)" autocomplete="off" autofocus>
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

      <!-- Cliente -->
      <div class="alevia-client-input" id="cliBox">
        <i class="bi bi-person"></i>
        <input type="text" id="cliNameInput" value="Cliente Varios" placeholder="Buscar cliente" readonly>
        <button class="alevia-client-btn" id="btnSearchCli"><i class="bi bi-search"></i></button>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-2 px-1">
        <a href="#" class="small fw-semibold text-decoration-none" style="color:#f97316" id="btnCliMore">Mostrar más</a>
        <div class="d-flex align-items-center gap-1 small text-muted">
          <span>Desc:</span>
          <input type="number" min="0" step="10" id="desc" class="form-control form-control-sm text-end" style="width:75px;padding:.1rem .35rem;height:26px" value="0">
        </div>
      </div>

      <!-- Subtotal y puntos -->
      <div class="d-flex justify-content-between align-items-center small text-muted px-1 mb-1">
        <span>Subtotal:</span>
        <b class="fs-6 text-dark" id="tSub"><?= e(moneda()) ?> 0,00</b>
      </div>
      
      <div id="extraRows" class="small px-1"></div>
      
      <div id="ptsRow" class="d-flex justify-content-between align-items-center small mb-1 px-1" style="display:none!important">
        <span><i class="bi bi-stars text-warning"></i> Puntos <b id="ptsDisp">0</b></span>
        <span class="d-flex align-items-center gap-1">Canjear <input type="number" min="0" step="1" id="canje" class="form-control form-control-sm text-end" style="width:65px;height:24px" value="0"><button class="btn-soft" id="canjeMax" style="padding:0 .4rem;font-size:.68rem">Máx</button></span>
      </div>

      <!-- Tipo de Comprobante -->
      <div class="seg w-100 my-2" id="segTipo">
        <button data-t="TICKET" class="on flex-fill">Ticket</button>
        <button data-t="BOLETA" class="flex-fill">Factura B</button>
        <button data-t="FACTURA" class="flex-fill">Factura A</button>
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

      <!-- Checkbox Ticket -->
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="checkPrintAuto" checked>
        <label class="form-check-label small text-muted" for="checkPrintAuto">Imprimir ticket automáticamente</label>
      </div>

      <!-- Monto recibido (para Efectivo) -->
      <div id="cashBox">
        <span class="alevia-label">MONTO RECIBIDO ($)</span>
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0 fw-bold"><?= e(moneda()) ?></span>
          <input type="number" step="10" min="0" id="recibido" class="form-control border-start-0 fs-5 fw-bold" placeholder="0">
        </div>
        <div class="alevia-quick-bills" id="quickBills">
          <button type="button" class="alevia-bill-btn active" data-v="exacto">Exacto</button>
          <button type="button" class="alevia-bill-btn" data-v="1000">$1.000</button>
          <button type="button" class="alevia-bill-btn" data-v="2000">$2.000</button>
          <button type="button" class="alevia-bill-btn" data-v="5000">$5.000</button>
          <button type="button" class="alevia-bill-btn" data-v="10000">$10.000</button>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2 px-1">
          <small class="text-muted">Vuelto:</small>
          <b class="fs-5 num" id="vuelto"><?= e(moneda()) ?> 0,00</b>
        </div>
      </div>

      <!-- Múltiples medios de pago -->
      <button type="button" class="btn-multi-pago" id="btnMultiPago">
        <i class="bi bi-wallet2"></i> Múltiples medios de pago
      </button>

      <!-- Botones de Acción VENTA (F4) y CANCELAR (ESC) -->
      <div class="alevia-action-footer">
        <button type="button" class="btn-alevia-venta" id="btnCobrar">
          <i class="bi bi-check2-circle fs-5"></i> VENTA <kbd style="background:rgba(255,255,255,0.25);font-size:.7rem">F4</kbd>
        </button>
        <button type="button" class="btn-alevia-cancel" id="btnCancelSale">
          <i class="bi bi-x-circle"></i> CANCELAR <kbd style="background:rgba(239,68,68,0.15);font-size:.7rem">ESC</kbd>
        </button>
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

<!-- Modal Venta Rápida (F6) -->
<div class="modal fade" id="mdlQuick" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content border-0" style="border-radius:20px">
      <div class="modal-header border-0 pb-0 px-3 pt-3">
        <h6 class="modal-title fw-bold"><i class="bi bi-lightning-charge-fill text-warning me-1"></i>Venta Rápida</h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-3">
        <label class="form-label small text-muted">Concepto / Producto:</label>
        <input type="text" class="form-control mb-2" id="qkConcepto" value="Venta varios / Kiosco">
        <label class="form-label small text-muted">Monto total (<?= e(moneda()) ?>):</label>
        <input type="number" step="10" min="1" class="form-control fs-5 fw-bold mb-3" id="qkMonto" placeholder="0.00" autofocus>
        <button type="button" class="btn btn-warning w-100 fw-bold text-white" id="btnQkAdd" style="background:#f97316;border:0;height:42px">Agregar al Carrito</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal Movimientos de Caja (Ingreso / Egreso) -->
<div class="modal fade" id="mdlMovCaja" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content border-0" style="border-radius:20px">
      <div class="modal-header border-0 pb-0 px-3 pt-3">
        <h6 class="modal-title fw-bold" id="movTitle">Movimiento de Caja</h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-3">
        <input type="hidden" id="movTipo" value="INGRESO">
        <label class="form-label small text-muted">Motivo / Concepto:</label>
        <input type="text" class="form-control mb-2" id="movConcepto" placeholder="Ej: Cambio, Pago proveedor...">
        <label class="form-label small text-muted">Monto (<?= e(moneda()) ?>):</label>
        <input type="number" step="10" min="1" class="form-control fs-5 fw-bold mb-3" id="movMonto" placeholder="0.00">
        <button type="button" class="btn w-100 fw-bold text-white" id="btnMovSave" style="height:42px">Registrar</button>
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

with open(os.path.join(BASE_DIR, "modules/pos.php"), "w", encoding="utf-8") as f:
    f.write(NEW_POS_PHP)
print("✓ Actualizado modules/pos.php")


# 3. Actualizar assets/js/pos.js para controlar la nueva interfaz
NEW_POS_JS = """/* Punto de Venta · Alevia Pay Style */
(function () {
  const $ = (s) => document.querySelector(s);
  const IGV = (window.POS_IGV || 0) / 100;
  const CLI0 = { id: 1, nombre: 'Cliente Varios', documento: '', tipo_doc: '', saldo_deuda: 0, limite_credito: 0, puntos: 0, cumple: false, telefono: '' };
  const S = { cart: [], cli: { ...CLI0 }, tipo: 'TICKET', metodo: 'EFECTIVO', cat: 0, busy: false, promos: [], fid: { cada: 1000, valor: 10, cumple: 10 }, canje: 0, cot: 0, last: null };
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
    let neto = r2(bruto - dPromo); const manual = Math.min(r2(+$('#desc').value || 0), neto); neto = r2(neto - manual);
    const dCumple = S.cli.id !== 1 && S.cli.cumple ? r2(neto * S.fid.cumple / 100) : 0; neto = r2(neto - dCumple);
    let canje = S.cli.id !== 1 ? Math.min(Math.max(0, Math.floor(S.canje)), S.cli.puntos || 0) : 0, dPuntos = r2(canje * S.fid.valor);
    if (dPuntos > neto) { canje = Math.floor(neto / S.fid.valor); dPuntos = r2(canje * S.fid.valor); }
    neto = r2(neto - dPuntos);
    return { bruto, dPromo, manual, dCumple, dPuntos, canje, total: Math.max(0, neto) };
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
    else S.cart.push({ id: p.id, nombre: p.nombre, unidad: p.unidad, precio_venta: +p.precio_venta, precio_mayor: +p.precio_mayor || 0, cantidad_mayor: +p.cantidad_mayor || 0, categoria_id: p.categoria_id, cant: n, stock: +p.stock });
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

  $('#desc').addEventListener('input', render);
  $('#canje').addEventListener('input', () => { S.canje = Math.max(0, parseInt($('#canje').value) || 0); render(); });
  $('#canjeMax').onclick = () => { S.canje = S.cli.puntos; render(); const T = calc(); S.canje = T.canje; $('#canje').value = T.canje; render(); };
  
  $('#btnClear').onclick = async () => {
    if (S.cart.length && await confirmBox('Se quitarán todos los productos de la venta actual.', '¿Vaciar carrito?', 'Vaciar', true)) reset();
  };
  $('#btnCancelSale').onclick = () => $('#btnClear').click();

  function reset() {
    S.cart = []; S.cot = 0; $('#desc').value = 0; $('#recibido').value = '';
    setCli({ ...CLI0 }); setTipo('TICKET'); setMetodo('EFECTIVO');
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

  function setTipo(t) {
    S.tipo = t;
    document.querySelectorAll('#segTipo button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  }
  $('#segTipo').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setTipo(b.dataset.t); });

  // ---------- Cliente ----------
  function setCli(c) {
    S.cli = c;
    $('#cliNameInput').value = c.nombre;
    $('#btnCliMore').textContent = c.id !== 1 && c.documento ? c.tipo_doc + ': ' + c.documento : 'Mostrar más';
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

  // ---------- Acciones Rápidas (Venta Rápida, Ingreso, Egreso) ----------
  $('#btnQuickSale').onclick = () => { mQuick.show(); $('#qkMonto').value = ''; setTimeout(() => $('#qkMonto').focus(), 300); };
  $('#btnQkAdd').onclick = () => {
    const m = parseFloat($('#qkMonto').value);
    if (!(m > 0)) return toast('Ingresa un monto válido', 'warning');
    const nom = $('#qkConcepto').value.trim() || 'Venta varios';
    add({ id: 999999, nombre: nom, unidad: 'UND', precio_venta: m, precio_mayor: 0, cantidad_mayor: 0, categoria_id: 1, stock: 9999 });
    mQuick.hide();
  };

  function openMovCaja(tipo) {
    $('#movTipo').value = tipo;
    $('#movTitle').textContent = tipo === 'INGRESO' ? 'Registrar Ingreso de Caja' : 'Registrar Egreso de Caja';
    $('#btnMovSave').className = tipo === 'INGRESO' ? 'btn btn-success w-100 fw-bold' : 'btn btn-danger w-100 fw-bold';
    $('#movConcepto').value = '';
    $('#movMonto').value = '';
    mMov.show();
    setTimeout(() => $('#movConcepto').focus(), 300);
  }
  $('#btnIngreso').onclick = () => openMovCaja('INGRESO');
  $('#btnEgreso').onclick = () => openMovCaja('EGRESO');

  $('#btnMovSave').onclick = async () => {
    const tipo = $('#movTipo').value, concepto = $('#movConcepto').value.trim(), monto = parseFloat($('#movMonto').value);
    if (!concepto || !(monto > 0)) return toast('Completa el concepto y el monto', 'warning');
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
        tipo: S.tipo,
        metodo: S.metodo,
        recibido: +$('#recibido').value || 0,
        descuento: +$('#desc').value || 0,
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
    $('#btnCobrar').innerHTML = '<i class="bi bi-check2-circle fs-5"></i> VENTA <kbd style="background:rgba(255,255,255,0.25);font-size:.7rem">F4</kbd>';
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

with open(os.path.join(BASE_DIR, "assets/js/pos.js"), "w", encoding="utf-8") as f:
    f.write(NEW_POS_JS)
print("✓ Actualizado assets/js/pos.js")

print("=== ¡Interfaz de Alevia Pay aplicada exitosamente al POS! ===")
