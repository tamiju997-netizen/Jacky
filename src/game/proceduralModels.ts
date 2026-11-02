/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterClass } from '../types/game';

// Shared Materials & Geometries Cache for Zero-Lag Instantiation
const materialsCache = new Map<string, THREE.Material>();

function getStandardMaterial(key: string, params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  if (!materialsCache.has(key)) {
    materialsCache.set(key, new THREE.MeshStandardMaterial(params));
  }
  return materialsCache.get(key) as THREE.MeshStandardMaterial;
}

// Procedural texture for eyes & face details
function createFaceTexture(isHappy = true, isAngry = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Skin tone base
  ctx.fillStyle = '#ffdfc4';
  ctx.fillRect(0, 0, 256, 256);

  // Big Anime Eyes
  const eyeColor = '#2563eb';
  const drawEye = (x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 24, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 16, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 5, 0, Math.PI * 2);
    ctx.arc(x + 5, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eyelash
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y - 8, 22, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  };

  drawEye(85, 120);
  drawEye(171, 120);

  // Cute blush cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.ellipse(75, 165, 18, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(181, 165, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (isAngry) {
    ctx.arc(128, 195, 16, Math.PI * 1.2, Math.PI * 1.8);
  } else {
    ctx.arc(128, 175, 12, 0.2, Math.PI - 0.2);
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural stone texture for medieval walls & floors
export function createCobbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  // Cobblestone tiles
  const tileSize = 64;
  for (let y = 0; y < 512; y += tileSize) {
    const offsetX = (y / tileSize) % 2 === 0 ? 0 : tileSize / 2;
    for (let x = -tileSize; x < 512 + tileSize; x += tileSize) {
      const shade = Math.floor(60 + Math.random() * 35);
      ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
      ctx.fillRect(x + offsetX + 3, y + 3, tileSize - 6, tileSize - 6);
      
      // highlight edge
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + offsetX + 3, y + 3, tileSize - 6, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Player Character Model (Composite 3-12 parts)
 */
export function createPlayerMesh(
  charClass: CharacterClass,
  hairColor = '#f59e0b',
  outfitColor = '#3b82f6',
  headgear = 'none',
  wingType = 'none'
): { group: THREE.Group; weaponGroup: THREE.Group; wingsGroup: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'player';

  // 1. Legs & Boots (Pivoted from bottom)
  const bootMat = getStandardMaterial('player_boot', { color: 0x475569, roughness: 0.8, metalness: 0.1 });
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 8), bootMat);
  leftLeg.position.set(-0.2, 0.3, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 8), bootMat);
  rightLeg.position.set(0.2, 0.3, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // 2. Torso & Armor (Primary silhouette)
  const armorMat = getStandardMaterial(`player_outfit_${outfitColor}`, {
    color: new THREE.Color(outfitColor),
    roughness: 0.45,
    metalness: 0.35,
  });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.7, 8), armorMat);
  torso.position.set(0, 0.85, 0);
  torso.castShadow = true;
  group.add(torso);

  // Chestplate / Gold trim
  const trimMat = getStandardMaterial('gold_trim', { color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.32), trimMat);
  chestPlate.position.set(0, 0.95, 0.05);
  chestPlate.castShadow = true;
  group.add(chestPlate);

  // Pauldrons (Shoulders)
  const leftPaul = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), trimMat);
  leftPaul.position.set(-0.35, 1.12, 0);
  leftPaul.castShadow = true;
  group.add(leftPaul);

  const rightPaul = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), trimMat);
  rightPaul.position.set(0.35, 1.12, 0);
  rightPaul.castShadow = true;
  group.add(rightPaul);

  // 3. Head & Anime Face
  const faceTexture = createFaceTexture(true);
  const headMat = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.6,
    metalness: 0.05,
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), headMat);
  head.position.set(0, 1.48, 0);
  head.rotation.y = -Math.PI / 2; // Face forward
  head.castShadow = true;
  group.add(head);

  // 4. Hair Mesh
  const hairMat = getStandardMaterial(`player_hair_${hairColor}`, {
    color: new THREE.Color(hairColor),
    roughness: 0.7,
    metalness: 0.1,
  });
  const hairTop = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.45, 7), hairMat);
  hairTop.position.set(0, 1.76, -0.05);
  hairTop.rotation.x = -0.2;
  hairTop.castShadow = true;
  group.add(hairTop);

  // Hair bangs
  const bangs = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 5), hairMat);
  bangs.position.set(0, 1.62, 0.22);
  bangs.rotation.x = 0.5;
  group.add(bangs);

  // 5. Weapon Rig according to Class
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0.4, 0.85, 0.2);

  if (charClass === 'Swordsman') {
    // Zweihander Greatsword
    const bladeMat = getStandardMaterial('steel_blade', { color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.04), bladeMat);
    blade.position.set(0, 0.55, 0);
    blade.castShadow = true;

    const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.08), trimMat);
    crossguard.position.set(0, -0.05, 0);

    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), bootMat);
    hilt.position.set(0, -0.22, 0);

    weaponGroup.add(blade, crossguard, hilt);
  } else if (charClass === 'Mage') {
    // Arcane Wizard Staff
    const staffWood = getStandardMaterial('staff_wood', { color: 0x78350f, roughness: 0.8, metalness: 0.1 });
    const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), staffWood);
    staffPole.castShadow = true;

    // Glowing Mana Orb
    const orbMat = getStandardMaterial('mana_orb', {
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), orbMat);
    orb.position.set(0, 0.75, 0);

    weaponGroup.add(staffPole, orb);
  } else if (charClass === 'Archer') {
    // Hunter Bow
    const bowWood = getStandardMaterial('bow_wood', { color: 0x9a3412, roughness: 0.6, metalness: 0.2 });
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.6, -0.1),
      new THREE.Vector3(0, 0, 0.25),
      new THREE.Vector3(0, 0.6, -0.1)
    );
    const bowGeom = new THREE.TubeGeometry(curve, 12, 0.035, 6, false);
    const bowMesh = new THREE.Mesh(bowGeom, bowWood);
    bowMesh.castShadow = true;
    weaponGroup.add(bowMesh);
  } else if (charClass === 'Thief') {
    // Twin Daggers
    const daggerMat = getStandardMaterial('poison_dagger', {
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(0x047857),
      emissiveIntensity: 0.3,
    });
    const dagger1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.03), daggerMat);
    dagger1.position.set(0, 0.2, 0);
    weaponGroup.add(dagger1);
  } else {
    // Acolyte Holy Cross Mace
    const macePole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), trimMat);
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.06), trimMat);
    crossBar.position.set(0, 0.45, 0);
    const crossTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), trimMat);
    crossTop.position.set(0, 0.52, 0);
    weaponGroup.add(macePole, crossBar, crossTop);
  }

  group.add(weaponGroup);

  // 6. Wings (Angelic / Demonic / None)
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 1.1, -0.18);

  if (wingType === 'angel') {
    const angelWingMat = getStandardMaterial('angel_wing', {
      color: 0xffffff,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.1,
    });
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.04), angelWingMat);
    leftWing.position.set(-0.45, 0.2, 0);
    leftWing.rotation.z = 0.4;
    leftWing.rotation.y = 0.3;

    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.04), angelWingMat);
    rightWing.position.set(0.45, 0.2, 0);
    rightWing.rotation.z = -0.4;
    rightWing.rotation.y = -0.3;

    wingsGroup.add(leftWing, rightWing);
  } else if (wingType === 'demon') {
    const demonWingMat = getStandardMaterial('demon_wing', {
      color: 0x4c1d95,
      roughness: 0.5,
      metalness: 0.4,
    });
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), demonWingMat);
    leftWing.position.set(-0.5, 0.25, 0);
    leftWing.rotation.z = 0.8;

    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), demonWingMat);
    rightWing.position.set(0.5, 0.25, 0);
    rightWing.rotation.z = -0.8;

    wingsGroup.add(leftWing, rightWing);
  }
  group.add(wingsGroup);

  // 7. Headgear (Valkyrie Helm / Bunny Ears / Goat Horns)
  if (headgear === 'valkyrie') {
    const valkMat = getStandardMaterial('valk_helm', { color: 0xffffff, metalness: 0.9, roughness: 0.15 });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.03), valkMat);
    wingL.position.set(-0.35, 1.65, 0);
    wingL.rotation.z = 0.4;
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.03), valkMat);
    wingR.position.set(0.35, 1.65, 0);
    wingR.rotation.z = -0.4;
    group.add(wingL, wingR);
  } else if (headgear === 'horns') {
    const hornMat = getStandardMaterial('goat_horns', { color: 0x1e293b, roughness: 0.3, metalness: 0.6 });
    const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 1.1), hornMat);
    hornL.position.set(-0.32, 1.68, 0);
    hornL.rotation.y = Math.PI / 2;
    const hornR = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 1.1), hornMat);
    hornR.position.set(0.32, 1.68, 0);
    hornR.rotation.y = -Math.PI / 2;
    group.add(hornL, hornR);
  }

  return { group, weaponGroup, wingsGroup };
}

/**
 * Procedural Cute Companion Pet (Poring or Wolf Pup)
 */
export function createPetMesh(type: 'poring' | 'desert_wolf' | 'dragon'): THREE.Group {
  const group = new THREE.Group();
  group.name = `pet_${type}`;

  if (type === 'poring') {
    const poringMat = getStandardMaterial('poring_pink', {
      color: 0xf472b6,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    });
    // Slime drop body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), poringMat);
    body.scale.set(1.15, 0.9, 1.15);
    body.position.set(0, 0.28, 0);
    body.castShadow = true;
    group.add(body);

    // Eyes
    const eyeMat = getStandardMaterial('pet_eye', { color: 0x111827, roughness: 0.2, metalness: 0.8 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeL.position.set(-0.1, 0.32, 0.28);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeR.position.set(0.1, 0.32, 0.28);
    group.add(eyeL, eyeR);

    // Sweet blush
    const blushMat = getStandardMaterial('pet_blush', { color: 0xf43f5e, roughness: 0.8, metalness: 0 });
    const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), blushMat);
    blushL.position.set(-0.16, 0.26, 0.29);
    blushL.rotation.y = -0.3;
    const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), blushMat);
    blushR.position.set(0.16, 0.26, 0.29);
    blushR.rotation.y = 0.3;
    group.add(blushL, blushR);
  } else {
    // Baby Wolf
    const wolfMat = getStandardMaterial('wolf_fur', { color: 0xd97706, roughness: 0.7, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.5), wolfMat);
    body.position.set(0, 0.3, 0);
    body.castShadow = true;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), wolfMat);
    head.position.set(0, 0.45, 0.3);

    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), wolfMat);
    earL.position.set(-0.1, 0.62, 0.3);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), wolfMat);
    earR.position.set(0.1, 0.62, 0.3);

    group.add(body, head, earL, earR);
  }

  return group;
}

/**
 * Procedural MVP Boss: Baphomet
 * 10+ distinct parts, towering silhouette, scythe, glowing crimson eyes, dark pentagram
 */
export function createBaphometMesh(): { group: THREE.Group; scythe: THREE.Group; aura: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = 'mvp_baphomet';

  const demonMat = getStandardMaterial('bapho_skin', {
    color: 0x1c1917,
    roughness: 0.4,
    metalness: 0.4,
  });
  const hornMat = getStandardMaterial('bapho_horns', {
    color: 0x7f1d1d,
    roughness: 0.25,
    metalness: 0.7,
  });
  const crimsonGlowMat = getStandardMaterial('bapho_glow', {
    color: 0xef4444,
    emissive: new THREE.Color(0xdc2626),
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.2,
  });

  // 1. Hooves & Muscular Legs
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 8), demonMat);
  legL.position.set(-0.55, 0.7, 0);
  legL.castShadow = true;
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 8), demonMat);
  legR.position.set(0.55, 0.7, 0);
  legR.castShadow = true;
  group.add(legL, legR);

  // 2. Muscular Torso & Spines
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 1.6, 8), demonMat);
  torso.position.set(0, 2.0, 0);
  torso.castShadow = true;
  group.add(torso);

  // Skull belt buckle
  const skullBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.2), crimsonGlowMat);
  skullBuckle.position.set(0, 1.35, 0.65);
  group.add(skullBuckle);

  // Shoulder Demon Spikes
  const spikeL = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 6), hornMat);
  spikeL.position.set(-1.1, 2.7, 0);
  spikeL.rotation.z = 0.6;
  const spikeR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 6), hornMat);
  spikeR.position.set(1.1, 2.7, 0);
  spikeR.rotation.z = -0.6;
  group.add(spikeL, spikeR);

  // 3. Goat Skull Head & Eyes
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 7), demonMat);
  head.position.set(0, 3.1, 0.1);
  head.rotation.x = 0.4;
  head.castShadow = true;
  group.add(head);

  // Glowing red eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), crimsonGlowMat);
  eyeL.position.set(-0.25, 3.1, 0.45);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), crimsonGlowMat);
  eyeR.position.set(0.25, 3.1, 0.45);
  group.add(eyeL, eyeR);

  // 4. Giant Curled Goat Horns
  const hornGeom = new THREE.TorusGeometry(0.65, 0.14, 8, 20, Math.PI * 1.2);
  const hornMeshL = new THREE.Mesh(hornGeom, hornMat);
  hornMeshL.position.set(-0.7, 3.5, -0.1);
  hornMeshL.rotation.y = Math.PI / 2 + 0.3;
  hornMeshL.rotation.z = -0.2;

  const hornMeshR = new THREE.Mesh(hornGeom, hornMat);
  hornMeshR.position.set(0.7, 3.5, -0.1);
  hornMeshR.rotation.y = -Math.PI / 2 - 0.3;
  hornMeshR.rotation.z = 0.2;
  group.add(hornMeshL, hornMeshR);

  // 5. Giant Reaper Scythe
  const scythe = new THREE.Group();
  scythe.position.set(1.3, 2.0, 0.4);

  const shaftMat = getStandardMaterial('scythe_shaft', { color: 0x292524, roughness: 0.8, metalness: 0.2 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8), shaftMat);
  shaft.castShadow = true;
  scythe.add(shaft);

  // Curved Reaper Blade
  const bladeCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 1.8, 0),
    new THREE.Vector3(0.9, 2.1, 0),
    new THREE.Vector3(1.7, 1.2, 0)
  );
  const scytheBladeGeom = new THREE.TubeGeometry(bladeCurve, 12, 0.12, 5, false);
  const scytheBlade = new THREE.Mesh(scytheBladeGeom, crimsonGlowMat);
  scytheBlade.castShadow = true;
  scythe.add(scytheBlade);

  group.add(scythe);

  // 6. Ground Pentagram Aura Decal
  const auraCanvas = document.createElement('canvas');
  auraCanvas.width = 256;
  auraCanvas.height = 256;
  const aCtx = auraCanvas.getContext('2d')!;
  aCtx.clearRect(0, 0, 256, 256);
  aCtx.strokeStyle = '#dc2626';
  aCtx.lineWidth = 6;
  aCtx.beginPath();
  aCtx.arc(128, 128, 115, 0, Math.PI * 2);
  aCtx.stroke();
  // 5-point star
  aCtx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = 128 + 115 * Math.cos(angle);
    const y = 128 + 115 * Math.sin(angle);
    if (i === 0) aCtx.moveTo(x, y);
    else aCtx.lineTo(x, y);
  }
  aCtx.closePath();
  aCtx.stroke();

  const auraTex = new THREE.CanvasTexture(auraCanvas);
  const auraMat = new THREE.MeshBasicMaterial({
    map: auraTex,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.0), auraMat);
  aura.rotation.x = -Math.PI / 2;
  aura.position.set(0, 0.05, 0);
  group.add(aura);

  return { group, scythe, aura };
}

/**
 * Procedural MVP Boss: Angeling (Giant holy winged poring with halo)
 */
export function createAngelingMesh(): { group: THREE.Group; halo: THREE.Mesh; wings: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'mvp_angeling';

  const bodyMat = getStandardMaterial('angeling_body', {
    color: 0xfb7185,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
  });
  // Giant sphere
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 24), bodyMat);
  body.scale.set(1.2, 0.95, 1.2);
  body.position.set(0, 1.4, 0);
  body.castShadow = true;
  group.add(body);

  // Cute Big Eyes
  const eyeMat = getStandardMaterial('angel_eyes', { color: 0x1e293b, roughness: 0.2, metalness: 0.5 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), eyeMat);
  eyeL.position.set(-0.55, 1.55, 1.45);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), eyeMat);
  eyeR.position.set(0.55, 1.55, 1.45);
  group.add(eyeL, eyeR);

  // Golden Floating Halo
  const haloMat = getStandardMaterial('angel_halo', {
    color: 0xfef08a,
    emissive: new THREE.Color(0xfacc15),
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.9,
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 12, 32), haloMat);
  halo.position.set(0, 3.1, 0);
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  // Large White Feathery Angel Wings
  const wings = new THREE.Group();
  wings.position.set(0, 1.7, -0.6);

  const featherMat = getStandardMaterial('angel_feathers', {
    color: 0xffffff,
    emissive: new THREE.Color(0xfffbeb),
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.1,
  });
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.1), featherMat);
  wingL.position.set(-1.4, 0.4, 0);
  wingL.rotation.z = 0.35;
  wingL.rotation.y = 0.3;
  wingL.castShadow = true;

  const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.1), featherMat);
  wingR.position.set(1.4, 0.4, 0);
  wingR.rotation.z = -0.35;
  wingR.rotation.y = -0.3;
  wingR.castShadow = true;

  wings.add(wingL, wingR);
  group.add(wings);

  return { group, halo, wings };
}

/**
 * Procedural MVP Boss: Deviling (Dark bat-winged demon poring)
 */
export function createDevilingMesh(): { group: THREE.Group; wings: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'mvp_deviling';

  const bodyMat = getStandardMaterial('deviling_body', {
    color: 0x581c87,
    roughness: 0.25,
    metalness: 0.3,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 20), bodyMat);
  body.scale.set(1.2, 0.95, 1.2);
  body.position.set(0, 1.35, 0);
  body.castShadow = true;
  group.add(body);

  // Demon Eyes
  const eyeMat = getStandardMaterial('devil_eyes', {
    color: 0xef4444,
    emissive: new THREE.Color(0xb91c1c),
    emissiveIntensity: 0.8,
  });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), eyeMat);
  eyeL.position.set(-0.5, 1.5, 1.4);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), eyeMat);
  eyeR.position.set(0.5, 1.5, 1.4);
  group.add(eyeL, eyeR);

  // Curved Devil Horns
  const hornMat = getStandardMaterial('devil_horns', { color: 0x18181b, roughness: 0.3, metalness: 0.6 });
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), hornMat);
  hornL.position.set(-0.7, 2.7, 0.2);
  hornL.rotation.z = 0.5;
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), hornMat);
  hornR.position.set(0.7, 2.7, 0.2);
  hornR.rotation.z = -0.5;
  group.add(hornL, hornR);

  // Bat Wings
  const wings = new THREE.Group();
  wings.position.set(0, 1.6, -0.6);

  const wingMat = getStandardMaterial('bat_wing', { color: 0x2e1065, roughness: 0.6, metalness: 0.2 });
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.08), wingMat);
  wingL.position.set(-1.3, 0.3, 0);
  wingL.rotation.z = 0.45;
  wingL.rotation.y = 0.25;

  const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.08), wingMat);
  wingR.position.set(1.3, 0.3, 0);
  wingR.rotation.z = -0.45;
  wingR.rotation.y = -0.25;

  wings.add(wingL, wingR);
  group.add(wings);

  return { group, wings };
}

/**
 * Procedural MVP Boss: Phreeoni (Subterranean Colossal Desert Devourer)
 */
export function createPhreeoniMesh(): { group: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'mvp_phreeoni';

  const wormSkin = getStandardMaterial('phreeoni_skin', {
    color: 0x713f12,
    roughness: 0.8,
    metalness: 0.1,
  });
  const mouthMat = getStandardMaterial('phreeoni_mouth', {
    color: 0x991b1b,
    roughness: 0.3,
    metalness: 0.1,
  });
  const toothMat = getStandardMaterial('phreeoni_teeth', {
    color: 0xfef3c7,
    roughness: 0.2,
    metalness: 0.8,
  });

  // 6 Segmented rings arching up from ground
  for (let i = 0; i < 6; i++) {
    const size = 1.6 - i * 0.18;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(size, size * 1.1, 0.7, 12), wormSkin);
    ring.position.set(0, 0.35 + i * 0.6, -i * 0.4);
    ring.rotation.x = 0.2 + i * 0.05;
    ring.castShadow = true;
    group.add(ring);
  }

  // Gaping Maw Head
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.35, 12, 16), mouthMat);
  mouth.position.set(0, 3.8, -1.8);
  mouth.rotation.x = Math.PI / 3;
  mouth.castShadow = true;
  group.add(mouth);

  // Tooth ring (8 sharp fangs)
  for (let t = 0; t < 8; t++) {
    const angle = (t * Math.PI * 2) / 8;
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4), toothMat);
    fang.position.set(Math.cos(angle) * 1.1, 3.8 + Math.sin(angle) * 0.7, -1.8);
    fang.rotation.z = angle + Math.PI / 2;
    group.add(fang);
  }

  return { group };
}

/**
 * Procedural Guild Emperium (Golden crystal core)
 */
export function createEmperiumMesh(): { group: THREE.Group; crystal: THREE.Mesh; ring: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = 'guild_emperium';

  // Base Pedestal
  const baseMat = getStandardMaterial('emperium_base', { color: 0x334155, roughness: 0.6, metalness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 0.6, 12), baseMat);
  base.position.set(0, 0.3, 0);
  base.castShadow = true;
  group.add(base);

  // Floating Golden Crystal Core
  const crystalMat = getStandardMaterial('emperium_crystal', {
    color: 0xfef08a,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.7,
    roughness: 0.1,
    metalness: 0.9,
  });
  const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), crystalMat);
  crystal.position.set(0, 2.0, 0);
  crystal.scale.set(0.9, 1.8, 0.9);
  crystal.castShadow = true;
  group.add(crystal);

  // Rotating Magic Halo Ring
  const ringMat = getStandardMaterial('emperium_ring', {
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.06, 8, 32), ringMat);
  ring.position.set(0, 2.0, 0);
  group.add(ring);

  return { group, crystal, ring };
}

/**
 * Procedural Medieval Castle Tower
 */
export function createCastleTowerMesh(): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = getStandardMaterial('tower_stone', { color: 0x475569, roughness: 0.85, metalness: 0.1 });
  const roofMat = getStandardMaterial('tower_roof', { color: 0x991b1b, roughness: 0.6, metalness: 0.2 });

  // Main Cylinder Tower
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 10, 14), stoneMat);
  tower.position.set(0, 5, 0);
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);

  // Conical Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 4.0, 14), roofMat);
  roof.position.set(0, 12, 0);
  roof.castShadow = true;
  group.add(roof);

  // Gold Banner Spire
  const spireMat = getStandardMaterial('spire_gold', { color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), spireMat);
  spire.position.set(0, 14.5, 0);
  group.add(spire);

  return group;
}

/**
 * Procedural Ancient Fantasy Tree
 */
export function createFantasyTreeMesh(): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = getStandardMaterial('tree_trunk', { color: 0x451a03, roughness: 0.9, metalness: 0.05 });
  const leavesMat = getStandardMaterial('tree_leaves', { color: 0x15803d, roughness: 0.7, metalness: 0.1 });

  // Gnarled Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 3.5, 8), trunkMat);
  trunk.position.set(0, 1.75, 0);
  trunk.castShadow = true;
  group.add(trunk);

  // 3 Layered Foliage Canopies
  const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.5, 7), leavesMat);
  foliage1.position.set(0, 3.8, 0);
  foliage1.castShadow = true;

  const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.0, 7), leavesMat);
  foliage2.position.set(0, 5.0, 0);
  foliage2.castShadow = true;

  const foliage3 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 7), leavesMat);
  foliage3.position.set(0, 6.0, 0);
  foliage3.castShadow = true;

  group.add(foliage1, foliage2, foliage3);
  return group;
}

/**
 * Procedural Town Fountain
 */
export function createFountainMesh(): { group: THREE.Group; waterMesh: THREE.Mesh } {
  const group = new THREE.Group();
  const stoneMat = getStandardMaterial('fountain_stone', { color: 0x64748b, roughness: 0.7, metalness: 0.2 });
  const waterMat = getStandardMaterial('fountain_water', {
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8,
  });

  // Basin
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.2, 0.8, 16), stoneMat);
  basin.position.set(0, 0.4, 0);
  basin.castShadow = true;
  group.add(basin);

  // Water pool
  const water = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.1, 16), waterMat);
  water.position.set(0, 0.75, 0);
  group.add(water);

  // Center column
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.2, 12), stoneMat);
  column.position.set(0, 1.4, 0);
  column.castShadow = true;
  group.add(column);

  return { group, waterMesh: water };
}
