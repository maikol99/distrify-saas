<template>
  <div
    class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen selection:bg-primary selection:text-white"
  >
    <!-- Header / Nav -->
    <header
      class="fixed top-0 w-full z-50 glass border-b border-slate-200 dark:border-slate-800 animate-fade-in-down"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <div
          class="flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer"
          @click="scrollToSection('hero')"
        >
          <img
            src="/alevia-logo.png"
            alt="Alevia Pay"
            class="h-11 w-auto object-contain"
          />
        </div>

        <nav class="hidden lg:flex items-center gap-10">
          <a
            class="text-base font-bold hover:text-primary transition-all hover:-translate-y-0.5 cursor-pointer"
            @click="scrollToSection('features')"
            >Características</a
          >
          <a
            class="text-base font-bold hover:text-primary transition-all hover:-translate-y-0.5 cursor-pointer"
            @click="scrollToSection('metrics')"
            >Métricas</a
          >
          <a
            class="text-base font-bold hover:text-primary transition-all hover:-translate-y-0.5 cursor-pointer"
            @click="scrollToSection('pricing')"
            >Precios</a
          >
          <a
            class="text-base font-bold hover:text-primary transition-all hover:-translate-y-0.5 cursor-pointer"
            @click="scrollToSection('about')"
            >Nosotros</a
          >
        </nav>

        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 mr-2"
            aria-label="Cambiar tema"
          >
            <span
              v-if="isDark"
              class="material-symbols-outlined text-yellow-400 rotate-90 transition-transform duration-500"
              >light_mode</span
            >
            <span
              v-else
              class="material-symbols-outlined text-slate-600 rotate-0 transition-transform duration-500"
              >dark_mode</span
            >
          </button>

          <!-- Desktop buttons -->
          <a
            href="/iniciar-sesion"
            class="hidden lg:block px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            >Iniciar Sesión</a
          >
          <a
            href="/registro"
            class="hidden lg:block px-5 py-2 text-sm font-bold bg-primary text-white rounded-full hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >Registrarse gratis</a
          >

          <!-- Mobile hamburger -->
          <button
            @click="toggleMenu"
            class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Menú"
          >
            <span class="material-symbols-outlined text-slate-700 dark:text-slate-300">
              {{ menuOpen ? 'close' : 'menu' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile menu dropdown -->
      <div
        v-if="menuOpen"
        class="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 flex flex-col gap-1 animate-fade-in-down"
      >
        <a class="py-3 text-base font-bold hover:text-primary transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800" @click="scrollToSection('features')">Características</a>
        <a class="py-3 text-base font-bold hover:text-primary transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800" @click="scrollToSection('metrics')">Métricas</a>
        <a class="py-3 text-base font-bold hover:text-primary transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800" @click="scrollToSection('pricing')">Precios</a>
        <a class="py-3 text-base font-bold hover:text-primary transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800" @click="scrollToSection('about')">Nosotros</a>
        <div class="flex gap-3 pt-3">
          <a href="/iniciar-sesion" class="flex-1 py-2.5 text-sm font-bold text-center border border-slate-200 dark:border-slate-700 rounded-full hover:text-primary hover:border-primary transition-colors">Iniciar Sesión</a>
          <a href="/registro" class="flex-1 py-2.5 text-sm font-bold text-center bg-primary text-white rounded-full hover:brightness-110 active:scale-95 transition-all">Registrarse</a>
        </div>
      </div>
    </header>

    <main class="pt-16">
      <!-- Hero Section -->
      <section id="hero" class="hero-section relative overflow-hidden bg-[#0c0a09] text-white pt-10 pb-20">
        <!-- Background ambient glow effects -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[180px] animate-pulse-slow"></div>
          <div class="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[160px]"></div>
          <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[160px]"></div>
          <div class="absolute inset-0 hero-grid-bg opacity-[0.04]"></div>
        </div>

        <div class="max-w-7xl mx-auto px-6 w-full relative z-10">
          
          <!-- TOP HERO LAYOUT: LEFT TEXT & CENTER/RIGHT MOCKUP COMPOSITION -->
          <div class="grid lg:grid-cols-12 gap-8 items-start mb-16">

            <!-- LEFT COLUMN (Span 5) -->
            <div class="lg:col-span-5 pt-4 animate-slide-up">
              <!-- Demo Badge -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>Demo gratis · Sin tarjeta · Activo en minutos</span>
              </div>

              <!-- Headline -->
              <h1 class="text-4xl sm:text-5xl lg:text-[2.8rem] xl:text-[3.2rem] font-black leading-[1.12] mb-6 tracking-tight">
                Cobrá más rápido<br/>
                y controlá tu negocio.<br/>
                <span class="bg-gradient-to-r from-orange-400 via-primary to-amber-500 bg-clip-text text-transparent">
                  Gestión por voz<br/>
                  en una sola pantalla.
                </span>
              </h1>

              <!-- Subtitle -->
              <p class="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                POS, inventario, caja y delivery para negocios de Argentina.
                Implementación rápida, soporte humano y ventas ordenadas desde el primer día.
              </p>

              <!-- CTAs -->
              <div class="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="/registro"
                  class="px-7 py-3.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Probar gratis →
                </a>
                <a
                  @click="scrollToSection('pricing')"
                  class="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold rounded-xl cursor-pointer border border-slate-800 backdrop-blur-md transition-all"
                >
                  Ver precios
                </a>
              </div>

              <!-- Feature mini-badges -->
              <div class="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400 mb-10">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">credit_card_off</span>
                  Sin tarjeta
                </span>
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">sync_alt</span>
                  Migración asistida
                </span>
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">headset_mic</span>
                  Soporte humano
                </span>
              </div>

              <!-- Scanner Mockup Card (Bottom Left) -->
              <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 max-w-sm backdrop-blur-md shadow-2xl">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <span class="material-symbols-outlined text-orange-400 text-base">barcode_scanner</span>
                    Escáner de productos
                  </div>
                  <span class="flex items-center gap-1.5 text-[10px] text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                    Cámara activa
                  </span>
                </div>
                <!-- Scanner viewport mockup -->
                <div class="relative h-20 bg-slate-950 rounded-xl overflow-hidden mb-3 border border-slate-800/60 flex items-center justify-center">
                  <!-- Product Image / Mock -->
                  <div class="absolute inset-0 bg-cover bg-center opacity-40 filter blur-[1px]" style="background-image: url('https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80')"></div>
                  <!-- Laser Line -->
                  <div class="absolute inset-x-0 top-1/2 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                </div>
                <!-- Scanned Result -->
                <div class="flex items-center justify-between bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&q=80" class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p class="text-xs font-bold text-white">Coca Cola 2.25L</p>
                      <p class="text-[11px] font-black text-orange-400">$ 1.200 <span class="text-[9px] font-normal text-slate-400 ml-1">Stock: 14 unidades</span></p>
                    </div>
                  </div>
                  <div class="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                    <span class="material-symbols-outlined text-sm font-black">check</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- RIGHT COLUMN: RICH DASHBOARD & FLOATING COMPONENTS (Span 7) -->
            <div class="lg:col-span-7 relative">
              
              <!-- GRID CONTAINING MAIN DASHBOARD & FLOATING CARDS -->
              <div class="grid grid-cols-12 gap-3 relative">
                
                <!-- MAIN DASHBOARD (Span 9) -->
                <div class="col-span-12 xl:col-span-9 bg-[#12100e] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                  <!-- Header bar -->
                  <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50">
                    <div class="flex items-center gap-2">
                      <div class="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                        <span class="text-white text-[9px] font-black">A</span>
                      </div>
                      <span class="text-xs font-bold text-slate-300">alevia pay</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium">Resumen de hoy</span>
                    <div class="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                      <span>Hoy</span>
                      <span class="material-symbols-outlined text-xs">expand_more</span>
                    </div>
                  </div>

                  <div class="flex">
                    <!-- Mini Sidebar -->
                    <div class="w-24 bg-slate-950/60 border-r border-slate-800/60 py-3 flex flex-col gap-1 text-[10px]">
                      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary border-l-2 border-primary font-bold">
                        <span class="material-symbols-outlined text-xs">home</span>
                        <span>Inicio</span>
                      </div>
                      <div v-for="nav in ['Ventas','Productos','Clientes','Inventario','Caja','Reportes','Delivery','Promociones','Configuración']" :key="nav"
                           class="flex items-center gap-1.5 px-3 py-1 text-slate-400 hover:text-slate-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                        <span>{{nav}}</span>
                      </div>
                    </div>

                    <!-- Dashboard Core View -->
                    <div class="flex-1 p-3.5 space-y-3">
                      <!-- 4 KPI Cards Row -->
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div class="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2">
                          <p class="text-[9px] text-slate-400">Ventas de hoy</p>
                          <p class="text-xs font-black text-white mt-0.5">$ 45.230</p>
                          <p class="text-[8px] text-green-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 12,5%</span> <span class="text-slate-500 font-normal">vs ayer</span>
                          </p>
                        </div>
                        <div class="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2">
                          <p class="text-[9px] text-slate-400">Ganancia neta</p>
                          <p class="text-xs font-black text-white mt-0.5">$ 12.750</p>
                          <p class="text-[8px] text-green-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 8,7%</span> <span class="text-slate-500 font-normal">vs ayer</span>
                          </p>
                        </div>
                        <div class="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2">
                          <p class="text-[9px] text-slate-400">Transacciones</p>
                          <p class="text-xs font-black text-white mt-0.5">128</p>
                          <p class="text-[8px] text-green-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 15%</span> <span class="text-slate-500 font-normal">vs ayer</span>
                          </p>
                        </div>
                        <div class="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2">
                          <p class="text-[9px] text-slate-400">Ticket promedio</p>
                          <p class="text-xs font-black text-white mt-0.5">$ 353</p>
                          <p class="text-[8px] text-green-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 6,3%</span> <span class="text-slate-500 font-normal">vs ayer</span>
                          </p>
                        </div>
                      </div>

                      <!-- Charts Grid -->
                      <div class="grid grid-cols-5 gap-2">
                        <!-- Line Chart -->
                        <div class="col-span-3 bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
                          <p class="text-[9px] font-bold text-slate-300 mb-2">Ventas de los últimos 7 días</p>
                          <div class="h-20 w-full relative">
                            <svg viewBox="0 0 200 70" class="w-full h-full" preserveAspectRatio="none">
                              <line x1="0" y1="15" x2="200" y2="15" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="2,2"/>
                              <line x1="0" y1="35" x2="200" y2="35" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="2,2"/>
                              <line x1="0" y1="55" x2="200" y2="55" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="2,2"/>
                              <defs>
                                <linearGradient id="heroGradMain" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stop-color="#f97316" stop-opacity="0.4"/>
                                  <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                                </linearGradient>
                              </defs>
                              <polygon points="0,55 33,48 66,42 100,28 133,35 166,20 200,12 200,70 0,70" fill="url(#heroGradMain)"/>
                              <polyline points="0,55 33,48 66,42 100,28 133,35 166,20 200,12" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
                              <circle cx="200" cy="12" r="2.5" fill="#f97316"/>
                            </svg>
                            <div class="flex justify-between mt-1 px-1 text-[8px] text-slate-500">
                              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                            </div>
                          </div>
                        </div>

                        <!-- Donut Chart -->
                        <div class="col-span-2 bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
                          <p class="text-[9px] font-bold text-slate-300 mb-2">Ventas por categoría</p>
                          <div class="flex items-center gap-1.5">
                            <svg viewBox="0 0 36 36" class="w-14 h-14 shrink-0">
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f97316" stroke-width="4" stroke-dasharray="40 60" stroke-dashoffset="25" transform="rotate(-90 18 18)"/>
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-dasharray="30 70" stroke-dashoffset="-15" transform="rotate(-90 18 18)"/>
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22d3ee" stroke-width="4" stroke-dasharray="20 80" stroke-dashoffset="-45" transform="rotate(-90 18 18)"/>
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#a78bfa" stroke-width="4" stroke-dasharray="10 90" stroke-dashoffset="-65" transform="rotate(-90 18 18)"/>
                            </svg>
                            <div class="space-y-0.5 text-[7px] text-slate-400">
                              <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-primary"></div><span>Bebidas 40%</span></div>
                              <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div><span>Almacén 30%</span></div>
                              <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-cyan-400"></div><span>Limpieza 20%</span></div>
                              <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-violet-400"></div><span>Otros 10%</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <!-- RIGHT FLOATING COLUMN (Span 3) -->
                <div class="col-span-12 xl:col-span-3 space-y-3">
                  <!-- Stock Bajo Card -->
                  <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-md">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">warning</span> Stock bajo
                      </span>
                    </div>
                    <div class="space-y-2 text-[11px]">
                      <div class="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
                        <div class="flex items-center gap-2">
                          <span class="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px]">🥛</span>
                          <span class="font-medium text-white">Leche Entera</span>
                        </div>
                        <span class="text-red-400 font-bold text-[10px]">8 unidades</span>
                      </div>
                      <div class="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
                        <div class="flex items-center gap-2">
                          <span class="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px]">🌿</span>
                          <span class="font-medium text-white">Yerba Mate</span>
                        </div>
                        <span class="text-red-400 font-bold text-[10px]">5 unidades</span>
                      </div>
                    </div>
                    <button class="w-full mt-2 py-1 text-[10px] text-slate-400 hover:text-white text-center font-bold">Ver todos</button>
                  </div>

                  <!-- Realtime Sale Alert Badge -->
                  <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 flex items-center justify-between backdrop-blur-md shadow-xl">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm font-bold">check_circle</span>
                      </span>
                      <div>
                        <p class="text-xs font-bold text-white">Venta realizada</p>
                        <p class="text-[9px] text-slate-400">Ahora</p>
                      </div>
                    </div>
                    <span class="text-sm font-black text-green-400">+$4.500</span>
                  </div>

                  <!-- Delivery Widget -->
                  <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-md">
                    <div class="flex items-center justify-between mb-2 text-xs font-bold text-slate-300">
                      <span>Delivery activo</span>
                      <span class="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                    <!-- Map Graphic representation -->
                    <div class="relative h-20 bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden p-2 flex items-center justify-center mb-2">
                      <svg class="w-full h-full text-slate-800" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 100 50">
                        <path d="M10,40 Q30,10 50,30 T90,10" stroke="#f97316" stroke-width="2" stroke-dasharray="3,3"/>
                        <circle cx="90" cy="10" r="4" fill="#f97316"/>
                      </svg>
                      <div class="absolute bottom-2 left-2 text-orange-400 font-bold text-[9px] bg-slate-900/80 px-2 py-0.5 rounded border border-orange-500/30 flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">two_wheeler</span> En camino
                      </div>
                    </div>
                    <div class="flex justify-between items-center text-[10px]">
                      <span class="text-slate-400 font-medium">Pedido #58</span>
                      <span class="text-orange-400 font-bold">12 min</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- LOWER ROW FLOATING WIDGETS (Voice, Receipt Ticket, Checkout Terminal) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                
                <!-- Voice Assistant Widget -->
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between">
                  <div class="flex items-center gap-2 text-xs font-bold text-orange-400 mb-3">
                    <span class="material-symbols-outlined text-sm">graphic_eq</span> Voz activa
                  </div>
                  <div class="flex items-center gap-3 my-2">
                    <div class="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30 shrink-0">
                      <span class="material-symbols-outlined text-xl">mic</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-white">"Vendé una Coca Cola"</p>
                      <p class="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-0.5">
                        <span class="material-symbols-outlined text-xs">check_circle</span> Producto agregado
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Printable Receipt Ticket Widget -->
                <div class="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 text-xs font-bold">
                    <span class="flex items-center gap-1 text-slate-700">
                      <span class="material-symbols-outlined text-sm">print</span> Ticket de venta
                    </span>
                    <span class="text-[9px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded">Impresora conectada</span>
                  </div>
                  <div class="space-y-1 text-[11px] font-mono">
                    <div class="flex justify-between"><span class="text-slate-600">Coca Cola 2.25L</span><span class="font-bold">$1.200</span></div>
                    <div class="flex justify-between"><span class="text-slate-600">Pan Lactal</span><span class="font-bold">$850</span></div>
                    <div class="flex justify-between"><span class="text-slate-600">Leche Entera</span><span class="font-bold">$1.500</span></div>
                  </div>
                  <div class="flex justify-between items-center border-t border-slate-200 pt-2 mt-2 font-black text-sm">
                    <span>TOTAL</span>
                    <span class="text-base text-slate-900">$3.550</span>
                  </div>
                  <!-- Fake Barcode -->
                  <div class="mt-2 h-6 bg-slate-100 rounded flex items-center justify-center gap-0.5 px-2 opacity-80">
                    <div v-for="n in 24" :key="n" class="h-4 bg-slate-800" :style="{ width: (n % 3 === 0 ? '3px' : '1px') }"></div>
                  </div>
                </div>

                <!-- Payment Cobro Terminal Widget -->
                <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Cobro</span>
                    </div>
                    <p class="text-[10px] text-slate-400">Total a cobrar</p>
                    <p class="text-2xl font-black text-white mb-3">$ 3.550</p>
                    
                    <!-- Payment Methods Icons -->
                    <div class="grid grid-cols-3 gap-1.5 mb-3 text-[10px] font-medium text-slate-300 text-center">
                      <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60 flex flex-col items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-green-400">payments</span> Efectivo
                      </div>
                      <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60 flex flex-col items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-blue-400">credit_card</span> Tarjeta
                      </div>
                      <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60 flex flex-col items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-purple-400">qr_code_2</span> QR
                      </div>
                    </div>
                  </div>

                  <div class="w-full py-2 bg-green-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-green-600/20">
                    Pago aprobado
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- SOCIAL PROOF & TESTIMONIAL BAR (BOTTOM CENTER) -->
          <div class="flex flex-wrap items-center justify-center gap-4 py-6 border-t border-slate-900">
            <div class="flex items-center gap-1 text-amber-400 text-sm">
              ★★★★★
            </div>
            <span class="text-xs font-medium text-slate-300">
              Más de 1.000 negocios confían en Alevia Pay
            </span>
            <div class="flex items-center -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" class="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" class="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" class="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" class="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" />
              <span class="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">+120</span>
            </div>
          </div>

        </div>
      </section>

      <!-- Features Section -->
      <section class="py-24 bg-white dark:bg-slate-950" id="features">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="reveal">
              <h2 class="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Gestiona tu negocio <br /><span class="text-primary"
                  >con la voz</span
                >
              </h2>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-12">
                Experimenta el futuro de la gestión empresarial. Controla el
                inventario, genera reportes de ventas y monitorea el rendimiento
                usando solo tu voz.
              </p>
              <div class="space-y-8">
                <div
                  v-for="(feature, idx) in [
                    {
                      icon: 'inventory_2',
                      title: 'Control de Inventario',
                      desc: 'Actualizaciones de stock en tiempo real mediante voz. Pregunta &quot;¿Cuántas unidades quedan de X?&quot; y obtén respuestas al instante.',
                    },
                    {
                      icon: 'monitoring',
                      title: 'Reportes de Ventas',
                      desc: 'Obtén información detallada sin usar las manos. &quot;Compara los ingresos de este mes con los del año pasado&quot; procesado en segundos.',
                    },
                    {
                      icon: 'record_voice_over',
                      title: 'Comandos de Voz',
                      desc: 'Procesamiento de lenguaje natural para todas las tareas. Desde la programación del personal hasta el cumplimiento de pedidos.',
                    },
                  ]"
                  :key="idx"
                  class="flex gap-6 group"
                >
                  <div
                    class="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:rotate-6"
                  >
                    <span class="material-symbols-outlined text-3xl">{{
                      feature.icon
                    }}</span>
                  </div>
                  <div
                    class="group-hover:translate-x-2 transition-transform duration-300"
                  >
                    <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
                    <p class="text-slate-600 dark:text-slate-400">
                      {{ feature.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="relative reveal delay-150">
              <div
                class="aspect-square rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden group"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                >
                  <div
                    class="w-64 h-64 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center relative scale-in"
                  >
                    <div
                      class="absolute inset-0 rounded-full border-4 border-primary border-dashed animate-[spin_10s_linear_infinite]"
                    ></div>
                    <span
                      class="material-symbols-outlined text-6xl text-primary animate-pulse"
                      >mic</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Metrics Section -->
      <section
        class="py-24 bg-background-light dark:bg-background-dark"
        id="metrics"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16 reveal">
            <h2 class="text-4xl font-black mb-4">
              Impacto Empresarial Probado
            </h2>
            <p class="text-slate-600 dark:text-slate-400">
              Nuestros clientes reportan ganancias masivas dentro de los
              primeros 30 días de implementación.
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="(metric, idx) in [
                {
                  icon: 'rocket_launch',
                  label: 'Eficiencia',
                  value: '+40%',
                  diff: '+12% vs mes pasado',
                  color: 'primary',
                },
                {
                  icon: 'schedule',
                  label: 'Tiempo de Gestión',
                  value: '-65%',
                  diff: '-15% carga total',
                  color: 'secondary',
                },
                {
                  icon: 'favorite',
                  label: 'Satisfacción',
                  value: '99%',
                  diff: '+5% puntuación CSAT',
                  color: 'primary',
                },
              ]"
              :key="idx"
              class="p-10 rounded-3xl glass border border-primary/20 text-center group transition-all duration-500 cursor-default reveal"
              :class="'delay-' + idx * 150"
            >
              <div
                :class="'text-' + metric.color"
                class="group-hover:text-white mb-6 group-hover:-translate-y-2 transition-all duration-500"
              >
                <span class="material-symbols-outlined text-5xl">{{
                  metric.icon
                }}</span>
              </div>
              <p
                class="text-slate-600 dark:text-slate-400 group-hover:text-white/80 font-medium mb-2"
              >
                {{ metric.label }}
              </p>
              <h4
                class="text-6xl font-black text-slate-900 dark:text-slate-100 group-hover:text-white tracking-tighter mb-4"
              >
                {{ metric.value }}
              </h4>
              <div
                class="inline-flex items-center gap-1 text-green-500 group-hover:text-white font-bold bg-green-500/10 group-hover:bg-white/20 px-3 py-1 rounded-full text-sm"
              >
                <span class="material-symbols-outlined text-sm"
                  >trending_up</span
                >
                {{ metric.diff }}
              </div>
              <!-- Hover background -->
              <div
                :class="'bg-' + metric.color"
                class="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="py-24 bg-white dark:bg-slate-950" id="pricing">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16 reveal">
            <h2 class="text-4xl font-black mb-4">
              Planes Adaptados a tu Negocio
            </h2>
            <p class="text-slate-600 dark:text-slate-400">
              Elige el plan perfecto para tu empresa y escala cuando lo
              necesites.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Gratuito -->
            <div
              class="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col hover:-translate-y-3 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 reveal"
            >
              <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">Gratuito</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Perfecto para empezar.</p>
              <div class="text-4xl font-black mb-8 text-slate-900 dark:text-white">
                $0<span class="text-lg font-normal text-slate-500 dark:text-slate-400">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Hasta 20 productos en inventario
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Categorías y proveedores
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Ventas e historial de ventas
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  1 usuario
                </li>
              </ul>
              <a
                href="/registro"
                class="w-full py-3.5 text-center bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm"
                >Empezar gratis</a
              >
            </div>
            <!-- Básico -->
            <div
              class="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col hover:-translate-y-3 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 reveal delay-100"
            >
              <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">Básico</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Para pequeños negocios.</p>
              <div class="text-4xl font-black mb-8 text-slate-900 dark:text-white">
                $20.000<span class="text-lg font-normal text-slate-500 dark:text-slate-400">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Todo lo del plan Gratuito
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Egresos e ingresos
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  2 usuarios
                </li>
              </ul>
              <a
                href="/registro"
                class="w-full py-3.5 text-center bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm"
                >Crear cuenta</a
              >
            </div>
            <!-- Medio -->
            <div
              class="p-8 rounded-3xl bg-slate-900 text-white flex flex-col relative ring-4 ring-primary ring-offset-4 ring-offset-white dark:ring-offset-slate-950 hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 reveal delay-200 scale-105 z-10 shadow-2xl"
            >
              <div
                class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg animate-bounce-slow"
              >
                Más Popular
              </div>
              <h3 class="text-xl font-bold mb-2">Medio</h3>
              <p class="text-slate-400 text-sm mb-6">En crecimiento.</p>
              <div class="text-4xl font-black mb-8">
                $35.000<span class="text-lg font-normal text-slate-400">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
                  Todo lo del plan Básico
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
                  Tienda virtual
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
                  Sistema de caja
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
                  Hasta 3 usuarios
                </li>
              </ul>
              <a
                href="/registro"
                class="w-full py-3.5 text-center bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25"
                >Crear cuenta</a
              >
            </div>
            <!-- Plan IA -->
            <div
              class="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col hover:-translate-y-3 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 reveal delay-300 relative overflow-hidden"
            >
              <div
                class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg"
              >
                ✦ Con IA
              </div>
              <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">Plan IA</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Todo el poder de la inteligencia artificial.</p>
              <div class="text-4xl font-black mb-8 text-slate-900 dark:text-white">
                $55.000<span class="text-lg font-normal text-slate-500 dark:text-slate-400">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Todo lo del plan Medio
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Múltiples sucursales
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Usuarios ilimitados
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span class="material-symbols-outlined text-violet-500 text-lg">smart_toy</span>
                  Asistente IA incluido
                </li>
              </ul>
              <a
                href="https://wa.me/5493534296008"
                target="_blank"
                class="w-full py-3.5 text-center bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm"
                >Solicitar acceso</a
              >
            </div>
          </div>
        </div>
      </section>

      <!-- About Us Section -->
      <section
        class="py-24 bg-background-light dark:bg-background-dark"
        id="about"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl mx-auto text-center reveal">
            <h2 class="text-4xl font-black mb-8">Nuestra Misión</h2>
            <p
              class="text-xl leading-relaxed text-slate-600 dark:text-slate-400"
            >
              En Alevia Pay, creemos que gestionar un negocio debería ser tan
              natural como tener una conversación. Nuestro equipo de
              investigadores de IA y expertos en logística empresarial pasó años
              desarrollando nuestro núcleo de voz, diseñado para eliminar la
              fricción entre la toma de decisiones y al ingreso de datos.
            </p>
            <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div
                v-for="(stat, idx) in [
                  { val: '2022', label: 'Fundado' },
                  { val: '+50', label: 'Usuarios Activos' },
                  { val: '15+', label: 'Modulos' },
                  { val: '99.9%', label: 'Uptime' },
                ]"
                :key="idx"
                class="reveal"
                :class="'delay-' + idx * 100"
              >
                <p
                  class="text-3xl font-black text-primary hover:scale-110 transition-transform cursor-default"
                >
                  {{ stat.val }}
                </p>
                <p
                  class="text-xs uppercase tracking-widest font-bold text-slate-500 mt-2"
                >
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section / Contact -->
      <section id="contact" class="py-20 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-6">
          <div
            class="bg-primary rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden reveal"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"
            ></div>
            <div class="relative z-10">
              <h2 class="text-4xl md:text-6xl font-black text-white mb-8">
                ¿Listo para hablar con tu negocio?
              </h2>
              <p
                class="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12"
              >
                Únete a más de 200 negocios que crecen más rápido con Alevia Pay
                Voice Management.
              </p>

              <form
                @submit.prevent="submitForm"
                class="max-w-md mx-auto space-y-4"
              >
                <div class="reveal delay-100">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    class="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/60 focus:bg-white/20 transition-all outline-none"
                  />
                </div>
                <div class="reveal delay-200">
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Email de contacto"
                    required
                    class="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/60 focus:bg-white/20 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  class="w-full px-10 py-5 bg-white text-primary font-black rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-xl reveal delay-300"
                >
                  Obtener Acceso Ahora
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer
        class="bg-background-light dark:bg-background-dark pt-16 pb-10 border-t border-slate-200 dark:border-slate-800"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            <!-- Brand Column -->
            <div class="lg:col-span-2 reveal">
              <div class="flex items-center gap-2 mb-4">
                <img
                  src="/alevia-logo.png"
                  alt="Alevia Pay"
                  class="h-10 w-auto object-contain"
                />
              </div>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                El primer ecosistema de gestión empresarial nativo por voz
                potenciado por IA de próxima generación.
              </p>
              <div class="flex items-center gap-3">
                <a href="https://wa.me/5493534296008" target="_blank" class="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-lg">chat</span>
                </a>
                <a href="mailto:contacto@aleviapay.com" class="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-lg">mail</span>
                </a>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="reveal delay-100">
              <h4 class="font-bold text-slate-900 dark:text-white mb-4 text-sm tracking-wide">Navegación</h4>
              <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a
                    class="hover:text-primary transition-colors cursor-pointer"
                    @click="scrollToSection('features')"
                    >Características</a
                  >
                </li>
                <li>
                  <a
                    class="hover:text-primary transition-colors cursor-pointer"
                    @click="scrollToSection('metrics')"
                    >Métricas</a
                  >
                </li>
                <li>
                  <a
                    class="hover:text-primary transition-colors cursor-pointer"
                    @click="scrollToSection('pricing')"
                    >Precios</a
                  >
                </li>
                <li>
                  <a
                    class="hover:text-primary transition-colors cursor-pointer"
                    @click="scrollToSection('about')"
                    >Nosotros</a
                  >
                </li>
              </ul>
            </div>

            <!-- Portal Links -->
            <div class="reveal delay-150">
              <h4 class="font-bold text-slate-900 dark:text-white mb-4 text-sm tracking-wide">Acceso</h4>
              <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a href="/iniciar-sesion" class="hover:text-primary transition-colors">Iniciar Sesión</a>
                </li>
                <li>
                  <a href="/registro" class="hover:text-primary transition-colors">Registrarse Gratis</a>
                </li>
                <li>
                  <a href="https://wa.me/5493534296008" target="_blank" class="hover:text-primary transition-colors">Soporte por WhatsApp</a>
                </li>
              </ul>
            </div>

            <!-- Developed by Column -->
            <div class="reveal delay-200">
              <h4 class="font-bold text-slate-900 dark:text-white mb-4 text-sm tracking-wide">Desarrollado por</h4>
              <a
                href="https://cuyocode.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 group p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 transition-all"
              >
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    Cuyo Code
                  </p>
                  <p class="text-[11px] text-slate-500">cuyocode.com.ar</p>
                </div>
                <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-base transition-colors ml-1">open_in_new</span>
              </a>
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div
            class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 reveal"
          >
            <p>
              © {{ new Date().getFullYear() }} Alevia Pay. Todos los derechos reservados.
            </p>
            <FooterCreditComponent />
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script>
import FooterCreditComponent from "@/components/visuals/FooterCreditComponent.vue";

export default {
  name: "AleviaLanding",
  components: {
    FooterCreditComponent,
  },
  data() {
    return {
      menuOpen: false,
      isDark: false,
      form: {
        name: "",
        email: "",
        phone: "",
        interest: "",
      },
      testimonials: [
        {
          content:
            "Alevia Pay transformó completamente la forma en que administramos nuestro negocio. Ahora tenemos todo bajo control y nuestras ventas han aumentado un 30%.",
          name: "Carlos Rodríguez",
          position: "Gerente",
          company: "Electro Store",
        },
        {
          content:
            "La integración de voz con nuestro inventario físico nos ha permitido operar con una rapidez que no creíamos posible. Es como magia.",
          name: "María González",
          position: "Propietaria",
          company: "Boutique Elegance",
        },
        {
          content:
            "Los reportes por voz me ahorran horas frente a la computadora. Puedo revisar la salud de mi negocio mientras camino por el local.",
          name: "Javier Méndez",
          position: "Director",
          company: "Distribuidora Central",
        },
      ],
    };
  },
  mounted() {
    // Sync theme on mount
    this.isDark = document.documentElement.classList.contains("dark");

    // Initial entrance animations
    document.querySelectorAll(".animate-slide-up").forEach((el, i) => {
      el.style.animationDelay = `${i * 100}ms`;
    });

    // Reveal on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Optional: unobserve after reveal
          // revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".reveal")
      .forEach((el) => revealObserver.observe(el));
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    submitForm() {
      alert(
        "¡Gracias por tu interés! Te contactaremos pronto para darte acceso.",
      );
      this.form = {
        name: "",
        email: "",
        phone: "",
        interest: "",
      };
    },
    scrollToSection(sectionId) {
      this.menuOpen = false;
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 64; // h-16
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    },
  },
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   HERO SECTION — KioscoApp-style dark hero with warm palette
   ═══════════════════════════════════════════════════════════════ */
.hero-section {
  background: #23190f;
  position: relative;
}

.hero-grid-bg {
  background-image:
    linear-gradient(rgba(255, 153, 51, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 153, 51, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-bar {
  background: linear-gradient(to top, #ff9933, #ffb366);
  border-radius: 2px;
}

.hero-card {
  background: rgba(26, 18, 9, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hero-card-main {
  animation: heroFloat 6s ease-in-out infinite;
}

.hero-ticket-card {
  animation: heroFloat 6s ease-in-out infinite;
  animation-delay: 1.5s;
}

.hero-alert-card {
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.hero-alert-card:hover {
  transform: translateX(6px);
  border-color: rgba(255, 153, 51, 0.25);
}

.hero-voice-badge {
  animation: heroFloat 4s ease-in-out infinite;
  animation-delay: 3s;
}

.hero-cta-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 153, 51, 0.35);
}

.hero-cta-primary:active {
  transform: scale(0.97);
}

.hero-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.hero-cta-secondary:active {
  transform: scale(0.97);
}

@keyframes heroFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ═══════════════════════════════════════════════════════════════
   GLASS (rest of the page)
   ═══════════════════════════════════════════════════════════════ */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass {
  background: rgba(35, 25, 15, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Keyframe Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes bounceSlow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.1);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out forwards;
}
.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-bounce-slow {
  animation: bounceSlow 3s ease-in-out infinite;
}
.animate-pulse-slow {
  animation: pulseSlow 5s ease-in-out infinite;
}

.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient 5s ease infinite;
}

/* Scroll Reveal classes */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.active {
  opacity: 1;
  transform: translateY(0);
}

.delay-100 {
  transition-delay: 100ms;
}
.delay-150 {
  transition-delay: 150ms;
}
.delay-200 {
  transition-delay: 200ms;
}
.delay-300 {
  transition-delay: 300ms;
}

.scale-in {
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.active .scale-in {
  transform: scale(1);
  opacity: 1;
}

/* Selection style */
::selection {
  background-color: #ff9933;
  color: white;
}
</style>
