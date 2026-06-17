<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="handleOverlayClick"
  >
    <div
      class="bg-white rounded-3xl shadow-lg w-full max-w-[1000px] max-h-[90vh] overflow-y-auto flex flex-col"
      @click.stop
    >
      <div
        class="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50"
      >
        <h2
          class="text-xl font-semibold text-gray-800 m-0 flex items-center gap-2"
        >
          <span class="material-symbols-outlined">undo</span>
          Procesar Devolución
        </h2>
        <button
          @click="closeModal"
          class="bg-transparent border-none text-xl text-gray-500 cursor-pointer p-2 rounded transition-colors hover:text-red-500 hover:bg-red-50"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-5 flex-grow overflow-y-auto">
        <!-- Información de la venta -->
        <div
          v-if="sale"
          class="mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-200"
        >
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >receipt_long</span
              >
              Información de la Venta
            </h3>
          </div>
          <div
            class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
          >
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium text-gray-500">Fecha:</span>
              <span class="font-semibold text-gray-800">{{
                formatDate(sale.createdAt)
              }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium text-gray-500">Cliente:</span>
              <span class="font-semibold text-gray-800">{{
                getClientName(sale)
              }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium text-gray-500">Total:</span>
              <span class="font-semibold text-gray-800">{{
                formatPrice(sale.total)
              }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium text-gray-500">Cajero:</span>
              <span class="font-semibold text-gray-800">{{
                sale.cashier || "Sin cajero"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Tipo de devolución -->
        <div class="mb-8">
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >swap_horiz</span
              >
              Tipo de Devolución
            </h3>
          </div>
          <div
            class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4"
          >
            <label
              class="flex items-center p-4 border-2 border-gray-200 rounded-3xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.returnType"
                value="FULL_RETURN"
                @change="onReturnTypeChange"
                class="mr-3 accent-orange-500"
              />
              <div class="flex flex-col gap-1 peer-checked:text-orange-500">
                <span class="material-symbols-outlined text-xl mb-1">undo</span>
                <span class="font-semibold text-[0.95rem]"
                  >Devolución Completa</span
                >
                <span class="text-[0.85rem] text-gray-500"
                  >Devolver todos los productos</span
                >
              </div>
            </label>
            <label
              class="flex items-center p-4 border-2 border-gray-200 rounded-3xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.returnType"
                value="PARTIAL_RETURN"
                @change="onReturnTypeChange"
                class="mr-3 accent-orange-500"
              />
              <div class="flex flex-col gap-1 peer-checked:text-orange-500">
                <span class="material-symbols-outlined text-xl mb-1"
                  >remove_circle</span
                >
                <span class="font-semibold text-[0.95rem]"
                  >Devolución Parcial</span
                >
                <span class="text-[0.85rem] text-gray-500"
                  >Devolver algunos productos</span
                >
              </div>
            </label>
            <label
              class="flex items-center p-4 border-2 border-gray-200 rounded-3xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.returnType"
                value="EXCHANGE"
                @change="onReturnTypeChange"
                class="mr-3 accent-orange-500"
              />
              <div class="flex flex-col gap-1 peer-checked:text-orange-500">
                <span class="material-symbols-outlined text-xl mb-1"
                  >swap_horiz</span
                >
                <span class="font-semibold text-[0.95rem]">Cambio</span>
                <span class="text-[0.85rem] text-gray-500"
                  >Cambiar productos por otros</span
                >
              </div>
            </label>
          </div>
        </div>

        <!-- Productos de la venta original -->
        <div
          v-if="
            returnsStore.returnType !== 'FULL_RETURN' &&
            sale &&
            sale.productDetails
          "
          class="mb-8"
        >
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >inventory_2</span
              >
              Productos de la Venta
            </h3>
          </div>
          <div
            class="flex flex-col gap-3 max-h-[300px] overflow-y-auto p-2 bg-slate-50 rounded-3xl"
          >
            <div
              v-for="(product, index) in sale.productDetails"
              :key="index"
              class="flex items-center justify-between p-4 bg-white border rounded-3xl cursor-pointer transition-all hover:border-orange-500 hover:shadow-md"
              :class="{
                'border-emerald-500 bg-emerald-50': isProductSelected(product),
                'border-gray-200': !isProductSelected(product),
              }"
              @click="toggleProductSelection(product)"
            >
              <div class="flex-1">
                <h4 class="m-0 mb-2 text-[0.95rem] font-semibold text-gray-800">
                  {{ getProductName(product) }}
                </h4>
                <div class="flex gap-4 mb-2">
                  <span class="text-[0.85rem] text-gray-500"
                    >Cantidad: {{ product.quantity }}</span
                  >
                  <span class="text-[0.85rem] font-semibold text-emerald-600">{{
                    formatPrice(getProductPrice(product))
                  }}</span>
                </div>
                <!-- Variantes si existen -->
                <div
                  v-if="product.variants && product.variants.length > 0"
                  class="mt-2"
                >
                  <div
                    v-for="(variant, vIndex) in product.variants"
                    :key="vIndex"
                    class="flex justify-between px-2 py-1 bg-gray-100 rounded mb-1 text-[0.8rem]"
                  >
                    <span class="text-gray-600"
                      >{{ variant.size }} - {{ variant.color }}</span
                    >
                    <span class="font-semibold text-gray-800"
                      >Cant: {{ variant.quantity }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="!isProductSelected(product)"
                  class="flex items-center justify-center w-10 h-10 border-none rounded-2xl cursor-pointer transition-colors bg-orange-500 text-white hover:bg-orange-600"
                  @click.stop="selectProduct(product)"
                >
                  <span class="material-symbols-outlined">add</span>
                </button>
                <button
                  v-else
                  class="flex items-center justify-center w-10 h-10 border-none rounded-2xl cursor-pointer transition-colors bg-emerald-500 text-white"
                  @click.stop="unselectProduct(product)"
                >
                  <span class="material-symbols-outlined">check</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos seleccionados para devolver -->
        <div
          v-if="returnsStore.selectedProductsToReturn.length > 0"
          class="mb-8"
        >
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >list</span
              >
              Productos a Devolver
            </h3>
          </div>
          <div
            class="flex flex-col gap-3 max-h-[300px] overflow-y-auto p-2 bg-slate-50 rounded-3xl"
          >
            <div
              v-for="(product, index) in returnsStore.selectedProductsToReturn"
              :key="index"
              class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-3xl cursor-default transition-all"
            >
              <div class="flex-1">
                <h4 class="m-0 mb-2 text-[0.95rem] font-semibold text-gray-800">
                  {{ getProductName(product) }}
                </h4>
                <div class="flex flex-col gap-2 mt-2">
                  <label class="text-[0.85rem] font-medium text-gray-700"
                    >Cantidad a devolver:</label
                  >
                  <div class="flex items-center gap-2">
                    <button
                      @click="decreaseReturnQuantity(index)"
                      class="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded cursor-pointer transition-colors hover:not(:disabled):bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="product.quantity <= 1"
                    >
                      <span class="material-symbols-outlined">remove</span>
                    </button>
                    <input
                      type="number"
                      v-model.number="product.quantity"
                      @input="updateReturnQuantity(index, $event.target.value)"
                      :min="1"
                      :max="product.maxQuantity"
                      class="w-16 p-2 border border-gray-300 rounded text-center font-semibold"
                    />
                    <button
                      @click="increaseReturnQuantity(index)"
                      class="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded cursor-pointer transition-colors hover:not(:disabled):bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="product.quantity >= product.maxQuantity"
                    >
                      <span class="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <span class="text-[0.8rem] text-gray-500"
                    >Máx: {{ product.maxQuantity }}</span
                  >
                </div>
                <div class="mt-2 font-semibold text-emerald-600">
                  Total: {{ formatPrice(product.unitPrice * product.quantity) }}
                </div>
              </div>
              <button
                @click="removeFromReturn(index)"
                class="flex items-center justify-center w-10 h-10 bg-red-500 text-white border-none rounded-2xl cursor-pointer transition-colors hover:bg-red-600"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Búsqueda de productos para cambio -->
        <div v-if="returnsStore.returnType === 'EXCHANGE'" class="mb-8">
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >search</span
              >
              Buscar Productos para Cambio
            </h3>
          </div>
          <div class="relative mb-4">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >search</span
            >
            <input
              v-model="returnsStore.searchQuery"
              @input="debouncedSearch"
              placeholder="Buscar productos por nombre..."
              class="w-full py-3 pr-3 pl-10 border border-gray-300 rounded-2xl text-[0.95rem] transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
              :disabled="returnsStore.loading"
            />
            <div
              v-if="returnsStore.loading"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500"
            >
              <span class="material-symbols-outlined fa-spin"
                >progress_activity</span
              >
            </div>
          </div>
          <!-- Mensaje cuando no hay resultados -->
          <div
            v-if="
              returnsStore.searchQuery &&
              !returnsStore.loading &&
              returnsStore.searchResults.length === 0
            "
            class="flex flex-col items-center justify-center p-8 mt-4 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-3xl"
          >
            <span class="material-symbols-outlined text-4xl mb-2 opacity-50"
              >search</span
            >
            <p class="m-0 text-[0.9rem]">
              No se encontraron productos que coincidan con "{{
                returnsStore.searchQuery
              }}"
            </p>
          </div>

          <!-- Resultados de búsqueda -->
          <div
            v-if="returnsStore.searchResults.length > 0"
            class="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-2 bg-gray-50 rounded-3xl mt-4"
          >
            <div
              v-for="product in returnsStore.searchResults"
              :key="product._id"
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all hover:border-orange-500 hover:shadow-sm"
              @click="addToExchange(product)"
            >
              <div class="flex-1">
                <h4 class="m-0 mb-2 text-[0.95rem] font-semibold text-gray-800">
                  {{ product.name }}
                </h4>
                <div class="flex gap-4">
                  <span class="font-semibold text-emerald-600">{{
                    formatPrice(product.sellPrice)
                  }}</span>
                  <span class="text-[0.85rem] text-gray-500"
                    >Stock: {{ product.quantity }}</span
                  >
                </div>
              </div>
              <button
                class="flex items-center justify-center w-10 h-10 border-none rounded-2xl cursor-pointer transition-colors bg-emerald-500 text-white hover:bg-emerald-600"
                @click.stop="addToExchange(product)"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Productos nuevos para cambio -->
        <div v-if="returnsStore.newProductsForExchange.length > 0" class="mb-8">
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >shopping_cart</span
              >
              Productos Nuevos
            </h3>
          </div>
          <div
            class="flex flex-col gap-3 max-h-[300px] overflow-y-auto p-2 bg-slate-50 rounded-3xl"
          >
            <div
              v-for="(product, index) in returnsStore.newProductsForExchange"
              :key="index"
              class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-3xl cursor-default transition-all"
            >
              <div class="flex-1">
                <h4 class="m-0 mb-2 text-[0.95rem] font-semibold text-gray-800">
                  {{ product.name }}
                </h4>
                <div class="flex flex-col gap-2 mt-2">
                  <label class="text-[0.85rem] font-medium text-gray-700"
                    >Cantidad:</label
                  >
                  <div class="flex items-center gap-2">
                    <button
                      @click="decreaseNewQuantity(index)"
                      class="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded cursor-pointer transition-colors hover:not(:disabled):bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="product.quantity <= 1"
                    >
                      <span class="material-symbols-outlined">remove</span>
                    </button>
                    <input
                      type="number"
                      v-model.number="product.quantity"
                      @input="updateNewQuantity(index, $event.target.value)"
                      :min="1"
                      :max="product.maxQuantity"
                      class="w-16 p-2 border border-gray-300 rounded text-center font-semibold"
                    />
                    <button
                      @click="increaseNewQuantity(index)"
                      class="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded cursor-pointer transition-colors hover:not(:disabled):bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="product.quantity >= product.maxQuantity"
                    >
                      <span class="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <span class="text-[0.8rem] text-gray-500"
                    >Stock: {{ product.maxQuantity }}</span
                  >
                </div>
                <div class="mt-2 font-semibold text-emerald-600">
                  Total: {{ formatPrice(product.unitPrice * product.quantity) }}
                </div>
              </div>
              <button
                @click="removeFromExchange(index)"
                class="flex items-center justify-center w-10 h-10 bg-red-500 text-white border-none rounded-2xl cursor-pointer transition-colors hover:bg-red-600"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Resumen de montos -->
        <div
          v-if="showAmountSummary"
          class="mb-8 p-6 bg-amber-50 border border-amber-500 rounded-3xl"
        >
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-800 m-0 flex items-center gap-2 pb-2 border-b-2 border-amber-200"
            >
              <span class="material-symbols-outlined text-amber-600"
                >calculate</span
              >
              Resumen de Montos
            </h3>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center py-2">
              <span class="font-medium text-gray-700">Total a devolver:</span>
              <span class="font-semibold text-lg text-gray-900">{{
                formatPrice(currentReturnAmount)
              }}</span>
            </div>
            <div
              v-if="returnsStore.returnType === 'EXCHANGE'"
              class="flex justify-between items-center py-2"
            >
              <span class="font-medium text-gray-700"
                >Total productos nuevos:</span
              >
              <span class="font-semibold text-lg text-gray-900">{{
                formatPrice(returnsStore.totalNewAmount)
              }}</span>
            </div>
            <div
              class="flex justify-between items-center pt-4 border-t-2 border-amber-500 text-lg"
            >
              <span class="font-bold text-gray-800">Diferencia:</span>
              <span
                class="font-bold flex items-center gap-2"
                :class="{
                  'text-emerald-600':
                    returnsStore.calculatedBalanceDifference > 0,
                  'text-red-500': returnsStore.calculatedBalanceDifference < 0,
                  'text-gray-500':
                    returnsStore.calculatedBalanceDifference === 0,
                }"
              >
                {{
                  formatPrice(
                    Math.abs(returnsStore.calculatedBalanceDifference),
                  )
                }}
                <span
                  v-if="returnsStore.calculatedBalanceDifference > 0"
                  class="font-normal text-sm"
                >
                  (A favor del cliente)
                </span>
                <span
                  v-else-if="returnsStore.calculatedBalanceDifference < 0"
                  class="font-normal text-sm"
                >
                  (Cliente debe pagar)
                </span>
                <span v-else class="font-normal text-sm">
                  (Sin diferencia)
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Tipo de reembolso -->
        <div v-if="needsRefundType" class="mb-8">
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >payments</span
              >
              Tipo de Reembolso
            </h3>
          </div>
          <div
            class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
          >
            <label
              class="flex items-center p-3 border border-gray-300 rounded-2xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.refundType"
                value="CASH"
                class="mr-3 accent-orange-500"
              />
              <span
                class="flex items-center gap-2 peer-checked:text-orange-500 font-medium text-gray-700"
              >
                <span class="material-symbols-outlined">payments</span>
                Efectivo
              </span>
            </label>
            <label
              class="flex items-center p-3 border border-gray-300 rounded-2xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.refundType"
                value="CREDIT"
                class="mr-3 accent-orange-500"
              />
              <span
                class="flex items-center gap-2 peer-checked:text-orange-500 font-medium text-gray-700"
              >
                <span class="material-symbols-outlined">credit_card</span>
                Crédito a favor
              </span>
            </label>
            <label
              class="flex items-center p-3 border border-gray-300 rounded-2xl cursor-pointer transition-all bg-white hover:border-orange-500 hover:bg-orange-50 has-checked:border-orange-500 has-checked:bg-orange-50"
            >
              <input
                type="radio"
                v-model="returnsStore.refundType"
                value="ACCOUNT_ADJUSTMENT"
                class="mr-3 accent-orange-500"
              />
              <span
                class="flex items-center gap-2 peer-checked:text-orange-500 font-medium text-gray-700"
              >
                <span class="material-symbols-outlined">balance</span>
                Ajuste de cuenta
              </span>
            </label>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="mb-4">
          <div class="mb-4">
            <h3
              class="text-base font-semibold text-gray-700 m-0 flex items-center gap-2 pb-2 border-b-2 border-gray-200"
            >
              <span class="material-symbols-outlined text-orange-500"
                >info</span
              >
              Información Adicional
            </h3>
          </div>
          <div class="mb-4 flex flex-col gap-2">
            <label
              for="reason"
              class="font-semibold text-[0.9rem] text-gray-700"
              >Motivo de la devolución *</label
            >
            <select
              v-model="returnsStore.reason"
              id="reason"
              class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
              required
            >
              <option value="">Seleccione un motivo...</option>
              <option value="Producto defectuoso">Producto defectuoso</option>
              <option value="Talla incorrecta">Talla incorrecta</option>
              <option value="Color incorrecto">Color incorrecto</option>
              <option value="No satisface expectativas">
                No satisface expectativas
              </option>
              <option value="Error en la venta">Error en la venta</option>
              <option value="Cliente cambió de opinión">
                Cliente cambió de opinión
              </option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="mb-4 flex flex-col gap-2">
            <label
              for="processedBy"
              class="font-semibold text-[0.9rem] text-gray-700"
              >Procesado por *</label
            >
            <input
              v-model="returnsStore.processedBy"
              id="processedBy"
              class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
              placeholder="Nombre del empleado"
              required
            />
          </div>
          <div class="mb-4 flex flex-col gap-2">
            <label for="notes" class="font-semibold text-[0.9rem] text-gray-700"
              >Notas adicionales</label
            >
            <textarea
              v-model="returnsStore.notes"
              id="notes"
              class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)] font-sans"
              rows="3"
              placeholder="Notas opcionales sobre la devolución..."
            ></textarea>
          </div>
        </div>
      </div>

      <div
        class="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 flex-col md:flex-row"
      >
        <button
          @click="processReturn"
          class="flex items-center justify-center gap-2 px-6 py-3 border-none rounded-2xl font-semibold cursor-pointer transition-all bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none w-full md:w-auto"
          :disabled="!canProcess || returnsStore.loading"
        >
          <span
            v-if="returnsStore.loading"
            class="material-symbols-outlined fa-spin"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined">check</span>
          {{ getProcessButtonText() }}
        </button>
        <button
          @click="closeModal"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-[1px] w-full md:w-auto"
        >
          <span class="material-symbols-outlined">close</span>
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- Toast de éxito -->
  <toastComponent
    v-if="returnsStore.showToast"
    :message="returnsStore.toastMessage"
    :state="returnsStore.toastState"
    :duration="4000"
    :autoClose="true"
    @close="returnsStore.hideToast()"
  />
</template>

<script>
import { useReturnsStore } from "@/stores/returnsStore";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";

export default {
  name: "ReturnsComponent",
  components: {
    toastComponent,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    sale: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup() {
    const returnsStore = useReturnsStore();
    return {
      returnsStore,
    };
  },
  data() {
    return {
      searchTimeout: null,
    };
  },
  computed: {
    canProcess() {
      return this.returnsStore.canProcessReturn;
    },

    showAmountSummary() {
      return (
        this.returnsStore.returnType === "FULL_RETURN" ||
        this.returnsStore.returnType === "PARTIAL_RETURN" ||
        this.returnsStore.returnType === "EXCHANGE"
      );
    },

    currentReturnAmount() {
      if (this.returnsStore.returnType === "FULL_RETURN") {
        return this.returnsStore.fullReturnAmount;
      }
      return this.returnsStore.totalReturnAmount;
    },

    needsRefundType() {
      return (
        this.returnsStore.returnType !== "EXCHANGE" ||
        this.returnsStore.calculatedBalanceDifference > 0
      );
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },

    handleOverlayClick() {
      this.closeModal();
    },

    onReturnTypeChange() {
      // Solo resetear productos seleccionados, no el tipo de devolución
      this.returnsStore.resetSelectedProducts();
      // Limpiar búsqueda también
      this.returnsStore.searchQuery = "";
      this.returnsStore.searchResults = [];
    },

    formatPrice(value) {
      return this.returnsStore.formatPrice(value);
    },

    formatDate(date) {
      return this.returnsStore.formatDate(date);
    },

    getClientName(sale) {
      if (sale.clientId?.name) return sale.clientId.name;
      if (sale.clientName) return sale.clientName;
      return "Cliente general";
    },

    getProductName(product) {
      if (product.productName) return product.productName;
      if (product.productId?.name) return product.productId.name;
      if (product.name) return product.name;
      return "Producto";
    },

    getProductPrice(product) {
      // Prioridad: salePrice (snapshot nuevo) > unitPrice > productId.sellPrice > sellPrice directo
      if (product.salePrice != null) return product.salePrice;
      if (product.unitPrice) return product.unitPrice;
      if (product.productId?.sellPrice) return product.productId.sellPrice;
      if (product.sellPrice) return product.sellPrice;
      return 0;
    },

    isProductSelected(product) {
      return this.returnsStore.selectedProductsToReturn.some(
        (p) =>
          p.productId.toString() ===
          (product.productId?._id || product.productId).toString(),
      );
    },

    selectProduct(product) {
      const productToAdd = {
        productId: product.productId?._id || product.productId,
        quantity: 1,
        maxQuantity: product.quantity,
        unitPrice: this.getProductPrice(product),
        name: this.getProductName(product),
        variants: product.variants || [],
      };
      this.returnsStore.addProductToReturn(productToAdd);
    },

    unselectProduct(product) {
      const index = this.returnsStore.selectedProductsToReturn.findIndex(
        (p) =>
          p.productId.toString() ===
          (product.productId?._id || product.productId).toString(),
      );
      if (index !== -1) {
        this.returnsStore.removeProductFromReturn(index);
      }
    },

    toggleProductSelection(product) {
      if (this.isProductSelected(product)) {
        this.unselectProduct(product);
      } else {
        this.selectProduct(product);
      }
    },

    removeFromReturn(index) {
      this.returnsStore.removeProductFromReturn(index);
    },

    updateReturnQuantity(index, value) {
      this.returnsStore.updateReturnProductQuantity(
        index,
        parseInt(value) || 1,
      );
    },

    increaseReturnQuantity(index) {
      const product = this.returnsStore.selectedProductsToReturn[index];
      if (product && product.quantity < product.maxQuantity) {
        this.updateReturnQuantity(index, product.quantity + 1);
      }
    },

    decreaseReturnQuantity(index) {
      const product = this.returnsStore.selectedProductsToReturn[index];
      if (product && product.quantity > 1) {
        this.updateReturnQuantity(index, product.quantity - 1);
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.returnsStore.searchProducts();
      }, 300);
    },

    addToExchange(product) {
      this.returnsStore.addNewProductForExchange(product);
    },

    removeFromExchange(index) {
      this.returnsStore.removeNewProductFromExchange(index);
    },

    updateNewQuantity(index, value) {
      this.returnsStore.updateNewProductQuantity(index, parseInt(value) || 1);
    },

    increaseNewQuantity(index) {
      const product = this.returnsStore.newProductsForExchange[index];
      if (product && product.quantity < product.maxQuantity) {
        this.updateNewQuantity(index, product.quantity + 1);
      }
    },

    decreaseNewQuantity(index) {
      const product = this.returnsStore.newProductsForExchange[index];
      if (product && product.quantity > 1) {
        this.updateNewQuantity(index, product.quantity - 1);
      }
    },

    getProcessButtonText() {
      switch (this.returnsStore.returnType) {
        case "FULL_RETURN":
          return "Procesar Devolución Completa";
        case "PARTIAL_RETURN":
          return "Procesar Devolución Parcial";
        case "EXCHANGE":
          return "Procesar Cambio";
        default:
          return "Procesar";
      }
    },

    async processReturn() {
      if (!this.canProcess) return;

      try {
        let result;

        switch (this.returnsStore.returnType) {
          case "FULL_RETURN":
            result = await this.returnsStore.processFullReturn();
            break;
          case "PARTIAL_RETURN":
            result = await this.returnsStore.processPartialReturn();
            break;
          case "EXCHANGE":
            result = await this.returnsStore.processExchange();
            break;
        }

        if (result) {
          this.$emit("processed", result);
          this.closeModal();
        }
      } catch (error) {
        console.error("Error processing return:", error);
      }
    },
  },
  watch: {
    visible(newValue) {
      if (newValue && this.sale) {
        this.returnsStore.setSaleForReturn(this.sale);
        // Establecer usuario actual como procesado por defecto
        this.returnsStore.processedBy = localStorage.getItem("userName") || "";
      }
    },
  },
};
</script>
