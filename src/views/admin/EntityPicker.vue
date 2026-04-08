<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Search, X, Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string | number
  type: 'item' | 'race'
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const adminStore = useAdminStore()
const isOpen = ref(false)
const searchQuery = ref('')

const options = computed(() => {
  const source = props.type === 'item' ? adminStore.itemsCache : adminStore.raceCache
  const list = Object.entries(source).map(([key, val]: [string, any]) => ({
    id: key.replace('Item', '').replace('Race', ''),
    name: val[0],
    sub: val[1] || ''
  }))

  if (!searchQuery.value) return list.slice(0, 50)

  return list
    .filter(opt => 
      opt.name.includes(searchQuery.value) || 
      opt.id.includes(searchQuery.value)
    )
    .slice(0, 100)
})

const selectedName = computed(() => {
  if (!props.modelValue) return ''
  const entity = props.type === 'item' ? adminStore.getItem(props.modelValue) : adminStore.getRace(props.modelValue)
  return entity ? entity[0] : props.modelValue
})

function select(id: string) {
  emit('update:modelValue', props.type === 'item' ? Number(id) : id)
  isOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="entity-picker">
    <div class="picker-trigger" @click="isOpen = !isOpen">
      <span v-if="selectedName" class="selected-text">{{ selectedName }}</span>
      <span v-else class="placeholder">{{ placeholder || '点击选择...' }}</span>
      <small v-if="modelValue">#{{ modelValue }}</small>
    </div>

    <div v-if="isOpen" class="picker-dropdown glass-panel">
      <div class="dropdown-header">
        <Search :size="16" />
        <input 
          v-model="searchQuery" 
          placeholder="搜索名称或 ID..." 
          ref="searchInput"
          autofocus
        />
        <button class="close-btn" @click="isOpen = false"><X :size="16" /></button>
      </div>
      
      <div class="options-list">
        <div 
          v-for="opt in options" 
          :key="opt.id"
          :class="['option-item', { active: modelValue == opt.id }]"
          @click="select(opt.id)"
        >
          <div class="opt-main">
            <span class="opt-name">{{ opt.name }}</span>
            <span class="opt-id">#{{ opt.id }}</span>
          </div>
          <Check v-if="modelValue == opt.id" :size="16" class="check-icon" />
        </div>
        <div v-if="options.length === 0" class="no-results">未找到匹配项</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entity-picker {
  position: relative;
  width: 100%;
}

.picker-trigger {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.selected-text { color: white; }
.placeholder { color: var(--text-secondary); }
.picker-trigger small { opacity: 0.4; font-family: monospace; }

.picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  max-height: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.dropdown-header input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  outline: none;
}

.options-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover { background: rgba(255, 255, 255, 0.05); }
.option-item.active { background: rgba(212, 175, 55, 0.1); color: var(--gold); }

.opt-main { display: flex; flex-direction: column; }
.opt-name { font-size: 0.95rem; }
.opt-id { font-size: 0.75rem; opacity: 0.5; font-family: monospace; }

.no-results { padding: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; }
</style>
