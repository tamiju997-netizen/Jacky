/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EquipmentItem, CardItem } from '../types/game';
import { sounds } from '../audio/soundSystem';
import { X, Hammer, Shield, Zap, Sparkles } from 'lucide-react';

interface RefineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem[];
  cards: CardItem[];
  zeny: number;
  onRefine: (item: EquipmentItem) => boolean;
  onSlotCard: (itemId: string, card: CardItem) => void;
}

export const RefineryModal: React.FC<RefineryModalProps> = ({
  isOpen,
  onClose,
  equipment,
  cards,
  zeny,
  onRefine,
  onSlotCard,
}) => {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem>(equipment[0]);
  const [selectedCard, setSelectedCard] = useState<CardItem>(cards[0]);
  const [activeTab, setActiveTab] = useState<'refine' | 'cards'>('refine');
  const [isForging, setIsForging] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRefineClick = () => {
    setIsForging(true);
    sounds.playBash();
    setTimeout(() => {
      onRefine(selectedItem);
      setIsForging(false);
      // update local reference
      const updated = equipment.find((e) => e.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }, 450);
  };

  const handleCardSlotClick = () => {
    sounds.playCardDrop();
    onSlotCard(selectedItem.id, selectedCard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Hammer className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-300">
                Prontera Royal Refinery & Card Altar
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                Zeny Available: <span className="text-amber-400 font-bold">{zeny.toLocaleString()} Z</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Refinery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('refine');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'refine'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Hammer className="w-4 h-4" />
            Equipment Refinement (+1 to +10)
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('cards');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Monster Card Socketing
          </button>
        </div>

        {/* Equipment Selector */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {equipment.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playButtonClick();
                  setSelectedItem(item);
                }}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-amber-400/80">{item.slot}</div>
                <div className="text-xs font-semibold truncate text-slate-200">{item.name}</div>
                <div className="text-[11px] font-mono font-bold text-amber-300">+{item.refineLevel}</div>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Refinement Station */}
        {activeTab === 'refine' && (
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Hammer className={`w-10 h-10 text-amber-300 ${isForging ? 'animate-bounce' : ''}`} />
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-xs">
                +{selectedItem.refineLevel}
              </span>
            </div>

            <h3 className="text-lg font-bold font-cinzel text-amber-300 mb-1">
              +{selectedItem.refineLevel} {selectedItem.name}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6">{selectedItem.description}</p>

            <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6 text-left p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400">Current Bonus:</span>
                <div className="text-emerald-400 font-bold">
                  +{selectedItem.refineLevel * 15} ATK/DEF
                </div>
              </div>
              <div>
                <span className="text-slate-400">After Refine:</span>
                <div className="text-amber-300 font-bold">
                  +{(selectedItem.refineLevel + 1) * 15} ATK/DEF
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-4 font-mono">
              Refinement Fee: <span className="text-amber-400 font-bold">5,000 Zeny</span> + 1x Oridecon
            </div>

            <button
              onClick={handleRefineClick}
              disabled={isForging || selectedItem.refineLevel >= 10 || zeny < 5000}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider font-cinzel disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              {selectedItem.refineLevel >= 10 ? 'MAX REFINE REACHED' : 'HAMMER AT THE ANVIL (REFINE)'}
            </button>
          </div>
        )}

        {/* Tab 2: Monster Cards */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Imbue your weapons and armor with the divine souls of defeated MVP and field bosses.
            </div>

            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => {
                const isSelected = selectedCard.id === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      sounds.playButtonClick();
                      setSelectedCard(card);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-300 font-cinzel">
                        {card.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {card.rarity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight mb-2">
                      {card.effectDescription}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardSlotClick();
                      }}
                      className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] font-cinzel transition"
                    >
                      SOCKET INTO {selectedItem.name.toUpperCase()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
