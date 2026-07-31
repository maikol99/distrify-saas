<template>
  <div class="payment-failed-container">
    <div class="payment-failed-card">
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
          class="failed-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h2 class="card-title">Pago Rechazado</h2>
      </div>
      <div class="card-content">
        <p class="card-text">
          Su pago no pudo ser procesado a través de
          <span class="mercadopago-text">Mercado Pago</span>. Esto puede deberse
          a fondos insuficientes, datos incorrectos o restricciones del emisor.
        </p>
        <p class="card-text">
          Le recomendamos verificar los datos de su método de pago e intentar
          nuevamente. Si el problema persiste, puede contactar a su banco o
          probar con otro medio de pago.
        </p>
        <p class="card-text">
          Para cualquier consulta, comuníquese con el negocio.
          <span class="highlight-text">Alevia Pay.com.ar</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaymentFailedMessage",
  methods: {
    retryPayment() {
      // Lógica para reintentar el pago
      console.log("Reintentando pago...");
      // Aquí irían las acciones para volver al proceso de pago
    },
    contactSupport() {
      // Lógica para contactar soporte
      console.log("Contactando soporte...");
      // Aquí se podría abrir un modal, redirigir o enviar email
    },
  },
};
</script>

<style scoped>
.payment-failed-container {
  display: flex;
  min-height: calc(
    100vh - 60px
  ); /* Ajustado para dejar espacio si hay un header/footer */
  align-items: center;
  justify-content: center;
  padding: 24px; /* 1.5rem */
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.payment-failed-card {
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

.failed-icon {
  height: 64px; /* h-16 */
  width: 64px; /* w-16 */
  color: #dc3545; /* Rojo para indicar error/fallo */
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
  margin-bottom: 20px;
}

.highlight-text {
  font-weight: 700; /* font-bold */
  color: #333333; /* text-[#333] */
}

.mercadopago-text {
  font-weight: 600; /* font-semibold */
  color: #009ee3; /* Color característico de Mercado Pago */
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.retry-button {
  width: 100%;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #0056b3;
}

.contact-button {
  width: 100%;
  padding: 12px 24px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.contact-button:hover {
  background-color: #545b62;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .payment-failed-container {
    padding: 16px; /* p-4 md:p-6 */
  }

  .payment-failed-card {
    padding: 20px; /* p-6 */
  }

  .failed-icon {
    height: 56px; /* Slightly smaller on mobile */
    width: 56px;
  }

  .card-title {
    font-size: 22px;
  }

  .card-text {
    font-size: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .retry-button,
  .contact-button {
    font-size: 15px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .payment-failed-card {
    padding: 16px;
  }

  .failed-icon {
    height: 48px;
    width: 48px;
  }

  .card-title {
    font-size: 20px;
  }

  .card-text {
    font-size: 14px;
  }

  .retry-button,
  .contact-button {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>
