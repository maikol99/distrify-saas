import { defineStore } from "pinia";
import api from "@/config/axios.config";

export const useEcommerceStore = defineStore("ecommerceStore", {
  state: () => ({
    products: [],
    cart: [],
    user: null,
    categories: [],
    carrito: [],
    subtotal: 0,
    total: 0,
    filtros: {
      categoryId: "",
      searchQuery: "",
      minAmount: 0,
      maxAmount: 0,
      disponibilidad: "",
    },
    pagination: {
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 10,
    },
    client: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      references: "",
      deliveryType: "Retiro",
      paymentType: "Presencial",
    },
    message: "",
    loading: false,
    filtersApplied: false,
    shopData: null,

    mercadoPagoToken: null,
    hasMercadoPagoToken: false,
  }),

  actions: {
    setShopDataFromRoute(shopId, shopName) {
      this.shopId = shopId;
      this.shopName = shopName;
    },

    async getMercadoPagoAccessToken(shopId) {
      try {
        this.loading = true;
        const response = await api.get(
          `/mercado-pago/get/get-access-token?shopId=${shopId}`
        );
        const data = response.data;
        if (data.success) {
          this.mercadoPagoToken = data.accessToken; // Guardar el token
          this.hasMercadoPagoToken = true; // Marcar que existe
          return true;
        } else {
          this.mercadoPagoToken = null;
          this.hasMercadoPagoToken = false;
          return false;
        }
      } catch (error) {
        console.error("Error fetching Mercado Pago Access Token:", error);
        this.mercadoPagoToken = null;
        this.hasMercadoPagoToken = false;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchProducts() {
      this.loading = true;
      try {
        const response = await api.get(
          `/products/get/get-products/${this.shopId}?page=${this.pagination.page}&limit=${this.pagination.limit}`
        );
        const data = response.data;
        this.products = data.products;
        this.pagination.total = data.pagination.total;
        this.pagination.totalPages = data.pagination.totalPages;
        this.pagination.page = data.pagination.page;
        this.pagination.limit = data.pagination.limit;
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        this.loading = false;
      }
    },

    async getShopCategories() {
      this.loading = true;
      try {
        const response = await api.get(
          `/categories/get/get-categories-by-shop/${this.shopId}?page=1&limit=200`
        );
        const data = response.data;
        if (data.success) {
          this.categories = data.categories;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async checkInput() {
      if (this.filtros.searchQuery === "") {
        this.filtros.searchQuery = null;
        await this.loadData();
      }
    },
    async fetchShopData() {
      try {
        const response = await api.get(
          `/shops/get/get-shop-by-id/${this.shopId}`
        );

        const data = response.data;
        console.log("Shop data fetched:", data);

        this.shopData = data.data;

        console.log("Shop data set:", this.shopData);
      } catch (error) {
        console.log(error);
      }
    },

    async filterProducts() {
      this.loading = true;
      this.filtersApplied = true;

      try {
        const urlParams = new URLSearchParams();

        if (this.filtros.categoryId)
          urlParams.append("categoryId", this.filtros.categoryId);
        if (this.filtros.searchQuery)
          urlParams.append("name", this.filtros.searchQuery);
        if (this.filtros.maxAmount && this.filtros.maxAmount > 0)
          urlParams.append("maxAmount", this.filtros.maxAmount);
        if (this.filtros.minAmount && this.filtros.minAmount > 0)
          urlParams.append("minAmount", this.filtros.minAmount);

        const response = await api.get(
          `/products/get/filter-products?shopId=${this.shopId}&page=${
            this.pagination.page
          }&limit=${this.pagination.limit}&${urlParams.toString()}`
        );

        const data = response.data;
        if (data.success) {
          this.products = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        } else {
          this.products = [];
          this.message = data.message;
          this.pagination.total = 0;
          this.pagination.currentPage = 1;
          this.pagination.page = 1;
          this.pagination.limit = 10;
        }
      } catch (error) {
        console.log("Error filtering products:", error);
      } finally {
        this.loading = false;
      }
    },

    addToCart(product) {
      const variant = product.variants?.[0];
      const hasVariant = !!variant;

      const itemKey = hasVariant
        ? `${product.productId}-${variant.size || ""}-${variant.color || ""}`
        : product.productId;

      let existingItemIndex = this.carrito.findIndex((item) => {
        if (hasVariant && item.variants?.[0]) {
          return (
            `${item.productId}-${item.variants[0].size || ""}-${
              item.variants[0].color || ""
            }` === itemKey
          );
        }
        return item.productId === product.productId && !item.variants?.length;
      });

      if (existingItemIndex !== -1) {
        const existingItem = this.carrito[existingItemIndex];
        const nuevaCantidad = existingItem.quantity + (product.quantity || 1);
        const stockDisponible = hasVariant
          ? variant.quantity
          : product.stock || product.quantity || 0;

        if (nuevaCantidad <= stockDisponible) {
          existingItem.quantity = nuevaCantidad;
        } else {
          const cantidadMaximaPermitida =
            stockDisponible - existingItem.quantity;
          if (cantidadMaximaPermitida > 0) {
            existingItem.quantity = stockDisponible;
            return {
              success: false,
              message: `Solo puedes agregar ${cantidadMaximaPermitida} unidades más`,
              maxAllowed: cantidadMaximaPermitida,
            };
          } else {
            return {
              success: false,
              message: "No puedes agregar más unidades de este producto",
              maxAllowed: 0,
            };
          }
        }
      } else {
        const cantidadAAgregar = product.quantity || 1;
        const stockDisponible = hasVariant
          ? variant.quantity
          : product.stock || product.quantity || 0;

        if (cantidadAAgregar <= stockDisponible) {
          const newItem = {
            productId: product.productId,
            name: product.name,
            sellPrice: product.sellPrice,
            quantity: cantidadAAgregar,
            imageUrl: product.imageUrl || product.image,
            stock: product.stock,
          };

          if (hasVariant) {
            newItem.variants = [{ ...variant }];
          }

          this.carrito.push(newItem);
        } else {
          return {
            success: false,
            message: `Solo hay ${stockDisponible} unidades disponibles`,
            maxAllowed: stockDisponible,
          };
        }
      }

      this.calcularSubtotal();
      this.calcularTotal();

      return {
        success: true,
        message: "Producto agregado al carrito correctamente",
      };
    },

    updateCartItemQuantity(itemIndex, newQuantity) {
      if (itemIndex < 0 || itemIndex >= this.carrito.length) return false;

      const item = this.carrito[itemIndex];
      const maxStock = item.variants?.[0]?.quantity || item.stock || 99;

      if (newQuantity <= 0) {
        this.removeFromCart(itemIndex);
        return true;
      }

      if (newQuantity <= maxStock) {
        item.quantity = newQuantity;
        this.calcularSubtotal();
        this.calcularTotal();
        return true;
      }

      return false;
    },

    removeFromCart(itemIndex) {
      if (itemIndex >= 0 && itemIndex < this.carrito.length) {
        this.carrito.splice(itemIndex, 1);
        this.calcularSubtotal();
        this.calcularTotal();
      }
    },

    clearCart() {
      this.carrito = [];
      this.subtotal = 0;
      this.total = 0;
    },

    calcularSubtotal() {
      this.subtotal = this.carrito.reduce((acc, item) => {
        return acc + (item.sellPrice || 0) * item.quantity;
      }, 0);
    },

    calcularTotal() {
      console.log("calculando total");

      this.total = this.subtotal;

      if (
        this.shopData &&
        this.shopData.deliveryCharge &&
        this.client.deliveryType === "Delivery"
      ) {
        console.log("Agregando cargo de entrega:", this.shopData.deliveryPrice);

        this.total += this.shopData.deliveryPrice;
      }
    },

    limpiarFiltros() {
      this.filtros = {
        categoryId: "",
        searchQuery: "",
        minAmount: 0,
        maxAmount: 0,
        disponibilidad: "",
      };
      this.filtersApplied = false;
      this.pagination.page = 1;
      this.fetchProducts();
    },

    async loadData() {
      if (!this.filtersApplied) {
        await this.fetchProducts();
      } else {
        await this.filterProducts();
      }
    },

    async nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++;
        await this.loadData();
      }
    },

    async previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        await this.loadData();
      }
    },

    async createMPOrder() {
      this.loading = true;
      try {
        let formatedProducts = this.carrito.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.sellPrice,
          variants: item.variants,
        }));

        const body = {
          shopId: this.shopId,
          products: formatedProducts,
          total: this.total,
        };

        const response = await api.post(
          `/mercado-pago/post/create-order`,
          body
        );
        const data = response.data;

        if (data) {
          window.open(data.init_point, "_blank");
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    async createSale() {
      try {
        const formatedProducts = this.carrito.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.sellPrice,
          variants: item.variants,
        }));

        const saleData = {
          total: this.total,
          subtotal: this.subtotal,
          productDetails: formatedProducts,
          cashier: "Tienda",
          shopId: this.shopId,
          paymentMethod: "Efectivo",
        };

        const response = await api.post("/sales/post/create-sale", saleData);
        const data = response.data;

        if (!data.success) {
          alert("Error al crear la venta");
        }
      } catch (error) {
        throw error;
      }
    },

    async createPedido() {
      this.loading = true;
      try {
        const formatedProducts = this.carrito.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.sellPrice,
          variants: item.variants,
        }));

        let body = {
          shopId: this.shopId,
          deliveryType: this.client.deliveryType,
          paymentType: this.client.paymentType,
          total: this.total,
          saleId: null,
          client: {
            name: this.client.name,
            phone: this.client.phone,
            email: this.client.email,
            address: this.client.address,
            city: this.client.city,
            postalCode: this.client.postalCode,
          },
          productDetails: formatedProducts,
        };

        if (this.client.paymentType === "Presencial") {
          body.paymentStatus = "Pendiente";
        } else if (this.client.paymentType === "Mercado Pago") {
          body.paymentStatus = "Pagado";
        }

        const response = await api.post(`/orders/post/create-order`, body);
        const data = response.data;

        if (!data.success) {
          alert(data.message || "Error al crear el pedido");
        }

        let formatedProductsForEmail = this.carrito.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          sellPrice: item.sellPrice,
          variants: item.variants,
        }));

        let emailObject = {
          shopId: this.shopId,
          deliveryType: this.client.deliveryType,
          paymentType: this.client.paymentType,
          total: this.total,
          email: this.client.email,

          client: {
            name: this.client.name,
            phone: this.client.phone,
            email: this.client.email,
            address: this.client.address,
            city: this.client.city,
          },
          productDetails: formatedProductsForEmail,
          shop: {
            name: this.shopData.name,
            email: this.shopData.email,
            phone: this.shopData.phone,
            address: this.shopData.address,
          },
        };

        console.log("Email object:", emailObject);

        const emailResponde = await api.post(
          "/emails/post/send-order-confirmation",
          emailObject
        );
        const emailData = emailResponde.data;

        if (!emailData.success) {
          console.log(
            "Error al enviar el email de confirmación:",
            emailData.message
          );
        } else {
          console.log("Email sent successfully:", emailData);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
