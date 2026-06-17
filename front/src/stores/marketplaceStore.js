import { defineStore } from "pinia";

export const useMarketplaceStore = defineStore("marketplace", {
  state: () => ({
    shops: [],
    products: [],
  }),
  actions: {
    async fetchAllShops() {
      try {
      } catch (error) {
        console.log(error);
      }
    },
  },
});
