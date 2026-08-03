<template>
  <div class="min-h-screen flex font-display">
    <!-- Left: Form Panel -->
    <div
      class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6 py-3"
    >
      <!-- Background Decor -->
      <div
        class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-700"
      ></div>

      <div class="w-full max-w-md reveal-active relative z-10 transition-all">
        <div class="animate-fade-in-down relative">
          <button
            @click="$router.push('/')"
            class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-3"
          >
            <span
              class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform"
              >arrow_back</span
            >
            Volver
          </button>
          <div class="flex flex-col items-center mb-4">
            <img
              src="/alevia-logo.png"
              alt="Alevia Pay"
              width="80px"
              class="cursor-pointer mb-1"
              @click="$router.push('/')"
            />
            <h2
              class="text-xl font-black tracking-tighter text-slate-800 dark:text-white"
            >
              Bienvenido
            </h2>
            <p class="text-slate-500 text-xs mt-0.5">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <!-- Panel: Email no verificado -->
          <div
            v-if="emailNotVerified"
            class="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 animate-fade-in"
          >
            <div class="flex items-start gap-3 mb-4">
              <span
                class="material-symbols-outlined text-amber-500 text-2xl mt-0.5"
                >mark_email_unread</span
              >
              <div>
                <p
                  class="font-black text-amber-800 dark:text-amber-300 text-sm"
                >
                  Verificá tu correo electrónico
                </p>
                <p class="text-amber-700 dark:text-amber-400 text-sm mt-1">
                  Enviamos un link de verificación a <strong>{{ email }}</strong
                  >. Revisá tu bandeja de entrada y también la carpeta de spam.
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="resendVerificationEmail"
              :disabled="resendCooldown > 0 || resendLoading"
              class="w-full py-3 rounded-xl font-bold text-sm transition-all"
              :class="
                resendCooldown > 0
                  ? 'bg-amber-100 text-amber-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
              "
            >
              <span v-if="resendLoading">Enviando...</span>
              <span v-else-if="resendCooldown > 0"
                >Reenviar en {{ resendCooldown }}s</span
              >
              <span v-else>
                <span
                  class="material-symbols-outlined text-sm align-middle mr-1"
                  >send</span
                >
                Reenviar email de verificación
              </span>
            </button>
            <p
              v-if="resendSuccess"
              class="text-center text-xs text-green-600 dark:text-green-400 font-bold mt-2 animate-fade-in"
            >
              ✓ Email reenviado correctamente
            </p>
          </div>

          <form @submit.prevent="login" class="space-y-3">
            <!-- Error Alerts -->
            <div
              v-if="errorMessage && !emailNotVerified"
              class="p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in"
              :class="getErrorClass()"
            >
              <span class="material-symbols-outlined text-lg">{{
                getErrorIcon()
              }}</span>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Email Field -->
            <div
              class="space-y-1 group animate-slide-up"
              style="animation-delay: 100ms"
            >
              <label
                for="email"
                class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                >Email</label
              >
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                  >mail</span
                >
                <input
                  type="email"
                  id="email"
                  v-model="email"
                  required
                  placeholder="ejemplo@email.com"
                  class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div
              class="space-y-1 group animate-slide-up"
              style="animation-delay: 200ms"
            >
              <label
                for="password"
                class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                >Contraseña</label
              >
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                  >lock</span
                >
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <span class="material-symbols-outlined text-xl">{{
                    showPassword ? "visibility_off" : "visibility"
                  }}</span>
                </button>
              </div>
            </div>

            <div class="flex justify-end">
              <a
                href="#"
                @click.prevent="forgotPassword"
                class="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                >¿Olvidaste tu contraseña?</a
              >
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-sm"
              :disabled="loading || !isFormValid"
            >
              <span v-if="!loading">Ingresar</span>
              <span v-else class="material-symbols-outlined animate-spin"
                >progress_activity</span
              >
            </button>
          </form>

          <div class="mt-3">
            <div class="relative flex items-center justify-center py-2">
              <div
                class="w-full border-t border-slate-200 dark:border-slate-800"
              ></div>
              <span
                class="bg-slate-50 dark:bg-slate-950 px-3 text-xs font-bold text-slate-400 absolute"
                >O CONTINUAR CON</span
              >
            </div>

            <button
              @click="loginWithGoogle"
              class="w-full py-2 glass border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <img src="/public/google.png" alt="Google" class="w-4 h-4" />
              <span class="font-bold text-sm">Google</span>
            </button>
          </div>

          <p class="mt-4 text-center text-sm text-slate-500">
            ¿No tenés cuenta?
            <a
              href="/registro"
              class="text-primary font-black hover:underline ml-1"
            >
              Registrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Dashboard Mockup Panel (desktop only) -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col items-center justify-center p-10">
      <!-- Background gradients -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse-slow delay-700"></div>

      <div class="relative z-10 w-full max-w-lg animate-fade-in-down">
        <!-- Security badge -->
        <div class="flex justify-center mb-6">
          <span class="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-1.5 rounded-full">
            <svg class="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Seguro, rápido y confiable
          </span>
        </div>

        <!-- Headline -->
        <h2 class="text-4xl font-black tracking-tighter text-white leading-tight mb-3 text-center">
          Tomá decisiones<br/>
          con <span class="text-primary">datos en tiempo real.</span>
        </h2>
        <p class="text-slate-400 text-sm text-center mb-8">
          Gestioná tu negocio, tus ventas y tu equipo desde un solo lugar.
        </p>

        <!-- Dashboard mockup -->
        <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <!-- Mockup top bar -->
          <div class="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700/60">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
            <span class="ml-2 text-slate-500 text-xs">Alevia Pay — Resumen general</span>
          </div>

          <div class="flex">
            <!-- Mini sidebar -->
            <div class="w-10 bg-slate-900/60 border-r border-slate-700/40 flex flex-col items-center py-4 gap-4">
              <div class="w-6 h-6 bg-primary/90 rounded-md flex items-center justify-center">
                <span class="text-white text-[10px] font-black">A</span>
              </div>
              <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center mt-2">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
              </div>
              <div class="w-6 h-6 bg-slate-700/60 rounded-md flex items-center justify-center">
                <svg class="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/></svg>
              </div>
              <div class="w-6 h-6 bg-slate-700/60 rounded-md flex items-center justify-center">
                <svg class="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              </div>
              <div class="w-6 h-6 bg-slate-700/60 rounded-md flex items-center justify-center">
                <svg class="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              </div>
              <div class="w-6 h-6 bg-slate-700/60 rounded-md flex items-center justify-center">
                <svg class="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
              </div>
            </div>

            <!-- Main content -->
            <div class="flex-1 p-4">
              <!-- KPI cards -->
              <div class="grid grid-cols-4 gap-2 mb-4">
                <div class="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40">
                  <p class="text-slate-400 text-[9px] mb-1">Ventas hoy</p>
                  <p class="text-white text-sm font-black">$284.000</p>
                  <p class="text-green-400 text-[9px] font-bold mt-0.5">↑ 12,5%</p>
                  <div class="mt-1.5 h-5 w-full">
                    <svg viewBox="0 0 50 20" class="w-full h-full">
                      <polyline points="0,15 10,10 20,12 30,6 40,8 50,3" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40">
                  <p class="text-slate-400 text-[9px] mb-1">Órdenes</p>
                  <p class="text-white text-sm font-black">128</p>
                  <p class="text-green-400 text-[9px] font-bold mt-0.5">↑ 8,3%</p>
                  <div class="mt-1.5 h-5 w-full">
                    <svg viewBox="0 0 50 20" class="w-full h-full">
                      <polyline points="0,18 10,14 20,15 30,9 40,11 50,7" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40">
                  <p class="text-slate-400 text-[9px] mb-1">Clientes</p>
                  <p class="text-white text-sm font-black">356</p>
                  <p class="text-green-400 text-[9px] font-bold mt-0.5">↑ 6,7%</p>
                  <div class="mt-1.5 h-5 w-full">
                    <svg viewBox="0 0 50 20" class="w-full h-full">
                      <polyline points="0,16 10,13 20,14 30,8 40,10 50,5" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40">
                  <p class="text-slate-400 text-[9px] mb-1">Productos</p>
                  <p class="text-white text-sm font-black">1.245</p>
                  <p class="text-green-400 text-[9px] font-bold mt-0.5">↑ 9,2%</p>
                  <div class="mt-1.5 h-5 w-full">
                    <svg viewBox="0 0 50 20" class="w-full h-full">
                      <polyline points="0,17 10,15 20,11 30,10 40,7 50,4" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Charts row -->
              <div class="grid grid-cols-5 gap-2">
                <!-- Line chart -->
                <div class="col-span-3 bg-slate-900/60 rounded-xl p-3 border border-slate-700/40">
                  <p class="text-slate-300 text-[10px] font-bold mb-2">Ventas de los últimos 7 días</p>
                  <div class="relative h-20">
                    <svg viewBox="0 0 200 70" class="w-full h-full" preserveAspectRatio="none">
                      <!-- Grid lines -->
                      <line x1="0" y1="17" x2="200" y2="17" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <line x1="0" y1="35" x2="200" y2="35" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <line x1="0" y1="53" x2="200" y2="53" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <!-- Area fill -->
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <polygon points="0,60 33,50 66,45 100,30 133,35 166,20 200,10 200,70 0,70" fill="url(#chartGrad)"/>
                      <!-- Line -->
                      <polyline points="0,60 33,50 66,45 100,30 133,35 166,20 200,10" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <!-- Dot at end -->
                      <circle cx="200" cy="10" r="2.5" fill="#f97316"/>
                    </svg>
                    <!-- X-axis labels -->
                    <div class="flex justify-between mt-1 px-0.5">
                      <span v-for="day in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="day" class="text-slate-500 text-[8px]">{{day}}</span>
                    </div>
                  </div>
                </div>

                <!-- Donut chart -->
                <div class="col-span-2 bg-slate-900/60 rounded-xl p-3 border border-slate-700/40">
                  <p class="text-slate-300 text-[10px] font-bold mb-2">Ventas por categoría</p>
                  <div class="flex items-center gap-2">
                    <svg viewBox="0 0 36 36" class="w-16 h-16 shrink-0">
                      <!-- Donut segments (approximate 40/30/20/10) -->
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f97316" stroke-width="4" stroke-dasharray="40 60" stroke-dashoffset="25" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-dasharray="30 70" stroke-dashoffset="-15" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22d3ee" stroke-width="4" stroke-dasharray="20 80" stroke-dashoffset="-45" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#a78bfa" stroke-width="4" stroke-dasharray="10 90" stroke-dashoffset="-65" transform="rotate(-90 18 18)"/>
                    </svg>
                    <div class="space-y-0.5">
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div><span class="text-slate-400 text-[8px]">Bebidas 40%</span></div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div><span class="text-slate-400 text-[8px]">Almacén 30%</span></div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></div><span class="text-slate-400 text-[8px]">Limpieza 20%</span></div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></div><span class="text-slate-400 text-[8px]">Otros 10%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Recovery Modal -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="glass w-full max-w-sm p-8 rounded-[2.5rem] border border-white/20 shadow-2xl animate-slide-up"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-black tracking-tighter">Recuperar Acceso</h3>
          <button
            @click="closeForgotPasswordModal"
            class="text-slate-400 hover:text-primary transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed">
          Ingresa tu email para recibir instrucciones de recuperación.
        </p>

        <div class="space-y-4">
          <div class="space-y-2">
            <label
              class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
              >Tu Email</label
            >
            <input
              v-model="recoveryEmail"
              type="email"
              placeholder="email@ejemplo.com"
              class="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>
          <button
            @click="sendPasswordRecovery"
            class="w-full py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/25 disabled:opacity-50"
            :disabled="!recoveryEmail || recoverySending"
          >
            {{ recoverySending ? "Enviando..." : "Enviar enlace" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <SpinnerComponent v-if="loading"></SpinnerComponent>
</template>

<script>
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import Cookies from "js-cookie";
import api from "@/config/axios.config";
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      formSubmitted: false,
      loading: false,
      errorMessage: "",
      errorType: "error",
      emailNotVerified: false,
      resendLoading: false,
      resendCooldown: 0,
      resendSuccess: false,
      resendTimer: null,
      showForgotPasswordModal: false,
      recoveryEmail: "",
      recoverySending: false,
      showPassword: false,
    };
  },
  components: {
    SpinnerComponent,
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this.email && emailPattern.test(this.email) && this.password;
    },
  },
  methods: {
    async loginWithGoogle() {
      this.$router.push("/inicio-sesion-google");
    },
    getErrorClass() {
      switch (this.errorType) {
        case "warning":
          return "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30";
        case "info":
          return "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
        default:
          return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30";
      }
    },
    getErrorIcon() {
      switch (this.errorType) {
        case "warning":
          return "warning";
        case "info":
          return "info";
        default:
          return "error";
      }
    },
    clearCookies() {
      Cookies.remove("user_info");
      localStorage.removeItem("token_expiration");
    },
    async login() {
      try {
        this.clearCookies();
        this.loading = true;
        this.errorMessage = "";
        this.errorType = "error";

        if (!this.email) {
          this.errorMessage = "Por favor, ingresa tu correo electrónico";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        if (!this.password) {
          this.errorMessage = "Por favor, ingresa tu contraseña";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(this.email)) {
          this.errorMessage = "El formato del correo electrónico no es válido";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        const response = await api.post("/auth/post/login-user", {
          email: this.email,
          password: this.password,
        });

        const data = response.data;
        console.log(data);

        if (data.user) {
          const expiresInMs = (data.expires_in || 28800) * 1000;
          const expirationTime = Date.now() + expiresInMs;
          const cookieExpireDays = expiresInMs / (1000 * 60 * 60 * 24);

          Cookies.set("user_info", JSON.stringify(data.user), {
            expires: cookieExpireDays,
          });

          localStorage.setItem("token_expiration", expirationTime);
          localStorage.removeItem("session_warning_shown");

          import("@/config/axios.config").then(({ scheduleAutoLogout }) => {
            scheduleAutoLogout(expiresInMs);
          });

          this.formSubmitted = true;
          this.$router.push("/inicio");
        } else {
          this.errorMessage =
            "Error en el inicio de sesión. Verifica tus credenciales.";
          this.errorType = "error";
        }
      } catch (error) {
        console.error(error);
        this.errorType = "error";

        if (error.response && error.response.data) {
          // Personalizar mensajes según el tipo de error
          if (error.response.status === 401) {
            const msg = error.response.data?.message || "";
            if (
              msg.includes("período de prueba") ||
              msg.includes("prueba de 7 días")
            ) {
              this.$router.push("/prueba-expirada");
              return;
            } else if (
              msg.includes("verificar tu correo") ||
              msg.includes("correo electrónico")
            ) {
              this.emailNotVerified = true;
              this.errorMessage = "";
            } else {
              this.errorMessage =
                "Credenciales incorrectas. Verifica tu email y contraseña.";
            }
          } else if (error.response.status === 403) {
            this.errorMessage =
              "Tu cuenta está desactivada o no tienes permisos para acceder.";
          } else if (error.response.status === 429) {
            this.errorMessage =
              "Demasiados intentos fallidos. Intenta de nuevo más tarde.";
            this.errorType = "warning";
          } else if (error.response.data.message) {
            this.errorMessage = error.response.data.message;
          } else {
            this.errorMessage =
              "Error en el inicio de sesión. Verifica tus credenciales.";
          }
        } else if (error.request) {
          this.errorMessage =
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
          this.errorType = "info";
        } else {
          this.errorMessage =
            "Error en el inicio de sesión. Verifica tus credenciales.";
        }

        this.loading = false;
      }
    },
    async resendVerificationEmail() {
      if (this.resendCooldown > 0 || this.resendLoading || !this.email) return;
      this.resendLoading = true;
      this.resendSuccess = false;
      try {
        await api.post(
          `/auth/post/resend-verification-token?email=${encodeURIComponent(this.email)}`,
        );
        this.resendSuccess = true;
        this.resendCooldown = 60;
        this.resendTimer = setInterval(() => {
          this.resendCooldown--;
          if (this.resendCooldown <= 0) {
            clearInterval(this.resendTimer);
            this.resendTimer = null;
          }
        }, 1000);
      } catch (e) {
        // silenciar — el email puede no existir
      } finally {
        this.resendLoading = false;
      }
    },
    goToRegister() {
      this.$router.push("/registro");
    },
    forgotPassword() {
      this.showForgotPasswordModal = true;
    },
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.recoveryEmail = "";
    },
    async sendPasswordRecovery() {
      if (!this.recoveryEmail) return;
      this.loading = true;

      try {
        this.recoverySending = true;
        const responde = await api.post(
          "/auth/post/generate-password-reset-code?email=" + this.recoveryEmail,
        );
        const data = responde.data;

        if (data.success) {
          alert(
            "Se han enviado las instrucciones para restablecer tu contraseña a tu correo electrónico. Revisa tu carpeta de spam si no lo ves en tu bandeja de entrada.",
          );
          this.closeForgotPasswordModal();
        } else {
          alert(
            "Hubo un error al enviar las instrucciones. Verifica que el correo sea correcto.",
          );
        }
      } catch (error) {
        console.error(error);
        alert(
          "Hubo un error al enviar las instrucciones. Verifica que el correo sea correcto.",
        );
        this.recoverySending = false;
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem("userToken");
    if (token) {
      this.$router.push("/");
    }
  },
  beforeUnmount() {
    if (this.resendTimer) clearInterval(this.resendTimer);
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
.animate-pulse-slow {
  animation: pulseSlow 5s ease-in-out infinite;
}

/* Scroll Reveal helper */
.reveal-active {
  opacity: 1;
  transform: translateY(0);
}
</style>
