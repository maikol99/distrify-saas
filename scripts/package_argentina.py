import os
import shutil
import zipfile

BASE_DIR = "/var/www/html/sys_tienda"
OUTPUT_ZIP = "/home/maikol/distrify-SAAS/sys_tienda_argentina.zip"
SCRIPTS_ZIP = "/home/maikol/distrify-SAAS/scripts/sys_tienda_argentina.zip"

print("1. Ejecutando transformación del instalador a formato argentino...")
os.system("python3 /home/maikol/distrify-SAAS/scripts/make_turnkey_argentina.py")

print("2. Creando paquete ZIP de distribución...")
# Excluir locks, copias temporales y claves locales
exclude_names = ["installed.lock", ".git", ".DS_Store", "local.php"]
exclude_suffixes = [".bak", ".sql.gz"]

with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file in exclude_names or any(file.endswith(s) for s in exclude_suffixes):
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, os.path.dirname(BASE_DIR))
            zipf.write(filepath, arcname)

print(f"✓ ZIP creado exitosamente en: {OUTPUT_ZIP}")
shutil.copy2(OUTPUT_ZIP, SCRIPTS_ZIP)
print(f"✓ Copia para instalador guardada en: {SCRIPTS_ZIP}")

# Dar permisos de ejecución al script instalador
os.system("chmod +x /home/maikol/distrify-SAAS/scripts/instalar_kiosco.sh")
print("✓ Script instalador_kiosco.sh configurado con permisos de ejecución.")
print("=== ¡TODO LISTO! ===")
