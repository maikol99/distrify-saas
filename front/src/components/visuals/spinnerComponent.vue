<template>
  <div class="spinner-container">
    <div class="loader">
      <div class="inner"></div>
    </div>
  </div>
</template>

<style scoped>
.spinner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo semitransparente */
  z-index: 9999;
}

.loader {
  width: 88px;
  height: 88px;
  border: 4px solid transparent;
  border-top: 4px solid #f9931e; /* Color principal Distrify */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;
}

.loader::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 50%;
  top: 25%;
  left: 25%;
  background-color: #f9931e; /* Color secundario */
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
