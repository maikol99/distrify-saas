import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";

export const useNotificationsStore = defineStore("notifications", {
  state: () => {
    return {
      notifications: [],
      loading: false,
      error: null,
      globalStore: useGlobalStore(),
      pagination: {
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
      },
      showingToast: false,
      toastData: {
        state: "",
        message: "",
      },
      filters: {
        type: "",
        status: "",

        startDate: "",
        endDate: "",
      },
      filtersApplied: false,
    };
  },
  actions: {
    async fetchNotifications() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const urlParams = new URLSearchParams();

        if (this.filters.type) {
          urlParams.append("type", this.filters.type);
        }
        if (this.filters.status) {
          urlParams.append("status", this.filters.status);
        }
        if (this.filters.startDate) {
          urlParams.append("startDate", this.filters.startDate);
        }
        if (this.filters.endDate) {
          urlParams.append("endDate", this.filters.endDate);
        }

        const response = await api.get(
          `/notifications/get/filter-notifications?shopId=${shopId}&page=${
            this.pagination.page
          }&limit=${this.pagination.limit}&${urlParams.toString()}`
        );
        const data = response.data;

        if (data.success) {
          this.notifications = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.pages = data.pagination.pages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
          this.showingToast = true;
          this.toastData = {
            state: "success",
            message: "Notificaciones cargadas correctamente",
          };
        } else {
          this.showingToast = true;
          this.toastData = {
            state: "danger",
            message: "Error al cargar notificaciones",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async loadData() {
      this.pagination.page = 1;
      await this.fetchNotifications();
    },
    async clearFilters() {
      this.filters = {
        type: "",
        status: "",
        startDate: "",
        endDate: "",
      };
      this.filtersApplied = false;
      await this.fetchNotifications();
    },
    async markAsRead(id) {
      this.loading = true;
      try {
        const response = await api.patch(
          `/notifications/patch/mark-as-read?notificationId=${id}`
        );
        const data = response.data;

        if (data.success) {
          this.showingToast = true;
          this.toastData = {
            state: "success",
            message: "Notificación marcada como leída",
          };
          await this.loadData();
        } else {
          this.showingToast = true;
          this.toastData = {
            state: "danger",
            message: "Error al marcar la notificación como leída",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async nextPage() {
      if (this.pagination.page < this.pagination.pages) {
        this.pagination.page++;
        await this.loadData();
      }
    },
    async getUnreadCount() {
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.get(
          `/notifications/get/unread-count?shopId=${shopId}`
        );
        const data = response.data;

        if (data.success) {
          this.unreadCount = data.data;
        } else {
          this.showingToast = true;
          this.toastData = {
            state: "danger",
            message: "Error al obtener el conteo de notificaciones no leídas",
          };
        }
      } catch (error) {
        console.log(error);
      }
    },
    async previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        await this.loadData();
      }
    },
    async changeLimit(newLimit) {
      this.pagination.limit = newLimit;
      await this.loadData();
    },
  },
});
