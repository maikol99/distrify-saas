<template>
  <div class="modal-overlay" @click="close">
    <div class="ticket-modal" @click.stop>
      <div class="modal-header">
        <h3>Enviar Ticket al Cliente</h3>
      </div>
      <div class="modal-body">
        <form @submit.prevent="sendTicket">
          <!-- Pregunta inicial -->
          <div class="form-group">
            <label class="question-label">
              ¿Desea enviar este ticket por correo electrónico al cliente?
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  v-model="ticketForm.sendByEmail" 
                  type="radio" 
                  :value="true"
                  :disabled="loading"
                />
                <span class="radio-mark"></span>
                Sí, enviar por email
              </label>
              <label class="radio-label">
                <input 
                  v-model="ticketForm.sendByEmail" 
                  type="radio" 
                  :value="false"
                  :disabled="loading"
                />
                <span class="radio-mark"></span>
                No, solo imprimir
              </label>
            </div>
          </div>

          <!-- Input de email (solo si selecciona enviar) -->
          <div v-if="ticketForm.sendByEmail" class="form-group">
            <label for="clientEmail">Email del Cliente *</label>
            <input
              id="clientEmail"
              v-model="ticketForm.email"
              type="email"
              class="form-control"
              placeholder="cliente@ejemplo.com"
              required
              :disabled="loading"
            />
          </div>

          <!-- Mostrar errores si los hay -->
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn-secondary" :disabled="loading">
          Cancelar
        </button>
        <button @click="sendTicket" class="btn-primary" :disabled="loading || !isFormValid">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Procesando...' : getSubmitButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SendTicketModal",
  props: {
    ticketData: {
      type: Object,
      required: true
    },
    clientEmail: {
      type: String,
      default: ''
    }
  },
  emits: ['ticketSent', 'close'],
  
  data() {
    return {
      loading: false,
      error: null,
      successMessage: null,
      ticketForm: {
        sendByEmail: null,
        email: ''
      }
    };
  },

  computed: {
    isFormValid() {
      if (this.ticketForm.sendByEmail === null) {
        return false;
      }
      if (this.ticketForm.sendByEmail && !this.ticketForm.email) {
        return false;
      }
      return true;
    },

    getSubmitButtonText() {
      if (this.ticketForm.sendByEmail) {
        return 'Enviar por Email';
      }
      return 'Solo Imprimir';
    }
  },

  watch: {
    clientEmail: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.ticketForm.email = newValue;
        }
      }
    },

    'ticketForm.sendByEmail'(newValue) {
      // Limpiar errores cuando cambia la selección
      this.error = null;
      this.successMessage = null;
      
      // Si cambia a false, limpiar el email
      if (newValue === false) {
        this.ticketForm.email = '';
      } else if (newValue === true && this.clientEmail) {
        // Si cambia a true y hay email del cliente, usarlo
        this.ticketForm.email = this.clientEmail;
      }
    }
  },

  methods: {
    async sendTicket() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        // Emitir evento de éxito inmediatamente
        this.$emit('ticketSent', {
          success: true,
          sentByEmail: this.ticketForm.sendByEmail,
          email: this.ticketForm.email
        });

        // Cerrar modal después de un breve delay
        setTimeout(() => {
          this.close();
        }, 500);

      } catch (error) {
        console.error('Error processing ticket:', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      this.error = null;

      // Validar que se haya seleccionado una opción
      if (this.ticketForm.sendByEmail === null) {
        this.error = 'Debe seleccionar si desea enviar el ticket por email';
        return false;
      }

      // Si seleccionó enviar por email, validar email
      if (this.ticketForm.sendByEmail) {
        if (!this.ticketForm.email || !this.ticketForm.email.trim()) {
          this.error = 'El email del cliente es requerido';
          return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.ticketForm.email.trim())) {
          this.error = 'Por favor ingrese un email válido';
          return false;
        }
      }

      return true;
    },

    handleError(error) {
      if (error.response) {
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          this.error = serverMessage;
        } else {
          this.error = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.message) {
        this.error = error.message;
      } else {
        this.error = 'Ha ocurrido un error inesperado';
      }
    },

    close() {
      if (!this.loading) {
        this.$emit('close');
      }
    },

    resetForm() {
      this.ticketForm = {
        sendByEmail: null,
        email: ''
      };
      this.error = null;
      this.successMessage = null;
    }
  },

  mounted() {
    // Inicializar con email del cliente si está disponible
    if (this.clientEmail) {
      this.ticketForm.email = this.clientEmail;
    }
  }
};
</script>

<style scoped>
/* Modal */
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
  z-index: 50;
}

.ticket-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.question-label {
  font-size: 1rem;
  margin-bottom: 1rem !important;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

/* Radio buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal !important;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: #f9fafb;
}

.radio-label input[type="radio"] {
  width: auto;
  margin: 0;
}

.radio-label input[type="radio"]:disabled {
  cursor: not-allowed;
}

.radio-mark {
  font-size: 0.875rem;
  color: #374151;
}

/* Messages */
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  color: #dc2626;
}

.success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-message i {
  color: #059669;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Button styles */
.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8831a;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>