<template>
  <div class="fixed inset-0 bg-black/50 flex flex-col items-center justify-end md:justify-center z-[100] md:p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white w-full h-auto max-h-[95vh] md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 text-orange-600 md:rounded-t-3xl">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <i class="fas fa-tag"></i>
          Crear Categoría
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- BODY -->
      <div class="p-5 flex-1 overflow-y-auto">
        <p class="text-sm text-gray-500 mb-4">Completa la información para agregar una nueva categoría al sistema.</p>
        
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label for="name" class="text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría *</label>
            <input
              id="name"
              v-model="category.name"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
              :class="{ 'border-red-500 bg-red-50': errors.name }"
              placeholder="Ej. Bebidas, Lácteos..."
              required
            />
            <span v-if="errors.name" class="text-xs text-red-500 mt-1 font-medium">{{ errors.name }}</span>
          </div>

          <div class="flex flex-col">
            <label for="description" class="text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="description"
              v-model="category.description"
              rows="4"
              class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow resize-none"
              placeholder="Descripción opcional de la categoría"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 md:rounded-b-3xl mt-auto">
        <button type="button" @click="resetForm" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 w-full md:w-auto text-center" :disabled="loading">
          Cancelar
        </button>
        <button @click="createCategory" type="button" class="py-3 md:py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 flex items-center justify-center w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading">
          <span v-if="loading" class="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
          <i v-else class="fas fa-save mr-2"></i>
          {{ loading ? "Guardando..." : "Crear Categoría" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de éxito -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex flex-col justify-end md:justify-center items-center z-[110] md:p-4 backdrop-blur-sm" @click="closeSuccessModal">
    <div class="bg-white w-full md:w-[400px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
      <div class="flex justify-between items-center p-5 border-b border-green-100 bg-green-50 md:rounded-t-3xl text-green-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">check_circle</span>
          ¡Categoría Creada!
        </h2>
      </div>
      <div class="p-6 text-center">
        <p class="text-gray-700 font-medium pb-2 text-lg">La categoría <strong>"{{ category.name }}"</strong> ha sido creada exitosamente.</p>
      </div>
      <div class="p-5 border-t border-gray-100 flex justify-center bg-gray-50 md:rounded-b-3xl">
        <button @click="closeSuccessModal" class="py-3 px-6 w-full bg-green-500 text-white rounded-xl font-bold shadow hover:bg-green-600 transition">
          Aceptar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de error -->
  <div v-if="showErrorModal" class="fixed inset-0 bg-black/50 flex flex-col justify-end md:justify-center items-center z-[110] md:p-4 backdrop-blur-sm" @click="closeErrorModal">
    <div class="bg-white w-full md:w-[400px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
      <div class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 md:rounded-t-3xl text-red-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">error</span>
          Error al Crear Categoría
        </h2>
      </div>
      <div class="p-6 text-center">
        <p class="text-gray-700 font-medium pb-2 text-lg">{{ errorMessage }}</p>
      </div>
      <div class="p-5 border-t border-gray-100 flex justify-center bg-gray-50 md:rounded-b-3xl">
        <button @click="closeErrorModal" class="py-3 px-6 w-full bg-red-500 text-white rounded-xl font-bold shadow hover:bg-red-600 transition">
          Aceptar
        </button>
      </div>
    </div>
  </div>

  <spinner-component v-if="loadingSpinner" />
</template>

<script>
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "CategoryCreator",
  components: {},
  data() {
    return {
      globalStore: useGlobalStore(),
      loadingSpinner: false,
      loading: false,
      showSuccessModal: false,
      showErrorModal: false,
      errorMessage: "",
      errors: {},
      category: {
        name: "",
        description: "",
      },
    };
  },

  methods: {
    validateForm() {
      this.errors = {};

      if (!this.category.name.trim()) {
        this.errors.name = "El nombre de la categoría es requerido";
      } else if (this.category.name.trim().length < 2) {
        this.errors.name = "El nombre debe tener al menos 2 caracteres";
      } else if (this.category.name.trim().length > 100) {
        this.errors.name = "El nombre no puede tener más de 100 caracteres";
      }

      return Object.keys(this.errors).length === 0;
    },

    async createCategory() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      try {
        const shopId = this.globalStore.shopId();
        const response = await api.post("/categories/post/create-category", {
          name: this.category.name.trim(),
          description: this.category.description.trim() || null,
          shopId: shopId,
        });

        const data = response.data;

        if (data.success) {
          this.showSuccessModal = true;
        } else {
          this.errorMessage =
            data.message || "Error desconocido al crear la categoría";
          this.showErrorModal = true;
        }
      } catch (error) {
        console.error("Error al crear categoría:", error);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.errorMessage = error.response.data.message;
        } else if (error.response && error.response.status === 400) {
          this.errorMessage =
            "Datos inválidos. Verifica la información ingresada.";
        } else if (error.response && error.response.status === 409) {
          this.errorMessage = "Ya existe una categoría con ese nombre.";
        } else {
          this.errorMessage = "Error de conexión. Intenta nuevamente.";
        }

        this.showErrorModal = true;
      } finally {
        this.loading = false;
      }
    },
    

    resetForm() {
      this.category = {
        name: "",
        description: "",
        shopId: this.category.shopId, // Mantener el shopId si es estático o resetearlo si es dinámico
      };
      this.errors = {};
      this.$emit("close");
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.resetForm();
      this.$emit("success");

      // Opcional: redirigir a la lista de categorías
      // this.$router.push('/categories');
    },

    closeErrorModal() {
      this.showErrorModal = false;
    },
  },
};
</script>

<style scoped>
/* Nuevo estilo para el overlay del formulario principal */
.main-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Fondo semitransparente */
  display: flex;
  align-items: center; /* Centrar verticalmente */
  justify-content: center; /* Centrar horizontalmente */
  z-index: 40; /* Asegura que esté sobre el contenido de la página, pero debajo de los modales de éxito/error */
  padding: 1rem; /* Espaciado para pantallas pequeñas */
  overflow-y: auto; /* Permite el scroll si el contenido es muy largo */
}

.category-creator-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  /* margin: 0 auto; -- Eliminado, el centrado lo hace el padre */
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  max-width: 800px;
  width: 100%; /* Asegura que ocupe el ancho disponible hasta max-width */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Sombra para destacarlo */
  position: relative; /* Necesario para que el z-index funcione correctamente si hay elementos posicionados dentro */
  z-index: 41; /* Ligeramente superior al overlay para asegurar que el contenido del formulario esté visible */
  max-height: 95vh; /* Limita la altura para que no se desborde en pantallas pequeñas */
  overflow-y: auto; /* Permite el scroll dentro del formulario si es necesario */
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #f9931e;
  margin-bottom: 0.5rem;
}

.page-header .subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.category-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #f9931e;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.form-control.error {
  border-color: #ef4444;
}

.form-control.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Botones */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8851b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Modales existentes (mantienen su z-index más alto) */
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
  z-index: 50; /* Asegura que estos modales estén siempre encima de todo, incluyendo el formulario principal */
}

.success-modal,
.error-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .category-creator-container {
    padding: 1rem;
    max-width: 100%;
  }

  .category-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }
}
</style>
