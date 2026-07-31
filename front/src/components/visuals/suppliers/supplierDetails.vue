<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-gray-50 md:rounded-3xl shadow-2xl flex flex-col w-screen h-screen md:w-[1200px] md:h-[95vh] font-sans overflow-hidden">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-gray-200 bg-white md:rounded-t-3xl shadow-sm z-10 flex-shrink-0 gap-4">
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer flex justify-center items-center py-2 px-3">
            <span class="material-symbols-outlined mr-1" style="font-size: 1.2rem;">arrow_back</span>
            Volver
          </button>
          <h2 class="text-xl font-bold m-0 flex items-center gap-2 text-gray-800">
            Detalles del Proveedor: {{ supplier.name }}
          </h2>
        </div>
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <button class="py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 shadow-sm flex items-center justify-center flex-1 md:flex-auto" @click="generateSupplierPDF" :disabled="loading">
             <span class="material-symbols-outlined mr-2">picture_as_pdf</span>
             Generar PDF
          </button>
          <button v-if="!isEditing" class="py-2 px-4 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center flex-1 md:flex-auto" @click="editSupplier">
            <span class="material-symbols-outlined mr-2">edit</span>
            Editar
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="supplier-info">
          <div class="info-item">
            <span class="label">Nombre:</span>
            <span v-if="!isEditing" class="value">{{ supplier.name }}</span>
            <input
              v-else
              v-model="editableSupplier.name"
              type="text"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <span class="label">Dirección:</span>
            <span v-if="!isEditing" class="value">{{
              supplier.address || "No especificada"
            }}</span>
            <input
              v-else
              v-model="editableSupplier.address"
              type="text"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <span class="label">Teléfono:</span>
            <span v-if="!isEditing" class="value">
              <a
                v-if="supplier.phone"
                :href="getWhatsappLink(supplier.phone)"
                target="_blank"
                >{{ supplier.phone }}</a
              >
              <span v-else>No especificado</span>
            </span>
            <input
              v-else
              v-model="editableSupplier.phone"
              type="text"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span v-if="!isEditing" class="value">
              <a
                v-if="supplier.email"
                :href="`mailto:${supplier.email}`"
                target="_blank"
                >{{ supplier.email }}</a
              >
              <span v-else>No especificado</span>
            </span>
            <input
              v-else
              v-model="editableSupplier.email"
              type="email"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <span class="label">CUIT/CUIL:</span>
            <span v-if="!isEditing" class="value">{{
              supplier.cuit || "No especificado"
            }}</span>
            <input
              v-else
              v-model="editableSupplier.cuit"
              type="text"
              class="edit-input"
            />
          </div>
          <div class="info-item balance">
            <span class="label">Balance Total:</span>
            <span
              class="value"
              :class="{
                'positive-balance': supplier.totalBalance >= 0,
                'negative-balance': supplier.totalBalance < 0,
              }"
            >
              {{ formatNumber(supplier.totalBalance || 0) }}
            </span>
          </div>
          <div v-if="isEditing" class="edit-actions">
            <button class="save-button" @click="saveSupplierDetails">
              Guardar
            </button>
            <button class="cancel-button" @click="cancelEdit">Cancelar</button>
          </div>
        </div>
      <!-- NAVEGACIÓN POR PESTAÑAS -->
      <div class="tabs-navigation">
        <button
          @click="activeTab = 'purchases'"
          :class="['tab-button', { active: activeTab === 'purchases' }]"
        >
          <i class="fas fa-shopping-bag"></i>
          <span>Compras</span>
          <span class="tab-count" v-if="purchasesTotalCount">{{
            purchasesTotalCount
          }}</span>
        </button>
        <button
          @click="activeTab = 'payments'"
          :class="['tab-button', { active: activeTab === 'payments' }]"
        >
          <i class="fas fa-credit-card"></i>
          <span>Pagos</span>
          <span class="tab-count" v-if="paymentsTotalCount">{{
            paymentsTotalCount
          }}</span>
        </button>
      </div>
      <!-- CONTENIDO DE LAS PESTAÑAS -->
      <div class="tab-content">
        <!-- COMPRAS -->
        <div v-if="activeTab === 'purchases'" class="tab-section">
          <div v-if="purchases && purchases.length > 0">
            <div class="section-header">
              <div class="section-title">
                <h4>Historial de Compras</h4>
                <div class="section-stats">
                  <span class="stat-item">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value">{{ purchasesTotalCount }}</span>
                  </span>
                  <span class="stat-item">
                    <span class="stat-label">Monto Total (página):</span>
                    <span class="stat-value">{{
                      formatNumber(totalPurchasesAmount)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Método de pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="purchase in purchases"
                    :key="purchase._id"
                    @click="openDetailModal('purchase', purchase)"
                    class="clickable-row"
                  >
                    <td>{{ formatDate(purchase.createdAt) }}</td>
                    <td>
                      {{
                        getProductDetailsDescription(purchase.productDetails)
                      }}
                    </td>
                    <td class="payment-methods-cell">
                      <div class="single-payment">
                        <span class="payment-badge single">
                          {{ purchase.paymentMethod || "No especificado" }}
                        </span>
                      </div>
                    </td>
                    <td>{{ formatNumber(purchase.total) }}</td>
                    <td>
                      <span
                        :class="[
                          'badge',
                          purchase.status === 'Cancelado' ||
                          purchase.status === 'Pendiente'
                            ? 'debt-badge'
                            : 'purchase-badge',
                        ]"
                      >
                        {{ purchase.status || "Completado" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination-controls">
              <button
                @click="fetchPurchases(purchasesCurrentPage - 1)"
                :disabled="purchasesCurrentPage <= 1"
              >
                Anterior
              </button>
              <span
                >Página {{ purchasesCurrentPage }} de
                {{ purchasesTotalPages }}</span
              >
              <button
                @click="fetchPurchases(purchasesCurrentPage + 1)"
                :disabled="purchasesCurrentPage >= purchasesTotalPages"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-shopping-bag"></i>
            <h3>No hay compras registradas</h3>
            <p>No se encontraron compras para este proveedor.</p>
          </div>
        </div>
        <!-- PAGOS -->
        <div v-if="activeTab === 'payments'" class="tab-section">
          <div v-if="payments && payments.length > 0">
            <div class="section-header">
              <div class="section-title">
                <h4>Historial de Pagos</h4>
                <div class="section-stats">
                  <span class="stat-item">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value">{{ paymentsTotalCount }}</span>
                  </span>
                  <span class="stat-item">
                    <span class="stat-label">Monto Total (página):</span>
                    <span class="stat-value">{{
                      formatNumber(totalPaymentsAmount)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="payment in payments"
                    :key="payment._id"
                    @click="openDetailModal('payment', payment)"
                    class="clickable-row"
                  >
                    <td>{{ formatDate(payment.date || payment.createdAt) }}</td>
                    <td>{{ formatNumber(payment.amount) }}</td>
                    <td>{{ payment.paymentMethod || "No especificado" }}</td>
                    <td>{{ payment.description || payment.notes || "N/A" }}</td>
                    <td>
                      <span
                        :class="[
                          'badge',
                          payment.type === 'payment'
                            ? 'purchase-badge'
                            : 'debt-badge',
                        ]"
                      >
                        {{ payment.type === "payment" ? "Pago" : "Deuda" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination-controls">
              <button
                @click="fetchPayments(paymentsCurrentPage - 1)"
                :disabled="paymentsCurrentPage <= 1"
              >
                Anterior
              </button>
              <span
                >Página {{ paymentsCurrentPage }} de
                {{ paymentsTotalPages }}</span
              >
              <button
                @click="fetchPayments(paymentsCurrentPage + 1)"
                :disabled="paymentsCurrentPage >= paymentsTotalPages"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-credit-card"></i>
            <h3>No hay pagos registrados</h3>
            <p>No se encontraron pagos para este proveedor.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>

  <!-- Modal de Detalles de Compra/Pago -->
  <div
    v-if="showDetailModal"
    class="detail-modal-overlay"
    @click.self="closeDetailModal"
  >
    <div class="detail-modal-content">
      <div class="modal-header">
        <h3>
          Detalles de
          {{ modalType === "purchase" ? "Compra" : "Pago" }}
        </h3>
        <button class="modal-close-button" @click="closeDetailModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-info-grid">
          <div class="modal-info-item">
            <span class="label">ID:</span>
            <span class="value">{{ modalData._id }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">Fecha:</span>
            <span class="value">{{
              formatDate(modalData.createdAt || modalData.date)
            }}</span>
          </div>

          <template v-if="modalType === 'purchase'">
            <div class="modal-info-item">
              <span class="label">Total:</span>
              <span class="value">{{ formatNumber(modalData.total) }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.invoiceNumber">
              <span class="label">Número de Factura:</span>
              <span class="value">{{ modalData.invoiceNumber }}</span>
            </div>
            <div class="modal-info-item">
              <span class="label">Método de Pago:</span>
              <span class="value">{{
                modalData.paymentMethod || "No especificado"
              }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.discount">
              <span class="label">Descuento:</span>
              <span class="value">{{ formatNumber(modalData.discount) }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.tax">
              <span class="label">Impuestos:</span>
              <span class="value">{{ formatNumber(modalData.tax) }}</span>
            </div>
          </template>

          <template v-else-if="modalType === 'payment'">
            <div class="modal-info-item">
              <span class="label">Monto:</span>
              <span class="value">{{ formatNumber(modalData.amount) }}</span>
            </div>
            <div class="modal-info-item">
              <span class="label">Método:</span>
              <span class="value">{{
                modalData.paymentMethod || "No especificado"
              }}</span>
            </div>
            <div class="modal-info-item">
              <span class="label">Tipo:</span>
              <span class="value">{{
                modalData.type === "payment" ? "Pago" : "Deuda"
              }}</span>
            </div>
            <div class="modal-info-item">
              <span class="label">Descripción:</span>
              <span class="value">{{
                modalData.description || modalData.notes || "N/A"
              }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.reference">
              <span class="label">Referencia:</span>
              <span class="value">{{ modalData.reference }}</span>
            </div>
          </template>
        </div>

        <template v-if="modalType === 'purchase'">
          <h4 class="modal-section-title">Productos:</h4>
          <div
            v-if="
              modalData.productDetails && modalData.productDetails.length > 0
            "
            class="product-details-list"
          >
            <div
              v-for="(product, index) in modalData.productDetails"
              :key="index"
              class="product-item"
            >
              <span class="product-name">{{
                getProductNameForModal(product)
              }}</span>
              <span class="product-quantity">x{{ product.quantity }}</span>
              <span class="product-price">{{
                formatNumber(
                  product.unitPrice ||
                    product.price ||
                    (product.productId && product.productId.purchasePrice) ||
                    0
                )
              }}</span>
            </div>
          </div>
          <div v-else class="empty-state-small">
            <p>No hay productos registrados para esta compra.</p>
          </div>
        </template>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="loading" />
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import numeral from "numeral";
import api from "@/config/axios.config";
import spinnerComponent from "../spinnerComponent.vue";

export default {
  name: "SupplierDetails",
  components: {
    spinnerComponent,
  },
  props: {
    supplierId: {
      type: String,
      required: true,
    },
    shopId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      supplier: {
        name: "",
        address: "",
        phone: "",
        email: "",
        cuit: "",
        totalBalance: 0,
      },
      editableSupplier: {
        name: "",
        address: "",
        phone: "",
        email: "",
        cuit: "",
      },
      purchases: [],
      purchasesCurrentPage: 1,
      purchasesItemsPerPage: 10,
      purchasesTotalPages: 1,
      purchasesTotalCount: 0,

      payments: [],
      paymentsCurrentPage: 1,
      paymentsItemsPerPage: 10,
      paymentsTotalPages: 1,
      paymentsTotalCount: 0,

      activeTab: "purchases",
      loading: false,
      isEditing: false,
      showDetailModal: false,
      modalData: null,
      modalType: "", // 'purchase' or 'payment'
    };
  },
  computed: {
    totalPurchasesAmount() {
      return this.purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    },
    totalPaymentsAmount() {
      return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    },
  },
  watch: {
    activeTab(newTab) {
      // Cuando la pestaña activa cambia, cargar los datos correspondientes
      switch (newTab) {
        case "purchases":
          this.fetchPurchases(1);
          break;
        case "payments":
          this.fetchPayments(1);
          break;
      }
    },
  },
  methods: {
    async generateSupplierPDF() {
      this.loading = true;

      try {
        // Crear nueva instancia de PDF
        const pdf = new jsPDF();

        // Obtener todas las compras del proveedor
        const allPurchasesResponse = await api.get(
          `/suppliers/get/supplier-buys/${this.supplierId}?page=1&limit=1000`
        );
        const allPurchases = allPurchasesResponse.data.success
          ? allPurchasesResponse.data.data
          : [];

        // Obtener todos los pagos del proveedor
        const allPaymentsResponse = await api.get(
          `/supplier-payments/get/supplier-payments/${this.supplierId}?page=1&limit=1000`
        );
        const allPayments = allPaymentsResponse.data.success
          ? allPaymentsResponse.data.data.payments
          : [];

        // ===== CALCULAR TOTALES GENERALES =====
        const totalAllPurchases = allPurchases.reduce(
          (sum, purchase) => sum + purchase.total,
          0
        );
        const totalAllPayments = allPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        // ===== CONFIGURACIÓN DEL PDF =====
        pdf.setFont("helvetica");
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        // ===== ENCABEZADO CORPORATIVO =====
        // Banda superior azul corporativa
        pdf.setFillColor(25, 55, 88); // Azul marino corporativo
        pdf.rect(0, 0, pageWidth, 35, "F");

        // Título principal
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("RESUMEN DE PROVEEDOR", pageWidth / 2, 20, {
          align: "center",
        });

        // ===== INFORMACIÓN DEL PROVEEDOR =====
        let currentY = 50;

        // Caja de información del proveedor
        pdf.setFillColor(248, 249, 250);
        pdf.rect(15, currentY - 5, pageWidth - 30, 40, "F");
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(15, currentY - 5, pageWidth - 30, 40, "S");

        pdf.setTextColor(25, 55, 88);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("DATOS DEL PROVEEDOR", 20, currentY + 3);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        // Columna izquierda
        pdf.text(
          `Proveedor: ${this.supplier.name || "N/A"}`,
          20,
          currentY + 12
        );
        pdf.text(
          `Dirección: ${this.supplier.address || "No especificada"}`,
          20,
          currentY + 20
        );
        pdf.text(
          `CUIT/CUIL: ${this.supplier.cuit || "No especificado"}`,
          20,
          currentY + 28
        );

        // Columna derecha
        pdf.text(
          `Teléfono: ${this.supplier.phone || "No registrado"}`,
          pageWidth / 2,
          currentY + 12
        );
        pdf.text(
          `Email: ${this.supplier.email || "No registrado"}`,
          pageWidth / 2,
          currentY + 20
        );

        currentY += 45;

        // ===== RESUMEN EJECUTIVO =====
        pdf.setFillColor(25, 55, 88);
        pdf.rect(15, currentY, pageWidth - 30, 25, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Fecha de Emisión: ${moment().format("DD/MM/YYYY HH:mm")}`,
          pageWidth / 2,
          currentY + 16,
          { align: "center" }
        );

        currentY += 35;

        // Tarjetas de métricas
        const cardWidth = (pageWidth - 50) / 3;
        const cardHeight = 25;

        // Balance Total (Color dependiente del balance)
        const balanceColor =
          this.supplier.totalBalance >= 0 ? [39, 174, 96] : [231, 76, 60]; // Verde si positivo, rojo si negativo
        pdf.setFillColor(...balanceColor);
        pdf.rect(15, currentY, cardWidth, cardHeight, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("BALANCE TOTAL", 15 + cardWidth / 2, currentY + 8, {
          align: "center",
        });
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(this.supplier.totalBalance || 0),
          15 + cardWidth / 2,
          currentY + 18,
          { align: "center" }
        );

        // Total Compras (Azul)
        pdf.setFillColor(52, 152, 219);
        pdf.rect(15 + cardWidth + 10, currentY, cardWidth, cardHeight, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "TOTAL COMPRAS",
          15 + cardWidth + 10 + cardWidth / 2,
          currentY + 8,
          { align: "center" }
        );
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(totalAllPurchases),
          15 + cardWidth + 10 + cardWidth / 2,
          currentY + 18,
          { align: "center" }
        );

        // Total Pagos (Verde)
        pdf.setFillColor(39, 174, 96);
        pdf.rect(
          15 + (cardWidth + 10) * 2,
          currentY,
          cardWidth,
          cardHeight,
          "F"
        );
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "TOTAL PAGOS",
          15 + (cardWidth + 10) * 2 + cardWidth / 2,
          currentY + 8,
          { align: "center" }
        );
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(totalAllPayments),
          15 + (cardWidth + 10) * 2 + cardWidth / 2,
          currentY + 18,
          { align: "center" }
        );

        currentY += 40;

        // ===== SECCIÓN COMPRAS =====
        if (allPurchases && allPurchases.length > 0) {
          // Verificar si necesitamos nueva página
          if (currentY > pageHeight - 80) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.setTextColor(25, 55, 88);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `HISTORIAL COMPLETO DE COMPRAS (${allPurchases.length} registros)`,
            20,
            currentY
          );
          currentY += 10;

          const purchasesData = allPurchases.map((purchase, index) => [
            String(index + 1).padStart(3, "0"), // Numeración
            this.formatDate(purchase.createdAt),
            this.getProductDetailsDescription(purchase.productDetails),
            purchase.paymentMethod || "No especificado",
            this.formatNumber(purchase.total),
            purchase.status || "Completado",
          ]);

          pdf.autoTable({
            head: [["#", "Fecha", "Productos", "Pago", "Total", "Estado"]],
            body: purchasesData,
            startY: currentY,
            theme: "striped",
            headStyles: {
              fillColor: [52, 152, 219], // Azul para compras
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
              halign: "center",
            },
            bodyStyles: {
              fontSize: 8,
              cellPadding: 3,
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250],
            },
            columnStyles: {
              0: { halign: "center", cellWidth: 15 },
              1: { halign: "center", cellWidth: 25 },
              2: { halign: "left", cellWidth: 65 },
              3: { halign: "center", cellWidth: 25 },
              4: { halign: "right", cellWidth: 25 },
              5: { halign: "center", cellWidth: 25 },
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
              // Agregar línea decorativa
              pdf.setDrawColor(52, 152, 219);
              pdf.setLineWidth(0.5);
              pdf.line(
                15,
                data.pageNumber > 1 ? 15 : currentY - 2,
                pageWidth - 15,
                data.pageNumber > 1 ? 15 : currentY - 2
              );
            },
          });

          currentY = pdf.lastAutoTable.finalY + 10;

          // Subtotal destacado
          pdf.setFillColor(52, 152, 219);
          pdf.rect(pageWidth - 70, currentY - 5, 55, 12, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `SUBTOTAL: ${this.formatNumber(totalAllPurchases)}`,
            pageWidth - 17,
            currentY + 2,
            { align: "right" }
          );

          currentY += 20;
        }

        // ===== SECCIÓN PAGOS =====
        if (allPayments && allPayments.length > 0) {
          if (currentY > pageHeight - 80) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.setTextColor(25, 55, 88);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `HISTORIAL COMPLETO DE PAGOS (${allPayments.length} registros)`,
            20,
            currentY
          );
          currentY += 10;

          const paymentsData = allPayments.map((payment, index) => [
            String(index + 1).padStart(3, "0"),
            this.formatDate(payment.date || payment.createdAt),
            this.formatNumber(payment.amount),
            payment.description || payment.notes || "Pago a proveedor",
            payment.paymentMethod || "Efectivo",
            payment.type === "payment" ? "Pago" : "Deuda",
          ]);

          pdf.autoTable({
            head: [["#", "Fecha", "Monto", "Descripción", "Método", "Tipo"]],
            body: paymentsData,
            startY: currentY,
            theme: "striped",
            headStyles: {
              fillColor: [39, 174, 96], // Verde para pagos
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
              halign: "center",
            },
            bodyStyles: {
              fontSize: 8,
              cellPadding: 3,
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250],
            },
            columnStyles: {
              0: { halign: "center", cellWidth: 15 },
              1: { halign: "center", cellWidth: 25 },
              2: { halign: "right", cellWidth: 25 },
              3: { halign: "left", cellWidth: 50 },
              4: { halign: "center", cellWidth: 25 },
              5: { halign: "center", cellWidth: 20 },
            },
            margin: { left: 15, right: 15 },
          });

          currentY = pdf.lastAutoTable.finalY + 10;

          // Subtotal destacado
          pdf.setFillColor(39, 174, 96);
          pdf.rect(pageWidth - 70, currentY - 5, 55, 12, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `SUBTOTAL: ${this.formatNumber(totalAllPayments)}`,
            pageWidth - 17,
            currentY + 2,
            { align: "right" }
          );
        }

        // ===== RESUMEN FINAL =====
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = 20;
        } else {
          currentY += 25;
        }

        // Caja de resumen final
        pdf.setFillColor(25, 55, 88);
        pdf.rect(15, currentY, pageWidth - 30, 40, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("BALANCE GENERAL", pageWidth / 2, currentY + 10, {
          align: "center",
        });

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Total Comprado: ${this.formatNumber(totalAllPurchases)}`,
          pageWidth / 2,
          currentY + 20,
          { align: "center" }
        );
        pdf.text(
          `Total Pagado: ${this.formatNumber(totalAllPayments)}`,
          pageWidth / 2,
          currentY + 27,
          { align: "center" }
        );
        pdf.text(
          `Balance Actual: ${this.formatNumber(
            this.supplier.totalBalance || 0
          )}`,
          pageWidth / 2,
          currentY + 34,
          { align: "center" }
        );

        // ===== PIE DE PÁGINA EN TODAS LAS PÁGINAS =====
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);

          // Línea separadora
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

          // Información del pie
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.setFont("helvetica", "normal");
          pdf.text("Alevia Pay - Gestión & e-commerce ", 20, pageHeight - 12);
          pdf.text(
            `Generado el: ${moment().format("DD/MM/YYYY HH:mm")}`,
            20,
            pageHeight - 7
          );

          // Numeración de páginas
          pdf.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            pageHeight - 7,
            { align: "right" }
          );
        }

        // ===== GUARDAR ARCHIVO =====
        const fileName = `Resumen_Proveedor_${this.supplier.name
          .replace(/\s+/g, "_")
          .toUpperCase()}_${moment().format("YYYY-MM-DD_HH-mm")}.pdf`;
        pdf.save(fileName);

        alert("✅ PDF del proveedor generado exitosamente!");
      } catch (error) {
        console.error("Error generando PDF completo:", error);
        alert(
          "❌ Error al generar el PDF. Verifique la conexión y vuelva a intentar."
        );
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$emit("close");
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return moment(dateString).format("DD/MM/YYYY HH:mm");
    },
    formatNumber(value) {
      return numeral(value).format("$0,0.00");
    },
    getWhatsappLink(phone) {
      return `https://wa.me/${phone}?text=Hola, me gustaría contactar contigo.`;
    },
    getProductDetailsDescription(productDetails) {
      if (!productDetails || productDetails.length === 0) {
        return "Sin productos";
      }
      return productDetails
        .map((item) => {
          const name =
            item.productId && item.productId.name
              ? item.productId.name
              : item.name || "Producto";
          return `${name} (x${item.quantity})`;
        })
        .join(", ");
    },
    getProductNameForModal(productItem) {
      return productItem.productId &&
        typeof productItem.productId === "object" &&
        productItem.productId.name
        ? productItem.productId.name
        : productItem.name ||
            `Producto ID: ${productItem.productId || "Desconocido"}`;
    },
    editSupplier() {
      this.isEditing = true;
      this.editableSupplier = { ...this.supplier };
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableSupplier = { ...this.supplier };
    },
    async saveSupplierDetails() {
      this.loading = true;
      try {
        const response = await api.patch(
          `/suppliers/patch/update-supplier/${this.supplierId}`,
          this.editableSupplier
        );
        if (response.data.success) {
          this.supplier = { ...this.supplier, ...this.editableSupplier };
          this.isEditing = false;
          alert("Proveedor actualizado exitosamente!");
        } else {
          console.error(
            "Error al actualizar el proveedor:",
            response.data.message
          );
          alert("Error al actualizar el proveedor: " + response.data.message);
        }
      } catch (error) {
        console.error("Error al guardar detalles del proveedor:", error);
        alert("Error al guardar detalles del proveedor.");
      } finally {
        this.loading = false;
      }
    },
    async fetchSupplierDetails() {
      this.loading = true;
      try {
        const response = await api.get(
          `/suppliers/get/get-supplier/by-id/${this.supplierId}`
        );
        const data = response.data;
        if (data.success) {
          this.supplier = data.supplier;
          this.editableSupplier = { ...this.supplier };
        } else {
          console.error(
            "Error al cargar los detalles básicos del proveedor:",
            data.message
          );
        }
      } catch (error) {
        console.error("Error al cargar detalles básicos del proveedor:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchPurchases(page = 1) {
      this.loading = true;
      try {
        const response = await api.get(
          `/suppliers/get/supplier-buys/${this.supplierId}?page=${page}&limit=${this.purchasesItemsPerPage}`
        );
        const data = response.data;
        if (data.success) {
          this.purchases = data.data;
          this.purchasesCurrentPage = data.pagination.page;
          this.purchasesTotalPages = data.pagination.totalPages;
          this.purchasesTotalCount = data.pagination.total;
        } else {
          console.error("Error al cargar compras:", data.message);
          this.purchases = [];
          this.purchasesTotalCount = 0;
          this.purchasesTotalPages = 1;
        }
      } catch (error) {
        console.error("Error al cargar compras:", error);
        this.purchases = [];
        this.purchasesTotalCount = 0;
        this.purchasesTotalPages = 1;
      } finally {
        this.loading = false;
      }
    },
    async fetchPayments(page = 1) {
      this.loading = true;
      try {
        const response = await api.get(
          `/supplier-payments/get/supplier-payments/${this.supplierId}?page=${page}&limit=${this.paymentsItemsPerPage}`
        );
        const data = response.data;
        if (data.success) {
          this.payments = data.data.payments;
          this.paymentsCurrentPage = data.data.pagination.page;
          this.paymentsTotalPages = data.data.pagination.totalPages;
          this.paymentsTotalCount = data.data.pagination.total;
        } else {
          console.error("Error al cargar pagos:", data.message);
          this.payments = [];
          this.paymentsTotalCount = 0;
          this.paymentsTotalPages = 1;
        }
      } catch (error) {
        console.error("Error al cargar pagos:", error);
        this.payments = [];
        this.paymentsTotalCount = 0;
        this.paymentsTotalPages = 1;
      } finally {
        this.loading = false;
      }
    },
    openDetailModal(type, data) {
      this.modalType = type;
      this.modalData = data;
      this.showDetailModal = true;
      document.body.style.overflow = "hidden";
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.modalData = null;
      this.modalType = "";
      document.body.style.overflow = "auto";
    },
  },
  async mounted() {
    await this.fetchSupplierDetails();
    await this.fetchPurchases(1);
    document.body.style.overflow = "hidden";
  },
  beforeUnmount() {
    document.body.style.overflow = "auto";
  },
};
</script>

<style scoped>
.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;

  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 5px;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Estilos para métodos de pago */
.payment-methods-cell {
  min-width: 180px;
  max-width: 250px;
}

.single-payment {
  display: flex;
  justify-content: flex-start;
}

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

/* Estilos base para el overlay de pantalla completa */
.supplier-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

/* Contenedor principal de los detalles del proveedor */
.supplier-details-container {
  background-color: #f9fafb;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1f2937;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
}

/* Encabezado de los detalles del proveedor */
.supplier-details-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  justify-content: space-between;
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #4b5563;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  margin-right: 15px;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.back-button i {
  margin-right: 8px;
}

.supplier-details-header h2 {
  color: #f9931e;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  flex-grow: 1;
  text-align: center;
}

.edit-button {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #e0801c;
}

.supplier-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.value {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 500;
}

.value a {
  color: #f9931e;
  text-decoration: none;
}

.value a:hover {
  text-decoration: underline;
}

.balance .value.positive-balance {
  color: #10b981;
  font-weight: bold;
}

.balance .value.negative-balance {
  color: #ef4444;
  font-weight: bold;
}

.edit-input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.edit-input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.edit-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: none;
  position: relative;
}

.save-button {
  background-color: #10b981;
  color: white;
}

.save-button:hover {
  background-color: #0e9f7e;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
}

.cancel-button:hover {
  background-color: #d93a3a;
}

/* Estilos para navegación por pestañas */
.tabs-navigation {
  display: flex;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  background: none;
  border: none;
  color: #4b5563;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  position: relative;
}

.tab-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.tab-button.active {
  color: #f9931e;
  background-color: white;
  border-bottom-color: #f9931e;
}

.tab-count {
  background-color: #d1d5db;
  color: #4b5563;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.tab-button.active .tab-count {
  background-color: #f9931e;
  color: white;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-section {
  height: 100%;
}

/* Estilos para secciones de contenido */
.section-header {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title h4 {
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.stat-value {
  color: #1f2937;
  font-weight: bold;
  font-size: 1rem;
}

/* Tabla de datos */
.table-responsive {
  overflow-x: auto;
  width: 100%;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th,
.custom-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.custom-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

.custom-table tr:hover td {
  background-color: #f9fafb;
}

.clickable-row {
  cursor: pointer;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-block;
}

.debt-badge {
  background-color: rgba(254, 226, 226, 0.2);
  color: #ef4444;
}

.purchase-badge {
  background-color: rgba(209, 250, 229, 0.2);
  color: #10b981;
}

/* Estados vacíos */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #9ca3af;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h3 {
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Estilos para el Modal de Detalles */
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.detail-modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1f2937;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f9931e;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-button:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.modal-info-item {
  display: flex;
  flex-direction: column;
}

.modal-info-item .label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 2px;
}

.modal-info-item .value {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.modal-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 5px;
}

.product-details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 0.9rem;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
  flex-grow: 1;
}

.product-quantity {
  color: #6b7280;
  margin-left: 10px;
}

.product-price {
  font-weight: 600;
  color: #f9931e;
  margin-left: 15px;
}

.empty-state-small {
  text-align: center;
  padding: 15px;
  color: #9ca3af;
  font-size: 0.9rem;
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 10px;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.pagination-controls button {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #e0801c;
}

.pagination-controls button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.pagination-controls span {
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .supplier-details-container {
    border-radius: 0;
  }

  .supplier-info {
    grid-template-columns: 1fr;
  }

  .tabs-navigation {
    flex-direction: row;
    justify-content: space-around;
  }

  .tab-button {
    justify-content: center;
    padding: 12px 15px;
    flex-grow: 1;
  }

  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .section-stats {
    gap: 15px;
  }

  .table-responsive {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .header-top {
    flex-wrap: wrap;
    justify-content: center;
  }

  .supplier-details-header h2 {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }

  .back-button,
  .edit-button {
    margin: 5px;
  }

  .detail-modal-content {
    width: 95%;
  }

  .modal-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .back-button {
    margin-bottom: 10px;
  }

  .tab-button span {
    display: none;
  }

  .tab-button i {
    margin-right: 0;
  }

  .stat-item {
    font-size: 0.75rem;
  }

  .supplier-details-header h2 {
    font-size: 1.2rem;
  }

  .pagination-controls {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
