<template>
  <div class="min-h-screen flex font-display">
    <!-- Left: Form Panel -->
    <div
      class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6 py-2"
    >
      <!-- Background Decor -->
      <div
        class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-700"
      ></div>

      <div class="w-full max-w-lg reveal-active relative z-10 transition-all">
        <div class="animate-fade-in-down relative">
          <!-- Back Button -->
          <button
            @click="$router.push('/')"
            class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-2"
          >
            <span
              class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform"
              >arrow_back</span
            >
            Volver
          </button>

          <div class="flex flex-col items-center mb-3">
            <img
              src="/alevia-logo.png"
              alt="Alevia Pay"
              width="70px"
              class="cursor-pointer mb-1"
              @click="$router.push('/')"
            />
            <h2
              class="text-xl font-black tracking-tighter text-slate-800 dark:text-white"
            >
              Crear Cuenta
            </h2>
            <p class="text-slate-500 text-xs mt-0.5">
              Únete al futuro de la gestión empresarial
            </p>
          </div>

          <form @submit.prevent="register" class="space-y-2.5">
            <!-- Alerts -->
            <div
              v-if="successMessage"
              class="p-3 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 flex items-center gap-2 text-sm animate-fade-in"
            >
              <span class="material-symbols-outlined text-base"
                >check_circle</span
              >
              <span>{{ successMessage }}</span>
            </div>
            <div
              v-if="errorMessage"
              class="p-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-sm animate-fade-in"
            >
              <span class="material-symbols-outlined text-base">error</span>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- User & Phone Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Username -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 100ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Usuario</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >person</span
                  >
                  <input
                    v-model="username"
                    type="text"
                    required
                    placeholder="Carlos92"
                    class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                </div>
              </div>
              <!-- Phone -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 150ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Teléfono</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >call</span
                  >
                  <input
                    v-model="phone"
                    type="text"
                    required
                    placeholder="+54 11..."
                    class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Email -->
            <div
              class="space-y-1 group animate-slide-up"
              style="animation-delay: 200ms"
            >
              <label
                class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                >Email</label
              >
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                  >mail</span
                >
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="hola@aleviapay.com"
                  class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                />
              </div>
            </div>

            <!-- Passwords Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Password -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 250ms"
              >
                <label
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
                    v-model="password"
                    required
                    placeholder="••••••••"
                    @input="checkPasswordStrength"
                    class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span class="material-symbols-outlined text-base">{{
                      showPassword ? "visibility_off" : "visibility"
                    }}</span>
                  </button>
                </div>
                <div v-if="password" class="px-1">
                  <div
                    class="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full transition-all duration-500"
                      :class="{
                        'bg-red-500': passwordStrength === 'weak',
                        'bg-orange-500': passwordStrength === 'medium',
                        'bg-green-500': passwordStrength === 'strong',
                      }"
                      :style="{ width: getStrengthWidth() }"
                    ></div>
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider mt-0.5 block"
                    :class="{
                      'text-red-500': passwordStrength === 'weak',
                      'text-orange-500': passwordStrength === 'medium',
                      'text-green-500': passwordStrength === 'strong',
                    }"
                    >{{ getStrengthText() }}</span
                  >
                </div>
              </div>
              <!-- Confirm Password -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 300ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Confirmar</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >verified_user</span
                  >
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    required
                    placeholder="••••••••"
                    class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span class="material-symbols-outlined text-base">{{
                      showConfirmPassword ? "visibility_off" : "visibility"
                    }}</span>
                  </button>
                </div>
                <div
                  v-if="confirmPassword"
                  class="flex items-center gap-1 mt-0.5 ml-1"
                >
                  <span
                    class="material-symbols-outlined text-[13px]"
                    :class="passwordsMatch ? 'text-green-500' : 'text-red-500'"
                    >{{ passwordsMatch ? "check_circle" : "cancel" }}</span
                  >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider"
                    :class="passwordsMatch ? 'text-green-500' : 'text-red-500'"
                    >{{ passwordsMatch ? "Coinciden" : "No coinciden" }}</span
                  >
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              :disabled="loading || !isFormValid"
            >
              <span v-if="!loading">Registrarme</span>
              <span v-else class="material-symbols-outlined animate-spin"
                >progress_activity</span
              >
            </button>
          </form>

          <div class="mt-3">
            <div class="relative flex items-center justify-center py-2.5">
              <div
                class="w-full border-t border-slate-200 dark:border-slate-800"
              ></div>
              <span
                class="bg-slate-50 dark:bg-slate-950 px-3 text-xs font-bold text-slate-400 absolute"
                >O CON GOOGLE</span
              >
            </div>

            <button
              @click="registerWithGoogle"
              class="w-full py-2.5 glass border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <img src="/public/google.png" alt="Google" class="w-4 h-4" />
              <span class="font-bold text-sm">Crear con Google</span>
            </button>
          </div>

          <p class="mt-4 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?
            <button
              @click="goToLogin"
              class="text-primary font-black hover:underline ml-1"
            >
              Inicia Sesión
            </button>
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
          Tu negocio, bajo control<br/>
          desde <span class="text-primary">el día uno.</span>
        </h2>
        <p class="text-slate-400 text-sm text-center mb-8">
          Registrate gratis y empezá a gestionar ventas, caja y productos en minutos.
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
                      <line x1="0" y1="17" x2="200" y2="17" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <line x1="0" y1="35" x2="200" y2="35" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <line x1="0" y1="53" x2="200" y2="53" stroke="#334155" stroke-width="0.5" stroke-dasharray="2,2"/>
                      <defs>
                        <linearGradient id="chartGradReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <polygon points="0,60 33,50 66,45 100,30 133,35 166,20 200,10 200,70 0,70" fill="url(#chartGradReg)"/>
                      <polyline points="0,60 33,50 66,45 100,30 133,35 166,20 200,10" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="200" cy="10" r="2.5" fill="#f97316"/>
                    </svg>
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
  </div>
  <SpinnerComponent v-if="loading"></SpinnerComponent>
</template>

<script>
import axios from "axios";
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import api from "@/config/axios.config";

export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
      loading: false,
      formSubmitted: false,
      errorMessage: "",
      successMessage: "",
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: "weak",
    };
  },
  components: {
    SpinnerComponent,
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        this.username &&
        this.email &&
        emailPattern.test(this.email) &&
        this.password &&
        this.confirmPassword &&
        this.password === this.confirmPassword
      );
    },
    passwordsMatch() {
      return this.password === this.confirmPassword;
    },
  },
  methods: {
    async registerWithGoogle() {
      this.$router.push("/inicio-sesion-google");
    },
    async register() {
      try {
        this.loading = true;
        this.errorMessage = "";
        this.successMessage = "";
        if (!this.isFormValid) {
          this.errorMessage =
            "Por favor, completa todos los campos correctamente";
          this.loading = false;
          return;
        }
        if (this.password !== this.confirmPassword) {
          this.errorMessage = "Las contraseñas no coinciden";
          this.loading = false;
          return;
        }
        const emailToLowerCase = this.email.toLowerCase();
        const response = await api.post("/auth/post/register-user", {
          username: this.username,
          email: emailToLowerCase,
          password: this.password,
          phone: this.phone,
          createShop: true,
        });
        const data = response.data;
        if (data.success) {
          this.formSubmitted = true;
          this.successMessage = "¡Registro exitoso! Redirigiendo al login...";

          alert(
            "¡Registro exitoso! En tu correo electrónico se han enviado las instrucciones para continuar, si no las ves, revisa tu carpeta de SPAM.",
          );

          // Limpiar el formulario
          this.username = "";
          this.email = "";
          this.password = "";
          this.phone = "";
          this.confirmPassword = "";
          this.showPassword = false;
          this.showConfirmPassword = false;
          this.passwordStrength = "weak";

          setTimeout(() => {
            this.$router.push("/iniciar-sesion");
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage =
            "Error en el registro. Por favor intenta nuevamente.";
        }
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push("/iniciar-sesion");
    },
    checkPasswordStrength() {
      const password = this.password;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasNonalphas = /\W/.test(password);
      const hasMinLength = password.length >= 8;
      let score = 0;
      if (hasUpperCase) score++;
      if (hasLowerCase) score++;
      if (hasNumbers) score++;
      if (hasNonalphas) score++;
      if (hasMinLength) score++;
      if (score < 3) {
        this.passwordStrength = "weak";
      } else if (score < 5) {
        this.passwordStrength = "medium";
      } else {
        this.passwordStrength = "strong";
      }
    },
    getStrengthWidth() {
      switch (this.passwordStrength) {
        case "weak":
          return "33%";
        case "medium":
          return "66%";
        case "strong":
          return "100%";
        default:
          return "0%";
      }
    },
    getStrengthText() {
      switch (this.passwordStrength) {
        case "weak":
          return "Débil";
        case "medium":
          return "Media";
        case "strong":
          return "Fuerte";
        default:
          return "";
      }
    },
  },
  mounted() {},
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
