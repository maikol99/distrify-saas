<template>
  <div class="admin-root">
    <!-- Header -->
    <div class="admin-header">
      <div class="admin-header-left">
        <span class="admin-logo">⚙</span>
        <div>
          <h1>Panel de Administración</h1>
          <p>Control total del sistema Alevia Pay</p>
        </div>
      </div>
      <div class="admin-header-right">
        <button class="btn-refresh" @click="refreshAll" :disabled="isRefreshing">
          <span :class="{ spinning: isRefreshing }">↻</span>
          {{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Toast messages -->
    <transition name="toast">
      <div v-if="store.successMessage" class="toast toast-success" @click="store.clearMessages()">
        ✓ {{ store.successMessage }}
      </div>
    </transition>
    <transition name="toast">
      <div v-if="store.error" class="toast toast-error" @click="store.clearMessages()">
        ✕ {{ store.error }}
      </div>
    </transition>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: store.activeTab === tab.id }]"
        @click="switchTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- ─── TAB: MÉTRICAS ──────────────────────────────────────────────────── -->
    <div v-if="store.activeTab === 'metrics'" class="tab-content">
      <div v-if="store.metricsLoading" class="loading-center">
        <div class="spinner"></div>
        <p>Cargando métricas...</p>
      </div>
      <div v-else-if="store.metrics">
        <!-- Cards de métricas -->
        <div class="metrics-grid">
          <div class="metric-card blue">
            <div class="metric-icon">🏪</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.totals.shops }}</span>
              <span class="metric-label">Negocios totales</span>
            </div>
          </div>
          <div class="metric-card green">
            <div class="metric-icon">👤</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.totals.users }}</span>
              <span class="metric-label">Usuarios totales</span>
            </div>
          </div>
          <div class="metric-card orange">
            <div class="metric-icon">📈</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.growth.newShopsLast30 }}</span>
              <span class="metric-label">Nuevos negocios (30d)</span>
            </div>
          </div>
          <div class="metric-card purple">
            <div class="metric-icon">🔥</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.activity.activeShopsLast7 }}</span>
              <span class="metric-label">Activos últimos 7 días</span>
            </div>
          </div>
          <div class="metric-card teal">
            <div class="metric-icon">📅</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.activity.activeShopsLast30 }}</span>
              <span class="metric-label">Activos últimos 30 días</span>
            </div>
          </div>
          <div class="metric-card red">
            <div class="metric-icon">💤</div>
            <div class="metric-body">
              <span class="metric-value">{{ store.metrics.activity.inactiveShops }}</span>
              <span class="metric-label">Inactivos (+15 días)</span>
            </div>
          </div>
        </div>

        <!-- Distribución de planes -->
        <div class="section-card">
          <h2 class="section-title">Distribución de Planes</h2>
          <div class="plan-distribution">
            <div v-for="(plan, key) in planDistributionItems" :key="key" class="plan-dist-item">
              <div class="plan-dist-header">
                <span :class="['plan-badge', `plan-${key.toLowerCase()}`]">{{ key }}</span>
                <span class="plan-dist-count">{{ plan.count }}</span>
              </div>
              <div class="plan-dist-bar-bg">
                <div
                  class="plan-dist-bar"
                  :class="`bar-${key.toLowerCase()}`"
                  :style="{ width: plan.pct + '%' }"
                ></div>
              </div>
              <span class="plan-dist-pct">{{ plan.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Referencia de Planes -->
        <div class="section-card">
          <h2 class="section-title">Referencia de Planes</h2>
          <p class="section-subtitle">Qué incluye cada plan y sus límites. Usá esta referencia para asignar el plan correcto a cada negocio.</p>
          <div class="plans-reference-grid">
            <!-- FREE -->
            <div class="plan-ref-card plan-ref-free">
              <div class="plan-ref-header">
                <span class="plan-badge plan-free">FREE</span>
                <span class="plan-ref-price">$0 / mes</span>
              </div>
              <p class="plan-ref-tagline">Perfecto para empezar.</p>
              <ul class="plan-ref-features">
                <li>✓ Hasta <strong>20 productos</strong> en inventario</li>
                <li>✓ Categorías y proveedores</li>
                <li>✓ Ventas e historial de ventas</li>
                <li>✓ Pedidos y clientes</li>
                <li>✓ <strong>1 usuario</strong></li>
                <li class="feature-no">✗ Sin egresos/ingresos</li>
                <li class="feature-no">✗ Sin caja, reportes ni tienda</li>
                <li class="feature-no">✗ Sin asistente IA</li>
              </ul>
            </div>
            <!-- BASIC -->
            <div class="plan-ref-card plan-ref-basic">
              <div class="plan-ref-header">
                <span class="plan-badge plan-basic">BASIC</span>
                <span class="plan-ref-price">$20.000 / mes</span>
              </div>
              <p class="plan-ref-tagline">Para pequeños negocios.</p>
              <ul class="plan-ref-features">
                <li>✓ Todo lo del plan FREE</li>
                <li>✓ Productos <strong>ilimitados</strong></li>
                <li>✓ Historial de compras y egresos</li>
                <li>✓ <strong>2 usuarios</strong></li>
                <li class="feature-no">✗ Sin caja ni reportes</li>
                <li class="feature-no">✗ Sin tienda virtual</li>
                <li class="feature-no">✗ Sin asistente IA</li>
              </ul>
            </div>
            <!-- MEDIUM -->
            <div class="plan-ref-card plan-ref-medium">
              <div class="plan-ref-header">
                <span class="plan-badge plan-medium">MEDIUM</span>
                <span class="plan-ref-price">$35.000 / mes</span>
                <span class="plan-ref-popular">⭐ Más popular</span>
              </div>
              <p class="plan-ref-tagline">En crecimiento.</p>
              <ul class="plan-ref-features">
                <li>✓ Todo lo del plan BASIC</li>
                <li>✓ Sistema de <strong>caja</strong></li>
                <li>✓ <strong>Reportes</strong> y analíticas</li>
                <li>✓ <strong>Tienda virtual</strong> pública</li>
                <li>✓ Notificaciones de stock</li>
                <li>✓ Config. avanzada de tienda</li>
                <li>✓ <strong>3 usuarios</strong></li>
                <li class="feature-no">✗ Sin asistente IA</li>
              </ul>
            </div>
            <!-- PREMIUM -->
            <div class="plan-ref-card plan-ref-premium">
              <div class="plan-ref-header">
                <span class="plan-badge plan-premium">PREMIUM</span>
                <span class="plan-ref-price">$55.000 / mes</span>
                <span class="plan-ref-ai">✦ Con IA</span>
              </div>
              <p class="plan-ref-tagline">Todo el poder de la inteligencia artificial.</p>
              <ul class="plan-ref-features">
                <li>✓ Todo lo del plan MEDIUM</li>
                <li>✓ <strong>Asistente IA</strong> Distri incluido</li>
                <li>✓ Múltiples sucursales</li>
                <li>✓ Usuarios <strong>ilimitados</strong></li>
                <li>✓ Soporte prioritario</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="section-card">
          <h2 class="section-title">Acciones del Sistema</h2>
          <div class="quick-actions">
            <div class="action-card danger">
              <h3>Limpiar Inactivos</h3>
              <p>Elimina negocios y usuarios sin actividad en 15+ días</p>
              <button class="btn-danger" @click="confirmDeleteInactive" :disabled="bulkActionLoading">
                {{ bulkActionLoading ? 'Eliminando...' : '🗑 Eliminar Inactivos' }}
              </button>
            </div>
            <div class="action-card warning">
              <h3>Actualizar Plan Masivo</h3>
              <p>Cambia el plan de todos los negocios a la vez</p>
              <div class="bulk-plan-row">
                <select v-model="bulkPlan" class="form-select">
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
                <button class="btn-warning" @click="confirmBulkPlan" :disabled="bulkActionLoading">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── TAB: NEGOCIOS ─────────────────────────────────────────────────── -->
    <div v-if="store.activeTab === 'shops'" class="tab-content">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="store.shopsSearch"
            @input="debouncedFetchShops"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          />
          <button v-if="store.shopsSearch" class="clear-btn" @click="clearShopsSearch">✕</button>
        </div>
        <select v-model="store.shopsPlanFilter" @change="store.fetchShops(true)" class="form-select">
          <option value="">Todos los planes</option>
          <option value="FREE">FREE</option>
          <option value="BASIC">BASIC</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
        <select v-model="store.shopsStatusFilter" @change="store.fetchShops(true)" class="form-select">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="blocked">Bloqueado</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="table-card">
        <div v-if="store.shopsLoading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <div class="table-scroll">
          <table class="data-table" :class="{ faded: store.shopsLoading }">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Usuarios</th>
                <th>Último login</th>
                <th>Tienda</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.shops.length === 0 && !store.shopsLoading">
                <td colspan="8" class="empty-row">Sin resultados</td>
              </tr>
              <tr v-for="shop in store.shops" :key="shop._id" class="table-row">
                <td>
                  <div class="shop-name-cell">
                    <strong>{{ shop.name }}</strong>
                    <small>{{ shop.city || '—' }}, {{ shop.province || '—' }}</small>
                  </div>
                </td>
                <td class="text-muted">{{ shop.email }}</td>
                <td>
                  <select
                    :value="shop.plan"
                    @change="changePlan(shop._id, $event.target.value)"
                    :class="['plan-select', `plan-${(shop.plan || 'free').toLowerCase()}`]"
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </td>
                <td>
                  <select
                    :value="shop.status"
                    @change="changeStatus(shop._id, $event.target.value)"
                    :class="['status-select', `status-${(shop.status || 'active').toLowerCase()}`]"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="demo">Demo</option>
                  </select>
                </td>
                <td class="text-center">
                  <span class="badge-neutral">{{ shop.userCount ?? 0 }}</span>
                </td>
                <td class="text-muted text-sm">{{ formatDate(shop.lastLogin) }}</td>
                <td>
                  <span :class="['status-dot', shop.storeActive ? 'dot-green' : 'dot-red']">
                    {{ shop.storeActive ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td>
                  <div class="actions-row">
                    <button class="btn-icon-info" @click="openShopDetail(shop._id)" title="Ver detalle">👁</button>
                    <button class="btn-icon-danger" @click="confirmDeleteShop(shop)" title="Eliminar">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Paginación shops -->
        <div class="pagination-bar">
          <span class="pagination-info">
            {{ shopsItemsInfo }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" @click="store.shopsPrevPage()" :disabled="store.shopsPagination.page === 1">‹</button>
            <button
              v-for="p in store.shopsVisiblePages"
              :key="p"
              :class="['page-btn', { active: p === store.shopsPagination.page }]"
              @click="store.shopsGoToPage(p)"
            >{{ p }}</button>
            <button class="page-btn" @click="store.shopsNextPage()" :disabled="store.shopsPagination.page === store.shopsPagination.totalPages">›</button>
          </div>
          <select class="form-select small" v-model="shopsLimitModel" @change="changeShopsLimit">
            <option value="10">10 / pág</option>
            <option value="20">20 / pág</option>
            <option value="50">50 / pág</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ─── TAB: USUARIOS ─────────────────────────────────────────────────── -->
    <div v-if="store.activeTab === 'users'" class="tab-content">
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="store.usersSearch"
            @input="debouncedFetchUsers"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          />
          <button v-if="store.usersSearch" class="clear-btn" @click="clearUsersSearch">✕</button>
        </div>
      </div>

      <div class="table-card">
        <div v-if="store.usersLoading" class="loading-overlay"><div class="spinner"></div></div>
        <div class="table-scroll">
          <table class="data-table" :class="{ faded: store.usersLoading }">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Negocio</th>
                <th>Rol</th>
                <th>Último login</th>
                <th>Email verificado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.users.length === 0 && !store.usersLoading">
                <td colspan="7" class="empty-row">Sin resultados</td>
              </tr>
              <tr v-for="user in store.users" :key="user._id" class="table-row">
                <td><strong>{{ user.username }}</strong></td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span v-if="user.shopId">
                    <strong>{{ user.shopId.name || '—' }}</strong>
                    <br/>
                    <span :class="['plan-badge-sm', `plan-${(user.shopId.plan || 'free').toLowerCase()}`]">
                      {{ user.shopId.plan || '—' }}
                    </span>
                  </span>
                  <span v-else class="text-muted">Sin negocio</span>
                </td>
                <td>
                  <span class="role-badge">{{ user.role }}</span>
                </td>
                <td class="text-muted text-sm">{{ formatDate(user.lastLogin) }}</td>
                <td>
                  <span :class="['status-dot', user.isEmailVerified ? 'dot-green' : 'dot-yellow']">
                    {{ user.isEmailVerified ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon-danger" @click="confirmDeleteUser(user)" title="Eliminar">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar">
          <span class="pagination-info">{{ usersItemsInfo }}</span>
          <div class="pagination-controls">
            <button class="page-btn" @click="store.usersPrevPage()" :disabled="store.usersPagination.page === 1">‹</button>
            <button
              v-for="p in store.usersVisiblePages"
              :key="p"
              :class="['page-btn', { active: p === store.usersPagination.page }]"
              @click="store.usersGoToPage(p)"
            >{{ p }}</button>
            <button class="page-btn" @click="store.usersNextPage()" :disabled="store.usersPagination.page === store.usersPagination.totalPages">›</button>
          </div>
          <select class="form-select small" v-model="usersLimitModel" @change="changeUsersLimit">
            <option value="10">10 / pág</option>
            <option value="20">20 / pág</option>
            <option value="50">50 / pág</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ─── MODAL: DETALLE NEGOCIO ────────────────────────────────────────── -->
    <div v-if="showShopModal" class="modal-overlay" @click.self="showShopModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <div class="modal-header-left">
            <h2>Detalle del Negocio</h2>
            <span v-if="store.selectedShop" :class="['plan-badge', `plan-${(store.selectedShop.shop.plan || 'free').toLowerCase()}`]">
              {{ store.selectedShop.shop.plan }}
            </span>
          </div>
          <button class="modal-close" @click="showShopModal = false">✕</button>
        </div>

        <div v-if="store.shopDetailLoading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="store.selectedShop" class="modal-body">
          <!-- Info del negocio -->
          <div class="detail-section-title">Información del negocio</div>
          <div class="detail-grid">
            <div class="detail-item"><label>Nombre</label><span>{{ store.selectedShop.shop.name }}</span></div>
            <div class="detail-item"><label>Email</label><span>{{ store.selectedShop.shop.email }}</span></div>
            <div class="detail-item"><label>Teléfono</label><span>{{ store.selectedShop.shop.phone || '—' }}</span></div>
            <div class="detail-item"><label>Ciudad</label><span>{{ store.selectedShop.shop.city || '—' }}</span></div>
            <div class="detail-item"><label>Provincia</label><span>{{ store.selectedShop.shop.province || '—' }}</span></div>
            <div class="detail-item">
              <label>Plan</label>
              <div class="detail-plan-edit">
                <select
                  :value="store.selectedShop.shop.plan"
                  @change="changeModalPlan(store.selectedShop.shop._id, $event.target.value)"
                  :class="['plan-select', `plan-${(store.selectedShop.shop.plan || 'free').toLowerCase()}`]"
                >
                  <option value="FREE">FREE — Gratuito ($0/mes)</option>
                  <option value="BASIC">BASIC — Básico ($20.000/mes)</option>
                  <option value="MEDIUM">MEDIUM — Medio ($35.000/mes)</option>
                  <option value="PREMIUM">PREMIUM — Plan IA ($55.000/mes)</option>
                </select>
              </div>
            </div>
            <div class="detail-item">
              <label>Estado</label>
              <span :class="['status-dot', store.selectedShop.shop.status === 'active' ? 'dot-green' : store.selectedShop.shop.status === 'blocked' ? 'dot-red' : 'dot-yellow']">
                {{ store.selectedShop.shop.status || '—' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Tienda virtual</label>
              <span :class="['status-dot', store.selectedShop.shop.storeActive ? 'dot-green' : 'dot-red']">
                {{ store.selectedShop.shop.storeActive ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <div class="detail-item"><label>Creado</label><span>{{ formatDate(store.selectedShop.shop.createdAt) }}</span></div>
            <div class="detail-item"><label>Último login</label><span>{{ formatDate(store.selectedShop.shop.lastLogin) }}</span></div>
          </div>

          <!-- Usuarios vinculados -->
          <div class="detail-section-title" style="margin-top: 1.25rem;">
            Usuarios vinculados
            <span class="users-count-badge">{{ store.selectedShop.users.length }}</span>
          </div>

          <div v-if="store.selectedShop.users.length === 0" class="empty-users">
            Este negocio no tiene usuarios vinculados.
          </div>
          <div v-else class="users-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Email verif.</th>
                  <th>Último login</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in store.selectedShop.users" :key="user._id" class="table-row">
                  <td><strong>{{ user.username }}</strong></td>
                  <td class="text-muted text-sm">{{ user.email }}</td>
                  <td><span class="role-badge">{{ user.role }}</span></td>
                  <td>
                    <span :class="['status-dot', user.isEmailVerified ? 'dot-green' : 'dot-yellow']">
                      {{ user.isEmailVerified ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="text-muted text-sm">{{ formatDate(user.lastLogin) }}</td>
                  <td>
                    <button class="btn-icon-danger" @click="confirmDeleteUserFromModal(user)" title="Eliminar usuario">🗑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer del modal -->
        <div v-if="store.selectedShop && !store.shopDetailLoading" class="modal-footer-actions">
          <button class="btn-secondary" @click="showShopModal = false">Cerrar</button>
          <button
            class="btn-danger-modal"
            @click="confirmDeleteShopFromModal(store.selectedShop.shop)"
          >
            🗑 Eliminar negocio y sus usuarios
          </button>
        </div>
      </div>
    </div>

    <!-- ─── MODAL: PREVIEW INACTIVOS ────────────────────────────────────── -->
    <div v-if="inactivePreview.show" class="modal-overlay" @click.self="inactivePreview.show = false">
      <div class="modal-panel modal-wide">
        <div class="modal-header">
          <h2>Previsualización — Negocios a eliminar</h2>
          <button class="modal-close" @click="inactivePreview.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="inactivePreview.loading" class="loading-center">
            <div class="spinner"></div>
            <p>Calculando inactivos...</p>
          </div>
          <template v-else-if="inactivePreview.data">
            <!-- Resumen -->
            <div class="preview-summary">
              <div class="preview-stat danger">
                <span class="preview-stat-value">{{ inactivePreview.data.summary.totalShops }}</span>
                <span class="preview-stat-label">Negocios a eliminar</span>
              </div>
              <div class="preview-stat danger">
                <span class="preview-stat-value">{{ inactivePreview.data.summary.totalUsers }}</span>
                <span class="preview-stat-label">Usuarios a eliminar</span>
              </div>
              <div class="preview-stat neutral">
                <span class="preview-stat-value">15d</span>
                <span class="preview-stat-label">Sin actividad desde</span>
              </div>
            </div>

            <div v-if="inactivePreview.data.summary.totalShops === 0" class="empty-preview">
              ✓ No hay negocios inactivos para eliminar.
            </div>

            <template v-else>
              <p class="preview-warning">
                ⚠ Esta acción eliminará permanentemente los siguientes negocios y todos sus usuarios.
              </p>
              <div class="preview-table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Negocio</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Usuarios</th>
                      <th>Último login</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="shop in inactivePreview.data.shops" :key="shop._id" class="table-row">
                      <td><strong>{{ shop.name }}</strong></td>
                      <td class="text-muted">{{ shop.email }}</td>
                      <td>
                        <span :class="['plan-badge', `plan-${(shop.plan || 'free').toLowerCase()}`]">
                          {{ shop.plan || '—' }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="badge-neutral">{{ shop.userCount }}</span>
                      </td>
                      <td class="text-muted text-sm">{{ formatDate(shop.lastLogin) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="preview-footer">
                <button class="btn-secondary" @click="inactivePreview.show = false">Cancelar</button>
                <button class="btn-danger" @click="executeDeleteInactive" :disabled="inactivePreview.deleting">
                  {{ inactivePreview.deleting ? 'Eliminando...' : `🗑 Eliminar ${inactivePreview.data.summary.totalShops} negocios` }}
                </button>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- ─── MODAL: CONFIRMACIÓN ───────────────────────────────────────────── -->
    <div v-if="confirmModal.show" class="modal-overlay" @click.self="confirmModal.show = false">
      <div class="confirm-panel">
        <div class="confirm-icon">⚠</div>
        <h3>{{ confirmModal.title }}</h3>
        <p>{{ confirmModal.message }}</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="confirmModal.show = false">Cancelar</button>
          <button class="btn-danger" @click="executeConfirm" :disabled="confirmModal.loading">
            {{ confirmModal.loading ? 'Procesando...' : confirmModal.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from "@/stores/adminStore";
import moment from "moment";

export default {
  data() {
    return {
      store: useAdminStore(),
      tabs: [
        { id: "metrics", label: "Métricas", icon: "📊" },
        { id: "shops", label: "Negocios", icon: "🏪" },
        { id: "users", label: "Usuarios", icon: "👥" },
      ],
      isRefreshing: false,
      bulkActionLoading: false,
      bulkPlan: "MEDIUM",
      shopsLimitModel: "20",
      usersLimitModel: "20",
      showShopModal: false,
      searchDebounce: null,
      confirmModal: {
        show: false,
        title: "",
        message: "",
        confirmLabel: "Confirmar",
        loading: false,
        action: null,
      },
      inactivePreview: {
        show: false,
        loading: false,
        deleting: false,
        data: null,
      },
    };
  },

  computed: {
    planDistributionItems() {
      if (!this.store.metrics) return {};
      const total = this.store.metrics.totals.shops || 1;
      const plans = this.store.metrics.plans;
      return Object.fromEntries(
        Object.entries(plans).map(([key, count]) => [
          key,
          { count, pct: Math.round((count / total) * 100) },
        ])
      );
    },
    shopsItemsInfo() {
      const { page, limit, total } = this.store.shopsPagination;
      if (!total) return "Sin resultados";
      const start = (page - 1) * limit + 1;
      const end = Math.min(page * limit, total);
      return `Mostrando ${start}–${end} de ${total} negocios`;
    },
    usersItemsInfo() {
      const { page, limit, total } = this.store.usersPagination;
      if (!total) return "Sin resultados";
      const start = (page - 1) * limit + 1;
      const end = Math.min(page * limit, total);
      return `Mostrando ${start}–${end} de ${total} usuarios`;
    },
  },

  methods: {
    formatDate(date) {
      if (!date) return "—";
      return moment(date).format("DD/MM/YY HH:mm");
    },

    async switchTab(tabId) {
      this.store.activeTab = tabId;
      if (tabId === "metrics" && !this.store.metrics) await this.store.fetchMetrics();
      if (tabId === "shops" && !this.store.shops.length) await this.store.fetchShops();
      if (tabId === "users" && !this.store.users.length) await this.store.fetchUsers();
    },

    async refreshAll() {
      this.isRefreshing = true;
      await Promise.all([
        this.store.fetchMetrics(),
        this.store.fetchShops(),
        this.store.fetchUsers(),
      ]);
      this.isRefreshing = false;
    },

    debouncedFetchShops() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => this.store.fetchShops(true), 400);
    },
    debouncedFetchUsers() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => this.store.fetchUsers(true), 400);
    },

    clearShopsSearch() {
      this.store.shopsSearch = "";
      this.store.fetchShops(true);
    },
    clearUsersSearch() {
      this.store.usersSearch = "";
      this.store.fetchUsers(true);
    },

    async changePlan(shopId, plan) {
      await this.store.updateShopPlan(shopId, plan);
    },
    async changeModalPlan(shopId, plan) {
      await this.store.updateShopPlan(shopId, plan);
      // Actualizar también el objeto local del modal para que se refleje en el badge
      if (this.store.selectedShop?.shop) {
        this.store.selectedShop.shop.plan = plan;
      }
    },
    async changeStatus(shopId, status) {
      await this.store.updateShopStatus(shopId, status);
    },

    async openShopDetail(shopId) {
      this.showShopModal = true;
      await this.store.fetchShopDetail(shopId);
    },

    changeShopsLimit() {
      this.store.shopsPagination.limit = parseInt(this.shopsLimitModel);
      this.store.fetchShops(true);
    },
    changeUsersLimit() {
      this.store.usersPagination.limit = parseInt(this.usersLimitModel);
      this.store.fetchUsers(true);
    },

    confirmDeleteShop(shop) {
      this.confirmModal = {
        show: true,
        title: "Eliminar Negocio",
        message: `¿Eliminás "${shop.name}" y todos sus usuarios? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        loading: false,
        action: async () => {
          await this.store.deleteShop(shop._id);
          await this.store.fetchShops(true);
          await this.store.fetchMetrics();
        },
      };
    },

    confirmDeleteShopFromModal(shop) {
      this.confirmModal = {
        show: true,
        title: "Eliminar Negocio",
        message: `¿Eliminás "${shop.name}" y todos sus ${this.store.selectedShop.users.length} usuario(s)? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        loading: false,
        action: async () => {
          await this.store.deleteShop(shop._id);
          this.showShopModal = false;
          await this.store.fetchShops(true);
          await this.store.fetchMetrics();
        },
      };
    },

    confirmDeleteUserFromModal(user) {
      this.confirmModal = {
        show: true,
        title: "Eliminar Usuario",
        message: `¿Eliminás al usuario "${user.username}" (${user.email})?`,
        confirmLabel: "Eliminar",
        loading: false,
        action: async () => {
          await this.store.deleteUser(user._id);
          // Quitar el usuario de la lista local del modal sin recargar
          if (this.store.selectedShop) {
            this.store.selectedShop.users = this.store.selectedShop.users.filter(
              (u) => u._id !== user._id
            );
          }
        },
      };
    },

    confirmDeleteUser(user) {
      this.confirmModal = {
        show: true,
        title: "Eliminar Usuario",
        message: `¿Eliminás al usuario "${user.username}" (${user.email})?`,
        confirmLabel: "Eliminar",
        loading: false,
        action: async () => {
          await this.store.deleteUser(user._id);
        },
      };
    },

    async confirmDeleteInactive() {
      this.inactivePreview.show = true;
      this.inactivePreview.loading = true;
      this.inactivePreview.data = null;
      this.inactivePreview.deleting = false;
      this.inactivePreview.data = await this.store.previewInactiveShops();
      this.inactivePreview.loading = false;
    },

    async executeDeleteInactive() {
      this.inactivePreview.deleting = true;
      const result = await this.store.deleteInactiveShops();
      this.inactivePreview.deleting = false;
      this.inactivePreview.show = false;
      if (result?.data) {
        this.store.successMessage = `Eliminados ${result.data.shopsDeleted} negocios y ${result.data.usersDeleted} usuarios`;
        await this.store.fetchMetrics();
        await this.store.fetchShops(true);
      }
    },

    confirmBulkPlan() {
      this.confirmModal = {
        show: true,
        title: "Actualización Masiva de Plan",
        message: `¿Actualizás TODOS los negocios al plan ${this.bulkPlan}?`,
        confirmLabel: "Aplicar",
        loading: false,
        action: async () => {
          this.bulkActionLoading = true;
          await this.store.updateAllShopsPlan(this.bulkPlan);
          this.bulkActionLoading = false;
        },
      };
    },

    async executeConfirm() {
      this.confirmModal.loading = true;
      try {
        await this.confirmModal.action();
      } finally {
        this.confirmModal.loading = false;
        this.confirmModal.show = false;
      }
    },
  },

  async mounted() {
    await this.store.fetchMetrics();
    await this.store.fetchShops();
  },
};
</script>

<style scoped>
/* ─── BASE ─────────────────────────────────────────────────────────────────── */
.admin-root {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  background: #f4f6f9;
  min-height: 100vh;
  padding: 1.5rem;
  color: #1f2937;
}

/* ─── HEADER ────────────────────────────────────────────────────────────────── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.admin-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.admin-logo { font-size: 2rem; }
.admin-header h1 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #111; }
.admin-header p { font-size: .8rem; color: #6b7280; margin: 0; }
.btn-refresh {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: .85rem;
  cursor: pointer;
  transition: background .2s;
}
.btn-refresh:hover:not(:disabled) { background: #f3f4f6; }
.btn-refresh:disabled { opacity: .6; cursor: not-allowed; }
.spinning { display: inline-block; animation: spin 1s linear infinite; }

/* ─── TOAST ─────────────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  padding: .75rem 1.25rem;
  border-radius: 8px;
  font-size: .875rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  max-width: 380px;
}
.toast-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.toast-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.toast-enter-active, .toast-leave-active { transition: all .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(30px); }

/* ─── TABS ──────────────────────────────────────────────────────────────────── */
.tabs-bar {
  display: flex;
  gap: .5rem;
  margin-bottom: 1.25rem;
  background: #fff;
  padding: .5rem;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  padding: .65rem 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: .875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all .2s;
}
.tab-btn:hover { background: #f3f4f6; color: #374151; }
.tab-btn.active { background: #f9931e; color: #fff; }
.tab-icon { font-size: 1rem; }

/* ─── TAB CONTENT ───────────────────────────────────────────────────────────── */
.tab-content { animation: fadeIn .2s ease; }

/* ─── MÉTRICAS ──────────────────────────────────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.metric-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  border-left: 4px solid transparent;
}
.metric-card.blue { border-left-color: #3b82f6; }
.metric-card.green { border-left-color: #22c55e; }
.metric-card.orange { border-left-color: #f9931e; }
.metric-card.purple { border-left-color: #8b5cf6; }
.metric-card.teal { border-left-color: #14b8a6; }
.metric-card.red { border-left-color: #ef4444; }
.metric-icon { font-size: 1.75rem; }
.metric-body { display: flex; flex-direction: column; }
.metric-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
.metric-label { font-size: .75rem; color: #6b7280; margin-top: .2rem; }

/* ─── SECTION CARD ──────────────────────────────────────────────────────────── */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  color: #111;
}

/* ─── DISTRIBUCIÓN PLANES ───────────────────────────────────────────────────── */
.plan-distribution {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.plan-dist-item { display: flex; flex-direction: column; gap: .4rem; }
.plan-dist-header { display: flex; justify-content: space-between; align-items: center; }
.plan-dist-count { font-weight: 700; font-size: 1.1rem; }
.plan-dist-bar-bg { height: 8px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
.plan-dist-bar { height: 100%; border-radius: 99px; transition: width .5s ease; }
.bar-free { background: #9ca3af; }
.bar-basic { background: #60a5fa; }
.bar-medium { background: #f9931e; }
.bar-premium { background: #f59e0b; }
.plan-dist-pct { font-size: .75rem; color: #6b7280; }

/* ─── ACCIONES RÁPIDAS ──────────────────────────────────────────────────────── */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.action-card {
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid;
}
.action-card.danger { background: #fff5f5; border-color: #fecaca; }
.action-card.warning { background: #fffbeb; border-color: #fed7aa; }
.action-card h3 { font-size: .9rem; font-weight: 700; margin: 0 0 .4rem; }
.action-card p { font-size: .8rem; color: #6b7280; margin: 0 0 1rem; }
.bulk-plan-row { display: flex; gap: .5rem; }
.btn-danger {
  padding: .5rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }
.btn-warning {
  padding: .5rem 1rem;
  background: #f9931e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
}
.btn-warning:hover:not(:disabled) { background: #e8821a; }

/* ─── FILTROS ───────────────────────────────────────────────────────────────── */
.filters-bar {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: .4rem .75rem;
  flex: 1;
  min-width: 220px;
  gap: .4rem;
}
.search-icon { color: #9ca3af; font-style: normal; }
.search-input { flex: 1; border: none; outline: none; font-size: .875rem; background: transparent; }
.clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: .85rem; }
.form-select {
  padding: .45rem .75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: .875rem;
  color: #374151;
  cursor: pointer;
}
.form-select.small { font-size: .8rem; padding: .3rem .5rem; }

/* ─── TABLA ─────────────────────────────────────────────────────────────────── */
.table-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  overflow: hidden;
  position: relative;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.data-table.faded { opacity: .6; }
.data-table th {
  background: #f9fafb;
  padding: .75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;
}
.data-table td { padding: .7rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #fafafa; }
.empty-row { text-align: center; color: #9ca3af; padding: 2rem; }

.shop-name-cell { display: flex; flex-direction: column; }
.shop-name-cell small { color: #9ca3af; font-size: .75rem; }
.text-muted { color: #6b7280; }
.text-sm { font-size: .8rem; }
.text-center { text-align: center; }

/* ─── BADGES / SELECTS INLINE ───────────────────────────────────────────────── */
.plan-select, .status-select {
  padding: .2rem .5rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: .75rem;
  font-weight: 600;
  cursor: pointer;
  background: #fff;
}
.plan-select.plan-free, .plan-badge.plan-free { background: #f3f4f6; color: #4b5563; border-color: #d1d5db; }
.plan-select.plan-basic, .plan-badge.plan-basic { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
.plan-select.plan-medium, .plan-badge.plan-medium { background: #ffedd5; color: #ea580c; border-color: #fed7aa; }
.plan-select.plan-premium, .plan-badge.plan-premium { background: #fef3c7; color: #d97706; border-color: #fde68a; }

.plan-badge {
  padding: .2rem .5rem;
  border-radius: 6px;
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid transparent;
}
.plan-badge-sm {
  padding: .15rem .4rem;
  border-radius: 4px;
  font-size: .7rem;
  font-weight: 600;
}
.plan-badge-sm.plan-free { background: #f3f4f6; color: #4b5563; }
.plan-badge-sm.plan-basic { background: #dbeafe; color: #1d4ed8; }
.plan-badge-sm.plan-medium { background: #ffedd5; color: #ea580c; }
.plan-badge-sm.plan-premium { background: #fef3c7; color: #d97706; }

.status-select.status-active { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.status-select.status-inactive { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.status-select.status-blocked { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.status-select.status-demo { background: #fef3c7; color: #d97706; border-color: #fde68a; }

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  font-size: .75rem;
  font-weight: 600;
  padding: .2rem .5rem;
  border-radius: 6px;
}
.dot-green { background: #dcfce7; color: #166534; }
.dot-green::before { content: "●"; color: #22c55e; }
.dot-red { background: #fee2e2; color: #991b1b; }
.dot-red::before { content: "●"; color: #ef4444; }
.dot-yellow { background: #fef3c7; color: #92400e; }
.dot-yellow::before { content: "●"; color: #f59e0b; }

.role-badge {
  padding: .2rem .5rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: .75rem;
  font-weight: 600;
}
.badge-neutral {
  display: inline-block;
  padding: .15rem .5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: .8rem;
  font-weight: 600;
}

.actions-row { display: flex; gap: .4rem; }
.btn-icon-info, .btn-icon-danger {
  background: none;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
}
.btn-icon-info:hover { background: #dbeafe; }
.btn-icon-danger:hover { background: #fee2e2; }

/* ─── PAGINACIÓN ────────────────────────────────────────────────────────────── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem 1rem;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
  gap: .5rem;
}
.pagination-info { font-size: .8rem; color: #6b7280; }
.pagination-controls { display: flex; gap: .3rem; }
.page-btn {
  padding: .3rem .65rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: .8rem;
  cursor: pointer;
  transition: all .2s;
  min-width: 2rem;
  text-align: center;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; }
.page-btn.active { background: #f9931e; color: #fff; border-color: #f9931e; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ─── MODALES ───────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-panel {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}
.modal-header h2 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.modal-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #9ca3af;
  padding: .25rem;
}
.modal-body { padding: 1.5rem; }

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: .75rem;
  margin-bottom: 1.5rem;
}
.detail-item { display: flex; flex-direction: column; gap: .2rem; }
.detail-item label { font-size: .75rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
.detail-item span { font-size: .9rem; font-weight: 500; }

.users-subtitle { font-size: .95rem; font-weight: 700; margin: 0 0 .75rem; }
.users-list { display: flex; flex-direction: column; gap: .5rem; }
.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .6rem .75rem;
  background: #f9fafb;
  border-radius: 8px;
}
.user-row strong { display: block; font-size: .875rem; }
.user-row small { color: #9ca3af; font-size: .75rem; }
.user-row-right { display: flex; align-items: center; gap: .5rem; }

.modal-wide { max-width: 860px; }

.preview-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.preview-stat {
  flex: 1;
  min-width: 120px;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
}
.preview-stat.danger { background: #fff5f5; border: 1px solid #fecaca; }
.preview-stat.neutral { background: #f9fafb; border: 1px solid #e5e7eb; }
.preview-stat-value { font-size: 1.75rem; font-weight: 700; color: #111; }
.preview-stat.danger .preview-stat-value { color: #ef4444; }
.preview-stat-label { font-size: .75rem; color: #6b7280; text-align: center; }

.preview-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: .75rem 1rem;
  font-size: .875rem;
  color: #92400e;
  margin-bottom: 1rem;
}
.preview-table-wrap {
  max-height: 340px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1.25rem;
}
.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
}
.empty-preview {
  text-align: center;
  padding: 2rem;
  color: #22c55e;
  font-weight: 600;
  font-size: 1rem;
}

.confirm-panel {
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.confirm-icon { font-size: 2.5rem; margin-bottom: .75rem; }
.confirm-panel h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 .5rem; }
.confirm-panel p { font-size: .875rem; color: #6b7280; margin: 0 0 1.5rem; }
.confirm-actions { display: flex; gap: .75rem; justify-content: center; }
.btn-secondary {
  padding: .5rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: .875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
}
.btn-secondary:hover { background: #f3f4f6; }

/* ─── LOADING ───────────────────────────────────────────────────────────────── */
.loading-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f3f4f6;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ─── REFERENCIA DE PLANES ──────────────────────────────────────────────────── */
.section-subtitle {
  font-size: .82rem;
  color: #6b7280;
  margin: -.75rem 0 1.25rem;
}
.plans-reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.plan-ref-card {
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  border: 1.5px solid transparent;
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.plan-ref-free    { background: #f9fafb; border-color: #e5e7eb; }
.plan-ref-basic   { background: #eff6ff; border-color: #bfdbfe; }
.plan-ref-medium  { background: #fff7ed; border-color: #fed7aa; }
.plan-ref-premium { background: #fdf4ff; border-color: #e9d5ff; }

.plan-ref-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}
.plan-ref-price {
  font-size: .75rem;
  font-weight: 600;
  color: #374151;
}
.plan-ref-popular {
  font-size: .68rem;
  font-weight: 700;
  color: #c2410c;
  background: #ffedd5;
  padding: .1rem .4rem;
  border-radius: 999px;
}
.plan-ref-ai {
  font-size: .68rem;
  font-weight: 700;
  color: #6d28d9;
  background: #ede9fe;
  padding: .1rem .4rem;
  border-radius: 999px;
}
.plan-ref-tagline {
  font-size: .78rem;
  color: #6b7280;
  margin: 0;
}
.plan-ref-features {
  list-style: none;
  padding: 0;
  margin: .25rem 0 0;
  display: flex;
  flex-direction: column;
  gap: .3rem;
}
.plan-ref-features li {
  font-size: .8rem;
  color: #374151;
}
.plan-ref-features li.feature-no {
  color: #9ca3af;
}

/* Plan editable en modal */
.detail-plan-edit {
  display: flex;
  align-items: center;
  gap: .5rem;
}

/* ─── MODAL DETALLE — MEJORAS ───────────────────────────────────────────────── */
.modal-header-left {
  display: flex;
  align-items: center;
  gap: .6rem;
}

.detail-section-title {
  font-size: .78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: #6b7280;
  margin-bottom: .75rem;
  display: flex;
  align-items: center;
  gap: .4rem;
}

.users-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #374151;
  font-size: .7rem;
  font-weight: 700;
  border-radius: 999px;
  padding: .1rem .5rem;
  text-transform: none;
  letter-spacing: 0;
}

.empty-users {
  font-size: .85rem;
  color: #9ca3af;
  padding: 1rem;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
}

.users-table-wrap {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.users-table-wrap .data-table {
  margin: 0;
}

.modal-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.btn-danger-modal {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .6rem 1.1rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}

.btn-danger-modal:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* ─── RESPONSIVE ────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .admin-root { padding: .75rem; }
  .admin-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .admin-header-right { width: 100%; }
  .btn-refresh { width: 100%; justify-content: center; }
  .metrics-grid { grid-template-columns: repeat(1, 1fr); }
  .tabs-bar { gap: .25rem; flex-wrap: wrap; }
  .tab-btn { font-size: .75rem; padding: .5rem .5rem; }
  .pagination-bar { flex-direction: column; align-items: stretch; }
}
</style>
