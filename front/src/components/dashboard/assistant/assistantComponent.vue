<template>
  <div class="assistant-page">
    <!-- Header -->
    <div class="assistant-header">
      <div class="header-info">
        <div class="header-avatar">
          <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <div>
          <h1 class="header-title">Distri <span class="badge-ia">IA</span></h1>
          <p class="header-subtitle">Tu asistente de negocio — hablá o escribí</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-clear" @click="clearChat" title="Limpiar conversación">
          <span class="material-symbols-outlined">delete_sweep</span>
          <span class="btn-label">Limpiar</span>
        </button>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="quick-actions-bar">
      <button
        v-for="action in quickActions"
        :key="action.label"
        class="quick-chip"
        :class="{ 'quick-chip--loading': isProcessing }"
        @click="sendQuickAction(action.text)"
        :disabled="isProcessing"
      >
        <span class="material-symbols-outlined chip-icon">{{ action.icon }}</span>
        {{ action.label }}
      </button>
    </div>

    <!-- Premium blocked -->
    <div v-if="isPremiumBlocked" class="premium-gate">
      <div class="premium-gate-icon">
        <span class="material-symbols-outlined">workspace_premium</span>
      </div>
      <h2 class="premium-gate-title">Función exclusiva Premium</h2>
      <p class="premium-gate-text">
        El asistente IA Distri está disponible únicamente en el <strong>plan Premium</strong>.<br>
        Actualizá tu plan para acceder a todas las funciones de inteligencia artificial.
      </p>
      <div class="premium-gate-features">
        <div class="premium-feature"><span class="material-symbols-outlined">check_circle</span> Consultas en tiempo real de ventas e inventario</div>
        <div class="premium-feature"><span class="material-symbols-outlined">check_circle</span> Creación de ventas, compras y productos por voz o texto</div>
        <div class="premium-feature"><span class="material-symbols-outlined">check_circle</span> Análisis automático del negocio</div>
      </div>
      <a href="mailto:soporte@distrify.com" class="btn-upgrade">
        <span class="material-symbols-outlined">rocket_launch</span>
        Actualizar a Premium
      </a>
    </div>

    <!-- Chat area -->
    <div v-else class="chat-container" ref="chatContainer">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-avatar">
          <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <h2 class="empty-title">Hola, soy Distri 👋</h2>
        <p class="empty-text">
          Puedo ayudarte a consultar tus ventas, inventario, clientes y más,<br>
          o crear ventas, productos, compras y clientes con tu voz o texto.
        </p>
        <div class="examples-grid">
          <button
            v-for="ex in examples"
            :key="ex"
            class="example-bubble"
            @click="sendQuickAction(ex)"
          >
            "{{ ex }}"
          </button>
        </div>
      </div>

      <!-- Messages -->
      <template v-else>
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="message-row"
          :class="msg.role === 'user' ? 'message-row--user' : 'message-row--assistant'"
        >
          <!-- Avatar -->
          <div v-if="msg.role === 'assistant'" class="msg-avatar msg-avatar--ai">
            <span class="material-symbols-outlined">smart_toy</span>
          </div>

          <!-- Preview card -->
          <div v-if="msg.preview" class="preview-card" :class="`preview-card--${msg.preview.preview_kind}`">
            <!-- Sale preview -->
            <template v-if="msg.preview.preview_kind === 'sale'">
              <div class="preview-header">
                <span class="material-symbols-outlined preview-icon">receipt_long</span>
                <div>
                  <div class="preview-title">Previsualización de Venta</div>
                  <div class="preview-subtitle">Revisá los datos antes de confirmar</div>
                </div>
              </div>
              <div class="preview-items">
                <div v-for="item in msg.preview.data.items" :key="item.product_id" class="preview-item">
                  <span class="item-name">{{ item.product_name }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                  <span class="item-price">${{ formatMoney(item.unit_price) }}</span>
                  <span class="item-subtotal">${{ formatMoney(item.subtotal) }}</span>
                </div>
              </div>
              <div class="preview-summary">
                <div class="summary-row" v-if="msg.preview.data.client_name">
                  <span>Cliente</span>
                  <span>{{ msg.preview.data.client_name }}</span>
                </div>
                <div class="summary-row">
                  <span>Método de pago</span>
                  <span>{{ msg.preview.data.payment_method }}</span>
                </div>
                <div class="summary-row" v-if="msg.preview.data.discount > 0">
                  <span>Descuento</span>
                  <span class="text-red">-{{ msg.preview.data.discount }}% (-${{ formatMoney(msg.preview.data.discount_amount) }})</span>
                </div>
                <div class="summary-row summary-total">
                  <span>Total</span>
                  <span>${{ formatMoney(msg.preview.data.total) }}</span>
                </div>
              </div>
            </template>

            <!-- Product preview -->
            <template v-if="msg.preview.preview_kind === 'product'">
              <div class="preview-header">
                <span class="material-symbols-outlined preview-icon">inventory_2</span>
                <div>
                  <div class="preview-title">Nuevo Producto</div>
                  <div class="preview-subtitle">Revisá los datos antes de confirmar</div>
                </div>
              </div>
              <div class="preview-summary">
                <div class="summary-row"><span>Nombre</span><span>{{ msg.preview.data.name }}</span></div>
                <div class="summary-row"><span>Código</span><span>{{ msg.preview.data.code }}</span></div>
                <div class="summary-row"><span>Precio compra</span><span>${{ formatMoney(msg.preview.data.buyPrice) }}</span></div>
                <div class="summary-row"><span>Precio venta</span><span>${{ formatMoney(msg.preview.data.sellPrice) }}</span></div>
                <div class="summary-row"><span>Stock inicial</span><span>{{ msg.preview.data.quantity }} unidades</span></div>
                <div class="summary-row" v-if="msg.preview.data.category"><span>Categoría</span><span>{{ msg.preview.data.category }}</span></div>
                <div class="summary-row"><span>Margen de utilidad</span><span class="text-green">{{ msg.preview.data.utilidad }}%</span></div>
              </div>
            </template>

            <!-- Client preview -->
            <template v-if="msg.preview.preview_kind === 'client'">
              <div class="preview-header">
                <span class="material-symbols-outlined preview-icon">person_add</span>
                <div>
                  <div class="preview-title">Nuevo Cliente</div>
                  <div class="preview-subtitle">Revisá los datos antes de confirmar</div>
                </div>
              </div>
              <div class="preview-summary">
                <div class="summary-row"><span>Nombre</span><span>{{ msg.preview.data.name }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.email"><span>Email</span><span>{{ msg.preview.data.email }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.phone"><span>Teléfono</span><span>{{ msg.preview.data.phone }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.address"><span>Dirección</span><span>{{ msg.preview.data.address }}</span></div>
              </div>
            </template>

            <!-- Supplier preview -->
            <template v-if="msg.preview.preview_kind === 'supplier'">
              <div class="preview-header">
                <span class="material-symbols-outlined preview-icon">badge</span>
                <div>
                  <div class="preview-title">Nuevo Proveedor</div>
                  <div class="preview-subtitle">Revisá los datos antes de confirmar</div>
                </div>
              </div>
              <div class="preview-summary">
                <div class="summary-row"><span>Nombre</span><span>{{ msg.preview.data.name }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.company"><span>Empresa</span><span>{{ msg.preview.data.company }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.email"><span>Email</span><span>{{ msg.preview.data.email }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.phone"><span>Teléfono</span><span>{{ msg.preview.data.phone }}</span></div>
                <div class="summary-row" v-if="msg.preview.data.cuit"><span>CUIT</span><span>{{ msg.preview.data.cuit }}</span></div>
              </div>
            </template>

            <!-- Purchase preview -->
            <template v-if="msg.preview.preview_kind === 'purchase'">
              <div class="preview-header">
                <span class="material-symbols-outlined preview-icon">shopping_cart</span>
                <div>
                  <div class="preview-title">Previsualización de Compra</div>
                  <div class="preview-subtitle">Revisá los datos antes de confirmar</div>
                </div>
              </div>
              <div class="preview-items">
                <div v-for="item in msg.preview.data.items" :key="item.product_id" class="preview-item">
                  <span class="item-name">{{ item.product_name }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                  <span class="item-price">${{ formatMoney(item.buy_price) }}</span>
                  <span class="item-subtotal">${{ formatMoney(item.subtotal) }}</span>
                </div>
              </div>
              <div class="preview-summary">
                <div class="summary-row">
                  <span>Proveedor</span>
                  <span>{{ msg.preview.data.supplier_name }}</span>
                </div>
                <div class="summary-row">
                  <span>Método de pago</span>
                  <span>{{ msg.preview.data.payment_method }}</span>
                </div>
                <div class="summary-row summary-total">
                  <span>Total</span>
                  <span>${{ formatMoney(msg.preview.data.total) }}</span>
                </div>
              </div>
            </template>

            <!-- Warnings -->
            <div v-if="msg.preview.warnings?.length" class="preview-warnings">
              <div v-for="w in msg.preview.warnings" :key="w" class="preview-warning">
                <span class="material-symbols-outlined">warning</span> {{ w }}
              </div>
            </div>

            <!-- Action buttons -->
            <div v-if="!msg.preview.confirmed && !msg.preview.cancelled" class="preview-actions">
              <button class="btn-confirm" @click="confirmPreview(i, msg.preview)" :disabled="isProcessing">
                <span class="material-symbols-outlined">check_circle</span>
                Confirmar y crear
              </button>
              <button class="btn-cancel" @click="cancelPreview(i)" :disabled="isProcessing">
                <span class="material-symbols-outlined">cancel</span>
                Cancelar
              </button>
            </div>
            <div v-else-if="msg.preview.confirmed" class="preview-status preview-status--confirmed">
              <span class="material-symbols-outlined">check_circle</span> Confirmado y creado
            </div>
            <div v-else-if="msg.preview.cancelled" class="preview-status preview-status--cancelled">
              <span class="material-symbols-outlined">cancel</span> Cancelado
            </div>
          </div>

          <!-- Text bubble -->
          <div v-else class="message-bubble" :class="msg.role === 'user' ? 'bubble--user' : 'bubble--assistant'">
            <div class="message-text" v-html="renderMessage(msg.text)"></div>
            <div class="message-time">{{ formatTime(msg.ts) }}</div>
          </div>

          <div v-if="msg.role === 'user'" class="msg-avatar msg-avatar--user">
            <span class="material-symbols-outlined">person</span>
          </div>
        </div>
      </template>

      <!-- Typing indicator -->
      <div v-if="isProcessing" class="message-row message-row--assistant">
        <div class="msg-avatar msg-avatar--ai">
          <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <div class="message-bubble bubble--assistant bubble--typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div v-if="!isPremiumBlocked" class="input-area">
      <!-- Mic status bar -->
      <div v-if="isListening" class="listening-bar">
        <span class="pulse-dot"></span>
        <span class="listening-text">Escuchando... hablá ahora</span>
        <div class="sound-waves">
          <span v-for="n in 5" :key="n" class="wave-bar"></span>
        </div>
      </div>

      <div class="input-row">
        <!-- Mic button -->
        <button
          class="mic-btn"
          :class="{ 'mic-btn--active': isListening, 'mic-btn--unsupported': !speechSupported }"
          @click="toggleListening"
          :title="isListening ? 'Detener grabación' : speechSupported ? 'Hablar con el asistente' : (speechError || 'Voz no disponible')"
        >
          <span class="material-symbols-outlined">
            {{ isListening ? 'stop_circle' : 'mic' }}
          </span>
        </button>

        <!-- Text input -->
        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="currentInput"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="() => {}"
            @input="autoResize"
            placeholder="Escribí o usá el micrófono..."
            :disabled="isProcessing"
            rows="1"
            class="chat-input"
          ></textarea>
        </div>

        <!-- Send button -->
        <button
          class="send-btn"
          :class="{ 'send-btn--ready': currentInput.trim() && !isProcessing }"
          @click="sendMessage"
          :disabled="!currentInput.trim() || isProcessing"
        >
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>

      <p class="input-hint">Enter para enviar · Shift+Enter para nueva línea · Micrófono para hablar</p>
    </div>
  </div>
</template>

<script>
import assistantService from '@/services/assistantService';
import { useSalesListStore } from '@/stores/salesListStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useBuysStore } from '@/stores/buysStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useSuppliersStore } from '@/stores/suppliersStore';
import { useStockStore } from '@/stores/stockStore';

export default {
  name: 'AssistantComponent',

  data() {
    return {
      messages: [],
      currentInput: '',
      isProcessing: false,
      isListening: false,
      speechSupported: false,
      speechError: null,
      isPremiumBlocked: false,
      recognition: null,
      globalStore: useGlobalStore(),
      salesListStore: useSalesListStore(),
      buysStore: useBuysStore(),
      clientsStore: useClientsStore(),
      suppliersStore: useSuppliersStore(),
      stockStore: useStockStore(),

      quickActions: [
        { label: 'Ventas de hoy', icon: 'trending_up', text: '¿Cuánto vendí hoy?' },
        { label: 'Stock bajo', icon: 'inventory_2', text: '¿Qué productos tienen bajo stock?' },
        { label: 'Estado de caja', icon: 'point_of_sale', text: '¿Cuál es el estado actual de la caja?' },
        { label: 'Nueva venta', icon: 'add_shopping_cart', text: 'Quiero registrar una venta' },
        { label: 'Nuevo producto', icon: 'add_box', text: 'Quiero agregar un nuevo producto' },
        { label: 'Nueva compra', icon: 'shopping_cart', text: 'Quiero registrar una compra a un proveedor' },
      ],

      examples: [
        '¿Cuánto vendí esta semana?',
        'Vender 2 Café 250g a $800 cada uno, pagó con efectivo',
        'Agregar producto Té Verde, código 202, compra $300, venta $500',
        'Registrar compra a Proveedor ABC: 10 unidades de café a $400',
      ],
    };
  },

  mounted() {
    this.initSpeechRecognition();
    this.scrollToBottom();
  },

  methods: {
    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      // Verificar contexto seguro (HTTPS o localhost)
      if (!window.isSecureContext) {
        this.speechSupported = false;
        this.speechError = 'El micrófono requiere HTTPS. Accedé por localhost o habilitá HTTPS.';
        return;
      }

      if (!SpeechRecognition) {
        this.speechSupported = false;
        this.speechError = 'Tu navegador no soporta reconocimiento de voz. Usá Chrome o Edge.';
        return;
      }

      this.speechSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-AR';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.currentInput = transcript;
        this.isListening = false;
        this.$nextTick(() => this.autoResize());
        setTimeout(() => this.sendMessage(), 300);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (event.error === 'not-allowed') {
          this.speechError = 'Permiso de micrófono denegado. Habilitalo en la configuración del navegador.';
          this.speechSupported = false;
        } else if (event.error === 'no-speech') {
          // No hacer nada, es normal
        } else if (event.error === 'aborted') {
          // Cancelado manualmente, ignorar
        } else {
          this.speechError = `Error de micrófono: ${event.error}`;
        }
        // Reinicializar para que pueda usarse de nuevo
        this.$nextTick(() => this.initSpeechRecognition());
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Reinicializar instancia para el próximo uso (evita el error "already started")
        this.$nextTick(() => this.initSpeechRecognition());
      };
    },

    async toggleListening() {
      if (!this.speechSupported) {
        alert(this.speechError || 'El micrófono no está disponible en este navegador o contexto.');
        return;
      }
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
        return;
      }

      this.isListening = true;
      try {
        this.recognition.start();
      } catch (err) {
        this.isListening = false;
        // Si la instancia está en mal estado, reinicializar y reintentar
        this.initSpeechRecognition();
      }
    },

    async sendMessage() {
      const text = this.currentInput.trim();
      if (!text || this.isProcessing) return;

      this.currentInput = '';
      this.$nextTick(() => this.autoResize());

      this.messages.push({ role: 'user', text, ts: new Date() });
      this.scrollToBottom();

      this.isProcessing = true;

      try {
        const history = this.buildHistory();
        const response = await assistantService.chat(text, history);

        // Check if response is a preview object
        if (response && typeof response === 'object' && response.__type === 'preview') {
          this.messages.push({
            role: 'assistant',
            text: null,
            preview: { ...response, confirmed: false, cancelled: false },
            ts: new Date(),
          });
        } else {
          this.messages.push({
            role: 'assistant',
            text: typeof response === 'string' ? response : JSON.stringify(response),
            ts: new Date(),
          });
        }
      } catch (error) {
        console.error('Error:', error);
        const status = error?.response?.status ?? error?.status;
        if (status === 403) {
          this.isPremiumBlocked = true;
        } else {
          this.messages.push({
            role: 'assistant',
            text: '❌ Ocurrió un error al procesar tu consulta. Por favor intentá de nuevo.',
            ts: new Date(),
          });
        }
      } finally {
        this.isProcessing = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },

    async confirmPreview(index, preview) {
      this.messages[index].preview.confirmed = true;

      const confirmText = this.buildConfirmText(preview);

      this.messages.push({ role: 'user', text: 'Sí, confirmar', ts: new Date() });
      this.scrollToBottom();
      this.isProcessing = true;

      try {
        const history = this.buildHistory();
        const response = await assistantService.chat(confirmText, history);

        this.messages.push({
          role: 'assistant',
          text: typeof response === 'string' ? response : (response?.message ?? '✅ Creado exitosamente.'),
          ts: new Date(),
        });

        // Refrescar el store correspondiente para que el historial se actualice
        await this.refreshRelatedStore(preview.preview_kind);
      } catch (error) {
        console.error('Error confirming:', error);
        this.messages.push({
          role: 'assistant',
          text: '❌ Error al confirmar. Por favor intentá de nuevo.',
          ts: new Date(),
        });
      } finally {
        this.isProcessing = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },

    async refreshRelatedStore(kind) {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;
        if (kind === 'sale') {
          await this.salesListStore.fetchSales(shopId);
        } else if (kind === 'purchase') {
          await this.buysStore.getAllBuys();
        } else if (kind === 'client') {
          await this.clientsStore.fetchClients();
        } else if (kind === 'supplier') {
          await this.suppliersStore.getAllSuppliers();
        } else if (kind === 'product') {
          await this.stockStore.fetchProducts();
        }
      } catch (e) {
        // silencioso — el refresh es best-effort
      }
    },

    cancelPreview(index) {
      this.messages[index].preview.cancelled = true;
      this.messages.push({
        role: 'assistant',
        text: 'Entendido, cancelé la operación. ¿Querés modificar algo o empezar de nuevo?',
        ts: new Date(),
      });
      this.$nextTick(() => this.scrollToBottom());
    },

    buildConfirmText(preview) {
      const d = preview.data;
      switch (preview.preview_kind) {
        case 'sale': {
          const itemsStr = d.items.map(i => `${i.product_name} (id:${i.product_id}) x${i.quantity} a $${i.unit_price}`).join(', ');
          return `Confirmar venta. Items: ${itemsStr}. Cliente: ${d.client_name || 'Sin cliente'} (id:${d.client_id || ''}). Método: ${d.payment_method}. Descuento: ${d.discount || 0}%. Subtotal: $${d.subtotal}. Total: $${d.total}. Por favor usá confirm_sale con estos datos exactos.`;
        }
        case 'product':
          return `Confirmar creación del producto: nombre "${d.name}", código "${d.code}", precio compra $${d.buyPrice}, precio venta $${d.sellPrice}, stock ${d.quantity}${d.category ? `, categoría "${d.category}"` : ''}. Por favor usá confirm_product con estos datos exactos.`;
        case 'client':
          return `Confirmar registro del cliente: nombre "${d.name}"${d.email ? `, email "${d.email}"` : ''}${d.phone ? `, teléfono "${d.phone}"` : ''}${d.address ? `, dirección "${d.address}"` : ''}. Por favor usá confirm_client con estos datos exactos.`;
        case 'supplier':
          return `Confirmar registro del proveedor: nombre "${d.name}"${d.company ? `, empresa "${d.company}"` : ''}${d.email ? `, email "${d.email}"` : ''}${d.phone ? `, teléfono "${d.phone}"` : ''}${d.cuit ? `, CUIT "${d.cuit}"` : ''}. Por favor usá confirm_supplier con estos datos exactos.`;
        case 'purchase': {
          const itemsStr = d.items.map(i => `${i.product_name} (id:${i.product_id}) x${i.quantity} a $${i.buy_price}`).join(', ');
          return `Confirmar compra. Proveedor: "${d.supplier_name}" (id:${d.supplier_id || ''}). Items: ${itemsStr}. Total: $${d.total}. Método: ${d.payment_method}. Por favor usá confirm_purchase con estos datos exactos.`;
        }
        default:
          return 'Sí, confirmar la operación.';
      }
    },

    buildHistory() {
      return this.messages
        .slice(-12)
        .filter(m => m.text)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
    },

    sendQuickAction(text) {
      if (this.isProcessing) return;
      this.currentInput = text;
      this.sendMessage();
    },

    clearChat() {
      this.messages = [];
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    autoResize() {
      const el = this.$refs.inputRef;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    },

    formatTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    },

    formatMoney(n) {
      if (n == null) return '0';
      return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    renderMessage(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
        .replace(/\n/g, '<br>');
    },
  },
};
</script>

<style scoped>
/* ── Page layout ──────────────────────────────────────────────────── */
.assistant-page {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 56px);
  background: #f8fafc;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* ── Header ───────────────────────────────────────────────────────── */
.assistant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.header-info { display: flex; align-items: center; gap: 14px; }

.header-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.3);
}

.header-avatar .material-symbols-outlined { font-size: 26px; }

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-ia {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #f9931e, #e8821a);
  color: white;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.header-subtitle { font-size: 13px; color: #64748b; margin: 0; }

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-clear:hover { background: #f8fafc; color: #ef4444; border-color: #fecaca; }
.btn-clear .material-symbols-outlined { font-size: 18px; }

/* ── Quick actions ────────────────────────────────────────────────── */
.quick-actions-bar {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
  scrollbar-width: none;
  width: 100%;
  box-sizing: border-box;
}

.quick-actions-bar::-webkit-scrollbar { display: none; }

.quick-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
}

.quick-chip:hover:not(:disabled) { background: #fff7ed; border-color: #f9931e; color: #f9931e; }
.quick-chip:disabled { opacity: 0.5; cursor: not-allowed; }
.chip-icon { font-size: 16px; }

/* ── Chat container ───────────────────────────────────────────────── */
.chat-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
  width: 100%;
  box-sizing: border-box;
}

/* ── Empty state ──────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 40px 20px;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.empty-avatar {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(249, 147, 30, 0.25);
  margin-bottom: 8px;
}

.empty-avatar .material-symbols-outlined { font-size: 38px; }
.empty-title { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
.empty-text { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0; max-width: 100%; }

.examples-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
  max-width: 640px;
  width: 100%;
}

.example-bubble {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  font-style: italic;
  word-break: break-word;
  text-align: center;
}

.example-bubble:hover { background: #fff7ed; border-color: #f9931e; color: #f9931e; }

/* ── Message rows ─────────────────────────────────────────────────── */
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 800px;
  width: 100%;
}

.message-row--user {
  align-self: flex-end;
  flex-direction: row;
  justify-content: flex-end;
  margin-left: auto;
}

.message-row--assistant { align-self: flex-start; }

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-avatar .material-symbols-outlined { font-size: 18px; }
.msg-avatar--ai { background: linear-gradient(135deg, #f9931e, #e8821a); color: white; }
.msg-avatar--user { background: #e2e8f0; color: #64748b; }

/* ── Bubbles ──────────────────────────────────────────────────────── */
.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  max-width: calc(100% - 80px);
  position: relative;
}

.bubble--user {
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble--assistant {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bubble--typing { display: flex; align-items: center; gap: 5px; padding: 14px 20px; }

.message-text { font-size: 14px; line-height: 1.6; word-break: break-word; }
.message-text :deep(strong) { font-weight: 600; }
.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.bubble--user .message-text :deep(code) { background: rgba(255, 255, 255, 0.2); }
.message-text :deep(ul) { padding-left: 18px; margin: 6px 0; }
.message-text :deep(li) { margin-bottom: 3px; }

.message-time { font-size: 10px; opacity: 0.55; margin-top: 5px; text-align: right; }

/* ── Preview card ─────────────────────────────────────────────────── */
.preview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  max-width: calc(100% - 42px);
  min-width: 320px;
}

.preview-card--sale .preview-header { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-bottom: 1px solid #a7f3d0; }
.preview-card--product .preview-header { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-bottom: 1px solid #bfdbfe; }
.preview-card--client .preview-header { background: linear-gradient(135deg, #fdf4ff, #f3e8ff); border-bottom: 1px solid #e9d5ff; }
.preview-card--supplier .preview-header { background: linear-gradient(135deg, #fff7ed, #fed7aa); border-bottom: 1px solid #fdba74; }
.preview-card--purchase .preview-header { background: linear-gradient(135deg, #fefce8, #fef08a); border-bottom: 1px solid #fde047; }

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.preview-icon { font-size: 28px; color: #374151; }
.preview-title { font-size: 15px; font-weight: 700; color: #1e293b; }
.preview-subtitle { font-size: 12px; color: #64748b; margin-top: 1px; }

/* Items list */
.preview-items {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  color: #374151;
}

.item-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-qty { color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.item-price { color: #6b7280; font-size: 12px; }
.item-subtotal { font-weight: 600; color: #1e293b; }

/* Summary rows */
.preview-summary {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #475569;
}

.summary-row span:last-child { font-weight: 500; color: #1e293b; }

.summary-total {
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  margin-top: 4px;
}

.summary-total span:first-child { font-weight: 700; font-size: 14px; color: #1e293b; }
.summary-total span:last-child { font-size: 18px; font-weight: 700; color: #059669; }

.text-red { color: #ef4444 !important; }
.text-green { color: #059669 !important; }

/* Warnings */
.preview-warnings {
  padding: 8px 16px;
  background: #fffbeb;
  border-top: 1px solid #fde68a;
}

.preview-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #92400e;
}

.preview-warning .material-symbols-outlined { font-size: 16px; color: #f59e0b; }

/* Action buttons */
.preview-actions {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.btn-confirm {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) { background: #fff5f5; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-confirm .material-symbols-outlined,
.btn-cancel .material-symbols-outlined { font-size: 18px; }

/* Status badges */
.preview-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  border-top: 1px solid #f1f5f9;
}

.preview-status .material-symbols-outlined { font-size: 18px; }
.preview-status--confirmed { color: #059669; background: #ecfdf5; }
.preview-status--cancelled { color: #ef4444; background: #fef2f2; }

/* ── Typing dots ──────────────────────────────────────────────────── */
.dot {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: dotBounce 1.2s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── Input area ───────────────────────────────────────────────────── */
.input-area {
  flex-shrink: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px 14px;
  width: 100%;
  box-sizing: border-box;
}

.listening-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulseDot 1s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.sound-waves { display: flex; align-items: center; gap: 3px; margin-left: auto; }

.wave-bar {
  width: 3px;
  background: #f59e0b;
  border-radius: 2px;
  animation: waveBounce 1s infinite ease-in-out both;
}

.wave-bar:nth-child(1) { height: 8px; animation-delay: 0s; }
.wave-bar:nth-child(2) { height: 14px; animation-delay: 0.1s; }
.wave-bar:nth-child(3) { height: 20px; animation-delay: 0.2s; }
.wave-bar:nth-child(4) { height: 14px; animation-delay: 0.3s; }
.wave-bar:nth-child(5) { height: 8px; animation-delay: 0.4s; }

@keyframes waveBounce {
  0%, 100% { transform: scaleY(0.5); opacity: 0.7; }
  50% { transform: scaleY(1); opacity: 1; }
}

.input-row { display: flex; align-items: flex-end; gap: 10px; }

.mic-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.mic-btn:hover:not(.mic-btn--unsupported) { background: #fff7ed; border-color: #f9931e; color: #f9931e; }
.mic-btn--active { background: #ef4444 !important; border-color: #ef4444 !important; color: white !important; animation: micPulse 1.5s infinite; }
.mic-btn--unsupported { opacity: 0.4; cursor: not-allowed; }

@keyframes micPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
}

.mic-btn .material-symbols-outlined { font-size: 20px; }

.input-wrapper {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.input-wrapper:focus-within { border-color: #f9931e; background: white; box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1); }

.chat-input {
  width: 100%;
  padding: 11px 16px;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #1e293b;
  resize: none;
  overflow-y: auto;
  max-height: 120px;
  line-height: 1.5;
  display: block;
}

.chat-input::placeholder { color: #94a3b8; }

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.send-btn--ready { background: linear-gradient(135deg, #f9931e, #e8821a); color: white; box-shadow: 0 4px 12px rgba(249, 147, 30, 0.35); }
.send-btn--ready:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(249, 147, 30, 0.4); }
.send-btn:disabled { cursor: not-allowed; }
.send-btn .material-symbols-outlined { font-size: 20px; }

.input-hint { font-size: 11px; color: #cbd5e0; margin: 6px 0 0; text-align: center; }

/* ── Premium gate ─────────────────────────────────────────────────── */
.premium-gate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 16px;
  background: linear-gradient(135deg, #fdf4ff 0%, #fefce8 50%, #f0f9ff 100%);
}

.premium-gate-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
  margin-bottom: 8px;
}

.premium-gate-icon .material-symbols-outlined { font-size: 42px; }

.premium-gate-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.premium-gate-text {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  max-width: 480px;
  margin: 0;
}

.premium-gate-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: white;
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 18px 24px;
  margin: 8px 0;
  max-width: 420px;
  width: 100%;
}

.premium-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  text-align: left;
}

.premium-feature .material-symbols-outlined { font-size: 18px; color: #f59e0b; flex-shrink: 0; }

.btn-upgrade {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
  margin-top: 4px;
}

.btn-upgrade:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5); }
.btn-upgrade .material-symbols-outlined { font-size: 20px; }

/* ── Scrollbar ────────────────────────────────────────────────────── */
.chat-container::-webkit-scrollbar { width: 5px; }
.chat-container::-webkit-scrollbar-track { background: transparent; }
.chat-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

/* ── Responsive ───────────────────────────────────────────────────── */

/* Tablets (768px – 1024px) */
@media (max-width: 1024px) {
  .assistant-header,
  .quick-actions-bar,
  .input-area {
    padding-left: 20px;
    padding-right: 20px;
  }

  .chat-container { padding: 20px; }

  .preview-card { min-width: 280px; }

  .examples-grid { max-width: 500px; }
}

/* Mobile phones (≤ 768px) */
@media (max-width: 768px) {
  /* Layout: 64px top navbar + ~48px content-header sticky */
  .assistant-page {
    height: calc(100dvh - 64px - 48px);
  }

  /* Header */
  .assistant-header {
    padding: 12px 16px;
  }

  .header-avatar {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .header-avatar .material-symbols-outlined { font-size: 20px; }

  .header-title { font-size: 17px; }

  .header-subtitle { font-size: 11px; }

  .btn-label { display: none; }

  .btn-clear { padding: 8px; border-radius: 10px; }

  /* Quick actions */
  .quick-actions-bar {
    padding: 10px 16px;
    gap: 6px;
  }

  .quick-chip {
    padding: 6px 12px;
    font-size: 12px;
  }

  /* Chat */
  .chat-container {
    padding: 16px;
    gap: 14px;
  }

  /* Empty state */
  .empty-state { padding: 24px 12px; gap: 10px; }

  .empty-avatar { width: 60px; height: 60px; border-radius: 18px; }
  .empty-avatar .material-symbols-outlined { font-size: 30px; }

  .empty-title { font-size: 18px; }
  .empty-text { font-size: 13px; }
  .empty-text br { display: none; }

  .examples-grid { gap: 8px; }

  .example-bubble { padding: 8px 12px; font-size: 12px; }

  /* Messages */
  .message-bubble {
    max-width: calc(100% - 46px);
    padding: 10px 13px;
  }

  .message-text { font-size: 13px; }

  /* Preview card */
  .preview-card {
    min-width: unset;
    max-width: calc(100% - 42px);
    border-radius: 12px;
  }

  .preview-header { padding: 12px 14px; gap: 10px; }
  .preview-icon { font-size: 22px; }
  .preview-title { font-size: 14px; }
  .preview-subtitle { font-size: 11px; }

  .preview-items { padding: 10px 14px; gap: 6px; }

  .preview-item {
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    font-size: 12px;
  }

  .item-price { display: none; }

  .preview-summary { padding: 10px 14px; }

  .summary-row { font-size: 12px; }

  .summary-total span:last-child { font-size: 16px; }

  .preview-actions {
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
  }

  .btn-confirm,
  .btn-cancel { padding: 11px 14px; font-size: 13px; }

  /* Input area */
  .input-area {
    padding: 10px 16px 12px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  .chat-input { font-size: 16px; /* prevents iOS zoom on focus */ }

  .mic-btn,
  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    flex-shrink: 0;
  }

  .input-hint { display: none; }

  /* Premium gate */
  .premium-gate { padding: 32px 16px; gap: 12px; }

  .premium-gate-icon { width: 64px; height: 64px; border-radius: 18px; }
  .premium-gate-icon .material-symbols-outlined { font-size: 32px; }

  .premium-gate-title { font-size: 20px; }
  .premium-gate-text { font-size: 13px; }
  .premium-gate-text br { display: none; }

  .premium-gate-features {
    padding: 14px 16px;
    max-width: 100%;
  }

  .premium-feature { font-size: 13px; }

  .btn-upgrade { padding: 12px 22px; font-size: 14px; }
}

/* Small phones (≤ 390px) */
@media (max-width: 390px) {
  .header-title { font-size: 15px; }
  .header-subtitle { display: none; }

  .quick-chip { padding: 5px 10px; font-size: 11px; }

  .empty-title { font-size: 16px; }

  .message-bubble { padding: 9px 12px; }

  .premium-gate-title { font-size: 18px; }
}
</style>
