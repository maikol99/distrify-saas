<template>
  <div class="tienda-container">
    <!-- Header del Negocio -->
    <header v-if="ecommerceStore.shopData" class="negocio-header">
      <div class="negocio-info">
        <div class="negocio-logo">
          <img
            v-if="ecommerceStore.shopData.shopImage.secure_url"
            :src="ecommerceStore.shopData.shopImage.secure_url"
            :alt="ecommerceStore.shopData.name"
          />
        </div>
        <div class="negocio-detalles">
          <h1 class="negocio-nombre">{{ ecommerceStore.shopData.name }}</h1>
          <p class="negocio-descripcion">
            {{ ecommerceStore.shopData.description }}
          </p>
          <div class="negocio-contacto">
            <div class="contacto-item">
              <i class="fas fa-phone"></i>
              <span>{{ ecommerceStore.shopData.phone }}</span>
            </div>
            <div class="contacto-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ ecommerceStore.shopData.address }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Icono de Carrito en la esquina superior derecha -->
      <!-- Icono de Carrito mejorado -->
      <div class="carrito-icono" @click="goToCarrito">
        <i class="fas fa-shopping-cart"></i>
        <span class="carrito-badge" v-if="ecommerceStore.carrito.length > 0">{{
          ecommerceStore.carrito.length
        }}</span>
      </div>
    </header>

    <div class="contenido-principal">
      <!-- Filtros Laterales -->
      <!-- Sección de filtros corregida -->
      <aside
        class="filtros-sidebar"
        :class="{ 'filtros-activos': mostrarFiltros }"
      >
        <div class="filtros-header">
          <h3><i class="fas fa-filter"></i> Filtros</h3>
          <button @click="toggleFiltros" class="btn-cerrar-filtros">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Filtro por Categoría -->
        <div class="filtro-grupo">
          <h4><i class="fas fa-tags"></i> Categoría</h4>
          <div class="filtro-opciones">
            <label class="filtro-opcion">
              <input
                type="radio"
                v-model="ecommerceStore.filtros.categoryId"
                value=""
                @change="ecommerceStore.filterProducts()"
              />
              <span class="checkmark"></span>
              <span>Todas las categorías</span>
            </label>
            <label
              v-for="categoria in ecommerceStore.categories"
              :key="categoria._id"
              class="filtro-opcion"
            >
              <input
                type="radio"
                v-model="ecommerceStore.filtros.categoryId"
                :value="categoria._id"
                @change="ecommerceStore.filterProducts()"
              />
              <span class="checkmark"></span>
              <span>{{ categoria.name }}</span>
            </label>
          </div>
        </div>

        <!-- Filtro por Precio -->
        <div class="filtro-grupo">
          <h4><i class="fas fa-dollar-sign"></i> Rango de Precio</h4>
          <div class="precio-inputs">
            <div class="input-group">
              <i class="fas fa-dollar-sign input-icon"></i>
              <label for=""> Mínimo: </label>
              <input
                type="number"
                v-model="ecommerceStore.filtros.minAmount"
                placeholder="Mínimo"
                class="precio-input"
              />
            </div>
            <div class="input-group">
              <i class="fas fa-dollar-sign input-icon"></i>
              <label for=""> Máximo: </label>
              <input
                type="number"
                v-model="ecommerceStore.filtros.maxAmount"
                placeholder="Máximo"
                class="precio-input"
              />
            </div>
          </div>
        </div>

        <button
          class="btn-limpiar-filtros"
          style="margin-bottom: 5px"
          @click="ecommerceStore.filterProducts()"
        >
          <i class="fas fa-filter"></i>
          Aplicar Filtros
        </button>

        <button
          @click="ecommerceStore.limpiarFiltros()"
          class="btn-limpiar-filtros"
          v-if="ecommerceStore.filtersApplied"
        >
          <i class="fas fa-eraser"></i>
          Limpiar Filtros
        </button>
      </aside>

      <!-- Contenido de Productos -->
      <main class="productos-contenido">
        <div class="productos-toolbar">
          <button @click="toggleFiltros" class="btn-filtros-mobile">
            <i class="fas fa-filter"></i>
            Filtros
          </button>

          <div class="search-container">
            <input
              type="text"
              v-model="ecommerceStore.filtros.searchQuery"
              @keydown.enter="ecommerceStore.filterProducts"
              class="buscador-input"
              placeholder="Buscar productos..."
              @input="ecommerceStore.checkInput"
            />
            <button class="btn-buscar" @click="ecommerceStore.filterProducts">
              <i class="fas fa-search"></i>
            </button>
          </div>

          <div class="productos-contador">
            <i class="fas fa-box"></i>
            {{ ecommerceStore.pagination.total }} productos encontrados
          </div>
        </div>

        <!-- Grid de Productos -->
        <div class="productos-grid">
          <div
            v-for="producto in ecommerceStore.products.filter(
              (p) => p.showInStore !== false
            )"
            :key="producto.id"
            class="producto-card"
            @click="verDetalle(producto)"
          >
            <div class="producto-imagen">
              <img
                v-if="producto.images.length > 0"
                :src="producto.images[0].secure_url"
                :alt="producto.name"
              />
              <div v-if="producto.quantity === 0" class="producto-agotado">
                <i class="fas fa-exclamation-triangle"></i>
                Agotado
              </div>
              <div class="producto-overlay">
                <i class="fas fa-eye"></i>
              </div>
            </div>
            <div class="producto-info">
              <h3 class="producto-nombre">{{ producto.name }}</h3>
              <div class="producto-precio">
                <i class="fas fa-dollar-sign"></i>
                {{ producto.sellPrice.toFixed(2) }}
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
                Ver Detalle
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay productos -->
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

            <p v-else>
              Este negocio aún no ha agregado productos a su catálogo
            </p>

            <!-- Botón para limpiar filtros solo si hay filtros aplicados -->

            <!-- Mostrar filtros activos -->
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
                <span
                  v-if="ecommerceStore.filtros.disponibilidad"
                  class="filtro-tag"
                >
                  <i class="fas fa-boxes"></i>
                  {{
                    ecommerceStore.filtros.disponibilidad === "en-stock"
                      ? "En stock"
                      : "Sin stock"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Paginación -->
        <div v-if="ecommerceStore.products.length > 0" class="paginacion">
          <button
            @click="ecommerceStore.previousPage"
            :disabled="ecommerceStore.pagination.page === 1"
            class="btn-paginacion"
          >
            <i class="fas fa-chevron-left"></i>
            Anterior
          </button>

          <div class="numeros-pagina">
            Página {{ ecommerceStore.pagination.page }} de
            {{ ecommerceStore.pagination.totalPages }}
          </div>

          <button
            @click="ecommerceStore.nextPage"
            :disabled="
              ecommerceStore.pagination.page ===
              ecommerceStore.pagination.totalPages
            "
            class="btn-paginacion"
          >
            Siguiente
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

          <!-- Preguntas Frecuentes -->
          <div class="preguntas-frecuentes">
            <h4><i class="fas fa-question-circle"></i> Preguntas Frecuentes</h4>
            <div
              class="pregunta-item"
              v-for="pregunta in preguntas"
              :key="pregunta.id"
            >
              <div class="pregunta-titulo" @click="togglePregunta(pregunta.id)">
                <span>{{ pregunta.pregunta }}</span>
                <i
                  :class="
                    pregunta.abierta
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </div>
              <div v-if="pregunta.abierta" class="pregunta-respuesta">
                {{ pregunta.respuesta }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay para filtros móviles -->
    <div
      v-if="mostrarFiltros"
      class="filtros-overlay"
      @click="toggleFiltros"
    ></div>
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
    totalPaginas() {
      return Math.ceil(
        this.ecommerceStore.pagination.total /
          this.ecommerceStore.pagination.limit
      );
    },

    paginasVisibles() {
      const current = this.ecommerceStore.pagination.currentPage;
      const total = this.totalPaginas;
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
      ) {
        range.push(i);
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (current + delta < total - 1) {
        rangeWithDots.push("...", total);
      } else if (total > 1) {
        rangeWithDots.push(total);
      }

      return rangeWithDots.filter(
        (page) =>
          page !== "..." ||
          rangeWithDots.indexOf(page) === rangeWithDots.lastIndexOf(page)
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

.btn-buscar{
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-buscar:hover {
  background-color: #555;
}

.search-container{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.search-container input{
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  flex: 1;
}

/* Mejoras para el mensaje de sin productos - adaptado a tu estilo */
.sin-productos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin: 1.5rem 0;
  min-height: 400px;
}

.sin-productos-icono {
  margin-bottom: 2rem;
}

.sin-productos-icono i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 0;
}

.sin-productos-contenido {
  max-width: 500px;
  width: 100%;
}

.sin-productos h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
}

.sin-productos p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-limpiar-filtros-mensaje {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0 auto;
}

.btn-limpiar-filtros-mensaje:hover {
  background-color: #555;
}

.btn-limpiar-filtros-mensaje i {
  font-size: 0.8rem;
}

/* Filtros activos resumen */
.filtros-activos-resumen {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.filtros-activos-resumen h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtros-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.filtro-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fff;
  color: #666;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.filtro-tag i {
  font-size: 0.75rem;
  color: #999;
}

/* Responsive adaptado a tu estilo */
@media (max-width: 768px) {
  .sin-productos {
    padding: 3rem 1.5rem;
    margin: 1rem 0;
    min-height: 300px;
  }

  .sin-productos-icono i {
    font-size: 3rem;
  }

  .sin-productos h3 {
    font-size: 1.25rem;
  }

  .sin-productos p {
    font-size: 0.9rem;
  }

  .filtros-activos-resumen {
    padding: 1rem;
  }

  .filtros-tags {
    flex-direction: column;
    align-items: center;
  }

  .filtro-tag {
    width: fit-content;
  }
}

@media (max-width: 480px) {
  .sin-productos {
    padding: 2rem 1rem;
  }

  .sin-productos-icono i {
    font-size: 2.5rem;
  }

  .sin-productos h3 {
    font-size: 1.125rem;
  }

  .btn-limpiar-filtros-mensaje {
    width: 100%;
    padding: 1rem;
  }

  .filtros-activos-resumen {
    margin-top: 1.5rem;
    padding: 1rem;
  }
}
/* Reset y estilos base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tienda-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #fafafa;
  min-height: 100vh;
  color: #333;
}

/* Header del Negocio */
.negocio-header {
  position: relative;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 2rem 1rem;
}

.carrito-icono {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: white;
  padding: 0.6rem;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrito-icono:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.carrito-icono i {
  font-size: 1.4rem;
  color: #2c3e50;
}

.carrito-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #e74c3c;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  box-shadow: 0 0 0 2px white;
}

.negocio-info {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.negocio-logo img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e5e5;
}

.negocio-nombre {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111;
}

.negocio-descripcion {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.negocio-contacto {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.contacto-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.contacto-item i {
  color: #999;
  width: 16px;
}

/* Contenido Principal */
.contenido-principal {
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  padding: 2rem 1rem;
}

/* Filtros Sidebar */
.filtros-sidebar {
  width: 280px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  overflow-y: auto;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.filtros-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtros-header h3 i {
  color: #666;
  font-size: 0.9rem;
}

.btn-cerrar-filtros {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  padding: 0.25rem;
}

.btn-cerrar-filtros:hover {
  color: #666;
}

.filtro-grupo {
  margin-bottom: 2rem;
}

.filtro-grupo h4 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtro-grupo h4 i {
  color: #999;
  font-size: 0.8rem;
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
  font-size: 0.9rem;
  color: #666;
  padding: 0.25rem 0;
}

.filtro-opcion:hover {
  color: #333;
}

.filtro-opcion input[type="radio"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.filtro-opcion input[type="radio"]:checked + .checkmark {
  border-color: #333;
  background-color: #333;
}

.filtro-opcion input[type="radio"]:checked + .checkmark::after {
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
  gap: 0.75rem;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 0.8rem;
}

.precio-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.precio-input:focus {
  outline: none;
  border-color: #333;
}

.btn-limpiar-filtros {
  width: 100%;
  padding: 0.75rem;
  background-color: #f8f8f8;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-limpiar-filtros:hover {
  background-color: #f0f0f0;
  color: #333;
}

.btn-limpiar-filtros i {
  font-size: 0.8rem;
}

/* Contenido de Productos */
.productos-contenido {
  flex: 1;
}

.productos-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.btn-filtros-mobile {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-filtros-mobile:hover {
  background-color: #555;
}

.productos-contador {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.productos-contador i {
  color: #999;
  font-size: 0.8rem;
}

/* Grid de Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.producto-card {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.producto-card:hover {
  border-color: #ccc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.producto-imagen {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f8f8;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.producto-card:hover .producto-overlay {
  opacity: 1;
}

.producto-overlay i {
  color: white;
  font-size: 1.5rem;
}

.producto-agotado {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.producto-info {
  padding: 1.25rem;
}

.producto-nombre {
  font-size: 1rem;
  font-weight: 500;
  color: #111;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.producto-precio {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.producto-precio i {
  font-size: 1rem;
  color: #666;
}

.producto-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  color: #28a745;
}

.producto-stock.sin-stock {
  color: #dc3545;
}

.producto-stock i {
  font-size: 0.8rem;
}

.btn-ver-detalle {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-ver-detalle:hover {
  background-color: #555;
}

.btn-ver-detalle i {
  font-size: 0.8rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1.5rem 0;
}

.btn-paginacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-paginacion:hover:not(:disabled) {
  background-color: #555;
}

.btn-paginacion:disabled {
  background-color: #e5e5e5;
  color: #999;
  cursor: not-allowed;
}

.numeros-pagina {
  display: flex;
  gap: 0.25rem;
  margin: 0 1rem;
}

.btn-numero-pagina {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-numero-pagina:hover {
  border-color: #333;
  color: #333;
}

.btn-numero-pagina.activa {
  background-color: #333;
  color: white;
  border-color: #333;
}

/* Sin Productos */
.sin-productos {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.sin-productos i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.sin-productos h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-contacto {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #e5e5e5;
}

.btn-cerrar-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #f8f8f8;
  border: 1px solid #e5e5e5;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  z-index: 10;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.btn-cerrar-modal:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* Modal Contacto */
.contacto-contenido {
  padding: 2rem;
}

.contacto-contenido h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contacto-contenido h3 i {
  color: #666;
  font-size: 1rem;
}

.formulario-pregunta {
  margin-bottom: 2rem;
}

.campo-grupo {
  margin-bottom: 1rem;
}

.campo-grupo label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campo-grupo label i {
  color: #666;
  font-size: 0.8rem;
}

.campo-grupo input,
.campo-grupo textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.campo-grupo input:focus,
.campo-grupo textarea:focus {
  outline: none;
  border-color: #333;
}

.btn-enviar-pregunta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-enviar-pregunta:hover {
  background-color: #555;
}

.btn-enviar-pregunta i {
  font-size: 0.8rem;
}

/* Preguntas Frecuentes */
.preguntas-frecuentes h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preguntas-frecuentes h4 i {
  color: #666;
  font-size: 0.9rem;
}

.pregunta-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.pregunta-titulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  transition: background-color 0.2s ease;
}

.pregunta-titulo:hover {
  background-color: #f8f8f8;
}

.pregunta-titulo i {
  color: #666;
  font-size: 0.8rem;
}

.pregunta-respuesta {
  padding: 0 1rem 1rem 1rem;
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .negocio-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .negocio-contacto {
    justify-content: center;
    flex-direction: column;
    gap: 0.75rem;
  }

  .contenido-principal {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .filtros-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    z-index: 999;
    transition: left 0.3s ease;
    border-radius: 0;
    border-right: 1px solid #e5e5e5;
    border-left: none;
    border-top: none;
    border-bottom: none;
  }

  .filtros-sidebar.filtros-activos {
    left: 0;
  }

  .btn-cerrar-filtros {
    display: flex;
  }

  .btn-filtros-mobile {
    display: flex;
  }

  .filtros-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 998;
  }

  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .productos-toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .paginacion {
    flex-direction: column;
    gap: 1rem;
  }

  .numeros-pagina {
    justify-content: center;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .negocio-nombre {
    font-size: 1.5rem;
  }

  .productos-grid {
    grid-template-columns: 1fr;
  }

  .filtros-sidebar {
    width: 100%;
  }

  .btn-paginacion {
    width: 100%;
    justify-content: center;
  }

  .contacto-contenido {
    padding: 1.5rem;
  }
}
</style>
