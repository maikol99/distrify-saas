import api from "@/config/axios.config";
import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import jsPDF from "jspdf";

export const useSalesStore = defineStore("sales", {
  state: () => ({
    extraActions: false,
    searchQuery: "",
    cartItems: [],
    paymentMethod: "Efectivo",
    selectedCustomer: "",
    clientSearchResults: [],
    selectedClient: null,
    products: [],
    searchResults: [],
    arrayForSale: [],
    isProcessingSale: false,
    surchargeValue: 0,
    discountValue: 0,
    listPrice: null,
    clientId: "General",
    clientSearchQuery: "",
    ticketTipe: "Ticket",
    observations: "",
    ivaEnabled: false,
    address: "General",
    discountType: "amount",
    surchargeType: "amount",
    listName: "",
    clientName: "",
    listNamesArray: [],
    paymentMethods: [],
    showingStartTurnBeforeSale: false,
    totalQr: 0,
    loading: false,
    clientAddress: "General",
    globalStore: useGlobalStore(),
    searchType: "code",
    autoPrintTicket: false,
    // Estados para variantes
    showingVariantModal: false,
    selectedProductForVariant: null,
    selectedVariants: {},
    // Estados para envío de email
    sendTicketByEmail: false,
    clientEmail: "",
    lastSaleData: null,
  }),

  getters: {
    subtotal: (state) => {
      return state.cartItems.reduce(
        (total, item) => total + item.sellPrice * item.quantity,
        0,
      );
    },
    tax: (state) => {
      return state.ivaEnabled ? state.subtotal * 0.21 : 0;
    },
    total: (state) => {
      let total = state.subtotal + state.tax;
      total = total - state.discountAmount + state.surchargeAmount;
      state.totalQr = total;
      return total;
    },
    discountAmount: (state) => {
      if (state.discountType === "percentage") {
        return (state.subtotal * state.discountValue) / 100;
      }
      return state.discountValue;
    },
    surchargeAmount: (state) => {
      if (state.surchargeType === "percentage") {
        return (state.subtotal * state.surchargeValue) / 100;
      }
      return state.surchargeValue;
    },
  },

  actions: {
    setLoading(status) {
      this.loading = status;
    },
    setProcessingSale(status) {
      this.isProcessingSale = status;
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },
    setClientId(id) {
      this.clientId = id;
    },
    setListName(name) {
      this.listName = name;
    },
    setDiscountValue(value) {
      this.discountValue = value;
    },
    setDiscountType(type) {
      this.discountType = type;
    },
    setSurchargeValue(value) {
      this.surchargeValue = value;
    },
    setSurchargeType(type) {
      this.surchargeType = type;
    },
    toggleIva() {
      this.ivaEnabled = !this.ivaEnabled;
    },
    setPaymentMethod(method) {
      this.paymentMethod = method;
    },
    setObservations(obs) {
      this.observations = obs;
    },
    setTicketType(type) {
      this.ticketTipe = type;
    },
    setPaymentMethods(methods) {
      this.paymentMethods = methods;
    },

    // Métodos para manejar el envío de email
    setSendTicketByEmail(value) {
      this.sendTicketByEmail = value;
    },
    setClientEmail(email) {
      this.clientEmail = email;
    },
    setLastSaleData(saleData) {
      this.lastSaleData = saleData;
    },

    // Métodos para manejar variantes
    openVariantModal(product) {
      this.selectedProductForVariant = product;
      this.selectedVariants = {};
      this.showingVariantModal = true;
    },
    closeVariantModal() {
      this.showingVariantModal = false;
      this.selectedProductForVariant = null;
      this.selectedVariants = {};
    },
    setSelectedVariant(type, value) {
      this.selectedVariants[type] = value;
    },

    // Método para obtener stock disponible según variantes
    getAvailableStock(product, selectedVariants) {
      if (
        !selectedVariants ||
        !product.sizesAndColors ||
        product.sizesAndColors.length === 0
      ) {
        return product.quantity || 0;
      }

      const variant = product.sizesAndColors.find(
        (v) =>
          v.size === selectedVariants.size &&
          v.color === selectedVariants.color,
      );
      return variant ? variant.quantity : 0;
    },

    // Método para generar ID único del carrito
    generateCartItemId(product, selectedVariants) {
      if (
        selectedVariants &&
        (selectedVariants.size || selectedVariants.color)
      ) {
        return `${product._id}-${selectedVariants.size || "no-size"}-${
          selectedVariants.color || "no-color"
        }`;
      }
      return product._id;
    },
    // Método en el store para completar la venta (agregar si no existe)\
    completeSale() {
      this.resetSaleState();
      // Opcional: mostrar mensaje de éxito silencioso o notificación discreta
      console.log("Venta completada exitosamente");
    },
    // Logic for product search
    async searchProducts() {
      if (this.searchQuery.trim() === "") {
        this.searchResults = [];
        return;
      }
      this.setLoading(true);
      try {
        if (this.searchType === "code") {
          console.log("Buscando por codigo");
          const shopId = this.globalStore.shopId();
          const response = await api.get(
            `/products/get/search-product-by-code/${shopId}?code=${this.searchQuery}`,
          );
          if (response.data.success) {
            if (response.data.data.length === 1) {
              const product = response.data.data[0];
              this.addToCart(product);
            } else {
              this.searchResults = response.data.data;
              if (this.searchResults.length === 0) {
                alert("Producto no encontrado");
              }
            }
          } else {
            this.searchResults = [];
            alert("Producto no encontrado");
          }
        } else {
          const shopId = this.globalStore.shopId();
          const response = await api.get(
            `/products/get/search-product/${shopId}?name=${this.searchQuery}`,
          );
          if (response.data.success) {
            this.searchResults = response.data.data;
          } else {
            this.searchResults = [];
            alert("Producto no encontrado");
          }
        }
      } catch (error) {
        console.error("Error al buscar producto:", error);
      } finally {
        this.setLoading(false);
      }
    },

    // Logic for cart management - ACTUALIZADO PARA VARIANTES
    addToCart(product, selectedVariants = null, quantity = 1) {
      // Si el producto tiene variantes y no se seleccionaron, abrir modal
      if (
        product.sizesAndColors &&
        product.sizesAndColors.length > 0 &&
        !selectedVariants
      ) {
        this.openVariantModal(product);
        return;
      }

      // Generar ID único para el item del carrito
      const cartItemId = this.generateCartItemId(product, selectedVariants);

      // Buscar si ya existe en el carrito
      const existingItem = this.cartItems.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        const availableStock = this.getAvailableStock(
          product,
          selectedVariants,
        );
        if (existingItem.quantity + quantity <= availableStock) {
          existingItem.quantity += quantity;
        } else {
          alert(`Stock insuficiente. Disponible: ${availableStock}`);
          return;
        }
      } else {
        // Crear nuevo item del carrito
        const availableStock = this.getAvailableStock(
          product,
          selectedVariants,
        );
        if (availableStock < quantity) {
          alert(`Stock insuficiente. Disponible: ${availableStock}`);
          return;
        }

        const cartItem = {
          cartItemId,
          _id: product._id,
          productId: product._id,
          name: product.name,
          sellPrice: product.sellPrice,
          quantity: quantity,
          originalPrice: product.sellPrice,
          stock: availableStock,
          variants: selectedVariants,
          product: product,
        };

        this.cartItems.push(cartItem);
      }

      // Actualizar arrayForSale
      this.updateArrayForSale();

      // Limpiar búsqueda
      this.searchQuery = "";
      this.searchResults = [];

      // Cerrar modal de variantes si estaba abierto
      this.closeVariantModal();
    },

    // Método para actualizar arrayForSale con variantes
    updateArrayForSale() {
      this.arrayForSale = [];
      // Agrupar items por producto
      const productGroups = {};

      this.cartItems.forEach((item) => {
        if (!productGroups[item.productId]) {
          productGroups[item.productId] = {
            productId: item.productId,
            quantity: 0,
            variants: [],
          };
        }

        productGroups[item.productId].quantity += item.quantity;

        if (item.variants && (item.variants.size || item.variants.color)) {
          productGroups[item.productId].variants.push({
            size: item.variants.size,
            color: item.variants.color,
            quantity: item.quantity,
          });
        }
      });

      // Convertir a array
      this.arrayForSale = Object.values(productGroups);
    },

    increaseQuantity(item) {
      if (item.quantity < item.stock) {
        item.quantity++;
        this.updateArrayForSale();
      } else {
        alert("Stock insuficiente");
      }
    },

    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateArrayForSale();
      }
    },

    updateQuantity(item) {
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      if (item.quantity > item.stock) {
        item.quantity = item.stock;
        alert("Cantidad ajustada al stock disponible");
      }
      this.updateArrayForSale();
    },

    removeItem(item) {
      const index = this.cartItems.findIndex(
        (cartItem) => cartItem.cartItemId === item.cartItemId,
      );
      if (index > -1) {
        this.cartItems.splice(index, 1);
        this.updateArrayForSale();
      }
    },

    cancelSale() {
      this.resetSaleState();
    },

    // Logic for creating sales - ACTUALIZADO
    async createSale() {
      this.setLoading(true);
      if (this.isProcessingSale || this.cartItems.length === 0) {
        this.setLoading(false);
        return;
      }

      this.setProcessingSale(true);

      try {
        const userName = this.globalStore.userName();
        const shopId = this.globalStore.shopId();

        const saleData = {
          total: this.total,
          subtotal: this.subtotal,
          iva: this.tax,
          productDetails: this.arrayForSale,
          surcharge: this.surchargeValue,
          discount: this.discountValue,
          listName: this.listName,
          cashier: userName,
          updateProducts: true,
          shopId: shopId,
        };

        if (this.selectedClient) {
          saleData.clientId = this.selectedClient._id;
        }

        if (this.paymentMethods.length > 0) {
          saleData.paymentMethods = this.paymentMethods;
        } else {
          saleData.paymentMethod = this.paymentMethod;
        }

        const response = await api.post("/sales/post/create-sale", saleData);
        const data = response.data;

        if (data.success) {
          // Guardar datos de la venta para el modal
          this.setLastSaleData({
            id: data.saleId || Date.now().toString(),
            total: this.total,
            subtotal: this.subtotal,
            tax: this.tax,
            items: [...this.cartItems],
            client: this.selectedClient,
            paymentMethod: this.paymentMethod,
            paymentMethods: [...this.paymentMethods],
            date: new Date().toISOString(),
            saleNumber: data.saleNumber || `SALE-${Date.now()}`,
          });

          return { success: true, saleData: this.lastSaleData };
        }
      } catch (error) {
        console.error("Error al crear venta:", error);
        this.clientId = "General";
        throw error;
      } finally {
        this.clientId = "General";
        this.setProcessingSale(false);
        this.setLoading(false);
      }
    },

    completeSale() {
      this.resetSaleState();
    },

    resetSaleState() {
      this.cartItems = [];
      this.arrayForSale = [];
      this.discountValue = 0;
      this.surchargeValue = 0;
      this.listName = "";
      this.paymentMethods = [];
      this.paymentMethod = "Efectivo";
      this.clientId = "General";
      this.address = "General";
      this.clientName = "";
      this.ivaEnabled = false;
      this.observations = "";
      this.ticketTipe = "Ticket";
      this.clientSearchQuery = "";
      this.clientSearchResults = [];
      this.selectedClient = null;
      this.closeVariantModal();
      this.sendTicketByEmail = false;
      this.clientEmail = "";
      this.lastSaleData = null;
    },

    // Client logic
    async searchClients(query) {
      if (query.trim() === "") {
        this.clientSearchResults = [];
        return;
      }
      this.setLoading(true);
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&query=${query}`,
        );
        if (response.data.success) {
          this.clientSearchResults = response.data.data;
        } else {
          this.clientSearchResults = [];
        }
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        this.clientSearchResults = [];
      } finally {
        this.setLoading(false);
      }
    },

    selectClient(client) {
      this.selectedClient = client;
      this.clientId = client._id;
      this.clientName = client.name;
      this.clientAddress = client.address;
      this.clientSearchQuery = client.name;
      this.clientSearchResults = [];
      if (client.email) {
        this.clientEmail = client.email;
      }
    },

    clearSelectedClient() {
      this.selectedClient = null;
      this.clientId = "General";
      this.clientName = "";
      this.clientAddress = "General";
      this.clientSearchQuery = "";
      this.clientSearchResults = [];
      this.clientEmail = "";
    },

    // Logic for quick product creation
    async createProductAndAddToCart(productData) {
      this.setLoading(true);
      try {
        const response = await api.post("/products", {
          name: productData.name,
          barcode: productData.barcode,
          category: productData.category,
          sellPrice: productData.sellPrice,
          quantity: 10,
        });
        this.addToCart(response.data);
      } catch (error) {
        console.error("Error al crear producto:", error);
      } finally {
        this.setLoading(false);
      }
    },

    // Logic for turn verification
    async fetchLastTurnData() {
      try {
        const userName = localStorage.getItem("userName");
        const response = await api.get(`/turns/${userName}`);
        this.showingStartTurnBeforeSale = !response.data;
      } catch (error) {
        console.error("Error al verificar turno:", error);
      }
    },

    // Logic for price lists
    applyPriceListToCart() {
      this.cartItems.forEach((item) => {
        if (this.listName === "") {
          item.sellPrice = item.originalPrice || item.sellPrice;
        } else {
          const priceListItem = item.product?.priceLists?.find(
            (list) => list.listName === this.listName,
          );
          if (priceListItem) {
            if (!item.originalPrice) {
              item.originalPrice = item.sellPrice;
            }
            item.sellPrice = priceListItem.price;
          }
        }
      });
    },

    async fetchListNames() {
      try {
        const response = await api.get("/products/get/lists/price-list-names");
        this.listNamesArray = response.data;
      } catch (error) {
        console.error("Error al obtener listas de precios:", error);
      }
    },

    // User permission verification
    async checkUserRoutesAllowed(currentRoutePath) {
      try {
        const userId = this.globalStore.userId();
        console.log("Verificando rutas permitidas para el usuario:", userId);
        const userResponse = await api.get(`/users/get/get-user/${userId}`);
        const routesProhibited = userResponse.data.routesProhibited;
        const routeWithoutSlash = currentRoutePath.replace(/^\/+/, "");
        if (routesProhibited && routesProhibited.includes(routeWithoutSlash)) {
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error al verificar las rutas permitidas:", error);
        return false;
      }
    },
    async emitirTicket() {
      this.loading = true;
      try {
        const pageWidth = 80;
        const margin = 4;
        const contentWidth = pageWidth - margin * 2;

        const itemsToShow = this.lastSaleData?.items || this.cartItems;
        const baseHeight = 120;
        const itemHeight = itemsToShow.length * 8;
        const variantHeight = itemsToShow.reduce((acc, item) => {
          if (item.variants && (item.variants.size || item.variants.color)) {
            return acc + 4;
          }
          return acc;
        }, 0);
        const summaryHeight = 50;
        const calculatedHeight = Math.max(
          150,
          baseHeight + itemHeight + variantHeight + summaryHeight,
        );

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

        doc.setFont("helvetica");
        let yPos = 8;

        // === ENCABEZADO PROFESIONAL ===
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, contentWidth, 22);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(this.globalStore.shopData.name, pageWidth / 2, yPos + 5, {
          align: "center",
        });

        yPos += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const empresaInfo = [
          this.globalStore.shopData.address,
          this.globalStore.shopData.city,
          `Tel: ${this.globalStore.shopData.phone}`,
        ];

        empresaInfo.forEach((line) => {
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 3;
        });

        yPos += 5;

        // === AVISO FISCAL DESTACADO ===
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
          },
        );
        doc.text(
          "SOLO COMPROBANTE DE VENTA INTERNO",
          pageWidth / 2,
          yPos + 12,
          {
            align: "center",
          },
        );
        doc.text("NO VALIDO COMO FACTURA", pageWidth / 2, yPos + 15, {
          align: "center",
        });

        yPos += 23;

        // === INFORMACIÓN DEL TICKET DETALLADA ===
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(this.ticketTipe.toUpperCase(), pageWidth / 2, yPos, {
          align: "center",
        });

        yPos += 6;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const ticketNumber =
          this.lastSaleData?.saleNumber ||
          `TK-${Date.now().toString().slice(-8)}`;

        const ticketInfo = [
          `Ticket No: ${ticketNumber}`,
          `Fecha: ${formattedDate}`,
          `Hora: ${formattedTime}`,
          `Cliente: ${this.clientName || "CONSUMIDOR FINAL"}`,
          `Vendedor: ${this.globalStore.userName() || "NO IDENTIFICADO"}`,
          `Terminal: ${
            navigator.userAgent.includes("Mobile") ? "MOVIL" : "DESKTOP"
          }`,
        ];

        if (this.listName) {
          ticketInfo.push(`Lista de precios: ${this.listName}`);
        }

        // Agregar información de envío por email si aplica
        if (this.sendTicketByEmail && this.clientEmail) {
          ticketInfo.push(`Email enviado a: ${this.clientEmail}`);
        }

        ticketInfo.push(`Sesion: ${Date.now().toString().slice(-6)}`);

        ticketInfo.forEach((line) => {
          doc.text(line, margin, yPos);
          yPos += 3.5;
        });

        yPos += 3;
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
        yPos += 5;

        // === DETALLE DE PRODUCTOS MEJORADO CON VARIANTES ===
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("DETALLE DE LA OPERACION", pageWidth / 2, yPos, {
          align: "center",
        });

        yPos += 6;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("CANT", margin, yPos);
        doc.text("DESCRIPCION", margin + 12, yPos);
        doc.text("P.UNIT", margin + 45, yPos);
        doc.text("SUBTOTAL", margin + 60, yPos);

        yPos += 2;
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 3;

        doc.setFont("helvetica", "normal");
        let itemCounter = 1;

        itemsToShow.forEach((item, index) => {
          // Número de ítem
          doc.setFontSize(6);
          doc.text(`${itemCounter}.`, margin, yPos);

          // Cantidad
          doc.setFontSize(7);
          doc.text(`${item.quantity}`, margin + 4, yPos);

          // Nombre del producto
          doc.setFont("helvetica", "bold");
          const productName =
            item.name.length > 20
              ? item.name.substring(0, 20) + "..."
              : item.name;
          doc.text(productName, margin + 12, yPos);
          doc.setFont("helvetica", "normal");

          // Precio unitario
          doc.text(`$${item.sellPrice.toFixed(2)}`, margin + 45, yPos);

          // Subtotal
          const subtotalProduct = (item.sellPrice * item.quantity).toFixed(2);
          doc.text(`$${subtotalProduct}`, pageWidth - margin, yPos, {
            align: "right",
          });

          yPos += 4;

          // Mostrar variantes si existen
          if (item.variants && (item.variants.size || item.variants.color)) {
            doc.setFontSize(6);
            doc.setFont("helvetica", "italic");
            let variantText = "";
            if (item.variants.size)
              variantText += `Talla: ${item.variants.size}`;
            if (item.variants.color) {
              if (variantText) variantText += " - ";
              variantText += `Color: ${item.variants.color}`;
            }
            doc.text(variantText, margin + 12, yPos);
            yPos += 3;
            doc.setFont("helvetica", "normal");
          }

          // Si el nombre era muy largo, mostrar completo abajo
          if (item.name.length > 20) {
            doc.setFontSize(6);
            doc.setFont("helvetica", "italic");
            const fullName = doc.splitTextToSize(item.name, contentWidth - 15);
            fullName.forEach((line) => {
              doc.text(line, margin + 4, yPos);
              yPos += 2.5;
            });
            doc.setFont("helvetica", "normal");
            yPos += 1;
          }

          // Línea separadora sutil entre productos
          if (index < itemsToShow.length - 1) {
            doc.setLineWidth(0.1);
            doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);
            yPos += 3;
          }

          itemCounter++;
        });

        yPos += 4;

        // === RESUMEN FINANCIERO DETALLADO ===
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const totalItems = itemsToShow.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        doc.text(`Total de items: ${totalItems}`, margin, yPos);
        yPos += 4;

        // Usar datos de la última venta si están disponibles
        const subtotalToShow = this.lastSaleData?.subtotal || this.subtotal;
        const totalToShow = this.lastSaleData?.total || this.total;
        const taxToShow = this.lastSaleData?.tax || this.tax;

        doc.text("Subtotal:", margin, yPos);
        doc.text(`$${subtotalToShow.toFixed(2)}`, pageWidth - margin, yPos, {
          align: "right",
        });
        yPos += 4;

        if (this.discountValue > 0) {
          const discountText =
            this.discountType === "percentage"
              ? `Descuento aplicado (${this.discountValue}%):`
              : "Descuento aplicado:";
          const discountAmount = `-$${this.discountAmount.toFixed(2)}`;
          doc.text(discountText, margin, yPos);
          doc.text(discountAmount, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }

        if (this.surchargeValue > 0) {
          const surchargeText =
            this.surchargeType === "percentage"
              ? `Recargo aplicado (${this.surchargeValue}%):`
              : "Recargo aplicado:";
          const surchargeAmount = `+$${this.surchargeAmount.toFixed(2)}`;
          doc.text(surchargeText, margin, yPos);
          doc.text(surchargeAmount, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }

        if (this.ivaEnabled) {
          doc.text("IVA incluido (21%):", margin, yPos);
          doc.text(`$${taxToShow.toFixed(2)}`, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }

        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        doc.setLineWidth(0.5);
        doc.rect(margin, yPos - 1, contentWidth, 8);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL FINAL:", margin + 2, yPos + 3);
        doc.text(
          `$${totalToShow.toFixed(2)}`,
          pageWidth - margin - 2,
          yPos + 3,
          {
            align: "right",
          },
        );

        yPos += 10;

        // === INFORMACIÓN DE PAGO DETALLADA ===
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("FORMA DE PAGO:", margin, yPos);
        yPos += 4;

        doc.setFont("helvetica", "normal");
        const paymentMethodsToShow =
          this.lastSaleData?.paymentMethods || this.paymentMethods;
        const paymentMethodToShow =
          this.lastSaleData?.paymentMethod || this.paymentMethod;

        if (paymentMethodsToShow.length > 0) {
          paymentMethodsToShow.forEach((method) => {
            doc.text(
              `${method.method}: $${method.amount?.toFixed(2) || "0.00"}`,
              margin + 2,
              yPos,
            );
            yPos += 3;
          });
        } else {
          doc.text(`${paymentMethodToShow}`, margin + 2, yPos);
          yPos += 4;
        }

        const efectivoMethod = paymentMethodsToShow.find((m) =>
          m.method.toLowerCase().includes("efectivo"),
        );
        if (efectivoMethod && efectivoMethod.amount > totalToShow) {
          const cambio = efectivoMethod.amount - totalToShow;
          doc.text(`Cambio entregado: $${cambio.toFixed(2)}`, margin + 2, yPos);
          yPos += 4;
        }

        yPos += 2;

        // === OBSERVACIONES ===
        if (this.observations && this.observations.trim() !== "") {
          // Calcular espacio necesario para observaciones
          const obsLines = doc.splitTextToSize(this.observations, contentWidth);
          doc.setFont("helvetica", "bold");
          doc.text("OBSERVACIONES:", margin, yPos);
          yPos += 3;
          doc.setFont("helvetica", "italic");
          obsLines.forEach((line) => {
            doc.text(line, margin, yPos);
            yPos += 3;
          });
          yPos += 2;
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

        // Agregar información de envío por email si aplica
        if (this.sendTicketByEmail && this.clientEmail) {
          legalInfo.splice(
            -2,
            0,
            "",
            `Enviado por email a: ${this.clientEmail}`,
          );
        }

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
        doc.text("GRACIAS POR SU COMPRA", pageWidth / 2, yPos, {
          align: "center",
        });

        yPos += 5;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Distrify - Gestión & E-Commerce", pageWidth / 2, yPos, {
          align: "center",
        });

        yPos += 3;
        doc.text(`Codigo: ${ticketNumber}`, pageWidth / 2, yPos, {
          align: "center",
        });

        // Generar el PDF
        const pdfBlob = doc.output("blob");

        // Si se debe enviar por email, hacerlo
        if (this.sendTicketByEmail && this.clientEmail) {
          try {
            const formData = new FormData();
            formData.append("file", pdfBlob, `ticket-${ticketNumber}.pdf`);
            formData.append("email", this.clientEmail);
            formData.append("subject", "Ticket de compra");
            formData.append("businessName", this.globalStore.shopData.name);
            formData.append("total", totalToShow.toFixed(2));
            formData.append("date", new Date().toISOString());
            formData.append(
              "paymentSummary",
              JSON.stringify(
                paymentMethodsToShow.length > 0
                  ? paymentMethodsToShow
                  : [{ method: paymentMethodToShow, amount: totalToShow }],
              ),
            );

            // Enviar el pdf al servidor para enviar por mail
            await api.post("/emails/post/send-ticket", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            console.log(`Ticket enviado por email a: ${this.clientEmail}`);
          } catch (error) {
            console.error("Error al enviar ticket por email:", error);
            alert(
              "Error al enviar el ticket por email, pero se imprimirá normalmente",
            );
          }
        }

        // Siempre imprimir o descargar el ticket
        doc.autoPrint();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, "_blank");

        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
              }, 1000);
            }, 500);
          };
        } else {
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.download = `ticket-${ticketNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pdfUrl);
        }

        return true;
      } catch (error) {
        console.error("Error al generar el ticket:", error);
        alert("Error al generar el ticket. Por favor, intente nuevamente.");
        return false;
      } finally {
        this.loading = false;
        this.resetSaleState();
      }
    },
  },
});
