import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";

export const useShopStore = defineStore("shopStore", {
  state: () => {
    return {
      shopData: {},
      globalStore: useGlobalStore(),
      loading: false,
      toastInfo: {
        showing: false,
        message: "",
        state: "",
      },
    };
  },
  actions: {
    async getShopData() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.get(`/shops/get/get-shop-by-id/${shopId}`);
        const data = response.data;

        if (data.success) {
          this.shopData = data.data;
        } else {
          console.log("Error al obtener los datos de la tienda");

          this.toastInfo = {
            showing: true,
            message: data.message,
            state: "danger",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async updateShop() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.patch(
          `/shops/patch/update-shop-by-id/${shopId}`,
          this.shopData
        );
        const data = response.data;

        if (data.success) {
          this.shopData = data.data;
          this.toastInfo = {
            showing: true,
            message: "Datos de la tienda actualizados correctamente",
            state: "success",
          };
          await this.getShopData();
        } else {
          this.toastInfo = {
            showing: true,
            message: data.message,
            state: "danger",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
