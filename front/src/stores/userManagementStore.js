import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";

export const useUserManagementStore = defineStore("userManagement", {
  state: () => ({
    users: [],
    loading: false,
    toast: {
      showing: false,
      message: "",
      state: "",
    },
    userData: {
      email: "",
      password: "",
      username: "",
      role: "",
      routesAllowed: [],
    },
    globalStore: useGlobalStore(),
  }),
  actions: {
    async createUser() {
      this.loading = true;
      this.toast = { showing: false, message: "", state: "" };

      const shopId = this.globalStore.shopId();

      if (this.userData.password.length < 8) {
        console.log("Ingresando a test");

        this.toast = {
          showing: true,
          message:
            "La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial.",
          state: "danger",
        };
        this.loading = false;
        return;
      }

      try {
        const response = await api.post("/auth/post/register-user", {
          ...this.userData,
          shopId,
          createShop: false,
        });
        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message: "Usuario creado exitosamente",
            state: "success",
          };
          this.userData = {
            email: "",
            password: "",
            username: "",
            role: "",
            routesAllowed: [],
          };
          await this.getShopUsers();
        } else {
          this.toast = {
            showing: true,
            message: data.message,
            state: "error",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async getShopUsers() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.get(`/users/get/get-users/${shopId}`);
        const data = response.data;
        if (data.success) {
          this.users = data.users;
          this.toast = {
            showing: true,
            message: "Usuarios obtenidos exitosamente",
            state: "success",
          };
        } else {
          this.toast = {
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
    async updateUser(id) {
      this.loading = true;
      this.toast = { showing: false, message: "", state: "" };

      try {
        if (this.userData.password === "") {
          delete this.userData.password;
        }
        const response = await api.patch(
          `/users/patch/update-user/${id}`,
          this.userData
        );
        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message: "Usuario actualizado exitosamente",
            state: "success",
          };
          this.userData = {
            email: "",
            password: "",
            username: "",
            role: "",
            routesAllowed: [],
          };
          await this.getShopUsers();
        } else {
          this.toast = {
            showing: true,
            message: data.message,
            state: "error",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async deleteUser(id) {
      this.loading = true;
      this.toast = { showing: false, message: "", state: "" };

      try {
        const response = await api.delete(`/users/delete/delete-user/${id}`);
        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message: "Usuario eliminado exitosamente",
            state: "success",
          };
          await this.getShopUsers();
        } else {
          this.toast = {
            showing: true,
            message: data.message,
            state: "error",
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
