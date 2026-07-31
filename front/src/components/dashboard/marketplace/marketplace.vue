<template>
  <div class="marketplace-container">
    <!-- Header del Marketplace -->
    <header class="marketplace-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="marketplace-title">
            <i class="fas fa-store"></i>
            Alevia Pay Marketplace
          </h1>
          <p class="marketplace-subtitle">
            Descubre negocios increíbles cerca de ti
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-registrar-negocio">
            <i class="fas fa-plus"></i>
            Registra tu Negocio
          </button>
        </div>
      </div>
    </header>

    <!-- Barra de búsqueda y filtros principales -->
    <section class="search-section">
      <div class="search-content">
        <div class="search-container">
          <div class="search-input-group">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="filtros.busqueda"
              @input="aplicarFiltros"
              placeholder="Buscar negocios o productos..."
              class="search-input"
            />
            <button @click="aplicarFiltros" class="btn-buscar">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <div class="contenido-principal">
      <!-- Filtros laterales -->
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
                v-model="filtros.categoria"
                value=""
                @change="aplicarFiltros"
              />
              <span class="checkmark"></span>
              <span>Todas las categorías</span>
            </label>
            <label
              v-for="categoria in categorias"
              :key="categoria.id"
              class="filtro-opcion"
            >
              <input
                type="radio"
                v-model="filtros.categoria"
                :value="categoria.id"
                @change="aplicarFiltros"
              />
              <span class="checkmark"></span>
              <span>{{ categoria.nombre }}</span>
            </label>
          </div>
        </div>

        <!-- Filtro por Ubicación -->
        <div class="filtro-grupo">
          <h4><i class="fas fa-map-marker-alt"></i> Ubicación</h4>
          <div class="filtro-opciones">
            <label class="filtro-opcion">
              <input
                type="radio"
                v-model="filtros.ubicacion"
                value=""
                @change="aplicarFiltros"
              />
              <span class="checkmark"></span>
              <span>Todas las ubicaciones</span>
            </label>
            <label
              v-for="ubicacion in ubicaciones"
              :key="ubicacion"
              class="filtro-opcion"
            >
              <input
                type="radio"
                v-model="filtros.ubicacion"
                :value="ubicacion"
                @change="aplicarFiltros"
              />
              <span class="checkmark"></span>
              <span>{{ ubicacion }}</span>
            </label>
          </div>
        </div>

        <!-- Filtro por Estado -->
        <div class="filtro-grupo">
          <h4><i class="fas fa-circle"></i> Estado</h4>
          <div class="filtro-opciones">
            <label class="filtro-opcion">
              <input
                type="checkbox"
                v-model="filtros.soloAbiertos"
                @change="aplicarFiltros"
              />
              <span class="checkmark-checkbox"></span>
              <span>Solo negocios abiertos</span>
            </label>
            <label class="filtro-opcion">
              <input
                type="checkbox"
                v-model="filtros.conProductos"
                @change="aplicarFiltros"
              />
              <span class="checkmark-checkbox"></span>
              <span>Con productos disponibles</span>
            </label>
          </div>
        </div>

        <button
          @click="limpiarFiltros"
          class="btn-limpiar-filtros"
          v-if="hayFiltrosAplicados"
        >
          <i class="fas fa-eraser"></i>
          Limpiar Filtros
        </button>
      </aside>

      <!-- Grid de negocios -->
      <main class="negocios-contenido">
        <div class="negocios-toolbar">
          <button @click="toggleFiltros" class="btn-filtros-mobile">
            <i class="fas fa-filter"></i>
            Filtros
          </button>

          <div class="vista-controles">
            <button
              @click="tipoVista = 'grid'"
              class="btn-vista"
              :class="{ activo: tipoVista === 'grid' }"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button
              @click="tipoVista = 'lista'"
              class="btn-vista"
              :class="{ activo: tipoVista === 'lista' }"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>

          <div class="negocios-contador">
            <i class="fas fa-store"></i>
            {{ negociosFiltrados.length }} negocios encontrados
          </div>
        </div>

        <!-- Grid/Lista de Negocios -->
        <div
          class="negocios-grid"
          :class="{ 'vista-lista': tipoVista === 'lista' }"
        >
          <div
            v-for="negocio in negociosPaginados"
            :key="negocio.id"
            class="negocio-card"
            @click="verNegocio(negocio)"
          >
            <div class="negocio-imagen">
              <img :src="negocio.imagen" :alt="negocio.nombre" />
              <div class="negocio-estado" :class="negocio.estado">
                <i
                  :class="
                    negocio.estado === 'abierto'
                      ? 'fas fa-circle'
                      : 'far fa-circle'
                  "
                ></i>
                {{ negocio.estado === "abierto" ? "Abierto" : "Cerrado" }}
              </div>
              <div class="negocio-overlay">
                <i class="fas fa-external-link-alt"></i>
              </div>
            </div>

            <div class="negocio-info">
              <div class="negocio-header">
                <h3 class="negocio-nombre">{{ negocio.nombre }}</h3>
                <div class="negocio-categoria">{{ negocio.categoria }}</div>
              </div>

              <p class="negocio-descripcion">{{ negocio.descripcion }}</p>

              <div class="negocio-detalles">
                <div class="detalle-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ negocio.ubicacion }}</span>
                </div>
                <div class="detalle-item">
                  <i class="fas fa-phone"></i>
                  <span>{{ negocio.telefono }}</span>
                </div>
                <div class="detalle-item">
                  <i class="fas fa-box"></i>
                  <span>{{ negocio.totalProductos }} productos</span>
                </div>
              </div>

              <div
                class="negocio-productos-preview"
                v-if="negocio.productosDestacados.length > 0"
              >
                <h5>Productos destacados:</h5>
                <div class="productos-preview">
                  <div
                    v-for="producto in negocio.productosDestacados.slice(0, 3)"
                    :key="producto.id"
                    class="producto-preview"
                  >
                    <img :src="producto.imagen" :alt="producto.nombre" />
                    <div class="producto-preview-info">
                      <span class="producto-preview-nombre">{{
                        producto.nombre
                      }}</span>
                      <span class="producto-preview-precio"
                        >${{ producto.precio }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="negocio-acciones">
                <button
                  class="btn-ver-tienda"
                  @click.stop="verNegocio(negocio)"
                >
                  <i class="fas fa-store"></i>
                  Ver Tienda
                </button>
                <button
                  class="btn-contactar"
                  @click.stop="contactarNegocio(negocio)"
                >
                  <i class="fas fa-phone"></i>
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay negocios -->
        <div v-if="negociosFiltrados.length === 0" class="sin-negocios">
          <div class="sin-negocios-icono">
            <i class="fas fa-search" v-if="hayFiltrosAplicados"></i>
            <i class="fas fa-store-slash" v-else></i>
          </div>
          <div class="sin-negocios-contenido">
            <h3 v-if="hayFiltrosAplicados">
              No se encontraron negocios con los filtros aplicados
            </h3>
            <h3 v-else>No hay negocios disponibles</h3>
            <p v-if="hayFiltrosAplicados">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <p v-else>
              Sé el primero en registrar tu negocio en nuestro marketplace
            </p>
            <button
              v-if="hayFiltrosAplicados"
              @click="limpiarFiltros"
              class="btn-limpiar-filtros-mensaje"
            >
              <i class="fas fa-eraser"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>

        <!-- Paginación -->
        <div
          v-if="negociosFiltrados.length > negociosPorPagina"
          class="paginacion"
        >
          <button
            @click="paginaAnterior"
            :disabled="paginaActual === 1"
            class="btn-paginacion"
          >
            <i class="fas fa-chevron-left"></i>
            Anterior
          </button>

          <div class="numeros-pagina">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </div>

          <button
            @click="paginaSiguiente"
            :disabled="paginaActual === totalPaginas"
            class="btn-paginacion"
          >
            Siguiente
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </main>
    </div>

    <!-- Overlay para filtros móviles -->
    <div
      v-if="mostrarFiltros"
      class="filtros-overlay"
      @click="toggleFiltros"
    ></div>
  </div>
</template>

<script>
export default {
  name: "MarketplaceComponent",
  data() {
    return {
      mostrarFiltros: false,
      tipoVista: "grid",
      paginaActual: 1,
      negociosPorPagina: 12,

      filtros: {
        busqueda: "",
        categoria: "",
        ubicacion: "",
        soloAbiertos: false,
        conProductos: false,
      },

      // Datos de prueba
      negocios: [
        {
          id: 1,
          nombre: "Café Central",
          descripcion:
            "El mejor café artesanal de la ciudad con ambiente acogedor y productos frescos",
          imagen:
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
          categoria: "Cafetería",
          ubicacion: "Centro",
          telefono: "+1 234-567-8901",
          estado: "abierto",
          totalProductos: 45,
          productosDestacados: [
            {
              id: 1,
              nombre: "Latte Especial",
              precio: 4.5,
              imagen:
                "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100",
            },
            {
              id: 2,
              nombre: "Croissant",
              precio: 3.2,
              imagen:
                "https://images.unsplash.com/photo-1555507036-ab794f375df9?w=100",
            },
            {
              id: 3,
              nombre: "Cappuccino",
              precio: 4.0,
              imagen:
                "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100",
            },
          ],
        },
        {
          id: 2,
          nombre: "Tech Store Pro",
          descripcion:
            "Tecnología de última generación, smartphones, computadoras y accesorios",
          imagen:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
          categoria: "Tecnología",
          ubicacion: "Norte",
          telefono: "+1 234-567-8902",
          estado: "abierto",
          totalProductos: 128,
          productosDestacados: [
            {
              id: 4,
              nombre: "iPhone 15",
              precio: 999.0,
              imagen:
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100",
            },
            {
              id: 5,
              nombre: "MacBook Pro",
              precio: 1299.0,
              imagen:
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100",
            },
            {
              id: 6,
              nombre: "AirPods Pro",
              precio: 249.0,
              imagen:
                "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100",
            },
          ],
        },
        {
          id: 3,
          nombre: "Moda Elegante",
          descripcion:
            "Ropa de moda para hombres y mujeres, las últimas tendencias en un solo lugar",
          imagen:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400",
          categoria: "Moda",
          ubicacion: "Sur",
          telefono: "+1 234-567-8903",
          estado: "cerrado",
          totalProductos: 89,
          productosDestacados: [
            {
              id: 7,
              nombre: "Vestido Elegante",
              precio: 79.99,
              imagen:
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100",
            },
            {
              id: 8,
              nombre: "Blazer Ejecutivo",
              precio: 129.99,
              imagen:
                "https://images.unsplash.com/photo-1593032949719-fb7d29812774?w=100",
            },
            {
              id: 9,
              nombre: "Zapatos Formales",
              precio: 89.99,
              imagen:
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100",
            },
          ],
        },
        {
          id: 4,
          nombre: "Delicias Caseras",
          descripcion:
            "Comida casera preparada con amor, platos tradicionales y postres artesanales",
          imagen:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
          categoria: "Restaurante",
          ubicacion: "Centro",
          telefono: "+1 234-567-8904",
          estado: "abierto",
          totalProductos: 67,
          productosDestacados: [
            {
              id: 10,
              nombre: "Paella Valenciana",
              precio: 15.99,
              imagen:
                "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=100",
            },
            {
              id: 11,
              nombre: "Tarta de Chocolate",
              precio: 6.99,
              imagen:
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100",
            },
            {
              id: 12,
              nombre: "Ensalada César",
              precio: 8.99,
              imagen:
                "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=100",
            },
          ],
        },
        {
          id: 5,
          nombre: "Librería Sabiduría",
          descripcion:
            "Libros para todos los gustos, desde bestsellers hasta textos académicos especializados",
          imagen:
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
          categoria: "Librería",
          ubicacion: "Este",
          telefono: "+1 234-567-8905",
          estado: "abierto",
          totalProductos: 234,
          productosDestacados: [
            {
              id: 13,
              nombre: "El Alquimista",
              precio: 12.99,
              imagen:
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100",
            },
            {
              id: 14,
              nombre: "1984",
              precio: 10.99,
              imagen:
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100",
            },
            {
              id: 15,
              nombre: "Cien Años de Soledad",
              precio: 14.99,
              imagen:
                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100",
            },
          ],
        },
        {
          id: 6,
          nombre: "Farmacia Vida",
          descripcion:
            "Tu farmacia de confianza, medicamentos, productos de cuidado personal y consultas",
          imagen:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
          categoria: "Farmacia",
          ubicacion: "Oeste",
          telefono: "+1 234-567-8906",
          estado: "abierto",
          totalProductos: 156,
          productosDestacados: [
            {
              id: 16,
              nombre: "Vitamina C",
              precio: 8.99,
              imagen:
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100",
            },
            {
              id: 17,
              nombre: "Protector Solar",
              precio: 12.99,
              imagen:
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100",
            },
            {
              id: 18,
              nombre: "Termómetro Digital",
              precio: 15.99,
              imagen:
                "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100",
            },
          ],
        },
      ],

      categorias: [
        { id: "cafeteria", nombre: "Cafetería", icono: "fas fa-coffee" },
        { id: "tecnologia", nombre: "Tecnología", icono: "fas fa-laptop" },
        { id: "moda", nombre: "Moda", icono: "fas fa-tshirt" },
        { id: "restaurante", nombre: "Restaurante", icono: "fas fa-utensils" },
        { id: "libreria", nombre: "Librería", icono: "fas fa-book" },
        { id: "farmacia", nombre: "Farmacia", icono: "fas fa-pills" },
      ],

      categoriasPopulares: [
        { id: "restaurante", nombre: "Restaurantes", icono: "fas fa-utensils" },
        { id: "tecnologia", nombre: "Tecnología", icono: "fas fa-laptop" },
        { id: "moda", nombre: "Moda", icono: "fas fa-tshirt" },
        { id: "cafeteria", nombre: "Cafeterías", icono: "fas fa-coffee" },
      ],

      ubicaciones: ["Centro", "Norte", "Sur", "Este", "Oeste"],
    };
  },

  computed: {
    negociosFiltrados() {
      let resultado = [...this.negocios];

      // Filtro por búsqueda
      if (this.filtros.busqueda) {
        const busqueda = this.filtros.busqueda.toLowerCase();
        resultado = resultado.filter(
          (negocio) =>
            negocio.nombre.toLowerCase().includes(busqueda) ||
            negocio.descripcion.toLowerCase().includes(busqueda) ||
            negocio.categoria.toLowerCase().includes(busqueda)
        );
      }

      // Filtro por categoría
      if (this.filtros.categoria) {
        resultado = resultado.filter(
          (negocio) =>
            negocio.categoria.toLowerCase() ===
            this.filtros.categoria.toLowerCase()
        );
      }

      // Filtro por ubicación
      if (this.filtros.ubicacion) {
        resultado = resultado.filter(
          (negocio) => negocio.ubicacion === this.filtros.ubicacion
        );
      }

      // Filtro solo abiertos
      if (this.filtros.soloAbiertos) {
        resultado = resultado.filter((negocio) => negocio.estado === "abierto");
      }

      // Filtro con productos
      if (this.filtros.conProductos) {
        resultado = resultado.filter((negocio) => negocio.totalProductos > 0);
      }

      return resultado;
    },

    negociosPaginados() {
      const inicio = (this.paginaActual - 1) * this.negociosPorPagina;
      const fin = inicio + this.negociosPorPagina;
      return this.negociosFiltrados.slice(inicio, fin);
    },

    totalPaginas() {
      return Math.ceil(this.negociosFiltrados.length / this.negociosPorPagina);
    },

    totalNegocios() {
      return this.negocios.length;
    },

    totalProductos() {
      return this.negocios.reduce(
        (total, negocio) => total + negocio.totalProductos,
        0
      );
    },

    hayFiltrosAplicados() {
      return (
        this.filtros.busqueda ||
        this.filtros.categoria ||
        this.filtros.ubicacion ||
        this.filtros.soloAbiertos ||
        this.filtros.conProductos
      );
    },
  },

  methods: {
    toggleFiltros() {
      this.mostrarFiltros = !this.mostrarFiltros;
    },

    aplicarFiltros() {
      this.paginaActual = 1; // Resetear a la primera página
      // Los filtros se aplican automáticamente por los computed properties
    },

    filtrarPorCategoria(categoriaId) {
      this.filtros.categoria =
        this.filtros.categoria === categoriaId ? "" : categoriaId;
      this.aplicarFiltros();
    },

    limpiarFiltros() {
      this.filtros = {
        busqueda: "",
        categoria: "",
        ubicacion: "",
        soloAbiertos: false,
        conProductos: false,
      };
      this.paginaActual = 1;
    },

    paginaAnterior() {
      if (this.paginaActual > 1) {
        this.paginaActual--;
      }
    },

    paginaSiguiente() {
      if (this.paginaActual < this.totalPaginas) {
        this.paginaActual++;
      }
    },

    verNegocio(negocio) {
      // Simular navegación a la tienda del negocio
      const shopId = btoa(negocio.id.toString()); // Encriptar ID
      const shopName = encodeURIComponent(
        negocio.nombre.toLowerCase().replace(/\s+/g, "-")
      );

      // Simular navegación - en una app real usarías this.$router.push()
      console.log(`Navegando a: /tienda/${shopId}/${shopName}`);
      alert(`Navegando a la tienda de: ${negocio.nombre}`);

      // En una aplicación real:
      // this.$router.push(`/tienda/${shopId}/${shopName}`);
    },

    contactarNegocio(negocio) {
      // Simular contacto con el negocio
      console.log("Contactando negocio:", negocio);
      alert(`Contactando a ${negocio.nombre}: ${negocio.telefono}`);
    },
  },
};
</script>

<style scoped>
/* Reset y estilos base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.marketplace-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #fafafa;
  min-height: 100vh;
  color: #333;
}

/* Header del Marketplace */
.marketplace-header {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 2rem 1rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.marketplace-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.marketplace-title i {
  font-size: 1.75rem;
}

.marketplace-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
}

.btn-registrar-negocio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-registrar-negocio:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Sección de búsqueda */
.search-section {
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 2rem 1rem;
}

.search-content {
  margin: 0 auto;
}

.search-container {
  margin-bottom: 1.5rem;
}

.search-input-group {
  position: relative;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #999;
  font-size: 1rem;
  z-index: 2;
}

.search-input {
  flex: 1;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.btn-buscar {
  padding: 1rem 1.5rem;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.btn-buscar:hover {
  background-color: #555;
}

.filtros-rapidos {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filtro-rapido {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #f8f8f8;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filtro-rapido:hover {
  background-color: #f0f0f0;
  color: #333;
}

.filtro-rapido.activo {
  background-color: #333;
  color: white;
  border-color: #333;
}

.filtro-rapido i {
  font-size: 0.8rem;
}

/* Sección de estadísticas */
.stats-section {
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 2rem 1rem;
}

.stats-content {
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.stat-item i {
  font-size: 2rem;
  color: #3498db;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Contenido principal */
.contenido-principal {
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  padding: 2rem 1rem;
}

/* Filtros Sidebar - similar al componente original */
.filtros-sidebar {
  width: 280px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
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

.filtro-opcion input[type="radio"],
.filtro-opcion input[type="checkbox"] {
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

.checkmark-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 3px;
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

.filtro-opcion input[type="checkbox"]:checked + .checkmark-checkbox {
  border-color: #333;
  background-color: #333;
}

.filtro-opcion input[type="checkbox"]:checked + .checkmark-checkbox::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
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

/* Contenido de negocios */
.negocios-contenido {
  flex: 1;
}

.negocios-toolbar {
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

.vista-controles {
  display: flex;
  gap: 0.5rem;
}

.btn-vista {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-vista:hover {
  border-color: #333;
  color: #333;
}

.btn-vista.activo {
  background-color: #333;
  color: white;
  border-color: #333;
}

.negocios-contador {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.negocios-contador i {
  color: #999;
  font-size: 0.8rem;
}

/* Grid de Negocios */
.negocios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.negocios-grid.vista-lista {
  grid-template-columns: 1fr;
}

.negocio-card {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.negocio-card:hover {
  border-color: #ccc;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.vista-lista .negocio-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
}

.negocio-imagen {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f8f8;
}

.vista-lista .negocio-imagen {
  height: auto;
  min-height: 200px;
}

.negocio-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.negocio-estado {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
}

.negocio-estado.abierto {
  color: #28a745;
}

.negocio-estado.cerrado {
  color: #dc3545;
}

.negocio-estado i {
  font-size: 0.6rem;
}

.negocio-overlay {
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

.negocio-card:hover .negocio-overlay {
  opacity: 1;
}

.negocio-overlay i {
  color: white;
  font-size: 1.5rem;
}

.negocio-info {
  padding: 1.5rem;
}

.negocio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.negocio-nombre {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  line-height: 1.3;
  margin: 0;
}

.negocio-categoria {
  background-color: #f8f8f8;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.negocio-descripcion {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.negocio-detalles {
  margin-bottom: 1rem;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.detalle-item i {
  color: #999;
  width: 14px;
  font-size: 0.8rem;
}

.negocio-productos-preview {
  margin-bottom: 1.5rem;
}

.negocio-productos-preview h5 {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.75rem;
}

.productos-preview {
  display: flex;
  gap: 0.5rem;
}

.producto-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.producto-preview img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  margin-bottom: 0.25rem;
}

.producto-preview-info {
  display: flex;
  flex-direction: column;
}

.producto-preview-nombre {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.125rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-preview-precio {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.negocio-acciones {
  display: flex;
  gap: 0.75rem;
}

.btn-ver-tienda {
  flex: 1;
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

.btn-ver-tienda:hover {
  background-color: #555;
}

.btn-ver-tienda i {
  font-size: 0.8rem;
}

.btn-contactar {
  padding: 0.75rem 1rem;
  background-color: #f8f8f8;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-contactar:hover {
  background-color: #f0f0f0;
  color: #333;
}

.btn-contactar i {
  font-size: 0.8rem;
}

/* Sin negocios */
.sin-negocios {
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

.sin-negocios-icono {
  margin-bottom: 2rem;
}

.sin-negocios-icono i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 0;
}

.sin-negocios-contenido {
  width: 100%;
}

.sin-negocios h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
}

.sin-negocios p {
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
  margin: 0 1rem;
  font-size: 0.9rem;
  color: #666;
}

/* Filtros overlay para móvil */
.filtros-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 998;
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .marketplace-title {
    font-size: 1.5rem;
  }

  .stats-content {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-item {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .search-input-group {
    max-width: 100%;
  }

  .filtros-rapidos {
    gap: 0.75rem;
  }

  .filtro-rapido {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
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
    display: block;
  }

  .negocios-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .negocios-grid.vista-lista {
    grid-template-columns: 1fr;
  }

  .vista-lista .negocio-card {
    grid-template-columns: 1fr;
  }

  .negocios-toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .vista-controles {
    justify-content: center;
  }

  .paginacion {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-paginacion {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .marketplace-title {
    font-size: 1.25rem;
  }

  .marketplace-subtitle {
    font-size: 0.9rem;
  }

  .stats-content {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .filtros-sidebar {
    width: 100%;
  }

  .negocio-card {
    margin-bottom: 1rem;
  }

  .negocio-info {
    padding: 1rem;
  }

  .negocio-acciones {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-contactar {
    width: 100%;
  }

  .sin-negocios {
    padding: 3rem 1.5rem;
    margin: 1rem 0;
    min-height: 300px;
  }

  .sin-negocios-icono i {
    font-size: 3rem;
  }

  .sin-negocios h3 {
    font-size: 1.25rem;
  }
}
</style>
