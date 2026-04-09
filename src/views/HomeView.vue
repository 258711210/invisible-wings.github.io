<script setup lang="ts">
import { computed } from 'vue'
import { useTimeStore } from '../stores/timeStore'
import { 
  ArrowRight, Star, Shield, Zap, Sparkles, ShoppingBag, 
  Sword, Compass, Calendar, Clock, Timer, Info, Sun, Moon 
} from 'lucide-vue-next'

const timeStore = useTimeStore()

const dailyEvents = [
  { id: 0, name: '立春 (Imbolc)', day: '星期日', effect: '暴击率提高、Lucky Finish概率提高、演奏/魔法音乐成功率提高', icon: Sparkles, color: '#FFD700', details: '这是“战斗与艺术日”。对于战斗角色来说，高暴击率让这一天成为挑战强敌的理想时间。对于喜欢音乐的玩家，这是练习演奏技能、使用魔法音乐的最佳时机，成功率大幅提升。' },
  { id: 1, name: '春分 (Alban Eiler)', day: '星期一', effect: '生产技能成功率提高、生活系技能升级奖励增加、生产物品质量提高', icon: Compass, color: '#90EE90', details: '这是“生产与生活日”。对于生产者来说，这一天是提高技能成功率、获取更多资源的理想时间。对于喜欢生活的玩家，这是升级技能、提高生活质量的最佳时机。' },
  { id: 2, name: '入夏 (Beltane)', day: '星期二', effect: '地下城物品掉落概率提高、战斗系技能升级奖励增加', icon: Sword, color: '#FFB6C1', details: '这是“战斗与冒险日”。地下城掉落率提高，战斗技能升级奖励增加，是挑战强敌的最佳时机。' },
  { id: 3, name: '夏至 (Alban Heruin)', day: '星期三', effect: '采集率提高、商店物品价格减少5%、银行手续费减少25%、技能完全修炼时获得的经验值增加', icon: Sparkles, color: '#87CEFA', details: '这是“采集与修炼日”。适合进行野外采集（如采矿、采药），或者去商店大量采购物资。同时，这也是一个非常适合静下心来完全修炼技能的日子，可以获得更多经验。' },
  { id: 4, name: '秋收 (Lughnasadh)', day: '星期四', effect: '魔法释放成功率提高、魔法系技能升级奖励增加、使用装备时获得的熟练度增加', icon: ShoppingBag, color: '#FFA07A', details: '这是“魔法日”。非常适合法师类角色，用来练习魔法技能或进行魔法释放（附魔），成功率更高。同时，通过战斗来提升装备熟练度也是不错的选择' },
  { id: 5, name: '秋收节 (Alban Elfed)', day: '星期五', effect: '死亡后惩罚减少、所有药水效果提高、完成任务时的报酬增加。', icon: Calendar, color: '#DDA0DD', details: '这是“任务与挑战日”。适合挑战高难度的BOSS或任务，因为死亡惩罚降低，容错率更高。药水的增强效果也让战斗更持久。同时，这也是清理各种任务的好时机，可以获得更多报酬' },
  { id: 6, name: '元旦 (Samhain)', day: '星期六', effect: '年龄增长并获得相应AP、食用料理效果提高、探测仪感知范围增加、素描更容易完成', icon: Clock, color: '#F0E68C', details: '这是“生活与成长日”。游戏角色会在这一天增加年龄并获得宝贵的AP（天赋点数）。适合进行烹饪、钓鱼、素描等休闲生活活动，料理的效果会更好。' },
]

const currentEvent = computed(() => dailyEvents[timeStore.realityDay])

const timeUntilNextDay = computed(() => {
  const now = timeStore.realityDate
  const nextDay = new Date(now)
  nextDay.setHours(24, 0, 0, 0)
  const diff = nextDay.getTime() - now.getTime()
  
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  
  return { h, m, s }
})

const features = [
  { 
    title: '配方百科', 
    desc: '详尽的爱琳道具合成与生产配方。', 
    icon: Zap, 
    link: '/formula',
    color: '#FFD700'
  },
  { 
    title: '怪物筛查', 
    desc: '全方位的怪物属性与掉落查询。', 
    icon: Shield, 
    link: '/race',
    color: '#4169E1'
  },
  { 
    title: '尔格强化', 
    desc: '高级武器突破与祭品需求查询。', 
    icon: Zap, 
    link: '/erg',
    color: '#FF4500'
  }
]
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-header">
        <h2 class="hero-title gold-text">欢迎来到 隐翅阁</h2>
        <div class="hero-subtitle-rebuild">亚特-錦锈鹹魚 重制版</div>
      </div>
      <p class="hero-desc">Mabinogi 爱琳大陆的知识守护者</p>
      
      <div class="hero-content">
        <div class="hero-time glass-panel">
          <div class="time-main">
             <div class="time-header">
               <span class="label">当前爱琳时间</span>
               <Sun v-if="timeStore.erinnHours >= 6 && timeStore.erinnHours < 18" :size="16" class="sun-icon" />
               <Moon v-else :size="16" class="moon-icon" />
             </div>
            <span class="value gold-text">
              {{ timeStore.erinnHours.toString().padStart(2, '0') }}:{{ timeStore.erinnMinutes.toString().padStart(2, '0') }}
            </span>
          </div>
        </div>

        <!-- Today's Buff Widget -->
        <div class="today-buff-widget glass-panel highlight-border">
          <div class="buff-widget-info">
             <div class="buff-widget-tag">今日季节加成</div>
             <div class="buff-widget-title">
               <component :is="currentEvent.icon" :size="20" :style="{ color: currentEvent.color }" />
               <span class="gold-text">{{ currentEvent.name }}</span>
             </div>
             <p class="buff-widget-desc">{{ currentEvent.effect }}</p>
          </div>
          <div class="buff-widget-timer">
            <div class="timer-label"><Timer :size="12" /> 下次更替</div>
            <div class="timer-value">{{ timeUntilNextDay.h }}h {{ timeUntilNextDay.m }}m {{ timeUntilNextDay.s }}s</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Active Buff Section -->
    <section class="active-buff-section">
      <div class="section-title-wrap">
        <Sparkles :size="20" class="gold-text" />
        <h3 class="section-title">今日活跃加成</h3>
      </div>
      <div class="active-buff-hero glass-panel highlight-border">
        <div class="buff-info">
          <h1>{{ currentEvent.name }} <span>({{ currentEvent.day }})</span></h1>
          <p class="effect-desc">{{ currentEvent.effect }}</p>
          <div class="buff-details">
            <Info :size="14" />
            <span>{{ currentEvent.details }}</span>
          </div>
        </div>
        <div class="buff-visual">
          <component :is="currentEvent.icon" :size="80" :style="{ color: currentEvent.color }" class="large-glow-icon" />
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-title-wrap">
        <Compass :size="20" class="gold-text" />
        <h3 class="section-title">核心功能导航</h3>
      </div>
      <div class="features-grid">
        <RouterLink 
          v-for="f in features" 
          :key="f.link" 
          :to="f.link" 
          class="feature-card glass-panel"
        >
          <div class="icon-box" :style="{ color: f.color }">
            <component :is="f.icon" :size="32" />
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
          <div class="card-footer">
            <span>立即前往</span>
            <ArrowRight :size="16" />
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Weekly Schedule Grid -->
    <section class="weekly-schedule-section">
      <div class="section-title-wrap">
        <Calendar :size="20" class="gold-text" />
        <h3 class="section-title">爱琳季节循环规律</h3>
      </div>
      <div class="weekly-grid">
        <div 
          v-for="event in dailyEvents" 
          :key="event.id" 
          :class="['day-card', 'glass-panel', { active: event.id === timeStore.realityDay }]"
        >
          <div class="day-card-header" :style="{ color: event.color }">
            <component :is="event.icon" :size="18" />
            <span class="day-label">{{ event.day }}</span>
          </div>
          <div class="day-card-body">
            <h4>{{ event.name }}</h4>
            <p>{{ event.effect }}</p>
          </div>
          <div class="day-card-status" v-if="event.id === timeStore.realityDay">
            正处于此季节
          </div>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <p>&copy; 2026 隐翅阁 - 亚特-錦锈鹹魚 重制版</p>
      <p class="footer-desc">承载爱琳大陆的记忆与智慧，助力每一位米莱西安的成长。</p>
    </footer>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.hero {
  text-align: center;
  padding: 2rem 0;
}

.hero-header {
  margin-bottom: 0.5rem;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 0.2rem;
}

.hero-subtitle-rebuild {
  font-size: 0.9rem;
  color: var(--gold-mute);
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
}

.hero-desc {
  font-size: 1.2rem;
  color: var(--text-secondary);
  letter-spacing: 2px;
  margin-bottom: 3rem;
}

.hero-content {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.hero-time {
  padding: 1.5rem 3rem;
  min-width: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sun-icon { color: #facc15; }
.moon-icon { color: #818cf8; }

.time-main {
  display: flex;
  flex-direction: column;
}

.time-main .label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.time-main .value {
  font-size: 3rem;
  font-family: monospace;
  line-height: 1;
}

/* Today Buff Widget */
.today-buff-widget {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  text-align: left;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.buff-widget-tag {
  font-size: 0.7rem;
  color: var(--gold-mute);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.buff-widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.buff-widget-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.buff-widget-timer {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 2rem;
}

.timer-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.timer-value {
  font-family: monospace;
  font-weight: bold;
  color: var(--gold);
}

/* Section Common */
.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 0;
  color: var(--text-primary);
}

/* Buff Hero Section */
.active-buff-hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 2.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, transparent 50%);
}

.highlight-border {
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.buff-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.buff-info h1 span {
  font-size: 1.1rem;
  opacity: 0.6;
}

.effect-desc {
  font-size: 1.2rem;
  line-height: 1.4;
  max-width: 600px;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.buff-details {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--gold);
  font-size: 0.9rem;
  background: rgba(212, 175, 55, 0.05);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  width: fit-content;
}

.large-glow-icon {
  filter: drop-shadow(0 0 20px currentColor);
  opacity: 0.7;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--glass-border);
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--gold);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.icon-box {
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  font-size: 1.4rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold);
  font-weight: bold;
  font-size: 0.9rem;
}

/* Weekly Schedule Grid */
.weekly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.day-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.day-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(212, 175, 55, 0.2);
}

.day-card.active {
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid var(--gold) !important;
}

.day-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: bold;
}

.day-label {
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.day-card-body h4 {
  font-size: 1.1rem;
  color: var(--gold);
  margin-bottom: 0.3rem;
}

.day-card-body p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.day-card-status {
  margin-top: auto;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: var(--gold);
  text-align: right;
  opacity: 0.8;
}

.home-footer {
  text-align: center;
  padding: 4rem 0 2rem;
  border-top: 1px solid var(--glass-border);
}

.home-footer p {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.footer-desc {
  color: var(--text-secondary) !important;
  font-size: 0.9rem !important;
  opacity: 0.7;
}

@media (max-width: 1024px) {
  .hero-title { font-size: 2.5rem; }
  .active-buff-hero { padding: 2rem; flex-direction: column; gap: 1.5rem; }
  .buff-info h1 { font-size: 2rem; }
  .buff-visual { display: none; }
}

@media (max-width: 768px) {
  .home-view { padding: 1rem; gap: 2rem; }
  
  /* Hero Section */
  .hero-title { font-size: 2rem; line-height: 1.2; }
  .hero-subtitle-rebuild { font-size: 0.8rem; letter-spacing: 2px; }
  .hero-desc { font-size: 1rem; margin-bottom: 2rem; }
  .hero-content { flex-direction: column; align-items: stretch; }
  .hero-time { padding: 1rem 2rem; min-width: auto; }
  .time-main .value { font-size: 2.5rem; }
  
  /* Today Buff Widget */
  .today-buff-widget { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1rem; }
  .buff-widget-title { font-size: 1rem; }
  .buff-widget-desc { font-size: 0.8rem; line-height: 1.4; }
  .buff-widget-timer { border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-left: 0; padding-top: 1rem; width: 100%; }
  
  /* Active Buff Section */
  .active-buff-hero { padding: 1.5rem; }
  .buff-info h1 { font-size: 1.5rem; gap: 0.5rem; }
  .buff-info h1 span { font-size: 0.9rem; }
  .effect-desc { font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; }
  .buff-details { font-size: 0.8rem; padding: 0.5rem 0.8rem; }
  
  /* Features Section */
  .section-title { font-size: 1.3rem; }
  .features-grid { gap: 1.5rem; }
  .feature-card { padding: 1.5rem; }
  .feature-card h3 { font-size: 1.2rem; }
  .feature-card p { font-size: 0.85rem; }
  
  /* Weekly Schedule */
  .weekly-grid { grid-template-columns: 1fr; gap: 1rem; }
  .day-card { padding: 1.2rem; }
  .day-card-body h4 { font-size: 1rem; }
  .day-card-body p { font-size: 0.8rem; }
  
  /* Footer */
  .home-footer { padding: 2rem 0 1rem; }
  .home-footer p { font-size: 1rem; }
  .footer-desc { font-size: 0.8rem !important; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 1.8rem; }
  .hero-subtitle-rebuild { font-size: 0.7rem; letter-spacing: 1px; }
  .hero-desc { font-size: 0.9rem; }
  .time-main .value { font-size: 2rem; }
  .buff-info h1 { font-size: 1.3rem; }
  .effect-desc { font-size: 0.85rem; }
  .section-title { font-size: 1.2rem; }
  .feature-card h3 { font-size: 1.1rem; }
}
</style>
