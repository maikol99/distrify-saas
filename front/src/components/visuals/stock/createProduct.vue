<template>
  <!-- Boton para volver -->
  <div class="product-creator-container">
    <div style="margin-bottom: 10px">
      <button @click="$router.go(-1)" class="btn-secondary">
        <i class="fas fa-arrow-left"></i>
        Volver
      </button>
    </div>
    <div class="form-container">
      <form @submit.prevent="createProduct" class="product-form">
        <!-- Información básica -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-info-circle"></i>
            Información Básica
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre del Producto *</label>
              <input id="name" v-model="product.name" type="text" class="form-control" :class="{ error: errors.name }"
                placeholder="Ingresa el nombre del producto" required />
              <span v-if="errors.name" class="error-message">{{
                errors.name
              }}</span>
            </div>
            <div class="form-group">
              <label for="code">Código del Producto *</label>
              <input id="code" v-model="product.code" type="text" class="form-control" :class="{ error: errors.code }"
                placeholder="Código único del producto" required />
              <span v-if="errors.code" class="error-message">{{
                errors.code
              }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea id="description" v-model="product.description" class="form-control" rows="3"
                placeholder="Descripción detallada del producto"></textarea>
            </div>
            <div class="form-group">
              <label for="supplier">Proveedor</label>
              <select id="supplier" v-model="product.supplierId" class="form-control">
                <option value="">Selecciona un proveedor</option>
                <option v-for="supplier in suppliers" :key="supplier._id" :value="supplier._id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Categoría*</label>
              <select id="category" v-model="product.categoryId" class="form-control">
                <option value="">Selecciona una categoría</option>
                <option v-for="category in categories" :key="category._id" :value="category._id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="category">¿Mostrar en tienda?</label>
              <select id="category" v-model="product.showInStore" class="form-control">
                <option :value="null">Seleccionar...</option>
                <option :value="true">Sí</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Precios -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-dollar-sign"></i>
            Información de Precios
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label for="buyPrice">Precio de Compra</label>
              <input id="buyPrice" v-model.number="product.buyPrice" @input="updatePricesFromBuyPrice" type="number"
                step="0.01" min="0" class="form-control" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label for="utilidad">Utilidad (%)</label>
              <input id="utilidad" v-model.number="product.utilidad" @input="updatePricesFromUtility" type="number"
                step="0.01" min="0" class="form-control" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label for="sellPrice">Precio de Venta *</label>
              <input id="sellPrice" v-model.number="product.sellPrice" @input="updatePricesFromSellPrice" type="number"
                step="0.01" min="0" class="form-control" :class="{ error: errors.sellPrice }" placeholder="0.00"
                required />
              <span v-if="errors.sellPrice" class="error-message">{{
                errors.sellPrice
              }}</span>
            </div>
          </div>
        </div>

        <!-- Inventario -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-boxes"></i>
            Control de Inventario
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Stock *</label>
              <input id="quantity" v-model.number="product.quantity" type="number" min="0" class="form-control"
                :class="{ error: errors.quantity }" placeholder="0" required />
              <span v-if="errors.quantity" class="error-message">{{
                errors.quantity
              }}</span>
            </div>
            <div class="form-group">
              <label for="minQuantity">Stock Mínimo</label>
              <input id="minQuantity" v-model.number="product.minQuantity" type="number" min="0" class="form-control"
                placeholder="0" />
            </div>
            <div class="form-group">
              <label for="maxQuantity">Stock Máximo</label>
              <input id="maxQuantity" v-model.number="product.maxQuantity" type="number" min="0" class="form-control"
                placeholder="0" />
            </div>
          </div>
        </div>
        <!-- Sección de Imágenes -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-images"></i>
            Imágenes del Producto
          </h3>

          <!-- Aviso sobre tiempo de carga -->
          <div class="upload-notice">
            <div class="notice-content">
              <i class="fas fa-info-circle notice-icon"></i>
              <p class="notice-text">
                <strong>Nota:</strong> La carga de imágenes puede tardar unos
                segundos. Las imágenes se vincularán automáticamente al producto
                cuando lo crees.
              </p>
            </div>
          </div>

          <!-- Área de carga de imágenes -->
          <div class="image-upload-section">
            <div class="upload-area">
              <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect" class="file-input"
                id="imageUpload" :disabled="uploadingImages" />
              <label for="imageUpload" class="upload-label" :class="{ disabled: uploadingImages }">
                <div class="upload-content">
                  <i class="fas fa-cloud-upload-alt upload-icon"></i>
                  <p class="upload-text">
                    {{
                      uploadingImages
                        ? "Subiendo imágenes..."
                        : "Haz clic aquí o arrastra las imágenes"
                    }}
                  </p>
                  <p class="upload-subtext">
                    Formatos soportados: JPG, PNG, GIF (máx. 5MB cada una)
                  </p>
                </div>
              </label>
            </div>

            <!-- Botón para subir imágenes seleccionadas -->
            <div v-if="selectedFiles.length > 0" class="selected-files-section">
              <h4 class="files-title">
                Archivos seleccionados ({{ selectedFiles.length }}):
              </h4>
              <div class="selected-files-list">
                <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file-item">
                  <div class="file-preview">
                    <img :src="getFilePreview(file)" :alt="file.name" class="file-thumbnail" />
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{
                      formatFileSize(file.size)
                    }}</span>
                  </div>
                  <button type="button" @click="removeSelectedFile(index)" class="btn-remove-file"
                    title="Eliminar archivo" :disabled="uploadingImages">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="upload-actions">
                <button type="button" @click="uploadSelectedImages" class="btn-upload" :disabled="uploadingImages">
                  <i class="fas fa-upload" v-if="!uploadingImages"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ uploadingImages ? "Subiendo..." : "Subir Imágenes" }}
                </button>
                <button type="button" @click="clearSelectedFiles" class="btn-clear" :disabled="uploadingImages">
                  <i class="fas fa-trash"></i>
                  Limpiar
                </button>
              </div>
            </div>

            <!-- Indicador de progreso de subida -->
            <div v-if="uploadingImages" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p class="progress-text">
                Subiendo imagen {{ currentUploadIndex }} de
                {{ totalUploadImages }}...
              </p>
            </div>
          </div>

          <!-- Galería de imágenes subidas -->
          <div v-if="product.images.length > 0" class="uploaded-images-section">
            <h4 class="images-title">
              Imágenes que se vincularán al producto ({{
                product.images.length
              }}):
            </h4>
            <div class="images-gallery">
              <div v-for="(image, index) in product.images" :key="index" class="image-item">
                <div class="image-container">
                  <img :src="image.secure_url" :alt="`Imagen ${index + 1}`" class="product-image"
                    @click="openImageModal(image.secure_url)" />
                  <div class="image-overlay">
                    <button type="button" @click="openImageModal(image.secure_url)" class="btn-view"
                      title="Ver imagen completa">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" @click="removeImage(index)" class="btn-delete" title="Eliminar imagen"
                      :disabled="uploadingImages">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="image-info">
                  <span class="image-number">Imagen {{ index + 1 }}</span>
                  <span class="image-status">✓ Lista para vincular</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Talles y Colores -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-palette"></i>
            Variantes de producto
          </h3>
          <p class="description">
            Al agregar crear o editar variantes de un producto, tu stock se
            vincula automaticamente con el de las variantes para que no te
            tengas que preocupar de nada más que vender.
          </p>
          <div class="sizes-colors-container">
            <!-- Formulario para agregar nuevo talle/color -->
            <div class="add-size-color-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="newSize">Talle/Variante</label>
                  <input id="newSize" v-model="newSizeColor.size" type="text" class="form-control"
                    placeholder="Ej: S, M, L, XL" />
                </div>
                <div class="form-group">
                  <label for="newColor">Color/Variante</label>
                  <input id="newColor" v-model="newSizeColor.color" type="text" class="form-control"
                    placeholder="Ej: Rojo, Azul, Verde" />
                </div>
                <div class="form-group">
                  <label for="newQuantity">Cantidad</label>
                  <input id="newQuantity" v-model.number="newSizeColor.quantity"
                    @input="calculateStockFromSizesAndColors" type="number" min="0" class="form-control"
                    placeholder="0" />
                </div>
                <div class="form-group">
                  <label>&nbsp;</label>
                  <button type="button" @click="addSizeColor" class="btn-add" :disabled="!canAddSizeColor">
                    <i class="fas fa-plus"></i>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
            <!-- Lista de talles y colores agregados -->
            <div v-if="product.sizesAndColors.length > 0" class="sizes-colors-list">
              <h4 class="list-title">Combinaciones agregadas:</h4>
              <div class="sizes-colors-grid">
                <div v-for="(item, index) in product.sizesAndColors" :key="index" class="size-color-item">
                  <div class="item-info">
                    <span class="size-badge">{{ item.size }}</span>
                    <span class="color-badge">{{ item.color }}</span>
                    <span class="quantity-badge">Cant: {{ item.quantity }}</span>
                  </div>
                  <div class="item-actions">
                    <button type="button" @click="editSizeColor(index)" class="btn-edit" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" @click="removeSizeColor(index)" class="btn-remove" title="Eliminar">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="total-quantity">
                <strong>Cantidad total: {{ totalSizesColorsQuantity }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-calendar"></i>
            Fechas y Vencimiento
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label for="expirationDate">Fecha de Vencimiento</label>
              <input id="expirationDate" v-model="product.expirationDate" type="date" class="form-control" />
            </div>
            <div class="form-group">
              <label for="expirationAlert">Alerta de Vencimiento (días)</label>
              <input id="expirationAlert" v-model.number="product.expirationAlert" type="number" min="1"
                class="form-control" placeholder="30" />
            </div>
          </div>
        </div>

        <!-- Listas de Precios -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-list"></i>
            Listas de Precios
            <button type="button" class="btn-toggle-price-lists" @click="showingPriceLists = !showingPriceLists">
              {{ showingPriceLists ? "Ocultar listas" : "Mostrar listas" }}
            </button>
          </h3>
          <div v-if="showingPriceLists" class="price-lists-container">
            <!-- Selector de lista de precios -->
            <div class="form-group">
              <label for="priceListSelector">Seleccionar Lista de Precios</label>
              <select id="priceListSelector" v-model="selectedPriceListIndex" class="form-control">
                <option v-for="(priceList, index) in product.priceLists" :key="index" :value="index">
                  {{ priceList.listName }}
                </option>
              </select>
            </div>
            <!-- Contenido de la lista de precios seleccionada -->
            <div v-if="selectedPriceListIndex !== null" class="price-list-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Precio Compra</label>
                  <input v-model.number="product.priceLists[selectedPriceListIndex].buyPrice
                    " @input="updatePriceListFromBuyPrice" type="number" step="0.01" min="0" class="form-control"
                    placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label>Utilidad (%)</label>
                  <input v-model.number="product.priceLists[selectedPriceListIndex].utility
                    " @input="updatePriceListFromUtility" type="number" step="0.01" min="0" class="form-control"
                    placeholder="0.00" />
                </div>

                <div class="form-group">
                  <label>Precio</label>
                  <input v-model.number="product.priceLists[selectedPriceListIndex].price
                    " @input="updatePriceListFromPrice" type="number" step="0.01" min="0" class="form-control"
                    placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label>Cant. Mínima</label>
                  <input v-model.number="product.priceLists[selectedPriceListIndex].minQuantity
                    " type="number" min="0" class="form-control"
                    placeholder="0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn-secondary" :disabled="loading || uploadingImages">
            <i class="fas fa-undo"></i>
            Limpiar Formulario
          </button>
          <button type="submit" class="btn-primary" :disabled="loading || uploadingImages">
            <i class="fas fa-save" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ loading ? "Creando producto..." : "Crear Producto" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="success-modal">
        <div class="modal-header">
          <i class="fas fa-check-circle success-icon"></i>
          <h3>¡Producto Creado!</h3>
        </div>
        <div class="modal-body">
          <p>El producto "{{ product.name }}" ha sido creado exitosamente.</p>
          <p v-if="product.images.length > 0" class="images-linked-text">
            <i class="fas fa-images"></i>
            {{ product.images.length }} imagen(es) vinculada(s) correctamente.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeSuccessModal" class="btn-primary">
            Aceptar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para ver imagen completa -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="image-modal" @click.stop>
        <div class="image-modal-header">
          <h3>Vista previa de imagen</h3>
          <button @click="closeImageModal" class="btn-close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="image-modal-body">
          <img :src="selectedImageUrl" alt="Vista previa" class="modal-image" />
        </div>
      </div>
    </div>
  </div>
  <toastComponent v-if="productStore.toast.showing" :message="productStore.toast.message"
    :state="productStore.toast.state" :duration="1500" :auto-close="true"></toastComponent>
</template>

<script>
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import { useStockStore } from "@/stores/stockStore";
import toastComponent from "../toast/toastComponent.vue";

export default {
  name: "ProductCreator",
  components: {
    toastComponent,
  },
  data() {
    return {
      showingPriceLists: false,
      store: useGlobalStore(),
      globalStore: useGlobalStore(),
      productStore: useStockStore(),
      loading: false,
      showSuccessModal: false,
      showImageModal: false,
      selectedImageUrl: "",
      uploadingImages: false,
      selectedFiles: [],
      uploadProgress: 0,
      currentUploadIndex: 0,
      totalUploadImages: 0,
      errors: {},
      selectedPriceListIndex: 0,
      editingIndex: -1, // Para controlar si estamos editando un talle/color
      newSizeColor: {
        size: "",
        color: "",
        quantity: 0,
      },
      product: {
        name: "",
        description: "",
        sellPrice: null,
        utilidad: null,
        buyPrice: null,
        quantity: null,
        minQuantity: 0,
        maxQuantity: 0,
        supplierId: "",
        code: "",
        category: "",
        showInStore: false,
        imagenUrl: "",
        expirationDate: "",
        expirationAlert: 30,
        categoryId: "",
        sizesAndColors: [], // Nueva propiedad para talles y colores
        images: [], // Nueva propiedad para imágenes
        priceLists: [
          {
            listName: "Lista 1",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 2",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 3",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 4",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 5",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 6",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 7",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 8",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 9",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 10",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
        ],
      },
      categories: [],
      suppliers: [],
    };
  },
  computed: {
    canAddSizeColor() {
      return (
        this.newSizeColor.size.trim() !== "" &&
        this.newSizeColor.color.trim() !== "" &&
        this.newSizeColor.quantity >= 0
      );
    },
    totalSizesColorsQuantity() {
      return this.product.sizesAndColors.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },
  },
  methods: {
    // Métodos para manejo de imágenes
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.selectedFiles = [];

      files.forEach((file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
          alert(`El archivo ${file.name} no es una imagen válida`);
          return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB`);

          return;
        }

        this.selectedFiles.push(file);
      });
    },

    getFilePreview(file) {
      return URL.createObjectURL(file);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    removeSelectedFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    clearSelectedFiles() {
      this.selectedFiles = [];
      this.$refs.fileInput.value = "";
    },

    async uploadSelectedImages() {
      if (this.selectedFiles.length === 0) return;

      this.uploadingImages = true;
      this.totalUploadImages = this.selectedFiles.length;
      this.currentUploadIndex = 0;
      this.uploadProgress = 0;

      try {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          this.currentUploadIndex = i + 1;
          this.uploadProgress = ((i + 1) / this.totalUploadImages) * 100;

          const file = this.selectedFiles[i];
          const formData = new FormData();
          formData.append("file", file);

          const response = await api.post(
            "/products/post/upload-image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data) {
            this.product.images.push({
              secure_url: response.data.secure_url,
              public_id: response.data.public_id,
            });
          }
        }

        // Limpiar archivos seleccionados después de subir
        this.clearSelectedFiles();
        alert(
          "Imágenes subidas correctamente y listas para vincular al producto"
        );
      } catch (error) {
        console.error("Error al subir imágenes:", error);
        alert("Error al subir las imágenes");
      } finally {
        this.uploadingImages = false;
        this.uploadProgress = 0;
        this.currentUploadIndex = 0;
        this.totalUploadImages = 0;
      }
    },

    async removeImage(index) {
      if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
        return;
      }

      try {
        const image = this.product.images[index];

        // Eliminar de Cloudinary
        await api.delete(`/products/delete/delete-image/${image.public_id}`);

        // Eliminar del array local
        this.product.images.splice(index, 1);

        alert("Imagen eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar imagen:", error);
        alert("Error al eliminar la imagen");
      }
    },

    openImageModal(imageUrl) {
      this.selectedImageUrl = imageUrl;
      this.showImageModal = true;
    },

    closeImageModal() {
      this.showImageModal = false;
      this.selectedImageUrl = "";
    },

    // Métodos para talles y colores
    addSizeColor() {
      if (!this.canAddSizeColor) return;
      // Verificar si ya existe la combinación
      const exists = this.product.sizesAndColors.some(
        (item) =>
          item.size.toLowerCase() === this.newSizeColor.size.toLowerCase() &&
          item.color.toLowerCase() === this.newSizeColor.color.toLowerCase()
      );
      if (exists) {
        alert("Esta combinación de talle y color ya existe");
        return;
      }
      if (this.editingIndex >= 0) {
        // Estamos editando
        this.product.sizesAndColors[this.editingIndex] = {
          ...this.newSizeColor,
        };
        this.editingIndex = -1;
      } else {
        // Estamos agregando nuevo
        this.product.sizesAndColors.push({ ...this.newSizeColor });
      }
      this.calculateStockFromSizesAndColors();
      this.resetNewSizeColor();
    },
    editSizeColor(index) {
      this.newSizeColor = { ...this.product.sizesAndColors[index] };
      this.editingIndex = index;
    },
    removeSizeColor(index) {
      if (confirm("¿Estás seguro de que quieres eliminar esta combinación?")) {
        this.product.sizesAndColors.splice(index, 1);
      }
    },
    resetNewSizeColor() {
      this.newSizeColor = {
        size: "",
        color: "",
        quantity: 0,
      };
    },

    // Métodos para actualizar precios principales
    updatePricesFromBuyPrice() {
      if (this.product.buyPrice && this.product.utilidad) {
        this.product.sellPrice =
          this.product.buyPrice * (1 + this.product.utilidad / 100);
        this.product.sellPrice = Math.round(this.product.sellPrice * 100) / 100;
      }
    },

    updatePricesFromUtility() {
      if (this.product.buyPrice && this.product.utilidad) {
        this.product.sellPrice =
          this.product.buyPrice * (1 + this.product.utilidad / 100);
        this.product.sellPrice = Math.round(this.product.sellPrice * 100) / 100;
      }
    },

    updatePricesFromSellPrice() {
      if (
        this.product.sellPrice &&
        this.product.buyPrice &&
        this.product.buyPrice > 0
      ) {
        this.product.utilidad =
          ((this.product.sellPrice - this.product.buyPrice) /
            this.product.buyPrice) *
          100;
        this.product.utilidad = Math.round(this.product.utilidad * 100) / 100;
      }
    },

    // Métodos para actualizar precios en listas de precios
    updatePriceListFromBuyPrice() {
      const currentList = this.product.priceLists[this.selectedPriceListIndex];
      if (currentList.buyPrice && currentList.utility) {
        currentList.price =
          currentList.buyPrice * (1 + currentList.utility / 100);
        currentList.price = Math.round(currentList.price * 100) / 100;
      }
    },

    updatePriceListFromUtility() {
      const currentList = this.product.priceLists[this.selectedPriceListIndex];
      if (currentList.buyPrice && currentList.utility) {
        currentList.price =
          currentList.buyPrice * (1 + currentList.utility / 100);
        currentList.price = Math.round(currentList.price * 100) / 100;
      }
    },
    updatePriceListFromIva() {
      const currentList = this.product.priceLists[this.selectedPriceListIndex];
      if (currentList.price && currentList.iva) {
        currentList.priceWithIva =
          currentList.price * (1 + currentList.iva / 100);
        currentList.priceWithIva =
          Math.round(currentList.priceWithIva * 100) / 100;
      }
    },

    updatePriceListFromPrice() {
      const currentList = this.product.priceLists[this.selectedPriceListIndex];
      if (
        currentList.price &&
        currentList.buyPrice &&
        currentList.buyPrice > 0
      ) {
        currentList.utility =
          ((currentList.price - currentList.buyPrice) / currentList.buyPrice) *
          100;
        currentList.utility = Math.round(currentList.utility * 100) / 100;
      }
    },

    validateForm() {
      this.errors = {};
      if (!this.product.name.trim()) {
        this.errors.name = "El nombre del producto es requerido";
      }
      if (!this.product.code.trim()) {
        this.errors.code = "El código del producto es requerido";
      }
      if (!this.product.sellPrice || this.product.sellPrice <= 0) {
        this.errors.sellPrice = "El precio de venta debe ser mayor a 0";
      }
      if (!this.product.quantity && this.product.quantity !== 0) {
        this.errors.quantity = "La cantidad inicial es requerida";
      }
      return Object.keys(this.errors).length === 0;
    },

    async createProduct() {
      if (!this.validateForm()) {
        return;
      }

      // Verificar si hay imágenes en proceso de subida
      if (this.uploadingImages) {
        alert(
          "Por favor espera a que terminen de subirse las imágenes antes de crear el producto."
        );
        return;
      }

      this.loading = true;
      try {
        const shopId = this.store.shopId();
        console.log("shopId:", shopId);

        if (this.product.showInStore === undefined) {
          this.product.showInStore = false; // Asegurar que showInStore tenga un valor por defecto
        } else {
          this.product.showInStore = this.product.showInStore ? true : false; // Asegurar que sea booleano
        }

        // Crear el producto con las imágenes ya vinculadas
        const productData = {
          ...this.product,
          creationDate: new Date(),
          userName: "Usuario Actual",
          createdOffline: false,
          updatedOffline: false,
          shopId: shopId,
        };

        //Si el categoryId no está definido, no enviarlo
        if (!this.product.categoryId) {
          this.productStore.toast = {
            showing: true,
            message: "La categoría es obligatoria",
            state: "danger",
          };
          return;
        }

        const response = await api.post(
          "/products/post/create-product",
          productData
        );
        const data = response.data;
        if (data.success) {
          console.log("Producto creado exitosamente con imágenes vinculadas");
          this.showSuccessModal = true;
        } else {
          alert("Error al crear el producto: " + data.message);
        }
      } catch (error) {
        console.error("Error al crear producto:", error);
        alert("Error al crear el producto. Por favor intenta nuevamente.");
      } finally {
        this.loading = false;
      }
    },

    async getAllCategories() {
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/categories/get/get-categories-by-shop/${shopId}?page=1&limit=200`
        );
        if (response.data.success) {
          this.categories = response.data.categories;
        } else {
          console.error("Error al obtener categorías:", response.data.message);
        }
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        this.loading = false;
      }
    },
    async getAllSuppliers() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/suppliers/get/all-suppliers/${shopId}?page=1&limit=200`
        );
        if (response.data.success) {
          this.suppliers = response.data.suppliers;
        } else {
          console.error("Error al obtener proveedores:", response.data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    calculateStockFromSizesAndColors() {
      this.product.quantity = this.product.sizesAndColors.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },

    resetForm() {
      this.product = {
        name: "",
        description: "",
        sellPrice: 0,
        utilidad: 0,
        buyPrice: 0,
        quantity: 0,
        minQuantity: 0,
        maxQuantity: 0,
        code: "",
        category: "",
        imagenUrl: "",
        expirationDate: "",
        expirationAlert: 30,
        categoryId: "",
        sizesAndColors: [], // Resetear talles y colores
        images: [], // Resetear imágenes
        priceLists: [
          {
            listName: "Lista 1",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 2",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 3",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 4",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 5",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 6",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 7",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 8",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 9",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
          {
            listName: "Lista 10",
            price: 0,
            buyPrice: 0,
            utility: 0,
            iva: 0,
            minQuantity: 0,
          },
        ],
      };
      this.selectedPriceListIndex = 0;
      this.resetNewSizeColor();
      this.editingIndex = -1;
      this.errors = {};
      this.clearSelectedFiles();
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.$router.go(-1);
    },
  },

  async mounted() {
    await this.getAllCategories();
    await this.getAllSuppliers();
  },
};
</script>

<style scoped>
.description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.btn-toggle-price-lists {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.product-creator-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
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

.product-form {
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
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
  min-height: 80px;
}

/* Aviso sobre tiempo de carga */
.upload-notice {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.notice-icon {
  color: #3b82f6;
  font-size: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notice-text {
  color: #1e40af;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Estilos para carga de imágenes */
.image-upload-section {
  display: grid;
  gap: 1.5rem;
}

.upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-label {
  display: block;
  padding: 2rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.upload-label:hover:not(.disabled) {
  border-color: #f9931e;
  background-color: #fef3e2;
}

.upload-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2rem;
  color: #9ca3af;
}

.upload-text {
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-subtext {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.selected-files-section {
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.files-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.selected-files-list {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.selected-file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.file-preview {
  flex-shrink: 0;
}

.file-thumbnail {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-remove-file {
  padding: 0.375rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.btn-remove-file:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-remove-file:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-upload {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  flex: 1;
  justify-content: center;
}

.btn-upload:hover:not(:disabled) {
  background-color: #059669;
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-clear {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-clear:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-clear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Barra de progreso */
.upload-progress {
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #e0e7ff;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #1e40af;
  text-align: center;
  margin: 0;
  font-weight: 500;
}

.uploaded-images-section {
  margin-top: 1.5rem;
}

.images-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.btn-view,
.btn-delete {
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.btn-view {
  background-color: #3b82f6;
  color: white;
}

.btn-view:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-info {
  text-align: center;
}

.image-number {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  display: block;
}

.image-status {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 500;
  display: block;
  margin-top: 0.25rem;
}

/* Modal para ver imagen completa */
.image-modal {
  background-color: white;
  border-radius: 0.5rem;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.image-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.image-modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close-modal {
  padding: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.btn-close-modal:hover {
  background-color: #e5e7eb;
}

.image-modal-body {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: calc(90vh - 100px);
  overflow: hidden;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.375rem;
}

/* Estilos para Talles y Colores */
.sizes-colors-container {
  display: grid;
  gap: 1.5rem;
}

.add-size-color-form {
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.btn-add {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  justify-content: center;
}

.btn-add:hover:not(:disabled) {
  background-color: #059669;
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sizes-colors-list {
  margin-top: 1rem;
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.sizes-colors-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.size-color-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.item-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.size-badge,
.color-badge,
.quantity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.size-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.color-badge {
  background-color: #fef3c7;
  color: #92400e;
}

.quantity-badge {
  background-color: #d1fae5;
  color: #065f46;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-remove {
  padding: 0.375rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.btn-edit {
  background-color: #f59e0b;
  color: white;
}

.btn-edit:hover {
  background-color: #d97706;
}

.btn-remove {
  background-color: #ef4444;
  color: white;
}

.btn-remove:hover {
  background-color: #dc2626;
}

.total-quantity {
  padding: 0.75rem;
  background-color: #e0f2fe;
  border: 1px solid #0891b2;
  border-radius: 0.375rem;
  text-align: center;
  color: #0c4a6e;
}

/* Listas de precios */
.price-lists-container {
  display: grid;
  gap: 1rem;
}

.price-list-content {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
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

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.success-modal {
  background-color: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
}

.modal-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1.25rem 1.25rem 0 0;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
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

.images-linked-text {
  color: #059669;
  font-weight: 500;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  border-radius: 0 0 1.25rem 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .product-creator-container {
    padding: 1rem;
  }

  .product-form {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .size-color-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-info {
    justify-content: center;
  }

  .images-gallery {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .upload-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .images-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
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
</style>
