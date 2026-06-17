import api from "@/config/axios.config";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => {
    return {
      shopData: null,
      userData: null,
      isSidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
    };
  },
  actions: {
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },
    userName() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.username : null;
    },
    userId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.id : null;
    },
    async fetchShopData() {
      try {
        const response = await api.get(
          `/shops/get/get-shop-by-id/${this.shopId()}`
        );
        const data = response.data;
        console.log("ShopData: ", data);

        this.shopData = data.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getUserData(param) {
      try {
        const userId = this.userId();
        const response = await api.get(
          `/users/get/get-user-fields/${userId}?fields=${param}`
        );
        const data = response.data;
        console.log('data: ', data);
        
        if(data.success){
          
          this.userData = data.user;
          console.log('UserData: ', this.userData);
          
        }
      } catch (error) {
        console.log(error);
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", this.isSidebarCollapsed);
    },
  },
});
