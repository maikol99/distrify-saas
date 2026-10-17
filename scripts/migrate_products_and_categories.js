#!/usr/bin/env node
/**
 * migrate_products_and_categories.js
 * Migra EXCLUSIVAMENTE Productos y Categorías desde MongoDB (Alevia Pay / Maxikiosco La 10) hacia SysTienda (MySQL).
 * Conserva códigos de barras, nombres, descripciones, precios de compra, precios de venta y stock real.
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../back/node_modules/mongoose'));
const fs = require('fs');
const { execSync } = require('child_process');

const MONGO_URI = 'mongodb+srv://alegremaikol4_db_user:DIPzsby79MiF7TiZ@cluster0.akyhbgb.mongodb.net/distrify?appName=Cluster0';
const TARGET_SHOP_ID = '6a7a55ba93b66ba241f9400f'; // Maxikiosco La 10
const OUTPUT_SQL = '/tmp/alevia_productos.sql';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? '0' : val.toString();
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
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
  'varios': { icono: 'bi-tag', color: '#f97316' },
};

async function main() {
  console.log('🔄 Conectando a MongoDB de Alevia Pay...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB con éxito.\n');

  const db = mongoose.connection.db;

  // 1. Obtener Categorías de MongoDB
  console.log('📦 Extrayendo Categorías...');
  const mongoCats = await db.collection('categories').find({}).toArray();
  
  // Mapear categorías únicas por nombre normalizado
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

    if (c._id) {
      mongoCatIdToMySqlId.set(c._id.toString(), assignedId);
    }
  }

  // Asegurar categoría "Varios" por defecto
  let defaultCatId = catNameToId.get('varios');
  if (!defaultCatId) {
    defaultCatId = nextCatId++;
    catNameToId.set('varios', defaultCatId);
    uniqueCats.push({
      id: defaultCatId,
      nombre: 'Varios',
      icono: 'bi-tag',
      color: '#f97316'
    });
  }

  console.log(`   Se definieron ${uniqueCats.length} categorías únicas para SysTienda.`);

  // 2. Extraer Productos de MongoDB
  console.log('\n🛒 Extrayendo Productos (prioridad Maxikiosco La 10)...');
  
  // Extraer EXCLUSIVAMENTE productos de la tienda del cliente Maxikiosco La 10
  const shopProds = await db.collection('products').find({
    shopId: new mongoose.Types.ObjectId(TARGET_SHOP_ID)
  }).toArray();

  const allMongoProds = shopProds;
  console.log(`   Total encontrados en Maxikiosco La 10: ${allMongoProds.length} productos.`);

  const seenCodes = new Set();
  const validProducts = [];

  for (const p of allMongoProds) {
    const barcode = ((p.code || p.barcode || '') + '').trim();
    let codeKey = barcode;
    
    // Si no tiene código de barras o ya existe en este catálogo
    if (!codeKey) {
      codeKey = 'P' + String(validProducts.length + 1).padStart(5, '0');
    } else if (seenCodes.has(codeKey)) {
      // Si el código ya se usó (variante), agregar sufijo para evitar violación de UNIQUE en codigo
      let suffix = 2;
      while (seenCodes.has(`${codeKey}-${suffix}`)) {
        suffix++;
      }
      codeKey = `${codeKey}-${suffix}`;
    }

    seenCodes.add(codeKey);

    // Determinar categoría
    let catId = defaultCatId;
    if (p.categoryId && mongoCatIdToMySqlId.has(p.categoryId.toString())) {
      catId = mongoCatIdToMySqlId.get(p.categoryId.toString());
    } else if (p.category) {
      const norm = p.category.trim().toLowerCase();
      if (catNameToId.has(norm)) {
        catId = catNameToId.get(norm);
      }
    }

    const buyPrice = Math.max(0, parseFloat(p.buyPrice) || 0);
    const sellPrice = Math.max(0, parseFloat(p.sellPrice) || 0);
    const stock = Math.max(0, parseFloat(p.quantity) || 0);
    const minStock = Math.max(0, parseFloat(p.minQuantity) || 5);
    const name = (p.name || 'Producto').substring(0, 150).trim();
    const desc = (p.description || '').substring(0, 255).trim();

    validProducts.push({
      id: validProducts.length + 1,
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

  console.log(`   Total de productos preparados para migración: ${validProducts.length}`);

  // 3. Generar Script SQL
  console.log('\n📝 Generando SQL de inserción masiva...');
  let sql = 'SET FOREIGN_KEY_CHECKS=0;\n';
  sql += 'TRUNCATE TABLE promociones;\n';
  sql += 'TRUNCATE TABLE stock_sucursal;\n';
  sql += 'TRUNCATE TABLE productos;\n';
  sql += 'TRUNCATE TABLE categorias;\n';

  // Categorías
  for (const c of uniqueCats) {
    sql += `INSERT INTO categorias (id, nombre, icono, color, estado) VALUES (${c.id}, ${esc(c.nombre)}, ${esc(c.icono)}, ${esc(c.color)}, 1);\n`;
  }

  // Productos por lotes de 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
    const chunk = validProducts.slice(i, i + BATCH_SIZE);
    
    // Inserción en productos
    sql += 'INSERT INTO productos (id, categoria_id, codigo, codigo_barras, nombre, descripcion, unidad, precio_compra, precio_venta, stock, stock_minimo, estado) VALUES\n';
    const prodValues = chunk.map(p => 
      `(${p.id}, ${p.categoria_id}, ${esc(p.codigo)}, ${esc(p.codigo_barras)}, ${esc(p.nombre)}, ${esc(p.descripcion)}, 'UND', ${p.precio_compra}, ${p.precio_venta}, ${p.stock}, ${p.stock_minimo}, 1)`
    );
    sql += prodValues.join(',\n') + ';\n';

    // Inserción en stock_sucursal (Sucursal 1: Sucursal Central)
    sql += 'INSERT INTO stock_sucursal (sucursal_id, producto_id, stock) VALUES\n';
    const stockValues = chunk.map(p => `(1, ${p.id}, ${p.stock})`);
    sql += stockValues.join(',\n') + ';\n';
  }

  // Actualizar datos del negocio en configuracion
  sql += `INSERT INTO configuracion (clave, valor) VALUES 
          ('empresa_nombre', 'KioscoLa10'),
          ('empresa_direccion', 'Lisandro de la torre 1000, Villa María'),
          ('empresa_telefono', '+54 9 3534 01-1184'),
          ('empresa_email', 'ginotridenti9@gmail.com')
          ON DUPLICATE KEY UPDATE valor = VALUES(valor);\n`;

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';

  fs.writeFileSync(OUTPUT_SQL, sql);
  console.log(`   Archivo SQL generado en: ${OUTPUT_SQL} (${(fs.statSync(OUTPUT_SQL).size / 1024 / 1024).toFixed(2)} MB)`);

  // 4. Ejecutar en MySQL
  console.log('🔄 Ejecutando importación en SysTienda MySQL...');
  const phpRunner = `<?php
require_once '/var/www/html/sys_tienda/config/database.php';
$pdo = db();
$sql = file_get_contents('${OUTPUT_SQL}');
$pdo->exec($sql);
echo "✅ MySQL actualizado exitosamente.\\n";
`;
  fs.writeFileSync('/tmp/import_prods.php', phpRunner);
  execSync('php /tmp/import_prods.php', { stdio: 'inherit' });

  // Limpiar temporales
  if (fs.existsSync('/tmp/import_prods.php')) fs.unlinkSync('/tmp/import_prods.php');
  if (fs.existsSync(OUTPUT_SQL)) fs.unlinkSync(OUTPUT_SQL);

  console.log(`\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!`);
  console.log(`   - Categorías importadas: ${uniqueCats.length}`);
  console.log(`   - Productos importados: ${validProducts.length}`);
  console.log(`   - Negocio configurado: Maxikiosco La 10 (+54 9 3534 01-1184)`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ Error durante la migración:', err);
  process.exit(1);
});
