<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { SkillList } from '../data/Skill'
import * as GlobalItemData from '../data/Item'
import * as TailoringData from '../data/TailoringItem'
import * as BlacksmithData from '../data/BlacksmithItem'
import * as HandicraftData from '../data/HandicraftItem'
import * as PotionMakingData from '../data/PotionMakingItem'
import * as CarpentryData from '../data/CarpentryItem'
import * as CookingData from '../data/CookingItem'
import * as FynnsCraftData from '../data/FynnsCraftItem'
import * as HeulwenEngineeringData from '../data/HeulwenEngineeringItem'
import * as MagicCraftData from '../data/MagicCraftItem'
import * as ManaFormingData from '../data/ManaFormingItem'
import * as MetalConversionData from '../data/MetalConversionItem'
import * as MillingData from '../data/MillingItem'
import * as RefineData from '../data/RefineItem'
import * as WeavingData from '../data/WeavingItem'
import * as StationaryCraftData from '../data/StationaryCraftItem'
import * as SynthesisData from '../data/SynthesisItem'
import * as DissolutionData from '../data/DissolutionItem'
import * as SellItemData from '../data/SellItem'
import * as NPCData from '../data/NPC'
import { KillItemList } from '../data/KillItem'
import * as GatherItemData from '../data/GatherItem'
import * as FishingItemData from '../data/FishingItem'
import * as MiningItemData from '../data/MiningItem'
import * as MetallurgyItemData from '../data/MetallurgyItem'
import * as GiftItemData from '../data/GiftItem'
import * as QuestItemData from '../data/QuestItem'
import { Search, ChevronRight, X, Info, ShoppingCart, Target, Pickaxe, Link2, Fish, Gift, ScrollText, Mountain, Coins } from 'lucide-vue-next'
import { parseItemEquipment } from '../utils/ItemEffects'

// 钓鱼技能ID
const FISHING_SKILL_ID = 10023

const getItemName = (id: string | number) => {
  const item = (GlobalItemData as any)[`Item${id}`]
  return item ? item[0] : `未知道具(${id})`
}

const getItemIcon = (id: string | number) => {
  const idStr = String(id);
  // 6000000101 等大 ID 通常为样本/设计图，使用特定的卷轴图标
  if (idStr.length > 7 && idStr.startsWith('600')) return '/img/item/scroll.png';
  return `/img/item/${id}.png`;
}
const getSkillIcon = (id: string | number) => `/img/skill/${id}.png`

const getSkillIconForMethod = (type: string, method?: string | number) => {
  if (typeof method === 'number') return String(method)
  if (method && !isNaN(Number(method))) return String(method)

  const map: Record<string, string> = {
    'fish': '10023',
    'mining': '55002',
    'panning': '10028',
    'drop': '55001', // 掉落暂用通用采集图标
    'quest': '10104' // 任务/手艺相关
  }
  
  // 特殊文本映射
  const specialMap: Record<string, string> = {
    'GetWater': '55001', // 水杯/水井相关使用通用采集
    'GetFireElemental': '55001',
    'GetIceElemental': '55001',
    'GetLightningElemental': '55001',
    'AlpacaShearing': '55001',
    'AlpacaPaperSheep': '55001',
    'GetSilverVineBerry': '55001',
    '敲打': '55001'
  }

  if (type === 'gather') {
    if (typeof method === 'string') {
       if (specialMap[method]) return specialMap[method]
       if (method.includes('矿')) return '55002'
       if (method.includes('淘金')) return '10028'
       if (method.includes('钓鱼')) return '10023'
    }
    return '55001' // 默认采集
  }
  return map[type] || '10001'
}

const getLevelClass = (level: string | number) => {
  const s = String(level).toLowerCase()
  if (s.includes('1')) return 'rank-1'
  if (['a', 'b', 'c', 'd', 'e', 'f'].some(r => s.includes(r))) return 'rank-low'
  if (['2', '3', '4', '5'].some(r => s.includes(r))) return 'rank-mid'
  return ''
}

const skillMap: Record<number, any> = {
  10016: { data: BlacksmithData, label: '打铁' },
  10001: { data: TailoringData, label: '衣物制作' },
  10013: { data: HandicraftData, label: '手艺' },
  10014: { data: WeavingData, label: '纺织' },
  10015: { data: RefineData, label: '冶炼' },
  10022: { data: PotionMakingData, label: '药剂制作' },
  10020: { data: CookingData, label: '料理' },
  10033: { data: CarpentryData, label: '木工' },
  10040: { data: HeulwenEngineeringData, label: '希尔文工学' },
  10041: { data: MagicCraftData, label: '魔法工艺' },
  10104: { data: StationaryCraftData, label: '书写用具' },
  27103: { data: FynnsCraftData, label: '芬恩工艺' },
  35001: { data: ManaFormingData, label: '魔法组合' },
  35012: { data: MetalConversionData, label: '金属转换' },
  10012: { data: MillingData, label: '碾磨' },
  10031: { data: SynthesisData, label: '合成' },
  10030: { data: DissolutionData, label: '分解' },
}

// 料理方式与工具映射
const COOKING_METHODS_INFO: Record<number, { name: string, tools: number[], icon?: string }> = {
  0: { name: '混合', tools: [46005, 46004], icon: '/img/skill/10020混合.png' },
  1: { name: '烘烤', tools: [41408, 46005], icon: '/img/skill/10020烧(火).png' },
  2: { name: '煮', tools: [46005, 46004], icon: '/img/skill/10020煮(火).png' },
  3: { name: '蒸', tools: [46005, 46004], icon: '/img/skill/10020蒸煮(火).png' },
  4: { name: '炸', tools: [46005, 46004], icon: '/img/skill/10020炸(火).png' },
  5: { name: '炒', tools: [46005, 46004], icon: '/img/skill/10020炒(火).png' },
  6: { name: '制作意面', tools: [46005, 40043], icon: '/img/skill/10020制作意大利面.png' },
  7: { name: '制作果酱', tools: [46005, 46004], icon: '/img/skill/10020制做果酱(火).png' },
  8: { name: '馅料', tools: [46005, 40043], icon: '/img/skill/10020制做派.png' },
  9: { name: '压榨', tools: [46005] },
  10: { name: '泡', tools: [46005, 46004] },
  12: { name: '切', tools: [46005, 40042], icon: '/img/skill/10020切片.png' },
  14: { name: '混合', tools: [46005, 46004], icon: '/img/skill/10020混合.png' },
  15: { name: '披萨', tools: [46005, 40043], icon: '/img/skill/10020制作披萨.png' },
}


const recipeRegistry = computed(() => {
  const registry: Record<string, number[]> = {}
  Object.entries(skillMap).forEach(([skillId, skillInfo]) => {
    const data = skillInfo.data
    Object.keys(data).forEach(key => {
      if (key.includes('Item') && /\d+$/.test(key)) {
        const itemId = key.match(/\d+$/)?.[0] || ''
        if (!registry[itemId]) registry[itemId] = []
        if (!registry[itemId].includes(Number(skillId))) {
          registry[itemId].push(Number(skillId))
        }
      }
    })
  })
  return registry
})

const getItemSources = (id: string | number) => {
  const sources: any[] = []
  const idNum = Number(id)
  
  // NPC售卖
  const sellKey = `SellItem${id}`
  const sellData = (SellItemData as any)[sellKey]
  if (sellData && Array.isArray(sellData)) {
    const groupedShops: Record<string, any> = {}

    sellData.forEach((record: any) => {
      const currencyId = record[0]
      const price = record[1]
      let currencyName = '金币'
      let currencyIcon = ''

      if (currencyId === 2000) {
        currencyName = '金币'
        currencyIcon = '/img/item/2000.png'
      } else if (currencyId === 72015) {
        currencyName = '杜卡特'
        currencyIcon = '/img/item/72015.png'
      } else if (currencyId === 72016) {
        currencyName = '赛季杜卡特'
        currencyIcon = '/img/item/72016.png'
      } else {
        const cItem = (GlobalItemData as any)[`Item${currencyId}`]
        currencyName = cItem ? cItem[0] : String(currencyId)
        currencyIcon = `/img/item/${currencyId}.png`
      }

      for (let j = 2; j < record.length; j++) {
        const info = record[j]
        const groupKey = `${currencyId}-${price}`
        if (Array.isArray(info) && info[0] === 'NPC') {
          const npcIds = info.slice(1)
          if (!groupedShops[groupKey]) {
             groupedShops[groupKey] = { type: 'shop', price, currencyName, currencyIcon, currencyId, npcs: [], namedSources: [] }
          }
          npcIds.forEach((npcId: number) => {
            const npc = (NPCData as any)[`NPC${npcId}`]
            if (npc) {
              groupedShops[groupKey].npcs.push({ name: npc[0], location: npc[1], npcId: npcId })
            }
          })
        } else if (typeof info === 'string') {
          if (!groupedShops[groupKey]) {
             groupedShops[groupKey] = { type: 'shop', price, currencyName, currencyIcon, currencyId, npcs: [], namedSources: [] }
          }
          groupedShops[groupKey].namedSources.push(info)
        }
      }
    })
    Object.values(groupedShops).forEach(shop => sources.push(shop))
  }
  
  // 怪物掉落
  KillItemList.forEach((killRecord: any) => {
    const mobName = killRecord[0]
    const dropIds = killRecord[1]
    if (Array.isArray(dropIds) && dropIds.includes(idNum)) {
      sources.push({ type: 'drop', name: mobName })
    }
  })
  
  // 采集
  const gatherKey = `GatherItem${id}`
  const gatherData = (GatherItemData as any)[gatherKey]
  if (gatherData) {
    sources.push({
      type: 'gather',
      name: gatherData[1],
      method: gatherData[0] // 保留原始技能 ID 或特殊标识字符串
    })
  }
  
  // 钓鱼
  if (FishingItemData.FishingItemList) {
    FishingItemData.FishingItemList.forEach((fishingRecord: any) => {
      const locationName = fishingRecord[0]
      const fishItemIds = fishingRecord.slice(1)
      if (Array.isArray(fishItemIds) && fishItemIds.includes(idNum)) {
        sources.push({ type: 'fish', name: locationName })
      }
    })
  }

  // 采矿
  const miningKey = `MiningItem${id}`
  const miningData = (MiningItemData as any)[miningKey]
  if (miningData) {
    sources.push({ type: 'mining', name: miningData[0] })
  }

  // 淘金
  const metallurgyKey = `MetallurgyItem${id}`
  const metallurgyData = (MetallurgyItemData as any)[metallurgyKey]
  if (metallurgyData) {
    sources.push({ type: 'panning', name: metallurgyData[0] })
  }

  // 送礼
  if ((GiftItemData as any).GiftItemList) {
    (GiftItemData as any).GiftItemList.forEach((giftRecord: any) => {
      const npcType = giftRecord[0]
      const itemsInfo = giftRecord.slice(1)
      itemsInfo.forEach((itemInfo: any) => {
         if (itemInfo && itemInfo.length > 2 && itemInfo[2].includes(idNum)) {
             sources.push({ type: 'gift', method: npcType, name: itemInfo[0] })
         }
      })
    })
  }

  // 兼职与任务分类
  if ((QuestItemData as any).QuestItemList) {
    (QuestItemData as any).QuestItemList.forEach((questClass: any) => {
      const quests = questClass.slice(1)
      quests.forEach((q: any) => {
         if (q && q.length > 1 && q.includes(idNum)) {
             sources.push({ type: 'quest', name: q[0] || '兼职/活动' })
         }
      })
    })
  }
  
  // 特定道具任务奖励
  const questKey = `QuestItem${id}`
  const questData = (QuestItemData as any)[questKey]
  if (questData && Array.isArray(questData)) {
     questData.forEach((record: any) => {
         sources.push({ type: 'quest', name: record[1] })
     })
  }

  return sources
}

import { useRoute } from 'vue-router'

const route = useRoute()
const selectedSkillId = ref<number | null>(null)
const searchQuery = ref('')
const selectedItem = ref<any>(null)
const isDrawerOpen = ref(false)
const isSidebarOpen = ref(false)

const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = computed(() => items.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const handleQuerySearch = () => {
  const querySearch = route.query.search as string
  if (querySearch) {
    searchQuery.value = querySearch
    // Find first matching skill that has this item
    Object.entries(skillMap).some(([skillId, skillInfo]) => {
      const data = skillInfo.data
      const foundMatch = Object.keys(data).find(key => {
        if (key.includes('Item') && /\d+$/.test(key)) {
          const id = key.match(/\d+$/)?.[0] || ''
          return getItemName(id) === querySearch
        }
        return false
      })
      
      if (foundMatch) {
         const id = foundMatch.match(/\d+$/)?.[0] || ''
         selectedSkillId.value = Number(skillId)
         nextTick(() => {
            const item = items.value.find((i: any) => i.id === id)
            if (item) openDetail(item)
         })
         return true
      }
      return false
    })
  }
}

import { onMounted, onUnmounted, watch } from 'vue'
onMounted(() => {
  handleQuerySearch()
})

watch(() => route.query.search, () => {
  handleQuerySearch()
})

const currentSkill = computed(() => {
  if (selectedSkillId.value === null) return { data: {}, label: '未选择技能' }
  return skillMap[selectedSkillId.value] || { data: {}, label: '未知' }
})

const parseItems = (data: any, skillId: number) => {
  return Object.keys(data)
    .filter(key => key.includes('Item') && /\d+$/.test(key))
    .map((key: string) => {
      const id = key.match(/\d+$/)?.[0] || ''
      const rawData = data[key]
      const name = getItemName(id)
      let processedMaterials: any[] = []
      let recipes: any[][] = []
      let level = '?'
      let cookingTools: number[] = []
      let cookingMethodName = ''
      
      // 处理料理 (CookingId: 10020)
      if (skillId === 10020 && Array.isArray(rawData)) {
        const methodId = rawData[0]
        const methodInfo = COOKING_METHODS_INFO[methodId]
        cookingMethodName = methodInfo ? methodInfo.name : `料理(${methodId})`
        cookingTools = methodInfo ? methodInfo.tools : []
        level = '-'
        
        let currentRecipe: any[] = []
        for (let i = 1; i < rawData.length; i += 2) {
          const matId = rawData[i]
          const ratio = rawData[i+1]
          if (matId && typeof matId === 'number' && matId > 1000) {
            const mat = { id: matId, name: getItemName(matId), qty: ratio ? `${ratio}%` : '' }
            processedMaterials.push(mat)
            currentRecipe.push(mat)
          }
        }
        if (currentRecipe.length > 0) recipes.push(currentRecipe)
      } else if (typeof rawData[0] === 'number' && rawData[0] > 1000) {
        // Special case: Milling has no level, array is just [item, count, item, count]
        level = '-'
        let currentRecipe: any[] = []
        for (let i = 0; i < rawData.length; i++) {
          const val = rawData[i]
          if (typeof val === 'number' && val > 1000) {
            const nextVal = rawData[i+1]
            const mat = { id: val, name: getItemName(val), qty: typeof nextVal === 'number' ? nextVal : '' }
            processedMaterials.push(mat)
            currentRecipe.push(mat)
            if (typeof nextVal === 'number') i++
          } else if (typeof val === 'string') {
             if (val === '') {
                 if (currentRecipe.length > 0) { recipes.push(currentRecipe); currentRecipe = []; }
             } else {
                 const mat = { id: null, name: val, qty: '' }
                 processedMaterials.push(mat)
                 currentRecipe.push(mat)
             }
          }
        }
        if (currentRecipe.length > 0) recipes.push(currentRecipe)
      } else if (Array.isArray(rawData[0])) {
        level = rawData[0][0]
        const isManualSkill = [10001, 10016].includes(skillId)
        
        for (let i = 1; i < rawData.length; i++) {
          let matsRaw = rawData[i] || []
          let currentRecipe: any[] = []
          
          // 打铁/裁缝：提取样本/设计图作为第一项材料
          if (isManualSkill && matsRaw[0] && typeof matsRaw[0] === 'number' && matsRaw[0] > 1000) {
             const sampleId = matsRaw[0]
             const sampleMat = { id: sampleId, name: getItemName(sampleId), qty: '样本', isSample: true }
             processedMaterials.push(sampleMat)
             currentRecipe.push(sampleMat)
             matsRaw = matsRaw.slice(1)
          }
           
          for (let k = 0; k < matsRaw.length; k++) {
            const val = matsRaw[k]
            if (val === 0) continue 
            if (typeof val === 'number' && val > 1000) {
              const nextVal = matsRaw[k+1]
              const mat = { id: val, name: getItemName(val), qty: typeof nextVal === 'number' ? nextVal : '' }
              processedMaterials.push(mat)
              currentRecipe.push(mat)
              if (typeof nextVal === 'number') k++
            } else if (typeof val === 'string') {
                 if (val === '') {
                     if (currentRecipe.length > 0) { recipes.push(currentRecipe); currentRecipe = []; }
                 } else {
                     const mat = { id: null, name: val, qty: '' }
                     processedMaterials.push(mat)
                     currentRecipe.push(mat)
                 }
            }
          }
          if (currentRecipe.length > 0) recipes.push(currentRecipe)
        }
      } else {
        level = rawData[0]
        let currentRecipe: any[] = []
        for (let i = 1; i < rawData.length; i++) {
          const val = rawData[i]
          if (Array.isArray(val)) {
            let innerRecipe: any[] = []
            for (let j = 0; j < val.length; j++) {
              const innerVal = val[j]
              if (typeof innerVal === 'number' && innerVal > 1000) {
                const nextVal = val[j+1]
                const mat = { id: innerVal, name: getItemName(innerVal), qty: typeof nextVal === 'number' ? nextVal : '' }
                processedMaterials.push(mat)
                innerRecipe.push(mat)
                if (typeof nextVal === 'number') j++
              } else if (typeof innerVal === 'string') {
                   if (innerVal === '') {
                       if (innerRecipe.length > 0) { recipes.push(innerRecipe); innerRecipe = []; }
                   } else {
                       const mat = { id: null, name: innerVal, qty: '' }
                       processedMaterials.push(mat)
                       innerRecipe.push(mat)
                   }
              }
            }
            if (innerRecipe.length > 0) recipes.push(innerRecipe)
          } else if (typeof val === 'number' && val > 1000) {
            const nextVal = rawData[i+1]
            const mat = { id: val, name: getItemName(val), qty: typeof nextVal === 'number' ? nextVal : '' }
            processedMaterials.push(mat)
            currentRecipe.push(mat)
            if (typeof nextVal === 'number') i++
          } else if (typeof val === 'string') {
               if (val === '') {
                   if (currentRecipe.length > 0) { recipes.push(currentRecipe); currentRecipe = []; }
               } else {
                   const mat = { id: null, name: val, qty: '' }
                   processedMaterials.push(mat)
                   currentRecipe.push(mat)
               }
          }
        }
        if (currentRecipe.length > 0) recipes.push(currentRecipe)
      }
      return { id, name, materials: processedMaterials, recipes, level, cookingTools, cookingMethodName }
    })
}


const items = computed(() => {
  if (selectedSkillId.value === null) return []
  const result = parseItems(currentSkill.value.data, selectedSkillId.value)
  return result
    .filter((item: any) => item.name.includes(searchQuery.value))
    .sort((a: any, b: any) => {
      const levelA = String(a.level).replace(/[^\d.]/g, '')
      const levelB = String(b.level).replace(/[^\d.]/g, '')
      return (parseFloat(levelA) || 0) - (parseFloat(levelB) || 0)
    })
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return items.value.slice(start, end)
})

const openDetail = (item: any, skillId?: number) => {
  const currentSkillId = skillId || selectedSkillId.value
  
  // Find all skills that can craft this item
  const craftSkillIds = recipeRegistry.value[item.id] || []
  
  // For each skill, extract its recipes for this item
  const craftingMethods = craftSkillIds.map(sId => {
     // We need the data mapped for this specific skill and this item
     const skillData = skillMap[sId]?.data
     if (!skillData) return null
     const rawKey = Object.keys(skillData).find(k => k.match(/\d+$/)?.[0] === String(item.id))
     if (!rawKey) return null
     
     // To extract it without altering everything, we can just use `parseItems` on a dummy object containing only this key
     const dummyData = { [rawKey]: skillData[rawKey] }
     const parsedArr = parseItems(dummyData, sId)
     if (parsedArr.length === 0) return null
     
     const parsedItem = parsedArr[0]
     
     // Enrich materials within each recipe
     const enrichedRecipes = parsedItem.recipes.map((recipe: any[]) => {
        return recipe.map(m => ({
          ...m,
          isCraftable: !!recipeRegistry.value[m.id],
          qty: m.qty,
          sources: m.id ? organizeSources(getItemSources(m.id)) : []
        }))
     })
     
     return {
        skillId: sId,
        skillLabel: skillMap[sId]?.label,
        level: parsedItem.level,
        recipes: enrichedRecipes,
        cookingMethodName: parsedItem.cookingMethodName,
        cookingTools: parsedItem.cookingTools,
        cookingMethodIcon: (COOKING_METHODS_INFO as any)[(dummyData[rawKey] as any)[0]]?.icon || null
     }
  }).filter(Boolean)
  
  // Fallback for preview-level materials
  const enrichedMaterials = item.materials.map((m: any) => ({
    ...m,
    isCraftable: !!recipeRegistry.value[m.id],
    qty: m.qty,
    sources: m.id ? organizeSources(getItemSources(m.id)) : []
  }))
  
  // 获取当前物品的所有获取途径
  const allSources = getItemSources(item.id)
  const organizedSources = organizeSources(allSources)
  
  // 解析装备属性（如适用）
  const rawItemData = (GlobalItemData as any)[`Item${item.id}`]
  const equipmentProps = rawItemData ? parseItemEquipment(rawItemData) : null

  selectedItem.value = { 
    ...item, 
    materials: enrichedMaterials, 
    craftingMethods,
    skillId: currentSkillId,
    allSources: organizedSources,
    equipmentProps
  }
  isDrawerOpen.value = true
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const jumpToRecipe = (itemId: string | number) => {
  const targetSkillIds = recipeRegistry.value[itemId]
  if (targetSkillIds && targetSkillIds.length > 0) {
    const targetSkillId = targetSkillIds[0]
    selectedSkillId.value = targetSkillId
    searchQuery.value = ''
    nextTick(() => {
      const targetItem = items.value.find((i: any) => i.id === String(itemId))
      if (targetItem) openDetail(targetItem, targetSkillId)
    })
  }
}

const handleMaterialClick = (material: any) => {
  if (material.isCraftable && material.id) {
    // 如果材料可以通过技能制作，跳转到对应配方
    jumpToRecipe(material.id)
  }
  // 如果不能制作，显示的信息已经在模板中展开了
}

const hideImage = (e: Event) => {
  (e.target as HTMLElement).style.opacity = '0'
}

const hideImageOnLoad = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target) target.style.display = 'none'
}

// 整理获取途径（getItemSources 中 shop 已按价格分组，直接透传，新增 mining/panning/gift/quest）
const organizeSources = (sources: any[]) => {
  const organized: any[] = []

  // 按类型分组
  const grouped: Record<string, any[]> = {}
  sources.forEach(src => {
    if (!grouped[src.type]) grouped[src.type] = []
    grouped[src.type].push(src)
  })

  // 处理NPC购买（每个 shop 记录已经是按价格分组的对象，直接透传）
  if (grouped.shop) {
    grouped.shop.forEach(src => organized.push(src))
  }

  // 处理钓鱼
  if (grouped.fish) {
    const locations = grouped.fish.map(src => src.name)
    organized.push({ 
      type: 'fish', 
      title: '钓鱼获得', 
      locations, 
      icon: getSkillIcon(getSkillIconForMethod('fish')) 
    })
  }

  // 处理怪物掉落
  if (grouped.drop) {
    grouped.drop.forEach(src => organized.push({ 
      type: 'drop', 
      title: '怪物掉落', 
      name: src.name, 
      icon: getSkillIcon(getSkillIconForMethod('drop')) 
    }))
  }

  // 处理采集
  if (grouped.gather) {
    grouped.gather.forEach(src => organized.push({ 
      type: 'gather', 
      title: '采集获得', 
      name: src.name, 
      method: src.method, 
      icon: getSkillIcon(getSkillIconForMethod('gather', src.method)) 
    }))
  }

  // 处理采矿
  if (grouped.mining) {
    grouped.mining.forEach(src => organized.push({ 
      type: 'mining', 
      title: '采矿', 
      name: src.name, 
      icon: getSkillIcon(getSkillIconForMethod('mining')) 
    }))
  }

  // 处理淘金
  if (grouped.panning) {
    grouped.panning.forEach(src => organized.push({ 
      type: 'panning', 
      title: '淘金获得', 
      name: src.name, 
      icon: getSkillIcon(getSkillIconForMethod('panning')) 
    }))
  }

  // 处理采矿
  if (grouped.mining) {
    grouped.mining.forEach(src => organized.push({ 
      type: 'mining', 
      title: '采矿获得', 
      name: src.name, 
      icon: getSkillIcon(getSkillIconForMethod('mining')) 
    }))
  }

  // 处理送礼
  if (grouped.gift) {
    grouped.gift.forEach(src => organized.push({ 
      type: 'gift', 
      title: '亲密度礼物', 
      name: src.name, 
      method: src.method,
      icon: '/img/item/23011.png' // 礼物盒图标
    }))
  }

  // 处理任务奖励
  if (grouped.quest) {
    const questNames = grouped.quest.map((src: any) => src.name).filter(Boolean)
    if (questNames.length > 0) {
      organized.push({ 
        type: 'quest', 
        title: '任务/兼职奖励', 
        locations: questNames, 
        icon: getSkillIcon(getSkillIconForMethod('quest')) 
      })
    }
  }

  return organized
}

const handleNpcImgError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) target.src = '/img/npc/0.png';
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const paginationPages = computed(() => {
  const pages: (number | '...')[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const offset = isMobile ? 0 : 2

  pages.push(1)

  if (current > offset + 2) {
    pages.push('...')
  }

  const start = Math.max(2, current - offset)
  const end = Math.min(total - 1, current + offset)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - offset - 1) {
    pages.push('...')
  }

  if (total > 1) {
    pages.push(total)
  }

  return pages
})

watch([selectedSkillId, searchQuery], () => {
  currentPage.value = 1
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

const handleResize = () => {
  if (typeof window === 'undefined') return
}
</script>

<template>
  <div class="formula-page">
    <Transition name="fade">
      <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>
    </Transition>

    <!-- Sidebar -->
    <aside :class="['sidebar', 'glass-panel', { 'mobile-open': isSidebarOpen }]">
      <div class="sidebar-header">
        <h3 class="gold-text">分类目录</h3>
        <button class="mobile-close-btn" @click="isSidebarOpen = false">
           <X :size="20" />
        </button>
      </div>

      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input v-model="searchQuery" placeholder="搜索配方..." @input="closeDrawer" />
      </div>
      
      <nav class="skill-nav">
        <button 
          v-for="id in Object.keys(skillMap)" 
          :key="id"
          :class="['skill-btn', { active: selectedSkillId === Number(id) }]"
          @click="selectedSkillId = Number(id); closeDrawer(); isSidebarOpen = false"
        >
          <img :src="getSkillIcon(id)" class="skill-icon-img" />
          <span>{{ skillMap[Number(id)].label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main v-if="selectedSkillId !== null" :class="['main-content', { 'with-drawer': isDrawerOpen }]">
      <div class="content-header glass-panel">
        <div class="header-left">
          <button class="menu-btn" @click="toggleSidebar">
            <span class="menu-icon"></span>
          </button>
          <h2 class="gold-text">{{ currentSkill.label }}</h2>
        </div>
        <span class="badge">{{ items.length }} 条配方</span>
      </div>

      <div class="items-container">
        <div 
          v-for="item in paginatedItems" 
          :key="item.id" 
          :class="['item-list-card', { active: selectedItem?.id === item.id && isDrawerOpen }]"
          @click="openDetail(item)"
        >
          <div class="item-visual">
            <img :src="getItemIcon(item.id)" class="item-thumb" @error="hideImage" />
          </div>
          
          <div class="item-core">
            <div class="item-main-info">
              <span :class="['level-badge', getLevelClass(item.level), { 'special-level': item.level === '-' }]">Lv.{{ item.level }}</span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="item-mats-preview">
              <div v-for="(m, idx) in item.materials.slice(0, 4)" :key="idx" class="mat-micro">
                <img v-if="m.id" :src="getItemIcon(m.id)" class="mat-micro-img" />
                <span class="mat-micro-name">{{ m.name }}</span>
              </div>
              <span v-if="item.materials.length > 4" class="more-mats">...</span>
            </div>
          </div>
          
          <ChevronRight :size="18" class="arrow-icon" />
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            上一页
          </button>
          
          <div class="page-numbers">
            <template v-for="(page, index) in paginationPages" :key="index">
              <button 
                v-if="typeof page === 'number'"
                :class="['page-number', { active: currentPage === page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <span v-else class="page-ellipsis">...</span>
            </template>
          </div>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
        <div class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页，总计 {{ totalItems }} 条
        </div>
      </div>
    </main>

    <!-- Empty State / Welcome (当未选择技能时显示) -->
    <main v-else class="main-content empty-state-container">
      <div class="empty-state-content glass-panel" @click="isSidebarOpen = true">
        <div class="welcome-icon">📖</div>
        <h2 class="gold-text">欢迎使用制作百科</h2>
        <p class="welcome-text">请从左侧目录选择一个技能，查看其详细配方与采集信息</p>
        <div class="welcome-hint">
          <ChevronRight :size="16" class="hint-arrow" />
          <span>点击开始探索</span>
        </div>
      </div>
    </main>

    <!-- Detail Drawer -->
    <Transition name="slide">
      <aside v-if="isDrawerOpen && selectedItem" class="detail-drawer glass-panel">
        <button class="close-btn" @click="closeDrawer">
          <X :size="24" />
        </button>

        <div class="drawer-content">
          <div class="drawer-header">
            <div class="large-icon-box gold-border">
              <img :src="getItemIcon(selectedItem.id)" class="large-item-icon" />
            </div>
            <h3 class="gold-text">{{ selectedItem.name }}</h3>
            <div class="id-tag">ID: {{ selectedItem.id }}</div>
            <div :class="['level-tag', getLevelClass(selectedItem.level)]">等级要求: {{ selectedItem.level }}</div>
            <div class="skill-tag" v-if="selectedItem.skillId">
              使用技能: {{ skillMap[selectedItem.skillId]?.label || '未知' }}
            </div>
          </div>

          <!-- 装备/料理属性区域 (位置调整至顶端) -->
          <section class="drawer-section eq-section" v-if="selectedItem.equipmentProps">
            <h4 class="section-title eq-title">
              {{ selectedItem.equipmentProps.typeLabel === 'Food' ? '🍳 料理属性' : '⚔️ ' + selectedItem.equipmentProps.typeLabel + ' 属性' }}
            </h4>
            <div class="eq-grid">
              <!-- 基础属性 -->
              <div class="eq-col glass-panel" v-if="selectedItem.equipmentProps.baseStats.length > 0">
                <div class="eq-col-title">基础属性</div>
                <div v-for="(stat, si) in selectedItem.equipmentProps.baseStats" :key="'bs-'+si" class="eq-stat-row">
                   {{ stat }}
                </div>
              </div>
              <!-- 附加信息 -->
              <div class="eq-col glass-panel" v-if="selectedItem.equipmentProps.bonusStats.length > 0">
                <div class="eq-col-title">附加信息</div>
                <div v-for="(stat, si) in selectedItem.equipmentProps.bonusStats" :key="'bo-'+si" class="eq-stat-row">
                   {{ stat }}
                </div>
              </div>
              <!-- 特殊属性 -->
              <div class="eq-col glass-panel" v-if="selectedItem.equipmentProps.extraAttrs.length > 0">
                <div class="eq-col-title">特殊属性</div>
                <div v-for="(attr, ai) in selectedItem.equipmentProps.extraAttrs" :key="'ea-'+ai" class="eq-stat-row eq-extra">
                   {{ attr }}
                </div>
              </div>
            </div>
            <!-- 套装效果 -->
            <div v-if="selectedItem.equipmentProps.setEffects.length > 0" class="set-effects-panel glass-panel">
              <div class="set-effects-title">🔮 套装属性</div>
              <div v-for="(eff, ei) in selectedItem.equipmentProps.setEffects" :key="'se-'+ei" class="set-effect-row">
                ✦ {{ eff }}
              </div>
            </div>
          </section>

          <!-- 获取途径区域 -->
          <section class="drawer-section" v-if="selectedItem.allSources && selectedItem.allSources.length > 0">
            <h4 class="section-title"><ShoppingCart :size="16" /> 获取途径</h4>
            <div class="sources-grid">
              <!-- 技能制作 -->
              <div v-for="method in selectedItem.craftingMethods" :key="'skill-'+method.skillId" class="source-card glass-panel">
                <div class="source-card-header">
                  <img :src="getSkillIcon(method.skillId)" class="source-skill-icon" />
                  <span class="source-card-title">{{ method.skillLabel }}</span>
                </div>
                <div class="source-card-content">
                  通过{{ method.skillLabel }}制作获得 (Lv.{{ method.level }})
                </div>
              </div>
              
              <!-- 其他获取途径 -->
              <div 
                v-for="(source, idx) in selectedItem.allSources" 
                :key="idx" 
                class="source-card glass-panel"
              >
                <div class="source-card-header">
                  <!-- NPC购买 -->
                  <template v-if="source.type === 'shop'">
                    <ShoppingCart :size="16" />
                    <span class="source-card-title">NPC商店</span>
                  </template>
                  <!-- 钓鱼获得 -->
                  <template v-else-if="source.type === 'fish'">
                    <img :src="getSkillIcon(FISHING_SKILL_ID)" class="source-skill-icon" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 怪物掉落 -->
                  <template v-else-if="source.type === 'drop'">
                    <Target :size="16" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 采集获得 -->
                  <template v-else-if="source.type === 'gather'">
                    <Pickaxe :size="16" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 采矿 -->
                  <template v-else-if="source.type === 'mining'">
                    <img src="/img/skill/55002.png" class="source-skill-icon" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 淘金 -->
                  <template v-else-if="source.type === 'panning'">
                    <img src="/img/skill/10028.png" class="source-skill-icon" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 送礼 -->
                  <template v-else-if="source.type === 'gift'">
                    <Gift :size="16" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                  <!-- 任务奖励 -->
                  <template v-else-if="source.type === 'quest'">
                    <ScrollText :size="16" />
                    <span class="source-card-title">{{ source.title }}</span>
                  </template>
                </div>
                
                <div class="source-card-content">
                  <!-- NPC购买 — 按价格分组，展示头像 -->
                  <template v-if="source.type === 'shop'">
                    <div class="shop-price-header">
                      <img 
                        v-if="source.currencyIcon"
                        :src="source.currencyIcon"
                        class="currency-icon"
                        @error="hideImageOnLoad"
                      />
                      <span class="price-text">{{ source.price }}</span>
                      <span class="currency-label" v-if="source.currencyId !== 2000">{{ source.currencyName }}</span>
                    </div>
                    <div class="npc-avatars-row">
                      <div v-for="(npc, nidx) in source.npcs" :key="nidx" class="npc-avatar-item">
                        <img 
                          :src="`/img/npc/${npc.npcId}.png`" 
                          class="npc-avatar"
                          :title="`${npc.name}\n@${npc.location}`"
                          @error="hideImageOnLoad"
                        />
                        <div class="npc-name-small">{{ npc.name }}</div>
                        <div class="npc-location-small" v-if="npc.location">{{ npc.location }}</div>
                      </div>
                    </div>
                    <!-- 命名来源 -->
                    <div v-for="(ns, nsidx) in source.namedSources" :key="'ns-'+nsidx" class="named-source">
                      {{ ns }}
                    </div>
                  </template>
                  
                  <!-- 钓鱼地点列表 -->
                  <template v-else-if="source.type === 'fish' && source.locations">
                    <div class="fish-locations">
                      <div v-for="(loc, lidx) in source.locations" :key="lidx" class="fish-location">
                        <Fish :size="12" class="fish-icon" />
                        <span>{{ loc }}</span>
                      </div>
                    </div>
                  </template>
                  
                  <!-- 怪物掉落 -->
                  <template v-else-if="source.type === 'drop'">
                    <div>{{ source.name }}</div>
                  </template>
                  
                  <!-- 采集获得 -->
                  <template v-else-if="source.type === 'gather'">
                    <div>{{ source.name }}</div>
                    <div v-if="source.method" class="source-detail-method">[{{ source.method }}]</div>
                  </template>

                  <!-- 采矿 -->
                  <template v-else-if="source.type === 'mining'">
                    <div>{{ source.name }}</div>
                  </template>

                  <!-- 淘金 -->
                  <template v-else-if="source.type === 'panning'">
                    <div>{{ source.name }}</div>
                  </template>

                  <!-- 送礼 -->
                  <template v-else-if="source.type === 'gift'">
                    <div>{{ source.name }}</div>
                    <div v-if="source.method" class="source-detail-method">{{ source.method }}</div>
                  </template>

                  <!-- 任务奖励 — 可能有多个条目 -->
                  <template v-else-if="source.type === 'quest' && source.locations">
                    <div class="quest-locations">
                      <div v-for="(q, qidx) in source.locations" :key="qidx" class="quest-entry">
                        <ScrollText :size="12" />
                        <span>{{ q }}</span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </section>
          <!-- 制作方式与配方列表 -->
          <section class="drawer-section" v-if="selectedItem.craftingMethods && selectedItem.craftingMethods.length > 0">
            <div v-for="method in selectedItem.craftingMethods" :key="'craft-'+method.skillId" class="crafting-method-block">
              <!-- 制作方式标题与工具展示 -->
              <div class="method-header">
                <h4 class="section-title method-title">
                  <img :src="method.methodIcon || getSkillIcon(method.skillId)" class="method-skill-icon" />
                  <span v-if="method.cookingMethodName">制作方式: {{ method.cookingMethodName }}</span>
                  <span v-else>制作配方 ({{ method.skillLabel }})</span>
                </h4>
                
                <div v-if="method.cookingTools && method.cookingTools.length > 0" class="mini-tools-row">
                  <div v-for="toolId in method.cookingTools" :key="toolId" class="mini-tool-item" v-tooltip="getItemName(toolId)">
                    <img :src="getItemIcon(toolId)" class="mini-tool-icon" />
                  </div>
                </div>
              </div>

              <div class="recipes-list">
                <div v-for="(recipe, rIdx) in method.recipes" :key="'recipe-'+rIdx" class="recipe-group">
                  <div v-if="method.recipes.length > 1" class="recipe-variant-label">配方 {{ Number(rIdx) + 1 }}</div>
                  <div class="material-grid">
                    <div 
                      v-for="(m, idx) in recipe" 
                      :key="idx" 
                      :class="['material-item', 'glass-panel', { 'is-clickable': m.isCraftable || (m.sources && m.sources.length > 0) }]"
                      @click="handleMaterialClick(m)"
                    >
                      <div class="mat-info-row">
                        <div class="mat-icon-wrapper">
                          <img v-if="m.id" :src="getItemIcon(m.id)" class="mat-icon" />
                          <div v-else class="mat-no-icon">?</div>
                        </div>
                        <div class="mat-detail">
                          <div class="mat-name-row">
                            <span v-if="m.isSample" class="sample-tag">底块/样本</span>
                            <span class="mat-title">{{ m.name }}</span>
                            <Link2 v-if="m.isCraftable" :size="14" class="jump-icon" />
                            <Info v-else-if="m.sources && m.sources.length > 0" :size="14" class="info-icon" />
                          </div>
                          <span class="mat-amount gold-text" v-if="m.qty">{{ m.qty.toString().includes('%') ? m.qty : 'x ' + m.qty }}</span>
                        </div>
                      </div>
                      
                      <!-- 紧凑型来源列表 -->
                      <div v-if="m.sources && m.sources.length > 0" class="mat-sources">
                        <div v-for="(src, sidx) in m.sources" :key="sidx" class="source-card-compact">
                          <div class="source-main-info">
                            <img v-if="src.icon" :src="src.icon" class="source-mini-skill" />
                            <div class="source-label-wrap">
                              <span class="source-type-label">{{ src.title || src.type }}</span>
                              <span class="source-name-text">
                                <template v-if="src.type === 'shop'">
                                  <span class="price-val">{{ src.price }}</span>
                                  <img :src="src.currencyId === 2000 ? '/img/item/2000.png' : src.currencyIcon" class="currency-mini" />
                                </template>
                                <template v-else>{{ src.name || src.method }}</template>
                              </span>
                            </div>
                          </div>
                          
                          <!-- NPC 头像列表 -->
                          <div v-if="src.npcs && src.npcs.length > 0" class="source-npc-avatars">
                            <div v-for="npc in src.npcs" :key="npc.npcId" class="npc-mini-wrap" v-tooltip="npc.name + ' (' + npc.location + ')'">
                              <img :src="`/img/npc/${npc.npcId}.png`" class="npc-mini-avatar" @error="handleNpcImgError" />
                            </div>
                          </div>

                          <div v-if="src.locations && src.locations.length > 0" class="source-locations-text">
                            {{ src.locations.join(', ') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <footer class="drawer-footer">
            <p class="hint-text">点击左侧列表可快速切换项目</p>
          </footer>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.method-title {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
  gap: 10px;
}

.method-skill-icon {
  width: 28px;
  height: 28px;
}

.mini-tools-row {
  display: flex;
  gap: 8px;
}

.mini-tool-item {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s;
}

.mini-tool-item:hover {
  transform: scale(1.1);
  border-color: var(--gold-mute);
}

.mini-tool-icon {
  width: 24px;
  height: 24px;
}

.crafting-method-block {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.crafting-method-block:last-child {
  border-bottom: none;
}

/* 紧凑型来源卡片 */
.source-card-compact {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 4px;
}

.source-main-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-mini-skill {
  width: 18px;
  height: 18px;
}

.source-label-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.source-type-label {
  font-size: 11px;
  color: var(--gold-mute);
  font-weight: 600;
  text-transform: uppercase;
}

.source-name-text {
  font-size: 12px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-val {
  font-weight: 600;
  color: #ffcc00;
}

.currency-mini {
  width: 14px;
  height: 14px;
}

.source-npc-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 26px;
}

.npc-mini-wrap {
  cursor: pointer;
}

.npc-mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
}

.source-locations-text {
  font-size: 11px;
  color: var(--text-secondary);
  padding-left: 26px;
  font-style: italic;
}

.formula-page {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);
  padding: 0 20px;
  position: relative;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sidebar Content Styles */
.sidebar-header {
  display: none; /* Desktop hidden */
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: white;
  outline: none;
  transition: var(--transition);
}

.search-box input:focus {
  border-color: var(--gold);
  background: rgba(212, 175, 55, 0.05);
}

.skill-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 10px; /* space for scrollbar */
  margin-right: -10px; /* offset padding so background still looks good */
}

/* Custom scrollbar for skill-nav */
.skill-nav::-webkit-scrollbar {
  width: 4px;
}
.skill-nav::-webkit-scrollbar-track {
  background: transparent;
}
.skill-nav::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 4px;
}
.skill-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5);
}

.skill-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.skill-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.skill-btn.active {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-mute);
  color: var(--gold);
}

.skill-icon-img {
  width: 24px;
  height: 24px;
}

/* Main Content Wrapper */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

.main-content.with-drawer {
  margin-right: 420px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  display: none; /* Desktop hidden */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: var(--gold);
  display: none; /* Hidden on desktop */
}

.menu-icon {
  display: block;
  width: 18px;
  height: 2px;
  background: currentColor;
  position: relative;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: currentColor;
  left: 0;
}

.menu-icon::before { top: -6px; }
.menu-icon::after { bottom: -6px; }

.content-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Items Grid */
.items-container {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 12px;
  padding-right: 10px;
  align-content: start; /* 确保数据少时不会纵向拉伸 */
}

/* Empty State Styles */
.empty-state-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-state-content {
  max-width: 500px;
  width: 100%;
  padding: 60px 40px;
  text-align: center;
  border: 1px solid rgba(212, 175, 55, 0.2);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-state-content:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.welcome-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 16px 0 32px;
}

.welcome-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--gold-mute);
  font-weight: 500;
  padding: 10px 20px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 30px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.hint-arrow {
  animation: slideLeft 1.5s infinite;
}

@keyframes slideLeft {
  0%, 100% { transform: translateX(0); opacity: 1; }
  50% { transform: translateX(-4px); opacity: 0.5; }
}

.pagination-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  flex-wrap: wrap;
  justify-content: center;
}

.page-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-mute);
  color: var(--gold);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-number {
  width: 32px;
  height: 32px;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.page-number:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.page-number.active {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--gold);
  color: var(--gold);
  font-weight: 600;
}

.page-ellipsis {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.page-info {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .pagination {
    padding: 6px 10px;
    gap: 6px;
  }
  
  .page-btn {
    padding: 4px 10px;
    font-size: 11px;
  }
  
  .page-number {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  
  .page-ellipsis {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  
  .page-numbers {
    gap: 3px;
  }
  
  .page-info {
    font-size: 10px;
  }
}

.item-list-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.item-list-card:hover {
  background: rgba(212, 175, 55, 0.04);
  border-color: var(--gold-mute);
  transform: translateX(4px);
}

.item-list-card.active {
  background: rgba(212, 175, 55, 0.08);
  border-color: var(--gold);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
}

.item-visual {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  margin-right: 16px;
  flex-shrink: 0;
}

.item-thumb {
  max-width: 38px;
  max-height: 38px;
}

.item-core {
  flex: 1;
  min-width: 0;
}

.item-main-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.level-badge {
  font-size: 10px;
  color: var(--gold);
  font-weight: bold;
}

.item-name {
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-mats-preview {
  display: flex;
  gap: 8px;
  overflow: hidden;
}

.mat-micro {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.mat-micro-img {
  width: 14px;
  height: 14px;
}

.mat-micro-name {
  color: var(--text-secondary);
  white-space: nowrap;
}

.more-mats {
  color: var(--gold);
  font-size: 12px;
}

.arrow-icon {
  color: var(--text-secondary);
  opacity: 0.3;
}

/* Detail Drawer (Right) */
.detail-drawer {
  position: absolute;
  top: 0;
  right: 20px;
  width: 400px;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.close-btn:hover {
  color: white;
  transform: rotate(90deg);
}

.drawer-content {
  padding: 40px 30px;
  overflow-y: auto;
  flex: 1;
}

.drawer-header {
  text-align: center;
  margin-bottom: 30px;
}

.large-icon-box {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 20px;
  border: 1px solid var(--gold-mute);
}

.large-item-icon {
  width: 60px;
  height: 60px;
}

.id-tag {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  font-family: monospace;
}

.level-tag {
  display: inline-block;
  margin-top: 12px;
  padding: 4px 16px;
  border-radius: 8px;
  color: #000;
  font-weight: 700;
  font-size: 13px;
}

.skill-tag {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid var(--gold-mute);
  color: var(--gold);
  font-weight: 600;
  font-size: 12px;
}

.drawer-section {
  margin-top: 30px;
}

.sources-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: transform 0.2s, background 0.2s;
}

.source-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.source-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.source-skill-icon {
  width: 24px;
  height: 24px;
}

.source-card-title {
  color: var(--gold);
  font-size: 15px;
  font-weight: 600;
}

.source-card-content {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  padding-left: 34px;
}

/* NPC 列表样式 */
.npc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s;
}

.npc-item:last-child {
  margin-bottom: 0;
}

.npc-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.npc-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.npc-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid var(--gold-mute);
  flex-shrink: 0;
}

.npc-info {
  flex: 1;
  min-width: 0;
}

.npc-name {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.npc-location {
  color: var(--text-secondary);
  font-size: 12px;
}

.npc-price {
  color: var(--gold);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 12px;
}

/* 钓鱼地点列表样式 */
.fish-locations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fish-location {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.fish-icon {
  color: var(--gold-mute);
}

.source-detail-loc,
.source-detail-method {
  color: var(--gold-mute);
  font-size: 12px;
  margin-top: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gold);
  margin-bottom: 16px;
  font-size: 16px;
   border-left: 3px solid var(--gold);
   padding-left: 12px;
}

.level-tag.rank-1, .level-badge.rank-1 { background: #d4af37; color: #000; }
.level-tag.rank-low, .level-badge.rank-low { background: #34495e; color: #bdc3c7; }
.level-tag.rank-mid, .level-badge.rank-mid { background: #2980b9; color: #fff; }

.material-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Material Individual Item */
.material-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: transform 0.2s, background 0.2s;
}

.material-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mat-info-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.mat-icon-wrapper {
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
}

.mat-icon {
  width: 34px;
  height: 34px;
}

.mat-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mat-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mat-title {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
}

.jump-icon {
  color: var(--gold-mute);
  opacity: 0.6;
  transition: var(--transition);
}

.info-icon {
  color: var(--text-secondary);
  opacity: 0.6;
  transition: var(--transition);
}

.is-clickable {
  cursor: pointer;
  position: relative;
}

.is-clickable:hover .jump-icon {
  opacity: 1;
  transform: translateX(2px);
  color: var(--gold);
}

.is-clickable:hover .info-icon {
  opacity: 1;
  color: var(--gold);
}

.mat-amount {
  font-size: 13px;
  font-weight: 600;
}

.recipe-group {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.recipe-variant-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 12px;
}

/* Sources */
.mat-sources {
  width: 100%;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.source-tag {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.source-tag svg {
  margin-top: 2px;
  color: var(--gold-mute);
  flex-shrink: 0;
}

.source-text { word-break: break-all; }
.source-loc { display: block; color: var(--gold-mute); font-style: italic; opacity: 0.8; }

.drawer-footer {
  margin-top: 40px;
  text-align: center;
  border-top: 1px solid var(--glass-border);
  padding-top: 20px;
  margin-bottom: 20px;
}

.hint-text { font-size: 12px; color: var(--text-secondary); }

/* Backdrop */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 150;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Scrollbar */
.items-container::-webkit-scrollbar,
.drawer-content::-webkit-scrollbar { width: 5px; }

.items-container::-webkit-scrollbar-thumb,
.drawer-content::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}

/* --- Responsive Layout Logic --- */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    width: 280px;
    background: rgba(15, 15, 15, 0.95) !important;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
    visibility: hidden;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    visibility: visible;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .mobile-close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .menu-btn {
    display: block;
  }

  .main-content.with-drawer {
    margin-right: 0;
    opacity: 0.2;
    pointer-events: none;
  }
  
  .items-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  /* 确保移动端技能图标可见 */
  .skill-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
  }
  
  .skill-icon-img {
    width: 24px;
    height: 24px;
    display: block;
  }
  
  .skill-nav {
    padding-right: 5px;
    margin-right: -5px;
  }
  
  /* 优化移动端技能按钮文字显示 */
  .skill-btn span {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
}

@media (max-width: 768px) {
  .formula-page {
    padding: 10px;
    height: calc(100vh - 80px);
  }

  .items-container {
    grid-template-columns: 1fr;
  }

  /* Card Optimization for Mobile */
  .item-list-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  .item-visual {
    width: 60px;
    height: 60px;
    margin-right: 0;
    margin-bottom: 8px;
    align-self: center;
  }

  .item-core {
    width: 100%;
  }

  .item-main-info {
    justify-content: center;
    margin-bottom: 12px;
  }

  .item-name {
    white-space: normal; /* Allow name to wrap if too long */
    text-align: center;
    font-size: 1.1rem;
  }

  .item-mats-preview {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    overflow: visible;
  }

  /* Welcome Area Optimization for Mobile */
  .empty-state-container {
    padding: 20px;
  }

  .empty-state-content {
    max-width: 90%;
    padding: 40px 20px;
    border-radius: 16px;
  }

  .welcome-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .welcome-text {
    font-size: 14px;
    line-height: 1.5;
    margin: 12px 0 24px;
    padding: 0 10px;
  }

  .welcome-hint {
    padding: 12px 24px;
    font-size: 14px;
    white-space: nowrap;
  }

  .shop-price-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 12px;
}

.currency-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.price-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--gold);
}

.npc-avatars-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.npc-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  text-align: center;
}

.npc-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--gold-mute);
  background: rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  cursor: help;
}

.npc-avatar:hover {
  transform: scale(1.1);
  border-color: var(--gold);
}

.npc-name-small {
  font-size: 11px;
  color: var(--text-primary);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.npc-location-small {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.7;
}

.named-source {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

/* 料理工具展示样式 */
.tools-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
  border: 1px solid var(--gold-mute);
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 8px;
}

.tool-icon {
  width: 20px;
  height: 20px;
}

.tool-name {
  font-size: 12px;
  color: var(--gold);
  font-weight: 600;
}

/* 样本/底块标签 */
.sample-tag {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 800;
  margin-right: 8px;
  box-shadow: 0 2px 4px rgba(192, 57, 43, 0.3);
  letter-spacing: 0.5px;
}

.mat-qty {
  font-size: 12px;
  color: var(--gold-mute);
  font-weight: 500;
}

  .mat-micro {
    padding: 4px 8px;
  }

  .arrow-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    opacity: 0.5;
  }

  .detail-drawer {
    position: fixed;
    top: auto;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 85vh;
    border-radius: 24px 24px 0 0;
    backdrop-filter: blur(25px) saturate(200%);
    z-index: 300;
  }
}

.glass-panel {
  backdrop-filter: blur(12px) saturate(180%);
  background: rgba(20, 20, 20, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* ── NPC商店 分组样式 ── */
.shop-price-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  margin-bottom: 10px;
}

.currency-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.price-text {
  color: var(--gold);
  font-size: 15px;
  font-weight: 700;
}

.npc-avatars-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.npc-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 60px;
}

.npc-avatar-item .npc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--gold-mute);
}

.npc-name-small {
  font-size: 10px;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
  max-width: 60px;
}

.npc-location-small {
  font-size: 9px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
  max-width: 60px;
}

.named-source {
  padding: 6px 2px;
  font-size: 13px;
  color: var(--text-secondary);
  border-top: 1px dashed rgba(255,255,255,0.06);
  margin-top: 6px;
}

/* ── 任务 / 兼职奖励 ── */
.quest-locations {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quest-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 6px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
}

/* ── 装备属性区块 ── */
.eq-section {
  margin-top: 4px;
}

.eq-title {
  font-size: 15px;
  color: #e8c46a;
}

.eq-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.eq-col {
  flex: 1;
  min-width: 160px;
  padding: 12px 14px;
  border-radius: 10px;
}

.eq-col-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--gold-mute);
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(212,175,55,0.15);
  padding-bottom: 4px;
}

.eq-stat-row {
  font-size: 13px;
  color: var(--text-primary);
  padding: 2px 0;
  line-height: 1.5;
}

.eq-extra {
  color: #5acacd;
}

.set-effects-panel {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(147, 89, 220, 0.3) !important;
  background: rgba(80, 30, 120, 0.15) !important;
}

.set-effects-title {
  font-size: 13px;
  font-weight: 600;
  color: #c084fc;
  margin-bottom: 8px;
}

.set-effect-row {
  font-size: 13px;
  color: #ddb6ff;
  padding: 2px 0;
  line-height: 1.6;
}
</style>
