/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterClass, CharacterStats, FashionOption } from '../types/game';
import { sounds } from '../audio/soundSystem';
import { X, Sparkles, Shield, User, Crown, Palette } from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  charClass: CharacterClass;
  stats: CharacterStats;
  onUpdateStats: (newStats: CharacterStats) => void;
  fashion: FashionOption;
  onUpdateFashion: (newFashion: FashionOption) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  charClass,
  stats,
  onUpdateStats,
  fashion,
  onUpdateFashion,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'jobs' | 'fashion'>('stats');
  const [statPoints, setStatPoints] = useState<number>(15);

  if (!isOpen) return null;

  const handleAddStat = (statKey: keyof CharacterStats) => {
    if (statPoints <= 0) return;
    sounds.playButtonClick();
    setStatPoints((p) => p - 1);
    onUpdateStats({
      ...stats,
      [statKey]: (stats[statKey] as number) + 1,
      atk: statKey === 'str' ? stats.atk + 4 : stats.atk,
      matk: statKey === 'int' ? stats.matk + 5 : stats.matk,
      def: statKey === 'vit' ? stats.def + 3 : stats.def,
      flee: statKey === 'agi' ? stats.flee + 2 : stats.flee,
      crit: statKey === 'luk' ? stats.crit + 1 : stats.crit,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-300">
                Hero Profile & Progression
              </h2>
              <div className="text-xs text-slate-400">
                {charClass} · Base Lv. {stats.baseLevel} · Job Lv. {stats.jobLevel}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('stats');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Attributes & Stats
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('jobs');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4" />
            Job Evolution
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('fashion');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'fashion'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            Wardrobe & Wings
          </button>
        </div>

        {/* Tab 1: Attributes */}
        {activeTab === 'stats' && (
          <div>
            <div className="flex justify-between items-center mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-sm text-slate-300 font-medium">
                Available Attribute Points:
              </span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {statPoints}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'STR (Strength)', key: 'str', desc: '+ATK Physical Power', val: stats.str },
                { label: 'AGI (Agility)', key: 'agi', desc: '+ASPD & Flee Dodge', val: stats.agi },
                { label: 'VIT (Vitality)', key: 'vit', desc: '+DEF & Max HP', val: stats.vit },
                { label: 'INT (Intelligence)', key: 'int', desc: '+MATK & Max SP', val: stats.int },
                { label: 'DEX (Dexterity)', key: 'dex', desc: '+HIT Accuracy & Cast', val: stats.dex },
                { label: 'LUK (Luck)', key: 'luk', desc: '+CRIT & Perfect Dodge', val: stats.luk },
              ].map((st) => (
                <div
                  key={st.key}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{st.label}</div>
                    <div className="text-[10px] text-slate-400">{st.desc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-300 font-bold text-sm">
                      {st.val}
                    </span>
                    <button
                      onClick={() => handleAddStat(st.key as keyof CharacterStats)}
                      disabled={statPoints <= 0}
                      className="w-7 h-7 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed border border-amber-500/40 font-bold flex items-center justify-center cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Combat Readout Summary */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">ATK</div>
                <div className="text-red-400 font-bold">{stats.atk}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">DEF</div>
                <div className="text-blue-400 font-bold">{stats.def}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">MATK</div>
                <div className="text-purple-400 font-bold">{stats.matk}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">CRIT</div>
                <div className="text-amber-400 font-bold">{stats.crit}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job Progression */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-300 mb-2">
              Ascend your class to unlock mythical second-tier powers and transcendence skills.
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-amber-300 font-cinzel">
                  Tier 1: {charClass}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Initial adventurer foundation. Mastery achieved.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-slate-200 font-cinzel">
                  Tier 2: Advanced Class (Knight / Wizard / Sniper / Assassin / Priest)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  UNLOCKED (Lv.40+)
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Grants +35% Stat Multiplier, access to Bowling Bash / Meteor Storm / Magnus Exorcismus.
              </p>
              <button
                onClick={() => {
                  sounds.playLevelUp();
                  onUpdateStats({ ...stats, atk: stats.atk + 50, maxHp: stats.maxHp + 1000 });
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider font-cinzel transition cursor-pointer"
              >
                APPLY ADVANCED JOB AURA
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Fashion & Customization */}
        {activeTab === 'fashion' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                Mythic Headgear
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'valkyrie', name: 'Valkyrie Helm' },
                  { id: 'horns', name: 'Majestic Horns' },
                  { id: 'none', name: 'No Headgear' },
                ].map((hg) => (
                  <button
                    key={hg.id}
                    onClick={() => {
                      sounds.playButtonClick();
                      onUpdateFashion({ ...fashion, headgearId: hg.id });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      fashion.headgearId === hg.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {hg.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                Cosmic Wings
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'angel', name: 'Angelic Wings' },
                  { id: 'demon', name: 'Demonic Wings' },
                  { id: 'none', name: 'No Wings' },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      sounds.playButtonClick();
                      onUpdateFashion({ ...fashion, wingId: w.id });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      fashion.wingId === w.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">
                Hair Color Tint
              </label>
              <div className="flex gap-3">
                {['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      sounds.playButtonClick();
                      onUpdateFashion({ ...fashion, hairColor: color });
                    }}
                    className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                      fashion.hairColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select Hair Color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
