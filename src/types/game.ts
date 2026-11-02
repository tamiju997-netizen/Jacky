/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterClass = 'Swordsman' | 'Mage' | 'Archer' | 'Thief' | 'Acolyte';

export type AdvancedJob = 
  | 'Knight' | 'Lord Knight'
  | 'Wizard' | 'High Wizard'
  | 'Hunter' | 'Sniper'
  | 'Assassin' | 'Assassin Cross'
  | 'Priest' | 'High Priest';

export type ZoneType = 'prontera_town' | 'whispering_forest' | 'mvp_arena' | 'guild_castle';

export type WeatherType = 'sunny' | 'cherry_blossom' | 'twilight_fog' | 'holy_aurora' | 'eclipse_storm';

export interface SkillDefinition {
  id: string;
  name: string;
  spCost: number;
  cooldown: number; // seconds
  range: number;
  damageMultiplier: number;
  aoeRadius?: number;
  description: string;
  color: string;
  iconName: string;
}

export interface CharacterStats {
  baseLevel: number;
  jobLevel: number;
  currentExp: number;
  maxExp: number;
  currentJobExp: number;
  maxJobExp: number;
  
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  crit: number;
  aspd: number;
  moveSpeed: number;
  
  zeny: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: 'weapon' | 'shield' | 'armor' | 'garment' | 'shoes' | 'accessory' | 'headgear';
  refineLevel: number; // 0 to 10
  rarity: 'common' | 'rare' | 'epic' | 'mvp';
  atkBonus?: number;
  defBonus?: number;
  matkBonus?: number;
  cardSlot?: CardItem | null;
  description: string;
}

export interface CardItem {
  id: string;
  name: string;
  monsterName: string;
  rarity: 'rare' | 'mvp';
  effectDescription: string;
  statBonus: Partial<CharacterStats>;
}

export interface PetDefinition {
  id: string;
  name: string;
  type: 'poring' | 'desert_wolf' | 'dragon';
  level: number;
  intimacy: number; // 0 to 100
  buffDescription: string;
  bonusExpPercent: number;
  bonusAtkPercent: number;
}

export interface MountDefinition {
  id: string;
  name: string;
  type: 'peco_peco' | 'fenrir_wolf' | 'royal_gryphon';
  speedBonusPercent: number;
  description: string;
}

export interface FashionOption {
  headgearId: string;
  wingId: string;
  hairStyle: number;
  hairColor: string;
  outfitColor: string;
}

export interface MobEntity {
  id: string;
  name: string;
  type: 'poring' | 'lunatic' | 'fabre' | 'skeleton' | 'angeling' | 'deviling' | 'baphomet' | 'phreeoni' | 'emperium';
  isBoss: boolean;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  expReward: number;
  zenyReward: number;
  x: number;
  z: number;
  rotation: number;
  state: 'idle' | 'walk' | 'attack' | 'skill_windup' | 'hit' | 'dead';
  targetId?: string;
  telegraphRadius?: number;
  telegraphProgress?: number; // 0 to 1
  respawnTime?: number;
  drops: string[];
}

export interface PartyMember {
  id: string;
  name: string;
  job: string;
  hp: number;
  maxHp: number;
  x: number;
  z: number;
  status: 'active' | 'knocked_out';
}

export interface FloatingDamage {
  id: string;
  damage: number;
  isCrit: boolean;
  isHeal: boolean;
  isMiss: boolean;
  isMvp: boolean;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
}

export interface OfflineRewardSummary {
  hoursAway: number;
  expGained: number;
  zenyGained: number;
  orideconGained: number;
  cardsFound: string[];
}
