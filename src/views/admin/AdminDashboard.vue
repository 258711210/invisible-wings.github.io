<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { 
  LayoutDashboard, 
  LocateFixed, 
  BookMarked, 
  Zap, 
  Database,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  FileCode,
  HardDrive
} from 'lucide-vue-next'

import RaceEditor from './RaceEditor.vue'
import FormulaEditor from './FormulaEditor.vue'
import ErgEditor from './ErgEditor.vue'
import ItemEditor from './ItemEditor.vue'

const router = useRouter()
const adminStore = useAdminStore()
const activeModule = ref('overview')
const isLoading = ref(false)
const files = ref<string[]>([])

onMounted(async () => {
  isLoading.value = true
  await adminStore.initMetadata()
  const res = await adminStore.fetchFiles()
  if (res.success) {
    files.value = res.files
  }
  isLoading.value = false
})

const handleLogout = () => {
  adminStore.logout()
  router.push('/admin/login')
}

const modules = [
  { id: 'overview', name: '系统概览', icon: LayoutDashboard },
  { id: 'items', name: '道具主库', icon: Database },
  { id: 'formula', name: '配方管理', icon: BookMarked },
  { id: 'race', name: '怪物管理', icon: LocateFixed },
  { id: 'erg', name: '尔格强化', icon: Zap },
]
</script>

<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="admin-sidebar glass-panel">
      <div class="sidebar-brand">
        <Shield class="gold-text" :size="24" />
        <h2>隐翅阁后台</h2>
        <p>数据维护工作站</p>
      </div>

      <nav class="sidebar-nav">
        <button 
          v-for="mod in modules" 
          :key="mod.id"
          :class="['nav-item', { active: activeModule === mod.id }]"
          @click="activeModule = mod.id"
        >
          <component :is="mod.icon" :size="20" />
          <span>{{ mod.name }}</span>
          <ChevronRight v-if="activeModule === mod.id" :size="16" class="active-indicator" />
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="18" />
          <span>退出管理</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-title">
          <component :is="modules.find(m => m.id === activeModule)?.icon" :size="24" class="gold-text" />
          <h1>{{ modules.find(m => m.id === activeModule)?.name }}</h1>
        </div>
        <div class="header-status">
          <div v-if="adminStore.isSaving" class="saving-indicator">
            <Activity :size="14" class="spin" />
            正在操作数据...
          </div>
        </div>
      </header>

      <div class="admin-content-box">
        <!-- Overview -->
        <div v-if="activeModule === 'overview'" class="overview-grid">
          <div class="stat-card glass-panel">
            <HardDrive class="gold-text" :size="32" />
            <div class="stat-info">
              <div class="label">数据文件</div>
              <div class="value">{{ files.length }} 个</div>
            </div>
          </div>
          <div class="stat-card glass-panel">
            <FileCode class="gold-text" :size="32" />
            <div class="stat-info">
              <div class="label">已加载道具</div>
              <div class="value">{{ Object.keys(adminStore.itemsCache).length }} 项</div>
            </div>
          </div>
          
          <div class="info-details glass-panel">
            <h3>系统运行状态</h3>
            <p>后端 API (Vite Plugin) 已就绪，支持二进制图片上传及 TS 源码文件秒级读写。</p>
            <div class="file-list">
              <div v-for="f in files" :key="f" class="file-item">
                <FileCode :size="14" />
                <span>{{ f }}</span>
              </div>
            </div>
          </div>
        </div>

        <ItemEditor v-else-if="activeModule === 'items'" />
        <FormulaEditor v-else-if="activeModule === 'formula'" />
        <RaceEditor v-else-if="activeModule === 'race'" />
        <ErgEditor v-else-if="activeModule === 'erg'" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background: #020617;
  color: #f8fafc;
}

.admin-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1rem;
}

.sidebar-brand {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-brand h2 { font-size: 1.25rem; margin-top: 0.5rem; }
.sidebar-brand p { font-size: 0.75rem; opacity: 0.5; margin-top: 0.2rem; }

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  text-align: left;
}

.nav-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
.nav-item.active { background: rgba(212, 175, 55, 0.1); color: var(--gold); }

.active-indicator { margin-left: auto; }

.sidebar-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  cursor: pointer;
}

.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 2rem; }

.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-title { display: flex; align-items: center; gap: 12px; }
.header-title h1 { font-size: 1.5rem; }

.admin-content-box { flex: 1; overflow-y: auto; padding-right: 0.5rem; }

.overview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }

.stat-card { padding: 2rem; display: flex; align-items: center; gap: 2rem; }
.stat-info .label { font-size: 0.9rem; opacity: 0.6; }
.stat-info .value { font-size: 1.8rem; font-weight: bold; margin-top: 0.4rem; }

.info-details { grid-column: span 2; padding: 2rem; }
.info-details h3 { margin-bottom: 1rem; color: var(--gold); }
.file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem; }
.file-item { display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px; font-size: 0.85rem; }

.spin { animation: spin 2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.saving-indicator { font-size: 0.9rem; color: var(--gold); display: flex; align-items: center; gap: 8px; }
</style>
