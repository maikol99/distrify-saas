<template>
  <div class="tienda-container">
    <!-- Header del Negocio -->
    <header v-if="ecommerceStore.shopData" class="negocio-header">
      <div class="negocio-info">
        <div class="negocio-logo">
          <img
            v-if="ecommerceStore.shopData.shopImage?.secure_url"
            :src="ecommerceStore.shopData.shopImage.secure_url"
            :alt="ecommerceStore.shopData.name"
          />
          <div v-else class="negocio-logo-placeholder">
            <i class="fas fa-store"></i>
          </div>
        </div>
        <div class="negocio-detalles">
          <h1 class="negocio-nombre">{{ ecommerceStore.shopData.name }}</h1>
          <p class="negocio-descripcion">
            {{ ecommerceStore.shopData.description || "Tu tienda, tu gestión, tu éxito" }}
          </p>
          <div class="negocio-contacto">
            <div class="contacto-item">
              <i class="fas fa-phone"></i>
              <span>{{ ecommerceStore.shopData.phone || "+54 353 456 3453 45" }}</span>
            </div>
            <div class="contacto-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ ecommerceStore.shopData.address || "Argentina" }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="catalog-metrics">
        <div class="catalog-metric">
          <span class="material-symbols-outlined">inventory_2</span>
          <div><small>Productos totales</small><strong>{{ ecommerceStore.pagination?.total ?? 0 }}</strong></div>
        </div>
        <div class="catalog-metric">
          <span class="material-symbols-outlined">payments</span>
          <div><small>Valor del inventario</small><strong>{{ formatPrice(inventoryValue) }}</strong></div>
        </div>
        <div class="catalog-metric">
          <span class="material-symbols-outlined">trending_up</span>
          <div><small>Margen promedio</small><strong>{{ averageMargin }}%</strong></div>
        </div>
      </div>
      <!-- Icono de Carrito -->
      <div class="carrito-icono" @click="goToCarrito">
        <i class="fas fa-shopping-cart"></i>
        <span class="carrito-badge">{{ ecommerceStore.carrito.length }}</span>
      </div>
    </header>

    <div class="catalog-actions">
      <div class="search-container">
        <i class="fas fa-search search-bar-icon"></i>
        <input
          type="text"
          v-model="ecommerceStore.filtros.searchQuery"
          @keydown.enter="ecommerceStore.filterProducts()"
          class="buscador-input"
          placeholder="Buscar productos..."
          @input="ecommerceStore.checkInput()"
        />
        <button class="btn-buscar" @click="ecommerceStore.filterProducts()"><i class="fas fa-search"></i></button>
      </div>
      <button @click="toggleFiltros" class="catalog-action-button"><i class="fas fa-filter"></i> Filtros <span class="filter-count" v-if="ecommerceStore.filtersApplied">1</span></button>
      <button @click="limpiarFiltrosYMostrarTodos" class="catalog-action-button"><i class="fas fa-rotate-right"></i> Limpiar</button>
      <div class="productos-contador"><i class="fas fa-box text-primary"></i><span>{{ ecommerceStore.pagination?.total ?? 0 }} productos encontrados</span></div>
    </div>

    <div class="contenido-principal">
      <!-- Filtros Laterales -->
      <aside
        class="filtros-sidebar"
        :class="{ 'filtros-activos': mostrarFiltros }"
      >
        <div class="filtros-header">
          <h3><i class="fas fa-filter text-primary"></i> Filtros</h3>
          <button @click="limpiarFiltrosYMostrarTodos" class="btn-limpiar-top">
            <i class="fas fa-sync-alt"></i> Limpiar
          </button>
          <button @click="toggleFiltros" class="btn-cerrar-filtros">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Filtro por Categoría -->
        <div class="filtro-grupo">
          <div class="filtro-grupo-header">
            <h4>Categoría</h4>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="filtro-opciones">
            <div
              class="filtro-opcion"
              @click="ecommerceStore.filtros.categoryId = ''; ecommerceStore.filterProducts()"
            >
              <span class="checkmark" :class="{ selected: ecommerceStore.filtros.categoryId === '' }"></span>
              <span>Todas las categorías</span>
            </div>
            <div
              v-for="categoria in ecommerceStore.categories"
              :key="categoria._id"
              class="filtro-opcion"
              @click="ecommerceStore.filtros.categoryId = categoria._id; ecommerceStore.filterProducts()"
            >
              <span class="checkmark" :class="{ selected: ecommerceStore.filtros.categoryId === categoria._id }"></span>
              <span>{{ categoria.name }}</span>
            </div>
          </div>
        </div>

        <!-- Filtro por Precio -->
        <div class="filtro-grupo">
          <div class="filtro-grupo-header">
            <h4>Rango de Precio</h4>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="precio-inputs">
            <div class="input-group">
              <label>Mínimo</label>
              <div class="precio-input-wrapper">
                <span class="precio-prefix">$</span>
                <input
                  type="number"
                  v-model="ecommerceStore.filtros.minAmount"
                  placeholder="0"
                  class="precio-input"
                />
              </div>
            </div>
            <div class="input-group">
              <label>Máximo</label>
              <div class="precio-input-wrapper">
                <span class="precio-prefix">$</span>
                <input
                  type="number"
                  v-model="ecommerceStore.filtros.maxAmount"
                  placeholder="0"
                  class="precio-input"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          class="btn-aplicar-filtros"
          @click="ecommerceStore.filterProducts()"
        >
          <i class="fas fa-filter"></i>
          Aplicar filtros
        </button>
      </aside>

      <!-- Contenido de Productos -->
      <main class="productos-contenido">
        <div class="productos-toolbar">
          <button @click="toggleFiltros" class="btn-filtros-mobile"><i class="fas fa-filter"></i> Filtros</button>
          <div class="catalog-view-controls">
            <select v-model="sortOrder" class="catalog-sort"><option value="recent">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A-Z</option></select>
            <button class="view-button" :class="{ active: catalogView === 'grid' }" @click="catalogView = 'grid'"><i class="fas fa-th"></i></button>
            <button class="view-button" :class="{ active: catalogView === 'list' }" @click="catalogView = 'list'"><i class="fas fa-list"></i></button>
          </div>
        </div>

        <!-- Grid de Productos -->
        <div class="productos-grid">
          <div
            v-for="producto in catalogProducts"
            :key="producto._id || producto.id"
            class="producto-card"
            :class="{ 'is-fav': isFavorite(producto._id) }"
            @click="verDetalle(producto)"
          >
            <div class="producto-imagen">
              <!-- Left Heart Button -->
              <button class="btn-favorite-left" @click.stop="toggleFavorite(producto._id)">
                <i class="far fa-heart"></i>
              </button>

              <!-- Right Active Heart Circle Badge -->
              <button v-if="isFavorite(producto._id)" class="btn-favorite-active-right" @click.stop="toggleFavorite(producto._id)">
                <i class="fas fa-heart text-primary"></i>
              </button>

              <img
                v-if="producto.images && producto.images.length > 0"
                :src="producto.images[0].secure_url"
                :alt="producto.name"
              />
              <div v-if="producto.quantity === 0" class="producto-agotado">
                <i class="fas fa-exclamation-triangle"></i>
                Agotado
              </div>
              <div class="producto-overlay"></div>
            </div>
            <div class="producto-info">
              <h3 class="producto-nombre">{{ producto.name }}</h3>
              <div class="producto-precio">
                {{ formatPrice(producto.sellPrice) }}
              </div>
              <div
                class="producto-stock"
                :class="{ 'sin-stock': producto.quantity === 0 }"
              >
                <i
                  :class="
                    producto.quantity > 0
                      ? 'fas fa-check-circle'
                      : 'fas fa-times-circle'
                  "
                ></i>
                {{ producto.quantity > 0 ? `Stock disponible` : "Sin stock" }}
              </div>
              <button class="btn-ver-detalle">
                <i class="fas fa-eye"></i>
                Ver detalle
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay productos -->
        <div
          v-if="ecommerceStore.products.length === 0 && !ecommerceStore.loading"
          class="sin-productos"
        >
          <div class="sin-productos-icono">
            <i class="fas fa-search" v-if="ecommerceStore.filtersApplied"></i>
            <i class="fas fa-box-open" v-else></i>
          </div>

          <div class="sin-productos-contenido">
            <h3 v-if="ecommerceStore.filtersApplied">
              No se encontraron productos con los filtros aplicados
            </h3>
            <h3 v-else>No hay productos disponibles</h3>

            <p v-if="!ecommerceStore.filtersApplied">
              Este negocio aún no ha agregado productos a su catálogo
            </p>

            <div
              v-if="ecommerceStore.filtersApplied"
              class="filtros-activos-resumen"
            >
              <h4>Filtros aplicados:</h4>
              <div class="filtros-tags">
                <span
                  v-if="ecommerceStore.filtros.categoryId"
                  class="filtro-tag"
                >
                  Categoría:
                  {{
                    obtenerNombreCategoria(ecommerceStore.filtros.categoryId)
                  }}
                </span>
                <span
                  v-if="ecommerceStore.filtros.searchQuery"
                  class="filtro-tag"
                >
                  <i class="fas fa-search"></i>
                  Búsqueda: "{{ ecommerceStore.filtros.searchQuery }}"
                </span>
                <span
                  v-if="ecommerceStore.filtros.precioMin > 0"
                  class="filtro-tag"
                >
                  <i class="fas fa-dollar-sign"></i>
                  Precio mín: ${{ ecommerceStore.filtros.precioMin }}
                </span>
                <span
                  v-if="ecommerceStore.filtros.precioMax > 0"
                  class="filtro-tag"
                >
                  <i class="fas fa-dollar-sign"></i>
                  Precio máx: ${{ ecommerceStore.filtros.precioMax }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="(ecommerceStore.products || []).length > 0" class="paginacion">
          <button
            @click="ecommerceStore.previousPage"
            :disabled="ecommerceStore.pagination.page === 1"
            class="btn-paginacion"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="numeros-pagina">
            <button class="btn-numero-pagina activa">
              {{ ecommerceStore.pagination.page }}
            </button>
          </div>

          <button
            @click="ecommerceStore.nextPage"
            :disabled="
              ecommerceStore.pagination.page ===
              ecommerceStore.pagination.totalPages
            "
            class="btn-paginacion"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </main>
    </div>

    <!-- Componente de Detalle del Producto -->
    <product-detail
      v-if="mostrarDetalle"
      :producto="productoSeleccionado"
      @cerrar="cerrarDetalle"
      @submit="handleSubmit"
    />

    <!-- Modal de Contacto/Preguntas -->
    <div v-if="mostrarContacto" class="modal-overlay" @click="cerrarContacto">
      <div class="modal-contacto" @click.stop>
        <button @click="cerrarContacto" class="btn-cerrar-modal">
          <i class="fas fa-times"></i>
        </button>
        <div class="contacto-contenido">
          <h3><i class="fas fa-envelope"></i> Contactar al Vendedor</h3>

          <!-- Formulario de Pregunta -->
          <form @submit.prevent="enviarPregunta" class="formulario-pregunta">
            <div class="campo-grupo">
              <label><i class="fas fa-user"></i> Tu Nombre</label>
              <input type="text" v-model="formularioContacto.nombre" required />
            </div>
            <div class="campo-grupo">
              <label><i class="fas fa-envelope"></i> Tu Email</label>
              <input type="email" v-model="formularioContacto.email" required />
            </div>
            <div class="campo-grupo">
              <label><i class="fas fa-comment"></i> Tu Pregunta</label>
              <textarea
                v-model="formularioContacto.mensaje"
                rows="4"
                required
              ></textarea>
            </div>
            <button type="submit" class="btn-enviar-pregunta">
              <i class="fas fa-paper-plane"></i>
              Enviar Pregunta
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Overlay para filtros móviles -->
    <div
      v-if="mostrarFiltros"
      class="filtros-overlay"
      @click="toggleFiltros"
    ></div>

    <!-- Footer de la Tienda -->
    <footer class="tienda-footer">
      <p>© {{ new Date().getFullYear() }} {{ ecommerceStore.shopData?.name }}. Todos los derechos reservados.</p>
    </footer>
  </div>
  <spinnerComponent v-if="ecommerceStore.loading"></spinnerComponent>
  <toastComponent
    message="Producto agregado al carrito"
    state="success"
    v-if="showingToast"
  ></toastComponent>
</template>

<script>
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useEcommerceStore } from "@/stores/ecommerceStore";
import productDetail from "@/components/visuals/ecommerce/productDetail.vue";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";

export default {
  name: "TiendaVirtual",
  components: {
    productDetail,
    spinnerComponent,
    toastComponent,
  },
  data() {
    return {
      showingToast: false,
      ecommerceStore: useEcommerceStore(),

      mostrarFiltros: false,
      mostrarDetalle: false,
      mostrarContacto: false,
      productoSeleccionado: null,
      catalogView: "grid",
      sortOrder: "recent",

      // Wishlist/Favoritos
      favorites: JSON.parse(localStorage.getItem("store_favorites") || "[]"),

      // Filtros
      filtros: {
        categoria: "",
        precioMin: "",
        precioMax: "",
        disponibilidad: "",
      },

      // Formulario de contacto
      formularioContacto: {
        nombre: "",
        email: "",
        mensaje: "",
      },
    };
  },

  computed: {
    catalogProducts() {
      const products = (this.ecommerceStore.products || [])
        .filter((product) => product && product.showInStore !== false)
        .slice();

      if (this.sortOrder === "price-asc") return products.sort((a, b) => (a.sellPrice || 0) - (b.sellPrice || 0));
      if (this.sortOrder === "price-desc") return products.sort((a, b) => (b.sellPrice || 0) - (a.sellPrice || 0));
      if (this.sortOrder === "name") return products.sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
      return products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },
    inventoryValue() {
      return (this.ecommerceStore.products || []).reduce(
        (total, product) => total + (Number(product?.sellPrice) || 0) * (Number(product?.quantity) || 0),
        0,
      );
    },
    averageMargin() {
      const withCosts = (this.ecommerceStore.products || []).filter(
        (product) => Number(product?.buyPrice) > 0 && Number(product?.sellPrice) > 0,
      );
      if (!withCosts.length) return 0;
      const margin = withCosts.reduce(
        (total, product) => total + ((Number(product.sellPrice) - Number(product.buyPrice)) / Number(product.sellPrice)) * 100,
        0,
      );
      return Math.round(margin);
    },
    totalPaginas() {
      return Math.ceil(
        this.ecommerceStore.pagination.total /
          this.ecommerceStore.pagination.limit
      );
    },
  },

  methods: {
    handleSubmit() {
      this.showingToast = true;
      this.cerrarDetalle();
      setTimeout(() => {
        this.showingToast = false;
      }, 3000);
    },
    goToCarrito() {
      this.$router.push("/carrito");
    },
    limpiarFiltrosYMostrarTodos() {
      this.ecommerceStore.limpiarFiltros();
    },

    obtenerNombreCategoria(categoryId) {
      const categoria = this.ecommerceStore.categories.find(
        (cat) => cat._id === categoryId
      );
      return categoria ? categoria.name : "Categoría seleccionada";
    },
    toggleFiltros() {
      this.mostrarFiltros = !this.mostrarFiltros;
    },

    limpiarFiltros() {
      this.filtros = {
        categoria: "",
        precioMin: "",
        precioMax: "",
        disponibilidad: "",
      };
    },

    verDetalle(producto) {
      this.productoSeleccionado = {
        _id: producto._id,
        name: producto.name,
        sellPrice: producto.sellPrice,
        quantity: producto.quantity,
        descripcion: producto.description || "Descripción no disponible",
        imagenUrl:
          producto.images.length > 0
            ? producto.images[0].secure_url
            : "/placeholder.svg",
        imagenesAdicionales: producto.images
          .slice(1)
          .map((img) => img.secure_url),
        characteristics: producto.characteristics || [],
        sizesAndColors: producto.sizesAndColors || [],
      };
      this.mostrarDetalle = true;
    },

    cerrarDetalle() {
      this.mostrarDetalle = false;
      this.productoSeleccionado = null;
    },

    abrirContacto() {
      this.mostrarContacto = true;
    },

    cerrarContacto() {
      this.mostrarContacto = false;
      this.formularioContacto = {
        nombre: "",
        email: "",
        mensaje: "",
      };
    },

    hacerPregunta() {
      this.cerrarDetalle();
      this.abrirContacto();
    },

    enviarPregunta() {
      alert("¡Pregunta enviada correctamente! Te responderemos pronto.");
      this.cerrarContacto();
    },

    togglePregunta(id) {
      const pregunta = this.preguntas.find((p) => p.id === id);
      if (pregunta) {
        pregunta.abierta = !pregunta.abierta;
      }
    },

    async cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.ecommerceStore.pagination.page = pagina;
        await this.ecommerceStore.fetchProducts();
      }
    },

    toggleFavorite(productId) {
      if (this.favorites.includes(productId)) {
        this.favorites = this.favorites.filter((id) => id !== productId);
      } else {
        this.favorites.push(productId);
      }
      localStorage.setItem("store_favorites", JSON.stringify(this.favorites));
    },

    isFavorite(productId) {
      return this.favorites.includes(productId);
    },

    formatPrice(value) {
      if (value === undefined || value === null) return "$ 0,00";
      return "$ " + Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },

  async mounted() {
    this.shopId = this.$route.params.shopId;
    this.shopName = this.$route.params.shopName;

    //Desencriptar y descoficar el ID de la tienda
    const encryptedShopId = decodeURIComponent(this.shopId);
    const decryptedShopId = atob(encryptedShopId);
    this.shopId = decryptedShopId;

    await this.ecommerceStore.setShopDataFromRoute(this.shopId, this.shopName);
    await this.ecommerceStore.fetchProducts();
    await this.ecommerceStore.fetchShopData();
    await this.ecommerceStore.getShopCategories();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

.tienda-container {
  font-family: 'Outfit', sans-serif;
  background-color: #f4f6f9;
  min-height: 100vh;
  color: #1e293b;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: rgba(37, 99, 235, 0.08);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --transition-all: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Header del Negocio */
.negocio-header {
  position: relative;
  background-color: #1d273a;
  padding: 2.5rem 3.5rem;
  border-radius: 0;
  margin: 0 0 2rem 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Background Wavy Art */
.negocio-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(79, 70, 229, 0.08) 0%, transparent 60%);
  z-index: 1;
}

.negocio-info {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 2.25rem;
}

.negocio-logo {
  flex-shrink: 0;
}

.negocio-logo img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  background-color: rgba(255, 255, 255, 0.05);
}

.negocio-logo-placeholder {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  background: radial-gradient(circle, #2a364f 0%, #171f30 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.negocio-logo-placeholder i {
  font-size: 2.25rem;
  color: #a5b4fc;
}

.negocio-detalles {
  flex: 1;
}

.negocio-nombre {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.35rem;
  letter-spacing: -0.03em;
}

.negocio-descripcion {
  font-size: 0.95rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 600px;
  font-weight: 500;
}

.negocio-contacto {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.contacto-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #cbd5e1;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: var(--transition-all);
}

.contacto-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.contacto-item i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.contacto-item i.fa-map-marker-alt {
  color: var(--primary-color);
}

/* Icono de Carrito */
.carrito-icono {
  position: absolute;
  top: 50%;
  right: 3rem;
  transform: translateY(-50%);
  z-index: 10;
  background: #ffffff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-all);
}

.carrito-icono:hover {
  transform: translateY(-50%) scale(1.06);
  box-shadow: 0 12px 28px -5px rgba(0, 0, 0, 0.2);
}

.carrito-icono i {
  font-size: 1.35rem;
  color: #1e293b;
}

.carrito-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.65rem;
  font-weight: 900;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px #1d273a;
}

/* Contenido Principal */
.contenido-principal {
  width: 100%;
  max-width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  padding: 0 2.5rem 4rem 2.5rem;
}

/* Filtros Sidebar */
.filtros-sidebar {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 2rem 1.75rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
}

.filtros-sidebar:hover {
  box-shadow: var(--shadow-md);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.filtros-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.filtros-header h3 i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.btn-limpiar-top {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: var(--transition-all);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
}

.btn-limpiar-top:hover {
  color: var(--primary-color);
  background-color: #f0f7ff;
}

.btn-limpiar-top i {
  font-size: 0.8rem;
}

.btn-cerrar-filtros {
  display: none;
  background-color: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: var(--transition-all);
}

.btn-cerrar-filtros:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.filtro-grupo {
  margin-bottom: 2rem;
}

.filtro-grupo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
}

.filtro-grupo-header h4 {
  font-size: 0.8rem;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filtro-grupo-header i {
  font-size: 0.8rem;
  color: #94a3b8;
}

.filtro-opciones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filtro-opcion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.925rem;
  color: #475569;
  padding: 0.15rem 0;
  font-weight: 600;
  transition: var(--transition-all);
}

.filtro-opcion:hover {
  color: var(--primary-color);
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  position: relative;
  transition: var(--transition-all);
  background-color: #fff;
  flex-shrink: 0;
}

.filtro-opcion:hover .checkmark {
  border-color: #94a3b8;
}

.checkmark.selected {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
}

.checkmark.selected::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.precio-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-left: 0.25rem;
}

.precio-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: var(--transition-all);
}

.precio-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  background-color: #fff;
}

.precio-prefix {
  background-color: #f1f5f9;
  border-right: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.625rem 0.875rem;
  user-select: none;
}

.precio-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: none !important;
  background: transparent !important;
  font-size: 0.875rem;
  color: #334155;
  outline: none !important;
  box-shadow: none !important;
}

.btn-aplicar-filtros {
  width: 100%;
  padding: 0.875rem;
  background-color: #1d273a;
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 700;
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.btn-aplicar-filtros:hover {
  background-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

/* Contenido de Productos */
.productos-contenido {
  flex: 1;
}

.productos-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.btn-filtros-mobile {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #1d273a;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition-all);
}

.btn-filtros-mobile:hover {
  background-color: var(--primary-color);
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 9999px;
  padding: 0.25rem 0.25rem 0.25rem 1.25rem;
  width: 480px;
  max-width: 100%;
  border: 1px solid #e2e8f0;
  transition: var(--transition-all);
  box-shadow: var(--shadow-sm);
}

.search-container:focus-within {
  border-color: #cbd5e1;
  box-shadow: var(--shadow-md);
}

.search-bar-icon {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-right: 0.5rem;
}

.buscador-input {
  border: none !important;
  background: transparent !important;
  padding: 0.625rem 0;
  font-size: 0.9rem;
  color: #334155;
  flex: 1;
  outline: none;
  box-shadow: none !important;
  font-weight: 500;
}

.btn-buscar {
  background-color: #1d273a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-all);
}

.btn-buscar:hover {
  background-color: #0f172a;
  transform: scale(1.04);
}

.productos-contador {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 0.85rem 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
}

.productos-contador i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Grid de Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

@media (max-width: 1200px) {
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .productos-grid {
    grid-template-columns: 1fr;
  }
}

.producto-card {
  background-color: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition-all);
  box-shadow: var(--shadow-sm);
}

.producto-card.is-fav {
  border-color: rgba(37, 99, 235, 0.4);
}

.producto-card:hover {
  transform: translateY(-4px);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.06), 0 8px 16px -8px rgba(37, 99, 235, 0.12);
}

.producto-imagen {
  position: relative;
  height: 240px;
  overflow: hidden;
  background: radial-gradient(circle, #ffffff 60%, #fafbfc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.producto-imagen img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.06);
}

.btn-favorite-left {
  position: absolute;
  top: 0.875rem;
  left: 0.875rem;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 5;
  transition: var(--transition-all);
}

.btn-favorite-left:hover {
  transform: scale(1.1);
}

.btn-favorite-left i {
  font-size: 1.05rem;
  color: #94a3b8;
}

.btn-favorite-active-right {
  position: absolute;
  top: 0.875rem;
  right: 0.875rem;
  background-color: white;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: var(--transition-all);
}

.btn-favorite-active-right:hover {
  transform: scale(1.1);
}

.btn-favorite-active-right i {
  font-size: 0.95rem;
  color: var(--primary-color);
}

.producto-agotado {
  position: absolute;
  top: 0.875rem;
  left: 3rem; /* Shift to not overlap left heart button */
  background-color: #ef4444;
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: var(--shadow-sm);
  z-index: 2;
}

.producto-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.producto-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3.1rem;
}

.producto-precio {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
}

.producto-stock {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #10b981;
  background-color: #ecfdf5;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  width: fit-content;
}

.producto-stock.sin-stock {
  color: #ef4444;
  background-color: #fef2f2;
}

.producto-stock i {
  font-size: 0.8rem;
}

.btn-ver-detalle {
  width: 100%;
  padding: 0.875rem;
  background-color: white;
  color: #1d273a;
  border: 1.5px solid #1d273a;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-ver-detalle:hover {
  background-color: #1d273a;
  color: white;
}

.btn-ver-detalle i {
  font-size: 0.85rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3.5rem;
  padding: 1.5rem 0;
}

.btn-paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition-all);
}

.btn-paginacion:hover:not(:disabled) {
  background-color: #cbd5e1;
  color: #1e293b;
}

.btn-paginacion:disabled {
  background-color: #f1f5f9;
  color: #cbd5e1;
  cursor: not-allowed;
}

.numeros-pagina {
  display: flex;
  gap: 0.5rem;
}

.btn-numero-pagina {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #e2e8f0;
  color: #475569;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  transition: var(--transition-all);
}

.btn-numero-pagina:hover {
  background-color: #cbd5e1;
}

.btn-numero-pagina.activa {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
}

/* Sin Productos */
.sin-productos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  color: #64748b;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  margin: 1.5rem 0;
  min-height: 400px;
  box-shadow: var(--shadow-sm);
}

.sin-productos-icono {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.sin-productos-icono i {
  font-size: 2.25rem;
  color: #94a3b8;
}

.sin-productos h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.sin-productos p {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-contacto {
  background-color: white;
  border-radius: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.btn-cerrar-modal {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background-color: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: #64748b;
  z-index: 10;
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.btn-cerrar-modal:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.contacto-contenido {
  padding: 2.25rem;
}

.contacto-contenido h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.contacto-contenido h3 i {
  color: var(--primary-color);
}

.formulario-pregunta {
  margin-bottom: 2rem;
}

.campo-grupo {
  margin-bottom: 1.25rem;
}

.campo-grupo label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.campo-grupo label i {
  color: #94a3b8;
}

.campo-grupo input,
.campo-grupo textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: #334155;
  transition: var(--transition-all);
  background-color: #f8fafc;
}

.campo-grupo input:focus,
.campo-grupo textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn-enviar-pregunta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #1d273a 0%, #0f172a 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-all);
}

.btn-enviar-pregunta:hover {
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

/* Footer */
.tienda-footer {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  margin: 3rem 0 0 0;
}

/* Dark Mode Overrides */
.dark .tienda-container {
  background-color: #0f172a;
  color: #cbd5e1;
}

.dark .filtros-sidebar,
.dark .producto-card,
.dark .productos-toolbar,
.dark .modal-contacto,
.dark .sin-productos,
.dark .productos-contador {
  background-color: #1e293b;
  border-color: #334155;
}

.dark .negocio-nombre,
.dark .filtro-grupo-header h4,
.dark .producto-nombre,
.dark .contacto-contenido h3,
.dark .campo-grupo label,
.dark .btn-paginacion:not(:disabled),
.dark .btn-numero-pagina,
.dark .productos-contador {
  color: #f8fafc;
}

.dark .negocio-descripcion,
.dark .contacto-item,
.dark .filtro-opcion,
.dark .btn-limpiar-top,
.dark .tienda-footer {
  color: #94a3b8;
}

.dark .contacto-item {
  background-color: #0f172a;
}

.dark .contacto-item:hover {
  background-color: #334155;
  color: #f8fafc;
}

.dark .precio-input-wrapper {
  background-color: #0f172a;
  border-color: #334155;
}

.dark .precio-prefix {
  background-color: #1e293b;
  border-right-color: #334155;
  color: #94a3b8;
}

.dark .precio-input,
.dark .campo-grupo input,
.dark .campo-grupo textarea {
  color: #f8fafc;
}

.dark .precio-input-wrapper:focus-within {
  border-color: var(--primary-color);
}

.dark .search-container {
  background-color: #1e293b;
  border-color: #334155;
}

.dark .search-container:focus-within {
  border-color: #475569;
}

.dark .buscador-input {
  color: #f8fafc;
}

.dark .btn-paginacion,
.dark .btn-numero-pagina {
  background-color: #1e293b;
  color: #cbd5e1;
}

.dark .btn-paginacion:hover:not(:disabled),
.dark .btn-numero-pagina:hover {
  background-color: #334155;
}

.dark .btn-paginacion:disabled {
  background-color: #1e293b;
  color: #475569;
  opacity: 0.5;
}

.dark .btn-cerrar-modal,
.dark .btn-cerrar-filtros {
  background-color: #0f172a;
  color: #94a3b8;
}

.dark .btn-cerrar-modal:hover,
.dark .btn-cerrar-filtros:hover {
  background-color: #334155;
  color: #f8fafc;
}

.dark .sin-productos-icono {
  background-color: #0f172a;
}

.dark .btn-ver-detalle {
  background-color: #1e293b;
  color: #cbd5e1;
  border-color: #475569;
}

.dark .btn-ver-detalle:hover {
  background-color: #cbd5e1;
  color: #1e293b;
  border-color: #cbd5e1;
}

/* ── Catalog workspace refresh ─────────────────────────────────────────── */
.tienda-container { background: #f7f9fd; }
.negocio-header { padding: 1rem 3.5rem 1.25rem; margin-bottom: 0; background: linear-gradient(112deg, #06183d 0%, #092c75 100%); }
.negocio-info { gap: 1rem; }
.negocio-logo img, .negocio-logo-placeholder { width: 62px; height: 62px; }
.negocio-nombre { font-size: 1.55rem; margin-bottom: .15rem; }
.negocio-descripcion { margin-bottom: 0; font-size: .78rem; color: #d4dff6; }
.negocio-contacto { display: none; }
.catalog-metrics { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(3, minmax(0, 210px)); gap: .85rem; margin: .8rem 0 0 5.1rem; }
.catalog-metric { display: flex; align-items: center; gap: .8rem; min-height: 50px; padding: .65rem .9rem; border-radius: .65rem; color: #fff; background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.05); }
.catalog-metric > .material-symbols-outlined { display: grid; place-items: center; width: 30px; height: 30px; border-radius: .5rem; background: rgba(255,255,255,.08); font-size: 1rem; }
.catalog-metric small, .catalog-metric strong { display: block; }
.catalog-metric small { font-size: .62rem; color: #b9c8e4; }
.catalog-metric strong { margin-top: .1rem; font-size: .88rem; color: #fff; }
.carrito-icono { top: 1.25rem; right: 3rem; transform: none; width: 48px; height: 48px; }
.carrito-icono:hover { transform: scale(1.06); }

.catalog-actions { display: flex; align-items: center; gap: .75rem; padding: 1.4rem 3.5rem 1rem; background: #fff; box-shadow: 0 7px 20px rgba(15,36,77,.035); }
.catalog-actions .search-container { flex: 1; max-width: 310px; }
.catalog-actions .productos-contador { margin-left: auto; }
.catalog-action-button { display: inline-flex; align-items: center; gap: .55rem; min-height: 34px; padding: 0 .9rem; border: 1px solid #e4eaf4; border-radius: .55rem; background: #fff; color: #17294e; box-shadow: 0 3px 10px rgba(26,47,85,.06); font-size: .72rem; font-weight: 700; cursor: pointer; }
.catalog-action-button:hover { border-color: #2e5bff; color: #2452ed; }
.filter-count { display: grid; place-items: center; min-width: 17px; height: 17px; border-radius: 50%; background: #2856f6; color: #fff; font-size: .62rem; }

.contenido-principal { gap: 1.1rem; padding: .7rem 2.5rem 3rem; grid-template-columns: 200px minmax(0, 1fr); }
.filtros-sidebar { padding: 1.25rem 1rem; border-radius: .8rem; box-shadow: 0 6px 18px rgba(29,49,83,.05); }
.filtros-header { margin-bottom: 1rem; padding-bottom: .75rem; }
.filtros-header h3 { font-size: .85rem; }
.btn-limpiar-top { display: none; }
.filtro-grupo { margin-bottom: 1.25rem; }
.filtro-grupo-header h4 { font-size: .62rem; }
.filtro-opciones { gap: .5rem; }
.filtro-opcion { gap: .5rem; font-size: .68rem; }
.checkmark { width: 14px; height: 14px; border-width: 1.5px; }
.precio-inputs { gap: .65rem; }
.input-group label { font-size: .65rem; }
.precio-prefix, .precio-input { padding: .48rem .6rem; font-size: .68rem; }
.btn-aplicar-filtros { padding: .7rem; border-radius: .5rem; background: #2856f6; font-size: .68rem; }

.productos-toolbar { min-height: 40px; margin-bottom: .8rem; justify-content: flex-end; }
.catalog-view-controls { display: flex; align-items: center; gap: .4rem; }
.catalog-sort { min-height: 34px; padding: 0 .8rem; border: 1px solid #e4eaf4; border-radius: .5rem; background: #fff; color: #263857; font-size: .68rem; font-weight: 700; outline: none; }
.view-button { width: 34px; height: 34px; border: 1px solid #e4eaf4; border-radius: .5rem; color: #52647f; background: #fff; cursor: pointer; }
.view-button.active { color: #2856f6; background: #edf2ff; border-color: #dce6ff; }
.productos-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; }
.producto-card { border-radius: .8rem; border-color: #e8edf5; box-shadow: 0 5px 14px rgba(32,51,83,.055); }
.producto-imagen { height: 130px; padding: .75rem; }
.producto-imagen img { max-height: 105px; object-fit: contain; }
.producto-info { padding: .8rem .9rem .9rem; }
.producto-nombre { min-height: 32px; font-size: .73rem; line-height: 1.35; }
.producto-precio { margin: .5rem 0; font-size: .95rem; }
.producto-stock { font-size: .66rem; }
.btn-ver-detalle { margin-top: .8rem; padding: .55rem; border-radius: .5rem; font-size: .66rem; }

@media (min-width: 1350px) { .productos-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* Responsive Overrides */
@media (max-width: 992px) {
  .catalog-actions { padding: 1rem; flex-wrap: wrap; }
  .catalog-actions .productos-contador { margin-left: 0; }
  .catalog-metrics { margin-left: 0; grid-template-columns: repeat(3, 1fr); }
  .contenido-principal {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1.5rem;
  }

  .negocio-info {
    flex-direction: column;
    text-align: center;
    align-items: center;
    gap: 1rem;
  }

  .negocio-logo img {
    margin-top: 0;
  }

  .negocio-contacto {
    justify-content: center;
  }

  .carrito-icono {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    transform: none;
  }

  .carrito-icono:hover {
    transform: scale(1.05);
  }

  .filtros-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 300px;
    height: 100vh;
    z-index: 1001;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
    border: none;
    border-right: 1px solid #e2e8f0;
    max-height: 100vh;
  }

  .filtros-sidebar.filtros-activos {
    left: 0;
  }

  .btn-filtros-mobile {
    display: flex;
  }

  .btn-cerrar-filtros {
    display: flex;
  }

  .productos-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-container {
    width: 100%;
  }

  .productos-contador {
    justify-content: center;
  }

  .paginacion {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .negocio-header {
    padding: 3.5rem 1.25rem 2rem 1.25rem;
    margin: 0.5rem;
  }

  .negocio-nombre {
    font-size: 1.75rem;
  }

  .contacto-item {
    width: 100%;
    justify-content: center;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .filtros-sidebar {
    width: 100%;
  }
}
</style>

<style>
/* Reset global body and html margins/paddings when viewing the store page */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #f4f6f9 !important;
}
</style>
