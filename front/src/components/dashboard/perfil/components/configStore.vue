<template>
  <div class="store-settings-container">
    <div class="settings-header">
      <h2>Configuración de la Tienda</h2>
    </div>
    <div class="content-grid">
      <!-- Estado de la Tienda -->
      <div class="data-table-container">
        <div class="table-header">
          <h3>Estado General</h3>
        </div>
        <div class="info-content">
          <div class="info-item">
            <div class="icon-wrapper">
              <i class="fas fa-store icon"></i>
            </div>
            <div v-if="profileStore.shop" class="info-text">
              <span class="info-label">Tienda Activa</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="profileStore.shop.storeActive"
                  @change="saveShopSettings"
                />
                <span class="slider round"></span>
              </label>
            </div>

       
            <div v-else class="info-text">
              <span class="info-label">Cargando estado de la tienda...</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Configuración de Envíos -->
      <div class="data-table-container">
        <div class="table-header">
          <h3>Envíos</h3>
        </div>
        <div class="info-content">
          <div class="info-item" v-if="profileStore.shop">
            <div class="icon-wrapper">
              <i class="fas fa-truck icon"></i>
            </div>
            <div class="info-text">
              <span class="info-label">Habilitar Envíos</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="profileStore.shop.delivery"
                  @change="saveShopSettings"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div
            class="info-item"
            v-if="profileStore.shop && profileStore.shop.delivery"
          >
            <div class="icon-wrapper">
              <i class="fas fa-dollar-sign icon"></i>
            </div>
            <div class="info-text">
              <span class="info-label">Cobrar Envíos</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="profileStore.shop.deliveryCharge"
                  @change="saveShopSettings"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div
            class="info-item"
            v-if="
              profileStore.shop &&
              profileStore.shop.delivery &&
              profileStore.shop.deliveryCharge
            "
          >
            <div class="icon-wrapper">
              <i class="fas fa-tag icon"></i>
            </div>
            <div class="info-text">
              <span class="info-label">Costo de Envío</span>
              <input
                type="number"
                v-model.number="profileStore.shop.deliveryPrice"
                @input="saveShopSettings"
                class="text-input"
                placeholder="Ej: 5.00"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Link de la Tienda -->
      <div class="data-table-container">
        <div class="table-header">
          <h3>Link de la Tienda</h3>
        </div>
        <div class="info-content">
          <div class="info-item">
            <div class="icon-wrapper">
              <i class="fas fa-link icon"></i>
            </div>
            <div class="info-text">
              <span class="info-label">URL de tu Tienda</span>
              <button @click="generateStoreLink" class="btn-generate-link">
                <i class="fas fa-magic"></i> Generar Link
              </button>
            </div>
          </div>
          <div class="info-item" v-if="storeLink">
            <div class="icon-wrapper">
              <i class="fas fa-share-alt icon"></i>
            </div>
            <div class="info-text link-display-container">
              <span class="info-label">Link Generado</span>
              <input
                type="text"
                :value="storeLink"
                readonly
                class="text-input generated-link-input"
              />
              <button @click="copyLink" class="btn-copy-link">
                <i class="fas fa-copy"></i> Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Imagen de la Tienda -->
      <div class="data-table-container">
        <div class="table-header">
          <h3>Imagen de la Tienda</h3>
        </div>
        <div class="info-content">
          <div class="info-item image-upload-item">
            <div class="icon-wrapper">
              <i class="fas fa-image icon"></i>
            </div>
            <div class="info-text">
              <span class="info-label">Imagen Actual de la Tienda</span>
              <div class="image-preview-container">
                <img
                  v-if="
                    profileStore.shop &&
                    profileStore.shop.shopImage &&
                    profileStore.shop.shopImage.secure_url
                  "
                  :src="profileStore.shop.shopImage.secure_url"
                  alt="Imagen de la Tienda"
                  class="shop-image-preview"
                />
                <div v-else class="no-image-placeholder">
                  <i class="fas fa-store-alt"></i>
                  <span>Sin imagen</span>
                </div>
              </div>
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="file-input"
              />
              <div class="flex gap-2 mt-4">
                <button
                  @click="uploadShopImage"
                  class="btn-generate-link"
                  :disabled="!selectedFile"
                >
                  <i class="fas fa-upload"></i> Subir Imagen
                </button>
                <button
                  @click="deleteShopImage"
                  class="btn-unlink-link"
                  v-if="
                    profileStore.shop &&
                    profileStore.shop.shopImage &&
                    profileStore.shop.shopImage.public_id
                  "
                >
                  <i class="fas fa-trash"></i> Eliminar Imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Integración Mercado Pago (Fuera del grid) -->
    <div class="data-table-container mercadopago-section">
      <div class="table-header">
        <h3>Integración Mercado Pago</h3>
      </div>
      <div class="info-content">
        <div class="info-item">
          <div class="icon-wrapper">
            <i class="fas fa-wallet icon"></i>
          </div>
          <div class="info-text">
            <span class="info-label">Access Token de Mercado Pago</span>
            <div class="flex items-center gap-2 mb-2">
              <input
                :type="isMercadoPagoLinked ? 'password' : 'text'"
                v-model="settings.mercadopagoAccessToken"
                :disabled="isMercadoPagoLinked"
                class="text-input flex-grow"
                placeholder="Ingresa tu access_token"
              />
              <span
                v-if="isMercadoPagoLinked"
                class="text-green-600 font-semibold flex items-center gap-1"
              >
                <i class="fas fa-check-circle text-lg"></i> Vinculado
              </span>
            </div>
            <div class="flex gap-2">
              <button
                v-if="!isMercadoPagoLinked"
                @click="linkMercadoPago"
                class="btn-generate-link"
                :disabled="!settings.mercadopagoAccessToken"
              >
                <i class="fas fa-link"></i> Vincular Cuenta
              </button>
              <button v-else @click="unlinkMercadoPago" class="btn-unlink-link">
                <i class="fas fa-unlink"></i> Desvincular Cuenta
              </button>
            </div>
          </div>
        </div>
        <div class="info-item">
          <div class="icon-wrapper">
            <i class="fas fa-shield-alt icon"></i>
          </div>
          <div class="info-text">
            <span class="info-label">Seguridad</span>
            <span class="info-value security-message">
              Tu Access Token es crucial para procesar pagos. Distrify lo
              almacena de forma segura y encriptada en nuestros servidores, y
              nunca maneja directamente tus datos privados o financieros.
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="icon-wrapper">
            <i class="fas fa-video icon"></i>
          </div>
          <div class="info-text">
            <span class="info-label">Tutorial de Vinculación</span>
            <a
              href="https://www.youtube.com/watch?v=C-zxjjw1DxU&ab_channel=CuyoCode"
              target="_blank"
              rel="noopener noreferrer"
              class="tutorial-link"
            >
              <i class="fab fa-youtube"></i> Ver Tutorial en YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <spinner-component v-if="loading" />
</template>

<script>
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import { useProfileStore } from "@/stores/profileStore";

export default {
  name: "StoreSettings",
  components: {
    spinnerComponent,
  },
  data() {
    return {
      loading: false,
      settings: {
        mercadopagoAccessToken: "",
      },
      storeLink: "",
      profileStore: useProfileStore(),
      isMercadoPagoLinked: false,
      globalStore: useGlobalStore(),
      selectedFile: null, // Nuevo: para almacenar el archivo de imagen seleccionado
    };
  },
  methods: {
    async saveShopSettings() {
      if (this.profileStore.shop) {
        const updatedShopPayload = {
          storeActive: this.profileStore.shop.storeActive,
          delivery: this.profileStore.shop.delivery,
          deliveryCharge: this.profileStore.shop.deliveryCharge,
          deliveryPrice: this.profileStore.shop.deliveryPrice,
          shopImage: this.profileStore.shop.shopImage || {
            secure_url: "",
            public_id: "",
          }, // Incluir shopImage
        };
        try {
          await this.profileStore.updateShopSettings(
            this.profileStore.globalStore.shopId(),
            updatedShopPayload
          );
          console.log("Configuración de tienda enviada a la API.");
        } catch (error) {
          console.error(
            "Fallo al guardar la configuración de la tienda:",
            error
          );
          alert("Fallo al guardar la configuración de la tienda.");
        }
      }
    },
    async handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadShopImage() {
      this.loading = true;
      if (!this.selectedFile) {
        alert("Por favor, selecciona una imagen para subir.");
        return;
      }

      const shopId = this.profileStore.globalStore.shopId();
      if (!shopId) {
        alert("ID de tienda no disponible.");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.selectedFile);

      try {
        // Primero, subir la nueva imagen
        const uploadResponse = await api.post(
          "/products/post/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const data = uploadResponse.data;

        if (!data) {
          throw new Error(
            "No se recibió respuesta de la API al subir la imagen."
          );
        }

        const imageData = data; // { secure_url, public_id }

        // Si hay una imagen antigua, eliminarla primero
        if (
          this.profileStore.shop.shopImage &&
          this.profileStore.shop.shopImage.public_id
        ) {
          await this.deleteImageFromCloudinary(
            this.profileStore.shop.shopImage.public_id
          );
        }

        // Actualizar los datos de la imagen de la tienda
        this.profileStore.shop.shopImage = {
          secure_url: imageData.secure_url,
          public_id: imageData.public_id,
        };

        // Guardar la configuración de la tienda actualizada (incluyendo la nueva información de la imagen)
        await this.saveShopSettings();
        alert("Imagen de la tienda subida y guardada correctamente.");
        this.selectedFile = null; // Limpiar el archivo seleccionado
      } catch (error) {
        console.error("Error al subir la imagen de la tienda:", error);
        alert("Fallo al subir la imagen de la tienda.");
      } finally {
        this.loading = false;
      }
    },
    async deleteImageFromCloudinary(publicId) {
      try {
        const deleteResponse = await api.delete(
          `/products/delete/delete-image/${publicId}`
        );

        if (!deleteResponse.ok) {
          throw new Error(`Error HTTP! estado: ${deleteResponse.status}`);
        }
        console.log("Imagen eliminada de Cloudinary.");
      } catch (error) {
        console.error("Error al eliminar la imagen de Cloudinary:", error);
        // No bloquear el flujo principal si la eliminación de Cloudinary falla, solo registrar.
      }
    },
    async deleteShopImage() {
      this.loading = true;
      if (
        !this.profileStore.shop ||
        !this.profileStore.shop.shopImage ||
        !this.profileStore.shop.shopImage.public_id
      ) {
        alert("No hay imagen de tienda para eliminar.");
        return;
      }

      if (
        !confirm(
          "¿Estás seguro de que quieres eliminar la imagen de la tienda?"
        )
      ) {
        return;
      }

      const publicIdToDelete = this.profileStore.shop.shopImage.public_id;

      try {
        await this.deleteImageFromCloudinary(publicIdToDelete);

        // Limpiar los datos de la imagen en el objeto de la tienda
        this.profileStore.shop.shopImage = {
          secure_url: "",
          public_id: "",
        };

        // Guardar la configuración de la tienda actualizada (sin imagen)
        await this.saveShopSettings();
        alert("Imagen de la tienda eliminada correctamente.");
      } catch (error) {
        console.error("Fallo al eliminar la imagen de la tienda:", error);
        alert("Fallo al eliminar la imagen de la tienda.");
      } finally {
        this.loading = false;
      }
    },
    async linkMercadoPago() {
      const shopId = this.profileStore.globalStore.shopId();
      const accessToken = this.settings.mercadopagoAccessToken;
      if (!shopId) {
        alert("ID de tienda no disponible.");
        return;
      }
      if (!accessToken) {
        alert("Por favor, ingresa el Access Token de Mercado Pago.");
        return;
      }
      try {
        const success = await this.profileStore.linkMercadoPagoAccount(
          shopId,
          accessToken
        );
        if (success) {
          this.isMercadoPagoLinked = true; // Marcar como vinculado al éxito
        }
      } catch (error) {
        console.error("Fallo al vincular la cuenta de Mercado Pago:", error);
        alert("Fallo al vincular la cuenta de Mercado Pago.");
      }
    },
    async unlinkMercadoPago() {
      const shopId = this.profileStore.globalStore.shopId();
      if (!shopId) {
        alert("ID de tienda no disponible para desvincular.");
        return;
      }
      if (
        confirm(
          "¿Estás seguro de que quieres desvincular tu cuenta de Mercado Pago? Esto eliminará tu token de acceso."
        )
      ) {
        try {
          const success = await this.profileStore.unlinkMercadoPagoAccount(
            shopId
          );
          if (success) {
            this.settings.mercadopagoAccessToken = ""; // Limpiar el token localmente
            this.isMercadoPagoLinked = false; // Marcar como no vinculado
          }
        } catch (error) {
          console.error(
            "Fallo al desvincular la cuenta de Mercado Pago:",
            error
          );
          alert("Fallo al desvincular la cuenta de Mercado Pago.");
        }
      }
    },
    async loadSettings() {
      const savedStoreLink = localStorage.getItem("storeLink");
      if (savedStoreLink) {
        this.storeLink = savedStoreLink;
      }
      const shopId = this.profileStore.globalStore.shopId();
      if (shopId) {
        const fetchedToken = await this.profileStore.getMercadoPagoAccessToken(
          shopId
        );
        if (fetchedToken) {
          this.settings.mercadopagoAccessToken = fetchedToken;
          this.isMercadoPagoLinked = true; 
        } else {
          localStorage.removeItem("mercadopagoAccessToken"); // Limpiar por si acaso
          this.settings.mercadopagoAccessToken = "";
          this.isMercadoPagoLinked = false; // Asegurarse de que no esté vinculado
        }
      }
    },
    generateStoreLink() {
      const shopName = encodeURIComponent(this.globalStore.shopData.name);
      console.log("Nombre de la tienda:", this.globalStore.shopData);
      const shopId = this.globalStore.shopId();
      const encryptedShopId = btoa(shopId); // Codificar el ID de la tienda
      const encodedShopId = encodeURIComponent(encryptedShopId);
      console.log("ID de la tienda encriptado:", encryptedShopId);
      console.log("ID de la tienda codificado:", encodedShopId);
      this.storeLink = `https://distrify.com.ar/tienda/${shopName}/${encodedShopId}`;
      console.log("Link de tienda generado:", this.storeLink);
    },
    copyLink() {
      if (this.storeLink) {
        navigator.clipboard
          .writeText(this.storeLink)
          .then(() => {
            alert("Link copiado al portapapeles!");
          })
          .catch((err) => {
            console.error("Error al copiar el link:", err);
            alert("No se pudo copiar el link. Por favor, cópialo manualmente.");
          });
      }
    },
  },
  async mounted() {
    await this.globalStore.fetchShopData();
    await this.profileStore.fetchShopData();
    await this.loadSettings();
  },
};
</script>

<style scoped>
/* ===== Modern configStore styles ===== */
.store-settings-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
}
.settings-header { display: none; }
/* Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

/* Cards */
.data-table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.mercadopago-section { margin-top: 0; }

.table-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.table-header h3 { font-size: 0.9rem; font-weight: 700; color: #111827; margin: 0; }

.info-content { padding: 0.25rem 0; }

.info-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.875rem 1.25rem; border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
}
.info-item:last-child { border-bottom: none; }
.info-item:hover { background: #fafafa; }

.icon-wrapper {
  width: 36px; height: 36px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  background: #eff6ff; color: #3b82f6; flex-shrink: 0;
}
.icon { font-size: 1rem; }
.info-text { display: flex; flex-direction: column; flex-grow: 1; }
.info-label { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3rem; }
.info-value { font-size: 0.875rem; color: #374151; }
.security-message { font-size: 0.8rem; color: #6b7280; line-height: 1.5; }

/* Inputs */
.text-input {
  width: 100%; padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 0.5rem;
  font-size: 0.875rem; color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.text-input:focus { outline: none; border-color: #f9931e; box-shadow: 0 0 0 2px rgba(249,147,30,0.15); }
.text-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

/* Toggle switch */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; margin-left: auto; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; transition: 0.3s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
input:checked + .slider { background: #f9931e; }
input:focus + .slider { box-shadow: 0 0 0 2px rgba(249,147,30,0.25); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

/* Buttons */
.btn-generate-link, .btn-copy-link, .btn-unlink-link {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 0.6rem 1.1rem; border-radius: 0.5rem;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; border: none; white-space: nowrap;
}
.btn-generate-link { background: #f9931e; color: white; }
.btn-generate-link:hover { background: #e8821a; }
.btn-generate-link:disabled { background: #d1d5db; cursor: not-allowed; }
.btn-copy-link { background: #374151; color: white; margin-left: 0.5rem; }
.btn-copy-link:hover { background: #1f2937; }
.btn-unlink-link { background: #fee2e2; color: #dc2626; }
.btn-unlink-link:hover { background: #fecaca; }

.link-display-container { flex-direction: row; align-items: center; gap: 0.5rem; }
.generated-link-input { flex-grow: 1; cursor: text; }

/* Tutorial link */
.tutorial-link {
  display: inline-flex; align-items: center; gap: 0.5rem;
  color: #f9931e; text-decoration: none; font-weight: 600; font-size: 0.875rem;
  transition: color 0.2s;
}
.tutorial-link:hover { color: #e8821a; text-decoration: underline; }
.tutorial-link .fab.fa-youtube { color: #ef4444; }

/* Image preview */
.image-upload-item .info-text { align-items: flex-start; }
.image-preview-container {
  width: 100%; max-width: 180px; height: 130px;
  border: 1px solid #e5e7eb; border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; margin-bottom: 0.75rem; background: #f9fafb;
}
.shop-image-preview { width: 100%; height: 100%; object-fit: contain; display: block; }
.no-image-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9ca3af; text-align: center; gap: 0.25rem; }
.no-image-placeholder .fas { font-size: 2.5rem; }
.no-image-placeholder span { font-size: 0.8rem; }
.file-input { width: 100%; padding: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; background: white; cursor: pointer; }
.file-input::-webkit-file-upload-button { background: #f9931e; color: white; padding: 0.5rem 0.875rem; border: none; border-radius: 0.375rem; cursor: pointer; margin-right: 0.75rem; }

/* Utility helpers from Tailwind used inline */
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.text-green-600 { color: #16a34a; }
.font-semibold { font-weight: 600; }
.text-lg { font-size: 1.125rem; }
.flex-grow { flex-grow: 1; }
.items-center { align-items: center; }

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .link-display-container { flex-direction: column; align-items: flex-start; }
  .btn-copy-link { margin-left: 0; margin-top: 0.5rem; width: 100%; }
  .info-item { flex-wrap: wrap; }
  .switch { margin-left: 0; margin-top: 0.5rem; }
}
</style>
