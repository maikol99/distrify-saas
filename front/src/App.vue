<template>
  <RouterView />
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "App",
  components: {
  },
  setup() {
    const isOnline = ref(navigator.onLine);

    const handleOnlineStatusChange = () => {
      isOnline.value = navigator.onLine;
    };

    onMounted(() => {
      window.addEventListener("online", handleOnlineStatusChange);
      window.addEventListener("offline", handleOnlineStatusChange);
    });

    onUnmounted(() => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    });

    return {
      isOnline,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Poppins&display=swap");
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Open Sans", sans-serif;
}
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333333;
  background-color: #f8f6f2;
}
</style>
