/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CharacterClass,
  CharacterStats,
  MobEntity,
  PartyMember,
  FloatingDamage,
  ZoneType,
  WeatherType,
  EquipmentItem,
  CardItem,
  PetDefinition,
  MountDefinition,
  FashionOption,
  OfflineRewardSummary,
  SkillDefinition
} from '../types/game';
import {
  CLASS_SKILLS,
  MVP_BOSS_SKILLS,
  STARTER_EQUIPMENT,
  MONSTER_CARDS,
  AVAILABLE_PETS,
  AVAILABLE_MOUNTS
} from './gameData';
import { sounds } from '../audio/soundSystem';
import { GameThreeScene } from './threeScene';

export function useGameEngine() {
  // Mount reference for Three.js canvas container
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GameThreeScene | null>(null);

  // Core Player State
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Swordsman');
  const [inGame, setInGame] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<ZoneType>('prontera_town');
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  
  // Stats
  const [stats, setStats] = useState<CharacterStats>({
    baseLevel: 65,
    jobLevel: 42,
    currentExp: 4200,
    maxExp: 10000,
    currentJobExp: 2800,
    maxJobExp: 8000,
    str: 55,
    agi: 48,
    vit: 52,
    int: 25,
    dex: 38,
    luk: 30,
    hp: 4850,
    maxHp: 4850,
    sp: 920,
    maxSp: 920,
    atk: 320,
    matk: 140,
    def: 180,
    mdef: 95,
    hit: 120,
    flee: 110,
    crit: 28,
    aspd: 172,
    moveSpeed: 8.5,
    zeny: 125000,
  });

  // Potions Count
  const [redPotions, setRedPotions] = useState<number>(35);
  const [bluePotions, setBluePotions] = useState<number>(25);

  // MVP Transformation Gauge (0 to 100)
  const [transformGauge, setTransformGauge] = useState<number>(100);
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  const [transformTimeRemaining, setTransformTimeRemaining] = useState<number>(0);

  // Auto-Combat Mode
  const [isAutoCombat, setIsAutoCombat] = useState<boolean>(false);

  // Targeting & Mobs
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [mobs, setMobs] = useState<MobEntity[]>([]);

  // Party Allies (Simulated Co-op Dungeons)
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    { id: 'party_1', name: 'Lawrence', job: 'Lord Knight', hp: 5200, maxHp: 5200, x: -2, z: -2, status: 'active' },
    { id: 'party_2', name: 'Cecil', job: 'Sniper', hp: 3400, maxHp: 3400, x: 2, z: -3, status: 'active' },
    { id: 'party_3', name: 'Erend', job: 'High Priest', hp: 3800, maxHp: 3800, x: 0, z: -4, status: 'active' },
  ]);

  // Floating Combat Damage Numbers
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);

  // Combat Log
  const [combatLog, setCombatLog] = useState<string[]>([
    '★ Welcome to Dooded Global – Rise of the MVP! ★',
    'Tip: Press [1-4] for skills, [Space] to attack, [F] for Auto-Combat, [T] to Transform into MVP.',
    'System: Prontera Field is peaceful. Legend speaks of Baphomet stirring in the Labyrinth...',
  ]);

  // Inventory & Customization
  const [equipment, setEquipment] = useState<EquipmentItem[]>(STARTER_EQUIPMENT);
  const [cards, setCards] = useState<CardItem[]>(MONSTER_CARDS);
  const [currentPet, setCurrentPet] = useState<PetDefinition>(AVAILABLE_PETS[0]);
  const [currentMount, setCurrentMount] = useState<MountDefinition>(AVAILABLE_MOUNTS[0]);
  const [fashion, setFashion] = useState<FashionOption>({
    headgearId: 'valkyrie',
    wingId: 'angel',
    hairStyle: 1,
    hairColor: '#f59e0b',
    outfitColor: '#3b82f6',
  });

  // Offline Rewards
  const [offlineRewards, setOfflineRewards] = useState<OfflineRewardSummary>({
    hoursAway: 4.5,
    expGained: 24500,
    zenyGained: 48000,
    orideconGained: 6,
    cardsFound: ['Angeling Card'],
  });

  // Active Skill Cooldowns
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});

  // Simulation Refs
  const playerPosRef = useRef({ x: 0, z: 4, rot: 0 });
  const isMovingRef = useRef(false);
  const keysHeld = useRef<Record<string, boolean>>({});
  const lastTimeRef = useRef<number>(performance.now());
  const mobsRef = useRef<MobEntity[]>([]);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const isAutoRef = useRef(isAutoCombat);
  isAutoRef.current = isAutoCombat;
  const isTransformedRef = useRef(isTransformed);
  isTransformedRef.current = isTransformed;
  const targetIdRef = useRef<string | null>(selectedTargetId);
  targetIdRef.current = selectedTargetId;

  // Banner announcement
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const showAnnouncement = (msg: string) => {
    setAnnouncement(msg);
    setTimeout(() => {
      setAnnouncement(null);
    }, 3500);
  };

  /**
   * Spawn Mobs for current zone
   */
  const spawnZoneMobs = useCallback((zone: ZoneType) => {
    const newMobs: MobEntity[] = [];

    if (zone === 'prontera_town') {
      // Gentle training field with Porings & Lunatics
      for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI * 2) / 7;
        const radius = 8 + (i % 3) * 3;
        newMobs.push({
          id: `poring_${i}`,
          name: i % 2 === 0 ? 'Poring' : 'Lunatic',
          type: i % 2 === 0 ? 'poring' : 'lunatic',
          isBoss: false,
          level: 15 + i * 2,
          hp: 850,
          maxHp: 850,
          atk: 45,
          def: 15,
          expReward: 350,
          zenyReward: 600,
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          rotation: Math.random() * Math.PI * 2,
          state: 'idle',
          drops: ['Jellopy', 'Sticky Mucus', 'Poring Card'],
        });
      }
    } else if (zone === 'whispering_forest') {
      // Mysterious forest with roaming Angeling MVP!
      newMobs.push({
        id: 'mvp_angeling_1',
        name: '★ MVP Angeling ★',
        type: 'angeling',
        isBoss: true,
        level: 75,
        hp: 180000,
        maxHp: 180000,
        atk: 480,
        def: 120,
        expReward: 45000,
        zenyReward: 85000,
        x: 0,
        z: -10,
        rotation: 0,
        state: 'idle',
        drops: ['Angeling Card', 'Angel Wing Hat', 'Holy Robe'],
      });

      for (let i = 0; i < 6; i++) {
        const x = (Math.random() - 0.5) * 24;
        const z = (Math.random() - 0.5) * 24;
        newMobs.push({
          id: `skel_${i}`,
          name: 'Skeleton Soldier',
          type: 'skeleton',
          isBoss: false,
          level: 45,
          hp: 3200,
          maxHp: 3200,
          atk: 140,
          def: 45,
          expReward: 1200,
          zenyReward: 1800,
          x,
          z,
          rotation: Math.random() * Math.PI * 2,
          state: 'idle',
          drops: ['Bone Fragment', 'Oridecon Ore'],
        });
      }
    } else if (zone === 'mvp_arena') {
      // Instanced Boss Arena: Summon Lord Baphomet!
      newMobs.push({
        id: 'mvp_baphomet_1',
        name: '★ MVP Baphomet ★',
        type: 'baphomet',
        isBoss: true,
        level: 99,
        hp: 350000,
        maxHp: 350000,
        atk: 950,
        def: 220,
        expReward: 95000,
        zenyReward: 180000,
        x: 0,
        z: -12,
        rotation: 0,
        state: 'idle',
        drops: ['Baphomet Card', 'Crescent Scythe', 'Majestic Goat Horns', 'Elunium'],
      });
      // Deviling minion
      newMobs.push({
        id: 'mvp_deviling_minion',
        name: '★ MVP Deviling ★',
        type: 'deviling',
        isBoss: true,
        level: 78,
        hp: 195000,
        maxHp: 195000,
        atk: 520,
        def: 130,
        expReward: 52000,
        zenyReward: 95000,
        x: 8,
        z: -8,
        rotation: 0,
        state: 'idle',
        drops: ['Deviling Card', 'Devil Wing Hat', 'Dark Ring'],
      });
    } else if (zone === 'guild_castle') {
      // War of Emperium: Emperium Crystal
      newMobs.push({
        id: 'emperium_crystal',
        name: '★ Guild Emperium Crystal ★',
        type: 'emperium',
        isBoss: true,
        level: 100,
        hp: 500000,
        maxHp: 500000,
        atk: 0,
        def: 300,
        expReward: 150000,
        zenyReward: 300000,
        x: 0,
        z: 0,
        rotation: 0,
        state: 'idle',
        drops: ['Emperium Relic', 'Guild Treasure Chest', 'Gold Bullion'],
      });
    }

    setMobs(newMobs);
    mobsRef.current = newMobs;
  }, []);

  /**
   * Switch Active Zone
   */
  const switchZone = useCallback((zone: ZoneType) => {
    setCurrentZone(zone);
    if (sceneRef.current) {
      sceneRef.current.buildZoneEnvironment(zone);
    }
    // Reposition player
    playerPosRef.current = { x: 0, z: 8, rot: 0 };
    spawnZoneMobs(zone);
    setSelectedTargetId(null);
    sounds.playButtonClick();

    const zoneNames: Record<ZoneType, string> = {
      prontera_town: 'Prontera Capital & Peaceful Plains',
      whispering_forest: 'Whispering Mystic Forest',
      mvp_arena: 'Lord Baphomet Private Sanctuary',
      guild_castle: 'War of Emperium – Royal Castle',
    };
    showAnnouncement(`Entered: ${zoneNames[zone]}`);
  }, [spawnZoneMobs]);

  /**
   * Use Potion
   */
  const useRedPotion = useCallback(() => {
    if (redPotions <= 0) return;
    setRedPotions((c) => c - 1);
    setStats((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + Math.floor(prev.maxHp * 0.45)),
    }));
    sounds.playPotion();
    if (sceneRef.current) {
      sceneRef.current.spawnSkillVfx('heal', playerPosRef.current.x, playerPosRef.current.z);
    }
  }, [redPotions]);

  const useBluePotion = useCallback(() => {
    if (bluePotions <= 0) return;
    setBluePotions((c) => c - 1);
    setStats((prev) => ({
      ...prev,
      sp: Math.min(prev.maxSp, prev.sp + Math.floor(prev.maxSp * 0.5)),
    }));
    sounds.playPotion();
  }, [bluePotions]);

  /**
   * Transform into MVP Boss Avatar
   */
  const triggerTransformation = useCallback(() => {
    if (isTransformed) return;
    if (transformGauge < 100) {
      showAnnouncement(`MVP Gauge Charging (${transformGauge}%)... Hit monsters to charge!`);
      return;
    }

    setIsTransformed(true);
    setTransformGauge(0);
    setTransformTimeRemaining(25); // 25 seconds of godlike MVP mode!
    sounds.playTransform();
    sounds.playBossRoar();
    showAnnouncement('★★★ MVP TRANSFORMATION ACTIVATED! BAPHOMET SOUL AWAKENED! ★★★');

    if (sceneRef.current) {
      sceneRef.current.updatePlayerModel(
        selectedClass,
        fashion.hairColor,
        fashion.outfitColor,
        fashion.headgearId,
        fashion.wingId,
        true
      );
      sceneRef.current.triggerCameraShake(1.2);
      sceneRef.current.spawnSkillVfx('boss_quake', playerPosRef.current.x, playerPosRef.current.z);
    }
  }, [isTransformed, transformGauge, selectedClass, fashion]);

  /**
   * Cast a Skill
   */
  const executeSkill = useCallback((skillIndex: number) => {
    const currentSkills = isTransformed ? MVP_BOSS_SKILLS : CLASS_SKILLS[selectedClass];
    const skill = currentSkills[skillIndex];
    if (!skill) return;

    // Check cooldown
    if (skillCooldowns[skill.id] && skillCooldowns[skill.id] > 0) return;

    // Check SP
    if (stats.sp < skill.spCost) {
      showAnnouncement('Not enough SP!');
      return;
    }

    // Deduct SP
    setStats((prev) => ({ ...prev, sp: Math.max(0, prev.sp - skill.spCost) }));

    // Set cooldown
    setSkillCooldowns((prev) => ({ ...prev, [skill.id]: skill.cooldown }));

    // Sound and animation
    if (skill.name.includes('Heal') || skill.name.includes('Blessing')) {
      sounds.playHeal();
      setStats((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 1200) }));
      if (sceneRef.current) {
        sceneRef.current.spawnSkillVfx('heal', playerPosRef.current.x, playerPosRef.current.z);
      }
      return;
    }

    if (skill.name.includes('Fire') || skill.name.includes('Meteor')) {
      sounds.playFirebolt();
    } else if (skill.name.includes('Hell') || skill.name.includes('Quake')) {
      sounds.playBossRoar();
    } else {
      sounds.playBash();
    }

    // Damage calculation on targets
    const currentTarget = mobsRef.current.find((m) => m.id === targetIdRef.current && m.state !== 'dead');
    const targetX = currentTarget ? currentTarget.x : playerPosRef.current.x;
    const targetZ = currentTarget ? currentTarget.z : playerPosRef.current.z - 4;

    if (sceneRef.current) {
      const vfxType =
        skill.name.includes('Meteor') || skill.name.includes('Fire')
          ? 'meteor'
          : skill.name.includes('Hell') || skill.name.includes('Quake')
          ? 'boss_quake'
          : skill.name.includes('Holy')
          ? 'holy_light'
          : 'bash';
      sceneRef.current.spawnSkillVfx(vfxType, playerPosRef.current.x, playerPosRef.current.z, targetX, targetZ);
    }

    // Deal damage to target or AoE
    const updatedMobs = mobsRef.current.map((mob) => {
      if (mob.state === 'dead') return mob;

      const dist = Math.hypot(mob.x - playerPosRef.current.x, mob.z - playerPosRef.current.z);
      const isAoe = skill.aoeRadius && skill.aoeRadius > 0;
      const isInRange = isAoe ? dist <= skill.aoeRadius! : mob.id === targetIdRef.current && dist <= skill.range;

      if (isInRange) {
        const isCrit = Math.random() * 100 < stats.crit;
        const multiplier = isTransformed ? 3.5 : 1.0;
        const rawDamage = (stats.atk * 1.5 + stats.matk * 1.2) * skill.damageMultiplier * multiplier;
        const damage = Math.floor(rawDamage * (isCrit ? 1.6 : 1.0) * (0.9 + Math.random() * 0.2));

        const newHp = Math.max(0, mob.hp - damage);

        // Floating damage
        const fdId = `fd_${Date.now()}_${Math.random()}`;
        setFloatingDamages((prev) => [
          ...prev.slice(-15),
          {
            id: fdId,
            damage,
            isCrit,
            isHeal: false,
            isMiss: false,
            isMvp: mob.isBoss,
            x: mob.x,
            y: 2,
            z: mob.z,
            screenX: 0,
            screenY: 0,
          },
        ]);

        // Charge MVP Transformation Gauge
        setTransformGauge((g) => Math.min(100, g + 8));

        if (newHp === 0) {
          // Monster Killed!
          handleMobKilled(mob);
          return { ...mob, hp: 0, state: 'dead' as const };
        }

        return { ...mob, hp: newHp };
      }
      return mob;
    });

    setMobs(updatedMobs);
    mobsRef.current = updatedMobs;
  }, [isTransformed, selectedClass, skillCooldowns, stats]);

  /**
   * Normal Basic Attack
   */
  const executeNormalAttack = useCallback(() => {
    sounds.playSlash();
    if (sceneRef.current) {
      sceneRef.current.spawnSkillVfx('slash', playerPosRef.current.x, playerPosRef.current.z);
    }

    // Hit closest or targeted mob
    let target = mobsRef.current.find((m) => m.id === targetIdRef.current && m.state !== 'dead');
    if (!target) {
      // Find nearest living mob within 5 units
      let minDist = 5.0;
      mobsRef.current.forEach((m) => {
        if (m.state === 'dead') return;
        const d = Math.hypot(m.x - playerPosRef.current.x, m.z - playerPosRef.current.z);
        if (d < minDist) {
          minDist = d;
          target = m;
        }
      });
    }

    if (target) {
      setSelectedTargetId(target.id);
      const isCrit = Math.random() * 100 < stats.crit;
      const damage = Math.floor(stats.atk * (isCrit ? 1.8 : 1.0) * (0.9 + Math.random() * 0.2));
      const newHp = Math.max(0, target.hp - damage);

      // Splash damage if Baphomet card is equipped or transformed
      const updatedMobs = mobsRef.current.map((mob) => {
        if (mob.id === target!.id) {
          if (newHp === 0) {
            handleMobKilled(mob);
            return { ...mob, hp: 0, state: 'dead' as const };
          }
          return { ...mob, hp: newHp };
        }
        return mob;
      });

      setMobs(updatedMobs);
      mobsRef.current = updatedMobs;

      setFloatingDamages((prev) => [
        ...prev.slice(-15),
        {
          id: `fd_${Date.now()}`,
          damage,
          isCrit,
          isHeal: false,
          isMiss: false,
          isMvp: target!.isBoss,
          x: target!.x,
          y: 1.8,
          z: target!.z,
          screenX: 0,
          screenY: 0,
        },
      ]);

      setTransformGauge((g) => Math.min(100, g + 4));
    }
  }, [stats]);

  /**
   * Handle Mob Death & Ragnarok Loot / EXP Drops
   */
  const handleMobKilled = (mob: MobEntity) => {
    sounds.playLevelUp();
    if (mob.isBoss) {
      sounds.playMvpDefeat();
      sounds.playCardDrop();
      showAnnouncement(`★★★★★ MVP ${mob.name.toUpperCase()} DEFEATED! ★★★★★`);
      if (sceneRef.current) {
        sceneRef.current.triggerCameraShake(1.5);
      }
    }

    // EXP and Zeny reward with pet bonus
    const expBonus = 1 + currentPet.bonusExpPercent / 100;
    const gainedExp = Math.floor(mob.expReward * expBonus);
    const gainedZeny = mob.zenyReward;

    setStats((prev) => {
      const nextExp = prev.currentExp + gainedExp;
      const isLevelUp = nextExp >= prev.maxExp;
      return {
        ...prev,
        baseLevel: isLevelUp ? prev.baseLevel + 1 : prev.baseLevel,
        currentExp: isLevelUp ? nextExp - prev.maxExp : nextExp,
        maxExp: isLevelUp ? Math.floor(prev.maxExp * 1.25) : prev.maxExp,
        hp: isLevelUp ? prev.maxHp + 100 : prev.hp,
        maxHp: isLevelUp ? prev.maxHp + 100 : prev.maxHp,
        zeny: prev.zeny + gainedZeny,
      };
    });

    setCombatLog((prev) => [
      `Defeated ${mob.name}! Gained +${gainedExp} EXP, +${gainedZeny} Zeny!`,
      mob.isBoss ? `★ Rare Loot Dropped: ${mob.drops.join(', ')}!` : '',
      ...prev.slice(0, 30),
    ].filter(Boolean));
  };

  /**
   * Refine Equipment (+1 to +10)
   */
  const refineEquipment = (item: EquipmentItem): boolean => {
    sounds.playButtonClick();
    if (item.refineLevel >= 10) return false;
    if (stats.zeny < 5000) {
      showAnnouncement('Not enough Zeny for Refinement (Costs 5,000 Zeny)!');
      return false;
    }

    setStats((prev) => ({ ...prev, zeny: prev.zeny - 5000 }));
    // Safe up to +4, then success chance
    const success = item.refineLevel < 4 || Math.random() > 0.35;

    if (success) {
      sounds.playCardDrop();
      setEquipment((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, refineLevel: e.refineLevel + 1 } : e))
      );
      showAnnouncement(`★ SUCCESS! ${item.name} is now +${item.refineLevel + 1}!`);
      return true;
    } else {
      showAnnouncement(`Refinement failed! ${item.name} remained +${item.refineLevel}.`);
      return false;
    }
  };

  /**
   * Claim Offline Rewards
   */
  const claimOfflineRewards = () => {
    if (offlineRewards.expGained === 0) return;
    sounds.playLevelUp();
    sounds.playCardDrop();

    setStats((prev) => ({
      ...prev,
      currentExp: prev.currentExp + offlineRewards.expGained,
      zeny: prev.zeny + offlineRewards.zenyGained,
    }));

    showAnnouncement(`Claimed Offline Rewards: +${offlineRewards.expGained} EXP, +${offlineRewards.zenyGained} Zeny!`);

    setOfflineRewards({
      hoursAway: 0,
      expGained: 0,
      zenyGained: 0,
      orideconGained: 0,
      cardsFound: [],
    });
  };

  /**
   * Fast Forward 2 Hours Offline Sweep
   */
  const sweepOfflineBonus = () => {
    sounds.playCardDrop();
    setOfflineRewards({
      hoursAway: 2.0,
      expGained: 18500,
      zenyGained: 32000,
      orideconGained: 4,
      cardsFound: ['Baphomet Card'],
    });
    showAnnouncement('Simulated 2 Hours of Offline Auto-Grind rewards!');
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        executeNormalAttack();
      } else if (e.code === 'Digit1') {
        executeSkill(0);
      } else if (e.code === 'Digit2') {
        executeSkill(1);
      } else if (e.code === 'Digit3') {
        executeSkill(2);
      } else if (e.code === 'Digit4') {
        executeSkill(3);
      } else if (e.code === 'KeyT') {
        triggerTransformation();
      } else if (e.code === 'KeyF') {
        setIsAutoCombat((a) => {
          const next = !a;
          showAnnouncement(next ? '⚡ Auto-Combat ENABLED' : 'Auto-Combat DISABLED');
          return next;
        });
      } else if (e.code === 'KeyQ') {
        useRedPotion();
      } else if (e.code === 'KeyE') {
        useBluePotion();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.code] = false;
    };

    const handleBlur = () => {
      keysHeld.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [executeNormalAttack, executeSkill, triggerTransformation, useRedPotion, useBluePotion]);

  // Main Simulation Loop (ThreeScene & Auto Combat & Mobs AI)
  useEffect(() => {
    if (!inGame || !canvasMountRef.current) return;

    if (!sceneRef.current) {
      sceneRef.current = new GameThreeScene(canvasMountRef.current, {
        onTargetMob: (mobId) => {
          setSelectedTargetId(mobId);
        },
        onPlayerPosition: (x, z) => {
          playerPosRef.current.x = x;
          playerPosRef.current.z = z;
        },
      });

      sceneRef.current.updatePlayerModel(
        selectedClass,
        fashion.hairColor,
        fashion.outfitColor,
        fashion.headgearId,
        fashion.wingId,
        false
      );
      sceneRef.current.updatePetModel(currentPet.type);
      sceneRef.current.buildZoneEnvironment(currentZone);
      spawnZoneMobs(currentZone);
      sounds.startBgm();
    }

    let animationFrameId = 0;
    let autoCombatTimer = 0;

    const gameLoop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // 1. Process Player Movement
      let moveX = 0;
      let moveZ = 0;
      if (keysHeld.current['KeyW'] || keysHeld.current['ArrowUp']) moveZ -= 1;
      if (keysHeld.current['KeyS'] || keysHeld.current['ArrowDown']) moveZ += 1;
      if (keysHeld.current['KeyA'] || keysHeld.current['ArrowLeft']) moveX -= 1;
      if (keysHeld.current['KeyD'] || keysHeld.current['ArrowRight']) moveX += 1;

      // 2. Auto-Combat Logic (Overrides or assists movement)
      if (isAutoRef.current) {
        autoCombatTimer += dt;

        // Auto Potion when HP < 50%
        if (statsRef.current.hp < statsRef.current.maxHp * 0.5) {
          useRedPotion();
        }
        if (statsRef.current.sp < statsRef.current.maxSp * 0.3) {
          useBluePotion();
        }

        // AI Party High Priest emergency heal
        if (statsRef.current.hp < statsRef.current.maxHp * 0.4 && autoCombatTimer > 0.5) {
          sounds.playHeal();
          setStats((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 900) }));
          if (sceneRef.current) {
            sceneRef.current.spawnSkillVfx('heal', playerPosRef.current.x, playerPosRef.current.z);
          }
          setCombatLog((prev) => ['High Priest Erend: "Heal incoming, stay strong!"', ...prev.slice(0, 25)]);
        }

        let nearestMob: MobEntity | undefined = mobsRef.current.find((m) => m.id === targetIdRef.current && m.state !== 'dead');
        if (!nearestMob) {
          let bestDist = 999;
          mobsRef.current.forEach((m) => {
            if (m.state === 'dead') return;
            const d = Math.hypot(m.x - playerPosRef.current.x, m.z - playerPosRef.current.z);
            if (d < bestDist) {
              bestDist = d;
              nearestMob = m;
            }
          });
          if (nearestMob) {
            setSelectedTargetId((nearestMob as MobEntity).id);
          }
        }

        if (nearestMob) {
          const dx = nearestMob.x - playerPosRef.current.x;
          const dz = nearestMob.z - playerPosRef.current.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 3.0) {
            // Move toward mob
            moveX = dx / dist;
            moveZ = dz / dist;
          } else {
            // Within combat range: rotate attacks!
            if (autoCombatTimer > 0.7) {
              autoCombatTimer = 0;
              // Cast random skill or attack
              const rand = Math.random();
              if (rand < 0.35) {
                executeSkill(0);
              } else if (rand < 0.6) {
                executeSkill(1);
              } else {
                executeNormalAttack();
              }
            }
          }
        }
      }

      const isMoving = moveX !== 0 || moveZ !== 0;
      isMovingRef.current = isMoving;

      if (isMoving) {
        const len = Math.hypot(moveX, moveZ);
        const speed = (statsRef.current.moveSpeed * (1 + currentMount.speedBonusPercent / 100)) * dt;
        playerPosRef.current.x += (moveX / len) * speed;
        playerPosRef.current.z += (moveZ / len) * speed;
        playerPosRef.current.rot = Math.atan2(moveX, moveZ);
      }

      // 3. Update Skill Cooldowns
      setSkillCooldowns((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const k in next) {
          if (next[k] > 0) {
            next[k] = Math.max(0, next[k] - dt);
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      // 4. Update Transformation duration
      if (isTransformedRef.current) {
        setTransformTimeRemaining((t) => {
          const next = t - dt;
          if (next <= 0) {
            setIsTransformed(false);
            if (sceneRef.current) {
              sceneRef.current.updatePlayerModel(
                selectedClass,
                fashion.hairColor,
                fashion.outfitColor,
                fashion.headgearId,
                fashion.wingId,
                false
              );
            }
            showAnnouncement('MVP Transformation Ended.');
            return 0;
          }
          return next;
        });
      }

      // 5. Boss AI & Telegraph updates
      let mobsNeedUpdate = false;
      const updatedMobs = mobsRef.current.map((mob) => {
        if (mob.state === 'dead') return mob;

        if (mob.isBoss) {
          // Boss skill charging
          const currentProgress = (mob.telegraphProgress || 0) + dt * 0.4;
          if (currentProgress >= 1.0) {
            // Trigger Boss Ultimate Attack!
            if (sceneRef.current) {
              sceneRef.current.spawnSkillVfx('boss_quake', mob.x, mob.z);
            }
            sounds.playBossRoar();
            // Damage player if in radius
            const dist = Math.hypot(mob.x - playerPosRef.current.x, mob.z - playerPosRef.current.z);
            if (dist < 8.0) {
              setStats((prev) => ({
                ...prev,
                hp: Math.max(1, prev.hp - Math.floor(mob.atk * 1.4)),
              }));
            }
            mobsNeedUpdate = true;
            return { ...mob, telegraphProgress: 0, telegraphRadius: 5.5 };
          }
          mobsNeedUpdate = true;
          return { ...mob, telegraphProgress: currentProgress, telegraphRadius: 5.5 };
        }
        return mob;
      });

      if (mobsNeedUpdate) {
        mobsRef.current = updatedMobs;
      }

      // 6. Sync Scene Mobs and Render Three.js
      if (sceneRef.current) {
        sceneRef.current.syncMobs(mobsRef.current);
        sceneRef.current.update(
          dt,
          playerPosRef.current.x,
          playerPosRef.current.z,
          playerPosRef.current.rot,
          isMovingRef.current
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    inGame,
    selectedClass,
    fashion,
    currentPet,
    currentMount,
    currentZone,
    spawnZoneMobs,
    executeNormalAttack,
    executeSkill,
  ]);

  // Clean up scene on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      sounds.stopBgm();
    };
  }, []);

  return {
    canvasMountRef,
    inGame,
    setInGame,
    selectedClass,
    setSelectedClass,
    currentZone,
    switchZone,
    currentWeather,
    setCurrentWeather: (w: WeatherType) => {
      setCurrentWeather(w);
      if (sceneRef.current) sceneRef.current.setWeather(w);
    },
    stats,
    redPotions,
    bluePotions,
    useRedPotion,
    useBluePotion,
    transformGauge,
    isTransformed,
    transformTimeRemaining,
    triggerTransformation,
    isAutoCombat,
    setIsAutoCombat,
    selectedTargetId,
    setSelectedTargetId,
    mobs,
    partyMembers,
    floatingDamages,
    combatLog,
    announcement,
    equipment,
    refineEquipment,
    cards,
    currentPet,
    setCurrentPet: (p: PetDefinition) => {
      setCurrentPet(p);
      if (sceneRef.current) sceneRef.current.updatePetModel(p.type);
    },
    currentMount,
    setCurrentMount,
    fashion,
    setFashion,
    offlineRewards,
    claimOfflineRewards,
    sweepOfflineBonus,
    executeSkill,
    executeNormalAttack,
    skillCooldowns,
  };
}
