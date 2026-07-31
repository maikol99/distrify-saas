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
      <section id="hero" class="hero-section relative overflow-hidden">
        <!-- Background ambient glow -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[160px] animate-pulse-slow"></div>
          <div class="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[130px] animate-pulse-slow" style="animation-delay: 2s"></div>
          <!-- Subtle grid pattern -->
          <div class="absolute inset-0 hero-grid-bg opacity-[0.03]"></div>
          <!-- Bottom gradient fade -->
          <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a0f05] to-transparent"></div>
        </div>

        <div class="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-64px)] py-16 lg:py-0 relative z-10">

          <!-- LEFT: Text Content -->
          <div class="animate-slide-up">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 mb-8 animate-fade-in">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span class="text-xs font-bold tracking-wider text-primary">Demo gratis · Sin tarjeta · Activo en minutos</span>
            </div>

            <!-- Headline -->
            <h1 class="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-white leading-[1.08] mb-6 tracking-tight animate-slide-up">
              Cobrá más rápido<br>
              y controlá tu<br>
              negocio.<br>
              <span class="hero-accent-text text-primary relative inline-block mt-1">
                Gestión por voz
                <span class="absolute -bottom-1 left-0 w-full h-[3px] bg-primary/50 rounded-full"></span>
              </span><br>
              en una sola<br>
              pantalla.
            </h1>

            <!-- Subtitle -->
            <p class="text-base md:text-lg text-[#a89480] mb-8 max-w-lg leading-relaxed animate-slide-up delay-150">
              POS, inventario, caja y delivery para negocios de Argentina.
              Implementación rápida, soporte humano y ventas ordenadas desde el
              primer día.
            </p>

            <!-- CTAs -->
            <div class="flex flex-wrap gap-4 mb-10 animate-slide-up delay-300">
              <a
                href="/registro"
                class="hero-cta-primary px-8 py-4 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
              >
                Probar gratis
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              </a>
              <a
                @click="scrollToSection('pricing')"
                class="hero-cta-secondary px-8 py-4 bg-white/[0.06] text-white font-bold rounded-xl cursor-pointer backdrop-blur-sm border border-white/10 transition-all"
              >
                Ver precios
              </a>
            </div>

            <!-- Feature badges -->
            <div class="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#a89480] animate-slide-up delay-300">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-base">credit_card_off</span>
                Sin tarjeta
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-base">sync_alt</span>
                Migración asistida
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-base">support_agent</span>
                Soporte humano
              </span>
            </div>
          </div>

          <!-- RIGHT: App Mockup -->
          <div class="relative hidden lg:flex items-center justify-center animate-slide-up delay-200">
            <div class="hero-mockup-wrapper relative w-full max-w-[650px]">

              <!-- Main dashboard card -->
              <div class="hero-card hero-card-main absolute top-0 left-0 w-[370px] rounded-2xl border border-white/[0.12] shadow-2xl shadow-black/60 overflow-hidden z-10">
                <!-- Browser bar -->
                <div class="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] bg-white/[0.04]">
                  <div class="flex gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
                  </div>
                  <div class="flex items-center gap-1.5 ml-4 text-[12px] text-[#8a7a6a] font-mono">
                    <span class="material-symbols-outlined text-[13px] text-[#28c840]">lock</span>
                    app.aleviapay.com
                  </div>
                </div>
                <!-- Dashboard content -->
                <div class="p-6">
                  <p class="text-[12px] text-[#8a7a6a] font-medium mb-1">Ventas de hoy</p>
                  <div class="flex items-end justify-between mb-6">
                    <span class="text-[2.4rem] font-black text-white tracking-tight leading-none">$45.230</span>
                    <button class="flex items-center gap-2 px-3.5 py-2 bg-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 transition-all">
                      <span class="material-symbols-outlined text-base">barcode_scanner</span>
                      Escanear
                    </button>
                  </div>
                  <!-- Mini chart -->
                  <div class="rounded-xl p-4 bg-white/[0.04] border border-white/[0.06]">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-[11px] text-[#8a7a6a] font-medium">Stock bajo</span>
                      <span class="text-base font-bold text-white bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">8 alerta</span>
                    </div>
                    <div class="flex items-end gap-1.5 h-20">
                      <div class="flex-1 rounded-sm hero-bar" style="height: 35%; opacity: 0.5"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 55%; opacity: 0.6"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 42%; opacity: 0.55"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 78%; opacity: 0.8"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 88%; opacity: 0.9"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 65%; opacity: 0.75"></div>
                      <div class="flex-1 rounded-sm hero-bar" style="height: 100%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alert cards (stacked below main) -->
              <div class="absolute top-[300px] left-[15px] w-[280px] space-y-2.5 z-20">
                <div class="hero-card hero-alert-card rounded-2xl p-3.5 border border-white/[0.1] flex items-center gap-3.5 shadow-xl shadow-black/30">
                  <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-primary text-xl">inventory_2</span>
                  </div>
                  <div>
                    <p class="text-[12px] font-bold text-white">Stock mínimo</p>
                    <p class="text-[10px] text-[#8a7a6a]">8 productos bajo el límite</p>
                  </div>
                </div>
                <div class="hero-card hero-alert-card rounded-2xl p-3.5 border border-white/[0.1] flex items-center gap-3.5 shadow-xl shadow-black/30">
                  <div class="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-yellow-400 text-xl">event_busy</span>
                  </div>
                  <div>
                    <p class="text-[12px] font-bold text-white">Vencen hoy</p>
                    <p class="text-[10px] text-[#8a7a6a]">3 productos para revisar</p>
                  </div>
                </div>
                <div class="hero-card hero-alert-card rounded-2xl p-3.5 border border-white/[0.1] flex items-center gap-3.5 shadow-xl shadow-black/30">
                  <div class="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-green-400 text-xl">local_shipping</span>
                  </div>
                  <div>
                    <p class="text-[12px] font-bold text-white">Delivery activo</p>
                    <p class="text-[10px] text-[#8a7a6a]">5 pedidos en curso</p>
                  </div>
                </div>
              </div>

              <!-- Ticket card (floating right) -->
              <div class="hero-card hero-ticket-card absolute top-[80px] right-0 w-[220px] rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/50 p-5 z-30">
                <div class="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.08]">
                  <span class="material-symbols-outlined text-primary text-base">receipt_long</span>
                  <span class="text-[12px] font-bold text-white tracking-wide">TICKET #1234</span>
                </div>
                <div class="space-y-2.5">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-[#a89480]">Coca 2.25L</span>
                    <span class="text-white font-semibold">$1.200</span>
                  </div>
                  <div class="flex justify-between text-[11px]">
                    <span class="text-[#a89480]">Pan lactal</span>
                    <span class="text-white font-semibold">$850</span>
                  </div>
                  <div class="flex justify-between text-[11px]">
                    <span class="text-[#a89480]">Leche</span>
                    <span class="text-white font-semibold">$1.500</span>
                  </div>
                </div>
                <div class="flex justify-between mt-4 pt-3 border-t border-white/[0.08]">
                  <span class="text-[12px] font-bold text-white">Total</span>
                  <span class="text-base font-black text-primary">$3.550</span>
                </div>
              </div>

              <!-- Voice indicator (floating bottom-right) -->
              <div class="hero-voice-badge absolute bottom-[30px] right-[10px] flex items-center gap-2.5 bg-primary/15 border border-primary/30 rounded-full px-5 py-2.5 z-40 backdrop-blur-md shadow-lg shadow-primary/10">
                <span class="material-symbols-outlined text-primary text-base animate-pulse">mic</span>
                <span class="text-[12px] font-bold text-primary">Voz activa</span>
              </div>

              <!-- Delivery count badge -->
              <div class="absolute bottom-[40px] left-[310px] flex items-center gap-2 z-30">
                <div class="hero-card rounded-2xl p-4 border border-white/[0.1] flex items-center gap-3.5 w-[160px] shadow-xl shadow-black/30">
                  <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-primary text-xl">schedule</span>
                  </div>
                  <div>
                    <span class="text-2xl font-black text-white leading-none">5</span>
                    <p class="text-[10px] text-[#8a7a6a] mt-0.5">en curso</p>
                  </div>
                </div>
              </div>

              <!-- Spacer to give the absolute-positioned mockup its height -->
              <div class="w-full" style="padding-bottom: 92%"></div>
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
