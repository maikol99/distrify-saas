<template>
  <section class="access-denied">
    <div
      class="card"
      role="alert"
      aria-labelledby="ad-title"
      aria-describedby="ad-desc"
    >
      <div class="icon" aria-hidden="true">🔒</div>

      <h1 id="ad-title" class="title">Acceso denegado</h1>

      <p id="ad-desc" class="description">
        No tenés los permisos necesarios para acceder a esta sección.
      </p>

      <div class="actions">
        <button class="btn btn-primary" @click="goHome" type="button">
          Volver al inicio
        </button>

        <button class="btn btn-secondary" @click="goBack" type="button">
          Volver
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AccesoDenegado",
  props: {
    // Ruta a la que redirigir con "Volver al inicio"
    redirectTo: {
      type: String,
      default: "/inicio",
    },
    // Mostrar texto de contacto (opcional)
    showContact: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    goHome() {
      // redirige a la ruta por defecto o la pasada por prop
      if (this.$router) {
        this.$router.push(this.redirectTo).catch(() => {});
      } else {
        window.location.href = this.redirectTo;
      }
    },
    goBack() {
      // intenta volver en el historial, si no, va al inicio
      if (window.history.length > 1) {
        this.$router ? this.$router.back() : window.history.back();
      } else {
        this.goHome();
      }
    },
  },
};
</script>

<style scoped>
/* Contenedor centrado */
.access-denied {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: #f7f8fa;
}

/* Tarjeta */
.card {
  width: 100%;
  max-width: 680px;
  background: #ffffff;
  border: 1px solid #e6e9ee;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.06);
  text-align: center;
}

/* Icono grande */
.icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}

/* Título y texto */
.title {
  font-size: 22px;
  margin: 6px 0 10px 0;
  color: #0f172a;
  font-weight: 600;
}

.description {
  font-size: 15px;
  margin: 0 0 20px 0;
  color: #475569;
  line-height: 1.4;
  max-width: 52ch;
  margin-left: auto;
  margin-right: auto;
}

/* Acciones (botones) */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  min-width: 140px;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

/* Primary */
.btn-primary {
  background-color: #0ea5a4; /* teal-ish */
  color: #ffffff;
  box-shadow: 0 6px 12px rgba(14, 165, 164, 0.12);
}
.btn-primary:active {
  transform: translateY(1px);
}
.btn-primary:focus {
  outline: 3px solid rgba(14, 165, 164, 0.18);
}

/* Secondary */
.btn-secondary {
  background-color: transparent;
  color: #334155;
  border: 1px solid #d1d5db;
}
.btn-secondary:active {
  transform: translateY(1px);
}
.btn-secondary:focus {
  outline: 3px solid rgba(99, 102, 241, 0.08);
}

/* Texto de ayuda */
.help {
  margin-top: 18px;
  font-size: 13px;
  color: #64748b;
}

/* Responsive: más compacto en móviles */
@media (max-width: 420px) {
  .card {
    padding: 18px;
    border-radius: 10px;
  }
  .title {
    font-size: 18px;
  }
  .description {
    font-size: 14px;
  }
  .btn {
    min-width: 120px;
    padding: 9px 12px;
  }
}
</style>
