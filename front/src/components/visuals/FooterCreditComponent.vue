<template>
  <footer class="footer-credit">
    <a
      href="https://cuyocode.com.ar"
      target="_blank"
      rel="noopener noreferrer"
      class="footer-credit-link"
    >
      Powered by Alevia Pay — cuyocode.com.ar
    </a>
  </footer>
</template>

<script>
export default {
  name: "FooterCreditComponent",
};
</script>

<style scoped>
.footer-credit {
  width: 100%;
  padding: 12px 16px;
  text-align: center;
  background-color: transparent;
}

.footer-credit-link {
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
  text-decoration: none;
}

.footer-credit-link:hover {
  color: #ff9933;
  text-decoration: underline;
}
</style>
