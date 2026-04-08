<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { 
  Search, Plus, Trash2, Edit3, Save, 
  RefreshCcw, AlertCircle, CheckCircle2, Image as ImageIcon, Upload
} from 'lucide-vue-next'
import EntityDisplay from './EntityDisplay.vue'

const adminStore = useAdminStore()
const rawData = ref<Record<string, any>>({})
const searchQuery = ref('')
const isLoading = ref(false)
const status = ref({ type: '', msg: '' })

// Upload state
const fileInput = ref<HTMLInputElement | null>(null)
async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result as string
    const filePath = `public/img/Collect/${editForm.value.internal}.png`
    const res = await adminStore.uploadImage(filePath, base64)
    if (res.success) {
      status.value = { type: 'success', msg: '头像已上传' }
    } else {
      status.value = { type: 'error', msg: '上传失败: ' + res.error }
    }
  }
  reader.readAsDataURL(file)
}

// Modal state
const isModalOpen = ref(false)
const editingKey = ref('')
const editForm = ref({
  id: '',
  name: '',
  internal: '',
  category: ''
})

onMounted(loadData)

async function loadData() {
  isLoading.value = true
  const res = await adminStore.readFile('Race.ts')
  if (res.success) {
    rawData.value = res.data
  }
  isLoading.value = false
}

const list = computed(() => {
  return Object.entries(rawData.value)
    .map(([key, value]) => ({
      key,
      id: key.replace('Race', ''),
      name: Array.isArray(value) ? value[0] : '未知',
      internal: Array.isArray(value) ? value[1] : '',
      category: Array.isArray(value) ? value[2] : '',
      raw: value
    }))
    .filter(item => 
      item.name.includes(searchQuery.value) || 
      item.id.includes(searchQuery.value) ||
      item.internal.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .sort((a, b) => Number(a.id) - Number(b.id))
})

function openEdit(item?: any) {
  if (item) {
    editingKey.value = item.key
    editForm.value = {
      id: item.id,
      name: item.name,
      internal: item.internal,
      category: item.category
    }
  } else {
    editingKey.value = ''
    editForm.value = { id: '', name: '', internal: '', category: '' }
  }
  isModalOpen.value = true
}

function handleDelete(key: string) {
  if (confirm(`确定要删除条目 ${key} 吗？`)) {
    delete rawData.value[key]
  }
}

function handleSaveItem() {
  const key = editingKey.value || `Race${editForm.value.id}`
  rawData.value[key] = [
    editForm.value.name,
    editForm.value.internal,
    editForm.value.category
  ]
  isModalOpen.value = false
}

async function handlePersist() {
  isLoading.value = true
  const res = await adminStore.saveFile('Race.ts', rawData.value)
  if (res.success) {
    status.value = { type: 'success', msg: 'Race.ts 已同步成功' }
    setTimeout(() => status.value = { type: '', msg: '' }, 3000)
  }
  isLoading.value = false
}
</script>

<template>
  <div class="race-editor">
    <div class="editor-toolbar">
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" placeholder="搜索怪物名称、ID 或 内部代号..." />
      </div>
      <div class="action-btns">
        <button class="add-btn" @click="openEdit()">
          <Plus :size="18" />
          <span>添加新怪物</span>
        </button>
        <button class="persist-btn" :disabled="isLoading" @click="handlePersist">
          <Save :size="18" />
          <span>保存至本地源码</span>
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
            <th width="80">ID</th>
            <th>显示名称/预览</th>
            <th>内部名称 (Internal)</th>
            <th>分类 (Category)</th>
            <th width="120">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.key">
            <td class="id-cell">#{{ item.id }}</td>
            <td class="name-cell">
              <EntityDisplay :id="item.id" type="race" />
            </td>
            <td class="internal-cell">{{ item.internal || '-' }}</td>
            <td class="cat-cell"><span class="badge">{{ item.category || 'None' }}</span></td>
            <td class="actions-cell">
              <button class="icon-btn edit" @click="openEdit(item)"><Edit3 :size="16" /></button>
              <button class="icon-btn delete" @click="handleDelete(item.key)"><Trash2 :size="16" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content glass-panel">
        <h3>{{ editingKey ? '编辑怪物' : '新增怪物' }}</h3>
        
        <div class="form-main">
          <div class="preview-section">
            <div class="preview-label">头像预览</div>
            <div class="large-preview gold-border">
              <EntityDisplay :id="editForm.internal" type="race" :size="120" iconOnly />
            </div>
            <div class="upload-actions" v-if="editForm.internal">
              <input type="file" ref="fileInput" hidden accept="image/png" @change="onFileSelected" />
              <button class="upload-btn" @click="fileInput?.click()">
                <Upload :size="16" />
                <span>更换头像 (PNG)</span>
              </button>
            </div>
            <p class="preview-hint">路径: /img/Collect/{{ editForm.internal }}.png</p>
          </div>

          <div class="form-grid">
            <div class="form-item">
              <label>怪物 ID (Race ID)</label>
              <input v-model="editForm.id" :disabled="!!editingKey" placeholder="如: 10101" />
            </div>
            <div class="form-item">
              <label>中文显示名称</label>
              <input v-model="editForm.name" placeholder="如: 哥布林" />
            </div>
            <div class="form-item">
              <label>内部代号 (Internal Name)</label>
              <input v-model="editForm.internal" placeholder="用于匹配图片" />
            </div>
            <div class="form-item">
              <label>形态分类 (Category)</label>
              <input v-model="editForm.category" placeholder="如: Goblin" />
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="isModalOpen = false">取消</button>
          <button class="confirm-btn" @click="handleSaveItem">确认为修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.race-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: white;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
}

.action-btns {
  display: flex;
  gap: 1rem;
}

.add-btn, .persist-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
}

.add-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: white; }
.persist-btn { background: var(--gold); border: none; color: black; }

.status-bar {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.status-bar.success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }

.data-table-container {
  overflow-y: auto;
  max-height: 70vh;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--glass-border);
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}

.id-cell { font-family: monospace; color: var(--gold-mute); }

.badge {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
}

.icon-btn:hover { color: white; background: rgba(255, 255, 255, 0.05); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 650px;
  padding: 2.5rem;
}

.form-main {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-label { font-size: 0.85rem; color: var(--text-secondary); }
.large-preview {
  width: 160px;
  height: 160px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.preview-hint { font-size: 0.7rem; color: var(--text-secondary); opacity: 0.5; text-align: center; }

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label { font-size: 0.85rem; color: var(--text-secondary); }
.form-item input {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .confirm-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn { background: transparent; border: 1px solid var(--glass-border); color: white; }
.confirm-btn { background: var(--gold); border: none; color: black; font-weight: bold; }
</style>
