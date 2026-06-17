<template>
  <div class="profile-container">
    <!-- Información del usuario -->
    <div class="user-header">
      <div class="user-avatar-container">
        <div
          class="user-avatar user-avatar-placeholder"
          :style="{ backgroundColor: userStore.avatarColor }"
        >
          <span class="avatar-initials">{{ userStore.userInitials }}</span>
        </div>
      </div>
      <div class="user-info">
        <h2 class="user-name">
          {{ userStore.user?.username || "Nombre no disponible" }}
        </h2>
        <span class="user-role" :class="roleClass">{{
          userStore.user?.role || "Sin Rol"
        }}</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Información personal -->
      <div class="data-table-container">
        <div class="table-header">
          <h2>Información Personal</h2>
       
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <div class="info-text">
              <span class="info-label">Email</span>
              <span class="info-value">{{
                userStore.user?.email || "No especificado"
              }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-user"></i>
            <div class="info-text">
              <span class="info-label">Nombre de Usuario</span>
              <span class="info-value">{{
                userStore.user?.username || "No especificado"
              }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-id-badge"></i>
            <div class="info-text">
              <span class="info-label">Rol</span>
              <span class="info-value user-role" :class="roleClass">{{
                userStore.user?.role || "No especificado"
              }}</span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <div class="info-text">
              <span class="info-label">Último Login</span>
              <span class="info-value">{{
                formatDate(userStore.user?.lastLogin) || "No disponible"
              }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-user-check"></i>
            <div class="info-text">
              <span class="info-label">Usuario Principal</span>
              <span class="info-value">{{
                userStore.user?.isMainUser ? "Sí" : "No"
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SpinnerComponent v-if="userStore.loading"></SpinnerComponent>
  </div>
</template>

<script>
import { useProfileStore } from "@/stores/profileStore";
import moment from "moment";
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";

export default {
  name: "PerfilUsuario",
  components: {
    SpinnerComponent,
  },
  setup() {
    const userStore = useProfileStore();
    return { userStore };
  },
  data() {
    return {
      showingEditarPerfil: false,
    };
  },
  computed: {
    roleClass() {
      if (!this.userStore.user?.role) return "";

      const role = this.userStore.user.role.toLowerCase();
      return {
        admin: role === "admin",
        supervisor: role === "supervisor",
        vendedor: role === "vendedor",
      };
    },
  },
  methods: {
    async handleUpdatePerfil() {
      try {
        this.showingEditarPerfil = false;
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
      }
    },

    formatDate(fecha) {
      if (!fecha) return "No disponible";
      return moment(fecha).format("DD/MM/YYYY HH:mm");
    },
  },

  async mounted() {
    try {
      await this.userStore.initialize();
    } catch (error) {
      console.error("Error al inicializar el componente:", error);
    }
  },
};
</script>

<style scoped>
.profile-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
}

/* Hero card */
.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1rem;
  border: 1px solid #fed7aa;
  margin-bottom: 1.5rem;
}

.user-avatar-container { position: relative; }

.user-avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  background-size: cover; background-position: center;
  border: 3px solid white;
  box-shadow: 0 0 0 3px #fed7aa, 0 4px 12px rgba(0,0,0,0.1);
}
.user-avatar-placeholder {
  display: flex; align-items: center; justify-content: center;
}
.avatar-initials {
  font-size: 2rem; font-weight: 700; color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.user-info { display: flex; flex-direction: column; gap: 0.4rem; }
.user-name { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.user-role {
  display: inline-flex; align-items: center;
  padding: 0.3rem 0.75rem; border-radius: 999px;
  font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; background: #f3f4f6; color: #4b5563; width: fit-content;
}
.user-role.admin    { background: #fef3c7; color: #92400e; }
.user-role.supervisor { background: #e0f2fe; color: #0369a1; }
.user-role.vendedor { background: #dcfce7; color: #166534; }

/* Info card */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}
.data-table-container {
  background: white; border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.table-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6;
}
.table-header h2 { font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }

.info-content { padding: 0.25rem 0; }
.info-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.875rem 1.25rem; border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
}
.info-item:last-child { border-bottom: none; }
.info-item:hover { background: #fafafa; }
.info-item i {
  width: 34px; height: 34px; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  background: #f9fafb; color: #f9931e; font-size: 0.9rem; flex-shrink: 0;
}
.info-text { display: flex; flex-direction: column; }
.info-label { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
.info-value { font-size: 0.9rem; font-weight: 500; color: #111827; }

@media (max-width: 768px) {
  .user-header { flex-direction: column; text-align: center; padding: 1.5rem; }
  .user-role { margin: 0 auto; }
  .content-grid { grid-template-columns: 1fr; }
  .avatar-initials { font-size: 1.5rem; }
}
</style>
