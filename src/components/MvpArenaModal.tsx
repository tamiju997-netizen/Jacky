/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ZoneType } from '../types/game';
import { sounds } from '../audio/soundSystem';
import { X, Skull, Award, Swords, Flame } from 'lucide-react';

interface MvpArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeleportToArena: (zone: ZoneType) => void;
}

const MVP_BOSS_DATA = [
  {
    id: 'baphomet',
    name: 'Lord Baphomet',
    title: 'The Great Demon of the Labyrinth',
    level: 99,
    hp: '350,000',
    element: 'Shadow / Demon',
    skills: "Earthquake, Hell's Judgment, Dark Strike",
    drops: 'Baphomet Card, Crescent Scythe, Majestic Goat Horns, Elunium',
    tag: 'DEADLY MVP',
    accent: 'border-red-500/40 text-red-400 bg-red-500/10',
  },
  {
    id: 'phreeoni',
    name: 'Phreeoni',
    title: 'Subterranean Desert Devourer',
    level: 88,
    hp: '240,000',
    element: 'Neutral / Brute',
    skills: 'Sand Spit, Swallow Rush, Toxic Quake',
    drops: 'Phreeoni Card, Desert Sand Spear, Oridecon',
    tag: 'LEGENDARY MVP',
    accent: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'angeling',
    name: 'Angeling',
    title: 'Holy Cherub of Mount Mjolnir',
    level: 75,
    hp: '180,000',
    element: 'Holy / Angel',
    skills: 'Holy Light, Grand Cross, Angelic Shield',
    drops: 'Angeling Card, Angel Wings, Holy Robe',
    tag: 'DIVINE MVP',
    accent: 'border-pink-500/40 text-pink-300 bg-pink-500/10',
  },
  {
    id: 'deviling',
    name: 'Deviling',
    title: 'Nightmare Winged Imp',
    level: 78,
    hp: '195,000',
    element: 'Shadow / Demon',
    skills: 'Shadow Wave, Curse Cloud, Bat Swarm',
    drops: 'Deviling Card, Devil Wings, Dark Hood',
    tag: 'SHADOW MVP',
    accent: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
];

export const MvpArenaModal: React.FC<MvpArenaModalProps> = ({
  isOpen,
  onClose,
  onTeleportToArena,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Skull className="w-6 h-6 text-red-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-red-400">
                Private MVP Boss Altar
              </h2>
              <div className="text-xs text-slate-400">
                Challenge instanced MVP Bosses solo or with your party companions for rare Cards and Relics.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close MVP Arena"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boss Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {MVP_BOSS_DATA.map((boss) => (
            <div
              key={boss.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-red-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-base font-bold font-cinzel text-slate-100">{boss.name}</h3>
                    <div className="text-[11px] text-slate-400 italic mb-2">{boss.title}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${boss.accent}`}>
                    {boss.tag}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                  <div>
                    <span className="text-slate-400">Level:</span> <span className="text-amber-300 font-bold">{boss.level}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">HP:</span> <span className="text-red-400 font-bold">{boss.hp}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Element:</span> <span className="text-slate-200">{boss.element}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 mb-1">
                  <span className="text-red-400 font-semibold">Telegraph Skills:</span> {boss.skills}
                </div>
                <div className="text-xs text-amber-300/80 mb-4">
                  <span className="text-amber-400 font-semibold">Drop Relics:</span> {boss.drops}
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playBossRoar();
                  onTeleportToArena('mvp_arena');
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider font-cinzel flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                ENTER ARENA & SUMMON MVP
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
