/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameEngine } from './game/useGameEngine';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { CharacterModal } from './components/CharacterModal';
import { RefineryModal } from './components/RefineryModal';
import { PetMountModal } from './components/PetMountModal';
import { MvpArenaModal } from './components/MvpArenaModal';
import { GuildWarModal } from './components/GuildWarModal';
import { OfflineRewardsModal } from './components/OfflineRewardsModal';
import { sounds } from './audio/soundSystem';

export default function App() {
  const engine = useGameEngine();

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'character' | 'refinery' | 'pets' | 'mvp' | 'guild' | 'offline' | null
  >(null);

  // Check for ?autostart=1 parameter for ultra mode & testability
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.setInGame(true);
    }
  }, [engine]);

  // Handle global Enter/Space to start game from Title screen
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!engine.inGame) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          sounds.playLevelUp();
          engine.setInGame(true);
        }
      } else {
        if (e.code === 'Escape') {
          // Close open modal or pause
          setActiveModal(null);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [engine]);

  // Find currently selected mob entity
  const targetMob = engine.mobs.find((m) => m.id === engine.selectedTargetId) || null;

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans"
      data-testid="game-root"
      data-state={engine.inGame ? 'playing' : 'title'}
    >
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div
        ref={engine.canvasMountRef}
        className="absolute inset-0 z-0 w-full h-full"
        data-testid="three-canvas-container"
      />

      {/* Screen 1: Title Screen & Class Selection */}
      {!engine.inGame && (
        <div className="absolute inset-0 z-30">
          <TitleScreen
            selectedClass={engine.selectedClass}
            onSelectClass={engine.setSelectedClass}
            onStartGame={() => engine.setInGame(true)}
          />
        </div>
      )}

      {/* Screen 2: In-Game Low-Occlusion HUD Overlay */}
      {engine.inGame && (
        <GameHUD
          charClass={engine.selectedClass}
          stats={engine.stats}
          currentZone={engine.currentZone}
          onSwitchZone={engine.switchZone}
          currentWeather={engine.currentWeather}
          onChangeWeather={engine.setCurrentWeather}
          redPotions={engine.redPotions}
          bluePotions={engine.bluePotions}
          onUseRedPotion={engine.useRedPotion}
          onUseBluePotion={engine.useBluePotion}
          transformGauge={engine.transformGauge}
          isTransformed={engine.isTransformed}
          transformTimeRemaining={engine.transformTimeRemaining}
          onTriggerTransform={engine.triggerTransformation}
          isAutoCombat={engine.isAutoCombat}
          onToggleAutoCombat={() => engine.setIsAutoCombat(!engine.isAutoCombat)}
          selectedTarget={targetMob}
          partyMembers={engine.partyMembers}
          floatingDamages={engine.floatingDamages}
          combatLog={engine.combatLog}
          announcement={engine.announcement}
          skillCooldowns={engine.skillCooldowns}
          onExecuteSkill={engine.executeSkill}
          onExecuteNormalAttack={engine.executeNormalAttack}
          onOpenCharacter={() => setActiveModal('character')}
          onOpenRefinery={() => setActiveModal('refinery')}
          onOpenPets={() => setActiveModal('pets')}
          onOpenMvpArena={() => setActiveModal('mvp')}
          onOpenGuildWar={() => setActiveModal('guild')}
          onOpenOffline={() => setActiveModal('offline')}
        />
      )}

      {/* Modals & Sub-Panels */}
      <CharacterModal
        isOpen={activeModal === 'character'}
        onClose={() => setActiveModal(null)}
        charClass={engine.selectedClass}
        stats={engine.stats}
        onUpdateStats={() => {}}
        fashion={engine.fashion}
        onUpdateFashion={engine.setFashion}
      />

      <RefineryModal
        isOpen={activeModal === 'refinery'}
        onClose={() => setActiveModal(null)}
        equipment={engine.equipment}
        cards={engine.cards}
        zeny={engine.stats.zeny}
        onRefine={engine.refineEquipment}
        onSlotCard={(itemId, card) => {
          engine.announcement && engine.announcement;
        }}
      />

      <PetMountModal
        isOpen={activeModal === 'pets'}
        onClose={() => setActiveModal(null)}
        currentPet={engine.currentPet}
        onSelectPet={engine.setCurrentPet}
        currentMount={engine.currentMount}
        onSelectMount={engine.setCurrentMount}
      />

      <MvpArenaModal
        isOpen={activeModal === 'mvp'}
        onClose={() => setActiveModal(null)}
        onTeleportToArena={engine.switchZone}
      />

      <GuildWarModal
        isOpen={activeModal === 'guild'}
        onClose={() => setActiveModal(null)}
        onEnterCastle={engine.switchZone}
      />

      <OfflineRewardsModal
        isOpen={activeModal === 'offline'}
        onClose={() => setActiveModal(null)}
        rewards={engine.offlineRewards}
        onClaim={engine.claimOfflineRewards}
        onFastForward={engine.sweepOfflineBonus}
      />
    </main>
  );
}
