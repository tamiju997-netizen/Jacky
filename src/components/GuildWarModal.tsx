/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ZoneType } from '../types/game';
import { sounds } from '../audio/soundSystem';
import { X, Castle, Shield, Award, Users, Swords } from 'lucide-react';

interface GuildWarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterCastle: (zone: ZoneType) => void;
}

export const GuildWarModal: React.FC<GuildWarModalProps> = ({
  isOpen,
  onClose,
  onEnterCastle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Castle className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-300">
                War of Emperium (Guild Castle Siege)
              </h2>
              <div className="text-xs text-slate-400">
                Conquer the sacred Emperium Crystal with your guild comrades to claim royal taxes & relic chests.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Guild War"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Castle Banner & Status */}
        <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-base font-bold font-cinzel text-amber-300">
                Castle Neuschwanstein (Prontera Realm 1)
              </span>
              <div className="text-xs text-slate-400">Occupying Guild: [Dooded Vanguard]</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              SIEGE ACTIVE
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Emperium Crystal Integrity:</span>
              <span className="text-amber-400 font-bold">500,000 / 500,000 HP (100%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px]">Castle Economy</span>
              <div className="text-emerald-400 font-bold">Lv. 95</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Guardians</span>
              <div className="text-blue-400 font-bold">8 Active</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Daily Tax</span>
              <div className="text-amber-400 font-bold">500,000 Z</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sounds.playLevelUp();
            onEnterCastle('guild_castle');
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider font-cinzel flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
        >
          <Swords className="w-4 h-4 fill-slate-950" />
          ENTER GUILD CASTLE THRONE (WAR OF EMPERIUM)
        </button>
      </div>
    </div>
  );
};
