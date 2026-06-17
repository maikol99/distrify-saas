# Distrify - Gestión & Ecommerce

![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Frontend del sistema de gestión empresarial y ecommerce Distrify. Aplicación SPA construida con Vue 3 y Vite que consume la [API backend de Distrify](https://github.com/tu-usuario/distrify-back), ofreciendo dashboard de gestión (ventas, compras, stock, clientes, proveedores, caja, reportes) y una tienda online pública.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso Comercial y White-Label](#uso-comercial-y-white-label)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Requisitos Previos

| Software | Versión Mínima | Descripción                        |
| -------- | --------------- | ----------------------------------- |
| Node.js  | v18.0.0+        | Entorno de ejecución de JavaScript  |
| npm      | v9.0.0+         | Gestor de paquetes                  |

Este frontend requiere que el [backend de Distrify](https://github.com/tu-usuario/distrify-back) esté corriendo (local o desplegado) para funcionar.

## Instalación

```bash
git clone https://github.com/tu-usuario/distrify-front.git
cd distrify-front
npm install
```

Crea tu archivo de variables de entorno:

```bash
cp .env.example .env
```

## Variables de Entorno

```env
# URL base de la API backend
VITE_API_URL=http://localhost:3000

# Client ID de Google OAuth (login con Google One Tap)
# Obtener desde: Google Cloud Console > APIs y Servicios > Credenciales
VITE_GOOGLE_CLIENT_ID=
```

> **Importante:** nunca incluyas el Client Secret de Google aquí — solo el Client ID, que es público.

## Scripts Disponibles

| Script            | Descripción                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`       | Inicia el servidor de desarrollo (Vite)        |
| `npm run build`     | Compila la aplicación para producción          |
| `npm run preview`   | Sirve el build de producción localmente        |
| `npm run serve`     | Sirve el build con `serve` en el puerto 4433   |

## Estructura del Proyecto

```
distrify-front/
├── src/
│   ├── main.js              # Punto de entrada
│   ├── App.vue               # Componente raíz
│   ├── components/
│   │   ├── dashboard/        # Componentes del panel de gestión
│   │   └── visuals/          # Componentes visuales compartidos
│   ├── views/                # Vistas a nivel de página (landing, dashboard, etc.)
│   ├── router/                # Configuración de Vue Router
│   ├── stores/                # Estado global (Pinia)
│   ├── services/              # Servicios de consumo de API
│   ├── guards/                 # Guards de rutas
│   └── config/                 # Configuración (axios, etc.)
├── public/                    # Assets estáticos
├── .env.example                # Plantilla de variables de entorno
├── vite.config.js
└── package.json
```

---

## Uso Comercial y White-Label

Este proyecto es open source y puede ser usado, modificado y comercializado libremente, incluyendo aplicar tu propia marca (white-label). La única condición es mantener visible, sin ocultar ni deshabilitar, el crédito de atribución descrito en la [Licencia](#licencia) en cualquier interfaz desplegada — sin importar el branding que apliques.

## Contribución

¡Contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Abre un Pull Request**

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## Licencia

Este proyecto está bajo la licencia **MIT con una cláusula adicional de atribución obligatoria**. Ver el archivo [LICENSE](../LICENSE) para el texto completo.

En resumen:

- Podés usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software (MIT estándar).
- Cualquier despliegue con interfaz visible para usuarios finales debe mostrar siempre, en el pie de página, el crédito **"Powered by Distrify — cuyocode.com.ar"** enlazando a [https://cuyocode.com.ar](https://cuyocode.com.ar), sin poder ocultarlo, deshabilitarlo ni hacerlo menos visible que el resto del contenido del footer. Esto aplica incluso a usos privados o internos.

---

<p align="center">
  Desarrollado con ❤️ usando Vue 3 y Vite
</p>
