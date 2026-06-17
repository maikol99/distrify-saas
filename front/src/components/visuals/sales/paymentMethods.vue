<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Registrar pago con múltiples medios</h2>
        <button @click="cancel" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Métodos de pago ya registrados -->
        <div v-if="registeredPayments.length > 0" class="registered-payments-section">
          <h3 class="section-title">Pagos Registrados</h3>
          <div class="registered-payments-list">
            <div v-for="(payment, index) in registeredPayments" :key="`registered-${index}`"
              class="registered-payment-item">
              <div class="payment-info">
                <span class="payment-method">{{ payment.method }}</span>
                <span class="payment-amount">{{ formatPrice(payment.amount) }}</span>
              </div>
              <button @click="removeRegisteredPayment(index)" class="btn-icon btn-delete"
                title="Eliminar pago registrado" :disabled="payment.locked">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="registered-total">
            <strong>Total registrado: {{ formatPrice(totalRegisteredAmount) }}</strong>
          </div>
        </div>

        <!-- Métodos de pago actuales (en proceso) -->
        <div class="current-payments-section">
          <h3 class="section-title">
            {{ registeredPayments.length > 0 ? 'Agregar Más Pagos' : 'Métodos de Pago' }}
          </h3>
          <div class="payment-methods-list">
            <div v-for="(payment, index) in currentPaymentMethods" :key="`current-${index}`" class="payment-item-input">
              <div class="form-group flex-grow">
                <label :for="`method-${index}`" class="sr-only">Medio de pago {{ index + 1 }}:</label>
                <select v-model="payment.method" :id="`method-${index}`" class="form-control">
                  <option value="" disabled>Seleccione medio</option>
                  <option :value="method" v-for="method in availablePaymentMethods" :key="method">
                    {{ method }}
                  </option>
                </select>
              </div>
              <div class="form-group flex-grow">
                <label :for="`amount-${index}`" class="sr-only">Monto {{ index + 1 }}:</label>
                <input type="number" v-model.number="payment.amount" :id="`amount-${index}`" class="form-control"
                  placeholder="Monto" step="0.01" />
              </div>
              <button @click="removePaymentMethod(index)" class="btn-icon btn-delete" title="Eliminar método">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <button @click="addPaymentMethod" class="btn-secondary btn-add-method">
            <i class="fas fa-plus"></i> Añadir Medio de Pago
          </button>
        </div>

        <div class="totals-section">
          <div class="total-line">
            <p>Total de la compra:</p>
            <span class="total-amount">{{ formatPrice(venta) }}</span>
          </div>
          <div class="total-line">
            <p>Monto ya registrado:</p>
            <span class="registered-amount">{{ formatPrice(totalRegisteredAmount) }}</span>
          </div>
          <div class="total-line">
            <p>Monto ingresado:</p>
            <span :class="['entered-amount', { 'text-danger': enteredAmount > remainingToRegister }]">{{
              formatPrice(enteredAmount) }}</span>
          </div>
          <div class="total-line remaining-line">
            <p>Restante a pagar:</p>
            <span
              :class="['remaining-amount', { 'text-success': remainingAmount === 0, 'text-warning': remainingAmount > 0 }]">
              {{ formatPrice(remainingAmount) }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="registerPurchase" :disabled="!canRegisterPayment">
          <i class="fas fa-check"></i>
          {{ registeredPayments.length > 0 ? 'Completar Pago' : 'Registrar Pago' }}
        </button>
        <button class="btn-secondary" @click="cancel">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from "numeral"; // Asegúrate de tener numeral instalado o usa Intl.NumberFormat

export default {
  props: {
    venta: {
      type: Number,
      required: true,
    },
    // Propiedad opcional para precargar métodos de pago existentes
    initialPaymentMethods: {
      type: Array,
      default: () => [],
    },
    // Propiedad para pagos ya registrados que se pueden eliminar
    existingPayments: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["purchase-registered", "payment-removed", "close"],
  data() {
    return {
      currentPaymentMethods: [], // Array de objetos { method: string, amount: number }
      registeredPayments: [], // Array de pagos ya registrados
      availablePaymentMethods: [
        "Efectivo",
        "Transferencia",
        "Cuenta corriente",
        "Credito",
        "Debito",
      ],
    };
  },
  computed: {
    enteredAmount() {
      return this.currentPaymentMethods.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    },
    totalRegisteredAmount() {
      return this.registeredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    },
    remainingToRegister() {
      return this.venta - this.totalRegisteredAmount;
    },
    remainingAmount() {
      return this.remainingToRegister - this.enteredAmount;
    },
    canRegisterPayment() {
      // Puede registrar si:
      // 1. No hay monto restante (está completo)
      // 2. O si hay al menos un método válido para agregar
      const hasValidCurrentPayments = this.currentPaymentMethods.some(p => p.method && p.amount > 0);
      return this.remainingAmount === 0 || (hasValidCurrentPayments && this.enteredAmount > 0);
    }
  },
  watch: {
    // Observar cambios en initialPaymentMethods para cargar datos al abrir el modal
    initialPaymentMethods: {
      handler(newMethods) {
        if (newMethods && newMethods.length > 0) {
          this.currentPaymentMethods = JSON.parse(JSON.stringify(newMethods));
        } else if (this.currentPaymentMethods.length === 0) {
          // Si no hay métodos iniciales y el array está vacío, añadir uno por defecto
          this.addPaymentMethod();
        }
      },
      immediate: true,
      deep: true,
    },
    // Observar pagos existentes
    existingPayments: {
      handler(newPayments) {
        if (newPayments && newPayments.length > 0) {
          this.registeredPayments = JSON.parse(JSON.stringify(newPayments));
        }
      },
      immediate: true,
      deep: true,
    },
    // Si la venta cambia, ajustar los montos si es necesario
    venta(newVal, oldVal) {
      if (newVal !== oldVal && this.currentPaymentMethods.length > 0) {
        if (this.enteredAmount > this.remainingToRegister) {
          const lastPayment = this.currentPaymentMethods[this.currentPaymentMethods.length - 1];
          if (lastPayment) {
            lastPayment.amount = Math.max(0, lastPayment.amount - (this.enteredAmount - this.remainingToRegister));
          }
        }
      }
    }
  },
  methods: {
    formatPrice(value) {
      return numeral(value).format("$0.00");
    },
    addPaymentMethod() {
      this.currentPaymentMethods.push({ method: "", amount: 0 });
    },
    removePaymentMethod(index) {
      this.currentPaymentMethods.splice(index, 1);
      if (this.currentPaymentMethods.length === 0) {
        this.addPaymentMethod(); // Asegurar que siempre haya al menos un campo
      }
    },
    removeRegisteredPayment(index) {
      const removedPayment = this.registeredPayments[index];

      // Confirmar eliminación
      if (confirm(`¿Está seguro de eliminar el pago de ${removedPayment.method} por ${this.formatPrice(removedPayment.amount)}?`)) {
        this.registeredPayments.splice(index, 1);

        // Emitir evento para notificar al componente padre
        this.$emit("payment-removed", {
          payment: removedPayment,
          index: index,
          remainingPayments: [...this.registeredPayments]
        });
      }
    },
    registerPurchase() {
      // Filtrar métodos vacíos o con monto 0
      const validPaymentMethods = this.currentPaymentMethods.filter(
        (p) => p.method && p.amount > 0
      );

      // Si no hay pagos registrados ni métodos válidos actuales
      if (this.registeredPayments.length === 0 && validPaymentMethods.length === 0) {
        alert("Debe ingresar al menos un método de pago válido.");
        return;
      }

      // Si hay métodos válidos pero el monto no es exacto
      if (validPaymentMethods.length > 0 && this.remainingAmount !== 0) {
        alert("El monto ingresado no coincide con el total restante.");
        return;
      }

      // Combinar pagos registrados con nuevos pagos válidos
      const allPayments = [
        ...this.registeredPayments,
        ...validPaymentMethods
      ];

      this.$emit("purchase-registered", {
        total: this.venta,
        paymentMethods: allPayments,
        newPayments: validPaymentMethods, // Solo los nuevos pagos agregados
        allPayments: allPayments // Todos los pagos (registrados + nuevos)
      });

      this.cancel(); // Cerrar el modal después de registrar
    },
    cancel() {
      this.$emit("close");
    },
  },
  mounted() {
    // Si no hay métodos iniciales, añadir uno por defecto al montar
    if (this.currentPaymentMethods.length === 0) {
      this.addPaymentMethod();
    }
  }
};
</script>

<style scoped>
/* Reutilizando estilos del modal principal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  /* Increased to be above mobile checkout step (2000) */
  padding: 1rem;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 600px;
  /* Incrementado para acomodar más contenido */
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  background-color: transparent;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1.25rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #f3f4f6;
}

/* Estilos de secciones */
.registered-payments-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.current-payments-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

/* Estilos para pagos registrados */
.registered-payments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.registered-payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s ease;
}

.registered-payment-item:hover {
  background-color: #f1f5f9;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-method {
  font-weight: 500;
  color: #374151;
}

.payment-amount {
  font-weight: 600;
  color: #059669;
  font-size: 1.05rem;
}

.registered-total {
  text-align: right;
  color: #059669;
  font-size: 1.1rem;
  padding: 0.5rem 0;
  border-top: 1px solid #e5e7eb;
}

/* Estilos de formulario y botones */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8851b;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-icon {
  background-color: transparent;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-delete {
  color: #ef4444;
}

.btn-icon:hover:not(:disabled) {
  background-color: #fee2e2;
}

.btn-icon:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* Estilos específicos para métodos de pago actuales */
.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-item-input {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.payment-item-input .form-group {
  margin-bottom: 0;
}

.flex-grow {
  flex-grow: 1;
}

.btn-add-method {
  width: 100%;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.totals-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.95rem;
  color: #4b5563;
}

.total-line p {
  margin: 0;
  font-weight: 500;
}

.total-line span {
  font-weight: 600;
  color: #1f2937;
}

.total-amount {
  font-size: 1.1rem;
  color: #f9931e;
}

.registered-amount {
  color: #059669;
}

.entered-amount {
  color: #3b82f6;
}

.remaining-line {
  border-top: 1px dashed #e5e7eb;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  font-weight: 700;
}

.remaining-amount {
  font-size: 1.1rem;
}

.text-danger {
  color: #ef4444;
}

.text-success {
  color: #059669;
}

.text-warning {
  color: #f59e0b;
}

/* Ocultar labels para screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }

  .payment-item-input {
    flex-direction: column;
    align-items: stretch;
  }

  .payment-item-input .form-group {
    width: 100%;
  }

  .btn-icon {
    align-self: flex-end;
    margin-top: -0.5rem;
  }

  .registered-payment-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .payment-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>