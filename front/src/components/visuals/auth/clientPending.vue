<template>
  <div class="confirmation-overlay">
    <div class="confirmation-container">
      <div class="confirmation-card">
        <div class="success-icon">&#10003;</div>
        <h2>¡Usuario Creado!</h2>
        <p>
          Tu cuenta ha sido creada exitosamente y está pendiente de aprobación.
        </p>
        <p>Una vez aprobada, podrás ingresar a la plataforma.</p>
        <button @click="goToLogin" class="login-button">Ir al inicio</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserCreationConfirmation",
  methods: {
    goToLogin() {
      this.$router.push("/inicio-cliente");
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap");

.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: "Poppins", sans-serif;
}

.confirmation-card {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
  transition: all 0.3s ease;
  z-index: 1001;
}

.success-icon {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 1rem;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 2rem;
}

p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.login-button {
  width: 100%;
  padding: 1rem;
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.login-button:hover {
  background-color: #5a51db;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 99, 255, 0.4);
}
</style>
