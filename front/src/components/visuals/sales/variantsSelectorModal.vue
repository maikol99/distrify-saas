<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Seleccionar Variante</h3>
        <button @click="closeModal" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="product" class="product-info">
          <h4>{{ product.name }}</h4>
          <p class="price">{{ formatPrice(product.sellPrice) }}</p>
        </div>

        <div v-if="availableSizes.length > 0" class="variant-section">
          <label>Talla:</label>
          <div class="variant-options">
            <button
              v-for="size in availableSizes"
              :key="size"
              @click="selectSize(size)"
              :class="['variant-btn', { active: selectedVariants.size === size }]"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div v-if="availableColors.length > 0" class="variant-section">
          <label>Color:</label>
          <div class="variant-options">
            <button
              v-for="color in availableColors"
              :key="color"
              @click="selectColor(color)"
              :class="['variant-btn', { active: selectedVariants.color === color }]"
            >
              {{ color }}
            </button>
          </div>
        </div>

        <div v-if="selectedVariantStock !== null" class="stock-info">
          <p :class="['stock', { 'low-stock': selectedVariantStock <= 0 }]">
            Stock disponible: {{ selectedVariantStock }}
          </p>
        </div>

        <div class="quantity-section">
          <label>Cantidad:</label>
          <div class="quantity-controls">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
            <input 
              v-model.number="quantity" 
              type="number" 
              min="1" 
              :max="selectedVariantStock || 1"
            />
            <button 
              @click="increaseQuantity" 
              :disabled="quantity >= (selectedVariantStock || 1)"
            >+</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">Cancelar</button>
        <button 
          @click="addToCart" 
          :disabled="!canAddToCart"
          class="btn-add"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import numeral from 'numeral';

export default {
  name: 'VariantSelectorModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    },
    selectedVariants: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'select-variant', 'add-to-cart'],
  setup(props, { emit }) {
    const quantity = ref(1);

    const availableSizes = computed(() => {
      if (!props.product?.sizesAndColors) return [];
      return [...new Set(props.product.sizesAndColors.map(v => v.size))];
    });

    const availableColors = computed(() => {
      if (!props.product?.sizesAndColors) return [];
      const sizes = props.selectedVariants.size ? [props.selectedVariants.size] : availableSizes.value;
      return [...new Set(
        props.product.sizesAndColors
          .filter(v => sizes.includes(v.size))
          .map(v => v.color)
      )];
    });

    const selectedVariantStock = computed(() => {
      if (!props.selectedVariants.size || !props.selectedVariants.color) return null;
      
      const variant = props.product?.sizesAndColors?.find(v => 
        v.size === props.selectedVariants.size && v.color === props.selectedVariants.color
      );
      
      return variant ? variant.quantity : 0;
    });

    const canAddToCart = computed(() => {
      return props.selectedVariants.size && 
             props.selectedVariants.color && 
             selectedVariantStock.value > 0 &&
             quantity.value > 0 &&
             quantity.value <= selectedVariantStock.value;
    });

    watch(() => props.selectedVariants, () => {
      quantity.value = 1;
    }, { deep: true });

    const selectSize = (size) => {
      emit('select-variant', 'size', size);
    };

    const selectColor = (color) => {
      emit('select-variant', 'color', color);
    };

    const increaseQuantity = () => {
      if (quantity.value < (selectedVariantStock.value || 1)) {
        quantity.value++;
      }
    };

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };

    const addToCart = () => {
      if (canAddToCart.value) {
        emit('add-to-cart', {
          variants: props.selectedVariants,
          quantity: quantity.value
        });
      }
    };

    const closeModal = () => {
      emit('close');
    };

    const formatPrice = (value) => {
      return numeral(value).format('$0.00');
    };

    return {
      quantity,
      availableSizes,
      availableColors,
      selectedVariantStock,
      canAddToCart,
      selectSize,
      selectColor,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      closeModal,
      formatPrice
    };
  }
};
</script>

<style scoped>
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
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 1.25rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1rem;
}

.product-info {
  margin-bottom: 1.5rem;
  text-align: center;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #10b981;
  margin: 0;
}

.variant-section {
  margin-bottom: 1.5rem;
}

.variant-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.variant-btn:hover {
  border-color: #f9931e;
}

.variant-btn.active {
  border-color: #f9931e;
  background-color: #f9931e;
  color: white;
}

.stock-info {
  margin-bottom: 1rem;
}

.stock {
  font-weight: 500;
  color: #10b981;
  margin: 0;
}

.stock.low-stock {
  color: #ef4444;
}

.quantity-section {
  margin-bottom: 1rem;
}

.quantity-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-controls button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-controls button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-controls input {
  width: 4rem;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-add {
  padding: 0.5rem 1rem;
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-add:hover:not(:disabled) {
  background-color: #e8851e;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
