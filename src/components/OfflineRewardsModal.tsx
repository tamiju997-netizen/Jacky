/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OfflineRewardSummary } from '../types/game';
import { sounds } from '../audio/soundSystem';
import { X, Clock, Award, Gift, Zap, Sparkles } from 'lucide-react';

interface OfflineRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: OfflineRewardSummary;
  onClaim: () => void;
  onFastForward: () => void;
}

export const OfflineRewardsModal: React.FC<OfflineRewardsModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onClaim,
  onFastForward,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-300">
                Offline Auto-Hunt Chamber
              </h2>
              <div className="text-xs text-slate-400">
                Your hero continues slaying monsters and gathering relics while you rest.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Offline Chamber"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accumulated Loot Box */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Accumulated Rest Time:
            </span>
            <span className="text-sm font-bold text-amber-300 font-mono">
              {rewards.hoursAway.toFixed(1)} Hours
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">EXP Gained</span>
              <div className="text-base font-bold text-emerald-400 font-mono">
                +{rewards.expGained.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Zeny Collected</span>
              <div className="text-base font-bold text-amber-400 font-mono">
                +{rewards.zenyGained.toLocaleString()} Z
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Refining Ores</span>
              <div className="text-base font-bold text-blue-400 font-mono">
                +{rewards.orideconGained}x Oridecon
              </div>
            </div>
          </div>

          {rewards.cardsFound.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-300 font-semibold">
                Rare Card Found: {rewards.cardsFound.join(', ')}!
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onFastForward}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs tracking-wider font-cinzel border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            +2 HOUR INSTANT SWEEP
          </button>
          <button
            onClick={() => {
              onClaim();
              onClose();
            }}
            disabled={rewards.expGained === 0}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs tracking-wider font-cinzel disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Gift className="w-4 h-4 fill-slate-950" />
            CLAIM REWARDS
          </button>
        </div>
      </div>
    </div>
  );
};
