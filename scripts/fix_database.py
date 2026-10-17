clean_database_php = """<?php
require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            // Zona horaria configurable
            $tz = TIMEZONE;
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
            }
        } catch (PDOException $e) {
            http_response_code(500);
            die('<h3 style=\"font-family:sans-serif\">No se pudo conectar a la base de datos.</h3>'
              . '<p style=\"font-family:sans-serif\">Ejecuta primero <a href=\"' . BASE_URL . '/install.php\">install.php</a> '
              . 'y revisa <code>config/config.php</code>.</p>');
        }
    }
    return $pdo;
}
"""

with open("/var/www/html/sys_tienda/config/database.php", "w", encoding="utf-8") as f:
    f.write(clean_database_php)

print("database.php limpiado y reparado correctamente.")
