<script setup lang="ts">
import AuthLayout from '../layouts/AuthLayout.vue'
import LoginButton from '../components/LoginButton.vue'

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<template>
  <AuthLayout>
    <div class="main-card-wrapper">
      <img
        src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
        alt="Auth0 Logo"
        class="auth0-logo"
        @error="handleImageError"
      />
      <h1 class="main-title">Nebula</h1>
      <div class="action-card">
        <p class="action-text">Get started by signing in to your account</p>
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

.auth0-logo {
  width: 160px;
  margin-bottom: 1.5rem;
  opacity: 0;
  animation: slideInDown 1s ease-out forwards 0.2s;
}

.main-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #f7fafc;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  opacity: 0;
  animation: fadeIn 1s ease-out forwards 0.4s;
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

  .main-title {
    font-size: 2.2rem;
  }

  .auth0-logo {
    width: 120px;
  }
}
</style>
