#!/usr/bin/env node
/**
 * migrate_alevia_to_systienda.js
 * Extrae los datos reales de Alevia Pay (MongoDB) y genera el SQL para SysTienda.
 */

const path = require('path');
// Usar mongoose instalado en back/node_modules
const mongoose = require(path.join(__dirname, '../back/node_modules/mongoose'));
const fs = require('fs');
const { execSync } = require('child_process');

const MONGO_URI = 'mongodb+srv://alegremaikol4_db_user:DIPzsby79MiF7TiZ@cluster0.akyhbgb.mongodb.net/distrify?appName=Cluster0';
const OUTPUT_SQL = '/tmp/alevia_migracion.sql';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? '0' : val.toString();
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

async function main() {
  console.log('🔄 Conectando a MongoDB de Alevia Pay...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB con éxito.');

  const db = mongoose.connection.db;

  // Listar tiendas
  const shops = await db.collection('shops').find({}).toArray();
  console.log(`\n🏪 Tiendas encontradas (${shops.length}):`);
  shops.forEach((s, i) => console.log(`   [${i+1}] ${s.name || s.fantasyName || s._id}`));

  let targetShop = shops[0];
  for (const s of shops) {
    const c = await db.collection('products').countDocuments({ shopId: s._id });
    if (c > 0) { targetShop = s; break; }
  }
  const shopId = targetShop ? targetShop._id : null;
  console.log(`\n👉 Extrayendo datos de la tienda: ${targetShop ? (targetShop.name || targetShop._id) : 'Todas'}`);

  let sql = 'SET FOREIGN_KEY_CHECKS=0;\n';

  // 1. Categorías
  console.log('📦 Extrayendo Categorías...');
  const query = shopId ? { shopId } : {};
  const cats = await db.collection('categories').find(query).toArray();
  const catMap = new Map();

  let catIdx = 10;
  for (const c of cats) {
    catIdx++;
    catMap.set(c._id.toString(), catIdx);
    sql += `INSERT INTO categorias (id, nombre, descripcion, icono, color, estado) VALUES (${catIdx}, ${esc(c.name)}, ${esc(c.description || '')}, 'bi-tag', '#f97316', 1) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);\n`;
  }

  // 2. Clientes
  console.log('👥 Extrayendo Clientes...');
  const clients = await db.collection('clients').find(query).toArray();
  let cliIdx = 10;
  for (const cl of clients) {
    cliIdx++;
    const debt = parseFloat(cl.debt) || 0;
    sql += `INSERT INTO clientes (id, nombre, telefono, email, direccion, saldo_deuda, estado) VALUES (${cliIdx}, ${esc(cl.name || 'Cliente')}, ${esc(cl.phone || '')}, ${esc(cl.email || '')}, ${esc(cl.address || '')}, ${debt}, 1) ON DUPLICATE KEY UPDATE saldo_deuda=VALUES(saldo_deuda);\n`;
  }

  // 3. Proveedores
  console.log('🚚 Extrayendo Proveedores...');
  const suppliers = await db.collection('suppliers').find(query).toArray();
  let supIdx = 10;
  for (const s of suppliers) {
    supIdx++;
    sql += `INSERT INTO proveedores (id, nombre, contacto_nombre, telefono, email, direccion, estado) VALUES (${supIdx}, ${esc(s.name)}, ${esc(s.contact || '')}, ${esc(s.phone || '')}, ${esc(s.email || '')}, ${esc(s.address || '')}, 1) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);\n`;
  }

  // 4. Productos
  console.log('🛒 Extrayendo Productos...');
  const products = await db.collection('products').find(query).toArray();
  let prodIdx = 10;
  for (const p of products) {
    prodIdx++;
    const barcode = p.code || p.barcode || '';
    const name = p.name || 'Producto';
    const buyPrice = parseFloat(p.buyPrice) || 0;
    const sellPrice = parseFloat(p.sellPrice) || 0;
    const stock = parseFloat(p.quantity) || 0;
    const minStock = parseFloat(p.minQuantity) || 0;
    const catId = p.categoryId && catMap.has(p.categoryId.toString()) ? catMap.get(p.categoryId.toString()) : 1;

    sql += `INSERT INTO productos (id, codigo, codigo_barras, nombre, descripcion, categoria_id, unidad, precio_compra, precio_venta, stock, stock_minimo, estado) VALUES (${prodIdx}, ${esc(barcode || 'P'+prodIdx)}, ${esc(barcode)}, ${esc(name)}, ${esc(p.description || '')}, ${catId}, 'UND', ${buyPrice}, ${sellPrice}, ${stock}, ${minStock}, 1) ON DUPLICATE KEY UPDATE precio_venta=VALUES(precio_venta), stock=VALUES(stock);\n`;
    sql += `INSERT INTO stock_sucursal (sucursal_id, producto_id, stock) VALUES (1, ${prodIdx}, ${stock}) ON DUPLICATE KEY UPDATE stock=VALUES(stock);\n`;
  }

  // 5. Egresos
  console.log('💸 Extrayendo Egresos...');
  const outputs = await db.collection('outputs').find(query).toArray();
  for (const o of outputs) {
    const total = parseFloat(o.total) || 0;
    if (total > 0) {
      const desc = o.description || o.category || 'Gasto';
      const cat = o.category || 'Otros';
      const d = o.date ? new Date(o.date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
      sql += `INSERT INTO gastos (sucursal_id, usuario_id, categoria, monto, fecha, observacion) VALUES (1, 1, ${esc(cat)}, ${total}, ${esc(d)}, ${esc(desc)});\n`;
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';

  fs.writeFileSync(OUTPUT_SQL, sql);
  console.log(`\n📄 Archivo SQL generado en: ${OUTPUT_SQL} (${(fs.statSync(OUTPUT_SQL).size / 1024).toFixed(1)} KB)`);

  // Ejecutar el SQL en MySQL usando PHP PDO
  console.log('🔄 Importando a MySQL SysTienda...');
  const phpRunner = `<?php
require_once '/var/www/html/sys_tienda/config/database.php';
$pdo = db();
$sql = file_get_contents('${OUTPUT_SQL}');
$pdo->exec($sql);
echo "✅ Todos los datos importados a MySQL exitosamente.\\n";
`;
  fs.writeFileSync('/tmp/import_alevia.php', phpRunner);
  execSync('php /tmp/import_alevia.php', { stdio: 'inherit' });

  // Limpiar temporales
  if (fs.existsSync('/tmp/import_alevia.php')) fs.unlinkSync('/tmp/import_alevia.php');
  if (fs.existsSync(OUTPUT_SQL)) fs.unlinkSync(OUTPUT_SQL);

  console.log('\n🎉 ¡MIGRACIÓN COMPLETA! Clientes, Productos, Stock, Precios, Proveedores y Egresos ya están en SysTienda.');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
