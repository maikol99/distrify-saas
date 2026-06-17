<template>
  <div class="home-container animate-fade-in">
    <accountNotVerified v-if="showVerifiedBanner"></accountNotVerified>

    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>¡Hola de nuevo, {{ globalStore.userName() || "Usuario" }}! 👋</h1>
        <p>Aquí tienes un resumen del rendimiento de tu tienda hoy.</p>
      </div>
      <div class="welcome-actions">
        <button
          @click="refreshData"
          class="btn-refresh"
          :class="{ spinning: loading }"
        >
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in quickStats"
        :key="index"
        class="stat-card"
        :class="{ 'loading-shimmer': loading }"
      >
        <div class="stat-icon-wrapper" :class="stat.colorClass">
          <span class="material-symbols-outlined">{{
            getIconName(stat.icon)
          }}</span>
        </div>
        <div class="stat-info">
          <span class="stat-title">{{ stat.title }}</span>
          <h2 class="stat-value">{{ formatCurrency(stat.value) }}</h2>
          <div
            class="stat-trend"
            :class="stat.trend > 0 ? 'trend-up' : 'trend-neutral'"
          >
            <span class="material-symbols-outlined text-sm">{{
              stat.trend > 0 ? "trending_up" : "horizontal_rule"
            }}</span>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Transaction Count Card -->
      <div class="stat-card" :class="{ 'loading-shimmer': loading }">
        <div class="stat-icon-wrapper bg-gradient-purple">
          <span class="material-symbols-outlined">receipt_long</span>
        </div>
        <div class="stat-info">
          <span class="stat-title">Transacciones</span>
          <h2 class="stat-value">{{ transactionsCount }}</h2>
          <div class="stat-trend trend-neutral">
            <span class="material-symbols-outlined text-sm">bolt</span>
            <span>Operaciones de hoy</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Access Section -->
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
            <span class="material-symbols-outlined">{{
              getIconName(action.icon)
            }}</span>
          </div>
          <span class="action-label">{{ action.title }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card premium-card">
        <div class="card-header">
          <h3>Tendencia de Ventas</h3>
          <span class="card-subtitle">Últimos 6 meses</span>
        </div>
        <div class="chart-wrapper">
          <Line
            v-if="salesChartData"
            :data="salesChartData"
            :options="chartOptions"
          />
        </div>
      </div>
      <div class="chart-card premium-card">
        <div class="card-header">
          <h3>Métodos de Pago</h3>
          <span class="card-subtitle">Distribución de ingresos</span>
        </div>
        <div class="chart-wrapper">
          <Doughnut
            v-if="paymentMethodsChartData"
            :data="paymentMethodsChartData"
            :options="doughnutOptions"
          />
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
  data() {
    return {
      showingRegisterPhone: false,
      showVerifiedBanner: false,
      showingFirstLogin: false,
      loading: false,
      globalStore: useGlobalStore(),

      // Data for reports
      todaySales: 0,
      todayNetProfit: 0,
      transactionsCount: 0,

      // Charts Data
      salesChartData: null,
      paymentMethodsChartData: null,

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
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
        plugins: {
          legend: {
            position: "bottom",
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
    quickStats() {
      return [
        {
          title: "Ventas de Hoy",
          value: this.todaySales,
          label: "Total facturado",
          icon: "payments",
          colorClass: "bg-gradient-green",
          trend: 10,
        },
        {
          title: "Ganancia Neta",
          value: this.todayNetProfit,
          label: "Beneficio estimado",
          icon: "trending_up",
          colorClass: "bg-gradient-blue",
          trend: 5,
        },
      ];
    },
  },
  methods: {
    getIconName(icon) {
      // Map font-awesome names to material-symbols if needed, or just return icon if they are already material
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
      }).format(value);
    },

    async fetchDailyReports() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;

        // Start of today
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        // End of today
        const end = new Date();
        end.setHours(23, 59, 59, 999);

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
      } catch (error) {
        console.error("Error fetching daily reports:", error);
      }
    },

    async fetchHistoricalReports() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;

        // Last 6 months
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        start.setDate(1); // Start from the 1st of 6 months ago to get full months

        const response = await api.get("/reports/get/business-report", {
          params: {
            shopId: shopId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });

        const data = response.data;

        if (data) {
          // Process Monthly Sales using monthlySalesAggregated
          if (data.monthlySalesAggregated) {
            const labels = data.monthlySalesAggregated.map(
              (item) => item.month,
            );
            const values = data.monthlySalesAggregated.map(
              (item) => item.value,
            );

            this.salesChartData = {
              labels: labels,
              datasets: [
                {
                  label: "Ventas",
                  backgroundColor: "#f9931ef0", // primary orange with transparency
                  borderColor: "#f9931e",
                  data: values,
                  tension: 0.3,
                  fill: true,
                },
              ],
            };
          }

          // Process Payment Methods
          if (data.salesByPaymentMethodTotals) {
            const labels = Object.keys(data.salesByPaymentMethodTotals);
            const values = Object.values(data.salesByPaymentMethodTotals);
            this.paymentMethodsChartData = {
              labels: labels,
              datasets: [
                {
                  backgroundColor: [
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                  ],
                  data: values,
                },
              ],
            };
          }
        }
      } catch (error) {
        console.error("Error fetching historical charts:", error);
      }
    },

    async checkIfIsVerified() {
      try {
        const userId = this.globalStore.userId();
        const response = await api.get(
          `/users/get/is-email-verified/${userId}`,
        );
        const data = response.data;

        if (data.isEmailVerified) {
          this.showVerifiedBanner = false;
        } else {
          this.showVerifiedBanner = true;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async checkPhone() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;
        const response = await api.get(
          `/shops/get/verify-shop-phone/${shopId}`,
        );
        this.showingRegisterPhone = !response.data.success;
      } catch (error) {
        console.log(error);
      }
    },
    refreshData() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
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

    // Fetch reports
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
  padding: 1rem 1.5rem;
  width: 100%;
  margin: 0 auto;
  color: #334155;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.welcome-text h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.welcome-text p {
  color: #64748b;
  font-size: 1rem;
}

.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 1rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-refresh:hover {
  background: #f8fafc;
  color: #f9931e;
  border-color: #fbd38d;
  transform: rotate(30deg);
}

.btn-refresh.spinning .material-symbols-outlined {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.stat-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  word-break: break-all;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

.trend-up {
  color: #10b981;
}
.trend-neutral {
  color: #94a3b8;
}

/* Quick Access */
.content-section {
  margin-bottom: 2.5rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.25rem;
}

.action-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 20px -5px rgba(249, 147, 30, 0.15);
  border-color: #f9931e40;
}

.action-icon-bg {
  width: 3.5rem;
  height: 3.5rem;
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

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.premium-card {
  background: white;
  border-radius: 2rem;
  padding: 2rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1e293b;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
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

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shimmer Loading */
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
  100% {
    transform: translateX(100%);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .home-container {
    padding: 1rem;
  }
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
