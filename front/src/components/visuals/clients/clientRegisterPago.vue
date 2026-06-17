<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h2>Registrar Pago</h2>
        <button class="modal-close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="submitPayment">
        <div class="form-group">
          <label for="clientSearch">Cliente</label>
          <div class="search-container">
            <input
              type="text"
              id="clientSearch"
              v-model="searchQuery"
              @input="debouncedSearchClients"
              @focus="showResults = !preselectedClientId"
              placeholder="Buscar cliente..."
              class="form-input"
              :disabled="!!preselectedClientId"
              :class="{ 'input-locked': !!preselectedClientId }"
            />
            <ul
              v-if="
                showResults &&
                filteredClients.length > 0 &&
                searchQuery.length > 0
              "
              class="search-results"
            >
              <li
                v-for="client in filteredClients"
                :key="client._id"
                @click="selectClient(client)"
              >
                {{ client.name }}
              </li>
            </ul>
            <div
              v-else-if="
                showResults &&
                searchQuery.length > 0 &&
                filteredClients.length === 0 &&
                !loading
              "
              class="no-results"
            >
              No se encontraron clientes.
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="amount">Monto</label>
          <div class="input-icon">
            <span class="currency-symbol">$</span>
            <input
              type="number"
              id="amount"
              v-model="paymentAmount"
              placeholder="0.00"
              required
              step="0.01"
              class="form-input"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="date">Fecha</label>
          <input
            type="date"
            v-model="paymentDate"
            id="date"
            required
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
            id="description"
            v-model="paymentDescription"
            placeholder="Añade una descripción"
            rows="2"
            class="form-input"
          ></textarea>
        </div>
        <div v-if="saleId" class="sale-link-indicator">
          <span class="material-symbols-outlined">link</span>
          Vinculado a venta <strong>#{{ saleId.slice(-6) }}</strong>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i class="fas fa-check"></i> Registrar
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
            :disabled="loading"
          >
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
  <spinnerComponent v-if="loading" />
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "@/config/axios.config";
import spinnerComponent from "../spinnerComponent.vue"; // Asegúrate de que esta ruta sea correcta
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "PaymentModal",
  components: {
    spinnerComponent,
  },
  props: {
    preselectedClientId: {
      type: String,
      default: "",
    },
    preselectedClientName: {
      type: String,
      default: "",
    },
    preselectedSaleId: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      paymentAmount: null,
      paymentDate: new Date().toISOString().slice(0, 10), // Fecha actual por defecto
      paymentDescription: "",
      clientId: this.preselectedClientId || "",
      clientName: this.preselectedClientName || "",
      saleId: this.preselectedSaleId || "",
      searchQuery: this.preselectedClientName || "",
      filteredClients: [],
      showResults: false,
      loading: false,
      debounceTimeout: null,
      globalStore: useGlobalStore(),
    };
  },
  methods: {
    debouncedSearchClients() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.searchClients();
      }, 300); // 300ms de debounce
    },
    async searchClients() {
      if (this.searchQuery.length < 2) {
        // Mínimo 2 caracteres para buscar
        this.filteredClients = [];
        this.showResults = false;
        return;
      }
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&query=${this.searchQuery}`
        );
        if (response.data.success) {
          this.filteredClients = response.data.data;
          this.showResults = true;
        } else {
          console.error("Error al buscar clientes:", response.data.message);
          this.filteredClients = [];
          this.showResults = true; // Mostrar que no hay resultados
        }
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        this.filteredClients = [];
        this.showResults = true; // Mostrar que no hay resultados
      } finally {
        this.loading = false;
      }
    },
    selectClient(client) {
      this.clientId = client._id;
      this.clientName = client.name;
      this.searchQuery = client.name;
      this.showResults = false;
    },
    closeModal() {
      this.$emit("close");
      this.resetForm();
    },
    async submitPayment() {
      if (!this.clientId) {
        alert("Por favor, seleccione un cliente de la lista.");
        return;
      }
      if (!this.paymentAmount || this.paymentAmount <= 0) {
        alert("El monto del pago debe ser mayor a 0.");
        return;
      }
      if (!this.paymentDate) {
        alert("La fecha es obligatoria.");
        return;
      }
   

      this.loading = true;
      try {
        const payload = {
          clientId: this.clientId,
          amount: parseFloat(this.paymentAmount),
          date: this.paymentDate,
          description: this.paymentDescription.trim(),
        };
        if (this.saleId) payload.saleId = this.saleId;

        const response = await api.post(
          `/client-payments/post/create-payment`,
          payload
        );
        if (response.data.success) {
          alert("Pago registrado con éxito!");
          this.$emit("submit");
          this.closeModal();
        } else {
          console.error("Error al registrar el pago:", response.data.message);
          alert( response.data.message);
        }
      } catch (error) {
        console.error("Error al registrar el pago:", error);
        alert("Error al registrar el pago. Por favor, intente nuevamente.");
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.paymentAmount = null;
      this.paymentDate = new Date().toISOString().slice(0, 10);
      this.paymentDescription = "";
      this.clientId = "";
      this.clientName = "";
      this.saleId = "";
      this.searchQuery = "";
      this.filteredClients = [];
      this.showResults = false;
      clearTimeout(this.debounceTimeout);
    },
  },
  mounted() {
    // No es necesario llamar getClients al montar, la búsqueda se hará on-demand
    // document.body.style.overflow = "hidden"; // Controlar el scroll del body si el modal es de pantalla completa
  },
  beforeUnmount() {
    // document.body.style.overflow = "auto"; // Restaurar el scroll del body
    clearTimeout(this.debounceTimeout);
  },
};
</script>

<style scoped>
/* Overlay del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* Fondo oscuro semi-transparente */
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

/* Contenedor principal del modal */
.modal {
  background-color: #f9fafb; /* Color de fondo claro */
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
  animation: fadeInScale 0.3s ease-out;
  position: relative; /* Para el botón de cerrar */
}

@keyframes fadeInScale {
  from {
    transform: scale(0.95) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  color: #f9931e; /* Color principal */
  font-size: 1.6rem;
  margin: 0;
  font-weight: 700;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
  padding: 5px;
  line-height: 1;
}

.modal-close-button:hover {
  color: #1f2937;
}

/* Grupos de formulario */
.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #4b5563; /* Color de etiquetas */
  font-weight: 600;
  font-size: 0.9rem;
}

/* Estilos de input general */
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f9931e; /* Color principal para el foco */
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.2); /* Sombra de foco */
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

/* Input con icono (para monto) */
.input-icon {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: bold;
  font-size: 1rem;
}

input[type="number"].form-input {
  padding-left: 30px; /* Espacio para el símbolo de moneda */
}

/* Contenedor de búsqueda y resultados */
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%; /* Debajo del input */
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  list-style-type: none;
  padding: 0;
  margin-top: 5px; /* Pequeño espacio entre input y resultados */
  max-height: 200px;
  overflow-y: auto;
  z-index: 1001; /* Asegura que esté por encima de otros elementos */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.search-results li {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #1f2937;
  font-size: 0.95rem;
}

.search-results li:hover {
  background-color: #f3f4f6; /* Color de hover suave */
  color: #f9931e; /* Resaltar texto en hover */
}

.no-results {
  padding: 10px 15px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  background-color: #f3f4f6;
  border-radius: 8px;
  margin-top: 5px;
}

/* Acciones del modal (botones) */
.modal-actions {
  display: flex;
  justify-content: flex-end; /* Alinear a la derecha */
  gap: 12px;
  margin-top: 25px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Espacio entre icono y texto */
}

.btn-primary {
  background-color: #f9931e; /* Color principal */
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e0801c; /* Tono más oscuro al hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(249, 147, 30, 0.2);
}

.btn-secondary {
  background-color: #e5e7eb; /* Gris claro */
  color: #4b5563; /* Texto gris oscuro */
}

.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db; /* Tono más oscuro al hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-locked {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.sale-link-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.sale-link-indicator .material-symbols-outlined {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 600px) {
  .modal {
    padding: 20px;
    border-radius: 0; /* Ocupa todo el ancho en pantallas pequeñas */
    max-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .modal-header h2 {
    font-size: 1.4rem;
  }
  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  .btn {
    width: 100%;
  }
}
</style>
