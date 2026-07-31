<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
        <div class="welcome-section">
          <div class="step-indicator">
            <span class="step-badge">Último paso</span>
            <span class="optional-badge">100% Opcional</span>
          </div>
          <h1>¡Casi terminamos! 📱</h1>
          <p class="welcome-subtitle">
            <strong>¿Te gustaría que nuestro equipo pueda contactarte?</strong
            ><br />
            Comparte tu número de teléfono para una comunicación más directa
            (completamente opcional)
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Optional Notice -->
        <div class="optional-notice">
          <i class="fas fa-info-circle"></i>
          <div class="notice-content">
            <strong
              >Este paso es completamente opcional y no obligatorio</strong
            >
            <p>
              Puedes continuar sin agregar tu teléfono. No verificamos el
              número, solo lo guardamos para futura comunicación del equipo de
              atención al cliente
            </p>
          </div>
        </div>

        <!-- Phone Input Section -->
        <div class="section">
          <h3 class="section-title">Número de teléfono (opcional)</h3>
          <p class="section-intro">
            Solo recopilamos tu número para que nuestro equipo de atención al
            cliente pueda contactarte de manera más eficiente cuando sea
            necesario.
          </p>

          <div class="phone-input-container">
            <div class="country-selector">
              <select
                v-model="selectedCountry"
                class="country-select"
                :disabled="loadingCountries"
              >
                <option value="" disabled>
                  {{ loadingCountries ? "Cargando..." : "Selecciona país" }}
                </option>
                <option
                  v-for="country in countries"
                  :key="country.code"
                  :value="country"
                >
                  {{ country.flag }} {{ country.name }} (+{{
                    country.dial_code
                  }})
                </option>
              </select>
            </div>

            <div class="phone-number-input">
              <div class="dial-code-display" v-if="selectedCountry">
                {{ selectedCountry.flag }} +{{ selectedCountry.dial_code }}
              </div>
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="Número de teléfono (opcional)"
                class="phone-input"
                :class="{ error: hasError }"
                @input="validatePhone"
                maxlength="15"
              />
            </div>
          </div>

          <div v-if="hasError" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <div class="phone-example" v-if="selectedCountry">
            <i class="fas fa-info-circle"></i>
            <span>Ejemplo: {{ getPhoneExample() }}</span>
          </div>
        </div>

        <!-- Benefits Section -->
        <div class="section benefits-section">
          <h3 class="section-title">
            ¿Para qué usaremos tu número de teléfono?
          </h3>
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon orange">
                <i class="fas fa-headset"></i>
              </div>
              <div class="benefit-content">
                <h4>Atención al cliente más directa</h4>
                <p>
                  Nuestro equipo podrá contactarte de manera más eficiente para
                  resolver dudas o consultas específicas
                </p>
              </div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon blue">
                <i class="fas fa-megaphone"></i>
              </div>
              <div class="benefit-content">
                <h4>Comunicación de novedades importantes</h4>
                <p>
                  Te informaremos sobre nuevas funcionalidades y mejoras
                  relevantes para tu experiencia
                </p>
              </div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon purple">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="benefit-content">
                <h4>Ofertas y descuentos especiales</h4>
                <p>
                  Ocasionalmente compartiremos promociones exclusivas que puedan
                  interesarte
                </p>
              </div>
            </div>
          </div>

          <div class="benefits-note">
            <i class="fas fa-shield-alt"></i>
            <span
              >No enviamos notificaciones automáticas. Solo contactamos cuando
              es relevante para mejorar tu experiencia.</span
            >
          </div>
        </div>

        <!-- Privacy Notice -->
        <div class="privacy-notice">
          <i class="fas fa-lock"></i>
          <div class="privacy-content">
            <strong>Tu privacidad es importante:</strong>
            <p>
              • No verificamos ni validamos el número<br />
              • Solo lo guardamos para comunicación del equipo de soporte<br />
              • Nunca compartimos tu información con terceros<br />
              • Puedes solicitar eliminarlo en cualquier momento
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="skipStep">
          Continuar sin teléfono
        </button>
        <button
          class="btn-primary"
          @click="savePhoneNumber"
          :disabled="sending"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin"></i>
          {{ sending ? "Guardando..." : "Guardar número" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "PhoneVerificationModal",
  data() {
    return {
      selectedCountry: null,
      phoneNumber: "",
      countries: [],
      loadingCountries: true,
      hasError: false,
      errorMessage: "",
      sending: false,
      globalStore: useGlobalStore(),
    };
  },
  computed: {
    canSaveNumber() {
      // Permitir guardar incluso sin número (campo opcional)
      return (
        !this.sending &&
        (!this.phoneNumber ||
          (this.selectedCountry &&
            this.phoneNumber.length >= 6 &&
            !this.hasError))
      );
    },
    fullPhoneNumber() {
      if (!this.selectedCountry || !this.phoneNumber) return "";
      return `+${this.selectedCountry.dial_code}${this.phoneNumber}`;
    },
  },
  mounted() {
    this.loadCountries();
  },
  methods: {
    async loadCountries() {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2,flag"
        );
        const data = await response.json();

        this.countries = data
          .filter(
            (country) => country.idd && country.idd.root && country.idd.suffixes
          )
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
            dial_code:
              country.idd.root.replace("+", "") +
              (country.idd.suffixes[0] || ""),
            flag: country.flag,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // Pre-seleccionar Argentina si está disponible
        const argentina = this.countries.find((c) => c.code === "AR");
        if (argentina) {
          this.selectedCountry = argentina;
        }

        this.loadingCountries = false;
      } catch (error) {
        console.error("Error loading countries:", error);
        this.loadingCountries = false;
        // Fallback con algunos países principales
        this.countries = [
          { name: "Argentina", code: "AR", dial_code: "54", flag: "🇦🇷" },
          { name: "Brasil", code: "BR", dial_code: "55", flag: "🇧🇷" },
          { name: "Chile", code: "CL", dial_code: "56", flag: "🇨🇱" },
          { name: "Colombia", code: "CO", dial_code: "57", flag: "🇨🇴" },
          { name: "España", code: "ES", dial_code: "34", flag: "🇪🇸" },
          { name: "México", code: "MX", dial_code: "52", flag: "🇲🇽" },
          { name: "Perú", code: "PE", dial_code: "51", flag: "🇵🇪" },
          { name: "Uruguay", code: "UY", dial_code: "598", flag: "🇺🇾" },
        ];
        this.selectedCountry = this.countries[0];
      }
    },
    validatePhone() {
      this.hasError = false;
      this.errorMessage = "";

      if (this.phoneNumber.length === 0) return;

      // Solo permitir dígitos — filtrar automáticamente
      const cleaned = this.phoneNumber.replace(/\D/g, "");
      if (cleaned !== this.phoneNumber) {
        this.phoneNumber = cleaned;
      }

      // Validar longitud máxima
      if (this.phoneNumber.length > 15) {
        this.hasError = true;
        this.errorMessage = "El número no puede tener más de 15 dígitos";
        return;
      }
    },
    getPhoneExample() {
      if (!this.selectedCountry) return "";

      const examples = {
        AR: "11 2345 6789",
        BR: "11 98765 4321",
        CL: "9 8765 4321",
        CO: "300 123 4567",
        ES: "612 34 56 78",
        MX: "55 1234 5678",
        PE: "987 654 321",
        UY: "94 123 456",
      };

      return examples[this.selectedCountry.code] || "123456789";
    },
    async savePhoneNumber() {
      // Validar mínimo solo al intentar guardar
      if (this.phoneNumber && this.phoneNumber.length < 6) {
        this.hasError = true;
        this.errorMessage = "El número debe tener al menos 6 dígitos";
        return;
      }
      if (!this.canSaveNumber) return;

      this.sending = true;

      try {
        const shopId = this.globalStore.shopId();

        // Solo enviar el teléfono si el usuario lo proporcionó
        const updateData = {};
        if (this.phoneNumber && this.selectedCountry) {
          updateData.phone = this.fullPhoneNumber;
        }

        if (Object.keys(updateData).length > 0) {
          const response = await api.patch(
            `/shops/patch/update-shop-by-id/${shopId}`,
            updateData
          );
          const data = response.data;

          if (data.success) {
            this.$emit("submit");
          }
        } else {
          // Si no hay número, simplemente continuar
          this.$emit("submit");
        }

        this.closeModal();
      } catch (error) {
        console.error("Error saving phone number:", error);
        this.hasError = true;
        this.errorMessage = "Error al guardar el número. Inténtalo de nuevo.";
      } finally {
        this.sending = false;
      }
    },
    skipStep() {
      this.$emit("skip-verification");
      this.closeModal();
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Header */
.modal-header {
  padding: 32px 40px 24px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.step-indicator {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.step-badge {
  background-color: #fef3e2;
  color: #f9931e;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.optional-badge {
  background-color: #f0f9ff;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.welcome-subtitle strong {
  color: #f9931e;
  font-weight: 600;
}

/* Body */
.modal-body {
  padding: 24px 40px 32px;
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-intro {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

/* Optional Notice */
.optional-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.optional-notice i {
  color: #0369a1;
  margin-top: 2px;
  flex-shrink: 0;
}

.notice-content strong {
  color: #111827;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.notice-content p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

/* Phone Input */
.phone-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.country-selector {
  flex: 0 0 200px;
}

.country-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.country-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.country-select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.phone-number-input {
  flex: 1;
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.phone-number-input:focus-within {
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.phone-number-input.error,
.phone-input.error {
  border-color: #ef4444;
}

.dial-code-display {
  background-color: #f9fafb;
  padding: 12px;
  border-right: 1px solid #d1d5db;
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.phone-input {
  flex: 1;
  padding: 12px;
  border: none;
  font-size: 14px;
  outline: none;
  background-color: white;
}

.phone-input::placeholder {
  color: #9ca3af;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 13px;
  margin-top: 4px;
}

.phone-example {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  margin-top: 8px;
}

/* Benefits Section */
.benefits-section {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.benefit-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.benefit-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.benefit-icon.blue {
  background-color: #3b82f6;
}

.benefit-icon.orange {
  background-color: #f9931e;
}

.benefit-icon.purple {
  background-color: #8b5cf6;
}

.benefit-content h4 {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.benefit-content p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.benefits-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.benefits-note i {
  color: #10b981;
  margin-top: 1px;
  flex-shrink: 0;
}

/* Privacy Notice */
.privacy-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.4;
}

.privacy-notice i {
  margin-top: 2px;
  flex-shrink: 0;
}

.privacy-content strong {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.privacy-content p {
  margin: 0;
  line-height: 1.5;
}

/* Footer */
.modal-footer {
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-secondary {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
}

.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e88613;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.3);
}

.btn-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .phone-input-container {
    flex-direction: column;
  }

  .country-selector {
    flex: none;
  }

  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .benefits-section {
    padding: 16px;
  }
}

/* Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
