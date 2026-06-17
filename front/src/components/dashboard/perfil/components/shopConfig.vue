<template>
  <div class="business-container">
    <div class="business-header">
      <div class="business-logo-container">
        <div
          class="business-logo business-logo-placeholder"
          :style="{
            backgroundImage: shopStore.shopData.shopImage?.secure_url
              ? `url(${shopStore.shopData.shopImage.secure_url})`
              : 'none',
            backgroundColor: shopStore.shopData.shopImage?.secure_url
              ? 'transparent'
              : '#6b7280',
          }"
        >
          <span
            v-if="!shopStore.shopData.shopImage?.secure_url"
            class="logo-initials"
          >
            {{ businessInitials }}
          </span>
        </div>
      </div>
      <div class="business-info">
        <h2 class="business-name">
          {{ shopStore.shopData.name || "Nombre del negocio" }}
        </h2>

        <span class="business-category" :class="categoryClass">
          {{ shopStore.shopData.category }}
        </span>

        <span class="business-plan">
          Plan: 
          {{ getPlanName(shopStore.shopData.plan) }}
        </span>
      </div>
    </div>

    <div class="content-grid">
      <div class="data-table-container">
        <div class="table-header">
          <h2>Información Básica</h2>
          <button class="btn-icon btn-edit" @click="handleEdit">
            <i class="fas fa-edit"></i>
          </button>
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="fas fa-store"></i>
            <div class="info-text">
              <span class="info-label">Nombre del Negocio</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.name || "No especificado"
              }}</span>
              <input
                class="form-input"
                v-else
                type="text"
                v-model="shopStore.shopData.name"
              />
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <div class="info-text">
              <span class="info-label">Email</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.email || "No especificado"
              }}</span>
              <input
                class="form-input"
                v-else
                type="text"
                v-model="shopStore.shopData.email"
              />
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-phone"></i>
            <div class="info-text">
              <span class="info-label">Teléfono</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.phone || "No especificado"
              }}</span>
              <input
                class="form-input"
                v-else
                type="text"
                v-model="shopStore.shopData.phone"
              />
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-align-left"></i>
            <div class="info-text">
              <span class="info-label">Descripción</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.description || "Sin descripción"
              }}</span>
              <textarea
                class="form-input"
                v-else
                columns="30"
                rows="5"
                v-model="shopStore.shopData.description"
              ></textarea>
            </div>
          </div>
          <button class="btn btn-cancel" v-if="editing" @click="handleEdit">
            Cancelar
          </button>
          <button class="btn btn-primary" v-if="editing" @click="handleUpdate">
            Actualizar
          </button>
        </div>
      </div>

      <div class="data-table-container">
        <div class="table-header">
          <h2>Ubicación</h2>
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div class="info-text">
              <span class="info-label">Dirección</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.address || "No especificada"
              }}</span>
              <input
                class="form-input"
                v-else
                type="text"
                v-model="shopStore.shopData.address"
              />
            </div>
          </div>
          
          <!-- Provincia con búsqueda -->
          <div class="info-item">
            <i class="fas fa-map"></i>
            <div class="info-text">
              <span class="info-label">Provincia</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.province || "No especificada"
              }}</span>
              <div v-else class="search-container">
                <input
                  class="form-input search-input"
                  type="text"
                  v-model="provinceSearch"
                  @input="searchProvinces"
                  @focus="showProvinceDropdown = true"
                  placeholder="Buscar provincia..."
                />
                <div 
                  v-if="showProvinceDropdown && provinceResults.length > 0" 
                  class="search-dropdown"
                >
                  <div
                    v-for="province in provinceResults"
                    :key="province.id"
                    class="search-item"
                    @click="selectProvince(province)"
                  >
                    {{ province.nombre }}
                  </div>
                </div>
                <div
                  v-if="showProvinceDropdown && provinceSearch && provinceResults.length === 0 && !loadingProvinces"
                  class="search-no-results"
                >
                  No se encontraron provincias
                </div>
              </div>
            </div>
          </div>

          <!-- Ciudad con búsqueda -->
          <div class="info-item">
            <i class="fas fa-city"></i>
            <div class="info-text">
              <span class="info-label">Ciudad</span>
              <span v-if="!editing" class="info-value">{{
                shopStore.shopData.city || "No especificada"
              }}</span>
              <div v-else class="search-container">
                <input
                  class="form-input search-input"
                  type="text"
                  v-model="citySearch"
                  @input="searchCities"
                  @focus="showCityDropdown = true"
                  placeholder="Buscar ciudad o municipio..."
                  :disabled="!selectedProvince"
                />
                <div 
                  v-if="showCityDropdown && cityResults.length > 0" 
                  class="search-dropdown"
                >
                  <div
                    v-for="city in cityResults"
                    :key="city.id"
                    class="search-item"
                    @click="selectCity(city)"
                  >
                    {{ city.nombre }}
                  </div>
                </div>
                <div
                  v-if="showCityDropdown && citySearch && cityResults.length === 0 && !loadingCities && selectedProvince"
                  class="search-no-results"
                >
                  No se encontraron ciudades
                </div>
                <div
                  v-if="!selectedProvince && editing"
                  class="search-no-results"
                >
                  Primero selecciona una provincia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <SpinnerComponent v-if="shopStore.loading"></SpinnerComponent>
  <toastComponent
    v-if="shopStore.toastInfo.showing"
    :message="shopStore.toastInfo.message"
    :state="shopStore.toastInfo.state"
  ></toastComponent>
</template>

<script>
import moment from "moment";
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import { useShopStore } from "@/stores/shopStore";

export default {
  name: "BusinessInfoConfig",

  components: {
    SpinnerComponent,
    toastComponent,
  },

  data() {
    return {
      shopStore: useShopStore(),
      loading: false,
      editing: false,
      
      // Búsqueda de provincias
      provinceSearch: '',
      provinceResults: [],
      showProvinceDropdown: false,
      selectedProvince: null,
      loadingProvinces: false,
      
      // Búsqueda de ciudades
      citySearch: '',
      cityResults: [],
      showCityDropdown: false,
      selectedCity: null,
      loadingCities: false,
      
      // Timeout para debounce
      searchTimeout: null,
    };
  },

  computed: {
    businessInitials() {
      if (!this.shopStore.shopData.name) return "TN";
      return this.shopStore.shopData.name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    categoryClass() {
      return "category-badge";
    },
  },

  methods: {
    getPlanName(plan) {
      switch (plan) {
        case "FREE":
          return "Gratuito";
        case "BASIC":
          return "Básico";
        case "MEDIUM":
          return "Intermedio";
        case "PREMIUM":
          return "Premium";
        default:
          break;
      }
    },
    
    formatDate(fecha) {
      if (!fecha) return "No disponible";
      return moment(fecha).format("DD/MM/YYYY");
    },
    
    handleEdit() {
      this.editing = !this.editing;
      if (this.editing) {
        // Inicializar búsquedas con valores actuales
        this.provinceSearch = this.shopStore.shopData.province || '';
        this.citySearch = this.shopStore.shopData.city || '';
        
        // Si ya tiene provincia, buscarla para poder habilitar búsqueda de ciudades
        if (this.shopStore.shopData.province) {
          this.findProvinceByName(this.shopStore.shopData.province);
        }
      } else {
        // Limpiar búsquedas al cancelar
        this.resetSearch();
      }
    },
    
    async handleUpdate() {
      await this.shopStore.updateShop();
      this.editing = false;
      this.resetSearch();
    },

    // Búsqueda de provincias
    searchProvinces() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        if (this.provinceSearch.length < 2) {
          this.provinceResults = [];
          return;
        }

        this.loadingProvinces = true;
        try {
          const response = await fetch(`https://apis.datos.gob.ar/georef/api/provincias?nombre=${encodeURIComponent(this.provinceSearch)}&max=10`);
          const data = await response.json();
          this.provinceResults = data.provincias || [];
        } catch (error) {
          console.error('Error buscando provincias:', error);
          this.provinceResults = [];
        }
        this.loadingProvinces = false;
      }, 300);
    },

    selectProvince(province) {
      this.selectedProvince = province;
      this.provinceSearch = province.nombre;
      this.shopStore.shopData.province = province.nombre;
      this.showProvinceDropdown = false;
      
      // Limpiar ciudad al cambiar provincia
      this.citySearch = '';
      this.shopStore.shopData.city = '';
      this.selectedCity = null;
      this.cityResults = [];
    },

    // Búsqueda de ciudades
    searchCities() {
      if (!this.selectedProvince) return;
      
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        if (this.citySearch.length < 2) {
          this.cityResults = [];
          return;
        }

        this.loadingCities = true;
        try {
          const response = await fetch(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(this.selectedProvince.nombre)}&nombre=${encodeURIComponent(this.citySearch)}&max=10`);
          const data = await response.json();
          this.cityResults = data.municipios || [];
        } catch (error) {
          console.error('Error buscando ciudades:', error);
          this.cityResults = [];
        }
        this.loadingCities = false;
      }, 300);
    },

    selectCity(city) {
      this.selectedCity = city;
      this.citySearch = city.nombre;
      this.shopStore.shopData.city = city.nombre;
      this.showCityDropdown = false;
    },

    // Buscar provincia por nombre (para inicializar cuando ya hay una seleccionada)
    async findProvinceByName(provinceName) {
      try {
        const response = await fetch(`https://apis.datos.gob.ar/georef/api/provincias?nombre=${encodeURIComponent(provinceName)}&exacto=true`);
        const data = await response.json();
        if (data.provincias && data.provincias.length > 0) {
          this.selectedProvince = data.provincias[0];
        }
      } catch (error) {
        console.error('Error buscando provincia actual:', error);
      }
    },

    resetSearch() {
      this.provinceSearch = '';
      this.citySearch = '';
      this.provinceResults = [];
      this.cityResults = [];
      this.showProvinceDropdown = false;
      this.showCityDropdown = false;
      this.selectedProvince = null;
      this.selectedCity = null;
    },
  },

  async mounted() {
    await this.shopStore.getShopData();
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.showProvinceDropdown = false;
        this.showCityDropdown = false;
      }
    });
  },

  beforeUnmount() {
    // Limpiar timeout si existe
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
/* ===== Modern shopConfig styles ===== */
.business-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
}

/* Hero header */
.business-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 60%);
  border-radius: 1rem;
  border: 1px solid #bfdbfe;
  margin-bottom: 1.5rem;
}

.business-logo-container { position: relative; }
.business-logo {
  width: 88px; height: 88px;
  border-radius: 50%;
  background-size: cover; background-position: center;
  border: 3px solid white;
  box-shadow: 0 0 0 3px #bfdbfe, 0 4px 12px rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
}
.logo-initials { font-size: 2rem; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }

.business-info { display: flex; flex-direction: column; gap: 0.4rem; }
.business-name { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }

.business-category {
  display: inline-flex; align-items: center;
  padding: 0.3rem 0.75rem; border-radius: 999px;
  font-size: 0.72rem; font-weight: 600;
  background: #e0f2fe; color: #0369a1; width: fit-content;
}

.business-plan {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem; border-radius: 999px;
  font-size: 0.72rem; font-weight: 600;
  background: #fef3c7; color: #92400e; width: fit-content;
}

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.data-table-container {
  background: white; border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden; margin-bottom: 0;
}

.table-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6;
}
.table-header h2 { font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }

.info-content { padding: 0.25rem 0; }

.info-item {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 0.875rem 1.25rem; border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
}
.info-item:last-child { border-bottom: none; }
.info-item:hover { background: #fafafa; }

.info-item i {
  width: 34px; height: 34px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  background: #f9fafb; color: #3b82f6; font-size: 0.9rem; flex-shrink: 0; margin-top: 2px;
}

.info-text { display: flex; flex-direction: column; width: 100%; }
.info-label { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
.info-value { font-size: 0.9rem; font-weight: 500; color: #111827; }

/* Form inputs in edit mode */
.form-input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 0.5rem;
  background: white; color: #111827; width: 100%;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
.form-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

/* Search */
.search-container { position: relative; width: 100%; }
.search-dropdown {
  position: absolute; top: 100%; left: 0; right: 0;
  background: white; border: 1px solid #e5e7eb; border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 200px; overflow-y: auto; z-index: 1000;
}
.search-item {
  padding: 0.7rem 0.875rem; cursor: pointer;
  border-bottom: 1px solid #f3f4f6; font-size: 0.875rem;
  transition: background 0.15s;
}
.search-item:hover { background: #f9fafb; }
.search-item:last-child { border-bottom: none; }
.search-no-results { padding: 0.75rem; color: #9ca3af; font-size: 0.85rem; text-align: center; font-style: italic; }

/* Buttons */
.btn-icon {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 0.5rem;
  background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb;
  cursor: pointer; transition: all 0.15s;
}
.btn-icon:hover { background: #f3f4f6; }
.btn-edit { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.btn-edit:hover { background: #fde68a; }

.btn {
  padding: 0.55rem 1.25rem; border: none; border-radius: 0.5rem;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; margin-top: 0.5rem;
}
.btn-primary { background: #f9931e; color: white; }
.btn-primary:hover { background: #e8821a; }
.btn-cancel { background: #fee2e2; color: #dc2626; margin-right: 0.5rem; }
.btn-cancel:hover { background: #fecaca; }

@media (max-width: 768px) {
  .business-header { flex-direction: column; text-align: center; padding: 1.5rem; }
  .business-category, .business-plan { margin: 0 auto; }
  .content-grid { grid-template-columns: 1fr; }
  .logo-initials { font-size: 1.5rem; }
}
</style>
