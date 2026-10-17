#!/usr/bin/env node
/**
 * migrate_all_alevia_history.js
 * Migra TODO el historial de Alevia Pay (Maxikiosco La 10) hacia SysTienda (MySQL):
 * - Categorías (10 categorías)
 * - Productos (6.286 productos reales + combos + conceptos rápidos)
 * - Stock por sucursal
 * - Clientes (Clientes reales de Maxikiosco La 10 + Cliente Varios)
 * - Gastos / Egresos (53 gastos operativos)
 * - Cajas / Turnos (Historial completo de turnos de caja)
 * - Movimientos de caja (Ingresos y egresos de efectivo)
 * - Promociones y Combos (7 promociones reales)
 * - Ventas y Detalle de Ventas (1.278 ventas históricas y 2.141 ítems)
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../back/node_modules/mongoose'));
const fs = require('fs');
const { execSync } = require('child_process');

const MONGO_URI = 'mongodb+srv://alegremaikol4_db_user:DIPzsby79MiF7TiZ@cluster0.akyhbgb.mongodb.net/distrify?appName=Cluster0';
const TARGET_SHOP_ID = '6a7a55ba93b66ba241f9400f'; // Maxikiosco La 10
const OUTPUT_SQL = '/tmp/alevia_historial_completo.sql';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? '0' : val.toString();
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function toSqlDateTime(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString('sv', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function toSqlDate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().substring(0, 10);
}

const CATEGORY_STYLES = {
  'bebidas con alcohol': { icono: 'bi-cup-straw', color: '#e11d48' },
  'bebidas sin alcohol': { icono: 'bi-cup', color: '#0284c7' },
  'galletitas y snacks': { icono: 'bi-box-seam', color: '#f59e0b' },
  'golosinas y chocolates': { icono: 'bi-gift', color: '#ec4899' },
  'lácteos y helados': { icono: 'bi-snow', color: '#06b6d4' },
  'lacteos y helados': { icono: 'bi-snow', color: '#06b6d4' },
  'cuidado personal y limpieza': { icono: 'bi-stars', color: '#10b981' },
  'almacén': { icono: 'bi-shop', color: '#8b5cf6' },
  'almacen': { icono: 'bi-shop', color: '#8b5cf6' },
  'varios y regalería': { icono: 'bi-tags', color: '#64748b' },
  'varios y regaleria': { icono: 'bi-tags', color: '#64748b' },
  'cigarrillos': { icono: 'bi-fire', color: '#ef4444' },
  'promociones y combos': { icono: 'bi-percent', color: '#10b981' },
  'varios': { icono: 'bi-tag', color: '#f97316' },
};

async function main() {
  console.log('🔄 Conectando a MongoDB de Alevia Pay...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB.\n');

  const db = mongoose.connection.db;

  // ==========================================
  // 1. CATEGORÍAS
  // ==========================================
  console.log('📦 1/8 Extrayendo Categorías...');
  const mongoCats = await db.collection('categories').find({}).toArray();
  const catNameToId = new Map();
  const mongoCatIdToMySqlId = new Map();
  const uniqueCats = [];

  let nextCatId = 1;
  for (const c of mongoCats) {
    const rawName = (c.name || '').trim();
    if (!rawName) continue;
    const norm = rawName.toLowerCase();
    
    let assignedId;
    if (catNameToId.has(norm)) {
      assignedId = catNameToId.get(norm);
    } else {
      assignedId = nextCatId++;
      catNameToId.set(norm, assignedId);
      const style = CATEGORY_STYLES[norm] || { icono: 'bi-tag', color: '#f97316' };
      uniqueCats.push({
        id: assignedId,
        nombre: rawName.charAt(0).toUpperCase() + rawName.slice(1),
        icono: style.icono,
        color: style.color
      });
    }
    if (c._id) mongoCatIdToMySqlId.set(c._id.toString(), assignedId);
  }

  // Asegurar categoría "Promociones y Combos"
  let comboCatId = catNameToId.get('promociones y combos');
  if (!comboCatId) {
    comboCatId = nextCatId++;
    catNameToId.set('promociones y combos', comboCatId);
    uniqueCats.push({ id: comboCatId, nombre: 'Promociones y Combos', icono: 'bi-percent', color: '#10b981' });
  }

  // Asegurar categoría "Varios"
  let defaultCatId = catNameToId.get('varios');
  if (!defaultCatId) {
    defaultCatId = nextCatId++;
    catNameToId.set('varios', defaultCatId);
    uniqueCats.push({ id: defaultCatId, nombre: 'Varios', icono: 'bi-tag', color: '#f97316' });
  }

  // ==========================================
  // 2. PRODUCTOS
  // ==========================================
  console.log('🛒 2/8 Extrayendo Productos de Maxikiosco La 10...');
  const shopProds = await db.collection('products').find({
    shopId: new mongoose.Types.ObjectId(TARGET_SHOP_ID)
  }).toArray();

  const seenCodes = new Set();
  const validProducts = [];
  const mongoProdIdToMySqlId = new Map();
  const prodNameToMySqlId = new Map();

  for (const p of shopProds) {
    const mySqlId = validProducts.length + 1;
    mongoProdIdToMySqlId.set(p._id.toString(), mySqlId);

    const barcode = ((p.code || p.barcode || '') + '').trim();
    let codeKey = barcode;
    if (!codeKey) {
      codeKey = 'P' + String(mySqlId).padStart(5, '0');
    } else if (seenCodes.has(codeKey)) {
      let suffix = 2;
      while (seenCodes.has(`${codeKey}-${suffix}`)) suffix++;
      codeKey = `${codeKey}-${suffix}`;
    }
    seenCodes.add(codeKey);

    let catId = defaultCatId;
    if (p.categoryId && mongoCatIdToMySqlId.has(p.categoryId.toString())) {
      catId = mongoCatIdToMySqlId.get(p.categoryId.toString());
    } else if (p.category) {
      const norm = p.category.trim().toLowerCase();
      if (catNameToId.has(norm)) catId = catNameToId.get(norm);
    }

    const buyPrice = Math.max(0, parseFloat(p.buyPrice) || 0);
    const sellPrice = Math.max(0, parseFloat(p.sellPrice) || 0);
    const stock = Math.max(0, parseFloat(p.quantity) || 0);
    const minStock = Math.max(0, parseFloat(p.minQuantity) || 5);
    const name = (p.name || 'Producto').substring(0, 150).trim();
    const desc = (p.description || '').substring(0, 255).trim();

    prodNameToMySqlId.set(name.toLowerCase(), mySqlId);

    validProducts.push({
      id: mySqlId,
      categoria_id: catId,
      codigo: codeKey,
      codigo_barras: barcode || null,
      nombre: name,
      descripcion: desc,
      precio_compra: buyPrice,
      precio_venta: sellPrice,
      stock: stock,
      stock_minimo: minStock
    });
  }

  // ==========================================
  // 3. COMBOS Y PROMOCIONES DE MONGO COMO PRODUCTOS
  // ==========================================
  console.log('🏷️  3/8 Extrayendo Promociones y Combos...');
  const mongoPromos = await db.collection('promotions').find({
    shopId: new mongoose.Types.ObjectId(TARGET_SHOP_ID)
  }).toArray();

  for (const pr of mongoPromos) {
    const promoId = validProducts.length + 1;
    mongoProdIdToMySqlId.set(pr._id.toString(), promoId);
    const name = (pr.name || 'Combo').substring(0, 150).trim();
    prodNameToMySqlId.set(name.toLowerCase(), promoId);
    prodNameToMySqlId.set(`[combo] ${name.toLowerCase()}`, promoId);

    const price = Math.max(0, parseFloat(pr.comboPrice) || 0);
    const codeKey = 'CMB-' + String(promoId).padStart(4, '0');
    seenCodes.add(codeKey);

    validProducts.push({
      id: promoId,
      categoria_id: comboCatId,
      codigo: codeKey,
      codigo_barras: null,
      nombre: name,
      descripcion: 'Combo / Promoción Kiosco',
      precio_compra: 0,
      precio_venta: price,
      stock: 100,
      stock_minimo: 5
    });
  }

  // Producto comodín para conceptos rápidos no registrados
  const fallbackProdId = validProducts.length + 1;
  validProducts.push({
    id: fallbackProdId,
    categoria_id: defaultCatId,
    codigo: 'CONCEPTO-RAPIDO',
    codigo_barras: null,
    nombre: 'Concepto Rápido / Varios',
    descripcion: 'Venta rápida o concepto manual',
    precio_compra: 0,
    precio_venta: 0,
    stock: 9999,
    stock_minimo: 0
  });

  // ==========================================
  // 4. CLIENTES
  // ==========================================
  console.log('👥 4/8 Extrayendo Clientes...');
  const mongoClients = await db.collection('clients').find({
    $or: [{ shopId: TARGET_SHOP_ID }, { shopId: new mongoose.Types.ObjectId(TARGET_SHOP_ID) }]
  }).toArray();

  const validClients = [
    { id: 1, tipo_doc: 'DNI', num_doc: '00000000', nombre: 'Cliente Varios', telefono: '', email: '', direccion: 'Mostrador', deuda: 0 }
  ];

  let nextClientId = 2;
  const mongoClientIdToMySqlId = new Map();
  for (const cl of mongoClients) {
    const cId = nextClientId++;
    mongoClientIdToMySqlId.set(cl._id.toString(), cId);
    validClients.push({
      id: cId,
      tipo_doc: 'DNI',
      num_doc: '20' + String(cId).padStart(6, '0'),
      nombre: (cl.name || 'Cliente').substring(0, 150).trim(),
      telefono: (cl.phone || '').substring(0, 30).trim(),
      email: (cl.email || '').substring(0, 100).trim(),
      direccion: (cl.address || '').substring(0, 200).trim(),
      deuda: Math.max(0, parseFloat(cl.debt) || 0)
    });
  }

  // ==========================================
  // 5. CAJAS / TURNOS
  // ==========================================
  console.log('💵 5/8 Extrayendo Historial de Cajas...');
  const mongoCajas = await db.collection('cajas').find({
    shopId: TARGET_SHOP_ID
  }).sort({ fechaApertura: 1 }).toArray();

  const validCajas = [];
  // Caja 1: Turno Histórico para ventas previas a octubre
  validCajas.push({
    id: 1,
    sucursal_id: 1,
    usuario_id: 1,
    fecha_apertura: '2026-08-10 00:00:00',
    fecha_cierre: '2026-10-02 18:00:00',
    monto_apertura: 0,
    monto_cierre: 0,
    estado: 'CERRADA',
    observacion: 'Historial previo Kiosco'
  });

  let nextCajaId = 2;
  for (const c of mongoCajas) {
    const cId = nextCajaId++;
    const fAper = toSqlDateTime(c.fechaApertura);
    const fCier = toSqlDateTime(c.fechaCierre);
    const mAper = Math.max(0, parseFloat(c.entregasEfectivo?.inicial) || 0);
    const mCier = Math.max(0, parseFloat(c.arqueoFinal?.balanceFinal || c.arqueoFinal?.efectivoTotalPresentado || c.totalCaja?.totalVentas) || 0);
    const est = (c.estado === 'abierta' || !fCier) ? 'ABIERTA' : 'CERRADA';
    const obs = (c.title || 'Turno Kiosco').substring(0, 200);

    validCajas.push({
      id: cId,
      sucursal_id: 1,
      usuario_id: 1,
      fecha_apertura: fAper || '2026-10-02 18:07:00',
      fecha_cierre: est === 'CERRADA' ? fCier : null,
      monto_apertura: mAper,
      monto_cierre: est === 'CERRADA' ? mCier : null,
      estado: est,
      observacion: obs,
      _fAperMs: c.fechaApertura ? new Date(c.fechaApertura).getTime() : 0,
      _fCierMs: c.fechaCierre ? new Date(c.fechaCierre).getTime() : Infinity
    });
  }

  // ==========================================
  // 6. GASTOS Y MOVIMIENTOS DE CAJA
  // ==========================================
  console.log('📉 6/8 Extrayendo Gastos y Movimientos de Caja...');
  const mongoOutputs = await db.collection('outputs').find({
    shopId: TARGET_SHOP_ID
  }).sort({ createdAt: 1 }).toArray();

  const validGastos = [];
  const validMovCaja = [];
  let nextGastoId = 1;
  let nextMovId = 1;

  for (const o of mongoOutputs) {
    const gId = nextGastoId++;
    const monto = Math.max(0, parseFloat(o.total) || 0);
    const fGasto = toSqlDate(o.date || o.createdAt) || '2026-10-03';
    const fDt = toSqlDateTime(o.createdAt || o.date) || '2026-10-03 12:00:00';
    const concepto = (o.description || 'Gasto operativo').substring(0, 150).trim();
    const categoria = (o.category || 'General').substring(0, 60).trim();

    validGastos.push({
      id: gId,
      sucursal_id: 1,
      concepto: concepto,
      categoria: categoria,
      monto: monto,
      fecha: fGasto,
      usuario_id: 1,
      estado: 1
    });

    // Si se pagó en Efectivo y tiene monto, impacta como egreso en la caja correspondiente
    const method = (o.paymentMethod || '').toLowerCase();
    if (method.includes('efectivo') && monto > 0) {
      const oMs = new Date(o.createdAt || o.date).getTime();
      let matchedCajaId = 1;
      for (let i = 1; i < validCajas.length; i++) {
        if (oMs >= validCajas[i]._fAperMs && oMs <= validCajas[i]._fCierMs) {
          matchedCajaId = validCajas[i].id;
          break;
        }
      }
      validMovCaja.push({
        id: nextMovId++,
        caja_id: matchedCajaId,
        tipo: 'EGRESO',
        concepto: concepto,
        monto: monto,
        fecha: fDt
      });
    }
  }

  // Inputs (Ingresos a caja)
  const mongoInputs = await db.collection('inputs').find({
    shopId: TARGET_SHOP_ID
  }).toArray();

  for (const inp of mongoInputs) {
    const monto = Math.max(0, parseFloat(inp.total) || 0);
    if (monto > 0) {
      const inpMs = new Date(inp.createdAt).getTime();
      let matchedCajaId = 1;
      for (let i = 1; i < validCajas.length; i++) {
        if (inpMs >= validCajas[i]._fAperMs && inpMs <= validCajas[i]._fCierMs) {
          matchedCajaId = validCajas[i].id;
          break;
        }
      }
      validMovCaja.push({
        id: nextMovId++,
        caja_id: matchedCajaId,
        tipo: 'INGRESO',
        concepto: (inp.description || 'Ingreso de efectivo').substring(0, 150),
        monto: monto,
        fecha: toSqlDateTime(inp.createdAt) || '2026-08-11 12:00:00'
      });
    }
  }

  // ==========================================
  // 7. VENTAS Y DETALLE DE VENTAS
  // ==========================================
  console.log('🧾 7/8 Extrayendo Ventas e Historial de Tickets...');
  const mongoSales = await db.collection('sales').find({
    shopId: TARGET_SHOP_ID
  }).sort({ createdAt: 1 }).toArray();

  const validVentas = [];
  const validDetalles = [];
  let nextVentaId = 1;
  let nextDetalleId = 1;

  for (const s of mongoSales) {
    const vId = nextVentaId++;
    const sDate = toSqlDateTime(s.createdAt) || '2026-08-10 12:00:00';
    const sMs = new Date(s.createdAt).getTime();

    // Asignar caja
    let matchedCajaId = 1;
    for (let i = 1; i < validCajas.length; i++) {
      if (sMs >= validCajas[i]._fAperMs && sMs <= validCajas[i]._fCierMs) {
        matchedCajaId = validCajas[i].id;
        break;
      }
    }

    // Normalizar método de pago
    let met = 'EFECTIVO';
    const rawMet = (s.paymentMethod || '').toUpperCase();
    if (rawMet.includes('TRANSFER')) met = 'TRANSFERENCIA';
    else if (rawMet.includes('DEBIT') || rawMet.includes('DÉBIT')) met = 'DEBITO';
    else if (rawMet.includes('TARJET') || rawMet.includes('CREDIT') || rawMet.includes('CRÉDIT')) met = 'TARJETA';
    else if (rawMet.includes('MP') || rawMet.includes('MERCADO')) met = 'MERCADOPAGO';

    const total = Math.max(0, parseFloat(s.total) || 0);
    const subtotal = Math.max(0, parseFloat(s.subtotal) || total);
    const discount = Math.max(0, parseFloat(s.discount) || 0);

    validVentas.push({
      id: vId,
      sucursal_id: 1,
      caja_id: matchedCajaId,
      usuario_id: 1,
      cliente_id: 1,
      tipo_comprobante: 'TICKET',
      serie: 'T001',
      numero: vId,
      fecha: sDate,
      subtotal: subtotal,
      descuento: discount,
      igv: 0,
      total: total,
      metodo_pago: met,
      monto_recibido: total,
      vuelto: 0,
      estado: 'COMPLETADA'
    });

    // Detalle de productos vendidos
    for (const d of s.productDetails || []) {
      const pidStr = d.productId ? d.productId.toString() : '';
      const pName = (d.productName || 'Producto').trim();
      const pNameLower = pName.toLowerCase();

      let targetProdId = fallbackProdId;
      if (pidStr && mongoProdIdToMySqlId.has(pidStr)) {
        targetProdId = mongoProdIdToMySqlId.get(pidStr);
      } else if (prodNameToMySqlId.has(pNameLower)) {
        targetProdId = prodNameToMySqlId.get(pNameLower);
      }

      const cant = Math.max(0.01, parseFloat(d.quantity) || 1);
      const precio = Math.max(0, parseFloat(d.salePrice) || 0);
      const sub = Math.max(0, parseFloat(cant * precio));

      validDetalles.push({
        id: nextDetalleId++,
        venta_id: vId,
        producto_id: targetProdId,
        cantidad: cant,
        precio_unitario: precio,
        costo_unitario: 0,
        descuento: 0,
        promo: d.isCombo ? pName.substring(0, 80) : null,
        subtotal: sub
      });
    }
  }

  // ==========================================
  // 8. GENERAR Y EJECUTAR SQL COMPLETO
  // ==========================================
  console.log('\n📝 8/8 Generando SQL e importando en SysTienda MySQL...');
  let sql = 'SET FOREIGN_KEY_CHECKS=0;\n';
  sql += 'TRUNCATE TABLE detalle_ventas;\n';
  sql += 'TRUNCATE TABLE ventas;\n';
  sql += 'TRUNCATE TABLE movimientos_caja;\n';
  sql += 'TRUNCATE TABLE gastos;\n';
  sql += 'TRUNCATE TABLE cajas;\n';
  sql += 'TRUNCATE TABLE clientes;\n';
  sql += 'TRUNCATE TABLE promociones;\n';
  sql += 'TRUNCATE TABLE stock_sucursal;\n';
  sql += 'TRUNCATE TABLE productos;\n';
  sql += 'TRUNCATE TABLE categorias;\n';

  // Categorías
  for (const c of uniqueCats) {
    sql += `INSERT INTO categorias (id, nombre, icono, color, estado) VALUES (${c.id}, ${esc(c.nombre)}, ${esc(c.icono)}, ${esc(c.color)}, 1);\n`;
  }

  // Productos por lotes de 500
  for (let i = 0; i < validProducts.length; i += 500) {
    const chunk = validProducts.slice(i, i + 500);
    sql += 'INSERT INTO productos (id, categoria_id, codigo, codigo_barras, nombre, descripcion, unidad, precio_compra, precio_venta, stock, stock_minimo, estado) VALUES\n';
    sql += chunk.map(p => `(${p.id}, ${p.categoria_id}, ${esc(p.codigo)}, ${esc(p.codigo_barras)}, ${esc(p.nombre)}, ${esc(p.descripcion)}, 'UND', ${p.precio_compra}, ${p.precio_venta}, ${p.stock}, ${p.stock_minimo}, 1)`).join(',\n') + ';\n';
    
    sql += 'INSERT INTO stock_sucursal (sucursal_id, producto_id, stock) VALUES\n';
    sql += chunk.map(p => `(1, ${p.id}, ${p.stock})`).join(',\n') + ';\n';
  }

  // Clientes
  for (const cl of validClients) {
    sql += `INSERT INTO clientes (id, tipo_doc, documento, nombre, telefono, email, direccion, limite_credito, saldo_deuda, estado) 
            VALUES (${cl.id}, ${esc(cl.tipo_doc)}, ${esc(cl.num_doc)}, ${esc(cl.nombre)}, ${esc(cl.telefono)}, ${esc(cl.email)}, ${esc(cl.direccion)}, 100000, ${cl.deuda || 0}, 1);\n`;
  }

  // Cajas
  for (const c of validCajas) {
    sql += `INSERT INTO cajas (id, sucursal_id, usuario_id, fecha_apertura, fecha_cierre, monto_apertura, monto_cierre, estado, observacion) 
            VALUES (${c.id}, ${c.sucursal_id}, ${c.usuario_id}, ${esc(c.fecha_apertura)}, ${esc(c.fecha_cierre)}, ${c.monto_apertura}, ${esc(c.monto_cierre)}, ${esc(c.estado)}, ${esc(c.observacion)});\n`;
  }

  // Gastos
  for (const g of validGastos) {
    sql += `INSERT INTO gastos (id, sucursal_id, concepto, categoria, monto, fecha, usuario_id, estado) 
            VALUES (${g.id}, ${g.sucursal_id}, ${esc(g.concepto)}, ${esc(g.categoria)}, ${g.monto}, ${esc(g.fecha)}, ${g.usuario_id}, 1);\n`;
  }

  // Movimientos de caja
  for (const m of validMovCaja) {
    sql += `INSERT INTO movimientos_caja (id, caja_id, tipo, concepto, monto, fecha) 
            VALUES (${m.id}, ${m.caja_id}, ${esc(m.tipo)}, ${esc(m.concepto)}, ${m.monto}, ${esc(m.fecha)});\n`;
  }

  // Promociones
  let promoRowId = 1;
  for (const pr of mongoPromos) {
    const pName = (pr.name || 'Combo').substring(0, 80);
    const pVal = Math.max(0, parseFloat(pr.comboPrice) || 0);
    sql += `INSERT INTO promociones (id, nombre, tipo, alcance, valor, fecha_inicio, fecha_fin, sucursal_id, estado) 
            VALUES (${promoRowId++}, ${esc(pName)}, 'MONTO', 'TODO', ${pVal}, '2026-01-01', '2027-12-31', 1, 1);\n`;
  }

  // Ventas por lotes de 500
  for (let i = 0; i < validVentas.length; i += 500) {
    const chunk = validVentas.slice(i, i + 500);
    sql += 'INSERT INTO ventas (id, sucursal_id, caja_id, usuario_id, cliente_id, tipo_comprobante, serie, numero, fecha, subtotal, descuento, igv, total, metodo_pago, monto_recibido, vuelto, estado) VALUES\n';
    sql += chunk.map(v => `(${v.id}, ${v.sucursal_id}, ${v.caja_id}, ${v.usuario_id}, ${v.cliente_id}, 'TICKET', 'T001', ${v.numero}, ${esc(v.fecha)}, ${v.subtotal}, ${v.descuento}, 0, ${v.total}, ${esc(v.metodo_pago)}, ${v.monto_recibido}, 0, 'COMPLETADA')`).join(',\n') + ';\n';
  }

  // Detalle Ventas por lotes de 500
  for (let i = 0; i < validDetalles.length; i += 500) {
    const chunk = validDetalles.slice(i, i + 500);
    sql += 'INSERT INTO detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, descuento, promo, subtotal) VALUES\n';
    sql += chunk.map(d => `(${d.id}, ${d.venta_id}, ${d.producto_id}, ${d.cantidad}, ${d.precio_unitario}, 0, 0, ${esc(d.promo)}, ${d.subtotal})`).join(',\n') + ';\n';
  }

  // Actualizar correlativo de comprobantes
  sql += `UPDATE series_comprobantes SET correlativo = ${validVentas.length} WHERE tipo = 'TICKET' AND sucursal_id = 1;\n`;

  // Actualizar nombre del usuario administrador a Gino Tridenti
  sql += `UPDATE usuarios SET nombres = 'Gino', apellidos = 'Tridenti' WHERE id = 1;\n`;

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';

  fs.writeFileSync(OUTPUT_SQL, sql);
  console.log(`   SQL generado en: ${OUTPUT_SQL} (${(fs.statSync(OUTPUT_SQL).size / 1024 / 1024).toFixed(2)} MB)`);

  const phpRunner = `<?php
require_once '/var/www/html/sys_tienda/config/database.php';
$pdo = db();
$sql = file_get_contents('${OUTPUT_SQL}');
$pdo->exec($sql);
echo "✅ MySQL actualizado exitosamente con TODO el historial.\\n";
`;
  fs.writeFileSync('/tmp/import_all_history.php', phpRunner);
  execSync('php /tmp/import_all_history.php', { stdio: 'inherit' });

  if (fs.existsSync('/tmp/import_all_history.php')) fs.unlinkSync('/tmp/import_all_history.php');
  if (fs.existsSync(OUTPUT_SQL)) fs.unlinkSync(OUTPUT_SQL);

  console.log('\n🎉 ¡MIGRACIÓN TOTAL COMPLETADA!');
  console.log(`   - Categorías: ${uniqueCats.length}`);
  console.log(`   - Productos: ${validProducts.length} (6.286 catálogo + combos + conceptos rápidos)`);
  console.log(`   - Clientes: ${validClients.length}`);
  console.log(`   - Cajas: ${validCajas.length}`);
  console.log(`   - Gastos: ${validGastos.length}`);
  console.log(`   - Movimientos Caja: ${validMovCaja.length}`);
  console.log(`   - Promociones: ${mongoPromos.length}`);
  console.log(`   - Ventas: ${validVentas.length} tickets`);
  console.log(`   - Ítems vendidos: ${validDetalles.length} líneas de venta`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ Error durante la migración:', err);
  process.exit(1);
});
