/**
 * ItemEffects.ts
 * 装备属性 & 套装效果解析工具
 * 将 Item.ts 中的原始数组数据解码为可读的实际属性数值（支持武器、防甲、饰品等多类型）
 */

// 攻击速度标签
const ATTACK_SPEED_LABELS = ['非常快', '快', '普通', '慢', '非常慢']

// 额外属性名称列表（大分类内子索引）
const EXTRA_ATTR_NAMES: string[][] = [
  [
    '最大生命值增加', '最大魔法值增加', '最大体力值增加',
    '力量增加', '敏捷增加', '智力增加', '意志增加', '幸运增加',
    '防御增加', '保护增加', '魔法攻击力增加',
    '魔法防御力增加', '魔法保护增加', '穿刺等级增加',
    '魔法恢复%增加', '魔法消耗减少%',
  ],
  [
    '近距离攻击自动防御率', '远距离攻击自动防御率',
    '魔法攻击自动防御率', '使攻击目标陷入冰冻状态几率',
    '冰冻状态持续时间(秒)',
  ],
  ['爆破箭碎片伤害增加%', '爆破箭碎片范围增加m', '穿心箭伤害增加%'],
  ['电磁风暴冷却时间减少(秒)', '流星冷却时间减少(秒)'],
  ['链式铳炮冷却时间减少(秒)', '炼金术结晶保存功能'],
  ['连续技伤害增加%', '连续技:飞身踢溅射范围增加%', '猛袭伤害增加%'],
  ['音乐技能增益效果增加', '音乐技能增益效果持续时间增加'],
  ['人偶操纵术范围增加', '人偶死亡时以%概率复活'],
  ['', '', '', ''],
  ['', '', '', ''],
]

// 套装效果名称列表（ElemenEffect 的 index -> name 映射）
const SET_EFFECT_NAMES: string[] = [
  '毒免疫', '石化免疫', '减少魔法消耗', '减少体力消耗', '爆炸抵抗', '践踏抵抗',
  '增加魔法消耗', '增加体力消耗', '攻击速度增加', '半神化强化', '重击强化', '跳斩强化',
  '冲撞强化', '冰箭强化', '火箭强化', '治疗强化', '火焰喷射强化', '水炮强化',
  '吸取生命强化', '穿心箭强化', '助攻箭强化', '钓鱼强化', '冶炼强化', '打铁强化',
  '淘金术强化', '强化千金一掷', '获得变身情报几率增加', '风车技能强化', '吸收伤害',
  '任务经验值强化', '跳斩强化', '跑调防止效果', '贸易移动速度', '提升料理生产经验值',
  '移动速度增加', '影子任务经验值强化', '水瓶座效果', '双鱼座效果', '白羊座效果',
  '金牛座效果', '双子座效果', '巨蟹座效果', '狮子座效果', '处女座效果', '天秤座效果',
  '天蝎座效果', '射手座效果', '摩羯座效果', '增加暴击伤害', '无限连击强化', '耐久度减少完善',
  '料理修炼值', '料理修炼值', '料理品质', '料理BUFF持续时间', '审判之刃强化',
  '骑士枪冲刺强化', '', '', '', '移动速度增加', '攻击延迟时间减少',
  '最大伤害增加', '魔法攻击力增加', '魔法消耗减少', '体力消耗减少', '暴击伤害增加',
  '探险经验值增加', '增加链击的多尔卡获得量', '增加死亡锁定伤害',
  '水瓶座效果', '双鱼座效果', '白羊座效果', '金牛座效果', '双子座效果', '巨蟹座效果',
  '狮子座效果', '处女座效果', '天秤座效果', '天蝎座效果', '射手座效果', '摩羯座效果',
  '神圣经验值强化', '起死回生发动几率增加', '坚定意志持续时间增加',
  '超越:生命持续时间增加', '连击发动几率增加', '致命穿透持续时间增加', '疾速持续时间增加',
  '起死回生发动几率增加', '坚定意志持续时间增加', '超越:生命持续时间增加',
  '连击发动几率增加', '致命穿透持续时间增加', '疾速持续时间增加',
  '采集成功率增加', '野蛮冲撞强化', '无限挥击强化', '战斗炼金术强化',
  '炼成炼金术强化', '英雄炼金术强化', '人偶抵抗僵直概率', '人偶暴击伤害倍率',
  '人偶术技能冷却时间减少', '战斗经验值增加', '电磁风暴强化', '增加有效射程',
  '精灵强化', '冰雹强化', '电磁风暴蓄力加速', '流星强化', '梦幻合唱效果强化',
  '音乐增益效果持续时间增加', '活跃进行曲增益效果增加', '战争序曲增益效果增加',
  '忍耐之歌增益效果增加', '丰收之歌增益效果增加', '摇篮曲增益效果增加', '行进曲增益效果增加',
  '风车强化', '无限斩强化', '无限挥击强化', '骑士枪冲刺乘骑冲撞强化',
  '爆破箭强化', '冲锋射击强化', '箭魔法组合强化', '连续技:飞身踢强化',
  '第2幕:怒气上涌强化', '巨人冲击波强化', '冰雹强化', '飓风之链强化',
  '链刃突刺强化', '手里剑风暴强化', '狂乱强化', '无影箭强化', '樱时雨强化',
  '中级魔法强化', '增加贸易移动速度', '增加属性精通伤害', '魔法盾强化', '移动施法强化',
  '多尔卡精通强化', '连续技精通强化', '无限斩强化', '无限连击强化', '无限挥击强化',
  '暴击伤害增加', '耐久度减少完善', '巨人冲击波强化', '野蛮冲撞强化', '箭魔法组合强化',
  '魔法攻击力增加', '冰雹强化', '中级魔法强化', '爆破箭强化', '无影箭强化',
  '链式铳炮冷却时间减少', '所有属性炼金术伤害增加', '连续技伤害增加',
  '触发暴击时重置连续技冷却时间概率', '人偶术冷却时间减少', '人偶暴击伤害倍率',
  '人偶死亡时概率复活', '樱时雨强化', '手里剑风暴强化', '狂乱强化',
  '冲锋射击强化', '链刃突刺强化', '飓风之链强化', '双手武器无限斩强化',
  '最大伤害强化', '愤怒狂暴强化', '不屈斗志强化', '暴击增加', '炼金术伤害增加',
  '穿刺抵抗增加', '穿刺抵抗增加', '最大伤害增加', '最大伤害增加', '最大伤害增加',
  '非凡的连接强化', '永恒祈祷强化',
]

/** 解析额外属性 [[category, subIndex], value, [category, subIndex], value, ...] */
const decodeExtraAttrs = (effects: any[]): string[] => {
  const results: string[] = []
  for (let i = 0; i < effects.length; i++) {
    const pair = effects[i]
    if (Array.isArray(pair)) {
      const [cat, sub] = pair
      const val = effects[++i]
      const name = EXTRA_ATTR_NAMES[cat]?.[sub]
      if (name) results.push(`${name} +${val}`)
    }
  }
  return results
}

/** 解析武器属性 [speed, range, minDmg, maxDmg, minWound, maxWound, crit, balance, durability, ...optional] */
const decodeWeaponStats = (stats: any[]): string[] => {
  const lines: string[] = []
  if (!stats || stats.length < 9) return lines
  const speed = ATTACK_SPEED_LABELS[stats[0]] || stats[0]
  const range = stats[1] < 10 ? `${stats[1]}次攻击` : `远程(射程 ${stats[1]})`
  lines.push(`攻击速度 ${speed} / ${range}`)
  lines.push(`攻击 ${stats[2]} ~ ${stats[3]}`)
  lines.push(`负伤率 ${stats[4]} ~ ${stats[5]}%`)
  lines.push(`暴击率 ${stats[6]}%`)
  lines.push(`平衡性 ${stats[7]}%`)
  lines.push(`耐久力 ${stats[8]}`)
  return lines
}

/** 解析武器附加参数 [splashRange, splashAngle, splashDmg, staminaCost] */
const decodeWeaponBonus = (bonus: any[]): string[] => {
  const BONUS_NAMES = ['溅射半径', '溅射角度', '溅射伤害%', '体力消耗']
  return bonus.slice(0, 4)
    .map((v, i) => v !== undefined && v !== 0 ? `${BONUS_NAMES[i]} ${v}` : null)
    .filter(Boolean) as string[]
}

/** 解析防甲属性 [defense, protection, durability, magDef?, magPro?] */
const decodeArmorStats = (stats: any[]): string[] => {
  const lines: string[] = []
  if (!stats || stats.length < 2) return lines
  lines.push(`防御力 ${stats[0]}`)
  lines.push(`保护 ${stats[1]}`)
  if (stats[2]) lines.push(`耐久力 ${stats[2]}`)
  if (stats.length > 3) lines.push(`魔法防御力 ${stats[3]}`)
  if (stats.length > 4) lines.push(`魔法保护 ${stats[4]}`)
  return lines
}

/** 解析盾牌附加属性 [rangedDefense, meleeDefense, crit_resist, melee_def_up] */
const decodeShieldBonus = (bonus: any[]): string[] => {
  const SHIELD_NAMES = [
    '防御时远程防御力增加', '防御时近战防御力增加',
    '暴击抵抗率增加%', '近战防御力增加',
  ]
  return bonus.map((v, i) => v ? `${SHIELD_NAMES[i]} ${v}` : null).filter(Boolean) as string[]
}

/** 解析套装效果 ["Element", idx, val, idx, val, ...] */
const decodeSetEffects = (effect: any[]): string[] => {
  const results: string[] = []
  if (!effect || !Array.isArray(effect)) return results
  // 如果第一个元素是 "Element"，从索引 1 开始
  const startIdx = effect[0] === 'Element' ? 1 : 0
  for (let i = startIdx; i < effect.length; i += 2) {
    const idx = effect[i]
    const val = effect[i + 1]
    if (idx === undefined || val === undefined) break
    const name = SET_EFFECT_NAMES[idx]
    if (name) results.push(`${name} ${val} 增加`)
  }
  return results
}

/** 解析食物/消耗品属性 [Life, Mana, Stamina, Str, Int, Dex, Will, Luck, Protection, Defense, (Cooking Quality?), (Durability?)] */
const decodeFoodStats = (stats: any[]): string[] => {
  const lines: string[] = []
  if (!stats || stats.length < 1) return lines
  const NAMES = ['生命值', '魔法值', '体力值', '力量', '智力', '敏捷', '意志', '幸运', '保护', '防御']
  stats.forEach((v, i) => {
    if (v && NAMES[i]) {
      lines.push(`${NAMES[i]} ${v > 0 ? '+' : ''}${v}`)
    }
  })
  return lines
}

/** 道具类型中文名映射 */
const ITEM_TYPE_LABELS: Record<string, string> = {
  OHSword: '单手剑', THSword: '双手剑', OHAxe: '单手斧', THAxe: '双手斧',
  OHBlunt: '单手钝器', THBlunt: '双手钝器', Wand: '魔杖', Staff: '法杖',
  Cylinder: '铳炮', Knuckle: '拳套', Bow: '弓', Crossbow: '弩', Lance: '骑士枪',
  Dualgun: '双枪', Shuriken: '手里剑', Chainblade: '链刃', Fynnbell: '菲恩铃',
  Dreamcatcher: '逐梦者', Handle: '操纵杆', MagicAssistanceBook: '魔法书',
  MagicalKnuckle: '魔力拳套', Marionette: '人偶', Instrument: '乐器',
  HeavyArmor: '重甲', Helm: '重甲头盔', Gauntlet: '重甲手套', Armorboots: '重甲鞋子',
  LightArmor: '轻甲', Headgear: '帽子', Glove: '手套', Shoes: '鞋子',
  ClothArmor: '布衣', Robe: '长袍', Shield: '盾牌', GuardCylinder: '盾铳',
  Accessary: '首饰', Arrow: '弓箭', Bolt: '弩箭', Bullet: '魔力弹',
  BallistaBolt: '弩炮弹药', Food: '料理',
}

/** 道具类型分类：是武器/是防甲/是配件 */
const WEAPON_TYPES = [
  'OHSword', 'THSword', 'OHAxe', 'THAxe', 'OHBlunt', 'THBlunt',
  'Wand', 'Staff', 'Cylinder', 'Knuckle', 'Bow', 'Crossbow', 'Lance',
  'Dualgun', 'Shuriken', 'Chainblade', 'Fynnbell', 'Dreamcatcher', 'Handle',
  'MagicAssistanceBook', 'MagicalKnuckle', 'Marionette', 'Instrument',
]
const ARMOR_TYPES = [
  'HeavyArmor', 'Helm', 'Gauntlet', 'Armorboots',
  'LightArmor', 'Headgear', 'Glove', 'Shoes', 'ClothArmor', 'Robe', 'GuardCylinder',
]
const ACCESSORY_TYPES = ['Accessary', 'Shield']
const AMMO_TYPES = ['Arrow', 'Bolt', 'Bullet', 'BallistaBolt']

/** 完整解析某条道具数组数据（由 Item.ts 导出格式）
 *
 * @param itemData - Item{id} 数组的完整定义, 例如：["短剑", ["OHSword", [speed,...],...], ["Element", ...]]
 * @returns { type, typeLabel, baseStats, bonusStats, extraAttrs, setEffects } 或 null
 */
export const parseItemEquipment = (itemData: any[]): {
  type: string
  typeLabel: string
  baseStats: string[]
  bonusStats: string[]
  extraAttrs: string[]
  setEffects: string[]
} | null => {
  if (!itemData || itemData.length < 2) return null

  // 第二个元素应是 ["OHSword", [...], ...] 或类似格式
  const eqArray = itemData.find((part, i) => i > 0 && Array.isArray(part) && typeof part[0] === 'string' && ITEM_TYPE_LABELS[part[0]])
  if (!eqArray) return null

  const type = eqArray[0] as string
  const typeLabel = ITEM_TYPE_LABELS[type] || type
  const baseStats: string[] = []
  const bonusStats: string[] = []
  const extraAttrs: string[] = []
  const setEffects: string[] = []

  // 解析套装效果
  const elementPart = itemData.find((part: any) => Array.isArray(part) && part[0] === 'Element')
  if (elementPart) {
    setEffects.push(...decodeSetEffects(elementPart))
  }

  // 根据类型解析属性
  if (WEAPON_TYPES.includes(type)) {
    const stats = eqArray[1]
    const bonus = eqArray[2]
    if (Array.isArray(stats)) baseStats.push(...decodeWeaponStats(stats))
    if (Array.isArray(bonus)) bonusStats.push(...decodeWeaponBonus(bonus))
    // 额外属性（索引3+）
    if (eqArray[3]) extraAttrs.push(...decodeExtraAttrs(eqArray[3]))
  } else if (ARMOR_TYPES.includes(type)) {
    const stats = eqArray[1]
    if (Array.isArray(stats)) baseStats.push(...decodeArmorStats(stats))
    // 额外属性（索引2+）
    if (eqArray[2] && Array.isArray(eqArray[2])) {
      extraAttrs.push(...decodeExtraAttrs(eqArray[2]))
    }
  } else if (type === 'Shield') {
    const stats = eqArray[1]
    const shieldBonus = eqArray[2]
    if (Array.isArray(stats)) baseStats.push(...decodeArmorStats(stats))
    if (Array.isArray(shieldBonus)) bonusStats.push(...decodeShieldBonus(shieldBonus))
    if (eqArray[3]) extraAttrs.push(...decodeExtraAttrs(eqArray[3]))
  } else if (type === 'Accessary') {
    const stats = eqArray[1]
    if (Array.isArray(stats)) {
      baseStats.push(`防御力 ${stats[0]}`)
      baseStats.push(`保护 ${stats[1]}`)
      baseStats.push(`耐久力 ${stats[2]}`)
      for (let i = 3; i < stats.length; i += 2) {
        const ATTR_NAMES = ['最大生命值', '最大魔法值', '最大体力值', '力量', '敏捷', '智力', '意志', '幸运', '最小伤害', '最大伤害', '保护', '防御', '魔法保护', '魔法防御', '魔法攻击力', '穿刺等级']
        const name = ATTR_NAMES[stats[i]] || `属性[${stats[i]}]`
        baseStats.push(`${name} ${stats[i + 1]}`)
      }
    }
    if (eqArray[2]) extraAttrs.push(...decodeExtraAttrs(eqArray[2]))
  } else if (AMMO_TYPES.includes(type)) {
    const stats = eqArray[1]
    if (Array.isArray(stats)) {
      baseStats.push(`最小伤害+${stats[0]}`)
      baseStats.push(`最大伤害+${stats[1]}`)
      if (stats[2]) baseStats.push(`命中率+${stats[2]}%`)
      if (stats[3]) baseStats.push(`暴击率+${stats[3]}%`)
    }
  } else if (type === 'Food') {
    if (eqArray[1] !== undefined) baseStats.push(`持续时间 ${eqArray[1]}秒`)
    const stats = eqArray.slice(2)
    if (stats.length > 0) baseStats.push(...decodeFoodStats(stats))
  }

  return { type, typeLabel, baseStats, bonusStats, extraAttrs, setEffects }
}

