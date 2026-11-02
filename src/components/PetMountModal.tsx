/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PetDefinition, MountDefinition } from '../types/game';
import { AVAILABLE_PETS, AVAILABLE_MOUNTS } from '../game/gameData';
import { sounds } from '../audio/soundSystem';
import { X, Heart, Shield, Sparkles, Dog } from 'lucide-react';

interface PetMountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPet: PetDefinition;
  onSelectPet: (p: PetDefinition) => void;
  currentMount: MountDefinition;
  onSelectMount: (m: MountDefinition) => void;
}

export const PetMountModal: React.FC<PetMountModalProps> = ({
  isOpen,
  onClose,
  currentPet,
  onSelectPet,
  currentMount,
  onSelectMount,
}) => {
  const [activeTab, setActiveTab] = React.useState<'pets' | 'mounts'>('pets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Dog className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-300">
                Cute Companions & Mount Stables
              </h2>
              <div className="text-xs text-slate-400">
                Faithful companions that follow you across Midgard and grant combat boons.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Pet and Mounts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('pets');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'pets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Active Pets ({currentPet.name})
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('mounts');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'mounts'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Mount Stables ({currentMount.name})
          </button>
        </div>

        {/* Tab 1: Pets */}
        {activeTab === 'pets' && (
          <div className="space-y-3">
            {AVAILABLE_PETS.map((pet) => {
              const isSelected = currentPet.id === pet.id;
              return (
                <div
                  key={pet.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-100 font-cinzel">
                        {pet.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        Intimacy {pet.intimacy}%
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium">{pet.buffDescription}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        sounds.playHeal();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                      Feed
                    </button>
                    <button
                      onClick={() => {
                        sounds.playButtonClick();
                        onSelectPet(pet);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold font-cinzel transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isSelected ? 'ACTIVE' : 'SUMMON'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Mounts */}
        {activeTab === 'mounts' && (
          <div className="space-y-3">
            {AVAILABLE_MOUNTS.map((mount) => {
              const isSelected = currentMount.id === mount.id;
              return (
                <div
                  key={mount.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-100 font-cinzel">
                        {mount.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        +{mount.speedBonusPercent}% Speed
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{mount.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playButtonClick();
                      onSelectMount(mount);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-cinzel transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {isSelected ? 'MOUNTED' : 'RIDE'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
