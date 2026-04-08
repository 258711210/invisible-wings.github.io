<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { 
  Search, Plus, Trash2, Edit3, Save, 
  FlaskConical, ChevronRight, AlertCircle, CheckCircle2 
} from 'lucide-vue-next'
import EntityDisplay from './EntityDisplay.vue'
import EntityPicker from './EntityPicker.vue'

const adminStore = useAdminStore()
const selectedFile = ref('')
const files = ref<string[]>([])
const rawData = ref<Record<string, any>>({})
const searchQuery = ref('')
const isLoading = ref(false)
const status = ref({ type: '', msg: '' })

// Modal state
const isModalOpen = ref(false)
const editingKey = ref('')
const editForm = ref({
  id: '',
  steps: 0,
  rate: 0,
  resultId: 0 as any,
  materials: [] as { id: any, count: number, label?: string }[]
})

const skillFiles = [
  { name: 'BlacksmithItem.ts', label: '铁匠 (Blacksmithing)' },
  { name: 'TailoringItem.ts', label: '裁缝 (Tailoring)' },
  { name: 'CookingItem.ts', label: '料理 (Cooking)' },
  { name: 'HandicraftItem.ts', label: '手艺 (Handicraft)' },
  { name: 'PotionMakingItem.ts', label: '药剂制作 (Potion Making)' },
  { name: 'WeavingItem.ts', label: '纺织 (Weaving)' },
  { name: 'RefineItem.ts', label: '冶炼 (Refine)' },
  { name: 'MillingItem.ts', label: '磨粉 (Milling)' },
  { name: 'MagicCraftItem.ts', label: '魔法工艺 (Magic Craft)' },
  { name: 'HeulwenEngineeringItem.ts', label: '希原工学 (Engineering)' }
]

onMounted(async () => {
  selectedFile.value = skillFiles[0].name
})

watch(selectedFile, loadData)

async function loadData() {
  if (!selectedFile.value) return
  isLoading.value = true
  const res = await adminStore.readFile(selectedFile.value)
  if (res.success) {
    rawData.value = res.data
  }
  isLoading.value = false
}

const list = computed(() => {
  return Object.entries(rawData.value)
    .filter(([key]) => key.includes('Item'))
    .map(([key, value]) => {
      const id = key.match(/\d+/)?.[0] || ''
      const header = value[0] || [0, 0]
      const body = value[1] || []
      
      const materials = []
      for (let i = 1; i < body.length; i += 2) {
        if (body[i] !== undefined) {
          materials.push({ id: body[i], count: body[i+1] })
        }
      }

      // Handle raw rate format (can be string or number)
      let parsedRate = 0
      if (typeof header[1] === 'number') {
        parsedRate = header[1]
      } else if (typeof header[1] === 'string') {
        parsedRate = parseFloat(header[1]) / (header[1].includes('%') ? 100 : 1)
      }

      return {
        key,
        id,
        steps: header[0] || 0,
        rate: isNaN(parsedRate) ? 0 : parsedRate,
        resultId: body[0],
        materials,
        raw: value
      }
    })
    .filter(item => {
      const itemName = adminStore.getItem(item.resultId)?.[0] || '未知道具'
      return item.id.includes(searchQuery.value) || 
             item.resultId?.toString().includes(searchQuery.value) ||
             itemName.includes(searchQuery.value)
    })
})

function openEdit(item?: any) {
  if (item) {
    editingKey.value = item.key
    editForm.value = {
      id: item.id,
      steps: item.steps,
      rate: item.rate,
      resultId: item.resultId,
      materials: JSON.parse(JSON.stringify(item.materials))
    }
  } else {
    editingKey.value = ''
    editForm.value = { id: '', steps: 5, rate: 0.1, resultId: '', materials: [] }
  }
  isModalOpen.value = true
}

function addMaterial() {
  editForm.value.materials.push({ id: '', count: 1 })
}

function removeMaterial(index: number) {
  editForm.value.materials.splice(index, 1)
}

function handleSaveItem() {
  const prefix = selectedFile.value.split('Item')[0]
  const key = editingKey.value || `${prefix}Item${editForm.value.id}`
  const body = [editForm.value.resultId]
  editForm.value.materials.forEach(m => {
    body.push(m.id, m.count)
  })

  rawData.value[key] = [
    [editForm.value.steps, editForm.value.rate],
    body
  ]
  isModalOpen.value = false
}

async function handlePersist() {
  isLoading.value = true
  const res = await adminStore.saveFile(selectedFile.value, rawData.value)
  if (res.success) {
    status.value = { type: 'success', msg: `${selectedFile.value} 已保存` }
    setTimeout(() => status.value = { type: '', msg: '' }, 3000)
  }
  isLoading.value = false
}
</script>

<template>
  <div class="formula-editor">
    <div class="skill-selector glass-panel">
      <button 
        v-for="skill in skillFiles" 
        :key="skill.name"
        :class="['skill-btn', { active: selectedFile === skill.name }]"
        @click="selectedFile = skill.name"
      >
        <span>{{ skill.label }}</span>
      </button>
    </div>

    <div class="editor-main">
      <div class="editor-toolbar">
        <div class="search-box">
          <Search :size="18" />
          <input v-model="searchQuery" placeholder="搜索配方 ID、结果名称..." />
        </div>
        <div class="action-btns">
          <button class="add-btn" @click="openEdit()">
            <Plus :size="18" />
            <span>新增配方</span>
          </button>
          <button class="persist-btn" :disabled="isLoading" @click="handlePersist">
            <Save :size="18" />
            <span>保存当前技能</span>
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
              <th width="100">配方 ID</th>
              <th width="180">制作结果</th>
              <th width="120">制作参数</th>
              <th>材料明细</th>
              <th width="100">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.key">
              <td class="id-cell">#{{ item.id }}</td>
              <td class="res-cell">
                <EntityDisplay :id="item.resultId" type="item" />
              </td>
              <td class="rate-cell">
                <div class="badge-group">
                  <span class="badge steps">{{ item.steps }}次</span>
                  <span class="badge rate">{{ Math.round(item.rate * 100) }}%</span>
                </div>
              </td>
              <td class="mat-cell">
                <div class="mat-tags">
                  <div v-for="(m, idx) in item.materials" :key="idx" class="mat-tag-wrapper">
                    <EntityDisplay :id="m.id" type="item" :size="20" />
                    <span class="mat-count">×{{ m.count }}</span>
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
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content glass-panel">
        <h3>{{ editingKey ? '编辑配方' : '新增配方' }}</h3>
        <div class="form-grid">
          <div class="form-row">
            <div class="form-item">
              <label>配方 ID</label>
              <input v-model="editForm.id" :disabled="!!editingKey" placeholder="如: 13006" />
            </div>
            <div class="form-item">
              <label>制作结果道具</label>
              <EntityPicker v-model="editForm.resultId" type="item" placeholder="搜索并选择产出道具" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>制作次数 (Steps)</label>
              <input v-model.number="editForm.steps" type="number" />
            </div>
            <div class="form-item">
              <label>制作概率 (0~1)</label>
              <input v-model.number="editForm.rate" type="number" step="0.01" />
            </div>
          </div>
          
          <div class="materials-editor">
            <div class="section-label">所需材料配比</div>
            <div class="mat-input-scroll">
              <div v-for="(mat, idx) in editForm.materials" :key="idx" class="mat-input-row">
                <div class="mat-selector-box">
                  <EntityPicker v-model="mat.id" type="item" placeholder="选择材料" />
                </div>
                <input v-model.number="mat.count" type="number" placeholder="数量" class="mat-count-input" />
                <button class="remove-mat-btn" @click="removeMaterial(idx)"><Trash2 :size="16" /></button>
              </div>
            </div>
            <button class="add-mat-btn" @click="addMaterial">+ 添加材料...</button>
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
.formula-editor {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
}

.skill-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.skill-btn {
  padding: 0.8rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.skill-btn:hover { background: rgba(255, 255, 255, 0.05); }
.skill-btn.active {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold);
  border-color: rgba(212, 175, 55, 0.2);
}

.editor-main {
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

.badge-group { display: flex; gap: 4px; }
.badge { padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; }
.badge.steps { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.badge.rate { background: rgba(16, 185, 129, 0.1); color: #34d399; }

.mat-tags { display: flex; flex-wrap: wrap; gap: 1rem; }
.mat-tag-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px 8px;
  border-radius: 6px;
}
.mat-count { font-size: 0.8rem; color: var(--gold); font-weight: bold; }

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
  max-width: 700px;
  padding: 2.5rem;
}

.form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 0.8rem; color: var(--text-secondary); }
.form-item input {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
}

.materials-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-label { font-size: 0.9rem; font-weight: bold; color: var(--gold); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }

.mat-input-scroll {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-right: 0.5rem;
}

.mat-input-row {
  display: grid;
  grid-template-columns: 1fr 100px 40px;
  gap: 0.8rem;
  align-items: center;
}

.mat-count-input {
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: white;
}

.add-mat-btn {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.add-mat-btn:hover { color: white; background: rgba(255, 255, 255, 0.08); }

.remove-mat-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
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
  font-weight: 500;
}
.cancel-btn { background: transparent; border: 1px solid var(--glass-border); color: white; }
.confirm-btn { background: var(--gold); border: none; color: black; }
</style>
