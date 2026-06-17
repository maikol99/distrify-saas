<template>
  <div class="ai-interface-container" :class="{ 'is-open': isOpen }">
    <!-- Floating Trigger Button -->
    <button 
      v-if="!isOpen"
      class="ai-trigger-btn"
      @click="toggleInterface"
      title="Asistente IA"
    >
      <i class="fas fa-robot"></i>
    </button>

    <!-- Main Interface -->
    <div v-else class="ai-panel">
      <!-- Header -->
      <div class="ai-header">
        <div class="header-title">
          <i class="fas fa-robot"></i>
          <span>Asistente IA</span>
        </div>
        <button class="close-btn" @click="toggleInterface">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Chat Area -->
      <div class="chat-area" ref="chatArea">
        <div v-if="messages.length === 0" class="empty-state">
          <i class="fas fa-magic"></i>
          <p>¿En qué puedo ayudarte hoy?</p>
          <small>Prueba: "Crea una venta de pantalones por 5000"</small>
        </div>

        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message"
          :class="msg.type"
        >
          <div class="message-content">
            {{ msg.text }}
          </div>
          
          <!-- Action Preview Card -->
          <div v-if="msg.actionPreview" class="action-preview">
            <div class="preview-header">
              <i class="fas fa-receipt"></i>
              <span>Vista Previa: Venta</span>
            </div>
            <div class="preview-body">
              <div class="preview-item">
                <span class="label">Producto:</span>
                <span class="value">{{ msg.actionPreview.product }}</span>
              </div>
              <div class="preview-item">
                <span class="label">Precio:</span>
                <span class="value">${{ msg.actionPreview.price }}</span>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-confirm" @click="confirmAction(index)">
                <i class="fas fa-check"></i> Confirmar
              </button>
              <button class="btn-cancel" @click="cancelAction(index)">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="isProcessing" class="message assistant processing">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" v-if="!isProcessing">
        <button 
          v-for="action in quickActions" 
          :key="action.label"
          class="action-chip"
          @click="handleQuickAction(action)"
        >
          <i :class="action.icon"></i>
          {{ action.label }}
        </button>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <button 
          class="mic-btn" 
          :class="{ 'listening': isListening }"
          @click="toggleListening"
          title="Hablar"
        >
          <i class="fas" :class="isListening ? 'fa-stop' : 'fa-microphone'"></i>
        </button>
        <input 
          type="text" 
          v-model="currentInput"
          @keyup.enter="sendMessage"
          placeholder="Escribe o habla..."
          :disabled="isProcessing"
        />
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!currentInput.trim() || isProcessing"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import assistantService from '@/services/assistantService';

export default {
  name: 'AICommandInterface',
  data() {
    return {
      isOpen: false,
      isListening: false,
      isProcessing: false,
      currentInput: '',
      messages: [],
      quickActions: [
        { label: 'Resumen del día', icon: 'fas fa-chart-line', text: 'Dame un resumen de las ventas de hoy' },
        { label: 'Reporte de Stock', icon: 'fas fa-box-open', text: 'Genera un reporte de stock bajo' },
        { label: 'Nueva Venta', icon: 'fas fa-plus', text: 'Quiero crear una nueva venta' },
        { label: 'Nuevo Cliente', icon: 'fas fa-user-plus', text: 'Crear cliente ' }
      ],
      recognition: null
    }
  },
  mounted() {
    this.initSpeechRecognition();
  },
  methods: {
    initSpeechRecognition() {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'es-ES';
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.currentInput = transcript;
          this.isListening = false;
          // Optional: Auto-send after speech
          // this.sendMessage();
        };

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          this.isListening = false;
          this.messages.push({
            type: 'assistant',
            text: 'Hubo un error al escuchar. Por favor intenta escribir tu comando.'
          });
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      } else {
        console.warn('Speech recognition not supported');
      }
    },
    toggleInterface() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    toggleListening() {
      if (!this.recognition) {
        // Fallback for Firefox/Unsupported: Simulation Mode
        this.isListening = !this.isListening;
        if (this.isListening) {
          this.messages.push({
            type: 'assistant',
            text: '⚠️ Tu navegador no soporta voz nativa. Usando modo simulación para pruebas.'
          });
          
          setTimeout(() => {
            const mockCommands = [
              "Crear venta de pantalones por 5000",
              "Listar productos",
              "Ayuda",
              "Crear cliente Pedro",
              "Resumen del día"
            ];
            const randomCmd = mockCommands[Math.floor(Math.random() * mockCommands.length)];
            this.currentInput = randomCmd;
            this.isListening = false;
            this.sendMessage();
          }, 2000);
        }
        return;
      }

      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      } else {
        this.isListening = true;
        this.recognition.start();
      }
    },
    handleQuickAction(action) {
      if (action.label === 'Nueva Venta' || action.label === 'Nuevo Cliente') {
        this.currentInput = action.text;
        // Focus input if possible
      } else {
        this.currentInput = action.text;
        this.sendMessage();
      }
    },
    async sendMessage() {
      if (!this.currentInput.trim()) return;

      const text = this.currentInput;
      this.currentInput = '';
      
      // Add user message
      this.messages.push({
        type: 'user',
        text: text
      });
      this.scrollToBottom();

      this.isProcessing = true;

      // Simulate AI processing
      setTimeout(() => {
        this.isProcessing = false;
        this.processCommand(text);
        this.scrollToBottom();
      }, 1000);
    },
    async processCommand(text) {
      try {
        const response = await assistantService.chat(text);
        
        this.messages.push({
          type: 'assistant',
          text: response
        });
      } catch (error) {
        console.error('Error calling assistant:', error);
        this.messages.push({
          type: 'assistant',
          text: "Lo siento, hubo un error al procesar tu solicitud. Por favor intenta nuevamente."
        });
      }
    },
    confirmAction(messageIndex) {
      const msg = this.messages[messageIndex];
      if (!msg || !msg.actionPreview) return;

      let successText = '';
      if (msg.actionPreview.type === 'create_sale') {
        successText = `¡Listo! La venta de ${msg.actionPreview.product} ha sido creada exitosamente.`;
      } else if (msg.actionPreview.type === 'create_client') {
        successText = `¡Cliente ${msg.actionPreview.price} registrado correctamente!`;
      }

      this.messages.push({
        type: 'assistant',
        text: successText
      });
      
      this.scrollToBottom();
    },
    cancelAction(messageIndex) {
      this.messages.push({
        type: 'assistant',
        text: "Operación cancelada."
      });
      this.scrollToBottom();
    },
    scrollToBottom() {
      const container = this.$refs.chatArea;
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 100);
      }
    }
  }
}
</script>

<style scoped>
.ai-interface-container {
  position: fixed;
  bottom: 100px; /* Above help button */
  right: 30px;
  z-index: 1100;
  font-family: 'Poppins', sans-serif;
}

.ai-trigger-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(249, 147, 30, 0.4);
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.ai-trigger-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(249, 147, 30, 0.5);
}

.ai-panel {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e9ecef;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-header {
  padding: 15px 20px;
  background: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.chat-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-state i {
  font-size: 40px;
  color: #cbd5e0;
}

.message {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 15px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  word-wrap: break-word;
}

.message.user {
  align-self: flex-end;
  background: #f9931e;
  color: white;
  border-bottom-right-radius: 5px;
}

.message.assistant {
  align-self: flex-start;
  background: white;
  color: #2c3e50;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.action-preview {
  margin-top: 10px;
  background: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.preview-header {
  background: #e9ecef;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-body {
  padding: 10px 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
}

.preview-item .label {
  color: #6c757d;
}

.preview-item .value {
  font-weight: 600;
  color: #2c3e50;
}

.preview-actions {
  display: flex;
  border-top: 1px solid #e9ecef;
}

.preview-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-confirm {
  background: white;
  color: #f9931e;
  border-right: 1px solid #e9ecef !important;
}

.btn-confirm:hover {
  background: #f0f7fb;
}

.btn-cancel {
  background: white;
  color: #e74c3c;
}

.btn-cancel:hover {
  background: #fdf2f2;
}

.quick-actions {
  padding: 10px 15px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  background: white;
  border-top: 1px solid #e9ecef;
  scrollbar-width: none; /* Firefox */
}

.quick-actions::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.action-chip {
  background: white;
  border: 1px solid #f9931e;
  color: #f9931e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.action-chip:hover {
  background: #f0f7fb;
  transform: translateY(-1px);
}

.action-chip i {
  font-size: 11px;
}

.input-area {
  padding: 15px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-area input {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 10px 15px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
  color: #2c3e50;
}

.input-area input:focus {
  border-color: #f9931e;
}

.mic-btn, .send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mic-btn {
  background: #f8f9fa;
  color: #6c757d;
}

.mic-btn:hover {
  background: #e9ecef;
}

.mic-btn.listening {
  background: #e74c3c;
  color: white;
  animation: pulse 1.5s infinite;
}

.send-btn {
  background: #f9931e;
  color: white;
}

.send-btn:hover {
  background: #e8821a;
}

.send-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 5px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #a0aec0;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .ai-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    z-index: 2000;
  }
  
  .ai-trigger-btn {
    bottom: 90px;
    right: 20px;
  }
}
</style>
