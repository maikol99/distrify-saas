<template>
  <div
    class="sidebar-overlay fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] transition-opacity duration-300"
    :class="{
      'opacity-100 pointer-events-auto': isMobileMenuOpen,
      'opacity-0 pointer-events-none': !isMobileMenuOpen,
    }"
    @click="closeMobileMenu"
  ></div>

  <nav
    class="sidebar fixed top-0 left-0 h-screen z-[1000] border-r border-slate-200 bg-white transition-all duration-300 flex flex-col font-display shadow-lg"
    :class="{
      'w-72 translate-x-0':
        isMobileMenuOpen || (!isMobile && !globalStore.isSidebarCollapsed),
      'w-20 translate-x-0': !isMobile && globalStore.isSidebarCollapsed,
      '-translate-x-full': isMobile && !isMobileMenuOpen,
    }"
  >
    <!-- Header -->
    <div
      class="p-6 border-bottom border-white/10 flex items-center justify-between min-h-[80px]"
    >
      <div class="flex items-center gap-3">
        <img
          v-if="!globalStore.isSidebarCollapsed"
          src="/alevia-logo.png"
          alt="Alevia Pay"
          width="150px"
        />
        <span
          v-if="!globalStore.isSidebarCollapsed"
          class="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full border border-primary/20"
          >v1.3.5</span
        >
      </div>

      <div
        @click="handleNotificationClick"
        class="hidden md:block relative cursor-pointer text-slate-400 hover:text-primary transition-all p-2 hover:bg-white/10 rounded-xl"
        v-if="!globalStore.isSidebarCollapsed"
      >
        <span class="material-symbols-outlined">notifications</span>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-ping"
        ></span>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
        ></span>
      </div>

      <button
        class="md:hidden text-slate-400 hover:text-primary"
        @click="closeMobileMenu"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <!-- Collapse Toggle (Desktop) -->
    <div v-if="!isMobile" class="px-4 py-2 border-bottom border-white/10">
      <button
        @click="toggleCollapse"
        class="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group"
      >
        <span
          class="material-symbols-outlined transition-transform duration-300"
          :class="{ 'rotate-180': globalStore.isSidebarCollapsed }"
        >
          keyboard_double_arrow_left
        </span>
      </button>
    </div>

    <!-- Content / Nav Links -->
    <div class="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
      <ul class="space-y-1">
        <li
          v-for="item in filteredMenuItems"
          :key="item.id"
          class="relative group"
        >
          <!-- Item with Children -->
          <div v-if="item.children" class="space-y-1">
            <button
              @click="toggleSubmenu(item.id, $event)"
              class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative overflow-hidden group"
              :class="{
                'bg-primary/10 text-primary font-black': isActiveParent(item),
                'text-slate-500 hover:bg-white/10': !isActiveParent(item),
              }"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span
                v-if="!globalStore.isSidebarCollapsed"
                class="text-sm font-bold flex-1 text-left"
                >{{ item.label }}</span
              >
              <span
                v-if="!globalStore.isSidebarCollapsed"
                class="material-symbols-outlined text-lg transition-transform duration-300"
                :class="{ 'rotate-180': openSubmenus.includes(item.id) }"
                >expand_more</span
              >

              <!-- Indicator for collapsed mode -->
              <div
                v-if="globalStore.isSidebarCollapsed && isActiveParent(item)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
              ></div>
            </button>

            <!-- Expanded Submenu -->
            <div
              v-show="openSubmenus.includes(item.id) && !globalStore.isSidebarCollapsed"
              class="pl-12 space-y-1 overflow-hidden transition-all"
            >
              <a
                v-for="child in item.children"
                :key="child.route"
                href="#"
                @click="handleNavigation(child.route, child.plan, $event)"
                class="flex items-center gap-3 px-4 py-2 text-sm rounded-xl transition-all"
                :class="{
                  'text-primary font-black': isActiveRoute(child.route),
                  'text-slate-500 hover:text-slate-900 dark:hover:text-white':
                    !isActiveRoute(child.route),
                }"
              >
                <span class="material-symbols-outlined text-lg">{{
                  child.icon
                }}</span>
                <span>{{ child.label }}</span>
                <span
                  v-if="isPlanBlocked(child.plan)"
                  class="material-symbols-outlined text-amber-500 text-sm"
                  >stars</span
                >
              </a>
            </div>
          </div>

          <!-- Simple Item -->
          <a
            v-else
            href="#"
            @click="handleNavigation(item.route, item.plan, $event)"
            class="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative overflow-hidden group"
            :class="{
              'bg-primary/10 text-primary font-black': isActiveRoute(
                item.route,
              ),
              'text-slate-500 hover:bg-white/10': !isActiveRoute(item.route),
            }"
            @mouseenter="hoveredItem = item.id"
            @mouseleave="hoveredItem = null"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span v-if="!globalStore.isSidebarCollapsed" class="text-sm font-bold flex-1">{{
              item.label
            }}</span>
            <span
              v-if="isPlanBlocked(item.plan)"
              class="material-symbols-outlined text-amber-500 text-sm"
              >stars</span
            >

            <div
              v-if="globalStore.isSidebarCollapsed && isActiveRoute(item.route)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
            ></div>

            <!-- Tooltip (Collapsed) -->
            <div
              v-if="globalStore.isSidebarCollapsed"
              class="fixed left-24 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[1001] shadow-xl border border-white/10"
            >
              {{ item.label }}
            </div>
          </a>
        </li>
      </ul>
    </div>

    <!-- Footer / User Section -->
    <div class="p-4 border-top border-white/10">
      <!-- Mobile: botones directos sin popover -->
      <div v-if="isMobile" class="flex flex-col gap-2">
        <a
          @click="navigate('/configuracion', $event)"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 text-slate-700 dark:text-white text-sm font-bold cursor-pointer transition-colors"
        >
          <span class="material-symbols-outlined text-slate-400">person</span>
          Configuración
        </a>
        <a
          @click="logoutUser"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-500 text-sm font-bold cursor-pointer transition-colors"
        >
          <span class="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </a>
      </div>

      <!-- Desktop: botón con popover -->
      <div v-else class="relative" ref="userInfo">
        <button
          @click.stop="toggleUserMenu"
          class="w-full flex items-center gap-4 px-3 py-2 rounded-2xl transition-all bg-white/5 dark:bg-white/5 hover:bg-white/10 border border-white/10 group"
        >
          <div
            class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden"
          >
            <span class="material-symbols-outlined">settings</span>
          </div>
          <div
            v-if="!globalStore.isSidebarCollapsed"
            class="flex-1 text-left min-w-0"
          >
            <p class="text-xs font-black truncate text-slate-800 dark:text-white">Ajustes</p>
            <p class="text-[10px] text-slate-500 truncate">Mi Cuenta</p>
          </div>
          <span
            v-if="!globalStore.isSidebarCollapsed"
            class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg"
            >more_vert</span
          >
        </button>

        <!-- User Menu Popover -->
        <div
          v-if="showUserMenu"
          class="absolute bottom-full left-0 w-full mb-2 p-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl animate-slide-up z-[1001]"
        >
          <a
            @click="navigate('/configuracion', $event)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-slate-700 dark:text-slate-200 text-sm font-bold group cursor-pointer"
          >
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary">person</span>
            Configuración
          </a>
          <div class="h-px bg-white/10 my-1"></div>
          <a
            @click="logoutUser"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-bold group cursor-pointer"
          >
            <span class="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Top Navbar -->
  <div
    class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-[110] flex items-center justify-between px-4 shadow-sm"
  >
    <div class="flex items-center gap-3">
      <button
        @click="toggleMobileMenu"
        class="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center justify-center rounded-xl"
      >
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      <img src="/alevia-logo.png" alt="Alevia Pay" class="h-6 object-contain" />
    </div>

    <div class="flex items-center gap-1">
      <!-- Notificaciones -->
      <div
        @click="handleNotificationClick"
        class="relative cursor-pointer text-slate-500 dark:text-slate-400 hover:text-primary p-2 flex items-center justify-center rounded-xl"
      >
        <span class="material-symbols-outlined text-[1.4rem]">notifications</span>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"
        ></span>
      </div>

      <!-- Configuración y logout (abre sidebar con los links directos) -->
      <button
        @click="toggleMobileMenu"
        class="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-xl"
        title="Mi cuenta"
      >
        <span class="material-symbols-outlined text-[1.4rem]">account_circle</span>
      </button>
    </div>
  </div>

  <spinnerComponent v-if="loading"></spinnerComponent>
</template>

<script>
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import Cookies from "js-cookie";
import { useRouter, useRoute } from "vue-router";
import api from "@/config/axios.config";

export default {
  components: {
    spinnerComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    return { router, route };
  },
  computed: {
    filteredMenuItems() {
      const turnsEnabled = this.settingsStore.settings?.turnsEnabled === true;
      return this.menuItems.filter((item) => {
        // Solo mostrarlo en mobile el item de configuración (id: 11)
        if (item.id === 11) {
          return this.isMobileMenuOpen || this.isMobile;
        }
        // Turnos solo se muestra si el módulo está habilitado
        if (item.requiresTurns) {
          return turnsEnabled;
        }
        return true;
      });
    },
  },
  data() {
    return {
      notificationStore: useNotificationsStore(),
      settingsStore: useSettingsStore(),
      showUserMenu: false,
      isMobileMenuOpen: false,
      openSubmenus: [],
      hoveredItem: null,
      menuItems: [
        {
          id: 1,
          label: "Inicio",
          route: "/inicio",
          icon: "home",
          plan: "FREE",
        },
        {
          id: 2,
          label: "Ingresos",
          plan: "FREE",
          icon: "account_balance_wallet",
          external: false,
          children: [
            {
              label: "Vender",
              route: "/ventas",
              icon: "add_shopping_cart",
              plan: "FREE",
            },
            {
              label: "Historial",
              route: "/historial/ventas",
              icon: "history",
              plan: "FREE",
            },
            {
              label: "Clientes",
              route: "/clientes",
              icon: "groups",
              plan: "FREE",
            },
            {
              label: "Pagos",
              route: "/ingresos",
              icon: "payments",
              plan: "FREE",
            },
            {
              label: "Pedidos",
              route: "/pedidos",
              icon: "package_2",
              plan: "FREE",
            },
          ],
        },
        {
          id: 3,
          label: "Egresos",
          plan: "FREE",
          icon: "shopping_cart_checkout",
          external: false,
          children: [
            {
              label: "Compras",
              route: "/compras",
              icon: "shopping_bag",
              plan: "FREE",
            },
            {
              label: "Gastos",
              route: "/egresos",
              icon: "receipt_long",
              plan: "FREE",
            },
          ],
        },
        {
          id: 4,
          label: "Movimientos",
          route: "/movimientos",
          icon: "sync_alt",
          plan: "FREE",
        },
        {
          id: 5,
          label: "Proveedores",
          route: "/proveedores",
          icon: "badge",
          plan: "FREE",
        },
        {
          id: 6,
          label: "Inventario",
          icon: "inventory",
          plan: "FREE",
          children: [
            {
              label: "Stock",
              route: "/inventario",
              icon: "package",
              plan: "FREE",
            },
            {
              label: "Categorías",
              route: "/categorias",
              icon: "category",
              plan: "FREE",
            },
          ],
        },
        {
          id: 8,
          label: "Reportes",
          plan: "MEDIUM",
          icon: "analytics",
          route: "/reportes",
        },
        {
          id: 10,
          label: "Caja",
          plan: "MEDIUM",
          route: "/caja",
          icon: "point_of_sale",
        },
        {
          id: 13,
          label: "Turnos",
          plan: "MEDIUM",
          route: "/turnos",
          icon: "schedule",
          requiresTurns: true,
        },
        {
          id: 14,
          label: "Promociones",
          plan: "FREE",
          route: "/promociones",
          icon: "sell",
        },
        {
          id: 6,
          label: "Mi Tienda",
          plan: "MEDIUM",
          icon: "storefront",
          route: "/tienda",
        },
        {
          id: 12,
          label: "Asistente IA",
          plan: "PREMIUM",
          icon: "smart_toy",
          route: "/asistente",
        },
      ],
      loading: false,
      globalStore: useGlobalStore(),
      isMobile: false,
    };
  },
  methods: {
    generateStoreLink() {
      const shopId = this.globalStore.shopId();
      const encryptedShopId = btoa(shopId);
      const encodedShopId = encodeURIComponent(encryptedShopId);
      const shopName = this.globalStore.shopData.name;
      const storeLink = `/tienda/${shopName}/${encodedShopId}`;
      this.router.push(storeLink);
    },
    handleResize() {
      this.isMobile = window.innerWidth < 768;
    },
    planLevel(plan) {
      return { FREE: 0, BASIC: 1, MEDIUM: 2, PREMIUM: 3 }[plan] ?? 0;
    },
    isPlanBlocked(requiredPlan) {
      const shopPlan = this.globalStore.shopData?.plan ?? "FREE";
      return this.planLevel(shopPlan) < this.planLevel(requiredPlan);
    },
    handleNavigation(route, itemPlan, event) {
      if (event) event.preventDefault();
      this.closeMobileMenu();

      if (this.isPlanBlocked(itemPlan)) {
        this.$router.push("/seccion-premium");
      } else if (route === "/tienda") {
        this.generateStoreLink();
      } else {
        this.navigate(route, event);
      }
    },
    handleNotificationClick() {
      this.closeMobileMenu();
      if (this.isPlanBlocked("MEDIUM")) {
        this.$router.push("/seccion-premium");
      } else {
        this.$router.push("/notificaciones");
      }
    },
    toggleCollapse() {
      this.globalStore.toggleSidebar();
      // Cerrar todos los submenús al colapsar
      if (this.globalStore.isSidebarCollapsed) {
        this.openSubmenus = [];
      }
    },
    toggleSubmenu(itemId, event) {
      if (event) event.preventDefault();
      if (this.globalStore.isSidebarCollapsed) return;
      const index = this.openSubmenus.indexOf(itemId);
      if (index > -1) {
        this.openSubmenus.splice(index, 1);
      } else {
        this.openSubmenus.push(itemId);
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = "auto";
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    isActiveRoute(route) {
      return this.$route.path === route;
    },
    isActiveParent(item) {
      if (!item.children) return false;
      return item.children.some((child) => this.isActiveRoute(child.route));
    },
    navigate(route, event) {
      if (event) event.preventDefault();
      const menuItem = this.findMenuItem(route);
      if (menuItem && menuItem.external) {
        window.open(route, "_blank");
      } else {
        this.$router.push(route);
      }
      this.isMobileMenuOpen = false;
      document.body.style.overflow = "auto";
    },
    findMenuItem(route) {
      for (const item of this.menuItems) {
        if (item.route === route) return item;
        if (item.children) {
          const child = item.children.find((child) => child.route === route);
          if (child) return child;
        }
      }
      return null;
    },
    closeUserMenu(event) {
      if (this.$refs.userInfo && !this.$refs.userInfo.contains(event.target)) {
        this.showUserMenu = false;
      }
    },
    async logoutUser() {
      try {
        this.loading = true;
        await api.post("/auth/logout").catch(() => {});
        Cookies.remove("user_info");
        localStorage.removeItem("token_expiration");
        localStorage.removeItem("session_warning_shown");
        await this.$router.push("/iniciar-sesion");
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    this.handleResize();
    document.body.style.overflow = "auto";
    window.addEventListener("resize", this.handleResize);
    await this.globalStore.fetchShopData();
    this.notificationStore.getUnreadCount();
    document.addEventListener("click", this.closeUserMenu);
    // Cargar settings para mostrar/ocultar items condicionales (ej: Turnos)
    if (!this.settingsStore.settings) {
      this.settingsStore.fetchSettings();
    }
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeUserMenu);
    document.body.style.overflow = "auto";
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
.sidebar {
  background: white;
  border-right: 1px solid #e2e8f0;
}

.dark .sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
}

.sidebar-spacer {
  margin-left: 18rem; /* 288px (w-72) */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-spacer.spacer-collapsed {
  margin-left: 5rem; /* 80px (w-20) */
}

@media (max-width: 768px) {
  .sidebar-spacer,
  .sidebar-spacer.spacer-collapsed {
    margin-left: 0;
  }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
