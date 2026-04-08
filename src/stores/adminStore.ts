import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(localStorage.getItem('admin_token') === 'authenticated_2026')
  const isSaving = ref(false)

  async function login(password: string) {
    // Simple password check
    if (password === 'yinchige2026') {
      isAuthenticated.value = true
      localStorage.setItem('admin_token', 'authenticated_2026')
      return true
    }
    return false
  }

  function logout() {
    isAuthenticated.value = false
    localStorage.removeItem('admin_token')
  }

  async function fetchFiles() {
    const res = await fetch('/api/admin/files')
    return await res.json()
  }

  async function readFile(fileName: string) {
    const res = await fetch(`/api/admin/read?file=${fileName}`)
    return await res.json()
  }

  async function saveFile(fileName: string, data: any) {
    isSaving.value = true
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, data })
      })
      return await res.json()
    } finally {
      isSaving.value = false
    }
  }

  async function uploadImage(filePath: string, base64Data: string) {
    isSaving.value = true
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, base64Data })
      })
      return await res.json()
    } finally {
      isSaving.value = false
    }
  }

  // Data Resolution
  const itemsCache = ref<Record<string, any>>({})
  const raceCache = ref<Record<string, any>>({})

  async function initMetadata() {
    if (Object.keys(itemsCache.value).length > 0) return
    
    // For admin, we can load these files via our API
    const itemRes = await readFile('Item.ts')
    if (itemRes.success) itemsCache.value = itemRes.data
    
    const raceRes = await readFile('Race.ts')
    if (raceRes.success) raceCache.value = raceRes.data
  }

  function getItem(id: string | number) {
    return itemsCache.value[`Item${id}`]
  }

  function getRace(id: string | number) {
    return raceCache.value[`Race${id}`]
  }

  return {
    isAuthenticated,
    isSaving,
    itemsCache,
    raceCache,
    login,
    logout,
    fetchFiles,
    readFile,
    saveFile,
    uploadImage,
    initMetadata,
    getItem,
    getRace
  }
})
