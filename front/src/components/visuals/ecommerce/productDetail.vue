<template>
  <div class="modal-overlay" @click="$emit('cerrar')">
    <div class="modal-detalle" @click.stop>
      <button @click="$emit('cerrar')" class="btn-cerrar-modal">
        <i class="fas fa-times"></i>
      </button>

      <div class="detalle-contenido">
        <div class="detalle-imagenes">
          <div class="imagen-principal">
            <img :src="imagenPrincipal" :alt="producto.name" />
          </div>

          <div v-if="imagenesAdicionales.length > 0" class="imagenes-miniatura">
            <img
              v-for="(imagen, index) in todasLasImagenes"
              :key="index"
              :src="imagen"
              :alt="`${producto.name} ${index + 1}`"
              class="miniatura"
              :class="{ activa: imagenPrincipal === imagen }"
              @click="cambiarImagenPrincipal(imagen)"
            />
          </div>
        </div>

        <div class="detalle-info">
          <h2 class="detalle-nombre">{{ producto.name }}</h2>

          <div class="detalle-precio">
            <i class="fas fa-dollar-sign"></i>
            {{ (producto.sellPrice || 0).toFixed(2) }}
          </div>

          <div class="detalle-stock" :class="{ 'sin-stock': stockTotal === 0 }">
            <i
              :class="
                stockTotal > 0 ? 'fas fa-check-circle' : 'fas fa-times-circle'
              "
            ></i>
            <span class="stock-texto">
              {{ stockTotal > 0 ? `${stockTotal} disponibles` : "Sin stock" }}
            </span>
          </div>

          <div class="producto-descripcion">
            <h4><i class="fas fa-info-circle"></i> Descripción</h4>
            <p>{{ producto.description }}</p>
          </div>

          <div
            v-if="
              producto.characteristics && producto.characteristics.length > 0
            "
            class="producto-caracteristicas"
          >
            <h4><i class="fas fa-list"></i> Características</h4>
            <ul>
              <li v-for="item in producto.characteristics" :key="item">
                <i class="fas fa-check"></i> {{ item }}
              </li>
            </ul>
          </div>

          <!-- Selector de variantes -->
          <div v-if="tieneVariantes" class="producto-variantes">
            <div class="variante-grupo">
              <label class="variante-label">
                <i class="fas fa-tshirt"></i> Talle
              </label>
              <select
                v-model="talleSeleccionado"
                class="variante-select"
                @change="actualizarColoresDisponibles"
              >
                <option value="">Seleccionar talle</option>
                <option
                  v-for="talle in tallesDisponibles"
                  :key="talle"
                  :value="talle"
                >
                  {{ talle }}
                </option>
              </select>
            </div>

            <div class="variante-grupo">
              <label class="variante-label">
                <i class="fas fa-palette"></i> Color
              </label>
              <select
                v-model="colorSeleccionado"
                class="variante-select"
                :disabled="!talleSeleccionado"
                @change="actualizarStockDisponible"
              >
                <option value="">Seleccionar color</option>
                <option
                  v-for="color in coloresDisponibles"
                  :key="color"
                  :value="color"
                >
                  {{ color }}
                </option>
              </select>
            </div>

            <div v-if="varianteSeleccionada" class="stock-variante">
              <span class="stock-variante-texto">
                Stock disponible: {{ stockVariante }}
              </span>
            </div>

            <!-- Mostrar cantidad ya en carrito para variante específica -->
            <div
              v-if="cantidadEnCarrito > 0 && varianteSeleccionada"
              class="cantidad-en-carrito"
            >
              <span class="cantidad-carrito-texto">
                <i class="fas fa-shopping-cart"></i>
                Ya tienes {{ cantidadEnCarrito }}
                {{ cantidadEnCarrito === 1 ? "unidad" : "unidades" }}
                de esta variante en el carrito
              </span>
            </div>
          </div>

          <!-- Mostrar cantidad ya en carrito para productos sin variantes -->
          <div
            v-if="cantidadEnCarrito > 0 && !tieneVariantes"
            class="cantidad-en-carrito"
          >
            <span class="cantidad-carrito-texto">
              <i class="fas fa-shopping-cart"></i>
              Ya tienes {{ cantidadEnCarrito }}
              {{ cantidadEnCarrito === 1 ? "unidad" : "unidades" }} en el
              carrito
            </span>
          </div>

          <!-- Selector de cantidad -->
          <div class="cantidad-grupo">
            <label class="cantidad-label">
              <i class="fas fa-sort-numeric-up"></i>
              Cantidad
              <span
                v-if="maxCantidad < stockTotal && maxCantidad > 0"
                class="cantidad-disponible"
              >
                (máx. {{ maxCantidad }} disponibles)
              </span>
            </label>
            <div class="cantidad-controles">
              <button
                @click="disminuirCantidad"
                class="btn-cantidad"
                :disabled="cantidad <= 1"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                v-model.number="cantidad"
                type="number"
                min="1"
                :max="maxCantidad"
                class="cantidad-input"
                @input="validarCantidad"
              />
              <button
                @click="aumentarCantidad"
                class="btn-cantidad"
                :disabled="cantidad >= maxCantidad"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <!-- Mensaje de advertencia si está cerca del límite -->
            <div
              v-if="maxCantidad > 0 && maxCantidad <= 3"
              class="advertencia-stock"
            >
              <i class="fas fa-exclamation-triangle"></i>
              {{
                maxCantidad === 1
                  ? "Solo queda 1 unidad disponible"
                  : `Solo quedan ${maxCantidad} unidades disponibles`
              }}
            </div>

            <!-- Mensaje cuando no hay stock disponible para agregar -->
            <div
              v-if="maxCantidad === 0 && stockTotal > 0"
              class="advertencia-stock-agotado"
            >
              <i class="fas fa-info-circle"></i>
              Ya tienes todas las unidades disponibles en tu carrito
            </div>
          </div>

          <!-- Botón agregar al carrito -->
          <div class="acciones-principales">
            <button
              @click="agregarAlCarrito"
              class="btn-agregar-carrito"
              :disabled="!puedeAgregar"
              :class="{
                disabled: !puedeAgregar,
                'maximo-alcanzado': maxCantidad === 0 && stockTotal > 0,
              }"
            >
              <i class="fas fa-shopping-cart"></i>
              {{ textoBotonCarrito }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <toastComponent
  message="Producto agregado al carrito"
  state="success"
  v-if="showingToast"
  ></toastComponent>
</template>

<script>
import { useEcommerceStore } from "@/stores/ecommerceStore";
import toastComponent from "../toast/toastComponent.vue";

export default {
  name: "ProductoDetalle",
  components: {
    toastComponent,
  },
  props: {
    producto: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      showingToast: false,
      imagenPrincipal: "",
      talleSeleccionado: "",
      colorSeleccionado: "",
      cantidad: 1,
      coloresDisponibles: [],
      ecommerceStore: useEcommerceStore(),
    };
  },

  computed: {
    // Compatibilidad con diferentes formatos de imágenes
    imagenPrincipalUrl() {
      if (this.producto.images && this.producto.images.length > 0) {
        return this.producto.images[0].secure_url;
      }
      return this.producto.imagenUrl || this.producto.imageUrl || "";
    },

    imagenesAdicionales() {
      if (this.producto.images && this.producto.images.length > 1) {
        return this.producto.images.slice(1).map((img) => img.secure_url);
      }
      return this.producto.imagenesAdicionales || [];
    },

    todasLasImagenes() {
      const imagenes = [];
      if (this.imagenPrincipalUrl) {
        imagenes.push(this.imagenPrincipalUrl);
      }
      return [...imagenes, ...this.imagenesAdicionales];
    },

    tieneVariantes() {
      return (
        this.producto.sizesAndColors && this.producto.sizesAndColors.length > 0
      );
    },

    tallesDisponibles() {
      if (!this.tieneVariantes) return [];
      const talles = [
        ...new Set(this.producto.sizesAndColors.map((v) => v.size)),
      ];
      return talles.filter((talle) =>
        this.producto.sizesAndColors.some(
          (v) => v.size === talle && v.quantity > 0
        )
      );
    },

    stockTotal() {
      if (this.tieneVariantes) {
        return this.producto.sizesAndColors.reduce(
          (total, variante) => total + variante.quantity,
          0
        );
      }
      return this.producto.stock || this.producto.quantity || 0;
    },

    varianteSeleccionada() {
      if (
        !this.tieneVariantes ||
        !this.talleSeleccionado ||
        !this.colorSeleccionado
      ) {
        return null;
      }
      return this.producto.sizesAndColors.find(
        (v) =>
          v.size === this.talleSeleccionado &&
          v.color === this.colorSeleccionado
      );
    },

    cantidadEnCarrito() {
      if (!this.ecommerceStore.carrito.length) return 0;

      if (
        this.tieneVariantes &&
        this.talleSeleccionado &&
        this.colorSeleccionado
      ) {
        // Buscar variante específica en el carrito
        const itemEnCarrito = this.ecommerceStore.carrito.find(
          (item) =>
            item.productId === this.producto._id &&
            item.variants &&
            item.variants.length > 0 &&
            item.variants[0].size === this.talleSeleccionado &&
            item.variants[0].color === this.colorSeleccionado
        );
        return itemEnCarrito ? itemEnCarrito.quantity : 0;
      } else {
        // Buscar producto sin variantes en el carrito
        const itemEnCarrito = this.ecommerceStore.carrito.find(
          (item) =>
            item.productId === this.producto._id &&
            (!item.variants || item.variants.length === 0)
        );
        return itemEnCarrito ? itemEnCarrito.quantity : 0;
      }
    },

    stockVariante() {
      return this.varianteSeleccionada ? this.varianteSeleccionada.quantity : 0;
    },

    maxCantidad() {
      let stockDisponible;
      if (this.tieneVariantes) {
        stockDisponible = this.stockVariante;
      } else {
        stockDisponible = this.stockTotal;
      }

      return Math.max(0, stockDisponible - this.cantidadEnCarrito);
    },

    // Actualizar puedeAgregar para considerar la cantidad ya en carrito
    puedeAgregar() {
      if (this.stockTotal === 0) return false;
      if (this.maxCantidad === 0) return false;

      if (this.tieneVariantes) {
        return (
          this.talleSeleccionado &&
          this.colorSeleccionado &&
          this.stockVariante > 0 &&
          this.cantidad <= this.maxCantidad
        );
      }
      return this.cantidad <= this.maxCantidad && this.cantidad > 0;
    },

    // Actualizar texto del botón
    textoBotonCarrito() {
      if (this.stockTotal === 0) return "Sin stock";
      if (this.maxCantidad === 0) return "Ya tienes el máximo disponible";
      if (
        this.tieneVariantes &&
        (!this.talleSeleccionado || !this.colorSeleccionado)
      ) {
        return "Seleccionar variante";
      }
      if (!this.puedeAgregar) return "No disponible";
      return "Agregar al carrito";
    },
  },

  methods: {
    cambiarImagenPrincipal(nuevaImagen) {
      this.imagenPrincipal = nuevaImagen;
    },

    actualizarColoresDisponibles() {
      if (!this.talleSeleccionado) {
        this.coloresDisponibles = [];
        this.colorSeleccionado = "";
        return;
      }

      const coloresParaTalle = this.producto.sizesAndColors
        .filter((v) => v.size === this.talleSeleccionado && v.quantity > 0)
        .map((v) => v.color);

      this.coloresDisponibles = [...new Set(coloresParaTalle)];
      this.colorSeleccionado = "";
    },

    actualizarStockDisponible() {
      // Este método se ejecuta cuando cambia el color seleccionado
      // Podría usarse para mostrar información adicional si es necesario
    },

    disminuirCantidad() {
      if (this.cantidad > 1) {
        this.cantidad--;
      }
    },

    aumentarCantidad() {
      if (this.cantidad < this.maxCantidad) {
        this.cantidad++;
      }
    },

    validarCantidad() {
      if (this.cantidad < 1) {
        this.cantidad = 1;
      } else if (this.cantidad > this.maxCantidad) {
        this.cantidad = this.maxCantidad;
      }
    },

    async agregarAlCarrito() {
      if (!this.puedeAgregar) return;

      let productoCarrito = {
        name: this.producto.name,
        productId: this.producto._id,
        quantity: this.cantidad,
        sellPrice: this.producto.sellPrice,
        variants: [],
        imageUrl: this.imagenPrincipalUrl,
      };

      // Agregar información de variantes si existen
      if (this.tieneVariantes) {
        productoCarrito.variants.push({
          size: this.talleSeleccionado,
          color: this.colorSeleccionado,
          quantity: this.stockVariante,
        });
      } else {
        // Para productos sin variantes, agregar el stock total
        productoCarrito.stock = this.stockTotal;
      }

      // Llamar al store y manejar la respuesta
      const resultado = await this.ecommerceStore.addToCart(productoCarrito);

      if (resultado.success) {
        // Mostrar mensaje de éxito
        this.$emit('submit')
        this.cantidad = 1;
      } else {
        if (resultado.maxAllowed > 0) {
          this.cantidad = Math.min(this.cantidad, resultado.maxAllowed);
        }
      }
    },
    aumentarCantidad() {
      if (this.cantidad < this.maxCantidad) {
        this.cantidad++;
      }
    },

    inicializarImagenes() {
      this.imagenPrincipal = this.imagenPrincipalUrl;
    },
  },

  watch: {
    producto: {
      handler(newProducto) {
        this.inicializarImagenes();
        // Resetear selecciones cuando cambia el producto
        this.talleSeleccionado = "";
        this.colorSeleccionado = "";
        this.cantidad = 1;
        this.coloresDisponibles = [];
      },
      immediate: true,
    },
  },

  mounted() {
    this.inicializarImagenes();
  },
};
</script>

<style scoped>
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

.modal-detalle {
  background-color: white;
  border-radius: 8px;
  max-width: 900px;
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

.detalle-contenido {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.detalle-imagenes {
  flex: 1;
  max-width: 400px;
}

.imagen-principal {
  position: relative;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  background-color: #f8f8f8;
}

.imagen-principal img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.imagenes-miniatura {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.miniatura {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.miniatura:hover {
  opacity: 1;
}

.miniatura.activa {
  opacity: 1;
  border-color: #333;
}

.detalle-info {
  flex: 1;
}

.detalle-nombre {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.detalle-precio {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.detalle-precio i {
  font-size: 1.5rem;
  color: #666;
}

.detalle-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  color: #28a745;
  font-weight: 500;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #28a745;
}

.detalle-stock.sin-stock {
  color: #dc3545;
  border-left-color: #dc3545;
}

.detalle-stock i {
  font-size: 0.8rem;
}

/* Estilos para variantes */
.producto-variantes {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.variante-grupo {
  margin-bottom: 1rem;
}

.variante-grupo:last-child {
  margin-bottom: 0;
}

.variante-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.variante-label i {
  color: #666;
  font-size: 0.8rem;
}

.variante-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  transition: border-color 0.2s ease;
}

.variante-select:focus {
  outline: none;
  border-color: #333;
}

.variante-select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.stock-variante {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  border-left: 3px solid #2196f3;
}

.stock-variante-texto {
  font-size: 0.85rem;
  color: #1976d2;
  font-weight: 500;
}

/* Estilos para cantidad */
.cantidad-grupo {
  margin-bottom: 1.5rem;
}

.cantidad-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.cantidad-label i {
  color: #666;
  font-size: 0.8rem;
}

.cantidad-controles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 150px;
}

.btn-cantidad {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
}

.btn-cantidad:hover:not(:disabled) {
  border-color: #333;
  color: #333;
}

.btn-cantidad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  max-width: 60px;
}

.cantidad-input:focus {
  outline: none;
  border-color: #333;
}

/* Estilos para botón de carrito */
.acciones-principales {
  margin-bottom: 2rem;
}

.btn-agregar-carrito {
  width: 100%;
  padding: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-agregar-carrito:hover:not(.disabled) {
  background-color: #218838;
  transform: translateY(-1px);
}

.btn-agregar-carrito.disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-agregar-carrito i {
  font-size: 0.9rem;
}

/* Resto de estilos existentes */
.producto-descripcion,
.producto-caracteristicas {
  margin-bottom: 1.5rem;
}

.producto-descripcion h4,
.producto-caracteristicas h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.producto-descripcion h4 i,
.producto-caracteristicas h4 i {
  color: #666;
  font-size: 0.8rem;
}

.producto-descripcion p {
  color: #666;
  line-height: 1.6;
  font-size: 0.9rem;
}

.producto-caracteristicas ul {
  list-style: none;
  padding: 0;
}

.producto-caracteristicas li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  border-bottom: 1px solid #f0f0f0;
}

.producto-caracteristicas li:last-child {
  border-bottom: none;
}

.producto-caracteristicas li i {
  color: #28a745;
  font-size: 0.8rem;
  width: 12px;
}

.producto-info-adicional {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  font-size: 1rem;
  color: #666;
  width: 20px;
  text-align: center;
}

.info-item div {
  flex: 1;
}

.info-item strong {
  display: block;
  color: #111;
  font-weight: 500;
  margin-bottom: 0.125rem;
  font-size: 0.9rem;
}

.info-item span {
  color: #666;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .detalle-contenido {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .detalle-imagenes {
    max-width: none;
  }

  .imagen-principal img {
    height: 300px;
  }

  .detalle-nombre {
    font-size: 1.5rem;
  }

  .detalle-precio {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .modal-detalle {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .detalle-contenido {
    padding: 1rem;
  }

  .detalle-nombre {
    font-size: 1.25rem;
  }

  .detalle-precio {
    font-size: 1.5rem;
  }

  .cantidad-controles {
    max-width: none;
    width: 100%;
  }
}
</style>
