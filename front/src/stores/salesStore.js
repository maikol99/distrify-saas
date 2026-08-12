import api from "@/config/axios.config";
import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import { useTicket } from "@/composables/useTicket";

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
    _isSearching: false,
    // Estados para variantes
    showingVariantModal: false,
    selectedProductForVariant: null,
    selectedVariants: {},
    // Estados para envío de email
    sendTicketByEmail: false,
    clientEmail: "",
    lastSaleData: null,
    toast: {
      showing: false,
      message: "",
      state: "success"
    },
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

      // Anti-doble-escaneo: si ya hay una búsqueda en curso, ignorar
      if (this._isSearching) return;
      this._isSearching = true;

      this.setLoading(true);
      try {
        const shopId = this.globalStore.shopId();
        const query = this.searchQuery.trim();

        // PASO 1: Intentar búsqueda exacta por código (siempre, independiente del searchType)
        try {
          const codeResponse = await api.get(
            `/products/get/search-product-by-code/${shopId}?code=${encodeURIComponent(query)}`,
          );
          if (codeResponse.data.success && codeResponse.data.data && codeResponse.data.data.length > 0) {
            const results = codeResponse.data.data;
            if (results.length === 1) {
              // Exactamente 1 producto → agregar al carrito directamente y limpiar búsqueda
              this.addToCart(results[0]);
              this.searchQuery = "";
              this.searchResults = [];
              return;
            } else {
              // Múltiples con ese código → mostrar lista
              this.searchResults = results;
              return;
            }
          }
        } catch (_) {
          // Si falla la búsqueda por código, continuamos con la búsqueda por nombre
        }

        // PASO 2: Búsqueda por nombre/descripción (con combos)
        const [productsResponse, promosResponse] = await Promise.all([
          api.get(`/products/get/search-product/${shopId}?name=${encodeURIComponent(query)}`),
          api.get(`/promotions/get/${shopId}?search=${encodeURIComponent(query)}&isActive=true&type=combo&page=1&limit=20`).catch(() => ({ data: { success: false } }))
        ]);

        let combinedResults = [];

        if (promosResponse.data.success && promosResponse.data.data) {
          const combos = promosResponse.data.data.map(promo => ({
            _id: promo._id,
            name: `[Combo] ${promo.name}`,
            sellPrice: promo.comboPrice,
            stock: 9999,
            quantity: 9999,
            isCombo: true,
            comboProducts: promo.productIds.map(p => p._id || p),
            sizesAndColors: [],
            code: 'COMBO'
          }));
          combinedResults = [...combos];
        }

        if (productsResponse.data.success && productsResponse.data.data) {
          combinedResults = [...combinedResults, ...productsResponse.data.data];
        }

        this.searchResults = combinedResults;
        if (this.searchResults.length === 0) {
          this.toast = { showing: true, message: "Producto no encontrado", state: "danger" };
        }

      } catch (error) {
        console.error("Error al buscar producto:", error);
      } finally {
        this.setLoading(false);
        // Liberar el lock después de 400ms para prevenir doble-escaneo del scanner
        setTimeout(() => {
          this._isSearching = false;
        }, 400);
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
          isCombo: product.isCombo || false,
          comboProducts: product.comboProducts || [],
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

    // Permite agregar un item de Venta Rápida / Venta Libre (para productos sin código)
    addCustomItemToCart(name, price, quantity = 1) {
      const customName = (name && name.trim()) ? name.trim() : "Venta Rápida";
      const numPrice = Math.max(0, Number(price) || 0);
      const numQty = Math.max(1, Number(quantity) || 1);
      const customId = "custom-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

      const cartItem = {
        cartItemId: customId,
        _id: customId,
        productId: customId,
        name: customName,
        sellPrice: numPrice,
        quantity: numQty,
        originalPrice: numPrice,
        stock: 999999,
        variants: null,
        product: {
          _id: customId,
          name: customName,
          sellPrice: numPrice,
          quantity: 999999,
        },
        isCustom: true,
      };

      this.cartItems.push(cartItem);
      this.updateArrayForSale();

      this.searchQuery = "";
      this.searchResults = [];
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
            name: item.name,
            sellPrice: item.sellPrice,
            isCombo: item.isCombo || false,
            comboProducts: item.comboProducts || [],
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

    // Editar precio unitario de un ítem del carrito en tiempo real
    updateItemPrice(item, newPrice) {
      const parsed = parseFloat(newPrice);
      if (!isNaN(parsed) && parsed >= 0) {
        item.sellPrice = parsed;
        this.updateArrayForSale();
      }
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
        const { emitirTicket } = useTicket();

        const itemsToShow = this.lastSaleData?.items || this.cartItems;
        const subtotalToShow = this.lastSaleData?.subtotal || this.subtotal;
        const totalToShow = this.lastSaleData?.total || this.total;
        const taxToShow = this.lastSaleData?.tax || this.tax;
        const paymentMethodsToShow =
          this.lastSaleData?.paymentMethods || this.paymentMethods;
        const paymentMethodToShow =
          this.lastSaleData?.paymentMethod || this.paymentMethod;

        return await emitirTicket({
          items: itemsToShow,
          shopData: this.globalStore.shopData,
          ticketType: this.ticketTipe,
          clientName: this.clientName,
          userName: this.globalStore.userName(),
          listName: this.listName,
          subtotal: subtotalToShow,
          total: totalToShow,
          tax: taxToShow,
          ivaEnabled: this.ivaEnabled,
          discountValue: this.discountValue,
          discountType: this.discountType,
          discountAmount: this.discountAmount,
          surchargeValue: this.surchargeValue,
          surchargeType: this.surchargeType,
          surchargeAmount: this.surchargeAmount,
          paymentMethod: paymentMethodToShow,
          paymentMethods: paymentMethodsToShow,
          observations: this.observations,
          saleNumber:
            this.lastSaleData?.saleNumber ||
            `TK-${Date.now().toString().slice(-8)}`,
          sendByEmail: this.sendTicketByEmail,
          clientEmail: this.clientEmail,
        });
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
