import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { defineStore } from "pinia"

export const useCategoriesStore = defineStore("categories", {
  state: () => {
    return {
      categories: [],
      category: {},
      categoryId: null,
      loading: false,
      searchQuery: "",
      actionSelected: "",
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    }
  },

  actions: {
    shopId() {
      const user_info = Cookies.get("user_info")
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null
      return parsedUserInfo ? parsedUserInfo.shopId : null
    },

    // Enhanced fetch categories with search and filter support
    async fetchCategoriesByShop(params = {}) {
      try {
        this.loading = true
        const shopId = this.shopId()

        if (!shopId) {
          console.log("No shopId found")
          return
        }

        const queryParams = {
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
          ...(params.status && { status: params.status }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        }

        const response = await api.get(`/categories/get/get-categories-by-shop/${shopId}`, { params: queryParams })

        const data = response.data

        if (data.success) {
          this.categories = data.categories
          this.pagination = {
            total: data.pagination.total,
            page: data.pagination.page,
            limit: data.pagination.limit,
            totalPages: data.pagination.totalPages,
          }
        }
      } catch (error) {
        console.error("Error fetching categories by shop:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Enhanced search functionality
    async searchCategoriesByName(params = {}) {
      try {
        this.loading = true

        const queryParams = {
          name: params.query || params.name,
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
          ...(params.status && { status: params.status }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        }

        const response = await api.get("/categories/get/search-categories-by-name", { params: queryParams })

        const data = response.data

        if (data.success) {
          this.categories = data.categories
          this.pagination = {
            total: data.pagination.total,
            page: data.pagination.page,
            limit: data.pagination.limit,
            totalPages: data.pagination.totalPages,
          }
        }
      } catch (error) {
        console.error("Error searching categories:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get category by ID
    async fetchCategoryById(id) {
      try {
        this.loading = true

        if (!id) {
          console.log("No category ID provided")
          return
        }

        const response = await api.get(`/categories/get/get-category-by-id/${id}`)

        const data = response.data

        if (data.success) {
          this.category = data.category
          this.categoryId = id
          return data.category
        }
      } catch (error) {
        console.error("Error fetching category by ID:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create new category
    async createCategory(categoryData) {
      try {
        this.loading = true

        if (!categoryData.shopId) {
          categoryData.shopId = this.shopId()
        }

        const response = await api.post("/categories/post/create-category", categoryData)

        const data = response.data

        if (data.success) {
          // Refresh categories list
          await this.fetchCategoriesByShop()
          return data
        }

        return data
      } catch (error) {
        console.error("Error creating category:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update category with enhanced error handling
    async updateCategory(id, categoryData) {
      try {
        this.loading = true

        if (!id) {
          throw new Error("No category ID provided for update")
        }

        const response = await api.patch(`/categories/patch/update-category/${id}`, categoryData)

        const data = response.data

        if (data.success) {
          // Update the category in the local state
          const categoryIndex = this.categories.findIndex((cat) => cat._id === id)
          if (categoryIndex !== -1) {
            this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...data.category }
          }

          // If this is the currently selected category, update it too
          if (this.categoryId === id) {
            this.category = { ...this.category, ...data.category }
          }

          return data
        }

        return data
      } catch (error) {
        console.error("Error updating category:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete category with enhanced error handling
    async deleteCategory(id) {
      try {
        this.loading = true

        if (!id) {
          throw new Error("No category ID provided for deletion")
        }

        const response = await api.delete(`/categories/delete/delete-category/${id}`)

        const data = response.data

        if (data.success) {
          // Remove the category from local state
          this.categories = this.categories.filter((cat) => cat._id !== id)

          // Update pagination total
          this.pagination.total = Math.max(0, this.pagination.total - 1)

          // If we're on a page that no longer has items, go to previous page
          const maxPage = Math.ceil(this.pagination.total / this.pagination.limit)
          if (this.pagination.page > maxPage && maxPage > 0) {
            this.pagination.page = maxPage
            await this.fetchCategoriesByShop()
          }

          return data
        }

        return data
      } catch (error) {
        console.error("Error deleting category:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Advanced local search with multiple criteria
    searchCategoriesLocally(query, filters = {}) {
      if (!query.trim() && !filters.status) {
        return this.categories
      }

      return this.categories.filter((category) => {
        let matches = true

        // Text search
        if (query.trim()) {
          const searchTerm = query.toLowerCase()
          const nameMatch = category.name?.toLowerCase().includes(searchTerm)
          const descMatch = category.description?.toLowerCase().includes(searchTerm)
          matches = matches && (nameMatch || descMatch)
        }

        // Status filter
        if (filters.status) {
          const isActive = filters.status === "active"
          matches = matches && category.active === isActive
        }

        return matches
      })
    },

    // Clear all filters and search
    clearFilters() {
      this.searchQuery = ""
    },

    // Clear selected category
    clearSelectedCategory() {
      this.category = {}
      this.categoryId = null
    },

    // Reset pagination
    resetPagination() {
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    },
  },

  getters: {
    // Get filtered categories based on current search
    filteredCategories() {
      return this.searchCategoriesLocally(this.searchQuery)
    },

    // Get category by ID from current state
    getCategoryById: (state) => (id) => {
      return state.categories.find((category) => category._id === id)
    },

    // Get active categories only
    activeCategories() {
      return this.categories.filter((category) => category.active)
    },

    // Get inactive categories only
    inactiveCategories() {
      return this.categories.filter((category) => !category.active)
    },

    // Count total categories
    totalCategories() {
      return this.categories.length
    },

    // Count active categories
    totalActiveCategories() {
      return this.activeCategories.length
    },

    // Count inactive categories
    totalInactiveCategories() {
      return this.inactiveCategories.length
    },

    // Check if there are categories
    hasCategories() {
      return this.categories.length > 0
    },

    // Check if currently loading
    isLoading() {
      return this.loading
    },

    // Get pagination info
    paginationInfo() {
      return {
        ...this.pagination,
        hasNextPage: this.pagination.page < this.pagination.totalPages,
        hasPrevPage: this.pagination.page > 1,
      }
    },
  },
})
