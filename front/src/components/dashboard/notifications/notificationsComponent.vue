<template>
  <div class="notifications-page animate-fade-in">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <span class="material-symbols-outlined">notifications</span>
        </div>
        <div>
          <h1>Notificaciones</h1>
          <p class="header-subtitle">
            {{ notificationsStore.pagination.total || 0 }} notificaciones en total
          </p>
        </div>
      </div>
      <div class="header-right">
        <div class="unread-badge" v-if="unreadCount > 0">
          <span class="material-symbols-outlined">mark_email_unread</span>
          {{ unreadCount }} sin leer
        </div>
        <button @click="toggleFilters" class="btn-filter" :class="{ active: showFilters }">
          <span class="material-symbols-outlined">tune</span>
          Filtros
        </button>
      </div>
    </div>

    <!-- Filtros desplegables -->
    <transition name="slide-down">
      <div v-if="showFilters" class="filters-panel">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Estado</label>
            <div class="select-wrapper">
              <span class="material-symbols-outlined select-icon">radio_button_checked</span>
              <select v-model="notificationsStore.filters.status" class="filter-select">
                <option value="">Todos</option>
                <option value="UNREAD">No leída</option>
                <option value="READ">Leída</option>
              </select>
            </div>
          </div>
          <div class="filter-group">
            <label>Tipo</label>
            <div class="select-wrapper">
              <span class="material-symbols-outlined select-icon">category</span>
              <select v-model="notificationsStore.filters.type" class="filter-select">
                <option value="">Todos</option>
                <option value="ORDER_PLACED">Pedidos</option>
                <option value="PAYMENT_RECEIVED">Pagos</option>
              </select>
            </div>
          </div>
          <div class="filter-group">
            <label>Fecha inicio</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">calendar_today</span>
              <input
                v-model="notificationsStore.filters.startDate"
                type="date"
                class="filter-input"
              />
              <button
                v-if="notificationsStore.filters.startDate"
                @click="notificationsStore.filters.startDate = ''"
                class="input-clear"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div class="filter-group">
            <label>Fecha fin</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">calendar_today</span>
              <input
                v-model="notificationsStore.filters.endDate"
                type="date"
                class="filter-input"
              />
              <button
                v-if="notificationsStore.filters.endDate"
                @click="notificationsStore.filters.endDate = ''"
                class="input-clear"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button @click="notificationsStore.clearFilters" class="btn-ghost">
            <span class="material-symbols-outlined">restart_alt</span>
            Limpiar
          </button>
          <button @click="notificationsStore.loadData" class="btn-primary">
            <span class="material-symbols-outlined">search</span>
            Aplicar filtros
          </button>
        </div>
      </div>
    </transition>

    <!-- Lista de notificaciones -->
    <div class="notifications-list">
      <div
        v-for="notification in notificationsStore.notifications"
        :key="notification._id"
        class="notification-card"
        :class="{
          'is-unread': notification.status === 'UNREAD',
          'is-order': notification.type === 'ORDER_PLACED',
          'is-payment': notification.type === 'PAYMENT_RECEIVED',
        }"
      >
        <div class="notif-icon-wrap">
          <span class="material-symbols-outlined notif-icon">
            {{ notification.type === 'ORDER_PLACED' ? 'shopping_bag' : 'payments' }}
          </span>
        </div>

        <div class="notif-body">
          <div class="notif-top">
            <span class="notif-type-tag" :class="notification.type === 'ORDER_PLACED' ? 'tag-order' : 'tag-payment'">
              {{ notification.type === 'ORDER_PLACED' ? 'Pedido' : 'Pago' }}
            </span>
            <span class="notif-date">
              <span class="material-symbols-outlined">schedule</span>
              {{ formatDate(notification.createdAt) }}
            </span>
          </div>
          <h3 class="notif-title">{{ notification.title }}</h3>
          <p class="notif-message">{{ notification.message }}</p>
        </div>

        <div class="notif-actions">
          <span class="status-pill" :class="notification.status === 'READ' ? 'pill-read' : 'pill-unread'">
            <span class="material-symbols-outlined">
              {{ notification.status === 'READ' ? 'mark_email_read' : 'mark_email_unread' }}
            </span>
            {{ notification.status === 'READ' ? 'Leída' : 'No leída' }}
          </span>
          <button
            v-if="notification.status === 'UNREAD'"
            @click="notificationsStore.markAsRead(notification._id)"
            class="btn-mark-read"
            title="Marcar como leída"
          >
            <span class="material-symbols-outlined">done_all</span>
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="notificationsStore.notifications.length === 0 && !notificationsStore.loading" class="empty-state">
        <div class="empty-icon">
          <span class="material-symbols-outlined">notifications_off</span>
        </div>
        <h3>Sin notificaciones</h3>
        <p>No hay notificaciones que coincidan con los filtros aplicados.</p>
        <button @click="notificationsStore.clearFilters" class="btn-primary" style="margin-top: 1rem">
          Ver todas las notificaciones
        </button>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="notificationsStore.notifications.length > 0">
      <button
        class="btn-page"
        @click="notificationsStore.previousPage"
        :disabled="notificationsStore.pagination.page === 1"
      >
        <span class="material-symbols-outlined">chevron_left</span>
        Anterior
      </button>

      <div class="page-info">
        <span class="current-page">{{ notificationsStore.pagination.page }}</span>
        <span class="page-separator">de</span>
        <span class="total-pages">{{ notificationsStore.pagination.pages }}</span>
      </div>

      <button
        class="btn-page"
        @click="notificationsStore.nextPage"
        :disabled="notificationsStore.pagination.page === notificationsStore.pagination.pages"
      >
        Siguiente
        <span class="material-symbols-outlined">chevron_right</span>
      </button>

      <div class="per-page">
        <label>Por página:</label>
        <select @change="notificationsStore.changeLimit($event.target.value)" class="per-page-select">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

  </div>
  <spinnerComponent v-if="notificationsStore.loading"></spinnerComponent>
  <toastComponent
    v-if="notificationsStore.showingToast"
    :state="notificationsStore.toastData.state"
    :message="notificationsStore.toastData.message"
  ></toastComponent>
</template>

<script>
import moment from "moment";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useNotificationsStore } from "@/stores/notificationsStore";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";

export default {
  name: "NotificationsComponent",
  components: {
    spinnerComponent,
    toastComponent,
  },
  data() {
    return {
      showFilters: false,
      notificationsStore: useNotificationsStore(),
    };
  },
  computed: {
    unreadCount() {
      return this.notificationsStore.notifications.filter(
        (n) => n.status === "UNREAD"
      ).length;
    },
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    formatDate(date) {
      return moment.utc(date).format("DD/MM/YYYY HH:mm");
    },
  },
  async mounted() {
    await this.notificationsStore.fetchNotifications();
  },
};
</script>

<style scoped>
/* ── Animación de entrada ── */
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Layout principal ── */
.notifications-page {
  padding: 1.5rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.3);
  flex-shrink: 0;
}

.header-icon .material-symbols-outlined {
  color: white;
  font-size: 1.5rem;
}

.page-header h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0.15rem 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.unread-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #c2410c;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
}

.unread-badge .material-symbols-outlined {
  font-size: 1rem;
}

/* ── Botones ── */
.btn-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter:hover {
  border-color: #f9931e;
  color: #f9931e;
  background: #fff7ed;
}

.btn-filter.active {
  border-color: #f9931e;
  color: #f9931e;
  background: #fff7ed;
}

.btn-filter .material-symbols-outlined {
  font-size: 1.1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1.125rem;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(249, 147, 30, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 147, 30, 0.35);
}

.btn-primary .material-symbols-outlined {
  font-size: 1rem;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: #f8fafc;
  color: #475569;
}

.btn-ghost .material-symbols-outlined {
  font-size: 1rem;
}

/* ── Panel de filtros ── */
.filters-panel {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.select-wrapper,
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon,
.input-icon {
  position: absolute;
  left: 0.625rem;
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
  z-index: 1;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s ease;
  appearance: none;
  box-sizing: border-box;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #f9931e;
  background: white;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.input-clear {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.input-clear:hover {
  color: #ef4444;
  background: #fef2f2;
}

.input-clear .material-symbols-outlined {
  font-size: 0.9rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

/* ── Animación slide-down ── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Tarjetas de notificación ── */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: white;
  border-radius: 1.125rem;
  border: 1.5px solid #f1f5f9;
  padding: 1.125rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #e2e8f0;
}

.notification-card.is-unread {
  border-left: 3px solid #f9931e;
  background: linear-gradient(135deg, #fffbf7 0%, white 40%);
}

/* ── Ícono de notificación ── */
.notif-icon-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.is-order .notif-icon-wrap {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

.is-payment .notif-icon-wrap {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
}

.notif-icon {
  color: white;
  font-size: 1.25rem;
}

/* ── Cuerpo ── */
.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-top {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.375rem;
  flex-wrap: wrap;
}

.notif-type-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tag-order {
  background: #eff6ff;
  color: #2563eb;
}

.tag-payment {
  background: #ecfdf5;
  color: #059669;
}

.notif-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: auto;
}

.notif-date .material-symbols-outlined {
  font-size: 0.9rem;
}

.notif-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.notif-message {
  font-size: 0.825rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── Acciones ── */
.notif-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.625rem;
  flex-shrink: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status-pill .material-symbols-outlined {
  font-size: 0.85rem;
}

.pill-read {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.pill-unread {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.btn-mark-read {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-mark-read:hover {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}

.btn-mark-read .material-symbols-outlined {
  font-size: 1rem;
}

/* ── Estado vacío ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 1.25rem;
  border: 1.5px dashed #e2e8f0;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-icon .material-symbols-outlined {
  font-size: 2rem;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.375rem;
}

.empty-state p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

/* ── Paginación ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 1.125rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.45rem 0.875rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  border-color: #f9931e;
  color: #f9931e;
  background: #fff7ed;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page .material-symbols-outlined {
  font-size: 1.1rem;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}

.current-page {
  font-weight: 700;
  color: #f9931e;
  background: #fff7ed;
  border: 1.5px solid #fed7aa;
  border-radius: 0.5rem;
  padding: 0.2rem 0.6rem;
  min-width: 2rem;
  text-align: center;
}

.page-separator {
  color: #94a3b8;
}

.total-pages {
  font-weight: 600;
  color: #475569;
}

.per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  font-size: 0.8rem;
  color: #64748b;
}

.per-page-select {
  padding: 0.35rem 0.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
  appearance: none;
}

.per-page-select:focus {
  outline: none;
  border-color: #f9931e;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }

  .page-header {
    gap: 0.75rem;
  }

  .notification-card {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .notif-actions {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }

  .notif-date {
    margin-left: 0;
  }

  .notif-top {
    flex-wrap: nowrap;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination {
    gap: 0.5rem;
  }

  .per-page {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.125rem;
  }

  .notification-card {
    padding: 1rem;
  }
}
</style>
