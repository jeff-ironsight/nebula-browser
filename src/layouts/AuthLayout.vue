<template>
  <div class="auth-screen">
    <slot/>
  </div>
</template>

<style scoped>
.auth-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
}
</style>
