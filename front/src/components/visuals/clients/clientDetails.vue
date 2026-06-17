<template>
  <div
    class="fixed inset-0 w-full h-full bg-black/75 z-[1000] flex items-center justify-center overflow-y-auto"
  >
    <div
      class="bg-gray-50 shadow-2xl w-full h-screen md:w-[95vw] md:h-[95vh] flex flex-col overflow-hidden text-gray-800 font-sans md:rounded-3xl"
    >
      <div class="p-5 border-b border-gray-200">
        <div
          class="flex items-center mb-4 justify-between flex-wrap md:flex-col md:items-start md:gap-2 lg:flex-row lg:items-center"
        >
          <button
            class="flex items-center bg-transparent border-none text-gray-600 text-sm cursor-pointer py-2 px-3 rounded-lg lg:mr-4 transition-all hover:bg-gray-200 hover:text-gray-900 md:mb-2 lg:mb-0"
            @click="goBack"
          >
            <span class="material-symbols-outlined mr-2">arrow_back</span>
            <span>Volver</span>
          </button>
          <h2
            class="text-orange-500 m-0 text-2xl font-bold flex-grow text-center w-full md:w-full lg:w-auto order-last lg:order-none mt-2 lg:mt-0 md:order-first"
          >
            Detalles del Cliente: {{ client.name }}
          </h2>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 py-2 px-3 rounded-lg cursor-pointer text-sm font-medium transition-all hover:bg-gray-50 shadow-sm md:m-1"
              @click="generateClientPDF"
              :disabled="loading"
            >
              <span class="material-symbols-outlined">picture_as_pdf</span>
              <span>Generar PDF</span>
            </button>
            <button
              v-if="!isEditing"
              class="flex items-center gap-2 bg-orange-500 text-white border-none py-2 px-3 rounded-lg cursor-pointer text-sm font-medium transition-colors hover:bg-orange-600 md:m-1"
              @click="editClient"
            >
              <span class="material-symbols-outlined">edit</span>
              <span>Editar</span>
            </button>
          </div>
        </div>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4"
        >
          <div class="flex flex-col">
            <span class="text-gray-500 text-sm mb-1">Nombre:</span>
            <span
              v-if="!isEditing"
              class="text-gray-800 text-base font-medium"
              >{{ client.name }}</span
            >
            <input
              v-else
              v-model="editableClient.name"
              type="text"
              class="py-2 px-3 border border-gray-300 rounded-lg text-base text-gray-800 bg-white shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500 text-sm mb-1">Dirección:</span>
            <span
              v-if="!isEditing"
              class="text-gray-800 text-base font-medium"
              >{{ client.address }}</span
            >
            <input
              v-else
              v-model="editableClient.address"
              type="text"
              class="py-2 px-3 border border-gray-300 rounded-lg text-base text-gray-800 bg-white shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500 text-sm mb-1">Teléfono:</span>
            <span v-if="!isEditing" class="text-gray-800 text-base font-medium">
              <a
                :href="getWhatsappLink(client.phone)"
                target="_blank"
                class="text-orange-500 no-underline hover:underline"
                >{{ client.phone }}</a
              >
            </span>
            <input
              v-else
              v-model="editableClient.phone"
              type="number"
              class="py-2 px-3 border border-gray-300 rounded-lg text-base text-gray-800 bg-white shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500 text-sm mb-1">Email:</span>
            <span v-if="!isEditing" class="text-gray-800 text-base font-medium">
              <a
                :href="`mailto:${client.email}`"
                target="_blank"
                class="text-orange-500 no-underline hover:underline"
                >{{ client.email }}</a
              >
            </span>
            <input
              v-else
              v-model="editableClient.email"
              type="email"
              class="py-2 px-3 border border-gray-300 rounded-lg text-base text-gray-800 bg-white shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500 text-sm mb-1">Deuda Total:</span>
            <span class="text-red-500 text-base font-bold">{{
              formatNumber(client.debt)
            }}</span>
          </div>
          <div
            v-if="isEditing"
            class="col-span-full flex justify-end gap-3 mt-4"
          >
            <button
              class="py-2 px-4 bg-emerald-500 text-white border-none rounded-lg cursor-pointer text-sm font-semibold transition-colors hover:bg-emerald-600"
              @click="saveClientDetails"
            >
              Guardar
            </button>
            <button
              class="py-2 px-4 bg-red-500 text-white border-none rounded-lg cursor-pointer text-sm font-semibold transition-colors hover:bg-red-600"
              @click="cancelEdit"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <!-- NAVEGACIÓN POR PESTAÑAS -->
      <div
        class="flex bg-gray-100 border-b border-gray-200 overflow-x-auto md:flex-row md:justify-around"
      >
        <button
          @click="activeTab = 'sales'"
          class="flex items-center justify-center gap-2 py-4 px-5 bg-transparent border-none border-b-4 text-gray-600 cursor-pointer text-sm font-medium whitespace-nowrap transition-all flex-grow md:flex-grow flex-1"
          :class="
            activeTab === 'sales'
              ? 'text-orange-500 bg-white border-orange-500'
              : 'border-transparent hover:bg-gray-200 hover:text-gray-800'
          "
        >
          <span class="material-symbols-outlined md:mr-0">shopping_cart</span>
          <span class="hidden md:inline text-current">Ventas</span>
          <span
            class="bg-gray-300 text-gray-600 text-[0.75rem] py-[2px] px-2 rounded-full min-w-[20px] text-center"
            :class="{ 'bg-orange-500 text-white': activeTab === 'sales' }"
            v-if="salesTotalCount"
            >{{ salesTotalCount }}</span
          >
        </button>
        <!-- <button
          @click="activeTab = 'orders'"
          class="flex items-center justify-center gap-2 py-4 px-5 bg-transparent border-none border-b-4 text-gray-600 cursor-pointer text-sm font-medium whitespace-nowrap transition-all flex-grow md:flex-grow flex-1"
          :class="activeTab === 'orders' ? 'text-orange-500 bg-white border-orange-500' : 'border-transparent hover:bg-gray-200 hover:text-gray-800'"
        >
          <span class="material-symbols-outlined md:mr-0">receipt_long</span>
          <span class="hidden md:inline text-current">Pedidos</span>
          <span class="bg-gray-300 text-gray-600 text-[0.75rem] py-[2px] px-2 rounded-full min-w-[20px] text-center" :class="{'bg-orange-500 text-white': activeTab === 'orders'}" v-if="ordersTotalCount">{{
            ordersTotalCount
          }}</span>
        </button> -->
        <button
          @click="activeTab = 'payments'"
          class="flex items-center justify-center gap-2 py-4 px-5 bg-transparent border-none border-b-4 text-gray-600 cursor-pointer text-sm font-medium whitespace-nowrap transition-all flex-grow md:flex-grow flex-1"
          :class="
            activeTab === 'payments'
              ? 'text-orange-500 bg-white border-orange-500'
              : 'border-transparent hover:bg-gray-200 hover:text-gray-800'
          "
        >
          <span class="material-symbols-outlined md:mr-0">payments</span>
          <span class="hidden md:inline text-current">Pagos</span>
          <span
            class="bg-gray-300 text-gray-600 text-[0.75rem] py-[2px] px-2 rounded-full min-w-[20px] text-center"
            :class="{ 'bg-orange-500 text-white': activeTab === 'payments' }"
            v-if="paymentsTotalCount"
            >{{ paymentsTotalCount }}</span
          >
        </button>
      </div>
      <!-- CONTENIDO DE LAS PESTAÑAS -->
      <div class="flex-1 overflow-y-auto p-5">
        <!-- VENTAS -->
        <div v-if="activeTab === 'sales'" class="h-full">
          <div v-if="sales && sales.length > 0">
            <div class="mb-5">
              <div
                class="flex justify-between items-center mb-4 flex-col md:flex-row md:items-start gap-3"
              >
                <h4 class="text-gray-800 m-0 text-xl font-semibold">
                  Historial de Ventas
                </h4>
                <div class="flex gap-5">
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Total:</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      salesTotalCount
                    }}</span>
                  </span>
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Monto Total (página):</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      formatNumber(totalSalesAmount)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto w-full bg-white rounded-lg shadow-sm hidden md:block">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-left">
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Fecha
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Descripción
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Método de pago
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Total
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap text-center"
                    >
                      Estado
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap text-center"
                    >
                      Estado Pago
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="sale in sales"
                    :key="sale._id"
                    @click="openDetailModal('sale', sale)"
                    class="cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td class="p-3 text-gray-800">
                      {{ formatDate(sale.createdAt) }}
                    </td>
                    <td class="p-3 text-gray-600">
                      {{ getProductDetailsDescription(sale.productDetails) }}
                    </td>

                    <!-- METODOS DE PAGO -->
                    <td class="p-3">
                      <!-- Método de pago único -->
                      <div v-if="sale.paymentMethods.length === 0" class="">
                        <span
                          class="inline-block py-1 px-3 rounded-full text-[0.75rem] font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm align-middle whitespace-nowrap"
                        >
                          {{ sale.paymentMethod }}
                        </span>
                      </div>

                      <!-- Múltiples métodos de pago -->
                      <div v-else class="flex flex-col gap-1.5 min-w-[150px]">
                        <div class="flex flex-col gap-1.5">
                          <div
                            v-for="(payment, index) in sale.paymentMethods"
                            :key="index"
                            class="flex justify-between items-center py-1 px-2 bg-gray-50 rounded border border-gray-200"
                          >
                            <span
                              class="text-[0.7rem] font-bold uppercase text-gray-600 mr-2 flex items-center pr-2 border-r border-gray-300"
                            >
                              {{ payment.method }}
                            </span>
                            <span
                              class="text-[0.75rem] font-bold text-emerald-600 bg-emerald-100 py-0.5 px-1.5 rounded border border-emerald-200"
                            >
                              {{ formatNumber(payment.amount) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="p-3 text-gray-800 font-medium">
                      {{ formatNumber(sale.total) }}
                    </td>
                    <td class="p-3 text-center">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-bold inline-block',
                          sale.status === 'Cancelado'
                            ? 'bg-red-100 text-red-500'
                            : 'bg-emerald-100 text-emerald-500',
                        ]"
                      >
                        {{ sale.status }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-bold inline-block',
                          sale.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700',
                        ]"
                      >
                        {{ sale.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- VISTA MÓVIL (TARJETAS) -->
            <div class="md:hidden flex flex-col gap-4 w-full">
              <div v-for="sale in sales" :key="sale._id" @click="openDetailModal('sale', sale)" class="cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative transition-shadow hover:shadow-md">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-gray-800 text-sm font-semibold">{{ formatDate(sale.createdAt) }}</span>
                  <span
                    :class="[
                      'px-2 py-1 rounded text-[0.65rem] uppercase font-bold inline-block tracking-wider',
                      sale.status === 'Cancelado'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-emerald-100 text-emerald-500',
                    ]"
                  >
                    {{ sale.status }}
                  </span>
                </div>
                <!-- Description -->
                <p class="text-xs text-gray-600 mb-3 truncate">{{ getProductDetailsDescription(sale.productDetails) }}</p>
                <div class="flex justify-between items-center border-t border-gray-50 pt-3">
                   <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-gray-400 text-[1rem]">payments</span>
                      <span class="text-xs font-bold text-gray-600" v-if="sale.paymentMethods.length === 0">{{ sale.paymentMethod }}</span>
                      <span class="text-xs font-bold text-gray-600" v-else>Múltiples</span>
                   </div>
                   <div class="flex flex-col items-end gap-1">
                     <span class="font-bold text-gray-800">{{ formatNumber(sale.total) }}</span>
                     <span
                       :class="[
                         'px-2 py-0.5 rounded text-[0.65rem] font-bold inline-block',
                         sale.paymentStatus === 'paid'
                           ? 'bg-emerald-100 text-emerald-700'
                           : 'bg-amber-100 text-amber-700',
                       ]"
                     >
                       {{ sale.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
                     </span>
                   </div>
                </div>
              </div>
            </div>
            <div
              class="flex justify-center items-center gap-4 mt-5 p-3 bg-gray-50 rounded-lg flex-wrap"
            >
              <button
                @click="previousPage"
                :disabled="page <= 1"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span class="text-gray-600 font-medium text-sm"
                >Página {{ page }} de {{ salesTotalPages }}</span
              >

              <button
                @click="nextPage"
                :disabled="page >= salesTotalPages"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center p-12 text-center text-gray-400"
          >
            <span class="material-symbols-outlined text-5xl mb-4 text-gray-300"
              >shopping_cart</span
            >
            <h3 class="text-gray-800 m-0 text-xl font-semibold">
              No hay ventas registradas
            </h3>
            <p class="text-gray-500 m-0 mt-2 text-sm">
              No se encontraron ventas para este cliente.
            </p>
          </div>
        </div>
        <!-- PEDIDOS -->
        <div v-if="activeTab === 'orders'" class="h-full">
          <div v-if="orders && orders.length > 0">
            <div class="mb-5">
              <div
                class="flex justify-between items-center mb-4 flex-col md:flex-row md:items-start gap-3"
              >
                <h4 class="text-gray-800 m-0 text-xl font-semibold">
                  Historial de Pedidos
                </h4>
                <div class="flex gap-5">
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Total:</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      ordersTotalCount
                    }}</span>
                  </span>
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Monto Total (página):</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      formatNumber(totalOrdersAmount)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto w-full bg-white rounded-lg shadow-sm hidden md:block">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-left">
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Fecha
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Descripción
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Total
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap text-center"
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in orders"
                    :key="order._id"
                    @click="openDetailModal('order', order)"
                    class="cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td class="p-3 text-gray-800">
                      {{ formatDate(order.createdAt) }}
                    </td>
                    <td class="p-3 text-gray-600">
                      {{ getProductDetailsDescription(order.productDetails) }}
                    </td>
                    <td class="p-3 text-gray-800 font-medium">
                      {{ formatNumber(order.total) }}
                    </td>
                    <td class="p-3 text-center">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-bold inline-block',
                          order.pedidoState === 'PENDIENTE'
                            ? 'bg-red-100 text-red-500'
                            : 'bg-emerald-100 text-emerald-500',
                        ]"
                      >
                        {{ order.pedidoState }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- VISTA MÓVIL (TARJETAS) -->
            <div class="md:hidden flex flex-col gap-4 w-full">
              <div v-for="order in orders" :key="order._id" @click="openDetailModal('order', order)" class="cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative transition-shadow hover:shadow-md">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-gray-800 text-sm font-semibold">{{ formatDate(order.createdAt) }}</span>
                  <span
                    :class="[
                      'px-2 py-1 rounded text-[0.65rem] uppercase font-bold inline-block tracking-wider',
                      order.pedidoState === 'PENDIENTE'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-emerald-100 text-emerald-500',
                    ]"
                  >
                    {{ order.pedidoState }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 mb-3 truncate">{{ getProductDetailsDescription(order.productDetails) }}</p>
                <div class="flex justify-end items-center border-t border-gray-50 pt-3">
                   <span class="font-bold text-gray-800">{{ formatNumber(order.total) }}</span>
                </div>
              </div>
            </div>
            <div
              class="flex justify-center items-center gap-4 mt-5 p-3 bg-gray-50 rounded-lg flex-wrap"
            >
              <button
                @click="fetchOrders(ordersCurrentPage - 1)"
                :disabled="ordersCurrentPage <= 1"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span class="text-gray-600 font-medium text-sm"
                >Página {{ ordersCurrentPage }} de {{ ordersTotalPages }}</span
              >
              <button
                @click="fetchOrders(ordersCurrentPage + 1)"
                :disabled="ordersCurrentPage >= ordersTotalPages"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center p-12 text-center text-gray-400"
          >
            <span class="material-symbols-outlined text-5xl mb-4 text-gray-300"
              >receipt_long</span
            >
            <h3 class="text-gray-800 m-0 text-xl font-semibold">
              No hay pedidos registrados
            </h3>
            <p class="text-gray-500 m-0 mt-2 text-sm">
              No se encontraron pedidos para este cliente.
            </p>
          </div>
        </div>
        <!-- PAGOS -->
        <div v-if="activeTab === 'payments'" class="h-full">
          <div v-if="payments && payments.length > 0">
            <div class="mb-5">
              <div
                class="flex justify-between items-center mb-4 flex-col md:flex-row md:items-start gap-3"
              >
                <h4 class="text-gray-800 m-0 text-xl font-semibold">
                  Historial de Pagos
                </h4>
                <div class="flex gap-5">
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Total:</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      paymentsTotalCount
                    }}</span>
                  </span>
                  <span class="flex flex-col items-center text-center">
                    <span class="text-gray-500 text-[0.8rem] mb-0.5"
                      >Monto Total (página):</span
                    >
                    <span class="text-gray-800 font-bold text-base">{{
                      formatNumber(totalPaymentsAmount)
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto w-full bg-white rounded-lg shadow-sm hidden md:block">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-left">
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Fecha
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Monto
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Descripción
                    </th>
                    <th
                      class="p-3 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      Venta vinculada
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="payment in payments"
                    :key="payment._id"
                    @click="openDetailModal('payment', payment)"
                    class="cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td class="p-3 text-gray-800">
                      {{ formatDate(payment.date || payment.createdAt) }}
                    </td>
                    <td class="p-3 text-emerald-600 font-medium">
                      {{ formatNumber(payment.amount) }}
                    </td>
                    <td class="p-3 text-gray-600">
                      {{ payment.description || "N/A" }}
                    </td>
                    <td class="p-3">
                      <span
                        v-if="payment.saleId"
                        class="inline-block px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200"
                        :title="payment.saleId"
                      >
                        #{{ String(payment.saleId).slice(-6) }}
                      </span>
                      <span v-else class="text-gray-400 text-xs">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- VISTA MÓVIL (TARJETAS) -->
            <div class="md:hidden flex flex-col gap-4 w-full">
              <div v-for="payment in payments" :key="payment._id" @click="openDetailModal('payment', payment)" class="cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative transition-shadow hover:shadow-md">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-gray-800 text-sm font-semibold">{{ formatDate(payment.date || payment.createdAt) }}</span>
                  <span class="text-emerald-600 font-bold bg-emerald-50 py-0.5 px-2 rounded">{{ formatNumber(payment.amount) }}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-gray-600 m-0 truncate">{{ payment.description || "N/A" }}</p>
                  <span
                    v-if="payment.saleId"
                    class="text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded ml-2 shrink-0"
                    :title="payment.saleId"
                  >#{{ String(payment.saleId).slice(-6) }}</span>
                </div>
              </div>
            </div>
            <div
              class="flex justify-center items-center gap-4 mt-5 p-3 bg-gray-50 rounded-lg flex-wrap"
            >
              <button
                @click="fetchPayments(paymentsCurrentPage - 1)"
                :disabled="paymentsCurrentPage <= 1"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span class="text-gray-600 font-medium text-sm"
                >Página {{ paymentsCurrentPage }} de
                {{ paymentsTotalPages }}</span
              >
              <button
                @click="fetchPayments(paymentsCurrentPage + 1)"
                :disabled="paymentsCurrentPage >= paymentsTotalPages"
                class="bg-orange-500 text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-semibold transition-colors hover:not(:disabled):bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center p-12 text-center text-gray-400"
          >
            <span class="material-symbols-outlined text-5xl mb-4 text-gray-300"
              >payments</span
            >
            <h3 class="text-gray-800 m-0 text-xl font-semibold">
              No hay pagos registrados
            </h3>
            <p class="text-gray-500 m-0 mt-2 text-sm">
              No se encontraron pagos para este cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Detalles de Venta/Pedido/Pago -->
  <div
    v-if="showDetailModal"
    class="detail-modal-overlay"
    @click.self="closeDetailModal"
  >
    <div class="detail-modal-content">
      <div class="modal-header">
        <h3>
          Detalles de
          {{
            modalType === "sale"
              ? "Venta"
              : modalType === "order"
                ? "Pedido"
                : "Pago"
          }}
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

          <template v-if="modalType === 'sale' || modalType === 'order'">
            <div class="modal-info-item">
              <span class="label">Total:</span>
              <span class="value">{{ formatNumber(modalData.total) }}</span>
            </div>
            <div class="modal-info-item" v-if="modalType === 'sale'">
              <span class="label">Cajero:</span>
              <span class="value">{{ modalData.cashier }}</span>
            </div>
            <div class="modal-info-item" v-if="modalType === 'sale'">
              <span class="label">Método de Pago:</span>
              <span class="value">{{ modalData.paymentMethod }}</span>
            </div>
            <div class="modal-info-item" v-if="modalType === 'sale'">
              <span class="label">Estado de Pago:</span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-bold inline-block',
                  modalData.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700',
                ]"
              >
                {{ modalData.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
              </span>
            </div>
            <div class="modal-info-item" v-if="modalType === 'order'">
              <span class="label">Estado del Pedido:</span>
              <span class="value">{{ modalData.pedidoState }}</span>
            </div>
            <div class="modal-info-item" v-if="modalType === 'order'">
              <span class="label">Tipo de Pedido:</span>
              <span class="value">{{ modalData.pedidoType }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.discount">
              <span class="label">Descuento:</span>
              <span class="value">{{ formatNumber(modalData.discount) }}</span>
            </div>
            <div class="modal-info-item" v-if="modalData.surcharge">
              <span class="label">Recargo:</span>
              <span class="value">{{ formatNumber(modalData.surcharge) }}</span>
            </div>
          </template>

          <template v-else-if="modalType === 'payment'">
            <div class="modal-info-item">
              <span class="label">Monto:</span>
              <span class="value">{{ formatNumber(modalData.amount) }}</span>
            </div>
            <div class="modal-info-item">
              <span class="label">Descripción:</span>
              <span class="value">{{ modalData.description || "N/A" }}</span>
            </div>
          </template>
        </div>

        <template v-if="modalType === 'sale' || modalType === 'order'">
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
                  product.salePrice ??
                    product.sellPrice ??
                    (product.productId && product.productId.sellPrice),
                )
              }}</span>
            </div>
          </div>
          <div v-else class="empty-state-small">
            <p>No hay productos registrados para esta transacción.</p>
          </div>
        </template>

        <!-- Botón registrar pago: solo en ventas con pago pendiente -->
        <div
          v-if="modalType === 'sale' && modalData.paymentStatus !== 'paid'"
          class="mt-4 pt-4 border-t border-gray-100 flex justify-end"
        >
          <button
            @click="openRegisterPaymentForSale(modalData)"
            class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-base">payments</span>
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de registro de pago vinculado a una venta -->
  <clientRegisterPago
    v-if="showPaymentForSaleModal && paymentForSale"
    :preselectedClientId="paymentForSale.clientId"
    :preselectedClientName="paymentForSale.clientName"
    :preselectedSaleId="paymentForSale.saleId"
    @close="showPaymentForSaleModal = false"
    @submit="onPaymentRegistered"
  />

  <spinnerComponent v-if="loading" />
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import numeral from "numeral";
import api from "@/config/axios.config"; // Asegúrate de que esta ruta sea correcta
import spinnerComponent from "../spinnerComponent.vue"; // Asegúrate de que esta ruta sea correcta
import clientRegisterPago from "./clientRegisterPago.vue";

export default {
  name: "ClientDetails",
  components: {
    spinnerComponent,
    clientRegisterPago,
  },
  props: {
    clientId: {
      type: String,
      required: true,
    },
    shopId: {
      // Asumiendo que necesitas el shopId para las llamadas paginadas
      type: String,
      required: true,
    },
  },
  data() {
    return {
      client: {
        name: "",
        address: "",
        phone: "",
        email: "",
        debt: 0,
        payments: [], // Mantener para la estructura inicial, pero se llenará por fetchPayments
      },
      editableClient: {
        name: "",
        address: "",
        phone: "",
        email: "",
      },
      sales: [],
      page: 1,
      salesItemsPerPage: 10,
      salesTotalPages: 1,
      salesTotalCount: 0,

      orders: [],
      ordersCurrentPage: 1,
      ordersItemsPerPage: 10,
      ordersTotalPages: 1,
      ordersTotalCount: 0,

      payments: [],
      paymentsCurrentPage: 1,
      paymentsItemsPerPage: 10,
      paymentsTotalPages: 1,
      paymentsTotalCount: 0,

      activeTab: "sales",
      loading: false,
      isEditing: false,
      showDetailModal: false,
      modalData: null,
      modalType: "", // 'sale', 'order', or 'payment'
      showPaymentForSaleModal: false,
      paymentForSale: null,
    };
  },
  computed: {
    totalSalesAmount() {
      return this.sales.reduce((sum, sale) => sum + sale.total, 0);
    },
    totalOrdersAmount() {
      return this.orders.reduce((sum, order) => sum + order.total, 0);
    },
    totalPaymentsAmount() {
      return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    },
  },
  watch: {
    activeTab(newTab) {
      // Cuando la pestaña activa cambia, cargar los datos correspondientes
      switch (newTab) {
        case "sales":
          this.fetchSales(1);
          break;
        case "orders":
          this.fetchOrders(1);
          break;
        case "payments":
          this.fetchPayments(1);
          break;
      }
    },
  },
  methods: {
    async generateClientPDF() {
      this.loading = true;

      try {
        // Crear nueva instancia de PDF
        const pdf = new jsPDF();

        const allSalesResponse = await api.get(
          `/sales/get/sales-by-client/${this.clientId}?page=1&limit=1000`,
        );
        const allSales = allSalesResponse.data.success
          ? allSalesResponse.data.data
          : [];

        // Obtener todos los pagos
        const allPaymentsResponse = await api.get(
          `/client-payments/get/client-payments/${this.clientId}?page=1&limit=1000`,
        );
        const allPayments = allPaymentsResponse.data.success
          ? allPaymentsResponse.data.data.payments
          : [];

        // ===== CALCULAR TOTALES GENERALES =====
        const totalAllSales = allSales.reduce(
          (sum, sale) => sum + sale.total,
          0,
        );
        const totalAllPayments = allPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
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
        pdf.text("RESUMEN DE CLIENTE", pageWidth / 2, 20, { align: "center" });

        // ===== INFORMACIÓN DEL CLIENTE =====
        let currentY = 50;

        // Caja de información del cliente
        pdf.setFillColor(248, 249, 250);
        pdf.rect(15, currentY - 5, pageWidth - 30, 35, "F");
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(15, currentY - 5, pageWidth - 30, 35, "S");

        pdf.setTextColor(25, 55, 88);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("DATOS DEL CLIENTE", 20, currentY + 3);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        // Columna izquierda
        pdf.text(`Cliente: ${this.client.name || "N/A"}`, 20, currentY + 12);
        pdf.text(
          `Dirección: ${this.client.address || "No especificada"}`,
          20,
          currentY + 20,
        );

        // Columna derecha
        pdf.text(
          `Teléfono: ${this.client.phone || "No registrado"}`,
          pageWidth / 2,
          currentY + 12,
        );
        pdf.text(
          `Email: ${this.client.email || "No registrado"}`,
          pageWidth / 2,
          currentY + 20,
        );

        currentY += 40;

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
          { align: "center" },
        );

        currentY += 35;

        // Tarjetas de métricas
        const cardWidth = (pageWidth - 50) / 3;
        const cardHeight = 25;

        // Deuda Total (Roja)
        pdf.setFillColor(231, 76, 60);
        pdf.rect(15, currentY, cardWidth, cardHeight, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("DEUDA TOTAL", 15 + cardWidth / 2, currentY + 8, {
          align: "center",
        });
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(this.client.debt),
          15 + cardWidth / 2,
          currentY + 18,
          { align: "center" },
        );

        // Total Ventas (Verde)
        pdf.setFillColor(39, 174, 96);
        pdf.rect(15 + cardWidth + 10, currentY, cardWidth, cardHeight, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "TOTAL VENTAS",
          15 + cardWidth + 10 + cardWidth / 2,
          currentY + 8,
          { align: "center" },
        );
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(totalAllSales),
          15 + cardWidth + 10 + cardWidth / 2,
          currentY + 18,
          { align: "center" },
        );

        // Total Pagos (Azul)
        pdf.setFillColor(52, 152, 219);
        pdf.rect(
          15 + (cardWidth + 10) * 2,
          currentY,
          cardWidth,
          cardHeight,
          "F",
        );
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "TOTAL PAGOS",
          15 + (cardWidth + 10) * 2 + cardWidth / 2,
          currentY + 8,
          { align: "center" },
        );
        pdf.setFontSize(12);
        pdf.text(
          this.formatNumber(totalAllPayments),
          15 + (cardWidth + 10) * 2 + cardWidth / 2,
          currentY + 18,
          { align: "center" },
        );

        currentY += 40;

        // ===== SECCIÓN VENTAS =====
        if (allSales && allSales.length > 0) {
          // Verificar si necesitamos nueva página
          if (currentY > pageHeight - 80) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.setTextColor(25, 55, 88);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `HISTORIAL COMPLETO DE VENTAS (${allSales.length} registros)`,
            20,
            currentY,
          );
          currentY += 10;

          const salesData = allSales.map((sale, index) => [
            String(index + 1).padStart(3, "0"), // Numeración
            this.formatDate(sale.createdAt),
            this.getProductDetailsDescription(sale.productDetails),
            sale.paymentMethod || "Contado",
            this.formatNumber(sale.total),
          ]);

          pdf.autoTable({
            head: [["#", "Fecha", "Productos", "Pago", "Total", "Estado"]],
            body: salesData,
            startY: currentY,
            theme: "striped",
            headStyles: {
              fillColor: [25, 55, 88],
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
              pdf.setDrawColor(25, 55, 88);
              pdf.setLineWidth(0.5);
              pdf.line(
                15,
                data.pageNumber > 1 ? 15 : currentY - 2,
                pageWidth - 15,
                data.pageNumber > 1 ? 15 : currentY - 2,
              );
            },
          });

          currentY = pdf.lastAutoTable.finalY + 10;

          // Subtotal destacado
          pdf.setFillColor(39, 174, 96);
          pdf.rect(pageWidth - 70, currentY - 5, 55, 12, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `SUBTOTAL: ${this.formatNumber(totalAllSales)}`,
            pageWidth - 17,
            currentY + 2,
            { align: "right" },
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
            currentY,
          );
          currentY += 10;

          const paymentsData = allPayments.map((payment, index) => [
            String(index + 1).padStart(3, "0"),
            this.formatDate(payment.date || payment.createdAt),
            this.formatNumber(payment.amount),
            payment.description || "Pago de cuenta",
            payment.paymentMethod || "Efectivo",
          ]);

          pdf.autoTable({
            head: [["#", "Fecha", "Monto", "Descripción", "Método"]],
            body: paymentsData,
            startY: currentY,
            theme: "striped",
            headStyles: {
              fillColor: [52, 152, 219],
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
              1: { halign: "center", cellWidth: 30 },
              2: { halign: "right", cellWidth: 30 },
              3: { halign: "left", cellWidth: 60 },
              4: { halign: "center", cellWidth: 25 },
            },
            margin: { left: 15, right: 15 },
          });

          currentY = pdf.lastAutoTable.finalY + 10;

          // Subtotal destacado
          pdf.setFillColor(52, 152, 219);
          pdf.rect(pageWidth - 70, currentY - 5, 55, 12, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `SUBTOTAL: ${this.formatNumber(totalAllPayments)}`,
            pageWidth - 17,
            currentY + 2,
            { align: "right" },
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
        pdf.rect(15, currentY, pageWidth - 30, 35, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("BALANCE GENERAL", pageWidth / 2, currentY + 10, {
          align: "center",
        });

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Total Facturado: ${this.formatNumber(totalAllSales)}`,
          pageWidth / 2,
          currentY + 20,
          { align: "center" },
        );
        pdf.text(
          `Total Pagado: ${this.formatNumber(totalAllPayments)}`,
          pageWidth / 2,
          currentY + 27,
          { align: "center" },
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
          pdf.text("Distrify - Gestión & e-commerce ", 20, pageHeight - 12);
          pdf.text(
            `Generado el: ${moment().format("DD/MM/YYYY HH:mm")}`,
            20,
            pageHeight - 7,
          );

          // Numeración de páginas
          pdf.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            pageHeight - 7,
            { align: "right" },
          );
        }

        // ===== GUARDAR ARCHIVO =====
        const fileName = `Resumen_Cliente_${this.client.name.replace(/\s+/g, "_").toUpperCase()}_${moment().format("YYYY-MM-DD_HH-mm")}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error("Error generando PDF completo:", error);
        alert(
          "❌ Error al generar el PDF. Verifique la conexión y vuelva a intentar.",
        );
      } finally {
        this.loading = false;
      }
    },

    async nextPage() {
      this.page = Number(this.page) + 1;
      await this.fetchSales();
    },
    async previousPage() {
      if (this.page > 1) {
        this.page = Number(this.page) - 1;
        await this.fetchSales();
      }
    },
    goBack() {
      this.$emit("close");
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return moment(dateString).format("DD/MM/YYYY HH:mm"); // Incluye la hora para más detalle
    },
    formatNumber(value) {
      return numeral(value).format("$0,0.00"); // Formato de moneda con separador de miles
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
            item.productName ||
            (item.productId && item.productId.name
              ? item.productId.name
              : "Producto");
          return `${name} (x${item.quantity})`;
        })
        .join(", ");
    },
    getProductNameForModal(productItem) {
      return (
        productItem.productName ||
        (productItem.productId &&
        typeof productItem.productId === "object" &&
        productItem.productId.name
          ? productItem.productId.name
          : productItem.name ||
            `Producto ID: ${productItem.productId || "Desconocido"}`)
      );
    },
    editClient() {
      this.isEditing = true;
      this.editableClient = { ...this.client };
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableClient = { ...this.client };
    },
    async saveClientDetails() {
      this.loading = true;
      try {
        const response = await api.patch(
          `/clients/patch/update-client/${this.clientId}`,
          this.editableClient,
        );
        if (response.data.success) {
          this.client = { ...this.client, ...this.editableClient };
          this.isEditing = false;
          alert("Cliente actualizado exitosamente!");
        } else {
          console.error(
            "Error al actualizar el cliente:",
            response.data.message,
          );
          alert("Error al actualizar el cliente: " + response.data.message);
        }
      } catch (error) {
        console.error("Error al guardar detalles del cliente:", error);
        alert("Error al guardar detalles del cliente.");
      } finally {
        this.loading = false;
      }
    },
    async fetchClientDetails() {
      this.loading = true;
      try {
        // Solo obtener los datos básicos del cliente
        const response = await api.get(
          `/clients/get/complete-client/${this.clientId}`,
        );
        const data = response.data;
        if (data.success) {
          this.client = data.data.client;
          this.editableClient = { ...this.client };
        } else {
          console.error(
            "Error al cargar los detalles básicos del cliente:",
            data.message,
          );
        }
      } catch (error) {
        console.error("Error al cargar detalles básicos del cliente:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSales() {
      this.loading = true;
      try {
        const response = await api.get(
          `/sales/get/sales-by-client/${this.clientId}?page=${this.page}&limit=${this.salesItemsPerPage}`,
        );
        const data = response.data;
        if (data.success) {
          this.sales = data.data;
          this.page = data.pagination.page;
          this.salesTotalPages = data.pagination.totalPages;
          this.salesTotalCount = data.pagination.total;
        } else {
          console.error("Error al cargar ventas:", data.message);
          this.sales = [];
          this.salesTotalCount = 0;
          this.salesTotalPages = 1;
        }
      } catch (error) {
        console.error("Error al cargar ventas:", error);
        this.sales = [];
        this.salesTotalCount = 0;
        this.salesTotalPages = 1;
      } finally {
        this.loading = false;
      }
    },
    async fetchOrders(page = 1) {
      this.loading = true;
      try {
        const response = await api.get(
          `/orders/get/get-client-orders/${this.clientId}?page=${page}&limit=${this.ordersItemsPerPage}`,
        );
        const data = response.data;
        if (data.success) {
          this.orders = data.data;
          this.ordersCurrentPage = data.pagination.page;
          this.ordersTotalPages = data.pagination.totalPages;
          this.ordersTotalCount = data.pagination.total;
        } else {
          console.error("Error al cargar pedidos:", data.message);
          this.orders = [];
          this.ordersTotalCount = 0;
          this.ordersTotalPages = 1;
        }
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        this.orders = [];
        this.ordersTotalCount = 0;
        this.ordersTotalPages = 1;
      } finally {
        this.loading = false;
      }
    },
    async fetchPayments(page = 1) {
      this.loading = true;
      try {
        console.log("Pagina:", page);

        const response = await api.get(
          `/client-payments/get/client-payments/${this.clientId}?page=${page}&limit=${this.paymentsItemsPerPage}`,
        );
        const data = response.data;
        if (data.success) {
          this.payments = data.data.payments; // Acceder a la propiedad 'payments' dentro de 'data'
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
      document.body.style.overflow = "hidden"; // Evita el scroll del body
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.modalData = null;
      this.modalType = "";
      document.body.style.overflow = "auto"; // Restaura el scroll del body
    },
    openRegisterPaymentForSale(sale) {
      this.closeDetailModal();
      this.paymentForSale = {
        clientId: this.clientId,
        clientName: this.client.name,
        saleId: sale._id,
      };
      this.showPaymentForSaleModal = true;
    },
    async onPaymentRegistered() {
      this.showPaymentForSaleModal = false;
      this.paymentForSale = null;
      await this.fetchSales(this.salesCurrentPage);
      await this.fetchPayments(this.paymentsCurrentPage);
      await this.fetchClientDetails();
    },
  },
  async mounted() {
    // Cargar solo los detalles básicos del cliente al montar
    await this.fetchClientDetails();
    // Cargar los datos de la pestaña activa por defecto (Ventas)
    await this.fetchSales(1);
    document.body.style.overflow = "hidden"; // Evita el scroll del body cuando el modal principal está abierto
  },
  beforeUnmount() {
    document.body.style.overflow = "auto"; // Restaura el scroll del body al cerrar el modal principal
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

.multiple-payments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.payment-header i {
  color: #f59e0b;
  font-size: 0.875rem;
}

.multiple-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.payment-badge.single {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.payment-badge.multiple {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.payment-amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid #a7f3d0;
}

/* Estilos base para el overlay de pantalla completa */
.client-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* Fondo oscuro semi-transparente */
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

/* Contenedor principal de los detalles del cliente */
.client-details-container {
  background-color: #f9fafb; /* Color de fondo del primer ejemplo */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100vh; /* Ocupa toda la altura de la ventana */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Para que el contenido de las pestañas se desplace internamente */
  color: #1f2937; /* Color de texto principal del primer ejemplo */
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
}

/* Encabezado de los detalles del cliente */
.client-details-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb; /* Borde del primer ejemplo */
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  justify-content: space-between; /* Para alinear el botón de editar a la derecha */
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #4b5563; /* Color de texto secundario */
  font-size: 0.875rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  margin-right: 15px;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #e5e7eb; /* Hover del primer ejemplo */
  color: #1f2937;
}

.back-button i {
  margin-right: 8px;
}

.client-details-header h2 {
  color: #f9931e; /* Color principal del primer ejemplo */
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  flex-grow: 1; /* Permite que el título ocupe el espacio restante */
  text-align: center; /* Centra el título */
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

.client-info {
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
  color: #6b7280; /* Color de etiquetas */
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.value {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 500;
}

.value a {
  color: #f9931e; /* Enlaces con color principal */
  text-decoration: none;
}

.value a:hover {
  text-decoration: underline;
}

.debt .value {
  color: #ef4444; /* Rojo para deuda */
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
  grid-column: 1 / -1; /* Ocupa todo el ancho en el grid */
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
  font-weight: 600;
  transition: background-color 0.2s;
}

.save-button {
  background-color: #10b981; /* Verde */
  color: white;
  border: none;
}

.save-button:hover {
  background-color: #0e9f7e;
}

.cancel-button {
  background-color: #ef4444; /* Rojo */
  color: white;
  border: none;
}

.cancel-button:hover {
  background-color: #d93a3a;
}

/* Estilos para navegación por pestañas */
.tabs-navigation {
  display: flex;
  background-color: #f3f4f6; /* Fondo de pestañas */
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
  white-space: nowrap;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  position: relative;
}

.tab-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.tab-button.active {
  color: #f9931e; /* Color principal para pestaña activa */
  background-color: white;
  border-bottom-color: #f9931e;
}

.tab-count {
  background-color: #d1d5db; /* Gris para el contador */
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
  overflow-y: auto; /* Permite el scroll dentro del contenido de la pestaña */
  padding: 20px;
}

.tab-section {
  height: 100%; /* Asegura que la sección ocupe el espacio disponible para el scroll */
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
  background-color: rgba(254, 226, 226, 0.2); /* Rojo claro */
  color: #ef4444; /* Rojo */
}

.purchase-badge {
  background-color: rgba(209, 250, 229, 0.2); /* Verde claro */
  color: #10b981; /* Verde */
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
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1001; /* Mayor que el overlay principal */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.detail-modal-content {
  background-color: white;
  border-radius: 1.25rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1.25rem 1.25rem 0 0;
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
  .client-details-container {
    border-radius: 0;
  }
  .client-info {
    grid-template-columns: 1fr;
  }
  .tabs-navigation {
    flex-direction: row; /* Mantener en fila para móviles */
    justify-content: space-around;
  }
  .tab-button {
    justify-content: center;
    padding: 12px 15px;
    flex-grow: 1; /* Para que ocupen el espacio disponible */
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
  .client-details-header h2 {
    order: -1; /* Mueve el título arriba */
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
  .client-details-header h2 {
    font-size: 1.2rem;
  }
  .pagination-controls {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
