<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { Lock, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-vue-next'

const adminStore = useAdminStore()
const router = useRouter()

const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!password.value) return
  
  isLoading.value = true
  error.value = ''
  
  // Simulate delay for premium feel
  await new Promise(r => setTimeout(r, 600))
  
  const success = await adminStore.login(password.value)
  if (success) {
    router.push({ name: 'admin-dashboard' })
  } else {
    error.value = '密码不正确，请联系系统管理员。'
    password.value = ''
  }
  isLoading.value = false
}
</script>

<template>
  <div class="login-view">
    <RouterLink to="/" class="back-link">
      <ArrowLeft :size="16" />
      <span>返回首页</span>
    </RouterLink>

    <div class="login-card glass-panel blur-card">
      <div class="login-header">
        <div class="icon-orb">
          <ShieldCheck :size="40" class="gold-text" />
        </div>
        <h2 class="gold-text">管理后台登录</h2>
        <p>请输入超级管理员密码以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div :class="['input-group', { 'has-error': error }]">
          <Lock class="input-icon" :size="20" />
          <input 
            v-model="password" 
            type="password" 
            placeholder="管理员密码"
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </div>

        <div v-if="error" class="error-msg">
          <AlertCircle :size="16" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" :disabled="isLoading" class="login-btn">
          <span v-if="!isLoading">验证身份</span>
          <span v-else class="loader"></span>
        </button>
      </form>
      
      <div class="login-footer">
        <p>&copy; 2026 隐翅阁 - 数据维护系统</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
  position: relative;
  padding: 2rem;
}

.back-link {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: var(--transition);
}

.back-link:hover {
  color: var(--gold);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 3rem;
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  margin-bottom: 2.5rem;
}

.icon-orb {
  width: 80px;
  height: 80px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.1);
}

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  transition: var(--transition);
}

.input-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: var(--transition);
}

.input-group input:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(255, 255, 255, 0.06);
}

.input-group input:focus + .input-icon {
  color: var(--gold);
}

.input-group.has-error input {
  border-color: #ef4444;
}

.error-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #ef4444;
  font-size: 0.85rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
}

.login-btn {
  padding: 1rem;
  background: var(--gold);
  color: black;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: black;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 2.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.6;
}
</style>
