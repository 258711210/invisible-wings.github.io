<script setup lang="ts">
import { ref, computed } from 'vue'
import * as ErgEnhanceData from '../data/ErgEnhance'
import * as GlobalItemData from '../data/Item'
import { Zap, ChevronRight, Info, Target, Sword, Wand2, Calculator } from 'lucide-vue-next'

const getItemName = (id: string | number) => {
  const item = (GlobalItemData as any)[`Item${id}`]
  return item ? item[0] : `未知道具(${id})`
}

const getItemIcon = (id: string | number) => `/img/item/${id}.png`

const ERG_PLACEHOLDER_MAP: Record<string, { name: string, icon: string }> = {
  "Dualgun": { name: "双枪", icon: "/img/item/18029.png" },
  "DualgunR": { name: "双枪", icon: "/img/item/18029.png" },
  "Shuriken": { name: "手里剑", icon: "/img/item/18017.png" },
  "ShurikenR": { name: "手里剑", icon: "/img/item/18017.png" },
  "Chainblade": { name: "链刃", icon: "/img/item/18045.png" },
  "ChainbladeR": { name: "链刃", icon: "/img/item/18045.png" },
  "Handle": { name: "操纵杆", icon: "/img/item/18146.png" },
  "HandleR": { name: "操纵杆", icon: "/img/item/18146.png" },
  "Bow": { name: "弓", icon: "/img/item/40093.png" },
  "WandS": { name: "魔杖", icon: "/img/item/61001.png" },
  "StaffS": { name: "法杖", icon: "/img/item/61001.png" },
  "CylinderS": { name: "铳炮", icon: "/img/item/63020.png" },
  "OHSword": { name: "单手武器", icon: "/img/item/40045.png" },
  "OHAxeR": { name: "单手轴", icon: "/img/item/40045.png" },
  "OHBluntR": { name: "单手钝器", icon: "/img/item/40045.png" },
  "THAxeR": { name: "双手轴", icon: "/img/item/62021.png" },
  "KnuckleR": { name: "拳套", icon: "/img/item/60001.png" }
}

const weaponCategories = [
  { id: 'Dualgun', label: '双枪', icon: Sword },
  { id: 'Shuriken', label: '手里剑', icon: Zap },
  { id: 'Chainblade', label: '链刃', icon: Zap },
  { id: 'Handle', label: '操纵杆', icon: Target },
  { id: 'Bow', label: '弓', icon: Target },
  { id: 'Crossbow', label: '弩', icon: Target },
  { id: 'Knuckle', label: '拳套', icon: Zap },
  { id: 'Wand', label: '魔杖', icon: Wand2 },
  { id: 'Staff', label: '法杖', icon: Wand2 },
  { id: 'Cylinder', label: '铳炮', icon: Target },
  { id: 'OHSword', label: '单手剑', icon: Sword },
  { id: 'THSword', label: '双手剑', icon: Sword },
  { id: 'Axe', label: '斧头', icon: Sword },
  { id: 'Blunt', label: '钝器', icon: Sword },
  { id: 'Lance', label: '骑士枪', icon: Sword },
  { id: 'Atlatl', label: '投射器', icon: Target },
]

const selectedCategory = ref('Dualgun')
const categoryRefs = ref<(any)[]>([])

interface Material {
  id: number | null
  placeholderId: string | null
  name: string
  qty: number
  note: string
  isSacrificial: boolean
}

interface BreakthroughStep {
  id: string
  name: string
  startLevel: number
  targetLevel: number
  successRate: number
  materials: Material[]
}

const breakthroughs = computed<BreakthroughStep[]>(() => {
  const list = ErgEnhanceData.ErgEnhanceList || []
  const result: BreakthroughStep[] = []
  
  list.forEach((key: string) => {
    // 改进的分类过滤逻辑
    let match = false
    if (selectedCategory.value === 'Axe') {
      match = key.includes('Axe')
    } else if (selectedCategory.value === 'Blunt') {
      match = key.includes('Blunt')
    } else {
      match = key.startsWith(selectedCategory.value)
    }

    if (match) {
      const raw = (ErgEnhanceData as any)[key]
      if (raw) {
        const name = raw[0]
        const successRate = raw[1]
        const materials = raw[2].map((m: any) => {
          const id = m[0]
          const qty = m[1]
          const note = m[2] || ''
          const isPlaceholder = typeof id === 'string'
          return {
            id: isPlaceholder ? null : id,
            placeholderId: isPlaceholder ? id : null,
            name: isPlaceholder ? (ERG_PLACEHOLDER_MAP[id]?.name || id) : getItemName(id),
            qty,
            note,
            isSacrificial: isPlaceholder
          }
        })

        const targetLevel = parseInt(name.match(/\d+/)?.[0] || '0')
        result.push({
          id: key,
          name,
          startLevel: targetLevel - 5,
          targetLevel,
          successRate,
          materials
        })
      }
    }
  })
  
  return result.sort((a, b) => a.targetLevel - b.targetLevel)
})

const scrollToCategory = (index: number) => {
  const element = categoryRefs.value[index]
  if (element) {
    const container = element.parentElement
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollLeft = container.scrollLeft
      const containerCenter = containerRect.width / 2
      const elementCenter = elementRect.left - containerRect.left + elementRect.width / 2
      const scrollTo = scrollLeft + (elementCenter - containerCenter)
      
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<template>
  <div class="erg-page">
    <!-- Category Sidebar -->
    <aside class="weapon-nav glass-panel">
      <div class="nav-header">
        <h3 class="gold-text">武器分类</h3>
      </div>
      <div class="nav-scroll">
        <button 
          v-for="(cat, index) in weaponCategories" 
          :key="cat.id"
          :class="['nav-item', { active: selectedCategory === cat.id }]"
          @click="selectedCategory = cat.id; scrollToCategory(index)"
          :ref="el => categoryRefs[index] = el"
        >
          <component :is="cat.icon" :size="18" />
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="header glass-panel">
        <div class="title-wrap">
          <Zap class="gold-text" :size="24" />
          <h2 class="gold-text">{{ weaponCategories.find(c => c.id === selectedCategory)?.label }} 尔格突破</h2>
        </div>
        <div class="badge">共 {{ breakthroughs.length }} 个阶段</div>
      </div>

      <div class="breakthrough-grid">
        <div 
          v-for="step in breakthroughs" 
          :key="step.id" 
          class="breakthrough-card glass-panel"
        >
          <div class="card-header">
            <div class="level-path">
              <span class="level-box target">Lv.{{ step.targetLevel }} 突破</span>
            </div>
            <div class="rate-badge gold-border">
              <span class="rate-label">成功率</span>
              <span class="rate-value gold-text">{{ step.successRate }}%</span>
            </div>
          </div>

          <div class="benefit-tag">
            <Info :size="14" />
            <span>获得效果: 开放尔格等级上限至 {{ step.targetLevel }} 级</span>
          </div>

          <div class="materials-section">
             <div class="section-label">消耗材料</div>
             <div class="materials-list">
               <div 
                 v-for="(m, idx) in step.materials" 
                 :key="idx"
                 :class="['mat-item', { 'sacrificial': m.isSacrificial }]"
               >
                 <div class="mat-visual">
                    <img v-if="m.id" :src="getItemIcon(m.id)" class="mat-img" />
                    <img v-else-if="m.placeholderId" :src="ERG_PLACEHOLDER_MAP[m.placeholderId]?.icon || '/img/item/0.png'" class="mat-img" />
                 </div>
                 <div class="mat-info">
                   <div class="mat-name">{{ m.name }}</div>
                   <div class="mat-meta">
                     <span class="mat-qty gold-text">x{{ m.qty }}</span>
                     <span class="mat-note" v-if="m.note">{{ m.note }}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.erg-page {
  display: flex;
  gap: 20px;
  height: 100%;
  padding-bottom: 20px;
}

.weapon-nav {
  width: 220px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-header {
  padding: 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.nav-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.nav-item.active {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold);
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.breakthrough-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding-right: 8px;
  align-content: start;
  overflow-y: auto;
}

.breakthrough-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(212, 175, 55, 0.1);
  transition: border-color 0.3s;
}

.breakthrough-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-path {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-box {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.level-box.target {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold);
  font-size: 16px;
}

.arrow {
  color: var(--gold-mute);
  opacity: 0.5;
}

.rate-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px;
  border-width: 1px;
  border-radius: 8px;
  min-width: 80px;
}

.rate-label {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.6;
}

.rate-value {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.benefit-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 6px;
  color: #81c784;
  font-size: 13px;
}

.materials-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 12px;
  color: var(--gold-mute);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.materials-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mat-item.sacrificial {
  background: rgba(212, 175, 55, 0.05);
  border-color: rgba(212, 175, 55, 0.15);
  grid-column: span 2;
}

.mat-visual {
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mat-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.mat-info {
  flex: 1;
  min-width: 0;
}

.mat-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mat-qty {
  font-size: 12px;
  font-weight: 600;
}

.mat-note {
  font-size: 11px;
  color: #ffb74d;
}

@media (max-width: 1024px) {
  .erg-page {
    flex-direction: column;
    padding: 10px;
    gap: 15px;
  }
  .weapon-nav {
    width: 100%;
    height: auto;
  }
  .nav-scroll {
    display: flex;
    overflow-x: auto;
    padding: 10px;
    gap: 8px;
  }
  .nav-item {
    width: auto;
    flex-shrink: 0;
    margin-bottom: 0;
    padding: 10px 14px;
    font-size: 14px;
  }
  .nav-item span {
    white-space: nowrap;
  }
  .main-content {
    gap: 15px;
  }
  .header {
    padding: 12px 16px;
  }
  .title-wrap {
    gap: 8px;
  }
  .title-wrap h2 {
    font-size: 18px;
  }
  .breakthrough-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    padding-right: 0;
  }
  .breakthrough-card {
    padding: 16px;
    gap: 12px;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .level-path {
    width: 100%;
    justify-content: space-between;
  }
  .level-box {
    font-size: 13px;
    padding: 4px 10px;
  }
  .level-box.target {
    font-size: 14px;
  }
  .rate-badge {
    align-self: flex-end;
    min-width: 70px;
    padding: 3px 10px;
  }
  .rate-value {
    font-size: 16px;
  }
  .benefit-tag {
    font-size: 12px;
    padding: 6px 10px;
  }
  .materials-section {
    gap: 8px;
  }
  .materials-list {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .mat-item {
    padding: 8px;
    gap: 8px;
  }
  .mat-item.sacrificial {
    grid-column: span 1;
  }
  .mat-visual {
    width: 32px;
    height: 32px;
  }
  .mat-img {
    width: 24px;
    height: 24px;
  }
  .mat-name {
    font-size: 12px;
  }
  .mat-meta {
    gap: 6px;
  }
  .mat-qty {
    font-size: 11px;
  }
  .mat-note {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .erg-page {
    padding: 8px;
  }
  .header {
    padding: 10px 14px;
  }
  .title-wrap h2 {
    font-size: 16px;
  }
  .breakthrough-card {
    padding: 14px;
  }
  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }
  .benefit-tag {
    font-size: 11px;
  }
}
</style>
