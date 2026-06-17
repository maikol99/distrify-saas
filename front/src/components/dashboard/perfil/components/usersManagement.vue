<template>
  <div class="business-container">
    <div class="business-header">
      <div class="business-info">
        <h2 class="business-name">Gestión de Usuarios</h2>
      </div>
    </div>

    <div class="content-grid">
      <!-- Formulario para crear/editar usuario -->
      <div class="data-table-container">
        <div class="table-header">
          <h2>{{ editingUser ? "Editar Usuario" : "Crear Usuario" }}</h2>
          <button
            v-if="editingUser"
            class="btn-icon btn-cancel"
            @click="cancelEdit"
            title="Cancelar edición"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <div class="info-text">
              <span class="info-label">Email</span>
              <input
                class="form-input"
                type="email"
                v-model="userStore.userData.email"
                placeholder="usuario@ejemplo.com"
                required
                :disabled="userStore.loading"
              />
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-user"></i>
            <div class="info-text">
              <span class="info-label">Nombre de Usuario</span>
              <input
                class="form-input"
                type="text"
                v-model="userStore.userData.username"
                placeholder="nombre_usuario"
                required
                :disabled="userStore.loading"
              />
            </div>
          </div>

             <div class="info-item">
            <i class="fas fa-phone"></i>
            <div class="info-text">
              <span class="info-label">Teléfono</span>
              <input
                class="form-input"
                type="text"
                v-model="userStore.userData.phone"
                placeholder="teléfono"
                required
                :disabled="userStore.loading"
              />
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-lock"></i>
            <div class="info-text">
              <span class="info-label">Contraseña</span>
              <input
                class="form-input"
                type="password"
                v-model="userStore.userData.password"
                :placeholder="
                  editingUser
                    ? 'Dejar vacío para mantener actual'
                    : 'Contraseña'
                "
                :required="!editingUser"
                :disabled="userStore.loading"
              />
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-user-tag"></i>
            <div class="info-text">
              <span class="info-label">Rol</span>
              <select
                v-model="userStore.userData.role"
                class="form-select"
                name="role"
                id="role"
                required
                :disabled="userStore.loading"
              >
                <option value="">Seleccionar...</option>
                <option value="ADMIN">Administrador</option>
                <option value="USER">Usuario</option>
              </select>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-route"></i>
            <div class="info-text">
              <span class="info-label">Rutas Permitidas</span>
              <div class="routes-container">
                <div class="route-input-container">
                  <select
                    v-model="newRoute"
                    class="form-select"
                    :disabled="userStore.loading"
                  >
                    <option value="">Seleccionar rutas...</option>
                    <option value="ventas">Ventas</option>
                    <option value="proveedores">Proveedores</option>
                    <option value="inventario">Inventario</option>
                    <option value="categorias">Categorías</option>
                    <option value="compras">Compras</option>
                    <option value="clientes">Clientes</option>
                    <option value="historial/ventas">
                      Historial de Ventas
                    </option>
                    <option value="pedidos">Pedidos</option>
                    <option value="caja">Caja</option>
                    <option value="configuracion">Configuración</option>
                    <option value="egresos">Egresos</option>
                    <option value="ingresos">Ingresos</option>
                    <option value="reportes">Reportes</option>
                    <option value="notificaciones">Notificaciones</option>
                  </select>
                  <button
                    class="btn btn-add-route"
                    @click="addRoute"
                    type="button"
                    :disabled="!newRoute || userStore.loading"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="route-controls">
                  <button
                    class="btn btn-select-all"
                    @click="selectAllRoutes"
                    type="button"
                    :disabled="userStore.loading || allRoutesSelected"
                  >
                    <i class="fas fa-check-double"></i>
                    Seleccionar Todas
                  </button>
                  <button
                    class="btn btn-clear-all"
                    @click="clearAllRoutes"
                    type="button"
                    :disabled="
                      userStore.loading ||
                      userStore.userData.routesAllowed.length === 0
                    "
                  >
                    <i class="fas fa-times-circle"></i>
                    Limpiar Todas
                  </button>
                </div>
                <div class="routes-list">
                  <span
                    v-for="(route, index) in userStore.userData.routesAllowed"
                    :key="index"
                    class="route-tag"
                  >
                    {{ getRouteDisplayName(route) }}
                    <button
                      class="remove-route-btn"
                      @click="removeRoute(index)"
                      type="button"
                      :disabled="userStore.loading"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn btn-primary"
              @click="saveUser"
              :disabled="userStore.loading"
            >
              <i class="fas fa-save"></i>
              {{ editingUser ? "Actualizar Usuario" : "Crear Usuario" }}
            </button>
            <button
              v-if="editingUser"
              class="btn btn-secondary"
              @click="cancelEdit"
              :disabled="userStore.loading"
            >
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div v-if="userStore.users" class="data-table-container">
        <div class="table-header">
          <h2>Usuarios del Sistema ({{ userStore.users.length }})</h2>
        
        </div>
        <div class="users-list">
          <div
            v-for="user in userStore.users"
            :key="user._id"
            class="user-card"
          >
            <div class="user-info">
              <div class="user-avatar">
                <span class="user-initials">{{
                  getUserInitials(user.username)
                }}</span>
              </div>
              <div class="user-details">
                <h3 class="user-name">{{ user.username }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <div class="user-role">
                  <span class="role-badge" :class="getRoleClass(user.role)">
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </div>
                <div class="user-routes">
                  <span
                    v-for="route in user.routesAllowed.slice(0, 3)"
                    :key="route"
                    class="route-badge"
                  >
                    {{ getRouteDisplayName(route) }}
                  </span>
                  <span
                    v-if="user.routesAllowed.length > 3"
                    class="route-badge route-more"
                  >
                    +{{ user.routesAllowed.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
            <div class="user-actions">
              <button
                class="btn-icon btn-edit"
                @click="editUser(user)"
                title="Editar usuario"
                :disabled="userStore.loading"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-icon btn-delete"
                @click="deleteUser(user._id)"
                title="Eliminar usuario"
                :disabled="userStore.loading"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div
            v-if="userStore.users.length === 0 && !userStore.loading"
            class="empty-state"
          >
            <i class="fas fa-users"></i>
            <p>No hay usuarios registrados</p>
            <small>Crea el primer usuario usando el formulario</small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="userStore.loading"></spinnerComponent>
  <toastComponent
    v-if="userStore.toast.showing"
    :message="userStore.toast.message"
    :state="userStore.toast.state"
  ></toastComponent>
</template>

<script>
import { useUserManagementStore } from "@/stores/userManagementStore";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";

export default {
  name: "UserManagement",
  components: {
    toastComponent,
    spinnerComponent,
  },
  data() {
    return {
      editingUser: null,
      newRoute: "",
      userStore: useUserManagementStore(),
      availableRoutes: [
        "ventas",
        "proveedores",
        "inventario",
        "categorias",
        "compras",
        "clientes",
        "historial/ventas",
        "pedidos",
        "caja",
        "configuracion",
        "egresos",
        "ingresos",
        "reportes",
        "notificaciones",
      ],
    };
  },
  computed: {
    allRoutesSelected() {
      return this.availableRoutes.every((route) =>
        this.userStore.userData.routesAllowed.includes(route)
      );
    },
  },
  methods: {
    addRoute() {
      if (
        this.newRoute.trim() &&
        !this.userStore.userData.routesAllowed.includes(this.newRoute.trim())
      ) {
        this.userStore.userData.routesAllowed.push(this.newRoute.trim());
        this.newRoute = "";
      }
    },

    removeRoute(index) {
      this.userStore.userData.routesAllowed.splice(index, 1);
    },

    selectAllRoutes() {
      // Agregar todas las rutas que no estén ya seleccionadas
      this.availableRoutes.forEach((route) => {
        if (!this.userStore.userData.routesAllowed.includes(route)) {
          this.userStore.userData.routesAllowed.push(route);
        }
      });
    },

    clearAllRoutes() {
      this.userStore.userData.routesAllowed = [];
    },

    resetForm() {
      this.userStore.userData={
        email: "",
        username: "",
        password: "",
        role: "",
        routesAllowed: [],
      }
      this.editingUser = null;
      this.newRoute = "";
    },

    editUser(user) {
      this.editingUser = user;
      this.userStore.userData = {
        email: user.email,
        username: user.username,
        password: "",
        role: user.role,
        routesAllowed: [...user.routesAllowed],
        phone: user.phone
      };

      // Scroll al formulario
      document.querySelector(".data-table-container").scrollIntoView({
        behavior: "smooth",
      });
    },

    cancelEdit() {
      this.resetForm();
    },

    getUserInitials(username) {
      return username.substring(0, 2).toUpperCase();
    },

    getRoleDisplayName(role) {
      const roles = {
        ADMIN: "Administrador",
        USER: "Usuario",
      };
      return roles[role] || role;
    },

    getRoleClass(role) {
      return {
        "role-admin": role === "ADMIN",
        "role-user": role === "USER",
      };
    },

    getRouteDisplayName(route) {
      const routes = {
        ventas: "Ventas",
        proveedores: "Proveedores",
        inventario: "Inventario",
        categorias: "Categorías",
        compras: "Compras",
        clientes: "Clientes",
        "historial/ventas": "Historial de Ventas",
        pedidos: "Pedidos",
        caja: "Caja",
        configuracion: "Configuración",
        egresos: "Egresos",
        ingresos: "Ingresos",
        reportes: "Reportes",
        notificaciones: "Notificaciones",
      };
      return routes[route] || route;
    },

    async saveUser() {
      try {
        if (this.editingUser) {
          await this.userStore.updateUser(this.editingUser._id);
          this.resetForm();
        } else {
          await this.userStore.createUser();
        }
      } catch (error) {
        console.error("Error al guardar usuario:", error);
      }
    },

    async deleteUser(userId) {
      try {
        await this.userStore.deleteUser(userId);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    },

    async refreshUsers() {
      try {
        await this.userStore.refreshUsers();
      } catch (error) {
        console.error("Error al actualizar usuarios:", error);
      }
    },
  },

  async mounted() {
    try {
      await this.userStore.getShopUsers();
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  },

  beforeUnmount() {
    // Limpiar datos al salir del componente
    this.resetForm();
  },
};
</script>

<style scoped>
.form-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #1f2937;
  width: 100%;
  font-size: 0.875rem;
}
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #1f2937;
  width: 100%;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #ea580c;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8821a;
}

.btn-add-route {
  background-color: #10b981;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  min-width: 40px;
}

.btn-add-route:hover {
  background-color: #059669;
}

.business-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  min-height: 100vh;
}

.business-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.business-logo-container {
  position: relative;
}

.business-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.business-logo-placeholder {
  background-color: #6b7280;
}

.logo-initials {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.business-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.business-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.business-category {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #0369a1;
  width: fit-content;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.data-table-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #fafafa;
}

.table-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.info-content {
  padding: 1.25rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.info-text {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.routes-container {
  width: 100%;
}

.route-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.route-input {
  flex: 1;
}

.routes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.route-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.remove-route-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.remove-route-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.users-list {
  padding: 1.25rem;
  max-height: 600px;
  overflow-y: auto;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
}

.user-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-initials {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.user-routes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.route-badge {
  padding: 0.125rem 0.375rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.route-more {
  background-color: #ea580c;
  color: white;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #e5e7eb;
}

.btn-edit {
  color: #ea580c;
  background-color: #fef3c7;
}

.btn-edit:hover {
  background-color: #fde68a;
}

.btn-delete {
  color: #ef4444;
  background-color: #fee2e2;
}

.btn-delete:hover {
  background-color: #fecaca;
}

.btn-cancel {
  color: #ef4444;
  background-color: #fee2e2;
}

.btn-cancel:hover {
  background-color: #fecaca;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state p {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.empty-state small {
  font-size: 0.875rem;
}

.spinner-overlay {
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
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #ea580c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: #10b981;
}

.toast.error {
  background-color: #ef4444;
}

.toast.info {
  background-color: #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .business-header {
    flex-direction: column;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .user-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .user-actions {
    align-self: flex-end;
  }

  .route-input-container {
    flex-direction: column;
  }
}
</style>
