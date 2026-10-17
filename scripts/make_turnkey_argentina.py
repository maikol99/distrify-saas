import os
import re

SQL_FILE = "/var/www/html/sys_tienda/database/sys_tienda.sql"
INSTALL_FILE = "/var/www/html/sys_tienda/install.php"

print("=== Modificando database/sys_tienda.sql para Argentina ===")
with open(SQL_FILE, "r", encoding="utf-8") as f:
    sql = f.read()

# 1. Cambiar ENUM de metodo_pago a VARCHAR(30)
sql = sql.replace(
    "metodo_pago ENUM('EFECTIVO','TARJETA','YAPE','PLIN','TRANSFERENCIA','CREDITO') NOT NULL DEFAULT 'EFECTIVO'",
    "metodo_pago VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO'"
)

# 2. Cambiar configuracion por defecto
old_config = """INSERT INTO configuracion (clave, valor) VALUES
 ('empresa_nombre','Bodega Don Vito'),
 ('empresa_ruc','20601234567'),
 ('empresa_direccion','Av. Principal 123, Lima'),
 ('empresa_telefono','999 888 777'),
 ('empresa_razon_social',''),
 ('empresa_email',''),
 ('empresa_web',''),
 ('empresa_eslogan',''),
 ('empresa_logo',''),
 ('moneda','S/'),
 ('moneda_codigo','PEN'),
 ('moneda_decimales','2'),
 ('sep_decimal','.'),
 ('sep_miles',','),
 ('moneda_posicion','antes'),
 ('impuesto_nombre','IGV'),
 ('zona_horaria','America/Lima'),
 ('filas_pagina','12'),
 ('vencimiento_dias','30'),
 ('stock_minimo_defecto','5'),
 ('ticket_logo','1'),
 ('igv','18'),
 ('meta_diaria','2500'),
 ('ticket_mensaje','¡Gracias por su compra! Vuelva pronto.'),
 ('puntos_cada','10'),
 ('puntos_valor','0.10'),
 ('cumple_descuento','5'),"""

new_config = """INSERT INTO configuracion (clave, valor) VALUES
 ('empresa_nombre','Mi Kiosco / Comercio'),
 ('empresa_ruc','20-12345678-9'),
 ('empresa_direccion','Av. Principal 123'),
 ('empresa_telefono',''),
 ('empresa_razon_social',''),
 ('empresa_email',''),
 ('empresa_web',''),
 ('empresa_eslogan',''),
 ('empresa_logo',''),
 ('moneda','$'),
 ('moneda_codigo','ARS'),
 ('moneda_decimales','2'),
 ('sep_decimal',','),
 ('sep_miles','.'),
 ('moneda_posicion','antes'),
 ('impuesto_nombre','IVA'),
 ('zona_horaria','America/Argentina/Buenos_Aires'),
 ('filas_pagina','12'),
 ('vencimiento_dias','30'),
 ('stock_minimo_defecto','5'),
 ('ticket_logo','1'),
 ('igv','0'),
 ('meta_diaria','150000'),
 ('ticket_mensaje','¡Muchas gracias por su compra!'),
 ('puntos_cada','1000'),
 ('puntos_valor','10.00'),
 ('cumple_descuento','10'),"""

sql = sql.replace(old_config, new_config)

# Sucursales en Argentina
sql = sql.replace("Av. Principal 123, Lima", "Av. Principal 123, Buenos Aires")
sql = sql.replace("Jr. Los Olivos 456, Lima", "Av. San Martín 456, Córdoba")

with open(SQL_FILE, "w", encoding="utf-8") as f:
    f.write(sql)
print("✓ database/sys_tienda.sql actualizado exitosamente.")


print("=== Modificando install.php para Argentina ===")
with open(INSTALL_FILE, "r", encoding="utf-8") as f:
    inst = f.read()

# Timezone al instalar
inst = inst.replace("$pdo->exec(\"SET time_zone = '-05:00'\");", "$pdo->exec(\"SET time_zone = '-03:00'\");")

# Categorías de Kiosco / Almacén Argentino
old_cats = """    $cats = [
        ['Abarrotes','bi-basket3','#f59e0b'], ['Bebidas','bi-cup-straw','#06b6d4'], ['Lácteos','bi-droplet-half','#3b82f6'],
        ['Snacks y Golosinas','bi-cookie','#ec4899'], ['Limpieza','bi-stars','#10b981'], ['Cuidado Personal','bi-heart-pulse','#8b5cf6'],
        ['Licores','bi-cup-hot','#ef4444'], ['Panadería','bi-egg-fried','#d97706'],
    ];"""

new_cats = """    $cats = [
        ['Kiosco y Golosinas','bi-cookie','#ec4899'], ['Bebidas','bi-cup-straw','#06b6d4'], ['Almacén','bi-basket3','#f59e0b'],
        ['Galletitas y Snacks','bi-box-seam','#f97316'], ['Lácteos y Fiambrería','bi-droplet-half','#3b82f6'], ['Cigarrillos y Varios','bi-tag','#8b5cf6'],
        ['Bebidas con Alcohol','bi-cup-hot','#ef4444'], ['Limpieza','bi-stars','#10b981'],
    ];"""
inst = inst.replace(old_cats, new_cats)

# Marcas argentinas
old_marcas = "['Alicorp','Gloria','Coca-Cola','Backus','Laive','Nestlé','Costeño','Primor','Bolívar','Dove','Field','San Fernando']"
new_marcas = "['Arcor','Coca-Cola','Quilmes','Bagley','La Serenísima','Terrabusi','Maradent','Guaymallén','Lays','Beldent','Cunnington','Ser']"
inst = inst.replace(old_marcas, new_marcas)

# Productos argentinos con costo, venta con +50% markup
old_prods_block = """    // [cat, nombre, unidad, compra, venta, stock, minimo]
    $prods = [
        [1,'Arroz Costeño Extra 5kg','BLS',19.50,23.90,48,10],[1,'Azúcar Rubia Cartavio 1kg','KG',3.40,4.50,70,15],
        [1,'Aceite Primor Premium 1L','BOT',8.20,10.90,36,8],[1,'Fideo Don Vittorio Spaghetti 500g','PQT',2.30,3.20,90,20],
        [1,'Atún Florida Filete 170g','LAT',4.10,5.50,60,12],[1,'Menestra Lentejas 500g','PQT',3.00,4.20,3,10],
        [1,'Sal Emsal Yodada 1kg','BLS',1.00,1.60,55,10],[1,'Harina Blanca Flor 1kg','KG',3.20,4.30,40,10],
        [2,'Coca-Cola 1.5L','BOT',5.20,7.00,80,20],[2,'Inca Kola 1.5L','BOT',5.20,7.00,75,20],
        [2,'Agua San Luis 625ml','BOT',0.90,1.50,120,30],[2,'Cielo Agua sin gas 2.5L','BOT',2.40,3.50,40,10],
        [2,'Sporade Naranja 500ml','BOT',1.80,2.80,4,12],[2,'Gatorade Limón 500ml','BOT',2.30,3.50,45,12],
        [2,'Frugos del Valle Durazno 1L','CJA',3.00,4.20,35,10],
        [3,'Leche Gloria Evaporada 400g','LAT',3.40,4.50,100,24],[3,'Yogurt Gloria Fresa 1L','BOT',5.30,7.00,28,8],
        [3,'Queso Edam Laive 250g','PQT',9.50,12.50,15,5],[3,'Mantequilla Laive 200g','PQT',6.00,8.00,2,6],
        [3,'Leche Gloria Pura Vida 1L','CJA',3.80,4.90,60,15],
        [4,'Papas Lays Clásicas 150g','BLS',3.60,5.00,50,12],[4,'Galleta Soda Field 6un','PQT',1.40,2.00,85,20],
        [4,'Chocolate Sublime 30g','UND',1.00,1.60,110,30],[4,'Chizitos Pequeño','BLS',0.70,1.00,140,30],
        [4,'Casino Fresa Galletas','UND',0.60,1.00,6,25],[4,'Chicle Trident Menta','UND',0.90,1.50,60,15],
        [5,'Detergente Bolívar 800g','BLS',9.00,12.50,25,8],[5,'Lejía Clorox 1L','BOT',3.20,4.80,32,10],
        [5,'Lavavajilla Sapolio 750g','UND',4.60,6.50,30,8],[5,'Papel Higiénico Elite x4','PQT',4.80,6.90,44,12],
        [5,'Jabón Bolívar Barra','UND',1.60,2.50,2,15],
        [6,'Shampoo Head&Shoulders 375ml','BOT',14.00,19.50,18,5],[6,'Jabón Dove 90g','UND',3.20,4.80,50,12],
        [6,'Pasta Dental Colgate 75ml','UND',4.50,6.50,38,10],[6,'Desodorante Rexona 50g','UND',6.50,9.50,22,6],
        [7,'Cerveza Pilsen Callao 620ml','BOT',4.60,6.50,96,24],[7,'Cerveza Cusqueña Dorada 330ml','BOT',3.80,5.50,70,18],
        [7,'Pisco Quebranta Tabernero 750ml','BOT',32.00,44.00,12,4],[7,'Ron Cartavio Black 750ml','BOT',26.00,36.00,9,3],
        [8,'Pan Francés (bolsa x10)','BLS',2.50,4.00,40,10],[8,'Pan de Molde Bimbo Grande','BLS',7.50,10.50,14,5],
        [8,'Keke Marmoleado Mini','UND',1.80,3.00,20,8],
    ];"""

new_prods_block = """    // [cat, nombre, unidad, compra, venta, stock, minimo] -> Con +50% de margen Alevia Pay
    $prods = [
        [1,'Alfajor Guaymallén Chocolate','UND',400.00,600.00,100,20],[1,'Alfajor Havanna Mixto','UND',1200.00,1800.00,40,10],
        [1,'Chicles Beldent Menta','UND',500.00,750.00,80,20],[1,'Caramelos Sugus 50g','PQT',600.00,900.00,60,15],
        [1,'Chocolate Block 38g','UND',800.00,1200.00,50,15],[1,'Turrón Arcor 25g','UND',300.00,450.00,120,30],
        [2,'Coca-Cola 500ml','BOT',1000.00,1500.00,90,20],[2,'Coca-Cola 1.5L','BOT',1800.00,2700.00,60,15],
        [2,'Agua Villavicencio 500ml','BOT',700.00,1050.00,80,20],[2,'Gaseosa Cunnington Cola 2.25L','BOT',1200.00,1800.00,50,15],
        [2,'Speed Unlimited 250ml','LAT',1100.00,1650.00,70,20],[2,'Gatorade Manzana 500ml','BOT',1200.00,1800.00,40,10],
        [3,'Yerba Playadito 500g','PQT',2000.00,3000.00,40,10],[3,'Azúcar Ledesma 1kg','KG',900.00,1350.00,50,15],
        [3,'Fideos Matarazzo Guisero 500g','PQT',1100.00,1650.00,45,10],[3,'Aceite Cocinero 900ml','BOT',1600.00,2400.00,35,10],
        [4,'Papas Lays Clásicas 85g','BLS',1400.00,2100.00,50,15],[4,'Galletitas Oreo 118g','PQT',1000.00,1500.00,60,15],
        [4,'Galletitas Chocolinas 170g','PQT',1200.00,1800.00,55,15],[4,'Bizcochitos Don Satur Grasa','PQT',700.00,1050.00,70,20],
        [5,'Leche La Serenísima Entera 1L','CJA',1100.00,1650.00,60,15],[5,'Yogur Yogurísimo Frutilla 1L','BOT',1500.00,2250.00,30,10],
        [6,'Cigarrillos Marlboro Box 20','PQT',3200.00,3800.00,50,10],[6,'Cigarrillos Philip Morris Box 20','PQT',2900.00,3500.00,50,10],
        [6,'Encendedor Bic Chico','UND',800.00,1200.00,40,10],
        [7,'Cerveza Quilmes Clásica 1L','BOT',2200.00,3300.00,60,18],[7,'Cerveza Corona 330ml','BOT',1800.00,2700.00,48,12],
        [7,'Fernet Branca 750ml','BOT',9000.00,13500.00,20,5],
        [8,'Lavandina Ayudín 1L','BOT',900.00,1350.00,30,10],[8,'Detergente Magistral 300ml','BOT',1600.00,2400.00,35,10],
    ];"""
inst = inst.replace(old_prods_block, new_prods_block)

# Métodos de pago en ventas demo
old_met = "$metodos = ['EFECTIVO','EFECTIVO','EFECTIVO','EFECTIVO','YAPE','YAPE','PLIN','TARJETA','TARJETA','CREDITO'];"
new_met = "$metodos = ['EFECTIVO','EFECTIVO','MERCADOPAGO','MERCADOPAGO','TRANSFERENCIA','DEBITO','TARJETA','CREDITO'];"
inst = inst.replace(old_met, new_met)

# Clientes argentinos
old_cl = "$cl = ['Cliente Varios','Rosa Mendoza Huamán','Carlos Pérez Díaz','Bodega El Sol SAC','Juana Torres Ríos','Restaurante Sabor Criollo EIRL','Miguel Soto Vega','Ana Castillo Lara','Pedro Gutiérrez Paz','Lucía Fernández Ayala'];"
new_cl = "$cl = ['Cliente Varios','Juan Carlos Rossi','María Elena Gómez','Kiosco Central SRL','Lucas Benítez','Maxikiosco Los Amigos','Agustina Morales','Facundo Romero','Lautaro Díaz','Sofía Álvarez'];"
inst = inst.replace(old_cl, new_cl)

# Venta demo limpia sin 1.18 IGV
inst = inst.replace("round($tot / 1.18, 2), round($tot - $tot / 1.18, 2)", "round($tot, 2), 0.00")

# Actualizar series
inst = inst.replace(
    "$serieDe = [1 => ['TICKET' => 'T001', 'BOLETA' => 'B001', 'FACTURA' => 'F001'], 2 => ['TICKET' => 'T002', 'BOLETA' => 'B002', 'FACTURA' => 'F002']];",
    "$serieDe = [1 => ['TICKET' => 'T001', 'BOLETA' => 'B001', 'FACTURA' => 'A001'], 2 => ['TICKET' => 'T002', 'BOLETA' => 'B002', 'FACTURA' => 'A002']];"
)

with open(INSTALL_FILE, "w", encoding="utf-8") as f:
    f.write(inst)
print("✓ install.php actualizado exitosamente con catálogo argentino y cálculo limpio.")

print("=== Listo para empaquetar ===")
