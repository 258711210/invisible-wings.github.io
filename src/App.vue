<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTimeStore } from './stores/timeStore'
import { 
  Home, 
  BookOpen, 
  LocateFixed, 
  Calendar, 
  Clock, 
  Settings, 
  Menu,
  ChevronRight,
  Zap,
  ShieldAlert
} from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'

const timeStore = useTimeStore()
const isSidebarOpen = ref(window.innerWidth > 1024)
const isMobile = ref(window.innerWidth <= 1024)

const updateDimensions = () => {
  isMobile.value = window.innerWidth <= 1024
  if (!isMobile.value) {
    isSidebarOpen.value = true
  }
}

onMounted(() => window.addEventListener('resize', updateDimensions))
onUnmounted(() => window.removeEventListener('resize', updateDimensions))

const formatTime = (h: number, m: number, s: number) => {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const getErinnDay = (day: number) => {
  const erinnDays = ["立春", "春分", "入夏", "夏至", "秋收", "秋收节", "元旦"]
  return erinnDays[day % 7]
}

const navItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '配方百科', path: '/formula', icon: BookOpen },
  { name: '怪物筛查', path: '/race', icon: LocateFixed },
  { name: '时刻表', path: '/schedule', icon: Calendar },
  { name: '尔格强化', path: '/erg', icon: Zap },
]

// 路由路径到模块名称的映射
const routeToModuleName = {
  '/': '首页',
  '/formula': '配方百科',
  '/race': '怪物筛查',
  '/schedule': '时刻表',
  '/erg': '尔格强化',
  '/admin': '管理后台'
}
</script>

<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'closed': !isSidebarOpen }]">
      <div class="sidebar-header">
        <h1 class="gold-text">隐翅阁</h1>
        <div class="sidebar-subtitle">亚特-錦锈鹹魚 重制版</div>
      </div>
      
      <nav class="nav-menu">
        <RouterLink 
          v-for="item in navItems.filter(i => i.path !== '/schedule')" 
          :key="item.path"
          :to="item.path" 
          class="nav-link"
          active-class="active"
          @click="isMobile && (isSidebarOpen = false)"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="time-card glass-panel">
          <div class="time-row">
            <span class="label">现实:</span>
            <span class="value">{{ timeStore.realityDate.toLocaleTimeString() }}</span>
          </div>
          <div class="time-row erinn">
            <span class="label gold-text">爱琳:</span>
            <span class="value gold-text">{{ formatTime(timeStore.erinnHours, timeStore.erinnMinutes, timeStore.erinnSeconds) }}</span>
          </div>
          <div class="time-row day">
              <span class="label">季节:</span>
              <span class="value gold-text">{{ getErinnDay(timeStore.realityDay) }}</span>
          </div>
        </div>
        <div class="admin-footer">
          <RouterLink to="/admin" class="admin-entry">
            <ShieldAlert :size="16" />
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-header glass-panel">
        <button class="btn-icon" @click="isSidebarOpen = !isSidebarOpen">
          <Menu :size="24" />
        </button>
        <div class="breadcrumb">
          <span>{{ routeToModuleName[$route.path] || $route.name || '欢迎光临' }}</span>
        </div >
        <div class="header-actions">
           <div class="quick-time gold-text">
             <Clock :size="18" />
             <span>{{ formatTime(timeStore.erinnHours, timeStore.erinnMinutes, timeStore.erinnSeconds) }}</span>
           </div>
        </div>
      </header>

      <div class="content-wrapper">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>

    <!-- Sidebar Backdrop for Mobile -->
    <Transition name="fade">
      <div v-if="isSidebarOpen && isMobile" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>
    </Transition>

    <!-- Star Background -->
    <div class="star-bg"></div>
  </div>
</template>

<style>
@import './assets/base.css';

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0b 100%);
  position: relative;
}

.sidebar {
  width: 280px;
  background: rgba(10, 10, 11, 0.95);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.sidebar.closed {
  width: 0;
  transform: translateX(-100%);
  overflow: hidden;
  border-right: none;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--glass-border);
}

.sidebar-subtitle {
  font-size: 0.75rem;
  color: var(--gold-mute);
  margin-top: 4px;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.nav-menu {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: var(--transition);
}

.nav-link:hover, .nav-link.active {
  background: var(--glass);
  color: var(--gold);
  padding-left: 1.5rem;
}

.sidebar-footer {
  padding: 1.5rem;
}

.time-card {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.admin-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  padding: 0 0.5rem;
}

.admin-entry {
  color: var(--text-secondary);
  opacity: 0.4;
  transition: var(--transition);
  cursor: pointer;
}

.admin-entry:hover {
  color: var(--gold);
  opacity: 1;
  transform: scale(1.1);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.top-header {
  height: 64px;
  margin: 1rem;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-wrapper {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.quick-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 1.2rem;
}

.star-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
  pointer-events: none;
  opacity: 0.3;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
  backdrop-filter: blur(2px);
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    box-shadow: 20px 0 50px rgba(0,0,0,0.5);
  }
  
  .sidebar.closed {
    width: 280px; /* Keep width but hide via transform */
    transform: translateX(-100%);
  }

  .main-content {
    width: 100%;
  }

  /* Reset transitions for better mobile feel */
  .sidebar { transition: transform 0.3s ease; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
