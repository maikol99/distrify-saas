<template>
  <div class="payment-success-container">
    <div class="payment-success-card">
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
          class="success-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
        <h2 class="card-title">¡Pago Aprobado!</h2>
      </div>
      <div class="card-content">
        <p class="card-text">
          Su pago ha sido procesado y aprobado exitosamente a través de 
          <span class="mercadopago-text">Mercado Pago</span>.
        </p>
        <p class="card-text">
          En breve recibirá por correo electrónico todas las instrucciones 
          y detalles adicionales sobre su compra.
        </p>
        <p class="card-text">
          ¡Muchas gracias por confiar en <span class="highlight-text">Distrify.com.ar</span> 
          para realizar sus compras!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccessMessage',
  // No se necesitan props ni data para este componente informativo simple
};
</script>

<style scoped>
.payment-success-container {
  display: flex;
  min-height: calc(100vh - 60px); /* Ajustado para dejar espacio si hay un header/footer */
  align-items: center;
  justify-content: center;
  padding: 24px; /* 1.5rem */
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.payment-success-card {
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

.success-icon {
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

.mercadopago-text {
  font-weight: 600; /* font-semibold */
  color: #009ee3; /* Color característico de Mercado Pago */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .payment-success-container {
    padding: 16px; /* p-4 md:p-6 */
  }
  
  .payment-success-card {
    padding: 20px; /* p-6 */
  }
  
  .success-icon {
    height: 56px; /* Slightly smaller on mobile */
    width: 56px;
  }
  
  .card-title {
    font-size: 22px;
  }
  
  .card-text {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .payment-success-card {
    padding: 16px;
  }
  
  .success-icon {
    height: 48px;
    width: 48px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .card-text {
    font-size: 14px;
  }
}
</style>