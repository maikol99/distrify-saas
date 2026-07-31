import api from "@/config/axios.config";
import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";

export const useProfileStore = defineStore("profile", {
  state: () => {
    return {
      user: null,
      shop: null,
      loading: false,
      globalStore: useGlobalStore(),
    };
  },
  getters: {
    userInitials: (state) => {
      if (!state.user?.username) return "U";
      const username = state.user.username.trim();
      return username.substring(0, 3).toUpperCase();
    },
    avatarColor: (state) => {
      if (!state.user?.username) return "#6b7280";
      const colors = [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#eab308",
        "#84cc16",
        "#22c55e",
        "#10b981",
        "#06b6d4",
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
        "#ec4899",
        "#f43f5e",
      ];
      let hash = 0;
      for (let i = 0; i < state.user.username.length; i++) {
        hash = state.user.username.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
  },
  actions: {
    async fetchUserData() {
      try {
        this.loading = true;
        const userId = this.globalStore.userId();
        const response = await api.get(`/users/get/get-user/${userId}`);
        const data = response.data;
        console.log("User data fetched:", data);
        if (data.success) {
          this.user = data.user;
        } else {
          alert(data.message || "Error al obtener datos de usuario.");
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        alert("Error de red o servidor al obtener datos de usuario.");
        throw error;
      }
    },
    async fetchShopData() {
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();
        const response = await api.get(`/shops/get/get-shop-by-id/${shopId}`);
        const data = response.data;
        console.log("data", data);
        if (data.success) {
          this.shop = data.data;
        } else {
          alert(data.message || "Error al obtener datos de la tienda.");
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        alert("Error de red o servidor al obtener datos de la tienda.");
        throw error;
      }
    },
    async updateShopSettings(shopId, updatedShopData) {
      try {
        this.loading = true;
        const response = await api.patch(
          `/shops/patch/update-shop-by-id/${shopId}`,
          updatedShopData
        );
        const data = response.data;
        if (data.success) {
          this.shop = { ...this.shop, ...data.data };
        } else {
          alert(
            data.message || "Error al actualizar la configuración de la tienda."
          );
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        alert("Error de red o servidor al actualizar la tienda.");
        throw error;
      }
    },
    async linkMercadoPagoAccount(shopId, accessToken) {
      try {
        this.loading = true;
        const response = await api.post(`/mercado-pago/post/link-account`, {
          shopId,
          accessToken,
        });
        const data = response.data;
        // El backend retorna un objeto con 'message' cuando vincula correctamente
        if (data && (data.ok || data.success || data.mercadoPagoData || data.message)) {
          alert("Cuenta de Mercado Pago vinculada exitosamente.");
          return true; // Indica éxito
        } else {
          alert(data?.message || "Error al vincular la cuenta de Mercado Pago.");
          return false; // Indica fallo
        }
      } catch (error) {
        this.loading = false;
        alert("Error de red o servidor al vincular Mercado Pago.");
        return false; // Indica fallo
      } finally {
        this.loading = false;
      }
    },
    async getMercadoPagoAccessToken(shopId) {
      try {
        this.loading = true;
        const response = await api.get(
          `/mercado-pago/get/get-access-token?shopId=${shopId}`
        );
        const data = response.data;
        if (data.success) {
          return data.accessToken;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error fetching Mercado Pago Access Token:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    // Nueva acción para desvincular la cuenta de Mercado Pago (DELETE)
    async unlinkMercadoPagoAccount(shopId) {
      try {
        this.loading = true;

        const response = await api.delete(
          `/mercado-pago/delete/unlink-account?shopId=${shopId}`
        );
        const data = response.data;
        if (data.success) {
          alert("Cuenta de Mercado Pago desvinculada exitosamente.");
          return true; // Indica éxito
        } else {
          alert(
            data.message || "Error al desvincular la cuenta de Mercado Pago."
          );
          return false; // Indica fallo
        }
      } catch (error) {
        alert("Error de red o servidor al desvincular Mercado Pago.");
        return false; // Indica fallo
      } finally {
        this.loading = false;
      }
    },
    async initialize() {
      try {
        await this.fetchUserData();
      } catch (error) {
        console.error("Error initializing user profile store:", error);
        throw error;
      }
    },
    resetState() {
      this.user = null;
      this.loading = false;
    },
  },
});
