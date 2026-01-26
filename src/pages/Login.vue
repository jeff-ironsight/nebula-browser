<script setup lang="ts">
import AuthLayout from '../layouts/AuthLayout.vue'
import LoginButton from '../components/LoginButton.vue'
import nebulaLogoNamed from '../assets/nebula-named-900x512.png'

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<template>
  <AuthLayout>
    <div class="main-card-wrapper">
      <img
        :src="nebulaLogoNamed"
        alt="Nebula Logo"
        class="nebula-logo"
        @error="handleImageError"
      />
      <div class="action-card">
        <p class="action-text">Get started by signing in to your Nebula account</p>
        <LoginButton />
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.main-card-wrapper {
  background-color: #262a33;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  animation: fadeInScale 0.8s ease-out forwards;
}

.nebula-logo {
  width: 400px;
  height: auto;
  opacity: 0;
  animation: slideInDown 1s ease-out forwards 0.2s;
}

.action-card {
  background-color: #2d313c;
  border-radius: 15px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.8rem;
  width: calc(100% - 2rem);
  opacity: 0;
  animation: fadeIn 1s ease-out forwards 0.6s;
}

.action-text {
  font-size: 1.25rem;
  color: #cbd5e0;
  text-align: center;
  line-height: 1.6;
  font-weight: 400;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-70px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .main-card-wrapper {
    padding: 2rem;
    margin: 1rem;
  }

  .nebula-logo {
    width: 200px;
    max-width: 80%;
  }
}
</style>
