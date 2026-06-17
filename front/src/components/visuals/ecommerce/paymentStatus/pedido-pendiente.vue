<template>
  <div class="order-message-container">
    <div class="order-message-card">
      <div class="card-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="check-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
        <h2 class="card-title">¡Pedido Procesado!</h2>
      </div>
      <div class="card-content">
        <p class="card-text">
          Su pedido ha sido procesado exitosamente. Recibirá más detalles y actualizaciones sobre el estado de su
          compra directamente en su correo electrónico.
        </p>
        <p class="card-text">
          ¡Muchas gracias por confiar en <span class="highlight-text">Distrify.com.ar</span> para realizar
          sus compras!
        </p>
        
        <!-- Nuevo mensaje sobre spam -->
        <div class="spam-notice">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="info-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p class="spam-text">
            <strong>Importante:</strong> Si no recibe nuestro email en los próximos minutos, 
            por favor <strong>revise su carpeta de spam o correo no deseado</strong>. 
            A veces los correos pueden llegar allí por error.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'OrderProcessingMessage',
  // No se necesitan props ni data para este componente informativo simple
};
</script>
<style scoped>
.order-message-container {
  display: flex;
  min-height: calc(100vh - 60px); /* Ajustado para dejar espacio si hay un header/footer */
  align-items: center;
  justify-content: center;
  padding: 24px; /* 1.5rem */
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.order-message-card {
  width: 100%;
  max-width: 480px; /* max-w-md */
  text-align: center;
  padding: 24px; /* p-6 */
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-sm */
}
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px; /* space-y-4 + pb-6 */
  padding-bottom: 24px;
}
.check-icon {
  height: 64px; /* h-16 */
  width: 64px; /* w-16 */
  color: #28a745; /* text-[#28a745] */
  margin-bottom: 16px; /* space-y-4 */
}
.card-title {
  font-size: 24px; /* text-2xl */
  font-weight: 600; /* font-semibold */
  color: #111111; /* text-[#111] */
  margin: 0; /* Reset default h2 margin */
}
.card-content {
  margin-bottom: 0; /* space-y-4 */
}
.card-text {
  font-size: 16px; /* text-base */
  color: #666666; /* text-[#666] */
  line-height: 1.625; /* leading-relaxed */
  margin-bottom: 16px; /* space-y-4 */
}
.card-text:last-child {
  margin-bottom: 0;
}
.highlight-text {
  font-weight: 700; /* font-bold */
  color: #333333; /* text-[#333] */
}

/* Estilos para el aviso de spam */
.spam-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 24px;
  padding: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  text-align: left;
}
.info-icon {
  color: #856404;
  flex-shrink: 0;
  margin-top: 2px;
}
.spam-text {
  font-size: 14px;
  color: #856404;
  line-height: 1.5;
  margin: 0;
}
.spam-text strong {
  font-weight: 600;
  color: #664309;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-message-container {
    padding: 16px; /* p-4 md:p-6 */
  }
  .order-message-card {
    padding: 20px; /* p-6 */
  }
  .check-icon {
    height: 56px; /* Slightly smaller on mobile */
    width: 56px;
  }
  .card-title {
    font-size: 22px;
  }
  .card-text {
    font-size: 15px;
  }
  .spam-notice {
    padding: 14px;
    gap: 10px;
  }
  .spam-text {
    font-size: 13px;
  }
}
@media (max-width: 480px) {
  .order-message-card {
    padding: 16px;
  }
  .check-icon {
    height: 48px;
    width: 48px;
  }
  .card-title {
    font-size: 20px;
  }
  .card-text {
    font-size: 14px;
  }
  .spam-notice {
    padding: 12px;
    gap: 8px;
  }
  .spam-text {
    font-size: 12px;
  }
}</style>