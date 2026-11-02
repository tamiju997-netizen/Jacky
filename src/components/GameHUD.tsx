/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CharacterClass,
  CharacterStats,
  MobEntity,
  PartyMember,
  ZoneType,
  WeatherType,
  FloatingDamage,
  SkillDefinition
} from '../types/game';
import { CLASS_SKILLS, MVP_BOSS_SKILLS } from '../game/gameData';
import { sounds } from '../audio/soundSystem';
import {
  Shield,
  Zap,
  Heart,
  Crown,
  Sword,
  Swords,
  Crosshair,
  Volume2,
  VolumeX,
  Compass,
  User,
  Hammer,
  Dog,
  Skull,
  Castle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  CloudSun
} from 'lucide-react';

interface GameHUDProps {
  charClass: CharacterClass;
  stats: CharacterStats;
  currentZone: ZoneType;
  onSwitchZone: (zone: ZoneType) => void;
  currentWeather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  redPotions: number;
  bluePotions: number;
  onUseRedPotion: () => void;
  onUseBluePotion: () => void;
  transformGauge: number;
  isTransformed: boolean;
  transformTimeRemaining: number;
  onTriggerTransform: () => void;
  isAutoCombat: boolean;
  onToggleAutoCombat: () => void;
  selectedTarget: MobEntity | null;
  partyMembers: PartyMember[];
  floatingDamages: FloatingDamage[];
  combatLog: string[];
  announcement: string | null;
  skillCooldowns: Record<string, number>;
  onExecuteSkill: (idx: number) => void;
  onExecuteNormalAttack: () => void;

  // Modal Openers
  onOpenCharacter: () => void;
  onOpenRefinery: () => void;
  onOpenPets: () => void;
  onOpenMvpArena: () => void;
  onOpenGuildWar: () => void;
  onOpenOffline: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  charClass,
  stats,
  currentZone,
  onSwitchZone,
  currentWeather,
  onChangeWeather,
  redPotions,
  bluePotions,
  onUseRedPotion,
  onUseBluePotion,
  transformGauge,
  isTransformed,
  transformTimeRemaining,
  onTriggerTransform,
  isAutoCombat,
  onToggleAutoCombat,
  selectedTarget,
  partyMembers,
  floatingDamages,
  combatLog,
  announcement,
  skillCooldowns,
  onExecuteSkill,
  onExecuteNormalAttack,
  onOpenCharacter,
  onOpenRefinery,
  onOpenPets,
  onOpenMvpArena,
  onOpenGuildWar,
  onOpenOffline,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const skills = isTransformed ? MVP_BOSS_SKILLS : CLASS_SKILLS[charClass];

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const spPercent = Math.max(0, Math.min(100, (stats.sp / stats.maxSp) * 100));
  const expPercent = Math.max(0, Math.min(100, (stats.currentExp / stats.maxExp) * 100));

  const targetHpPercent = selectedTarget
    ? Math.max(0, Math.min(100, (selectedTarget.hp / selectedTarget.maxHp) * 100))
    : 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 md:p-5 select-none overflow-hidden">
      {/* =========================================================================
          TOP ROW: Status Cluster (Left) · Boss Bar (Center) · Radar & Quick Controls (Right)
         ========================================================================= */}
      <div className="flex justify-between items-start gap-4">
        {/* Top-Left: Player Status Cluster */}
        <div className="pointer-events-auto bg-slate-950/85 border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 min-w-[260px] md:min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Class Crest */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold font-cinzel text-lg shadow-md">
                {charClass[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100 font-cinzel">
                    {charClass}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Lv.{stats.baseLevel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Zeny: <span className="text-amber-400 font-bold">{stats.zeny.toLocaleString()} Z</span>
                </div>
              </div>
            </div>

            {/* MVP Transformation Trigger Button */}
            <button
              onClick={onTriggerTransform}
              disabled={!isTransformed && transformGauge < 100}
              className={`px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                isTransformed
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40 border border-red-400'
                  : transformGauge >= 100
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/30 hover:scale-105 border border-amber-400'
                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
              title="Transform into MVP Baphomet avatar!"
            >
              <Skull className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isTransformed
                  ? `MVP (${Math.ceil(transformTimeRemaining)}s)`
                  : transformGauge >= 100
                  ? 'MORPH [T]'
                  : `${transformGauge}%`}
              </span>
            </button>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Heart className="w-3 h-3 fill-emerald-400" /> HP
              </span>
              <span className="text-slate-200 tabular-numbers">
                {stats.hp.toLocaleString()} / {stats.maxHp.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-200"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* SP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-blue-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-blue-400" /> SP
              </span>
              <span className="text-slate-200 tabular-numbers">
                {stats.sp.toLocaleString()} / {stats.maxSp.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${spPercent}%` }}
              />
            </div>
          </div>

          {/* EXP Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>EXP</span>
              <span className="tabular-numbers">{expPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-200"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center: Target / Boss Bar */}
        {selectedTarget && selectedTarget.state !== 'dead' ? (
          <div className="pointer-events-auto bg-slate-950/90 border border-red-500/50 rounded-2xl p-3 shadow-2xl flex flex-col items-center min-w-[280px] md:min-w-[360px] animate-in fade-in">
            <div className="flex items-center gap-2 mb-1.5">
              {selectedTarget.isBoss && <Crown className="w-4 h-4 text-amber-400 animate-bounce" />}
              <span className="text-sm font-bold font-cinzel text-red-400">
                {selectedTarget.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Lv.{selectedTarget.level}
              </span>
            </div>

            <div className="w-full space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Target HP:</span>
                <span className="text-red-300 font-bold tabular-numbers">
                  {selectedTarget.hp.toLocaleString()} / {selectedTarget.maxHp.toLocaleString()} ({targetHpPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150"
                  style={{ width: `${targetHpPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Click any monster or press Space to acquire target</span>
          </div>
        )}

        {/* Top-Right: Zone & Weather & Audio Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Quick Zone Selector */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={currentZone}
              onChange={(e) => onSwitchZone(e.target.value as ZoneType)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:border-amber-500"
              aria-label="Zone Selection"
            >
              <option value="prontera_town">Prontera Capital & Plains</option>
              <option value="whispering_forest">Whispering Mystic Forest</option>
              <option value="mvp_arena">Lord Baphomet Private Altar</option>
              <option value="guild_castle">War of Emperium Castle</option>
            </select>

            {/* Weather switch */}
            <select
              value={currentWeather}
              onChange={(e) => onChangeWeather(e.target.value as WeatherType)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300 cursor-pointer focus:outline-none"
              aria-label="Weather Selection"
            >
              <option value="sunny">Sunny Sky</option>
              <option value="cherry_blossom">Cherry Blossom</option>
              <option value="twilight_fog">Twilight Mist</option>
              <option value="holy_aurora">Holy Aurora</option>
              <option value="eclipse_storm">Eclipse Storm</option>
            </select>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Auto-Battle State Pill */}
          <button
            onClick={onToggleAutoCombat}
            className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
              isAutoCombat
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoCombat ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
            <span>AUTO-COMBAT [F]: {isAutoCombat ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE ROW: Banner Announcement & Party Members (Right flank)
         ========================================================================= */}
      <div className="flex justify-between items-center w-full">
        {/* Floating Combat Chat / Battle Log (Bottom-Left) */}
        <div className="pointer-events-auto bg-slate-950/85 border border-slate-800/90 rounded-2xl p-3 shadow-xl max-w-sm text-xs text-slate-300">
          <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Combat & Realm Log</span>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="hover:text-amber-400 cursor-pointer"
            >
              {isChatExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>
          <div className={`space-y-1 font-mono text-[11px] overflow-y-auto ${isChatExpanded ? 'max-h-48' : 'max-h-20'}`}>
            {combatLog.slice(0, isChatExpanded ? 20 : 4).map((line, idx) => (
              <div
                key={idx}
                className={`truncate ${
                  line.includes('MVP') || line.includes('DEFEATED')
                    ? 'text-amber-300 font-bold'
                    : line.includes('Defeated')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Global MVP Announcement Toast Banner */}
        {announcement && (
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 text-slate-950 font-bold font-cinzel text-base md:text-lg px-8 py-3 rounded-2xl shadow-2xl shadow-amber-500/40 border border-yellow-300 mvp-banner-anim text-center">
            {announcement}
          </div>
        )}

        {/* Right side: Party Members Squad HUD */}
        <div className="pointer-events-auto bg-slate-950/85 border border-slate-800 rounded-2xl p-3 shadow-xl min-w-[200px] flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
            <span>Dungeon Squad (AI)</span>
            <span className="text-emerald-400 font-mono">3 Active</span>
          </div>

          {partyMembers.map((member) => (
            <div key={member.id} className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-200 font-medium">{member.name}</span>
                <span className="text-[10px] text-slate-400">{member.job}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ROW: Sleek Unified Action Dock (Skills, Potions & Navigation Tabs)
         ========================================================================= */}
      <div className="pointer-events-auto flex flex-col items-center mx-auto max-w-4xl w-full">
        {/* Dock Collapse Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 px-4 py-1 rounded-t-xl bg-slate-900/90 border border-slate-800 border-b-0 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'Show Controls Dock' : 'Hide Controls (Zen Mode)'}</span>
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex flex-col gap-3">
            {/* Action Buttons: Skills & Potions */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {/* Normal Attack */}
              <button
                onClick={onExecuteNormalAttack}
                className="group relative flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 transition cursor-pointer shadow-lg active:scale-95"
              >
                <Sword className="w-6 h-6 text-slate-200 group-hover:text-amber-300 transition" />
                <span className="text-[10px] font-semibold text-slate-300 mt-0.5">Attack</span>
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-amber-300 border border-slate-700">
                  Space
                </span>
              </button>

              {/* 4 Class or MVP Skills */}
              {skills.map((skill, idx) => {
                const cd = skillCooldowns[skill.id] || 0;
                const isOnCd = cd > 0;
                return (
                  <button
                    key={skill.id}
                    onClick={() => onExecuteSkill(idx)}
                    disabled={isOnCd}
                    className={`group relative flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl border transition cursor-pointer shadow-lg active:scale-95 ${
                      isOnCd
                        ? 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 border-amber-500/30 hover:border-amber-400 text-slate-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mb-1"
                      style={{ backgroundColor: skill.color }}
                    />
                    <span className="text-[10px] font-semibold text-slate-200 truncate max-w-[50px]">
                      {skill.name.split(' ')[0]}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-amber-300 border border-slate-700">
                      {idx + 1}
                    </span>
                    {isOnCd && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl font-mono text-xs font-bold text-amber-400">
                        {cd.toFixed(1)}s
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="w-px h-10 bg-slate-800 mx-1 hidden md:block" />

              {/* HP Red Potion */}
              <button
                onClick={onUseRedPotion}
                disabled={redPotions <= 0}
                className="group relative flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer active:scale-95"
              >
                <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span className="text-[10px] font-mono text-slate-300">{redPotions}</span>
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-emerald-300 border border-slate-700">
                  Q
                </span>
              </button>

              {/* SP Blue Potion */}
              <button
                onClick={onUseBluePotion}
                disabled={bluePotions <= 0}
                className="group relative flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400 transition cursor-pointer active:scale-95"
              >
                <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                <span className="text-[10px] font-mono text-slate-300">{bluePotions}</span>
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-blue-300 border border-slate-700">
                  E
                </span>
              </button>
            </div>

            {/* Feature Modal Nav Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={onOpenCharacter}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Profile & Stats</span>
              </button>
              <button
                onClick={onOpenRefinery}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
              >
                <Hammer className="w-3.5 h-3.5 text-amber-400" />
                <span>Refinery & Cards</span>
              </button>
              <button
                onClick={onOpenPets}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
              >
                <Dog className="w-3.5 h-3.5 text-amber-400" />
                <span>Pets & Mounts</span>
              </button>
              <button
                onClick={onOpenMvpArena}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 hover:text-red-200 text-xs font-semibold flex items-center gap-1.5 border border-red-500/40 transition cursor-pointer"
              >
                <Skull className="w-3.5 h-3.5 text-red-400" />
                <span>MVP Altar</span>
              </button>
              <button
                onClick={onOpenGuildWar}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
              >
                <Castle className="w-3.5 h-3.5 text-amber-400" />
                <span>Guild War (WoE)</span>
              </button>
              <button
                onClick={onOpenOffline}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Chamber</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
