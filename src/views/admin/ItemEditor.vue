<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { 
  Search, Plus, Trash2, Edit3, Save, 
  Upload, Image as ImageIcon, AlertCircle, CheckCircle2 
} from 'lucide-vue-next'
import EntityDisplay from './EntityDisplay.vue'

const adminStore = useAdminStore()
const rawData = ref<Record<string, any>>({})
const searchQuery = ref('')
const isLoading = ref(false)
const status = ref({ type: '', msg: '' })

// Modal state
const isModalOpen = ref(false)
const editingKey = ref('')
const editForm = ref({
  id: '',
  name: '',
  raw: [] as any[]
})

onMounted(loadData)

async function loadData() {
  isLoading.value = true
  const res = await adminStore.readFile('Item.ts')
  if (res.success) {
    rawData.value = res.data
  }
  isLoading.value = false
}

const list = computed(() => {
  return Object.entries(rawData.value)
    .map(([key, value]) => ({
      key,
      id: key.replace('Item', ''),
      name: Array.isArray(value) ? value[0] : '未知',
      raw: value
    }))
    .filter(item => 
      item.name.includes(searchQuery.value) || 
      item.id.includes(searchQuery.value)
    )
    .sort((a, b) => Number(b.id) - Number(a.id)) // Recent IDs usually higher
    .slice(0, 200) // Performance: only show first 200 matches
})

function openEdit(item?: any) {
  if (item) {
    editingKey.value = item.key
    editForm.value = {
      id: item.id,
      name: item.name,
      raw: JSON.parse(JSON.stringify(item.raw))
    }
  } else {
    editingKey.value = ''
    editForm.value = { id: '', name: '', raw: [''] }
  }
  isModalOpen.value = true
}

function handleSaveItem() {
  const key = editingKey.value || `Item${editForm.value.id}`
  const data = [...editForm.value.raw]
  data[0] = editForm.value.name
  rawData.value[key] = data
  isModalOpen.value = false
}

async function handlePersist() {
  isLoading.value = true
  const res = await adminStore.saveFile('Item.ts', rawData.value)
  if (res.success) {
    status.value = { type: 'success', msg: '道具库已同步' }
    // Update cache in store for immediate effect in other components
    adminStore.itemsCache = { ...rawData.value }
    setTimeout(() => status.value = { type: '', msg: '' }, 3000)
  }
  isLoading.value = false
}

// Image Upload
const fileInput = ref<HTMLInputElement | null>(null)
async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result as string
    const filePath = `public/img/item/${editForm.value.id}.png`
    const res = await adminStore.uploadImage(filePath, base64)
    if (res.success) {
      status.value = { type: 'success', msg: '图片已上传' }
    } else {
      status.value = { type: 'error', msg: '上传失败: ' + res.error }
    }
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="item-editor">
    <div class="editor-toolbar">
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" placeholder="搜索道具名称、ID..." />
      </div>
      <div class="action-btns">
        <button class="add-btn" @click="openEdit()">
          <Plus :size="18" />
          <span>新增道具条目</span>
        </button>
        <button class="persist-btn" :disabled="isLoading" @click="handlePersist">
          <Save :size="18" />
          <span>同步到 Item.ts</span>
        </button>
      </div>
    </div>

    <div v-if="status.msg" :class="['status-bar', status.type]">
      <CheckCircle2 v-if="status.type === 'success'" :size="16" />
      <AlertCircle v-else :size="16" />
      <span>{{ status.msg }}</span>
    </div>

    <div class="data-table-container glass-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th width="100">ID</th>
            <th>预览/名称</th>
            <th>原始数据 JSON (预览)</th>
            <th width="120">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.key">
            <td class="id-cell">#{{ item.id }}</td>
            <td>
              <EntityDisplay :id="item.id" type="item" />
            </td>
            <td class="raw-cell">
              <code>{{ JSON.stringify(item.raw).slice(0, 100) }}...</code>
            </td>
            <td class="actions-cell">
              <button class="icon-btn edit" @click="openEdit(item)"><Edit3 :size="16" /></button>
              <button class="icon-btn delete" @click="delete rawData[item.key]"><Trash2 :size="16" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content glass-panel">
        <h3>{{ editingKey ? '编辑道具元数据' : '新增道具' }}</h3>
        
        <div class="form-main">
          <div class="preview-section">
            <div class="large-preview gold-border">
              <EntityDisplay :id="editForm.id" type="item" :size="120" iconOnly />
            </div>
            <div class="upload-actions" v-if="editForm.id">
              <input type="file" ref="fileInput" hidden accept="image/png" @change="onFileSelected" />
              <button class="upload-btn" @click="fileInput?.click()">
                <Upload :size="16" />
                <span>更换图片 (PNG)</span>
              </button>
            </div>
            <p class="preview-hint">路径: /img/item/{{ editForm.id }}.png</p>
          </div>

          <div class="form-grid">
            <div class="form-item">
              <label>道具 ID</label>
              <input v-model="editForm.id" :disabled="!!editingKey" placeholder="如: 50663" />
            </div>
            <div class="form-item">
              <label>中文名称</label>
              <input v-model="editForm.name" placeholder="道具显示的官方名称" />
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="isModalOpen = false">取消</button>
          <button class="confirm-btn" @click="handleSaveItem">保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-editor { display: flex; flex-direction: column; gap: 1.5rem; }
.editor-toolbar { display: flex; justify-content: space-between; gap: 2rem; }
.search-box { flex: 1; max-width: 500px; position: relative; display: flex; align-items: center; }
.search-box input { width: 100%; padding: 0.8rem 1rem 0.8rem 3rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 10px; color: white; }
.search-box svg { position: absolute; left: 1rem; color: var(--text-secondary); }
.action-btns { display: flex; gap: 1rem; }
.add-btn, .persist-btn { display: flex; align-items: center; gap: 8px; padding: 0.8rem 1.2rem; border-radius: 10px; font-weight: 500; cursor: pointer; }
.add-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; }
.persist-btn { background: var(--gold); border: none; color: black; }

.status-bar { padding: 0.8rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
.status-bar.success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.status-bar.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

.data-table-container { overflow-y: auto; max-height: 70vh; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { padding: 1.2rem 1.5rem; background: rgba(255,255,255,0.02); color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.85rem; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.02); }
.id-cell { font-family: monospace; color: var(--gold-mute); }
.raw-cell code { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; }
.actions-cell { display: flex; gap: 8px; }
.icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid var(--glass-border); color: var(--text-secondary); cursor: pointer; }
.icon-btn:hover { color: white; background: rgba(255,255,255,0.05); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { width: 100%; max-width: 650px; padding: 2.5rem; }
.form-main { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; margin-top: 1.5rem; }
.preview-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.large-preview { width: 160px; height: 160px; background: rgba(0,0,0,0.3); border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 10px; }
.upload-btn { display: flex; align-items: center; gap: 6px; padding: 0.6rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; color: white; font-size: 0.85rem; cursor: pointer; }
.preview-hint { font-size: 0.7rem; color: var(--text-secondary); opacity: 0.5; }
.form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 0.85rem; color: var(--text-secondary); }
.form-item input { padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 8px; color: white; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; }
.cancel-btn, .confirm-btn { padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.cancel-btn { background: transparent; border: 1px solid var(--glass-border); color: white; }
.confirm-btn { background: var(--gold); border: none; color: black; font-weight: bold; }
</style>
