# Contribuir a Distrify Backend

¡Gracias por tu interés en contribuir! Antes de empezar, tené en cuenta lo siguiente.

## Antes de contribuir

Este proyecto se distribuye bajo licencia MIT con una **cláusula adicional de atribución obligatoria** (ver [LICENSE](LICENSE)). Cualquier fork, despliegue o uso comercial debe mantener visible el crédito **"Powered by Distrify — cuyocode.com.ar"**. Si tu contribución modifica el footer, layouts, o cualquier componente relacionado con esa atribución, tu PR no será aceptado si la elimina u oculta.

## Configurar el entorno local

```bash
git clone https://github.com/tu-usuario/distrify-back.git
cd distrify-back
npm install
cp .env.example .env
npm run start:dev
```

Ver el [README](README.md) para el detalle completo de variables de entorno y configuración de base de datos.

## Flujo de contribución

1. Hacé un **fork** del repositorio.
2. Creá una rama descriptiva: `git checkout -b feature/nombre-funcionalidad` o `fix/nombre-del-bug`.
3. Hacé tus cambios siguiendo el estilo de código existente.
4. Corré el linter y los tests antes de commitear:
   ```bash
   npm run lint
   npm run test
   ```
5. Commits claros y descriptivos.
6. Abrí un Pull Request describiendo el cambio y su motivación.

## Convenciones

- TypeScript estricto, seguí los patrones de NestJS ya usados en el proyecto (módulos, DTOs, guards).
- Ejecutá `npm run format` antes de cada commit.
- Agregá tests para nueva funcionalidad cuando sea posible.
- No incluyas credenciales, tokens ni archivos `.env` en tus commits.

## Reportar bugs o proponer features

Abrí un [Issue](https://github.com/tu-usuario/distrify-back/issues) describiendo el problema o la propuesta con el mayor detalle posible.

## Reportar vulnerabilidades de seguridad

No abras un issue público. Seguí el proceso descrito en [SECURITY.md](SECURITY.md).
