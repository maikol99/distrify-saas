<template>
  <div class="under-development">
    <div class="icon-container">
      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L12 2L9 4L3 7V9L9 12L12 14L15 12L21 9Z" fill="currentColor"/>
        <path d="M9 12L3 15V17L9 20L12 22L15 20L21 17V15L15 12" fill="currentColor" opacity="0.7"/>
      </svg>
    </div>
    <h1>🚧 En Construcción 🚧</h1>
    <p>¡Estamos trabajando duro para traerte algo increíble!</p>
    <p class="subtitle">Esta sección estará disponible muy pronto.</p>
    
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <span class="progress-text">Progreso: 75%</span>
    </div>
    
    <div class="features-preview">
      <h3>¿Qué estamos preparando?</h3>
      <div class="features-grid">
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <span>Funcionalidades avanzadas</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎨</span>
          <span>Diseño mejorado</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🚀</span>
          <span>Experiencia optimizada</span>
        </div>
      </div>
    </div>
    
    <router-link to="/inicio" class="home-link">
      <span class="link-icon">🏠</span>
      Volver al inicio
    </router-link>
    
    <p class="thanks-message">¡Gracias por tu paciencia! 💙</p>
  </div>
</template>

<script>
export default {
  name: "UnderDevelopment",
  mounted() {
    // Animación de la barra de progreso
    setTimeout(() => {
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = '75%';
      }
    }, 500);
  }
};
</script>

<style scoped>
.under-development {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: white;
  text-align: center;
}

.icon-container {
  margin-bottom: 2rem;
}

.icon {
  width: 100px;
  height: 100px;
  color: #ffd700;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  to {
    text-shadow: 2px 2px 20px rgba(255,215,0,0.4), 2px 2px 4px rgba(0,0,0,0.3);
  }
}

p {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  font-style: italic;
  opacity: 0.8;
}

.progress-container {
  width: 100%;
  max-width: 400px;
  margin: 2rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(255,255,255,0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #ffd700);
  width: 0%;
  transition: width 2s ease-in-out;
  border-radius: 10px;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: bold;
}

.features-preview {
  margin: 3rem 0;
  max-width: 500px;
}

.features-preview h3 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255,255,255,0.2);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  margin-top: 2rem;
}

.home-link:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.link-icon {
  font-size: 1.2rem;
}

.thanks-message {
  font-size: 1rem;
  margin-top: 2rem;
  opacity: 0.7;
  font-style: italic;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  
  p {
    font-size: 1.1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .under-development {
    padding: 1rem;
  }
}
</style>