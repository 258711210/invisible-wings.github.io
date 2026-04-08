<script setup lang="ts">
import { computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { ImageOff, HelpCircle } from 'lucide-vue-next'

const props = defineProps<{
  id: string | number
  type: 'item' | 'race'
  iconOnly?: boolean
  size?: number
}>()

const adminStore = useAdminStore()

const metadata = computed(() => {
  if (props.type === 'item') {
    return adminStore.getItem(props.id) || [null, null]
  } else {
    return adminStore.getRace(props.id) || [null, null]
  }
})

const name = computed(() => {
  if (metadata.value[0]) return metadata.value[0]
  return props.type === 'item' ? `#${props.id} (未知道具)` : `#${props.id} (未知怪物)`
})

const iconUrl = computed(() => {
  if (props.type === 'item') {
    return props.id ? `/img/item/${props.id}.png` : null
  } else {
    const rawData = adminStore.getRace(props.id)
    if (rawData) {
      return `/img/Collect/${rawData[1]}.png`
    }
    // For manual/new entries that might not be in cache yet
    return null
  }
})

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src
  
  if (props.type === 'race' && currentSrc.includes('/Collect/')) {
    // Try Training backup
    const raceData = adminStore.getRace(props.id)
    if (raceData && raceData[1]) {
      target.src = `/img/Training/${raceData[1]}.png`
    }
  } else {
    // Use placeholder on true failure
    target.classList.add('hide-img')
    const parent = target.parentElement
    if (parent) {
      const placeholder = parent.querySelector('.icon-placeholder-error')
      if (placeholder) placeholder.classList.remove('hidden')
    }
  }
}
</script>

<template>
  <div class="entity-display" :title="`ID: ${id}`">
    <div 
      class="icon-box" 
      :style="{ width: (size || 32) + 'px', height: (size || 32) + 'px' }"
    >
      <img 
        v-if="iconUrl" 
        :src="iconUrl" 
        @error="handleImgError"
        class="icon-img"
      />
      <div class="icon-placeholder-error hidden">
        <ImageOff :size="(size || 32) * 0.6" />
      </div>
      <div v-if="!iconUrl" class="icon-placeholder">
        <HelpCircle :size="(size || 32) * 0.6" />
      </div>
    </div>
    <span v-if="!iconOnly" class="entity-name" :class="{ unknown: !metadata[0] }">
      {{ name }}
    </span>
  </div>
</template>

<style scoped>
.entity-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.icon-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.icon-img.hide-img {
  display: none;
}

.icon-placeholder, .icon-placeholder-error {
  color: var(--text-secondary);
  opacity: 0.3;
}

.icon-placeholder-error {
  color: #ef4444;
}

.hidden {
  display: none;
}

.entity-name {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #e2e8f0;
}

.entity-name.unknown {
  color: #ef4444;
  font-family: monospace;
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
