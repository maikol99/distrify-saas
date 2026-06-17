<template>
  <div class="confirm-modal">
    <div class="confirm-modal-content">
      <h2>No hay turno abierto</h2>
      <p>No puedes vender sin un turno abierto, abri tu turno y comenza a vender.</p>
      <div class="confirm-modal-actions">
        <button @click="irAPerfil" class="confirm-btn">Abrir turno</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  methods: {
    async irAPerfil() {
      await this.$router.push('/perfil')

      this.$emit('goTo');
    },
    cancelDelete() {
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped>
.confirm-modal {
  font-family: "Poppins", sans-serif;

  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 300px;
  border-radius: 10px;
  text-align: center;
}

.confirm-modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 10px;
}

.confirm-btn {
  background-color: rgb(23, 88, 200);
  color: white;
}

.confirm-btn:hover {
  background-color: rgb(23, 88, 250);

}

.cancel-btn {
  background-color: #3498db;
  color: white;
}

.cancel-btn:hover {
  background-color: #2980b9;
}
</style>