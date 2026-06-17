# Contribuir a Distrify Frontend

¡Gracias por tu interés en contribuir! Antes de empezar, tené en cuenta lo siguiente.

## Antes de contribuir

Este proyecto se distribuye bajo licencia MIT con una **cláusula adicional de atribución obligatoria** (ver [LICENSE](../LICENSE)). Cualquier fork, despliegue o uso comercial debe mantener visible el crédito **"Powered by Distrify — cuyocode.com.ar"** en el footer de cada pantalla. Si tu contribución toca `FooterCreditComponent.vue`, `dashboardLayout.vue`, `landingPage.vue` o cualquier componente relacionado con esa atribución, tu PR no será aceptado si la elimina, oculta o reduce su visibilidad.

## Configurar el entorno local

```bash
git clone https://github.com/tu-usuario/distrify.git
cd distrify/front
npm install
cp .env.example .env
npm run dev
```

Necesitás tener corriendo el backend de Distrify (`../back`) en paralelo. Ver el [README](README.md) para el detalle completo.

## Flujo de contribución

1. Hacé un **fork** del repositorio.
2. Creá una rama descriptiva: `git checkout -b feature/nombre-funcionalidad` o `fix/nombre-del-bug`.
3. Hacé tus cambios siguiendo el estilo de código existente (componentes Vue 3, Options API consistente con el resto del proyecto).
4. Verificá que el build no se rompa:
   ```bash
   npm run build
   ```
5. Commits claros y descriptivos.
6. Abrí un Pull Request describiendo el cambio y su motivación.

## Convenciones

- Seguí la estructura de carpetas existente (`components/dashboard`, `components/visuals`, `views`, `stores`, `services`).
- No incluyas credenciales, tokens ni archivos `.env` en tus commits.
- Mantené el estilo visual consistente con el resto del dashboard (colores, tipografía Poppins, etc.).

## Reportar bugs o proponer features

Abrí un [Issue](https://github.com/tu-usuario/distrify-front/issues) describiendo el problema o la propuesta con el mayor detalle posible.
