<template>
  <teleport to="body">
    <div class="toast-container">
      <transition name="toast" appear>
        <div 
          :class="['toast', `toast--${state}`]"
          v-if="visible"
        >
      <div class="toast__icon">
        <svg v-if="state === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="state === 'danger'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="state === 'information'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <div class="toast__content">
        <p class="toast__message">{{ message }}</p>
      </div>
      
      <button 
        class="toast__close"
        @click="close"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      </div>
    </transition>
  </div>
</teleport>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: 'information',
      validator(value) {
        return ['success', 'danger', 'information'].includes(value);
      }
    },
    duration: {
      type: Number,
      default: 4000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: true,
      timeoutId: null
    };
  },
  mounted() {
    if (this.autoClose && this.duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  beforeDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  },
  methods: {
    close() {
      this.visible = false;
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: white;
  border-left: 4px solid;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
  opacity: 0.3;
}

.toast--success {
  border-left-color: #10b981;
  color: #065f46;
  background: #ecfdf5;
}

.toast--danger {
  border-left-color: #ef4444;
  color: #991b1b;
  background: #fef2f2;
}

.toast--information {
  border-left-color: #3b82f6;
  color: #1e40af;
  background: #eff6ff;
}

.toast__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-top: 2px;
}

.toast--success .toast__icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.toast--danger .toast__icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.toast--information .toast__icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  word-wrap: break-word;
}

.toast__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: 0.6;
  transition: all 0.2s ease;
  margin-top: 2px;
}

.toast__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.toast__close:active {
  transform: scale(0.95);
}

/* Animaciones de transición */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    right: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: 100%;
    margin: 0;
  }
  
  .toast__message {
    font-size: 13px;
  }
}

/* Estados de hover para mejor interactividad */
.toast:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Efectos adicionales para estados */
.toast--success:hover {
  background: #d1fae5;
}

.toast--danger:hover {
  background: #fee2e2;
}

.toast--information:hover {
  background: #dbeafe;
}
</style>