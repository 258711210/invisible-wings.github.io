<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { 
  Search, Plus, Trash2, Edit3, Save, 
  Zap, Info, CornerDownRight, AlertCircle, CheckCircle2 
} from 'lucide-vue-next'
import EntityDisplay from './EntityDisplay.vue'
import EntityPicker from './EntityPicker.vue'

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
  rate: 0,
  materials: [] as { id: any, count: number, label?: string }[]
})

onMounted(loadData)

async function loadData() {
  isLoading.value = true
  const res = await adminStore.readFile('ErgEnhance.ts')
  if (res.success) {
    rawData.value = res.data
  }
  isLoading.value = false
}

const list = computed(() => {
  return Object.entries(rawData.value)
    .filter(([key]) => !key.includes('List') && key !== 'ErgEnhance')
    .map(([key, value]) => {
      const materials = (value[2] || []).map((m: any) => ({
        id: m[0],
        count: m[1],
        label: m[2] || ''
      }))

      return {
        key,
        name: value[0],
        rate: value[1],
        materials,
        raw: value
      }
    })
    .filter(item => 
      item.name.includes(searchQuery.value) || 
      item.key.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

function openEdit(item?: any) {
  if (item) {
    editingKey.value = item.key
    editForm.value = {
      id: item.key,
      name: item.name,
      rate: item.rate,
      materials: JSON.parse(JSON.stringify(item.materials))
    }
  } else {
    editingKey.value = ''
    editForm.value = { id: '', name: '', rate: 90, materials: [] }
  }
  isModalOpen.value = true
}

function addMaterial() {
  editForm.value.materials.push({ id: '', count: 1, label: '' })
}

function removeMaterial(index: number) {
  editForm.value.materials.splice(index, 1)
}

function handleSaveItem() {
  const key = editingKey.value || editForm.value.id
  if (!key) return

  const mats = editForm.value.materials.map(m => {
    const arr: any[] = [m.id, m.count]
    if (m.label) arr.push(m.label)
    return arr
  })

  rawData.value[key] = [
    editForm.value.name,
    editForm.value.rate,
    mats
  ]
  isModalOpen.value = false
}

async function handlePersist() {
  isLoading.value = true
  const res = await adminStore.saveFile('ErgEnhance.ts', rawData.value)
  if (res.success) {
    status.value = { type: 'success', msg: 'ErgEnhance.ts 已保存成功' }
    setTimeout(() => status.value = { type: '', msg: '' }, 3000)
  }
  isLoading.value = false
}
</script>

<template>
  <div class="erg-editor">
    <div class="editor-toolbar">
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" placeholder="搜索尔格阶段或武器种类..." />
      </div>
      <div class="action-btns">
        <button class="add-btn" @click="openEdit()">
          <Plus :size="18" />
          <span>添加新阶段</span>
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
            <th width="150">内部 Key</th>
            <th width="150">显示名称</th>
            <th width="80">概率</th>
            <th>突破所需材料</th>
            <th width="100">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.key">
            <td class="id-cell">{{ item.key }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td class="rate-cell"><span class="badge rate">{{ item.rate }}%</span></td>
            <td class="mat-cell">
              <div class="mat-tags">
                <div v-for="(m, idx) in item.materials" :key="idx" class="mat-tag-row">
                  <EntityDisplay :id="m.id" type="item" :size="20" />
                  <span class="count">×{{ m.count }}</span>
                  <span v-if="m.label" class="label">[{{ m.label }}]</span>
                </div>
              </div>
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
        <h3>{{ editingKey ? '编辑尔格强化' : '新增尔格阶段' }}</h3>
        <div class="form-grid">
          <div class="form-row">
            <div class="form-item">
              <label>内部 Key (如: Dualgun5)</label>
              <input v-model="editForm.id" :disabled="!!editingKey" placeholder="WeaponLevel" />
            </div>
            <div class="form-item">
              <label>显示名称</label>
              <input v-model="editForm.name" placeholder="如: 双枪Lv5" />
            </div>
          </div>
          <div class="form-item">
            <label>成功率 (%)</label>
            <input v-model.number="editForm.rate" type="number" step="0.1" />
          </div>
          
          <div class="materials-editor">
            <div class="section-label">对应阶段材料需求</div>
            <div class="mat-input-scroll">
              <div v-for="(mat, idx) in editForm.materials" :key="idx" class="mat-input-row-erg">
                <div class="mat-picker-box">
                  <EntityPicker v-model="mat.id" type="item" placeholder="选择材料/道具" />
                </div>
                <input v-model.number="mat.count" type="number" placeholder="数量" class="count-input" />
                <input v-model="mat.label" placeholder="额外备注" class="label-input" />
                <button class="remove-mat-btn" @click="removeMaterial(idx)"><Trash2 :size="16" /></button>
              </div>
            </div>
            <button class="add-mat-btn" @click="addMaterial">+ 添加材料条目...</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="isModalOpen = false">取消</button>
          <button class="confirm-btn" @click="handleSaveItem">保存进入内存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.erg-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
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

.search-box svg { position: absolute; left: 1rem; color: var(--text-secondary); }

.action-btns { display: flex; gap: 1rem; }

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

.data-table-container { overflow-y: auto; max-height: 70vh; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--glass-border);
}

.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }

.id-cell { font-family: monospace; color: var(--gold-mute); }
.badge.rate { background: rgba(249, 115, 22, 0.1); color: #fb923c; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }

.mat-tags { display: flex; flex-direction: column; gap: 0.5rem; }
.mat-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px 10px;
  border-radius: 6px;
}
.count { color: var(--gold); font-weight: bold; font-size: 0.9rem; }
.label { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.6; }

.actions-cell { display: flex; gap: 8px; }

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
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
  max-width: 800px;
  padding: 2.5rem;
}

.form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 0.85rem; color: var(--text-secondary); }
.form-item input {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
}

.materials-editor { display: flex; flex-direction: column; gap: 1rem; }
.section-label { font-size: 0.9rem; font-weight: bold; color: var(--gold); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }

.mat-input-scroll {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.mat-input-row-erg {
  display: grid;
  grid-template-columns: 1fr 80px 1fr 40px;
  gap: 0.8rem;
  align-items: center;
  padding-right: 0.5rem;
}

.count-input, .label-input {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
}

.add-mat-btn {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  margin-top: 0.5rem;
}

.remove-mat-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .confirm-btn { padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.cancel-btn { background: transparent; border: 1px solid var(--glass-border); color: white; }
.confirm-btn { background: var(--gold); border: none; color: black; font-weight: bold; }
</style>
