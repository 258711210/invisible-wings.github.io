<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as RaceData from '../data/Race'
import { HauntLists } from '../data/Haunt'
import { KillItemList } from '../data/KillItem'
import * as GlobalItemData from '../data/Item'
import * as TrainingData from '../data/Training'
import * as CollectData from '../data/Collect'
import { Search, Info, MapPin, Sword, Box, ArrowRight, ExternalLink, Shield, Target, Trophy, Footprints, X } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')
const selectedItem = ref<any>(null)

// 选择怪物
const selectItem = (item: any) => {
  selectedItem.value = item
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭详情
const closeDetail = () => {
  selectedItem.value = null
  // 恢复背景滚动
  document.body.style.overflow = ''
}

const getItemName = (id: string | number) => {
  const item = (GlobalItemData as any)[`Item${id}`]
  return item ? item[0] : `道具(${id})`
}

// 属性名称映射
const EffectNames = ['最大生命值', '最大魔法值', '最大体力值', '力量', '智力', '敏捷', '意志', '幸运', '防御', '保护']
const SkillLevelNames = ['练习级', 'F级', 'E级', 'D级', 'C级', 'B级', 'A级', '9级', '8级', '7级', '6级', '5级', '4级', '3级', '2级', '1级', '1段', '2段', '3段']
const CollectEffectList = [
  ['生命值 +1', '力量 +1', '魔法防御 +1', '防御 +1'],
  ['生命值 +25%', '力量 +20%', '', '']
]

// 解析驯兽奖励效果
const parseTrainingEffects = (effectArray: number[]) => {
  if (!effectArray || effectArray.length === 0) return []
  const effects = []
  for (let i = 0; i < effectArray.length; i += 2) {
    const effectIndex = effectArray[i]
    const effectValue = effectArray[i + 1]
    if (effectIndex !== undefined && effectValue !== undefined) {
      effects.push({
        name: EffectNames[effectIndex] || `属性${effectIndex}`,
        value: effectValue
      })
    }
  }
  return effects
}

// 获取驯兽信息 - 使用中文名匹配
const getTrainingInfo = (chnName: string) => {
  if (!chnName) return null
  
  const trainingKeys = Object.keys(TrainingData).filter(key => key.startsWith('Training') && key !== 'TrainingList' && key !== 'UnableTameLists')
  for (const key of trainingKeys) {
    const data = (TrainingData as any)[key]
    if (Array.isArray(data) && data[0] === chnName) {
      return {
        name: data[0],
        level: data[1] || '-',
        combat: data[2] || '-',
        effects: parseTrainingEffects(data[3] || []),  // Training[3] 是效果数组
        rank: data[4] || '-'
      }
    }
  }
  return null
}

// 获取菲尼/狩猎信息 - 使用中文名匹配
const getCollectInfo = (chnName: string) => {
  if (!chnName) return null
  
  const collectKeys = Object.keys(CollectData).filter(key => key.startsWith('Collect') && key !== 'CollectList')
  for (const key of collectKeys) {
    const data = (CollectData as any)[key]
    if (Array.isArray(data) && data[0] === chnName) {
      return {
        name: data[0],
        times: data[1] || '-',  // 收集次数
        probability: data[2] || '-',  // 成功率
        skillLevel: data[3] !== undefined ? SkillLevelNames[data[3]] || data[3] : '-',  // 技能等级
        effectIndex: data[4] || '-',  // 效果索引
        collectEffect: data[4] !== undefined ? CollectEffectList[0][data[4]] || '' : '',  // 收集奖励
        transformEffect: data[4] !== undefined ? CollectEffectList[1][data[4]] || '' : ''  // 变身奖励
      }
    }
  }
  return null
}

const raceItems = computed(() => {
  const items = Object.keys(RaceData)
    .filter(key => key.startsWith('Race'))
    .map(key => {
      const data = (RaceData as any)[key]
      const id = key.replace('Race', '')
      const name = data[0]
      const engName = data[1] || ''
      
      // 关联掉落物 - KillItemList 格式: [[怪物名, [道具ID列表]], ...]
      const killData = KillItemList.find(k => k[0] === name)
      const drops = (killData && killData[1] && Array.isArray(killData[1])) ? killData[1] : []
      
      // 关联栖息地
      const habitats: any[] = []
      HauntLists.forEach((regionSet: any) => {
        const regionName = regionSet[0]
        for(let i=1; i<regionSet.length; i++) {
          if (String(regionSet[i][0]) === id) {
            habitats.push({ region: regionName, count: regionSet[i][1] })
          }
        }
      })

      // 关联驯兽信息 - 使用中文名
      const training = getTrainingInfo(name)
      
      // 关联菲尼信息 - 使用中文名
      const collect = getCollectInfo(name)

      return {
        id,
        name,
        engName,
        category: data[2],
        drops: drops.map((dId: number) => ({ id: dId, name: getItemName(dId) })),
        habitats,
        training,
        collect
      }
    })
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      item.engName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.id.includes(searchQuery.value)
    )
  
  return items
})

const getMonsterIcon = (id: string, engName: string) => {
  // 使用 Collect 目录的图片，用英文名
  if (engName) {
    return `/img/Collect/${engName}.png`
  }
  // 备用：尝试 Training 目录
  return `/img/Training/${engName}.png`
}
const getItemIcon = (id: string | number) => `/img/item/${id}.png`

const jumpToFormula = (id: number) => {
  router.push({ path: '/formula', query: { search: getItemName(id) } })
}

// 驯兽材料名称
const getMaterialName = (index: number | string) => {
  const materialNames = ['普通冶炼', '高级冶炼', '一般纺织', '高级纺织', '木材', '炼金术', '魔法', '制药', '料理', '其他']
  return materialNames[Number(index)] || `材料${index}`
}

// 处理图片错误
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
    // 如果 Collect 目录加载失败，尝试 Training 目录
    if (target.src.includes('/Collect/')) {
      target.src = target.src.replace('/Collect/', '/Training/')
    } else {
      target.style.opacity = '0'
    }
  }
}

// 处理详情图片错误
const handleDetailImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
    // 如果 Collect 目录加载失败，尝试 Training 目录
    if (target.src.includes('/Collect/')) {
      target.src = target.src.replace('/Collect/', '/Training/')
    } else {
      target.style.opacity = '0.2'
    }
  }
}
</script>

<template>
  <div class="race-view">
    <div class="header-section">
      <h2 class="gold-text">怪物与种族百科</h2>
      <div class="search-bar glass-panel">
        <Search :size="20" />
        <input v-model="searchQuery" placeholder="搜索怪物名称、英文名或 ID..." />
      </div>
    </div>

    <div class="content-layout">
      <!-- List -->
      <div class="list-container">
        <div class="stats-bar">找到 {{ raceItems.length }} 个匹配项</div>
        <div class="race-grid">
          <div 
            v-for="item in raceItems" 
            :key="item.id" 
            class="race-card glass-panel"
            :class="{ active: selectedItem?.id === item.id }"
            @click="selectItem(item)"
          >
            <div class="card-image-box gold-border-subtle">
               <img :src="getMonsterIcon(item.id, item.engName)" @error="handleImageError" class="m-img" />
               <div class="card-id">#{{ item.id }}</div>
               <div v-if="item.training" class="card-combat gold-text">{{ item.training.combat }}</div>
            </div>
            <div class="card-main">
              <h4 class="gold-text">{{ item.name || '未知' }}</h4>
              <p class="eng">{{ item.engName }}</p>
              <div class="card-tags">
                 <span v-if="item.training" class="tag training-tag">驯兽 {{ item.training.rank }}</span>
                 <span v-if="item.collect" class="tag collect-tag">菲尼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details -->
      <Transition name="mobile-overlay">
        <div v-if="selectedItem" class="mobile-overlay" @click.self="closeDetail">
          <div class="detail-panel glass-panel" :key="selectedItem.id">
            <!-- 关闭按钮 (移动端) -->
            <button class="close-btn" @click="closeDetail">
              <X :size="24" />
            </button>
          <div class="detail-hero">
             <div class="monster-large-icon gold-border">
                <img :src="getMonsterIcon(selectedItem.id, selectedItem.engName)" @error="handleDetailImageError" class="detail-monster-img" />
             </div>
             <div class="hero-info">
                <span class="category-tag">{{ selectedItem.category || '一般怪物' }}</span>
                <h3 class="gold-text">{{ selectedItem.name }}</h3>
                <p class="eng">{{ selectedItem.engName }}</p>
                <div class="m-id">ID: {{ selectedItem.id }}</div>
             </div>
          </div>
          
          <div class="detail-scroll-area">
            <!-- Habitats -->
            <section class="detail-section">
              <h4 class="section-title"><MapPin :size="16" /> 出处/栖息地</h4>
              <div v-if="selectedItem.habitats.length > 0" class="habitat-list">
                 <div v-for="(h, idx) in selectedItem.habitats" :key="idx" class="habitat-item glass-panel">
                    <span class="region">{{ h.region }}</span>
                 </div>
              </div>
              <p v-else class="empty-hint">暂无分布数据</p>
            </section>

            <!-- Collect Info (菲尼/狩猎) -->
            <section class="detail-section">
              <h4 class="section-title"><Target :size="16" /> 菲尼/狩猎信息</h4>
              <div v-if="selectedItem.collect" class="collect-info">
                 <div class="fynny-level-box">
                    <img :src="`/img/Fynny/${selectedItem.training?.rank || 'E'}.png`" @error="handleImageError" class="fynny-level-icon" />
                    <span class="fynny-level-text">{{ selectedItem.training?.rank || 'E' }} 等级</span>
                 </div>
                 <div class="info-row">
                    <span class="info-label">收集次数:</span>
                    <span class="info-value">{{ selectedItem.collect.times === 100 ? '自动收集' : selectedItem.collect.times + '次' }}</span>
                 </div>
                 <div class="info-row">
                    <span class="info-label">收集成功率:</span>
                    <span class="info-value">{{ selectedItem.collect.probability }}%</span>
                 </div>
                 <div class="info-row">
                    <span class="info-label">技能等级:</span>
                    <span class="info-value">{{ selectedItem.collect.skillLevel }}</span>
                 </div>
                 <div class="effect-box">
                    <div class="effect-title">收集奖励:</div>
                    <div class="effect-item">{{ selectedItem.collect.collectEffect || '暂无' }}</div>
                 </div>
                 <div class="effect-box">
                    <div class="effect-title">变身奖励:</div>
                    <div class="effect-item">{{ selectedItem.collect.transformEffect || '暂无' }}</div>
                 </div>
              </div>
              <p v-else class="empty-hint">暂无菲尼数据</p>
            </section>

            <!-- Training Info (驯兽) -->
            <section class="detail-section">
              <h4 class="section-title"><Footprints :size="16" /> 驯兽信息</h4>
              <div v-if="selectedItem.training" class="training-info">
                 <div class="info-row">
                    <span class="info-label">驯兽等级:</span>
                    <span class="info-value gold-text">{{ selectedItem.training.rank }}级</span>
                 </div>
                 <div class="info-row">
                    <span class="info-label">需求等级:</span>
                    <span class="info-value">{{ selectedItem.training.level }}</span>
                 </div>
                 <div class="info-row">
                    <span class="info-label">5星要求:</span>
                    <span class="info-value combat-value">原始战斗力 {{ selectedItem.training.combat }}</span>
                 </div>
                 <div v-if="selectedItem.training.effects.length > 0" class="effects-section">
                    <div class="info-label">驯兽奖励:</div>
                    <div class="effect-list">
                       <div v-for="(effect, idx) in selectedItem.training.effects" :key="idx" class="effect-item-row">
                          <span class="effect-name">{{ effect.name }}</span>
                          <span class="effect-value gold-text">+{{ effect.value }}</span>
                       </div>
                    </div>
                 </div>
              </div>
              <p v-else class="empty-hint">暂无驯兽数据</p>
            </section>

            <!-- Drops -->
            <section class="detail-section">
              <h4 class="section-title"><Sword :size="16" /> 可能掉落</h4>
              <div v-if="selectedItem.drops.length > 0" class="drop-grid">
                 <div 
                   v-for="drop in selectedItem.drops" 
                   :key="drop.id" 
                   class="drop-card glass-panel blur-card"
                   @click="jumpToFormula(drop.id)"
                 >
                    <img :src="getItemIcon(drop.id)" class="drop-icon" @error="handleImageError" />
                    <span class="drop-name">{{ drop.name }}</span>
                    <ExternalLink :size="12" class="jump-icon" />
                 </div>
              </div>
              <p v-else class="empty-hint">暂无掉落数据</p>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</div>
</template>

<style scoped>
.race-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  max-width: 500px;
}

.search-bar input {
  background: none;
  border: none;
  color: white;
  width: 100%;
  font-size: 1rem;
  outline: none;
}

.content-layout {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  /* 防止内容溢出 */
  overflow: hidden;
  height: calc(100vh - 200px);
}

.list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;  /* 防止 flex 子元素溢出 */
  /* PC端固定列表高度，不随详情滚动 */
  height: 100%;
  /* 确保独立滚动 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* 当有详情面板时，调整网格布局 */
.content-layout:has(.detail-panel) .race-grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.stats-bar {
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 0 0.5rem;
}

.race-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
}

.race-card {
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.race-card:hover {
  transform: translateY(-2px);
  border-color: var(--gold-glow);
  background: rgba(255, 255, 255, 0.08);
}

.race-card.active {
  background: var(--gold-glow);
  border-color: var(--gold);
}

.card-image-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 8px;
}

.gold-border-subtle {
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.m-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;
  display: block;
}

.race-card:hover .m-img {
  transform: scale(1.1);
}

.card-id {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.card-combat {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.75rem;
  font-weight: bold;
}

.card-tags {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.training-tag {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.collect-tag {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.card-main h4 {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.eng {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Detail Panel - PC */
.detail-panel {
  width: 480px;
  min-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInRight 0.3s ease;
  background: rgba(15, 23, 42, 0.95);
  border-left: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
  /* 固定高度，独立滚动 */
  height: 100%;
}

.detail-hero {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(15, 23, 42, 0.5));
  display: flex;
  gap: 1.2rem;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.monster-large-icon {
  width: 140px;
  height: 140px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  flex-shrink: 0;
}

.detail-monster-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.hero-info {
  flex: 1;
}

.category-tag {
  font-size: 0.7rem;
  background: var(--gold);
  color: black;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.hero-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

.m-id {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.3rem;
}

.detail-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  /* 确保独立滚动 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold);
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  padding-bottom: 0.5rem;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
}

.detail-section {
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.habitat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habitat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.habitat-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.region {
  font-size: 0.9rem;
  color: white;
  font-weight: 500;
}

.drop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.drop-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.drop-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.drop-icon {
  width: 24px;
  height: 24px;
}

.drop-name {
  font-size: 0.85rem;
}

.jump-icon {
  margin-left: auto;
  opacity: 0.3;
}

.empty-hint {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  padding-left: 0.5rem;
}

/* Collect & Training Info Styles */
.collect-info,
.training-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-value {
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
}

.combat-value {
  color: var(--gold);
  font-weight: bold;
}

.materials-section {
  margin-top: 0.5rem;
}

.materials-section .info-label {
  margin-bottom: 0.6rem;
  display: block;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
}

.material-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.material-count {
  font-size: 0.85rem;
  color: var(--gold);
  font-weight: 600;
}

/* Training Effects */
.effects-section {
  margin-top: 0.8rem;
}

.effects-section .info-label {
  margin-bottom: 0.6rem;
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.effect-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.effect-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 6px;
}

.effect-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.effect-value {
  font-size: 1rem;
  font-weight: bold;
}

/* Fynny Level Box */
.fynny-level-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.fynny-level-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.fynny-level-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--gold);
}

/* Effect Box */
.effect-box {
  margin-top: 0.8rem;
  padding: 0.8rem 1rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 6px;
}

.effect-title {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.effect-item {
  font-size: 0.95rem;
  color: #34d399;
  font-weight: 500;
  padding: 0.3rem 0;
}

.mute-icon {
  opacity: 0.2;
  margin-bottom: 1rem;
}

/* Animations */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Mobile Overlay Animation */
.mobile-overlay-enter-active,
.mobile-overlay-leave-active {
  transition: all 0.3s ease;
}

.mobile-overlay-enter-from,
.mobile-overlay-leave-to {
  opacity: 0;
}

.mobile-overlay-enter-active .detail-panel,
.mobile-overlay-leave-active .detail-panel {
  transition: transform 0.3s ease;
}

.mobile-overlay-enter-from .detail-panel {
  transform: translateY(100%);
}

.mobile-overlay-leave-to .detail-panel {
  transform: translateY(100%);
}

/* PC端宽度自适应优化 */
@media (min-width: 1600px) {
  .detail-panel {
    width: 520px;
    min-width: 520px;
  }
  
  .content-layout:has(.detail-panel) .race-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (min-width: 1920px) {
  .race-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .content-layout:has(.detail-panel) .race-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Tablet Responsive */
@media (max-width: 1200px) {
  .detail-panel {
    width: 400px;
    min-width: 400px;
  }
  
  .content-layout:has(.detail-panel) .race-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 1024px) {
  /* Mobile Overlay */
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: flex;
    align-items: flex-end;
    backdrop-filter: blur(4px);
    /* 防止触摸穿透 */
    touch-action: none;
    overflow: hidden;
  }

  .detail-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 75vh;
    max-height: 75vh;
    z-index: 1000;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    background: var(--bg-dark);
    margin: 0;
    overflow: hidden;
    /* 防止滚动穿透 */
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  /* Close Button */
  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(212, 175, 55, 0.3);
    transform: scale(1.1);
  }

  .close-btn:active {
    transform: scale(0.95);
  }
  
  .content-layout {
    flex-direction: column;
  }

  .race-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .detail-scroll-area {
    padding: 0 1.5rem 1.5rem;
    padding-top: 3.5rem;
    /* 允许滚动 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
