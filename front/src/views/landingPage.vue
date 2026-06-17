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
          <img src="/distrify-orange.png" alt="Distrify" width="150px" />
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
      <section id="hero" class="relative overflow-hidden px-6 py-20 lg:py-32">
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none"
        >
          <div
            class="absolute top-20 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse-slow"
          ></div>
          <div
            class="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px] animate-pulse-slow delay-700"
          ></div>
        </div>
        <div class="max-w-7xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-primary"
              ></span>
            </span>
            <span
              class="text-xs font-bold uppercase tracking-widest text-primary"
              >v2.0 Ahora con Núcleo de Voz con IA</span
            >
          </div>
          <h1
            class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-slide-up"
          >
            Gestión y ventas, <br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-gradient-shift"
              >potenciadas por voz.</span
            >
          </h1>
          <p
            class="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 animate-slide-up delay-150"
          >
            Distrify integra IA avanzada y control por voz para simplificar las
            operaciones de tu negocio con una interfaz premium y minimalista.
          </p>
          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300"
          >
            <a
              href="/registro"
              class="w-full sm:w-auto px-10 py-5 bg-primary text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform text-center shadow-lg shadow-primary/20"
              >Crear cuenta gratis</a
            >
            <a
              href="https://wa.me/543517706985"
              target="_blank"
              class="w-full sm:w-auto px-10 py-5 glass border-slate-200 dark:border-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
            >
              <span class="material-symbols-outlined">play_circle</span>
              Ver Demo
            </a>
          </div>
        </div>
        <!-- Hero Image Mockup -->
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
              class="p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 flex flex-col hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 reveal"
            >
              <h3 class="text-xl font-bold mb-2">Gratuito</h3>
              <p class="text-slate-500 text-sm mb-6">Perfecto para empezar.</p>
              <div class="text-4xl font-black mb-8">
                $0<span class="text-lg font-normal text-slate-500">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Hasta 20 productos en inventario
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Categorías y proveedores
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Ventas e historial de ventas
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  1 usuario
                </li>
              </ul>
              <a
                href="/registro"
                class="w-full py-3 text-center glass border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-primary transition-colors active:scale-95"
                >Empezar gratis</a
              >
            </div>
            <!-- Básico -->
            <div
              class="p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 flex flex-col hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 reveal delay-100"
            >
              <h3 class="text-xl font-bold mb-2">Básico</h3>
              <p class="text-slate-500 text-sm mb-6">Para pequeños negocios.</p>
              <div class="text-4xl font-black mb-8">
                $20.000<span class="text-lg font-normal text-slate-500">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Todo lo del plan Gratuito
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Egresos e ingresos
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  2 usuarios
                </li>
              </ul>
              <a
                href="/registro"
                class="w-full py-3 text-center glass border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-primary transition-colors active:scale-95"
                >Crear cuenta</a
              >
            </div>
            <!-- Medio -->
            <div
              class="p-8 rounded-3xl bg-slate-900 text-white flex flex-col relative ring-4 ring-primary ring-offset-4 ring-offset-white dark:ring-offset-slate-950 hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 reveal delay-200 scale-105 z-10"
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
                class="w-full py-3 text-center bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25"
                >Crear cuenta</a
              >
            </div>
            <!-- Plan IA -->
            <div
              class="p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 flex flex-col hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 reveal delay-300 relative overflow-hidden"
            >
              <div
                class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg"
              >
                ✦ Con IA
              </div>
              <h3 class="text-xl font-bold mb-2">Plan IA</h3>
              <p class="text-slate-500 text-sm mb-6">Todo el poder de la inteligencia artificial.</p>
              <div class="text-4xl font-black mb-8">
                $55.000<span class="text-lg font-normal text-slate-500">/mes</span>
              </div>
              <ul class="space-y-4 mb-10 flex-grow">
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Todo lo del plan Medio
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Múltiples sucursales
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  Usuarios ilimitados
                </li>
                <li class="flex items-center gap-3 text-sm font-medium">
                  <span class="material-symbols-outlined text-violet-500 text-lg">smart_toy</span>
                  Asistente IA incluido
                </li>
              </ul>
              <a
                href="https://wa.me/543517706985"
                target="_blank"
                class="w-full py-3 text-center glass border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-primary transition-colors active:scale-95"
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
              En Distrify, creemos que gestionar un negocio debería ser tan
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
                Únete a más de 200 negocios que crecen más rápido con Distrify
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
        class="bg-background-light dark:bg-background-dark pt-20 pb-10 border-t border-slate-200 dark:border-slate-800"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div
            class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 text-balance"
          >
            <div class="col-span-2 reveal">
              <div class="flex items-center gap-2 mb-6">
                <img src="/distrify-orange.png" alt="Distrify" width="150px" />
              </div>
              <p class="text-slate-600 dark:text-slate-400 max-w-xs mb-8">
                El primer ecosistema de gestión empresarial nativo por voz
                potenciado por IA de próxima generación.
              </p>
            </div>
            <!-- <div class="reveal delay-100">
              <h4 class="font-bold mb-6 cursor-default">Navegación</h4>
              <ul class="space-y-4 text-sm text-slate-500">
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
              </ul>
            </div> -->
            <div class="reveal delay-200">
              <h4 class="font-bold mb-6 cursor-default">Desarrollado por</h4>
              <a
                href="https://cuyocode.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                class="block group"
              >
                <p
                  class="text-sm text-slate-500 group-hover:text-primary transition-colors"
                >
                  Cuyo Code
                </p>
              </a>
            </div>
          </div>
          <div
            class="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 reveal"
          >
            <p>
              © {{ new Date().getFullYear() }} Distrify. Todos los derechos
              reservados.
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
  name: "DistrifyLanding",
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
            "Distrify transformó completamente la forma en que administramos nuestro negocio. Ahora tenemos todo bajo control y nuestras ventas han aumentado un 30%.",
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
