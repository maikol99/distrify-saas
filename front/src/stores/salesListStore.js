import { defineStore } from "pinia";
import moment from "moment";
import numeral from "numeral";
import api from "@/config/axios.config";
import { useGlobalStore } from "./globalStore";
import jsPDF from "jspdf";

export const useSalesListStore = defineStore("salesList", {
  state: () => ({
    sales: [],
    selectedSale: null,
    loading: false,
    page: 1,
    limit: 10, // Considera aumentar este límite para producción
    totalSales: 0,
    totalPages: 0,
    cashierSearchResults: [],
    clientSearchResults: [],
    selectedCashier: null,
    selectedClient: null,
    filters: {
      startDate: null,
      endDate: null,
      paymentMethod: "",
      cashier: null, // Se usará para el filtro de cajero por nombre
      clientId: null, // Se usará para el filtro de cliente por ID
      status: "",
      minAmount: null,
      maxAmount: null,
      productId: "",
      hasDiscount: "",
      saleId: "",
    },
    filtersApplied: false,
    globalStore: useGlobalStore(),
  }),
  actions: {
    async fetchSales(shopId) {
      this.loading = true;
      try {
        const response = await api.get(
          `/sales/get/get-sales/${shopId}?page=${this.page}&limit=${this.limit}`
        );
        if (response.data.success) {
          this.sales = response.data.data;
          this.totalSales = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
          this.page = response.data.pagination.page;
          this.limit = response.data.pagination.limit;
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSaleDetails(saleId) {
      this.loading = true;
      try {
        const response = await api.get(`/sales/get/get-sale/by-id/${saleId}`);
        const data = response.data;
        if (data.success) {
          this.selectedSale = data.data;
        } else {
          console.error("Error fetching sale details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching sale details:", error);
      } finally {
        this.loading = false;
      }
    },
    async cancelSale(saleId) {
      this.loading = true;
      try {
        const response = await api.patch(
          `/sales/patch/cancel-sale?saleId=${saleId}`
        );
        if (response.data.success) {
          return true; // Indicar éxito
        }
        return false;
      } catch (error) {
        console.error("Error canceling sale:", error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserProhibitedRoutes(userId) {
      try {
        const response = await api.get(`/auth/${userId}`);
        return response.data.routesProhibited || [];
      } catch (error) {
        console.error("Error fetching user routes allowed:", error);
        return [];
      }
    },
    // Nuevas acciones para la búsqueda de cajeros
    async searchCashiers(shopId, query) {
      if (!query) {
        this.cashierSearchResults = [];
        return;
      }
      try {
        const response = await api.get(
          `/users/get/search-users?shopId=${shopId}&name=${query}`
        );
        if (response.data.success) {
          this.cashierSearchResults = response.data.users;
        } else {
          this.cashierSearchResults = [];
        }
      } catch (error) {
        console.error("Error searching cashiers:", error);
        this.cashierSearchResults = [];
      }
    },
    async loadData() {
      // Este método ahora usa el estado actual de `this.page` y `this.filters`
      if (!this.filtersApplied) {
        await this.fetchSales(this.globalStore.shopId());
      } else {
        await this.getFilteredSales();
      }
    },
    async getFilteredSales() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        // Construir los parámetros de consulta dinámicamente
        const params = new URLSearchParams({
          page: this.page,
          limit: this.limit,
        });

        if (this.filters.startDate)
          params.append("startDate", this.filters.startDate);
        if (this.filters.endDate)
          params.append("endDate", this.filters.endDate);
        if (this.filters.paymentMethod)
          params.append("paymentMethod", this.filters.paymentMethod);
        if (this.filters.cashier)
          params.append("cashier", this.filters.cashier);
        if (this.filters.clientId)
          params.append("clientId", this.filters.clientId);
        if (this.filters.status) params.append("status", this.filters.status);
        if (this.filters.minAmount) params.append("minAmount", this.filters.minAmount);
        if (this.filters.maxAmount) params.append("maxAmount", this.filters.maxAmount);
        if (this.filters.productId) params.append("productId", this.filters.productId);
        if (this.filters.hasDiscount) params.append("hasDiscount", this.filters.hasDiscount);
        if (this.filters.saleId) params.append("saleId", this.filters.saleId);
        console.log("Fetching filtered sales with params:", params.toString());

        // Usar ruta relativa y objeto de parámetros
        const response = await api.get(
          `/sales/get/sales-with-filter/${shopId}?${params.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.sales = data.data;
          this.totalSales = data.pagination.total;
          this.totalPages = data.pagination.totalPages;
          this.page = data.pagination.page;
          this.limit = data.pagination.limit;
          this.filtersApplied = true;
        } else {
          alert("Error al obtener ventas filtradas: " + data.message); // Mensaje de alerta para el usuario
          this.sales = [];
          this.totalSales = 0;
          this.totalPages = 0;
          this.page = 1;
          this.limit = 2;
        }
      } catch (error) {
        console.error("Error fetching filtered sales:", error); // Log de error para depuración
        alert(
          "Error al obtener ventas filtradas. Por favor, intente de nuevo."
        ); // Mensaje amigable para el usuario
        this.sales = [];
        this.totalSales = 0;
        this.totalPages = 0;
        this.page = 1;
        this.limit = 2;
      } finally {
        this.loading = false;
      }
    },
    selectCashier(cashier) {
      this.selectedCashier = cashier;
      this.cashierSearchResults = []; // Limpiar resultados después de la selección
    },
    clearSelectedCashier() {
      this.selectedCashier = null;
      this.cashierSearchResults = [];
    },
    // Nuevas acciones para la búsqueda de clientes
    async searchClients(shopId, query) {
      if (!query) {
        this.clientSearchResults = [];
        return;
      }
      try {
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&query=${query}`
        );
        if (response.data.success) {
          this.clientSearchResults = response.data.data;
        } else {
          this.clientSearchResults = [];
        }
      } catch (error) {
        console.error("Error searching clients:", error);
        this.clientSearchResults = [];
      }
    },
    selectClient(client) {
      this.selectedClient = client;
      this.clientSearchResults = []; // Limpiar resultados después de la selección
    },
    clearSelectedClient() {
      this.selectedClient = null;
      this.clientSearchResults = [];
    },
    // Métodos de utilidad
    formatPrice(price) {
      return numeral(price).format("$0.00");
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },
    clearSelectedSale() {
      this.selectedSale = null;
    },
    // Agregar este método al useSalesListStore después del método clearSelectedSale()

    async emitirTicketVenta() {
      if (!this.selectedSale) {
        console.error("No hay venta seleccionada para imprimir");
        return false;
      }

      try {
        // Configuración del documento
        const pageWidth = 80;
        const margin = 4;
        const contentWidth = pageWidth - margin * 2;
        
        // Calcular altura estimada del contenido
        const baseHeight = 120; // Encabezado + aviso fiscal + pie de página
        const itemHeight = this.selectedSale.productDetails.length * 8; // ~8mm por item
        const summaryHeight = 50; // Resumen financiero
        const calculatedHeight = Math.max(150, baseHeight + itemHeight + summaryHeight);

        const doc = new jsPDF({
          unit: "mm",
          format: [pageWidth, calculatedHeight],
          orientation: "portrait",
        });

        const now = new Date();
        const formattedDate = now.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const isCancelled = this.selectedSale.status === "Cancelado";

        // Configuración de fuentes y colores
        doc.setFont("helvetica");
        let yPos = 8;

        // === BANNER DE CANCELACIÓN (si aplica) ===
        if (isCancelled) {
          doc.setFillColor(255, 0, 0); // Rojo
          doc.rect(margin, yPos, contentWidth, 8, "F");
          doc.setTextColor(255, 255, 255); // Texto blanco
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("VENTA CANCELADA", pageWidth / 2, yPos + 5, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0); // Volver al negro
          yPos += 12;
        }

        // === ENCABEZADO PROFESIONAL ===
        // Marco superior
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, contentWidth, 22);

        // Nombre de la empresa (datos dinámicos del negocio)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(
          this.globalStore.shopData.name || "Sistema POS",
          pageWidth / 2,
          yPos + 5,
          {
            align: "center",
          }
        );
        yPos += 8;

        // Información de contacto (datos dinámicos)
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const empresaInfo = [];

        if (this.globalStore.shopData.address) {
          empresaInfo.push(this.globalStore.shopData.address);
        }
        if (this.globalStore.shopData.city) {
          empresaInfo.push(this.globalStore.shopData.city);
        }
        if (this.globalStore.shopData.phone) {
          empresaInfo.push(`Tel: ${this.globalStore.shopData.phone}`);
        }

        empresaInfo.forEach((line) => {
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 3;
        });

        yPos += 5;

        // === AVISO FISCAL DESTACADO ===
        // Marco con borde doble para el aviso fiscal
        doc.setLineWidth(1.2);
        doc.rect(margin, yPos, contentWidth, 18);
        doc.setLineWidth(0.4);
        doc.rect(margin + 1, yPos + 1, contentWidth - 2, 16);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("IMPORTANTE", pageWidth / 2, yPos + 5, {
          align: "center",
        });

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(
          "ESTE NO ES UN DOCUMENTO FISCAL VALIDO",
          pageWidth / 2,
          yPos + 9,
          {
            align: "center",
          }
        );
        doc.text(
          "SOLO COMPROBANTE DE VENTA INTERNO",
          pageWidth / 2,
          yPos + 12,
          {
            align: "center",
          }
        );
        doc.text("NO VALIDO COMO FACTURA", pageWidth / 2, yPos + 15, {
          align: "center",
        });

        yPos += 23;

        // === INFORMACIÓN DEL TICKET DETALLADA ===
        // Tipo de operación
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const ticketTitle = isCancelled
          ? "VENTA CANCELADA"
          : "COMPROBANTE DE VENTA";
        doc.text(ticketTitle, pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 6;

        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        // Información detallada del ticket
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        const ticketNumber = `VT-${this.selectedSale._id.slice(-8)}`;
        const ticketInfo = [
          `Ticket No: ${ticketNumber}`,
          `Fecha impresión: ${formattedDate}`,
          `Hora impresión: ${formattedTime}`,
          `Fecha venta: ${this.formatDate(this.selectedSale.createdAt)}`,
          `Cliente: ${this.selectedSale.clientName || "CONSUMIDOR FINAL"}`,
          `Vendedor: ${
            this.selectedSale.cashierName ||
            this.globalStore.userName() ||
            "NO IDENTIFICADO"
          }`,
          `Terminal: ${
            navigator.userAgent.includes("Mobile") ? "MOVIL" : "DESKTOP"
          }`,
        ];

        // Agregar método de pago si existe
        if (this.selectedSale.paymentMethod) {
          ticketInfo.push(`Pago: ${this.selectedSale.paymentMethod}`);
        }

        // Agregar información adicional del sistema
        ticketInfo.push(`ID Venta: ${this.selectedSale._id.slice(-6)}`);

        ticketInfo.forEach((line) => {
          doc.text(line, margin, yPos);
          yPos += 3.5;
        });

        yPos += 3;

        // Línea separadora doble
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
        yPos += 5;

        // === DETALLE DE PRODUCTOS MEJORADO ===
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
          isCancelled ? "DETALLE DE VENTA CANCELADA" : "DETALLE DE LA VENTA",
          pageWidth / 2,
          yPos,
          {
            align: "center",
          }
        );
        yPos += 6;

        // Encabezados de columnas
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("CANT", margin, yPos);
        doc.text("DESCRIPCION", margin + 12, yPos);
        doc.text("P.UNIT", margin + 45, yPos);
        doc.text("SUBTOTAL", margin + 60, yPos);
        yPos += 2;

        // Línea bajo encabezados
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 3;

        doc.setFont("helvetica", "normal");

        let itemCounter = 1;
        this.selectedSale.productDetails.forEach((item, index) => {
          // Número de ítem
          doc.setFontSize(6);
          doc.text(`${itemCounter}.`, margin, yPos);

          // Cantidad
          doc.setFontSize(7);
          doc.text(`${item.quantity}`, margin + 4, yPos);

          // Nombre del producto (nuevo: productName, viejo: productId.name)
          const rawName = item.productName || item.productId?.name || "Producto sin nombre";
          const sellPrice = item.salePrice ?? item.productId?.sellPrice ?? 0;
          doc.setFont("helvetica", "bold");
          const productName =
            rawName.length > 20
              ? rawName.substring(0, 20) + "..."
              : rawName;
          doc.text(productName, margin + 12, yPos);

          doc.setFont("helvetica", "normal");

          // Precio unitario
          doc.text(
            `$${sellPrice.toFixed(2)}`,
            margin + 45,
            yPos
          );

          // Subtotal
          const subtotalProduct = (
            sellPrice * item.quantity
          ).toFixed(2);
          doc.text(`$${subtotalProduct}`, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;

          // Si el nombre era muy largo, mostrar completo abajo
          if (rawName.length > 20) {
            doc.setFontSize(6);
            doc.setFont("helvetica", "italic");
            const fullName = doc.splitTextToSize(
              rawName,
              contentWidth - 15
            );
            fullName.forEach((line) => {
              doc.text(line, margin + 4, yPos);
              yPos += 2.5;
            });
            doc.setFont("helvetica", "normal");
            yPos += 1;
          }

          // Línea separadora sutil entre productos
          if (index < this.selectedSale.productDetails.length - 1) {
            doc.setLineWidth(0.1);
            doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);
            yPos += 3;
          }

          itemCounter++;
        });

        yPos += 4;

        // === RESUMEN FINANCIERO DETALLADO ===
        // Línea separadora fuerte
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        // Cantidad total de items
        const totalItems = this.selectedSale.productDetails.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        doc.text(`Total de items: ${totalItems}`, margin, yPos);
        yPos += 4;

        // Subtotal
        doc.text("Subtotal:", margin, yPos);
        doc.text(
          `$${this.selectedSale.subtotal.toFixed(2)}`,
          pageWidth - margin,
          yPos,
          {
            align: "right",
          }
        );
        yPos += 4;

        // Descuento (si aplica)
        if (this.selectedSale.discount > 0) {
          doc.text("Descuento aplicado:", margin, yPos);
          doc.text(
            `-$${this.selectedSale.discount.toFixed(2)}`,
            pageWidth - margin,
            yPos,
            {
              align: "right",
            }
          );
          yPos += 4;
        }

        // Recargo (si aplica)
        if (this.selectedSale.surcharge > 0) {
          doc.text("Recargo aplicado:", margin, yPos);
          doc.text(
            `+$${this.selectedSale.surcharge.toFixed(2)}`,
            pageWidth - margin,
            yPos,
            {
              align: "right",
            }
          );
          yPos += 4;
        }

        // IVA (si aplica)
        if (this.selectedSale.iva > 0) {
          doc.text("IVA incluido (21%):", margin, yPos);
          doc.text(
            `$${this.selectedSale.iva.toFixed(2)}`,
            pageWidth - margin,
            yPos,
            {
              align: "right",
            }
          );
          yPos += 4;
        }

        // Línea separadora para total
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        // TOTAL (destacado con marco)
        doc.setLineWidth(0.5);
        doc.rect(margin, yPos - 1, contentWidth, 8);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL FINAL:", margin + 2, yPos + 3);
        doc.text(
          `$${this.selectedSale.total.toFixed(2)}`,
          pageWidth - margin - 2,
          yPos + 3,
          {
            align: "right",
          }
        );
        yPos += 10;

        // === INFORMACIÓN DE PAGO DETALLADA ===
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("FORMA DE PAGO:", margin, yPos);
        yPos += 4;

        doc.setFont("helvetica", "normal");
        if (this.selectedSale.paymentMethod) {
          doc.text(`${this.selectedSale.paymentMethod}`, margin + 2, yPos);
          yPos += 4;
        }

        yPos += 2;

        // === OBSERVACIONES ===
        if (
          this.selectedSale.observations &&
          this.selectedSale.observations.trim() !== ""
        ) {
          doc.setFont("helvetica", "bold");
          doc.text("OBSERVACIONES:", margin, yPos);
          yPos += 3;

          doc.setFont("helvetica", "italic");
          const obsLines = doc.splitTextToSize(
            this.selectedSale.observations,
            contentWidth
          );
          obsLines.forEach((line) => {
            doc.text(line, margin, yPos);
            yPos += 3;
          });
          yPos += 2;
        }

        // === MARCA DE AGUA PARA VENTAS CANCELADAS ===
        if (isCancelled) {
          doc.setFontSize(24);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 0, 0); // Rojo

          // Guardar el estado gráfico
          doc.saveGraphicsState();

          // Aplicar rotación y transparencia
          doc.setGState(new doc.GState({ opacity: 0.3 }));

          // Posicionar en el centro y rotar
          const centerX = pageWidth / 2;
          const centerY = 100; // Posición aproximada del centro vertical

          doc.text("CANCELADO", centerX, centerY, {
            align: "center",
            angle: -45,
          });

          // Restaurar el estado gráfico
          doc.restoreGraphicsState();
          doc.setTextColor(0, 0, 0); // Volver al negro
        }

        // === INFORMACIÓN LEGAL Y TÉCNICA ===
        yPos += 3;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        const legalInfo = [
          "ESTE COMPROBANTE NO ES DOCUMENTO FISCAL",
          "NO REEMPLAZA FACTURA LEGAL",
          "VALIDO SOLO COMO COMPROBANTE INTERNO",
          "CONSERVE ESTE TICKET",
          "",
          `Procesado: ${now.toISOString()}`,
          `Version: ${navigator.userAgent.split(" ")[0] || "Sistema POS"}`,
        ];

        legalInfo.forEach((line) => {
          if (line === "") {
            yPos += 2;
            return;
          }
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 3;
        });

        yPos += 4;

        // === PIE DE PÁGINA PROFESIONAL ===
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const footerMessage = isCancelled
          ? "VENTA CANCELADA"
          : "GRACIAS POR SU COMPRA";
        doc.text(footerMessage, pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 5;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Alevia Pay - Gestión & E-Commerce", pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 3;

   

        // Método de impresión optimizado para impresoras térmicas
        doc.autoPrint();

        // Abrir en nueva ventana para imprimir inmediatamente
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const printWindow = null; // Usamos iframe en su lugar

        // Usamos iframe oculto para evitar bloqueos del pop-up blocker
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;';
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            } catch (err) {
              // Fallback: descargar el PDF
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = `venta-${ticketNumber}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            setTimeout(() => {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(pdfUrl);
            }, 2000);
          }, 300);
        };

        return true;
      } catch (error) {
        console.error("Error al generar el ticket de venta:", error);
        alert("Error al generar el ticket. Por favor, intente nuevamente.");
        return false;
      }
    },
  },
});
