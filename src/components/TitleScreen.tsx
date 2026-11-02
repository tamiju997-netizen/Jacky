/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterClass } from '../types/game';
import { CLASS_SKILLS } from '../game/gameData';
import { sounds } from '../audio/soundSystem';
import { Volume2, VolumeX, Shield, Wand2, Crosshair, Scissors, Sparkles, Play } from 'lucide-react';

interface TitleScreenProps {
  selectedClass: CharacterClass;
  onSelectClass: (c: CharacterClass) => void;
  onStartGame: () => void;
}

const CLASS_DESCRIPTIONS: Record<CharacterClass, {
  title: string;
  evolution: string;
  role: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
}> = {
  Swordsman: {
    title: 'Swordsman',
    evolution: 'Knight → Lord Knight',
    role: 'Frontline Melee / Tank',
    desc: 'Wields colossal greatswords, boasts impenetrable defense, and slashes through enemy ranks with Bowling Bash and Magnum Break.',
    icon: <Shield className="w-5 h-5 text-red-400" />,
    accent: 'border-red-500/40 text-red-400',
  },
  Mage: {
    title: 'Mage',
    evolution: 'Wizard → High Wizard',
    role: 'Elemental Burst / AoE',
    desc: 'Channels primal arcane forces to conjure apocalyptic Meteor Storms, blazing Fire Bolts, and mystical Safety Walls.',
    icon: <Wand2 className="w-5 h-5 text-purple-400" />,
    accent: 'border-purple-500/40 text-purple-400',
  },
  Archer: {
    title: 'Archer',
    evolution: 'Hunter → Sniper',
    role: 'Long Range Precision / Traps',
    desc: 'Masters precision marksmanship, raining Arrow Showers and sniping targets from distance before they can ever retaliate.',
    icon: <Crosshair className="w-5 h-5 text-emerald-400" />,
    accent: 'border-emerald-500/40 text-emerald-400',
  },
  Thief: {
    title: 'Thief',
    evolution: 'Assassin → Assassin Cross',
    role: 'High ASPD / Burst Critical',
    desc: 'Strikes from the shadows with twin envenomed daggers, executing the lethal 8-hit Sonic Blow with blinding speed.',
    icon: <Scissors className="w-5 h-5 text-lime-400" />,
    accent: 'border-lime-500/40 text-lime-400',
  },
  Acolyte: {
    title: 'Acolyte',
    evolution: 'Priest → High Priest',
    role: 'Holy Radiance / Support Healer',
    desc: 'Blessed by Odin to restore fallen allies with divine Heal, granting impenetrable Kyrie shields and casting Magnus Exorcismus.',
    icon: <Sparkles className="w-5 h-5 text-amber-300" />,
    accent: 'border-amber-400/40 text-amber-300',
  },
};

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedClass,
  onSelectClass,
  onStartGame,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleClassClick = (cls: CharacterClass) => {
    sounds.playButtonClick();
    onSelectClass(cls);
  };

  const info = CLASS_DESCRIPTIONS[selectedClass];
  const skills = CLASS_SKILLS[selectedClass];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 md:p-12 overflow-hidden bg-radial from-slate-900 via-indigo-950 to-black text-slate-100 select-none">
      {/* Background Decorative Runes & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            3D Fantasy MMORPG
          </span>
          <span className="text-xs text-slate-400 font-mono tracking-wide">
            v2.4.0 Global Edition
          </span>
        </div>

        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-amber-500/60 text-slate-300 text-xs transition cursor-pointer"
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>

      {/* Centerpiece Hero Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-4xl mx-auto">
        {/* Bespoke Inline SVG Logo Lockup */}
        <div className="mb-4">
          <svg className="w-72 md:w-96 h-20" viewBox="0 0 400 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="runeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            {/* Crown Wings */}
            <path d="M120 20 L200 4 L280 20 L240 32 L200 16 L160 32 Z" fill="url(#goldGrad)" opacity="0.9" />
            {/* Title Text */}
            <text x="200" y="62" textAnchor="middle" fill="url(#goldGrad)" className="font-cinzel" fontSize="42" fontWeight="900" letterSpacing="4">
              DOODED
            </text>
            <text x="200" y="84" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="700" letterSpacing="6">
              GLOBAL – RISE OF THE MVP
            </text>
          </svg>
        </div>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light mb-8 leading-relaxed">
          Step into a massive magical realm inspired by Ragnarok Online. Defeat legendary MVPs like <span className="text-red-400 font-medium">Baphomet</span> and <span className="text-pink-300 font-medium">Angeling</span>, unlock godlike boss transformations, and conquer the War of Emperium!
        </p>

        {/* 5 Class Selection Bar */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 shadow-2xl backdrop-blur-none">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-semibold">
            Choose Your Destiny Class
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-3 mb-6">
            {(['Swordsman', 'Mage', 'Archer', 'Thief', 'Acolyte'] as CharacterClass[]).map((cls) => {
              const item = CLASS_DESCRIPTIONS[cls];
              const isSelected = selectedClass === cls;
              return (
                <button
                  key={cls}
                  onClick={() => handleClassClick(cls)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-105'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="mb-1.5">{item.icon}</div>
                  <span className="text-xs md:text-sm font-semibold tracking-wide">{cls}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Class Highlight */}
          <div className="grid md:grid-cols-2 gap-4 text-left p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-amber-300 font-cinzel">{info.title}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {info.role}
                </span>
              </div>
              <div className="text-xs text-amber-400/80 font-medium mb-2">Evolution: {info.evolution}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{info.desc}</p>
            </div>

            {/* Class Skills Preview */}
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold mb-2">Class Abilities</div>
              <div className="grid grid-cols-2 gap-2">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/70 border border-slate-800">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-200 font-medium truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Start Game CTA */}
        <button
          onClick={() => {
            sounds.playLevelUp();
            onStartGame();
          }}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-base md:text-lg tracking-wider font-cinzel shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>ENTER MIDGARD (SPACE / ENTER)</span>
        </button>
      </div>

      {/* Footer Controls & Hints */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 max-w-7xl mx-auto w-full">
        <div className="font-mono text-slate-400 tracking-wider mb-2 md:mb-0">
          WASD / Arrows: Move · Space: Attack · 1-4: Skills · T: Transform MVP · F: Auto-Battle · Q/E: Potions
        </div>
        <div className="text-slate-400 text-xs">
          Inspired by Ragnarok Twilight Global · 100% Real-time 3D Engine
        </div>
      </div>
    </div>
  );
};
