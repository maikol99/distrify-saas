<template>
  <div class="reports-container">

    <!-- Barra de acciones / filtros -->
    <div class="actions-bar">
      <div class="filter-toggle-container">
        <button @click="toggleFilters" class="btn-toggle-filters">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
        </button>
      </div>
      <div v-if="showFilters" class="filters-container">
        <div class="filter-group">
          <label for="periodType">Período:</label>
          <select v-model="filters.periodType" id="periodType" class="filter-select" @change="applyFilters">
            <option value="all">Todo el historial</option>
            <option value="last3months">Últimos 3 meses</option>
            <option value="last6months">Últimos 6 meses</option>
            <option value="last12months">Últimos 12 meses</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>
        <div class="filter-group date-filter">
          <label>Fecha Inicio:</label>
          <div class="input-with-icon">
            <input type="date" class="filter-input" v-model="filters.startDate"
              :disabled="filters.periodType !== 'custom'" />
          </div>
        </div>
        <div class="filter-group date-filter">
          <label>Fecha Fin:</label>
          <div class="input-with-icon">
            <input type="date" class="filter-input" v-model="filters.endDate"
              :disabled="filters.periodType !== 'custom'" />
          </div>
        </div>
        <div class="filter-actions">
          <button @click="applyFilters" class="btn-primary"><i class="fas fa-filter"></i> Aplicar</button>
          <button @click="clearFilters" class="btn-secondary"><i class="fas fa-times"></i> Limpiar</button>
        </div>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando reportes...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="loadReportData" class="btn-primary">Reintentar</button>
    </div>

    <div v-else>
      <!-- ===== KPI Cards principales ===== -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-sales">
          <div class="kpi-icon"><i class="fas fa-shopping-cart"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Ventas Totales</span>
            <p class="kpi-value">${{ formatAmount(reportData.totals?.sales || 0) }}</p>
          </div>
        </div>
        <div class="kpi-card kpi-purchases">
          <div class="kpi-icon"><i class="fas fa-truck"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Compras Totales</span>
            <p class="kpi-value">${{ formatAmount(reportData.totals?.purchases || 0) }}</p>
            <span v-if="(reportData.totals?.additionalCosts || 0) > 0" class="kpi-sub">
              + ${{ formatAmount(reportData.totals?.additionalCosts || 0) }} gastos adicionales
            </span>
          </div>
        </div>
        <div class="kpi-card kpi-expenses">
          <div class="kpi-icon"><i class="fas fa-arrow-circle-down"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Egresos</span>
            <p class="kpi-value">${{ formatAmount(reportData.totals?.expenses || 0) }}</p>
          </div>
        </div>
        <div class="kpi-card kpi-incomes">
          <div class="kpi-icon"><i class="fas fa-arrow-circle-up"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Ingresos</span>
            <p class="kpi-value">${{ formatAmount(reportData.totals?.incomes || 0) }}</p>
          </div>
        </div>
        <div class="kpi-card kpi-gross">
          <div class="kpi-icon"><i class="fas fa-chart-bar"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Ganancia Bruta</span>
            <p class="kpi-value" :class="(reportData.totals?.grossProfit || 0) >= 0 ? 'text-green' : 'text-red'">
              ${{ formatAmount(reportData.totals?.grossProfit || 0) }}
            </p>
            <span class="kpi-margin-badge"
              :class="(reportData.totals?.grossMargin || 0) >= 0 ? 'badge-green' : 'badge-red'">
              {{ (reportData.totals?.grossMargin || 0).toFixed(1) }}% margen bruto
            </span>
          </div>
        </div>
        <div class="kpi-card kpi-net">
          <div class="kpi-icon"><i class="fas fa-wallet"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Ganancia Neta</span>
            <p class="kpi-value" :class="(reportData.totals?.netProfit || 0) >= 0 ? 'text-green' : 'text-red'">
              ${{ formatAmount(reportData.totals?.netProfit || 0) }}
            </p>
            <span class="kpi-margin-badge"
              :class="(reportData.totals?.netMargin || 0) >= 0 ? 'badge-green' : 'badge-red'">
              {{ (reportData.totals?.netMargin || 0).toFixed(1) }}% margen neto
            </span>
          </div>
        </div>
      </div>

      <!-- ===== Comparativas MoM ===== -->
      <div class="section-card">
        <div class="section-card-header">
          <i class="fas fa-exchange-alt"></i>
          <h2>Comparativas Mes a Mes</h2>
        </div>
        <div class="comparison-grid">
          <div class="comparison-card">
            <h3>Ventas (MoM)</h3>
            <template v-if="salesMoMComparison.percentage !== null">
              <span class="mom-value"
                :class="salesMoMComparison.percentage >= 0 ? 'positive-change' : 'negative-change'">
                {{ formatPercentage(salesMoMComparison.percentage) }}
                <i :class="salesMoMComparison.percentage >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              </span>
              <p class="mom-period">vs {{ salesMoMComparison.previousMonth }}</p>
            </template>
            <p v-else class="mom-empty">Sin datos suficientes</p>
          </div>
          <div class="comparison-card">
            <h3>Egresos (MoM)</h3>
            <template v-if="expensesMoMComparison.percentage !== null">
              <span class="mom-value"
                :class="expensesMoMComparison.percentage <= 0 ? 'positive-change' : 'negative-change'">
                {{ formatPercentage(expensesMoMComparison.percentage) }}
                <i :class="expensesMoMComparison.percentage <= 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
              </span>
              <p class="mom-period">vs {{ expensesMoMComparison.previousMonth }}</p>
            </template>
            <p v-else class="mom-empty">Sin datos suficientes</p>
          </div>
          <div class="comparison-card">
            <h3>Compras (MoM)</h3>
            <template v-if="purchasesMoMComparison.percentage !== null">
              <span class="mom-value"
                :class="purchasesMoMComparison.percentage <= 0 ? 'positive-change' : 'negative-change'">
                {{ formatPercentage(purchasesMoMComparison.percentage) }}
                <i :class="purchasesMoMComparison.percentage <= 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
              </span>
              <p class="mom-period">vs {{ purchasesMoMComparison.previousMonth }}</p>
            </template>
            <p v-else class="mom-empty">Sin datos suficientes</p>
          </div>
        </div>
      </div>

      <!-- ===== Fila de gráficos: Ventas vs Compras | Egresos vs Ingresos ===== -->
      <div class="chart-row">
        <div class="chart-card chart-card--wide">
          <div class="chart-card-header">
            <h2><i class="fas fa-chart-line"></i> Ventas vs Compras Mensuales</h2>
          </div>
          <div class="chart-container">
            <Line :data="salesVsPurchasesChartData" :options="lineChartOptions" />
          </div>
        </div>
        <div class="chart-card chart-card--wide">
          <div class="chart-card-header">
            <h2><i class="fas fa-balance-scale"></i> Egresos vs Ingresos Mensuales</h2>
          </div>
          <div class="chart-container">
            <Line :data="expensesVsIncomesChartData" :options="lineChartOptions" />
          </div>
        </div>
      </div>

      <!-- ===== Ganancia mensual ===== -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h2><i class="fas fa-chart-area"></i> Ganancia Neta Mensual</h2>
        </div>
        <div class="chart-container chart-container--tall">
          <Bar :data="monthlyProfitChartData" :options="profitBarOptions" />
        </div>
      </div>

      <!-- ===== Fila: Top productos | Medios de pago ===== -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-boxes"></i> Top 5 Productos Vendidos</h2>
          </div>
          <div class="chart-container">
            <Bar :data="salesByProductChartData" :options="horizontalBarOptions" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-credit-card"></i> Ventas por Medio de Pago</h2>
          </div>
          <div class="chart-container">
            <Doughnut :data="salesByPaymentMethodChartData" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- ===== Fila: Distribución de Ventas por Categoría | Top Productos por Categoría ===== -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-chart-pie"></i> Distribución de Ventas por Categoría</h2>
          </div>
          <div class="chart-container">
            <Doughnut :data="categoryDistributionChartData" :options="doughnutOptions" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-star"></i> Productos más Vendidos por Categoría</h2>
          </div>
          <div class="chart-container chart-container--scroll">
            <div v-if="Object.keys(reportData.topProductsByCategory || {}).length === 0" class="text-gray-400 text-sm text-center py-8">
              Sin datos disponibles
            </div>
            <div v-for="(products, category) in reportData.topProductsByCategory" :key="category" class="mb-3">
              <button @click="toggleCategory(category)" class="w-full flex justify-between items-center p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                <span class="font-medium text-gray-700 text-sm">{{ category }}</span>
                <span class="text-gray-400 text-xs">{{ expandedCategories[category] ? '▼' : '▶' }}</span>
              </button>
              <div v-if="expandedCategories[category]" class="mt-1.5 ml-1">
                <div v-for="(product, i) in products.slice(0, 5)" :key="i" class="flex justify-between py-1.5 px-2 text-xs border-b border-gray-100 last:border-b-0">
                  <span class="text-gray-600 truncate mr-2">{{ product.name }}</span>
                  <span class="text-gray-800 font-medium whitespace-nowrap">${{ product.total.toLocaleString() }} <span class="text-gray-400 font-normal">({{ product.quantity }} uds)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Fila: Egresos por categoría | Compras por categoría ===== -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-tags"></i> Egresos por Categoría</h2>
          </div>
          <div class="chart-container">
            <Bar :data="expensesByCategoryChartData" :options="expHorizontalBarOptions" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <h2><i class="fas fa-shopping-bag"></i> Compras por Categoría</h2>
          </div>
          <div class="chart-container">
            <Bar :data="purchasesByCategoryChartData" :options="purchasesHorizontalBarOptions" />
          </div>
        </div>
      </div>

      <!-- ===== Ventas por Categoría ===== -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h2><i class="fas fa-chart-bar"></i> Ventas por Categoría</h2>
        </div>
        <div class="chart-container">
          <Bar :data="salesByCategoryChartData" :options="horizontalBarOptions" />
        </div>
      </div>

      <!-- ===== Top Clientes ===== -->
      <div class="section-card" v-if="(reportData.topClients || []).length > 0">
        <div class="section-card-header">
          <i class="fas fa-users"></i>
          <h2>Top Clientes por Volumen</h2>
        </div>
        <div class="clients-table-wrapper">
          <table class="clients-table hidden md:table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Transacciones</th>
                <th>Total</th>
                <th>Participación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(client, idx) in reportData.topClients" :key="idx">
                <td class="rank-cell">
                  <span class="rank-badge"
                    :class="idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="client-name">{{ client.name }}</td>
                <td>{{ client.count }}</td>
                <td class="amount-cell">${{ formatAmount(client.total) }}</td>
                <td>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar" :style="{ width: getClientShare(client.total) + '%' }"></div>
                    <span class="progress-label">{{ getClientShare(client.total).toFixed(1) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Cards -->
          <div class="grid grid-cols-1 gap-4 md:hidden">
            <div v-for="(client, idx) in reportData.topClients" :key="idx" class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3 relative shadow-sm">
              <div class="flex items-center gap-3 border-b border-gray-200 pb-2">
                <span class="rank-badge flex-shrink-0"
                  :class="idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''">
                  {{ idx + 1 }}
                </span>
                <span class="font-bold text-gray-800 text-lg">{{ client.name }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600 font-medium whitespace-nowrap">{{ client.count }} transacciones</span>
                <span class="font-bold text-gray-900 text-base">${{ formatAmount(client.total) }}</span>
              </div>
              <div class="progress-bar-wrap w-full pt-1">
                <div class="progress-bar" :style="{ width: getClientShare(client.total) + '%' }"></div>
                <span class="progress-label font-medium min-w-max">{{ getClientShare(client.total).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Totales por Medio de Pago ===== -->
      <div class="section-card" v-if="hasPaymentMethodData">
        <div class="section-card-header">
          <i class="fas fa-money-bill-wave"></i>
          <h2>Desglose por Medio de Pago</h2>
        </div>
        <div class="payment-method-grid">
          <div class="payment-method-card" v-if="Object.keys(reportData.salesByPaymentMethodTotals || {}).length > 0">
            <h3><i class="fas fa-shopping-cart"></i> Ventas</h3>
            <ul>
              <li v-for="(total, method) in reportData.salesByPaymentMethodTotals" :key="method">
                <span>{{ method }}</span>
                <strong>${{ formatAmount(total) }}</strong>
              </li>
            </ul>
          </div>
          <div class="payment-method-card"
            v-if="Object.keys(reportData.purchasesByPaymentMethodTotals || {}).length > 0">
            <h3><i class="fas fa-truck"></i> Compras</h3>
            <ul>
              <li v-for="(total, method) in reportData.purchasesByPaymentMethodTotals" :key="method">
                <span>{{ method }}</span>
                <strong>${{ formatAmount(total) }}</strong>
              </li>
            </ul>
          </div>
          <div class="payment-method-card"
            v-if="Object.keys(reportData.expensesByPaymentMethodTotals || {}).length > 0">
            <h3><i class="fas fa-minus-circle"></i> Egresos</h3>
            <ul>
              <li v-for="(total, method) in reportData.expensesByPaymentMethodTotals" :key="method">
                <span>{{ method }}</span>
                <strong>${{ formatAmount(total) }}</strong>
              </li>
            </ul>
          </div>
          <div class="payment-method-card" v-if="Object.keys(reportData.incomesByPaymentMethodTotals || {}).length > 0">
            <h3><i class="fas fa-plus-circle"></i> Ingresos</h3>
            <ul>
              <li v-for="(total, method) in reportData.incomesByPaymentMethodTotals" :key="method">
                <span>{{ method }}</span>
                <strong>${{ formatAmount(total) }}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ===== Tabla resumen histórico ===== -->
      <div class="section-card" v-if="historicalRows.length > 0">
        <div class="section-card-header">
          <i class="fas fa-table"></i>
          <h2>Resumen Histórico por Mes</h2>
        </div>
        <div class="table-responsive">
          <table class="summary-table hidden md:table w-full">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Ventas</th>
                <th>Compras</th>
                <th>Egresos</th>
                <th>Ingresos</th>
                <th>Ganancia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in historicalRows" :key="row.month">
                <td class="month-cell">{{ row.month }}</td>
                <td class="sales-cell">${{ formatAmount(row.sales) }}</td>
                <td class="purchases-cell">${{ formatAmount(row.purchases) }}</td>
                <td class="expenses-cell">${{ formatAmount(row.expenses) }}</td>
                <td class="incomes-cell">${{ formatAmount(row.incomes) }}</td>
                <td :class="row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                  ${{ formatAmount(row.profit) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Cards -->
          <div class="grid grid-cols-1 gap-4 md:hidden">
            <div v-for="row in historicalRows" :key="row.month" class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <h3 class="font-bold text-gray-800 m-0 pb-2 border-b border-gray-200 text-lg flex items-center justify-between">
                <span><i class="far fa-calendar-alt text-gray-500 mr-2"></i>{{ row.month }}</span>
                <span class="text-sm px-3 py-1 bg-white rounded-lg whitespace-nowrap shadow-sm border border-gray-100" :class="row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                  ${{ formatAmount(row.profit) }}
                </span>
              </h3>
              
              <div class="grid grid-cols-2 gap-3 mt-1">
                <div class="flex flex-col bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Ventas</span>
                  <span class="sales-cell font-bold text-sm md:text-base">${{ formatAmount(row.sales) }}</span>
                </div>
                <div class="flex flex-col bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Compras</span>
                  <span class="purchases-cell font-bold text-sm md:text-base">${{ formatAmount(row.purchases) }}</span>
                </div>
                <div class="flex flex-col bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Egresos</span>
                  <span class="expenses-cell font-bold text-sm md:text-base">${{ formatAmount(row.expenses) }}</span>
                </div>
                <div class="flex flex-col bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Ingresos</span>
                  <span class="incomes-cell font-bold text-sm md:text-base">${{ formatAmount(row.incomes) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import moment from "moment";
import numeral from "numeral";
import { Line, Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
} from "chart.js";
import { useGlobalStore } from "@/stores/globalStore";
import api from "@/config/axios.config";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement, ArcElement);

const TOOLTIP_CURRENCY = {
  callbacks: {
    label(ctx) {
      const label = ctx.dataset?.label || ctx.label || "";
      const val = ctx.parsed?.y ?? ctx.parsed?.x ?? ctx.parsed ?? 0;
      return `${label ? label + ": " : ""}$${numeral(val).format("0,0.00")}`;
    },
  },
};

const BASE_SCALES_XY = {
  y: {
    beginAtZero: true,
    ticks: { callback: (v) => "$" + numeral(v).format("0,0"), color: "#6b7280" },
    grid: { color: "#f3f4f6" },
  },
  x: {
    ticks: { color: "#6b7280" },
    grid: { display: false },
  },
};

export default {
  name: "BusinessReports",
  components: { Line, Bar, Doughnut },

  data() {
    return {
      globalStore: useGlobalStore(),
      showFilters: false,
      loading: false,
      error: null,
      filters: { startDate: null, endDate: null, periodType: "all" },
      reportData: {
        totals: { sales: 0, purchases: 0, realCost: 0, additionalCosts: 0, expenses: 0, incomes: 0, netProfit: 0, grossProfit: 0, grossMargin: 0, netMargin: 0 },
        salesByPaymentMethodTotals: {},
        expensesByPaymentMethodTotals: {},
        purchasesByPaymentMethodTotals: {},
        incomesByPaymentMethodTotals: {},
        salesByProduct: {},
        expensesByCategory: {},
        purchasesByCategory: {},
        salesByCategory: {},
        topProductsByCategory: {},
        additionalCostsByCategory: {},
        topClients: [],
        monthlyData: { sales: {}, expenses: {}, purchases: {}, incomes: {}, realCost: {}, profit: {} },
        monthlySalesAggregated: [],
        monthlyExpensesAggregated: [],
        monthlyPurchasesAggregated: [],
      },

      expandedCategories: {},

      lineChartOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" }, tooltip: TOOLTIP_CURRENCY },
        scales: BASE_SCALES_XY,
      },

      profitBarOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: TOOLTIP_CURRENCY },
        scales: BASE_SCALES_XY,
      },

      horizontalBarOptions: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { display: false }, tooltip: TOOLTIP_CURRENCY },
        scales: {
          x: { beginAtZero: true, ticks: { callback: (v) => "$" + numeral(v).format("0,0"), color: "#6b7280" }, grid: { color: "#f3f4f6" } },
          y: { ticks: { color: "#6b7280" }, grid: { display: false } },
        },
      },

      expHorizontalBarOptions: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { display: false }, tooltip: TOOLTIP_CURRENCY },
        scales: {
          x: { beginAtZero: true, ticks: { callback: (v) => "$" + numeral(v).format("0,0"), color: "#6b7280" }, grid: { color: "#f3f4f6" } },
          y: { ticks: { color: "#6b7280" }, grid: { display: false } },
        },
      },

      purchasesHorizontalBarOptions: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { display: false }, tooltip: TOOLTIP_CURRENCY },
        scales: {
          x: { beginAtZero: true, ticks: { callback: (v) => "$" + numeral(v).format("0,0"), color: "#6b7280" }, grid: { color: "#f3f4f6" } },
          y: { ticks: { color: "#6b7280" }, grid: { display: false } },
        },
      },

      doughnutOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label(ctx) {
                return `${ctx.label}: $${numeral(ctx.parsed).format("0,0.00")}`;
              },
            },
          },
        },
      },
    };
  },

  computed: {
    hasPaymentMethodData() {
      return (
        Object.keys(this.reportData.salesByPaymentMethodTotals || {}).length > 0 ||
        Object.keys(this.reportData.expensesByPaymentMethodTotals || {}).length > 0 ||
        Object.keys(this.reportData.purchasesByPaymentMethodTotals || {}).length > 0 ||
        Object.keys(this.reportData.incomesByPaymentMethodTotals || {}).length > 0
      );
    },

    salesMoMComparison() {
      return this.calculateMoMChange(this.reportData.monthlySalesAggregated || []);
    },
    expensesMoMComparison() {
      return this.calculateMoMChange(this.reportData.monthlyExpensesAggregated || []);
    },
    purchasesMoMComparison() {
      return this.calculateMoMChange(this.reportData.monthlyPurchasesAggregated || []);
    },

    // Ventas vs Compras
    salesVsPurchasesChartData() {
      const salesData = this.reportData.monthlyData?.sales || {};
      const purchasesData = this.reportData.monthlyData?.realCost || this.reportData.monthlyData?.purchases || {};
      const allMonths = Array.from(new Set([...Object.keys(salesData), ...Object.keys(purchasesData)])).sort();
      return {
        labels: allMonths.map((m) => moment(m + "-01").format("MMM YYYY")),
        datasets: [
          { label: "Ventas", backgroundColor: "rgba(249,147,30,0.15)", borderColor: "#f9931e", data: allMonths.map((m) => salesData[m] || 0), tension: 0.4, fill: true, pointBackgroundColor: "#f9931e" },
          { label: "Compras (costo real)", backgroundColor: "rgba(59,130,246,0.15)", borderColor: "#3b82f6", data: allMonths.map((m) => purchasesData[m] || 0), tension: 0.4, fill: true, pointBackgroundColor: "#3b82f6" },
        ],
      };
    },

    // Egresos vs Ingresos
    expensesVsIncomesChartData() {
      const expData = this.reportData.monthlyData?.expenses || {};
      const incData = this.reportData.monthlyData?.incomes || {};
      const allMonths = Array.from(new Set([...Object.keys(expData), ...Object.keys(incData)])).sort();
      return {
        labels: allMonths.map((m) => moment(m + "-01").format("MMM YYYY")),
        datasets: [
          { label: "Egresos", backgroundColor: "rgba(239,68,68,0.15)", borderColor: "#ef4444", data: allMonths.map((m) => expData[m] || 0), tension: 0.4, fill: true, pointBackgroundColor: "#ef4444" },
          { label: "Ingresos", backgroundColor: "rgba(34,197,94,0.15)", borderColor: "#22c55e", data: allMonths.map((m) => incData[m] || 0), tension: 0.4, fill: true, pointBackgroundColor: "#22c55e" },
        ],
      };
    },

    // Ganancia mensual
    monthlyProfitChartData() {
      const profitData = this.reportData.monthlyData?.profit || {};
      const allMonths = Object.keys(profitData).sort();
      const values = allMonths.map((m) => profitData[m] || 0);
      return {
        labels: allMonths.map((m) => moment(m + "-01").format("MMM YYYY")),
        datasets: [{
          label: "Ganancia Neta",
          backgroundColor: values.map((v) => v >= 0 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)"),
          borderColor: values.map((v) => v >= 0 ? "#22c55e" : "#ef4444"),
          borderWidth: 1,
          data: values,
        }],
      };
    },

    salesByProductChartData() {
      const productSales = this.reportData.salesByProduct || {};
      const sorted = Object.entries(productSales).sort(([, a], [, b]) => (b.total || 0) - (a.total || 0)).slice(0, 5);
      return {
        labels: sorted.map(([p]) => p),
        datasets: [{ label: "Ventas", backgroundColor: "#f9931e", data: sorted.map(([, d]) => d.total || 0) }],
      };
    },

    salesByPaymentMethodChartData() {
      const data = this.reportData.salesByPaymentMethodTotals || {};
      const colors = ["#f9931e", "#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#00BCD4", "#FF5722"];
      const labels = Object.keys(data);
      return {
        labels,
        datasets: [{ backgroundColor: colors.slice(0, labels.length), data: Object.values(data) }],
      };
    },

    expensesByCategoryChartData() {
      const data = this.reportData.expensesByCategory || {};
      const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);
      return {
        labels: sorted.map(([c]) => c),
        datasets: [{ label: "Egresos", backgroundColor: "#ef4444", data: sorted.map(([, v]) => v) }],
      };
    },

    purchasesByCategoryChartData() {
      const data = this.reportData.purchasesByCategory || {};
      const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);
      return {
        labels: sorted.map(([c]) => c),
        datasets: [{ label: "Compras", backgroundColor: "#3b82f6", data: sorted.map(([, v]) => v) }],
      };
    },

    salesByCategoryChartData() {
      const data = this.reportData.salesByCategory || {};
      const sorted = Object.entries(data).sort(([, a], [, b]) => (b.total || 0) - (a.total || 0));
      return {
        labels: sorted.map(([c]) => c),
        datasets: [{
          label: "Total Vendido ($)",
          data: sorted.map(([, v]) => v.total || 0),
          backgroundColor: "rgba(249, 115, 22, 0.7)",
          borderColor: "rgba(249, 115, 22, 1)",
          borderWidth: 1,
        }],
      };
    },

    categoryDistributionChartData() {
      const data = this.reportData.salesByCategory || {};
      const labels = Object.keys(data);
      const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308", "#ef4444"];
      return {
        labels,
        datasets: [{
          data: Object.values(data).map(v => v.total || 0),
          backgroundColor: colors.slice(0, labels.length),
        }],
      };
    },

    historicalRows() {
      const salesData = this.reportData.monthlyData?.sales || {};
      const purchasesData = this.reportData.monthlyData?.purchases || {};
      const expData = this.reportData.monthlyData?.expenses || {};
      const incData = this.reportData.monthlyData?.incomes || {};
      const profitData = this.reportData.monthlyData?.profit || {};
      const allMonths = Array.from(new Set([
        ...Object.keys(salesData), ...Object.keys(purchasesData),
        ...Object.keys(expData), ...Object.keys(incData),
      ])).sort().reverse();
      return allMonths.map((m) => ({
        month: moment(m + "-01").format("MMM YYYY"),
        sales: salesData[m] || 0,
        purchases: purchasesData[m] || 0,
        expenses: expData[m] || 0,
        incomes: incData[m] || 0,
        profit: profitData[m] ?? ((salesData[m] || 0) - (purchasesData[m] || 0) - (expData[m] || 0)),
      }));
    },
  },

  methods: {
    async loadReportData() {
      this.loading = true;
      this.error = null;
      try {
        const shopId = this.globalStore.shopId();
        const params = { shopId };
        if (this.filters.startDate) params.startDate = this.filters.startDate;
        if (this.filters.endDate) params.endDate = this.filters.endDate;
        const response = await api.get("/reports/get/business-report", { params });
        this.reportData = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Error al cargar los datos del reporte";
      } finally {
        this.loading = false;
      }
    },

    toggleFilters() { this.showFilters = !this.showFilters; },

    applyFilters() {
      const today = moment();
      if (this.filters.periodType === "last3months") {
        this.filters.endDate = today.format("YYYY-MM-DD");
        this.filters.startDate = today.clone().subtract(3, "months").startOf("month").format("YYYY-MM-DD");
      } else if (this.filters.periodType === "last6months") {
        this.filters.endDate = today.format("YYYY-MM-DD");
        this.filters.startDate = today.clone().subtract(6, "months").startOf("month").format("YYYY-MM-DD");
      } else if (this.filters.periodType === "last12months") {
        this.filters.endDate = today.format("YYYY-MM-DD");
        this.filters.startDate = today.clone().subtract(12, "months").startOf("month").format("YYYY-MM-DD");
      } else if (this.filters.periodType === "all") {
        this.filters.startDate = null;
        this.filters.endDate = null;
      }
      this.loadReportData();
    },

    clearFilters() {
      this.filters = { startDate: null, endDate: null, periodType: "all" };
      this.loadReportData();
    },

    calculateMoMChange(data) {
      if (!data || data.length < 2) return { currentMonth: null, previousMonth: null, change: null, percentage: null };
      const latest = data[data.length - 1];
      const prev = data[data.length - 2];
      const change = latest.value - prev.value;
      const percentage = prev.value !== 0 ? (change / prev.value) * 100 : (latest.value !== 0 ? 100 : 0);
      return { currentMonth: latest.month, previousMonth: prev.month, change, percentage };
    },

    getClientShare(clientTotal) {
      const totalSales = this.reportData.totals?.sales || 0;
      if (totalSales === 0) return 0;
      return Math.min((clientTotal / totalSales) * 100, 100);
    },

    formatAmount(amount) { return numeral(amount || 0).format("0,0.00"); },

    formatPercentage(value) {
      if (value === null) return "N/A";
      return (value > 0 ? "+" : "") + numeral(value).format("0.00") + "%";
    },

    toggleCategory(cat) {
      this.expandedCategories[cat] = !this.expandedCategories[cat];
    },
  },

  async mounted() { await this.loadReportData(); },
};
</script>

<style scoped>
.reports-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  min-height: 100%;
}

/* ===== Filtros ===== */
.actions-bar {
  margin-bottom: 1.5rem;
}

.filter-toggle-container {
  text-align: right;
  margin-bottom: 0.5rem;
}

.btn-toggle-filters {
  background: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-toggle-filters:hover {
  background: #e8821a;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-input,
.filter-select {
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.15);
}

.filter-input:disabled,
.filter-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
}

.input-with-icon {
  position: relative;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* Buttons */
.btn-primary {
  background: #f9931e;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #e8821a;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #6b7280;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #ef4444;
}

.error-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.error-state p {
  font-size: 1rem;
  margin-bottom: 1.25rem;
}

/* ===== KPI Grid ===== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border-left: 4px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kpi-sales {
  border-left-color: #f9931e;
}

.kpi-purchases {
  border-left-color: #3b82f6;
}

.kpi-expenses {
  border-left-color: #ef4444;
}

.kpi-incomes {
  border-left-color: #22c55e;
}

.kpi-gross {
  border-left-color: #8b5cf6;
}

.kpi-net {
  border-left-color: #0ea5e9;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.kpi-sales .kpi-icon {
  background: #fff7ed;
  color: #f9931e;
}

.kpi-purchases .kpi-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.kpi-expenses .kpi-icon {
  background: #fef2f2;
  color: #ef4444;
}

.kpi-incomes .kpi-icon {
  background: #f0fdf4;
  color: #22c55e;
}

.kpi-gross .kpi-icon {
  background: #f5f3ff;
  color: #8b5cf6;
}

.kpi-net .kpi-icon {
  background: #f0f9ff;
  color: #0ea5e9;
}

.kpi-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin: 0.2rem 0 0;
  line-height: 1.2;
  word-break: break-word;
}

.kpi-sub {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 0.15rem;
  line-height: 1.2;
  word-break: break-word;
}

.kpi-margin-badge {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  display: inline-block;
  width: fit-content;
}

.badge-green {
  background: #dcfce7;
  color: #166534;
}

.badge-red {
  background: #fee2e2;
  color: #991b1b;
}

.text-green {
  color: #16a34a !important;
}

.text-red {
  color: #dc2626 !important;
}

/* ===== Section cards ===== */
.section-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.section-card-header i {
  font-size: 1.1rem;
  color: #f9931e;
}

.section-card-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* ===== Comparison MoM ===== */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.comparison-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
}

.comparison-card h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
}

.mom-value {
  font-size: 1.75rem;
  font-weight: 700;
  display: block;
}

.mom-period {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0.35rem 0 0;
}

.mom-empty {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0;
}

.positive-change {
  color: #16a34a;
}

.negative-change {
  color: #dc2626;
}

/* ===== Charts ===== */
.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.chart-row .chart-card {
  margin-bottom: 0;
}

.chart-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.chart-card-header h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.chart-card-header i {
  color: #f9931e;
}

.chart-container {
  position: relative;
  height: 280px;
}

.chart-container--tall {
  height: 240px;
}

.chart-container--scroll {
  height: auto;
  max-height: 300px;
  overflow-y: auto;
}

/* ===== Top Clients ===== */
.clients-table-wrapper {
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.clients-table thead tr {
  background: #f9fafb;
}

.clients-table th {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
}

.clients-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.clients-table tbody tr:hover {
  background: #fafafa;
}

.rank-cell {
  width: 48px;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  background: #f3f4f6;
  color: #6b7280;
}

.rank-badge.gold {
  background: #fef3c7;
  color: #92400e;
}

.rank-badge.silver {
  background: #f1f5f9;
  color: #475569;
}

.rank-badge.bronze {
  background: #fde8cc;
  color: #92400e;
}

.client-name {
  font-weight: 500;
  color: #111827;
}

.amount-cell {
  font-weight: 600;
  color: #111827;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #f9931e;
  border-radius: 4px;
  min-width: 4px;
  max-width: 200px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
}

/* ===== Payment Methods ===== */
.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.payment-method-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.1rem;
}

.payment-method-card h3 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.payment-method-card h3 i {
  color: #f9931e;
}

.payment-method-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.payment-method-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px dashed #e5e7eb;
}

.payment-method-card li:last-child {
  border-bottom: none;
}

.payment-method-card li strong {
  color: #111827;
  font-weight: 600;
}

/* ===== Historical table ===== */
.table-responsive {
  overflow-x: auto;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.summary-table thead tr {
  background: #f9fafb;
}

.summary-table th {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e5e7eb;
  text-align: right;
}

.summary-table th:first-child {
  text-align: left;
}

.summary-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: right;
}

.summary-table tbody tr:hover {
  background: #fafafa;
}

.month-cell {
  text-align: left;
  font-weight: 500;
  color: #374151;
}

.sales-cell {
  color: #f9931e;
  font-weight: 600;
}

.purchases-cell {
  color: #3b82f6;
  font-weight: 600;
}

.expenses-cell {
  color: #ef4444;
}

.incomes-cell {
  color: #22c55e;
}

.profit-positive {
  color: #16a34a;
  font-weight: 700;
}

.profit-negative {
  color: #dc2626;
  font-weight: 700;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 220px;
  }

  .filter-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .reports-container {
    padding: 1rem;
  }

  .kpi-value {
    font-size: 1.2rem;
  }

  .filter-actions {
    flex-direction: column;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>
