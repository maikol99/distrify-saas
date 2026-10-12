<template>
  <div class="home-container animate-fade-in">
    <accountNotVerified v-if="showVerifiedBanner"></accountNotVerified>

    <!-- Banner Superior de Bienvenida Naranja -->
    <div class="welcome-banner">
      <div class="welcome-banner-content">
        <div class="welcome-banner-icon">
          <span class="material-symbols-outlined">storefront</span>
        </div>
        <div class="welcome-banner-texts">
          <h1 class="welcome-title">
            ¡Hola de nuevo, {{ globalStore.userName() || "Gino Tridenti" }}! 👋
          </h1>
          <p class="welcome-subtitle">Tu tienda está funcionando muy bien hoy.</p>
          <div class="welcome-badge">
            <span class="material-symbols-outlined">trending_up</span>
            <span>Todo en orden · Sigue así</span>
          </div>
        </div>
      </div>
      <div class="welcome-banner-right">
        <div class="date-chip">
          <span class="material-symbols-outlined text-xs">calendar_today</span>
          <span>{{ todayFormatted }}</span>
        </div>
        <button
          @click="refreshData"
          class="btn-banner-refresh"
          :class="{ spinning: loading }"
          title="Actualizar datos"
        >
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Grid (3 tarjetas con sparklines) -->
    <div class="stats-grid">
      <!-- Tarjeta 1: Ventas de Hoy -->
      <div class="stat-card" :class="{ 'loading-shimmer': loading }">
        <div class="stat-card-left">
          <div class="stat-icon-wrapper bg-gradient-green">
            <span class="material-symbols-outlined">payments</span>
          </div>
          <div class="stat-info">
            <span class="stat-title">Ventas de Hoy</span>
            <h2 class="stat-value">{{ formatCurrency(todaySales) }}</h2>
            <div class="stat-trend trend-up">
              <span class="material-symbols-outlined text-xs">trending_up</span>
              <span>12% vs. ayer</span>
            </div>
          </div>
        </div>
        <!-- Sparkline verde estético -->
        <div class="stat-sparkline">
          <svg viewBox="0 0 100 35" class="sparkline-svg stroke-green" preserveAspectRatio="none">
            <path d="M0,28 Q25,25 45,18 T75,10 T100,5" fill="none" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Tarjeta 2: Ganancia Neta -->
      <div class="stat-card" :class="{ 'loading-shimmer': loading }">
        <div class="stat-card-left">
          <div class="stat-icon-wrapper bg-gradient-blue">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
          <div class="stat-info">
            <span class="stat-title">Ganancia Neta</span>
            <h2 class="stat-value">{{ formatCurrency(todayNetProfit) }}</h2>
            <div class="stat-trend trend-up">
              <span class="material-symbols-outlined text-xs">trending_up</span>
              <span>8% vs. ayer</span>
            </div>
          </div>
        </div>
        <!-- Sparkline azul estético -->
        <div class="stat-sparkline">
          <svg viewBox="0 0 100 35" class="sparkline-svg stroke-blue" preserveAspectRatio="none">
            <path d="M0,25 Q30,22 55,14 T80,12 T100,6" fill="none" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Tarjeta 3: Transacciones -->
      <div class="stat-card" :class="{ 'loading-shimmer': loading }">
        <div class="stat-card-left">
          <div class="stat-icon-wrapper bg-gradient-purple">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div class="stat-info">
            <span class="stat-title">Transacciones</span>
            <h2 class="stat-value">{{ transactionsCount }}</h2>
            <div class="stat-trend trend-neutral">
              <span class="material-symbols-outlined text-xs">bolt</span>
              <span>{{ transactionsCount > 0 ? 'Operaciones de hoy' : 'Sin cambios' }}</span>
            </div>
          </div>
        </div>
        <!-- Sparkline lila estético -->
        <div class="stat-sparkline">
          <svg viewBox="0 0 100 35" class="sparkline-svg stroke-purple" preserveAspectRatio="none">
            <path d="M0,22 Q30,12 60,26 T85,15 T100,8" fill="none" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Sección de Accesos Rápidos -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Accesos Rápidos</h2>
        <p class="section-subtitle">Gestiona tu negocio eficientemente</p>
      </div>
      <div class="quick-access-grid">
        <div
          v-for="(action, index) in quickActions"
          :key="index"
          class="action-card"
          @click="$router.push(action.route)"
        >
          <div class="action-icon-bg" :class="action.colorClass">
            <span class="material-symbols-outlined">{{ getIconName(action.icon) }}</span>
          </div>
          <span class="action-label">{{ action.title }}</span>
        </div>
      </div>
    </div>

    <!-- Sección de Gráficos (Tendencia de Ventas y Métodos de Pago) -->
    <div class="charts-section">
      <!-- Tarjeta Gráfico Tendencia de Ventas -->
      <div class="chart-card premium-card">
        <div class="card-header flex justify-between items-start">
          <div>
            <h3>Tendencia de Ventas</h3>
            <span class="card-subtitle">Últimos 6 meses</span>
          </div>
          <button @click="$router.push('/reportes')" class="btn-ver-detalles">
            Ver detalles <span class="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
        <div class="chart-wrapper">
          <Line
            v-if="salesChartData"
            :data="salesChartData"
            :options="chartOptions"
          />
          <div v-else class="chart-empty">
            <span class="material-symbols-outlined text-3xl text-gray-300">query_stats</span>
            <p>Cargando tendencia...</p>
          </div>
        </div>
      </div>

      <!-- Tarjeta Gráfico Métodos de Pago -->
      <div class="chart-card premium-card">
        <div class="card-header">
          <h3>Métodos de Pago</h3>
          <span class="card-subtitle">Distribución de ingresos</span>
        </div>
        <div class="payment-methods-layout">
          <div class="doughnut-container">
            <Doughnut
              v-if="paymentMethodsChartData"
              :data="paymentMethodsChartData"
              :options="doughnutOptions"
            />
            <div v-else class="chart-empty">
              <span class="material-symbols-outlined text-3xl text-gray-300">pie_chart</span>
              <p>Sin datos de pago</p>
            </div>
          </div>
          <!-- Leyenda personalizada lateral con porcentajes -->
          <div v-if="paymentMethodsBreakdown.length > 0" class="payment-legend">
            <div
              v-for="(item, idx) in paymentMethodsBreakdown"
              :key="idx"
              class="legend-item"
            >
              <div class="legend-left">
                <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-name">{{ item.name }}</span>
              </div>
              <span class="legend-percentage">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <createBusiness
    v-if="showingFirstLogin"
    @close="showingFirstLogin = false"
  ></createBusiness>
  <spinnerComponent v-if="loading"></spinnerComponent>
  <registerPhone
    v-if="showingRegisterPhone"
    @skip-verification="showingRegisterPhone = false"
    @submit="showingRegisterPhone = false"
  ></registerPhone>
</template>

<script>
import registerPhone from "@/components/visuals/auth/registerPhone.vue";
import accountNotVerified from "@/components/visuals/home/accountNotVerified.vue";
import createBusiness from "./createBusiness.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";
import api from "@/config/axios.config";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default {
  name: "HomeComponent",
  data() {
    return {
      globalStore: useGlobalStore(),
      loading: false,
      showVerifiedBanner: false,
      showingRegisterPhone: false,
      showingFirstLogin: false,

      // Data for reports
      todaySales: 0,
      todayNetProfit: 0,
      transactionsCount: 0,

      // Charts Data
      salesChartData: null,
      paymentMethodsChartData: null,
      paymentMethodsBreakdown: [],

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => "$" + new Intl.NumberFormat("es-AR").format(context.raw),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
      },
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: {
            display: false, // La leyenda personalizada la dibujamos al costado
          },
        },
      },

      quickActions: [
        {
          title: "Inventario",
          route: "/inventario",
          icon: "inventory_2",
          colorClass: "bg-gradient-blue",
        },
        {
          title: "Vender",
          route: "/ventas",
          icon: "point_of_sale",
          colorClass: "bg-gradient-green",
        },
        {
          title: "Ventas",
          route: "/historial/ventas",
          icon: "history",
          colorClass: "bg-gradient-orange",
        },
        {
          title: "Clientes",
          route: "/clientes",
          icon: "group",
          colorClass: "bg-gradient-indigo",
        },
        {
          title: "Reportes",
          route: "/reportes",
          icon: "analytics",
          colorClass: "bg-gradient-red",
        },
      ],
    };
  },
  components: {
    registerPhone,
    createBusiness,
    spinnerComponent,
    accountNotVerified,
    Line,
    Doughnut,
  },
  computed: {
    todayFormatted() {
      const date = moment();
      const monthShort = date.format("MMM").replace(".", "");
      return `Hoy, ${date.format("D")} ${monthShort}. ${date.format("YYYY")}`;
    },
  },
  methods: {
    getIconName(icon) {
      const mapping = {
        "fas fa-boxes": "inventory_2",
        "fas fa-cash-register": "point_of_sale",
        "fas fa-history": "history",
        "fas fa-users": "group",
        "fas fa-chart-bar": "analytics",
        "fas fa-dollar-sign": "payments",
        "fas fa-chart-line": "trending_up",
      };
      return mapping[icon] || icon;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      }).format(value || 0);
    },

    async fetchDailyReports() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;

        // Inicio y fin de hoy
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        // 1. Reporte de ventas y ganancia neta
        const response = await api.get("/reports/get/business-report", {
          params: {
            shopId: shopId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });

        if (response.data && response.data.totals) {
          this.todaySales = response.data.totals.sales || 0;
          this.todayNetProfit = response.data.totals.netProfit || 0;
        }

        // 2. Conteo real de transacciones de hoy
        const startFormatted = moment().format("YYYY-MM-DD");
        const salesRes = await api.get(`/sales/get/sales-with-filter/${shopId}`, {
          params: {
            startDate: startFormatted,
            endDate: startFormatted,
            page: 1,
            limit: 1,
          },
        });

        if (salesRes.data && salesRes.data.pagination) {
          this.transactionsCount = salesRes.data.pagination.total || 0;
        } else if (salesRes.data && Array.isArray(salesRes.data.data)) {
          this.transactionsCount = salesRes.data.data.length;
        }
      } catch (error) {
        console.error("Error fetching daily reports:", error);
      }
    },

    async fetchHistoricalReports() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;

        // Últimos 6 meses
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        start.setDate(1);

        const response = await api.get("/reports/get/business-report", {
          params: {
            shopId: shopId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });

        const data = response.data;

        if (data) {
          // Gráfico mensual de ventas
          if (data.monthlySalesAggregated) {
            const labels = data.monthlySalesAggregated.map((item) => item.month);
            const values = data.monthlySalesAggregated.map((item) => item.value);

            this.salesChartData = {
              labels: labels,
              datasets: [
                {
                  label: "Ventas",
                  backgroundColor: "rgba(249, 147, 30, 0.15)",
                  borderColor: "#f9931e",
                  pointBackgroundColor: "#f9931e",
                  pointBorderColor: "#ffffff",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  data: values,
                  tension: 0.35,
                  fill: true,
                },
              ],
            };
          }

          // Gráfico y leyenda de métodos de pago
          if (data.salesByPaymentMethodTotals) {
            const rawLabels = Object.keys(data.salesByPaymentMethodTotals);
            const values = Object.values(data.salesByPaymentMethodTotals);
            const total = values.reduce((sum, v) => sum + (v || 0), 0);

            const palette = [
              "#3b82f6", // Azul (ej: Tarjeta)
              "#10b981", // Verde (ej: Efectivo)
              "#f9931e", // Naranja (ej: Transferencia)
              "#8b5cf6", // Violeta (ej: Otros)
              "#ef4444",
            ];

            this.paymentMethodsChartData = {
              labels: rawLabels,
              datasets: [
                {
                  backgroundColor: palette.slice(0, rawLabels.length),
                  borderWidth: 0,
                  data: values,
                },
              ],
            };

            // Armar desglose con porcentajes
            this.paymentMethodsBreakdown = rawLabels.map((lbl, idx) => {
              const val = values[idx] || 0;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return {
                name: lbl,
                percentage: pct,
                color: palette[idx % palette.length],
              };
            });
          }
        }
      } catch (error) {
        console.error("Error fetching historical charts:", error);
      }
    },

    async checkIfIsVerified() {
      try {
        const userId = this.globalStore.userId();
        if (!userId) return;
        const response = await api.get(`/users/get/is-email-verified/${userId}`);
        const data = response.data;
        this.showVerifiedBanner = !data.isEmailVerified;
      } catch (error) {
        console.log(error);
      }
    },
    async checkPhone() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;
        const response = await api.get(`/shops/get/verify-shop-phone/${shopId}`);
        this.showingRegisterPhone = !response.data.success;
      } catch (error) {
        console.log(error);
      }
    },
    async refreshData() {
      this.loading = true;
      await Promise.all([
        this.fetchDailyReports(),
        this.fetchHistoricalReports(),
      ]);
      this.loading = false;
    },
  },
  async mounted() {
    this.loading = true;
    await this.globalStore.fetchShopData();
    await this.checkIfIsVerified();
    await this.checkPhone();

    if (this.globalStore.shopData && this.globalStore.shopData.isFirstLogin) {
      this.showingFirstLogin = true;
    }

    await Promise.all([
      this.fetchDailyReports(),
      this.fetchHistoricalReports(),
    ]);

    this.loading = false;
  },
};
</script>

<style scoped>
.home-container {
  padding: 1.5rem;
  width: 100%;
  margin: 0 auto;
  color: #334155;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Banner Superior Naranja */
.welcome-banner {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  border-radius: 1.5rem;
  padding: 1.75rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px -5px rgba(249, 147, 30, 0.35);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  pointer-events: none;
}

.welcome-banner-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1;
}

.welcome-banner-icon {
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-banner-icon .material-symbols-outlined {
  font-size: 2rem;
  color: #ffffff;
}

.welcome-banner-texts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.92;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.35rem;
  opacity: 0.95;
}

.welcome-badge .material-symbols-outlined {
  font-size: 0.95rem;
}

.welcome-banner-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-banner-refresh {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  border: none;
  padding: 0.5rem;
  border-radius: 1rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-banner-refresh:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-banner-refresh.spinning .material-symbols-outlined {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.25rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
}

.stat-card-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.stat-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon-wrapper .material-symbols-outlined {
  font-size: 1.75rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

.trend-up {
  color: #10b981;
}

.trend-neutral {
  color: #94a3b8;
}

/* Sparklines SVG */
.stat-sparkline {
  width: 90px;
  height: 35px;
  flex-shrink: 0;
  opacity: 0.85;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
}

.stroke-green { stroke: #10b981; }
.stroke-blue { stroke: #3b82f6; }
.stroke-purple { stroke: #a855f7; }

/* Quick Access */
.content-section {
  margin-bottom: 2.25rem;
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
}

.action-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  border: 1px solid #edf2f7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px -5px rgba(249, 147, 30, 0.15);
  border-color: #f9931e50;
}

.action-icon-bg {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon-bg {
  transform: scale(1.1);
}

.action-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.5rem;
}

.premium-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.75rem;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
}

.btn-ver-detalles {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-ver-detalles:hover {
  color: #f9931e;
  background: #fff7ed;
}

.chart-wrapper {
  height: 280px;
  width: 100%;
}

.chart-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
  font-size: 0.85rem;
}

/* Layout de Métodos de Pago */
.payment-methods-layout {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 280px;
}

.doughnut-container {
  flex: 1;
  height: 100%;
  position: relative;
}

.payment-legend {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 160px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: #475569;
  font-weight: 500;
}

.legend-percentage {
  font-weight: 800;
  color: #1e293b;
}

/* Gradients */
.bg-gradient-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.bg-gradient-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
.bg-gradient-orange {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
}
.bg-gradient-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}
.bg-gradient-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
.bg-gradient-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* Animations & Shimmer */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-shimmer {
  position: relative;
  background: #f8fafc;
}

.loading-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
  .quick-access-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
  }
  .welcome-banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .payment-methods-layout {
    flex-direction: column;
    height: auto;
  }
  .doughnut-container {
    height: 220px;
    width: 100%;
  }
  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
