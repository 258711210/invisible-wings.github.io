import { defineStore } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useTimeStore = defineStore('time', () => {
  const realityDate = ref(new Date())
  const erinnHours = ref(0)
  const erinnMinutes = ref(0)
  const erinnSeconds = ref(0)
  const realityDay = ref(0)

  const updateTime = () => {
    const now = new Date()
    realityDate.value = now
    realityDay.value = now.getDay()

    // Erinn Time calculation from original project
    // 1 real minute = 40 erinn minutes
    // RealityTime in seconds within today's window
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const ms = now.getMilliseconds()
    
    // Original project used (Hours*60+Minutes)*60 + Seconds + ms/1000
    const realityTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds + (ms / 1000)
    
    // 1 real second = 40/60 * 60 = 40 erinn seconds? 
    // In original: let ErinnTime=Math.floor(RealityTime*40);
    // ErinnTime is in seconds.
    const erinnTotalSeconds = Math.floor(realityTimeInSeconds * 40)
    
    erinnSeconds.value = erinnTotalSeconds % 60
    erinnMinutes.value = Math.floor(erinnTotalSeconds / 60) % 60
    erinnHours.value = Math.floor(erinnTotalSeconds / 3600) % 24
  }

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 100) // Update every 100ms
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const erinnTime = computed(() => {
    const hh = erinnHours.value % 12 || 12
    const mm = erinnMinutes.value.toString().padStart(2, '0')
    const ampm = erinnHours.value >= 12 ? 'PM' : 'AM'
    return `${hh}:${mm} ${ampm}`
  })

  return {
    realityDate,
    realityDay,
    erinnHours,
    erinnMinutes,
    erinnSeconds,
    erinnTime,
    updateTime
  }
})
