<template>
  <div class="carrito-overlay" @click="goBack()">
    <div class="carrito-modal" @click.stop>
      <button @click="goBack()" class="btn-cerrar-carrito">
        <i class="fas fa-times"></i>
      </button>

      <div class="carrito-contenido">
        <!-- Header del carrito -->
        <div class="carrito-header">
          <h2 class="carrito-titulo">
            <i class="fas fa-shopping-cart"></i>
            Tu Carrito
            <span v-if="totalItems > 0" class="items-count"
              >({{ totalItems }}
              {{ totalItems === 1 ? "item" : "items" }})</span
            >
          </h2>
        </div>

        <!-- Lista de productos -->
        <div v-if="carrito.length > 0" class="carrito-productos">
          <div
            v-for="(item, index) in carrito"
            :key="`${item.productId}-${item.variants?.[0]?.size || ''}-${
              item.variants?.[0]?.color || ''
            }`"
            class="producto-carrito"
          >
            <div class="producto-imagen">
              <img
                :src="item.imageUrl || '/placeholder-image.jpg'"
                :alt="item.name"
              />
            </div>

            <div class="producto-info">
              <h4 class="producto-nombre">{{ item.name }}</h4>

              <div
                v-if="item.variants && item.variants.length > 0"
                class="producto-variantes"
              >
                <span class="variante-item">
                  <i class="fas fa-tshirt"></i> {{ item.variants[0].size }}
                </span>
                <span class="variante-item">
                  <i class="fas fa-palette"></i> {{ item.variants[0].color }}
                </span>
              </div>

              <div class="producto-precio">
                <i class="fas fa-dollar-sign"></i>
                {{ (item.sellPrice || 0).toFixed(2) }}
              </div>
            </div>

            <div class="producto-cantidad">
              <div class="cantidad-controles">
                <button
                  @click="disminuirCantidad(index)"
                  class="btn-cantidad"
                  :disabled="item.quantity <= 1"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="cantidad-display">{{ item.quantity }}</span>
                <button
                  @click="aumentarCantidad(index)"
                  class="btn-cantidad"
                  :disabled="item.quantity >= getMaxStock(item)"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>

              <div class="subtotal">
                ${{ (item.sellPrice * item.quantity).toFixed(2) }}
              </div>
            </div>

            <button @click="eliminarItem(index)" class="btn-eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Carrito vacío -->
        <div v-else class="carrito-vacio">
          <i class="fas fa-shopping-cart"></i>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega algunos productos para comenzar</p>
        </div>

        <!-- Resumen y checkout -->
        <div v-if="carrito.length > 0" class="carrito-resumen">
          <div class="total-carrito">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>

            <div
              v-if="
                ecommerceStore.client.deliveryType === 'Delivery' &&
                ecommerceStore.shopData.delivery
              "
              class="total-line"
            >
              <span>Envío:</span>
              <span>
                {{ formatPrice(ecommerceStore.shopData.deliveryPrice) }}
              </span>
            </div>

            <div class="total-line total-final">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Proceso de checkout -->
          <div class="checkout-proceso">
            <!-- Paso 1: Método de entrega -->
            <div v-show="pasoActual === 1" class="paso-checkout">
              <h3 class="paso-titulo">
                <i class="fas fa-truck"></i>
                ¿Cómo quieres recibir tu pedido?
              </h3>

              <div class="opciones-entrega">
                <label
                  class="opcion-entrega"
                  v-if="ecommerceStore.shopData.delivery"
                  :class="{
                    active: ecommerceStore.client.deliveryType === 'Delivery',
                  }"
                >
                  <input
                    type="radio"
                    v-model="ecommerceStore.client.deliveryType"
                    value="Delivery"
                    name="entrega"
                    @change="ecommerceStore.calcularTotal()"
                  />
                  <div
                    @click="ecommerceStore.calcularTotal"
                    class="opcion-contenido"
                  >
                    <i class="fas fa-shipping-fast"></i>
                    <div>
                      <strong>Envío a domicilio</strong>
                      <small>Te lo enviamos donde estés</small>
                    </div>
                  </div>
                </label>

                <label
                  class="opcion-entrega"
                  :class="{
                    active: ecommerceStore.client.deliveryType === 'Retiro',
                  }"
                >
                  <input
                    type="radio"
                    v-model="ecommerceStore.client.deliveryType"
                    value="Retiro"
                    name="entrega"
                    @change="ecommerceStore.calcularTotal()"
                  />
                  <div class="opcion-contenido">
                    <i class="fas fa-store"></i>
                    <div>
                      <strong>Retiro en tienda</strong>
                      <small>Retíralo cuando quieras</small>
                    </div>
                  </div>
                </label>
              </div>

              <button
                @click="siguientePaso"
                class="btn-continuar"
                :disabled="!ecommerceStore.client.deliveryType"
              >
                Continuar
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>

            <!-- Paso 2: Método de pago -->
            <div v-show="pasoActual === 2" class="paso-checkout">
              <h3 class="paso-titulo">
                <i class="fas fa-credit-card"></i>
                ¿Cómo quieres pagar?
              </h3>

              <div class="opciones-pago">
                <label
                  v-if="ecommerceStore.hasMercadoPagoToken === true"
                  class="opcion-pago"
                  :class="{
                    active:
                      ecommerceStore.client.paymentType === 'Mercado Pago',
                  }"
                >
                  <input
                    type="radio"
                    v-model="ecommerceStore.client.paymentType"
                    value="Mercado Pago"
                    name="pago"
                  />
                  <div class="opcion-contenido">
                    <i class="fab fa-cc-mastercard"></i>
                    <div>
                      <strong>Mercado Pago</strong>
                      <small>Tarjeta, transferencia o efectivo</small>
                    </div>
                  </div>
                </label>

                <label
                  class="opcion-pago"
                  :class="{
                    active: ecommerceStore.client.paymentType === 'Presencial',
                  }"
                >
                  <input
                    type="radio"
                    v-model="ecommerceStore.client.paymentType"
                    value="Presencial"
                    name="pago"
                  />
                  <div class="opcion-contenido">
                    <i class="fas fa-money-bill-wave"></i>
                    <div>
                      <strong>Pago presencial</strong>
                      <small>Todos los medios de pago</small>
                    </div>
                  </div>
                </label>
              </div>

              <div class="paso-botones">
                <button @click="pasoAnterior" class="btn-volver">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
                <button
                  @click="siguientePaso"
                  class="btn-continuar"
                  :disabled="!ecommerceStore.client.paymentType"
                >
                  Continuar
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Paso 3: Datos del cliente -->
            <div v-show="pasoActual === 3" class="paso-checkout">
              <h3 class="paso-titulo">
                <i class="fas fa-user"></i>
                Tus datos
              </h3>

              <div class="formulario-datos">
                <div class="campo-grupo">
                  <label class="campo-label">
                    <i class="fas fa-user"></i> Nombre completo *
                  </label>
                  <input
                    type="text"
                    v-model="ecommerceStore.client.name"
                    class="campo-input"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div class="campo-grupo">
                  <label class="campo-label">
                    <i class="fas fa-envelope"></i> Email *
                  </label>
                  <input
                    type="email"
                    v-model="ecommerceStore.client.email"
                    class="campo-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div class="campo-grupo">
                  <label class="campo-label">
                    <i class="fas fa-phone"></i> Teléfono *
                  </label>
                  <input
                    type="tel"
                    v-model="ecommerceStore.client.phone"
                    class="campo-input"
                    placeholder="Tu número de teléfono"
                    required
                  />
                </div>

                <!-- Campos adicionales para envío -->
                <div
                  v-if="ecommerceStore.client.deliveryType === 'Delivery'"
                  class="datos-envio"
                >
                  <h4 class="seccion-titulo">
                    <i class="fas fa-map-marker-alt"></i>
                    Dirección de envío
                  </h4>

                  <div class="campo-grupo">
                    <label class="campo-label">Dirección *</label>
                    <input
                      type="text"
                      v-model="ecommerceStore.client.address"
                      class="campo-input"
                      placeholder="Calle y número"
                      required
                    />
                  </div>

                  <div class="campos-fila">
                    <div class="campo-grupo">
                      <label class="campo-label">Ciudad *</label>
                      <input
                        type="text"
                        v-model="ecommerceStore.client.city"
                        class="campo-input"
                        placeholder="Ciudad"
                        required
                      />
                    </div>

                    <div class="campo-grupo">
                      <label class="campo-label">Código Postal</label>
                      <input
                        type="text"
                        v-model="ecommerceStore.client.postalCode"
                        class="campo-input"
                        placeholder="CP"
                      />
                    </div>
                  </div>

                  <div class="campo-grupo">
                    <label class="campo-label">Referencias adicionales</label>
                    <textarea
                      v-model="ecommerceStore.client.references"
                      class="campo-textarea"
                      placeholder="Referencias para encontrar tu dirección (opcional)"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="paso-botones">
                <button @click="pasoAnterior" class="btn-volver">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
                <button
                  @click="finalizarCompra"
                  class="btn-finalizar"
                  :disabled="!formularioValido || procesandoCompra"
                >
                  <i v-if="procesandoCompra" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-check"></i>
                  {{ procesandoCompra ? "Procesando..." : "Finalizar Compra" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEcommerceStore } from "@/stores/ecommerceStore";
import { useProfileStore } from "@/stores/profileStore";
import { useSalesStore } from "@/stores/salesStore";
import numeral from "numeral";

export default {
  name: "CarritoCompleto",
  components: {},

  data() {
    return {
      profileStore: useProfileStore(),
      ecommerceStore: useEcommerceStore(),
      salesStore: useSalesStore(),
      pasoActual: 1,
      metodoEntrega: "",
      metodoPago: "",
      procesandoCompra: false,
    };
  },

  computed: {
    carrito() {
      return this.ecommerceStore.carrito || [];
    },

    totalItems() {
      return this.carrito.reduce((total, item) => total + item.quantity, 0);
    },

    subtotal() {
      return this.ecommerceStore.subtotal;
    },

    total() {
      return this.ecommerceStore.total;
    },

    // Usamos los datos de cliente de la store
    datosCliente() {
      return this.ecommerceStore.client;
    },

    formularioValido() {
      const basico =
        this.datosCliente.name &&
        this.datosCliente.email &&
        this.datosCliente.phone;

      if (this.ecommerceStore.client.deliveryType === "Delivery") {
        return basico && this.datosCliente.address && this.datosCliente.city;
      }

      return basico;
    },
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    formatPrice(price) {
      return numeral(price).format("$0.00");
    },
    async disminuirCantidad(index) {
      const item = this.carrito[index];
      if (item.quantity > 1) {
        await this.ecommerceStore.updateCartItemQuantity(
          index,
          item.quantity - 1
        );
      }
    },

    async aumentarCantidad(index) {
      const item = this.carrito[index];
      const maxStock = this.getMaxStock(item);
      if (item.quantity < maxStock) {
        await this.ecommerceStore.updateCartItemQuantity(
          index,
          item.quantity + 1
        );
      }
    },

    async eliminarItem(index) {
      if (
        confirm(
          "¿Estás seguro de que quieres eliminar este producto del carrito?"
        )
      ) {
        await this.ecommerceStore.removeFromCart(index);
      }
    },

    getMaxStock(item) {
      // Lógica para obtener el stock máximo según si tiene variantes o no
      if (item.variants && item.variants.length > 0) {
        return item.variants[0].quantity || 0;
      }
      return item.stock || 99;
    },

    siguientePaso() {
      if (this.pasoActual < 3) {
        this.pasoActual++;
      }
    },

    pasoAnterior() {
      if (this.pasoActual > 1) {
        this.pasoActual--;
      }
    },

    async finalizarCompra() {
      if (!this.formularioValido) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
      }

      this.procesandoCompra = true;

      try {
        // Actualizamos los datos de cliente en la store con el método de entrega
        if (this.metodoEntrega === "retiro") {
          this.ecommerceStore.client.address = "";
          this.ecommerceStore.client.city = "";
          this.ecommerceStore.client.postalCode = "";
          this.ecommerceStore.client.references = "";
        }

        if (this.ecommerceStore.client.paymentType === "Mercado Pago") {
          await this.ecommerceStore.createMPOrder();
          await this.ecommerceStore.createPedido();

          await this.ecommerceStore.clearCart();
          this.$router.push("/pedido-exitoso");
          this.resetearFormulario();
        } else {
          await this.ecommerceStore.createPedido();
          await this.ecommerceStore.clearCart();
          this.$router.push("/pedido-exitoso");
          this.resetearFormulario();
        }
      } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert(
          "Hubo un error al procesar tu compra. Por favor, intenta nuevamente."
        );
      } finally {
        this.procesandoCompra = false;
      }
    },

    resetearFormulario() {
      this.pasoActual = 1;
      this.metodoEntrega = "";
      this.metodoPago = "";
      // Opcionalmente puedes limpiar los datos del cliente aquí
      // this.limpiarDatosCliente();
    },

    // Método opcional para limpiar los datos del cliente
    limpiarDatosCliente() {
      this.ecommerceStore.client = {
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        references: "",
      };
    },
  },
  async mounted(){
    await this.ecommerceStore.getMercadoPagoAccessToken(this.ecommerceStore.shopId)
  }
};
</script>

<style scoped>
.carrito-overlay {
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

.carrito-modal {
  background-color: white;
  border-radius: 8px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #e5e5e5;
}

.btn-cerrar-carrito {
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

.btn-cerrar-carrito:hover {
  background-color: #f0f0f0;
  color: #333;
}

.carrito-contenido {
  padding: 2rem;
}

.carrito-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 1rem;
}

.carrito-titulo {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.carrito-titulo i {
  color: #666;
}

.items-count {
  font-size: 1rem;
  color: #666;
  font-weight: 400;
}

/* Productos en carrito */
.carrito-productos {
  margin-bottom: 1.5rem;
}

.producto-carrito {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}

.producto-imagen {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #ddd;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-info {
  flex: 1;
}

.producto-nombre {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 0.5rem 0;
}

.producto-variantes {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.variante-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.variante-item i {
  font-size: 0.7rem;
}

.producto-precio {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.producto-precio i {
  font-size: 0.9rem;
  color: #666;
}

.producto-cantidad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.cantidad-controles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cantidad {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
  font-size: 0.8rem;
}

.btn-cantidad:hover:not(:disabled) {
  border-color: #333;
  color: #333;
}

.btn-cantidad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad-display {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
  font-size: 0.9rem;
}

.subtotal {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.btn-eliminar {
  background-color: #dc3545;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.btn-eliminar:hover {
  background-color: #c82333;
}

/* Carrito vacío */
.carrito-vacio {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.carrito-vacio i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.carrito-vacio h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

/* Resumen del carrito */
.carrito-resumen {
  border-top: 2px solid #e5e5e5;
  padding-top: 1.5rem;
}

.total-carrito {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.total-line:last-child {
  margin-bottom: 0;
}

.total-final {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

/* Checkout */
.checkout-proceso {
  margin-top: 1.5rem;
}

.paso-checkout {
  margin-bottom: 1.5rem;
}

.paso-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.paso-titulo i {
  color: #666;
}

/* Opciones de entrega y pago */
.opciones-entrega,
.opciones-pago {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.opcion-entrega,
.opcion-pago {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.opcion-entrega.active,
.opcion-pago.active {
  border-color: #28a745;
  background-color: #f8fff9;
}

.opcion-entrega input,
.opcion-pago input {
  position: absolute;
  opacity: 0;
}

.opcion-contenido {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.opcion-contenido i {
  font-size: 1.5rem;
  color: #666;
  width: 30px;
  text-align: center;
}

.opcion-entrega.active .opcion-contenido i,
.opcion-pago.active .opcion-contenido i {
  color: #28a745;
}

.opcion-contenido strong {
  display: block;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.25rem;
}

.opcion-contenido small {
  color: #666;
  font-size: 0.8rem;
}

/* Formulario de datos */
.formulario-datos {
  margin-bottom: 1.5rem;
}

.campo-grupo {
  margin-bottom: 1rem;
}

.campo-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.campo-label i {
  color: #666;
  font-size: 0.8rem;
  width: 12px;
}

.campo-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.campo-input:focus {
  outline: none;
  border-color: #333;
}

.campo-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.campo-textarea:focus {
  outline: none;
  border-color: #333;
}

.datos-envio {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
}

.seccion-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seccion-titulo i {
  color: #666;
  font-size: 0.9rem;
}

.campos-fila {
  display: flex;
  gap: 1rem;
}

.campos-fila .campo-grupo {
  flex: 1;
}

/* Botones */
.btn-continuar,
.btn-finalizar {
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

.btn-continuar:hover:not(:disabled),
.btn-finalizar:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
}

.btn-continuar:disabled,
.btn-finalizar:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.btn-volver {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-volver:hover {
  background-color: #5a6268;
}

.paso-botones {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.paso-botones .btn-continuar,
.paso-botones .btn-finalizar {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .carrito-modal {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .carrito-contenido {
    padding: 1.5rem;
  }

  .producto-carrito {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .producto-imagen {
    width: 100%;
    height: 150px;
    max-width: 200px;
    align-self: center;
  }

  .producto-info {
    width: 100%;
    text-align: center;
  }

  .producto-variantes {
    justify-content: center;
  }

  .producto-cantidad {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .btn-eliminar {
    align-self: center;
  }

  .carrito-titulo {
    font-size: 1.5rem;
  }

  .campos-fila {
    flex-direction: column;
    gap: 0;
  }

  .paso-botones {
    flex-direction: column;
  }

  .paso-botones .btn-volver {
    order: 2;
  }

  .paso-botones .btn-continuar,
  .paso-botones .btn-finalizar {
    order: 1;
  }
}

@media (max-width: 480px) {
  .carrito-contenido {
    padding: 1rem;
  }

  .carrito-titulo {
    font-size: 1.25rem;
  }

  .producto-carrito {
    padding: 0.75rem;
  }

  .producto-imagen {
    height: 120px;
  }

  .opciones-entrega,
  .opciones-pago {
    gap: 0.5rem;
  }

  .opcion-entrega,
  .opcion-pago {
    padding: 0.75rem;
  }

  .opcion-contenido i {
    font-size: 1.25rem;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.paso-checkout {
  animation: fadeIn 0.3s ease-out;
}

/* Estados de carga */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
