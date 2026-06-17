<template>
  <div class="dashboard-div">
    <!-- Header con filtros -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard Central de Sucursales</h1>
      <div class="header-controls">
        <div class="date-range-picker">
          <input 
            type="date" 
            v-model="dateRange.start" 
            class="date-input"
            @change="updateDateRange"
          >
          <span class="date-separator">-</span>
          <input 
            type="date" 
            v-model="dateRange.end" 
            class="date-input"
            @change="updateDateRange"
          >
        </div>
        <select v-model="selectedPeriod" class="period-select" @change="updatePeriod">
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="quarter">Trimestre</option>
          <option value="year">Este año</option>
          <option value="custom">Personalizado</option>
        </select>
        <select v-model="comparisonMode" class="comparison-select">
          <option value="previous">vs Período anterior</option>
          <option value="lastYear">vs Año anterior</option>
          <option value="budget">vs Presupuesto</option>
        </select>
        <button @click="toggleRealTime" :class="['realtime-btn', { active: isRealTimeEnabled }]">
          {{ isRealTimeEnabled ? 'Tiempo Real ON' : 'Tiempo Real OFF' }}
        </button>
        <button @click="exportData" class="export-btn">Exportar</button>
        <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
          {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="alerts.length > 0" class="alerts-section">
      <div v-for="alert in alerts" :key="alert.id" :class="['alert', `alert-${alert.type}`]">
        <span class="alert-icon">⚠️</span>
        <span class="alert-message">{{ alert.message }}</span>
        <button @click="dismissAlert(alert.id)" class="alert-close">×</button>
      </div>
    </div>

    <!-- Métricas principales -->
    <div class="metrics-grid">
      <div class="metric-card metric-income">
        <div class="metric-header">
          <h3>Ingresos Totales</h3>
          <span :class="['metric-trend', totalMetrics.income.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.income.trend > 0 ? '+' : '' }}{{ totalMetrics.income.trend }}%
          </span>
        </div>
        <div class="metric-value">${{ formatNumber(totalMetrics.income.value) }}</div>
        <div class="metric-subtitle">{{ getComparisonText() }}</div>
        <div class="metric-sparkline">
          <div v-for="(point, index) in totalMetrics.income.sparkline" :key="index" 
               class="sparkline-bar" 
               :style="{ height: getSparklineHeight(point, totalMetrics.income.sparkline) + '%' }">
          </div>
        </div>
      </div>

      <div class="metric-card metric-expenses">
        <div class="metric-header">
          <h3>Egresos Totales</h3>
          <span :class="['metric-trend', totalMetrics.expenses.trend > 0 ? 'negative' : 'positive']">
            {{ totalMetrics.expenses.trend > 0 ? '+' : '' }}{{ totalMetrics.expenses.trend }}%
          </span>
        </div>
        <div class="metric-value">${{ formatNumber(totalMetrics.expenses.value) }}</div>
        <div class="metric-subtitle">{{ getComparisonText() }}</div>
        <div class="metric-sparkline">
          <div v-for="(point, index) in totalMetrics.expenses.sparkline" :key="index" 
               class="sparkline-bar" 
               :style="{ height: getSparklineHeight(point, totalMetrics.expenses.sparkline) + '%' }">
          </div>
        </div>
      </div>

      <div class="metric-card metric-profit">
        <div class="metric-header">
          <h3>Ganancia Neta</h3>
          <span :class="['metric-trend', totalMetrics.profit.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.profit.trend > 0 ? '+' : '' }}{{ totalMetrics.profit.trend }}%
          </span>
        </div>
        <div class="metric-value">${{ formatNumber(totalMetrics.profit.value) }}</div>
        <div class="metric-subtitle">{{ getComparisonText() }}</div>
        <div class="metric-sparkline">
          <div v-for="(point, index) in totalMetrics.profit.sparkline" :key="index" 
               class="sparkline-bar" 
               :style="{ height: getSparklineHeight(point, totalMetrics.profit.sparkline) + '%' }">
          </div>
        </div>
      </div>

      <div class="metric-card metric-stock">
        <div class="metric-header">
          <h3>Stock Total</h3>
          <span :class="['metric-trend', totalMetrics.stock.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.stock.trend > 0 ? '+' : '' }}{{ totalMetrics.stock.trend }}%
          </span>
        </div>
        <div class="metric-value">{{ formatNumber(totalMetrics.stock.value) }}</div>
        <div class="metric-subtitle">productos</div>
        <div class="metric-sparkline">
          <div v-for="(point, index) in totalMetrics.stock.sparkline" :key="index" 
               class="sparkline-bar" 
               :style="{ height: getSparklineHeight(point, totalMetrics.stock.sparkline) + '%' }">
          </div>
        </div>
      </div>

      <div class="metric-card metric-customers">
        <div class="metric-header">
          <h3>Clientes Activos</h3>
          <span :class="['metric-trend', totalMetrics.customers.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.customers.trend > 0 ? '+' : '' }}{{ totalMetrics.customers.trend }}%
          </span>
        </div>
        <div class="metric-value">{{ formatNumber(totalMetrics.customers.value) }}</div>
        <div class="metric-subtitle">clientes únicos</div>
      </div>

      <div class="metric-card metric-employees">
        <div class="metric-header">
          <h3>Empleados</h3>
          <span :class="['metric-trend', totalMetrics.employees.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.employees.trend > 0 ? '+' : '' }}{{ totalMetrics.employees.trend }}%
          </span>
        </div>
        <div class="metric-value">{{ formatNumber(totalMetrics.employees.value) }}</div>
        <div class="metric-subtitle">total activos</div>
      </div>

      <div class="metric-card metric-transactions">
        <div class="metric-header">
          <h3>Transacciones</h3>
          <span :class="['metric-trend', totalMetrics.transactions.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.transactions.trend > 0 ? '+' : '' }}{{ totalMetrics.transactions.trend }}%
          </span>
        </div>
        <div class="metric-value">{{ formatNumber(totalMetrics.transactions.value) }}</div>
        <div class="metric-subtitle">este período</div>
      </div>

      <div class="metric-card metric-satisfaction">
        <div class="metric-header">
          <h3>Satisfacción</h3>
          <span :class="['metric-trend', totalMetrics.satisfaction.trend > 0 ? 'positive' : 'negative']">
            {{ totalMetrics.satisfaction.trend > 0 ? '+' : '' }}{{ totalMetrics.satisfaction.trend }}%
          </span>
        </div>
        <div class="metric-value">{{ totalMetrics.satisfaction.value }}/5</div>
        <div class="metric-subtitle">promedio general</div>
        <div class="rating-stars">
          <span v-for="n in 5" :key="n" :class="['star', { filled: n <= Math.round(totalMetrics.satisfaction.value) }]">★</span>
        </div>
      </div>
    </div>

    <!-- Gráficos y análisis -->
    <div class="charts-section">
      <!-- Ventas por sucursal -->
      <div class="chart-card chart-large">
        <div class="chart-header">
          <h3 class="chart-title">Ventas por Sucursal</h3>
          <div class="chart-controls">
            <select v-model="salesChartType" class="chart-type-select">
              <option value="bar">Barras</option>
              <option value="line">Líneas</option>
              <option value="area">Área</option>
            </select>
            <button @click="toggleChartAnimation" class="animation-btn">
              {{ chartAnimation ? 'Pausar' : 'Animar' }}
            </button>
          </div>
        </div>
        <div class="chart-container">
          <div v-if="salesChartType === 'bar'" class="bar-chart">
            <div v-for="branch in branches" :key="branch.id" class="bar-item">
              <div class="bar" 
                   :style="{ 
                     height: getBarHeight(branch.sales) + '%',
                     animationDelay: (branch.id * 0.1) + 's'
                   }"
                   :class="{ animated: chartAnimation }">
              </div>
              <div class="bar-label">{{ branch.name }}</div>
              <div class="bar-value">${{ formatNumber(branch.sales) }}</div>
            </div>
          </div>
          <div v-else-if="salesChartType === 'line'" class="line-chart-sales">
            <svg viewBox="0 0 400 200" class="sales-line-svg">
              <defs>
                <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
                </linearGradient>
              </defs>
              <path :d="getSalesLinePath()" fill="none" stroke="#3b82f6" stroke-width="3"/>
              <path :d="getSalesAreaPath()" fill="url(#salesGradient)"/>
              <circle v-for="(branch, index) in branches" :key="branch.id"
                      :cx="index * (380 / (branches.length - 1)) + 10"
                      :cy="190 - (branch.sales / Math.max(...branches.map(b => b.sales)) * 180)"
                      r="4" fill="#3b82f6" class="data-point">
                <title>{{ branch.name }}: ${{ formatNumber(branch.sales) }}</title>
              </circle>
            </svg>
          </div>
        </div>
      </div>

      <!-- Distribución de ganancias (Pie Chart) -->
      <div class="chart-card">
        <h3 class="chart-title">Distribución de Ganancias</h3>
        <div class="chart-container">
          <div class="pie-chart">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" stroke-width="20"/>
              <circle v-for="(segment, index) in profitDistribution" :key="index"
                      cx="100" cy="100" r="80" fill="none" 
                      :stroke="segment.color"
                      stroke-width="20"
                      :stroke-dasharray="segment.dashArray"
                      :stroke-dashoffset="segment.dashOffset"
                      :transform="`rotate(${segment.rotation} 100 100)`"
                      class="pie-segment">
              </circle>
              <text x="100" y="105" text-anchor="middle" class="pie-center-text">
                Ganancias
              </text>
            </svg>
            <div class="pie-legend">
              <div v-for="(segment, index) in profitDistribution" :key="index" class="legend-item">
                <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
                <span class="legend-label">{{ segment.name }}</span>
                <span class="legend-value">${{ formatNumber(segment.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Flujo de caja mensual mejorado -->
      <div class="chart-card">
        <h3 class="chart-title">Flujo de Caja Mensual</h3>
        <div class="chart-container">
          <div class="cash-flow-chart">
            <div class="chart-y-axis">
              <div v-for="tick in cashFlowYTicks" :key="tick" class="y-tick">
                ${{ formatNumber(tick) }}
              </div>
            </div>
            <div class="cash-flow-bars">
              <div v-for="(month, index) in cashFlowData" :key="index" class="cash-flow-item">
                <div class="cash-flow-bar-container">
                  <div class="cash-flow-bar positive" 
                       :style="{ height: getCashFlowBarHeight(month.income) + '%' }"
                       :title="`Ingresos: $${formatNumber(month.income)}`">
                  </div>
                  <div class="cash-flow-bar negative" 
                       :style="{ height: getCashFlowBarHeight(month.expenses) + '%' }"
                       :title="`Egresos: $${formatNumber(month.expenses)}`">
                  </div>
                </div>
                <div class="cash-flow-label">{{ month.month }}</div>
                <div class="cash-flow-net">${{ formatNumber(month.income - month.expenses) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap de rendimiento por sucursal y horario -->
      <div class="chart-card chart-large">
        <h3 class="chart-title">Mapa de Calor - Ventas por Horario</h3>
        <div class="chart-container">
          <div class="heatmap">
            <div class="heatmap-y-axis">
              <div v-for="branch in branches.slice(0, 5)" :key="branch.id" class="heatmap-y-label">
                {{ branch.name }}
              </div>
            </div>
            <div class="heatmap-grid">
              <div v-for="branch in branches.slice(0, 5)" :key="branch.id" class="heatmap-row">
                <div v-for="hour in 24" :key="hour" 
                     :class="['heatmap-cell', getHeatmapIntensity(branch.id, hour)]"
                     :title="`${branch.name} - ${hour}:00h - $${getHourSales(branch.id, hour)}`">
                </div>
              </div>
            </div>
            <div class="heatmap-x-axis">
              <div v-for="hour in [0, 6, 12, 18, 24]" :key="hour" class="heatmap-x-label">
                {{ hour }}:00
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tendencias de inventario -->
      <div class="chart-card">
        <h3 class="chart-title">Rotación de Inventario</h3>
        <div class="chart-container">
          <div class="inventory-chart">
            <div v-for="category in inventoryCategories" :key="category.name" class="inventory-item">
              <div class="inventory-header">
                <span class="category-name">{{ category.name }}</span>
                <span class="turnover-rate">{{ category.turnoverRate }}x</span>
              </div>
              <div class="inventory-bar-bg">
                <div class="inventory-bar" 
                     :style="{ width: (category.turnoverRate / maxTurnoverRate * 100) + '%' }"
                     :class="getTurnoverClass(category.turnoverRate)">
                </div>
              </div>
              <div class="inventory-details">
                <span>Stock: {{ category.currentStock }}</span>
                <span>Vendido: {{ category.sold }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance de empleados -->
      <div class="chart-card">
        <h3 class="chart-title">Performance de Empleados</h3>
        <div class="chart-container">
          <div class="employee-performance">
            <div v-for="emp in topEmployees" :key="emp.id" class="employee-item">
              <div class="employee-avatar">
                <img :src="emp.avatar" :alt="emp.name" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMmU4ZjAiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY0NzQ4YiIvPgo8cGF0aCBkPSJNMTAgMzBjMC00IDQtOCAxMC04czEwIDQgMTAgOCIgZmlsbD0iIzY0NzQ4YiIvPgo8L3N2Zz4K'">
              </div>
              <div class="employee-info">
                <div class="employee-name">{{ emp.name }}</div>
                <div class="employee-branch">{{ emp.branch }}</div>
              </div>
              <div class="employee-metrics">
                <div class="employee-sales">${{ formatNumber(emp.sales) }}</div>
                <div class="employee-rating">
                  <span v-for="n in 5" :key="n" 
                        :class="['star-small', { filled: n <= emp.rating }]">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de sucursales -->
    <div class="table-section">
      <div class="table-header">
        <h3>Detalles por Sucursal</h3>
        <div class="table-controls">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar sucursal..." 
            class="search-input"
          >
          <select v-model="sortBy" class="sort-select">
            <option value="name">Nombre</option>
            <option value="sales">Ventas</option>
            <option value="stock">Stock</option>
            <option value="profit">Ganancia</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="branches-table">
          <thead>
            <tr>
              <th>Sucursal</th>
              <th>Ventas</th>
              <th>Stock</th>
              <th>Ingresos</th>
              <th>Egresos</th>
              <th>Ganancia</th>
              <th>Caja</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in filteredBranches" :key="branch.id" class="table-row">
              <td class="branch-info">
                <div class="branch-name">{{ branch.name }}</div>
                <div class="branch-address">{{ branch.address }}</div>
              </td>
              <td class="sales-cell">${{ formatNumber(branch.sales) }}</td>
              <td class="stock-cell">{{ branch.stock }} productos</td>
              <td class="income-cell">${{ formatNumber(branch.income) }}</td>
              <td class="expenses-cell">${{ formatNumber(branch.expenses) }}</td>
              <td class="profit-cell">${{ formatNumber(branch.profit) }}</td>
              <td class="cash-cell">${{ formatNumber(branch.cash) }}</td>
              <td>
                <span :class="['status-badge', `status-${branch.status}`]">
                  {{ getStatusText(branch.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="viewDetails(branch)" class="action-btn view-btn">Ver</button>
                <button @click="editBranch(branch)" class="action-btn edit-btn">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Anterior
        </button>
        <span class="pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles de {{ selectedBranch?.name }}</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Dirección:</label>
              <span>{{ selectedBranch?.address }}</span>
            </div>
            <div class="detail-item">
              <label>Gerente:</label>
              <span>{{ selectedBranch?.manager }}</span>
            </div>
            <div class="detail-item">
              <label>Teléfono:</label>
              <span>{{ selectedBranch?.phone }}</span>
            </div>
            <div class="detail-item">
              <label>Empleados:</label>
              <span>{{ selectedBranch?.employees }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedBranchDashboard',
  data() {
    return {
      // Estado y configuración
      selectedPeriod: 'month',
      comparisonMode: 'previous',
      dateRange: {
        start: '',
        end: ''
      },
      isRealTimeEnabled: false,
      isLoading: false,
      chartAnimation: true,
      salesChartType: 'bar',
      
      // Filtros y búsqueda
      searchTerm: '',
      sortBy: 'name',
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      selectedBranch: null,
      
      // Alertas mejoradas
      alerts: [
        {
          id: 1,
          type: 'warning',
          message: 'Stock crítico en Sucursal Centro - Producto XYZ (Solo 5 unidades)',
          priority: 'high',
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'info',
          message: 'Nueva venta registrada en Sucursal Norte - $1,250',
          priority: 'medium',
          timestamp: new Date()
        },
        {
          id: 3,
          type: 'success',
          message: 'Meta mensual alcanzada en Sucursal Este (+5% sobre objetivo)',
          priority: 'medium',
          timestamp: new Date()
        }
      ],
      
      // Métricas totales mejoradas
      totalMetrics: {
        income: {
          value: 495500,
          trend: 12.5,
          sparkline: [450000, 465000, 470000, 480000, 490000, 495500]
        },
        expenses: {
          value: 208000,
          trend: 3.2,
          sparkline: [195000, 200000, 202000, 205000, 207000, 208000]
        },
        profit: {
          value: 287500,
          trend: 18.7,
          sparkline: [255000, 265000, 268000, 275000, 283000, 287500]
        },
        stock: {
          value: 4730,
          trend: -2.1,
          sparkline: [4850, 4800, 4780, 4760, 4745, 4730]
        },
        customers: {
          value: 1284,
          trend: 8.3
        },
        employees: {
          value: 59,
          trend: 1.7
        },
        transactions: {
          value: 3547,
          trend: 15.2
        },
        satisfaction: {
          value: 4.2,
          trend: 5.8
        }
      },
      
      // Datos de sucursales mejorados
      branches: [
        {
          id: 1,
          name: 'Sucursal Centro',
          address: 'Av. Principal 123',
          manager: 'Juan Pérez',
          phone: '+1234567890',
          employees: 15,
          sales: 125000,
          stock: 1200,
          income: 125000,
          expenses: 45000,
          profit: 80000,
          cash: 25000,
          status: 'active',
          satisfaction: 4.5,
          avgTicket: 87.50,
          conversionRate: 15.2,
          coordinates: { lat: -34.6037, lng: -58.3816 }
        },
        {
          id: 2,
          name: 'Sucursal Este',
          address: 'Blvd. Este 321',
          manager: 'María García',
          phone: '+1234567891',
          employees: 12,
          sales: 110000,
          stock: 980,
          income: 110000,
          expenses: 38000,
          profit: 72000,
          cash: 18000,
          status: 'active',
          satisfaction: 4.3,
          avgTicket: 95.20,
          conversionRate: 18.7,
          coordinates: { lat: -34.5875, lng: -58.3583 }
        },
        {
          id: 3,
          name: 'Sucursal Norte',
          address: 'Calle Norte 456',
          manager: 'Carlos López',
          phone: '+1234567892',
          employees: 10,
          sales: 98000,
          stock: 850,
          income: 98000,
          expenses: 35000,
          profit: 63000,
          cash: 15000,
          status: 'warning',
          satisfaction: 3.8,
          avgTicket: 72.30,
          conversionRate: 12.5,
          coordinates: { lat: -34.5755, lng: -58.3915 }
        },
        {
          id: 4,
          name: 'Sucursal Oeste',
          address: 'Calle Oeste 654',
          manager: 'Ana Martínez',
          phone: '+1234567893',
          employees: 8,
          sales: 75000,
          stock: 720,
          income: 75000,
          expenses: 28000,
          profit: 47000,
          cash: 12000,
          status: 'active',
          satisfaction: 4.1,
          avgTicket: 83.75,
          conversionRate: 14.8,
          coordinates: { lat: -34.6118, lng: -58.4173 }
        },
        {
          id: 5,
          name: 'Sucursal Sur',
          address: 'Av. Sur 789',
          manager: 'Roberto Silva',
          phone: '+1234567894',
          employees: 14,
          sales: 87500,
          stock: 980,
          income: 87500,
          expenses: 32000,
          profit: 55500,
          cash: 20000,
          status: 'inactive',
          satisfaction: 3.9,
          avgTicket: 91.20,
          conversionRate: 16.3,
          coordinates: { lat: -34.6298, lng: -58.3682 }
        }
      ],
      
      // Datos de flujo de caja mejorados
      cashFlowData: [
        { month: 'Ene', income: 65000, expenses: 45000 },
        { month: 'Feb', income: 72000, expenses: 52000 },
        { month: 'Mar', income: 68000, expenses: 48000 },
        { month: 'Abr', income: 81000, expenses: 61000 },
        { month: 'May', income: 78000, expenses: 58000 },
        { month: 'Jun', income: 87000, expenses: 67000 }
      ],
      
      // Nuevos datos para gráficos avanzados
      profitDistribution: [],
      inventoryCategories: [
        {
          name: 'Electrónicos',
          currentStock: 450,
          sold: 180,
          turnoverRate: 2.4
        },
        {
          name: 'Ropa',
          currentStock: 1200,
          sold: 800,
          turnoverRate: 4.2
        },
        {
          name: 'Hogar',
          currentStock: 680,
          sold: 320,
          turnoverRate: 1.8
        },
        {
          name: 'Deportes',
          currentStock: 380,
          sold: 290,
          turnoverRate: 3.1
        },
        {
          name: 'Salud',
          currentStock: 220,
          sold: 150,
          turnoverRate: 2.8
        }
      ],
      
      topEmployees: [
        {
          id: 1,
          name: 'Laura Mendez',
          branch: 'Centro',
          sales: 45000,
          rating: 5,
          avatar: '/api/placeholder/40/40'
        },
        {
          id: 2,
          name: 'Diego Ruiz',
          branch: 'Este',
          sales: 42000,
          rating: 4,
          avatar: '/api/placeholder/40/40'
        },
        {
          id: 3,
          name: 'Sofia Castro',
          branch: 'Norte',
          sales: 38000,
          rating: 5,
          avatar: '/api/placeholder/40/40'
        },
        {
          id: 4,
          name: 'Miguel Torres',
          branch: 'Oeste',
          sales: 35000,
          rating: 4,
          avatar: '/api/placeholder/40/40'
        }
      ],
      
      // Timer para actualizaciones en tiempo real
      realTimeTimer: null
    }
  },
  computed: {
    filteredBranches() {
      let filtered = this.branches.filter(branch =>
        branch.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.manager.toLowerCase().includes(this.searchTerm.toLowerCase())
      );

      // Ordenar
      filtered.sort((a, b) => {
        if (this.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return b[this.sortBy] - a[this.sortBy];
      });

      // Paginación
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    
    totalPages() {
      const filtered = this.branches.filter(branch =>
        branch.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.manager.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      return Math.ceil(filtered.length / this.itemsPerPage);
    },
    
    maxTurnoverRate() {
      return Math.max(...this.inventoryCategories.map(cat => cat.turnoverRate));
    },
    
    cashFlowYTicks() {
      const maxValue = Math.max(...this.cashFlowData.flatMap(d => [d.income, d.expenses]));
      const interval = Math.ceil(maxValue / 5 / 10000) * 10000;
      return Array.from({ length: 6 }, (_, i) => i * interval);
    }
  },
  methods: {
    // Métodos de formateo
    formatNumber(num) {
      return new Intl.NumberFormat('es-ES').format(num);
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount);
    },
    
    // Métodos de gráficos mejorados
    getBarHeight(value) {
      const max = Math.max(...this.branches.map(b => b.sales));
      return Math.max((value / max) * 100, 5); // Mínimo 5% de altura
    },
    
    getSparklineHeight(value, data) {
      const max = Math.max(...data);
      const min = Math.min(...data);
      return ((value - min) / (max - min)) * 100;
    },
    
    getCashFlowBarHeight(value) {
      const maxValue = Math.max(...this.cashFlowData.flatMap(d => [d.income, d.expenses]));
      return (value / maxValue) * 100;
    },
    
    // Métodos para gráficos SVG
    getSalesLinePath() {
      const points = this.branches.map((branch, index) => {
        const x = index * (380 / (this.branches.length - 1)) + 10;
        const y = 190 - (branch.sales / Math.max(...this.branches.map(b => b.sales)) * 180);
        return `${x},${y}`;
      });
      return `M${points.join(' L')}`;
    },
    
    getSalesAreaPath() {
      const linePath = this.getSalesLinePath();
      const lastPoint = this.branches.length - 1;
      const lastX = lastPoint * (380 / (this.branches.length - 1)) + 10;
      return `${linePath} L${lastX},190 L10,190 Z`;
    },
    
    // Métodos para el heatmap
    getHeatmapIntensity(branchId, hour) {
      // Simular datos de ventas por hora
      const baseIntensity = Math.random();
      const peakHours = [9, 10, 11, 14, 15, 16, 19, 20];
      const isPeak = peakHours.includes(hour);
      const intensity = isPeak ? baseIntensity * 1.5 : baseIntensity * 0.7;
      
      if (intensity > 0.8) return 'intensity-high';
      if (intensity > 0.6) return 'intensity-medium-high';
      if (intensity > 0.4) return 'intensity-medium';
      if (intensity > 0.2) return 'intensity-low';
      return 'intensity-very-low';
    },
    
    getHourSales(branchId, hour) {
      // Simular ventas por hora
      const branch = this.branches.find(b => b.id === branchId);
      const dailySales = branch ? branch.sales / 30 : 0; // Ventas promedio diarias
      const hourlyBase = dailySales / 12; // Asumiendo 12 horas activas
      const peakHours = [9, 10, 11, 14, 15, 16, 19, 20];
      const multiplier = peakHours.includes(hour) ? 1.5 : 0.5;
      return Math.round(hourlyBase * multiplier * (0.5 + Math.random()));
    },
    
    // Métodos para categorías de inventario
    getTurnoverClass(rate) {
      if (rate >= 3.5) return 'turnover-excellent';
      if (rate >= 2.5) return 'turnover-good';
      if (rate >= 1.5) return 'turnover-average';
      return 'turnover-poor';
    },
    
    // Métodos de estado y utilidad
    getStatusText(status) {
      const statusMap = {
        active: 'Activa',
        warning: 'Alerta',
        inactive: 'Inactiva'
      };
      return statusMap[status] || status;
    },
    
    getComparisonText() {
      const comparisonMap = {
        previous: 'vs período anterior',
        lastYear: 'vs año anterior',
        budget: 'vs presupuesto'
      };
      return comparisonMap[this.comparisonMode] || 'vs período anterior';
    },
    
    // Métodos de interacción
    dismissAlert(id) {
      this.alerts = this.alerts.filter(alert => alert.id !== id);
    },
    
    viewDetails(branch) {
      this.selectedBranch = branch;
      this.showModal = true;
    },
    
    editBranch(branch) {
      console.log('Editando sucursal:', branch.name);
      // Aquí iría la lógica para editar la sucursal
    },
    
    closeModal() {
      this.showModal = false;
      this.selectedBranch = null;
    },
    
    // Métodos de control de período y fechas
    updatePeriod() {
      if (this.selectedPeriod !== 'custom') {
        this.setDateRangeFromPeriod();
      }
      this.refreshData();
    },
    
    updateDateRange() {
      if (this.dateRange.start && this.dateRange.end) {
        this.selectedPeriod = 'custom';
        this.refreshData();
      }
    },
    
    setDateRangeFromPeriod() {
      const today = new Date();
      const end = today.toISOString().split('T')[0];
      let start;
      
      switch (this.selectedPeriod) {
        case 'today':
          start = end;
          break;
        case 'week':
          start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'month':
          start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          break;
        case 'quarter':
          const quarter = Math.floor(today.getMonth() / 3);
          start = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
          break;
        case 'year':
          start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          break;
        default:
          start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      this.dateRange = { start, end };
    },
    
    // Métodos de tiempo real
    toggleRealTime() {
      this.isRealTimeEnabled = !this.isRealTimeEnabled;
      
      if (this.isRealTimeEnabled) {
        this.startRealTimeUpdates();
      } else {
        this.stopRealTimeUpdates();
      }
    },
    
    startRealTimeUpdates() {
      this.realTimeTimer = setInterval(() => {
        this.simulateRealTimeUpdate();
      }, 30000); // Actualizar cada 30 segundos
    },
    
    stopRealTimeUpdates() {
      if (this.realTimeTimer) {
        clearInterval(this.realTimeTimer);
        this.realTimeTimer = null;
      }
    },
    
    simulateRealTimeUpdate() {
      // Simular actualizaciones en tiempo real
      this.branches.forEach(branch => {
        // Pequeños cambios aleatorios en las ventas
        const change = (Math.random() - 0.5) * 1000;
        branch.sales = Math.max(0, branch.sales + change);
        
        // Actualizar métricas derivadas
        branch.profit = branch.sales * 0.65 - branch.expenses;
      });
      
      // Actualizar métricas totales
      this.updateTotalMetrics();
    },
    
    updateTotalMetrics() {
      this.totalMetrics.income.value = this.branches.reduce((sum, branch) => sum + branch.income, 0);
      this.totalMetrics.expenses.value = this.branches.reduce((sum, branch) => sum + branch.expenses, 0);
      this.totalMetrics.profit.value = this.totalMetrics.income.value - this.totalMetrics.expenses.value;
    },
    
    // Métodos de control de gráficos
    toggleChartAnimation() {
      this.chartAnimation = !this.chartAnimation;
    },
    
    // Métodos de exportación y actualización
    async exportData() {
      try {
        const data = {
          branches: this.branches,
          totalMetrics: this.totalMetrics,
          period: this.selectedPeriod,
          dateRange: this.dateRange,
          exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sucursales-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Datos exportados exitosamente', 'success');
      } catch (error) {
        console.error('Error al exportar datos:', error);
        this.showNotification('Error al exportar datos', 'error');
      }
    },
    
    async refreshData() {
      this.isLoading = true;
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Aquí iría la lógica real para obtener datos del backend
        this.simulateDataRefresh();
        
        this.showNotification('Datos actualizados', 'success');
      } catch (error) {
        console.error('Error al actualizar datos:', error);
        this.showNotification('Error al actualizar datos', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    simulateDataRefresh() {
      // Simular pequeños cambios en los datos
      this.branches.forEach(branch => {
        const variation = 0.05; // 5% de variación
        branch.sales *= (1 + (Math.random() - 0.5) * variation);
        branch.income = branch.sales;
        branch.profit = branch.income - branch.expenses;
      });
      
      this.updateTotalMetrics();
      this.calculateProfitDistribution();
    },
    
    showNotification(message, type) {
      const notification = {
        id: Date.now(),
        type: type,
        message: message,
        priority: 'medium',
        timestamp: new Date()
      };
      
      this.alerts.unshift(notification);
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        this.dismissAlert(notification.id);
      }, 5000);
    },
    
    // Métodos de paginación
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    // Métodos de inicialización
    calculateProfitDistribution() {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      let totalProfit = this.branches.reduce((sum, branch) => sum + branch.profit, 0);
      let currentOffset = 0;
      
      this.profitDistribution = this.branches.map((branch, index) => {
        const percentage = (branch.profit / totalProfit) * 100;
        const circumference = 2 * Math.PI * 80; // radio = 80
        const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
        const dashOffset = -currentOffset;
        const rotation = (currentOffset / circumference) * 360;
        
        currentOffset += (percentage / 100) * circumference;
        
        return {
          name: branch.name,
          value: branch.profit,
          percentage: percentage.toFixed(1),
          color: colors[index % colors.length],
          dashArray,
          dashOffset,
          rotation
        };
      });
    },
    
    initializeDateRange() {
      this.setDateRangeFromPeriod();
    }
  },
  
  mounted() {
    this.calculateProfitDistribution();
    this.updateTotalMetrics();
  },
  
  beforeUnmount() {
    this.stopRealTimeUpdates();
  }
}
</script>

<style scoped>
.dashboard-div {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-div * {
  box-sizing: border-box;
}

/* Header enhancements */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.header-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.date-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  background: transparent;
}

.date-separator {
  color: #64748b;
  font-weight: 500;
}

.period-select, .comparison-select {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.period-select:hover, .comparison-select:hover {
  border-color: #3b82f6;
}

.realtime-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #64748b;
}

.realtime-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.realtime-btn:hover {
  border-color: #10b981;
  color: #10b981;
}

.realtime-btn.active:hover {
  background: #059669;
}

.export-btn, .refresh-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn {
  background: #3b82f6;
  color: white;
}

.export-btn:hover {
  background: #2563eb;
}

.refresh-btn {
  background: #10b981;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #059669;
}

.refresh-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Alertas */
.alerts-section {
  margin-bottom: 30px;
}

.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.alert-info {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.alert-icon {
  margin-right: 8px;
}

.alert-message {
  flex: 1;
}

.alert-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

/* Métricas mejoradas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  position: relative;
  overflow: hidden;
}

.metric-income {
  border-left-color: #10b981;
}

.metric-expenses {
  border-left-color: #ef4444;
}

.metric-profit {
  border-left-color: #3b82f6;
}

.metric-stock {
  border-left-color: #f59e0b;
}

.metric-customers {
  border-left-color: #8b5cf6;
}

.metric-employees {
  border-left-color: #06b6d4;
}

.metric-transactions {
  border-left-color: #f97316;
}

.metric-satisfaction {
  border-left-color: #ec4899;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.metric-trend.positive {
  background: #dcfce7;
  color: #166534;
}

.metric-trend.negative {
  background: #fee2e2;
  color: #dc2626;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.metric-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
}

.metric-sparkline {
  display: flex;
  align-items: flex-end;
  height: 30px;
  gap: 2px;
  margin-top: 12px;
}

.sparkline-bar {
  flex: 1;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 2px;
  min-height: 4px;
  transition: all 0.3s ease;
}

.sparkline-bar:hover {
  transform: scaleY(1.1);
}

.rating-stars {
  margin-top: 8px;
  display: flex;
  gap: 2px;
}

.star, .star-small {
  color: #d1d5db;
  transition: color 0.2s;
}

.star.filled, .star-small.filled {
  color: #fbbf24;
}

.star {
  font-size: 16px;
}

.star-small {
  font-size: 12px;
}

/* Gráficos mejorados */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card.chart-large {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.chart-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chart-type-select {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  background: white;
}

.animation-btn {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.animation-btn:hover {
  background: #f8fafc;
}

.chart-container {
  height: 250px;
  position: relative;
}

/* Gráfico de barras mejorado */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 20px 10px 40px 10px;
  position: relative;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
  position: relative;
}

.bar {
  width: 40px;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  margin-bottom: 8px;
  min-height: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.bar.animated {
  animation: growBar 1s ease-out forwards;
}

@keyframes growBar {
  from {
    height: 0;
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.bar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.bar-label {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
}

/* Gráfico de líneas SVG */
.line-chart-sales {
  height: 100%;
  width: 100%;
}

.sales-line-svg {
  width: 100%;
  height: 100%;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

/* Gráfico de pastel */
.pie-chart {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.pie-svg {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.pie-segment {
  transition: stroke-width 0.3s;
  cursor: pointer;
}

.pie-segment:hover {
  stroke-width: 25;
}

.pie-center-text {
  font-size: 14px;
  font-weight: 600;
  fill: #64748b;
}

.pie-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.legend-value {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* Flujo de caja mejorado */
.cash-flow-chart {
  display: flex;
  height: 100%;
  gap: 12px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0 30px 0;
  width: 60px;
}

.y-tick {
  font-size: 10px;
  color: #64748b;
  text-align: right;
}

.cash-flow-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 10px 0 30px 0;
  border-bottom: 1px solid #e2e8f0;
}

.cash-flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
}

.cash-flow-bar-container {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
  margin-bottom: 8px;
}

.cash-flow-bar {
  width: 20px;
  border-radius: 2px 2px 0 0;
  min-height: 5px;
  transition: all 0.3s ease;
}

.cash-flow-bar.positive {
  background: linear-gradient(to top, #10b981, #34d399);
}

.cash-flow-bar.negative {
  background: linear-gradient(to top, #ef4444, #f87171);
}

.cash-flow-bar:hover {
  transform: scaleY(1.1);
}

.cash-flow-label {
  font-size: 10px;
  color: #64748b;
  margin-bottom: 4px;
}

.cash-flow-net {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
}

/* Heatmap */
.heatmap {
  display: grid;
  grid-template-areas:
    ". grid"
    "y-axis grid"
    ". x-axis";
  grid-template-columns: 80px 1fr;
  grid-template-rows: 20px 1fr 20px;
  height: 100%;
  gap: 4px;
}

.heatmap-y-axis {
  grid-area: y-axis;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.heatmap-y-label {
  font-size: 10px;
  color: #64748b;
  text-align: right;
  line-height: 1;
}

.heatmap-grid {
  grid-area: grid;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.heatmap-row {
  display: flex;
  gap: 1px;
  flex: 1;
}

.heatmap-cell {
  flex: 1;
  min-height: 20px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  position: relative;
}

.intensity-very-low { background: #f1f5f9; }
.intensity-low { background: #dbeafe; }
.intensity-medium { background: #93c5fd; }
.intensity-medium-high { background: #60a5fa; }
.intensity-high { background: #3b82f6; }

.heatmap-x-axis {
  grid-area: x-axis;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.heatmap-x-label {
  font-size: 10px;
  color: #64748b;
}

/* Inventario */
.inventory-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  justify-content: space-between;
}

.inventory-item {
  flex: 1;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.turnover-rate {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.inventory-bar-bg {
  background: #f1f5f9;
  height: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.inventory-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.turnover-excellent { background: #10b981; }
.turnover-good { background: #3b82f6; }
.turnover-average { background: #f59e0b; }
.turnover-poor { background: #ef4444; }

.inventory-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

/* Performance de empleados */
.employee-performance {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: background 0.2s;
}

.employee-item:hover {
  background: #f1f5f9;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.employee-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.employee-branch {
  font-size: 12px;
  color: #64748b;
}

.employee-metrics {
  text-align: right;
}

.employee-sales {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 4px;
}

.employee-rating {
  display: flex;
  gap: 2px;
}

/* Tabla */
.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
}

.sort-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 0 0 12px 12px;
}

.branches-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.branches-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.branches-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #1e293b;
  vertical-align: middle;
}

.branch-info {
  min-width: 180px;
}

.branch-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.branch-address {
  font-size: 12px;
  color: #64748b;
}

.sales-cell, .income-cell, .profit-cell, .cash-cell {
  font-weight: 600;
  color: #059669;
}

.expenses-cell {
  font-weight: 600;
  color: #dc2626;
}

.stock-cell {
  color: #64748b;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

.actions-cell {
  min-width: 120px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 4px;
  transition: all 0.2s;
}

.view-btn {
  background: #dbeafe;
  color: #1e40af;
}

.view-btn:hover {
  background: #bfdbfe;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-btn:hover {
  background: #fde68a;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item label {
  font-weight: 500;
  color: #64748b;
}

.detail-item span {
  color: #1e293b;
}

/* Responsive Design Mejorado */
@media (max-width: 1400px) {
  .chart-card.chart-large {
    grid-column: span 1;
  }
}

@media (max-width: 1200px) {
  .dashboard-div {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .chart-card.chart-large {
    grid-column: span 1;
  }
}

@media (max-width: 968px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .header-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .date-range-picker {
    flex-direction: column;
    gap: 4px;
  }
  
  .heatmap {
    grid-template-areas:
      "grid"
      "y-axis"
      "x-axis";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .heatmap-y-axis {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .heatmap-y-label {
    text-align: center;
    writing-mode: horizontal-tb;
  }
}

@media (max-width: 768px) {
  .dashboard-div {
    padding: 12px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .metric-card {
    padding: 20px;
  }
  
  .metric-value {
    font-size: 28px;
  }
  
  .charts-section {
    gap: 16px;
  }
  
  .chart-card {
    padding: 20px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .branches-table {
    font-size: 12px;
    min-width: 700px;
  }
  
  .branches-table th,
  .branches-table td {
    padding: 12px 8px;
  }
  
  .bar-chart {
    padding: 20px 5px 40px 5px;
  }
  
  .bar-item {
    max-width: 60px;
  }
  
  .bar {
    width: 30px;
  }
  
  .pie-chart {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .pie-svg {
    width: 150px;
    height: 150px;
  }
  
  .cash-flow-chart {
    flex-direction: column;
    gap: 8px;
  }
  
  .chart-y-axis {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding: 0;
  }
  
  .cash-flow-bars {
    padding: 20px 0 30px 0;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .header-controls {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .period-select,
  .comparison-select,
  .realtime-btn,
  .export-btn,
  .refresh-btn {
    width: 100%;
    text-align: center;
  }
  
  .date-range-picker {
    width: 100%;
    justify-content: center;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .chart-controls {
    justify-content: center;
  }
  
  .inventory-chart {
    gap: 12px;
  }
  
  .inventory-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .employee-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .employee-metrics {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 20px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .chart-container {
    height: 150px;
  }
  
  .branches-table {
    min-width: 600px;
  }
  
  .table-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-btn {
    width: 100%;
  }
  
  .heatmap-cell {
    min-height: 15px;
  }
  
  .employee-avatar {
    width: 32px;
    height: 32px;
  }
  
  .alert {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .metric-sparkline {
    height: 20px;
  }
}

/* Animaciones adicionales */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card {
  animation: fadeInUp 0.6s ease-out;
}

.chart-card {
  animation: fadeInUp 0.8s ease-out;
}

.alert {
  animation: fadeInUp 0.4s ease-out;
}

/* Mejoras de accesibilidad */
.metric-card:focus-within,
.chart-card:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.bar:focus,
.data-point:focus,
.pie-segment:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Estados de carga */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tooltips mejorados */
.tooltip {
  position: absolute;
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tooltip.visible {
  opacity: 1;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1e293b;
}
</style>