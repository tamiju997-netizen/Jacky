/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterClass,
  MobEntity,
  WeatherType,
  ZoneType
} from '../types/game';
import {
  createPlayerMesh,
  createPetMesh,
  createBaphometMesh,
  createAngelingMesh,
  createDevilingMesh,
  createPhreeoniMesh,
  createEmperiumMesh,
  createCastleTowerMesh,
  createFantasyTreeMesh,
  createFountainMesh,
  createCobbleTexture
} from './proceduralModels';

// Pre-allocated math objects to avoid garbage collection
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _camOffset = new THREE.Vector3(0, 16, 20);

export interface SceneCallbacks {
  onTargetMob: (mobId: string | null) => void;
  onPlayerPosition: (x: number, z: number) => void;
}

export class GameThreeScene {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private container: HTMLDivElement;

  // Environment & Lights
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private groundMesh: THREE.Mesh;

  // Actors
  public playerGroup: THREE.Group | null = null;
  public playerWeaponGroup: THREE.Group | null = null;
  public playerWingsGroup: THREE.Group | null = null;
  private petGroup: THREE.Group | null = null;
  
  // Mobs meshes map: mobId -> THREE.Group
  private mobMeshes = new Map<string, THREE.Group>();
  private mobAuras = new Map<string, THREE.Mesh>();
  private mobTelegraphs = new Map<string, THREE.Mesh>();

  // Zone specific props
  private zonePropsGroup: THREE.Group;

  // Weather particles
  private weatherParticles: THREE.Points | null = null;
  private weatherPositions: Float32Array | null = null;

  // Spell VFX & Hit Sparks
  private particlesGroup: THREE.Group;
  private activeSpellEffects: Array<{
    mesh: THREE.Object3D;
    lifespan: number;
    maxLifespan: number;
    velocity?: THREE.Vector3;
    rotSpeed?: number;
  }> = [];

  // Camera Shake & Hitstop
  private cameraShakeIntensity: number = 0;
  private hitstopTimer: number = 0;

  // State
  private currentZone: ZoneType = 'prontera_town';
  private currentWeather: WeatherType = 'sunny';
  private callbacks: SceneCallbacks;

  // Raycasting for targeting
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(container: HTMLDivElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 18, 22);
    this.camera.lookAt(0, 1, 0);

    // 4. Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Warm Key + Cool Fill)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.2);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfef08a, 2.0);
    this.dirLight.position.set(24, 38, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 100;
      const d = 26;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // 6. Ground Surface (High quality texturing)
    const cobbleTex = createCobbleTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: cobbleTex,
      roughness: 0.8,
      metalness: 0.15,
    });
    this.groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.groundMesh);

    // 7. Groups
    this.zonePropsGroup = new THREE.Group();
    this.scene.add(this.zonePropsGroup);

    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);

    // Init Props & Weather
    this.buildZoneEnvironment(this.currentZone);
    this.initWeatherParticles();

    // Event listeners
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointerdown', this.onPointerDown);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (event: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    
    // Check intersection with mob models
    const mobObjects: THREE.Object3D[] = [];
    this.mobMeshes.forEach((mesh) => mobObjects.push(mesh));

    const intersects = this.raycaster.intersectObjects(mobObjects, true);
    if (intersects.length > 0) {
      // Find top group
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && obj.parent && obj.parent !== this.scene) {
        if (obj.name && obj.name.startsWith('mob_')) {
          const mobId = obj.name.replace('mob_', '');
          this.callbacks.onTargetMob(mobId);
          return;
        }
        obj = obj.parent;
      }
    }
  };

  /**
   * Build world geometry for current zone
   */
  public buildZoneEnvironment(zone: ZoneType) {
    this.currentZone = zone;
    // Clear previous zone props
    while (this.zonePropsGroup.children.length > 0) {
      this.zonePropsGroup.remove(this.zonePropsGroup.children[0]);
    }

    if (zone === 'prontera_town') {
      this.scene.background = new THREE.Color(0x0f172a);
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.016);
      this.dirLight.color.setHex(0xfef08a);
      this.hemiLight.color.setHex(0xe0f2fe);

      // Central Fountain
      const fountain = createFountainMesh();
      fountain.group.position.set(0, 0, 0);
      this.zonePropsGroup.add(fountain.group);

      // 4 Surrounding Castle Towers
      const towerPositions = [
        [-24, -24],
        [24, -24],
        [-24, 24],
        [24, 24],
      ];
      towerPositions.forEach(([x, z]) => {
        const tower = createCastleTowerMesh();
        tower.position.set(x, 0, z);
        this.zonePropsGroup.add(tower);
      });

      // Decorative Town Trees & Merchant Pillars
      const treePositions = [
        [-12, -8],
        [12, -8],
        [-12, 8],
        [12, 8],
        [-16, 0],
        [16, 0],
      ];
      treePositions.forEach(([x, z]) => {
        const tree = createFantasyTreeMesh();
        tree.position.set(x, 0, z);
        this.zonePropsGroup.add(tree);
      });
    } else if (zone === 'whispering_forest') {
      this.scene.background = new THREE.Color(0x052e16);
      this.scene.fog = new THREE.FogExp2(0x052e16, 0.022);
      this.dirLight.color.setHex(0xa7f3d0);
      this.hemiLight.color.setHex(0x34d399);

      // Lush forest cluster
      for (let i = 0; i < 28; i++) {
        const angle = (i * Math.PI * 2) / 28;
        const radius = 14 + (i % 5) * 6;
        const tree = createFantasyTreeMesh();
        tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        tree.scale.setScalar(0.85 + Math.random() * 0.4);
        this.zonePropsGroup.add(tree);
      }
    } else if (zone === 'mvp_arena') {
      // Dark Molten Altar
      this.scene.background = new THREE.Color(0x450a0a);
      this.scene.fog = new THREE.FogExp2(0x450a0a, 0.024);
      this.dirLight.color.setHex(0xf87171);
      this.hemiLight.color.setHex(0xb91c1c);

      // Outer Demonic Spire Pillars
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const x = Math.cos(angle) * 22;
        const z = Math.sin(angle) * 22;
        const spire = new THREE.Mesh(
          new THREE.ConeGeometry(1.6, 12, 6),
          new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.8 })
        );
        spire.position.set(x, 6, z);
        spire.castShadow = true;
        this.zonePropsGroup.add(spire);
      }
    } else if (zone === 'guild_castle') {
      // Royal Throne Hall with Golden Emperium
      this.scene.background = new THREE.Color(0x1e1b4b);
      this.scene.fog = new THREE.FogExp2(0x1e1b4b, 0.018);
      this.dirLight.color.setHex(0xfde047);
      this.hemiLight.color.setHex(0x818cf8);

      const emperium = createEmperiumMesh();
      emperium.group.position.set(0, 0, 0);
      this.zonePropsGroup.add(emperium.group);

      // Castle Wall Pillars
      for (let x = -20; x <= 20; x += 10) {
        const p1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 0.9, 9, 8),
          new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.6, metalness: 0.4 })
        );
        p1.position.set(x, 4.5, -18);
        const p2 = p1.clone();
        p2.position.set(x, 4.5, 18);
        this.zonePropsGroup.add(p1, p2);
      }
    }
  }

  /**
   * Initialize dynamic weather particles (Cherry blossoms, twilight rain, aurora embers)
   */
  private initWeatherParticles() {
    const count = this.isSoftwareGl ? 120 : 350;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    this.weatherPositions = positions;
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xf472b6,
      size: 0.35,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.weatherParticles = new THREE.Points(geom, mat);
    this.scene.add(this.weatherParticles);
  }

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;
    if (!this.weatherParticles) return;
    const mat = this.weatherParticles.material as THREE.PointsMaterial;
    if (weather === 'cherry_blossom') {
      mat.color.setHex(0xf472b6);
      mat.size = 0.4;
    } else if (weather === 'holy_aurora') {
      mat.color.setHex(0xfef08a);
      mat.size = 0.45;
    } else if (weather === 'eclipse_storm') {
      mat.color.setHex(0xef4444);
      mat.size = 0.5;
    } else if (weather === 'twilight_fog') {
      mat.color.setHex(0x818cf8);
      mat.size = 0.3;
    } else {
      mat.color.setHex(0xffffff);
      mat.size = 0.25;
    }
  }

  /**
   * Set up or update player model
   */
  public updatePlayerModel(
    charClass: CharacterClass,
    hairColor: string,
    outfitColor: string,
    headgear: string,
    wingType: string,
    isMvpTransformed: boolean
  ) {
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }

    if (isMvpTransformed) {
      // Giant Baphomet Avatar when transformed!
      const bapho = createBaphometMesh();
      this.playerGroup = bapho.group;
      this.playerGroup.scale.setScalar(1.4);
      this.playerWeaponGroup = bapho.scythe;
    } else {
      const p = createPlayerMesh(charClass, hairColor, outfitColor, headgear, wingType);
      this.playerGroup = p.group;
      this.playerWeaponGroup = p.weaponGroup;
      this.playerWingsGroup = p.wingsGroup;
    }

    this.scene.add(this.playerGroup);
  }

  /**
   * Set up or update pet
   */
  public updatePetModel(type: 'poring' | 'desert_wolf' | 'dragon') {
    if (this.petGroup) {
      this.scene.remove(this.petGroup);
    }
    this.petGroup = createPetMesh(type);
    this.scene.add(this.petGroup);
  }

  /**
   * Sync mobs from game controller
   */
  public syncMobs(mobs: MobEntity[]) {
    const existingIds = new Set(this.mobMeshes.keys());
    const currentIds = new Set(mobs.map((m) => m.id));

    // Remove deleted mobs
    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const mesh = this.mobMeshes.get(id);
        if (mesh) {
          this.scene.remove(mesh);
          this.mobMeshes.delete(id);
        }
        const aura = this.mobAuras.get(id);
        if (aura) {
          this.scene.remove(aura);
          this.mobAuras.delete(id);
        }
        const tele = this.mobTelegraphs.get(id);
        if (tele) {
          this.scene.remove(tele);
          this.mobTelegraphs.delete(id);
        }
      }
    });

    // Create or update mobs
    mobs.forEach((mob) => {
      if (mob.state === 'dead') {
        const mesh = this.mobMeshes.get(mob.id);
        if (mesh) {
          this.scene.remove(mesh);
          this.mobMeshes.delete(mob.id);
        }
        return;
      }

      let mesh = this.mobMeshes.get(mob.id);
      if (!mesh) {
        // Construct boss or mob mesh
        if (mob.type === 'baphomet') {
          const b = createBaphometMesh();
          mesh = b.group;
          this.mobAuras.set(mob.id, b.aura);
        } else if (mob.type === 'angeling') {
          const a = createAngelingMesh();
          mesh = a.group;
        } else if (mob.type === 'deviling') {
          const d = createDevilingMesh();
          mesh = d.group;
        } else if (mob.type === 'phreeoni') {
          const p = createPhreeoniMesh();
          mesh = p.group;
        } else if (mob.type === 'emperium') {
          const e = createEmperiumMesh();
          mesh = e.group;
        } else {
          // Regular mob: Poring / Lunatic / Skeleton
          mesh = new THREE.Group();
          if (mob.type === 'poring') {
            const p = createPetMesh('poring');
            p.scale.setScalar(1.2);
            mesh.add(p);
          } else if (mob.type === 'lunatic') {
            const l = createPetMesh('desert_wolf');
            l.scale.setScalar(1.1);
            mesh.add(l);
          } else {
            // Skeleton
            const sMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7, metalness: 0.1 });
            const sTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.8, 6), sMat);
            sTorso.position.set(0, 0.9, 0);
            const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), sMat);
            sHead.position.set(0, 1.5, 0);
            mesh.add(sTorso, sHead);
          }
        }

        mesh.name = `mob_${mob.id}`;
        this.scene.add(mesh);
        this.mobMeshes.set(mob.id, mesh);

        // Add ground telegraph circle for boss AOE windups
        const teleGeom = new THREE.RingGeometry(0.2, 3.5, 24);
        const teleMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const teleMesh = new THREE.Mesh(teleGeom, teleMat);
        teleMesh.rotation.x = -Math.PI / 2;
        teleMesh.position.set(mob.x, 0.05, mob.z);
        this.scene.add(teleMesh);
        this.mobTelegraphs.set(mob.id, teleMesh);
      }

      // Update position & rotation
      mesh.position.set(mob.x, 0, mob.z);
      mesh.rotation.y = mob.rotation;

      // Update telegraph indicator if charging skill
      const tele = this.mobTelegraphs.get(mob.id);
      if (tele) {
        tele.position.set(mob.x, 0.05, mob.z);
        const teleMat = tele.material as THREE.MeshBasicMaterial;
        if (mob.telegraphProgress && mob.telegraphProgress > 0) {
          teleMat.opacity = Math.min(0.85, mob.telegraphProgress * 1.2);
          const s = (mob.telegraphRadius || 4) / 3.5;
          tele.scale.set(s, s, s);
        } else {
          teleMat.opacity = 0;
        }
      }
    });
  }

  /**
   * Spawn Visual Effect: Spell Cast, Hit Flash, or Boss Roar
   */
  public spawnSkillVfx(
    type: 'slash' | 'bash' | 'firebolt' | 'meteor' | 'heal' | 'holy_light' | 'boss_quake',
    originX: number,
    originZ: number,
    targetX?: number,
    targetZ?: number
  ) {
    if (type === 'firebolt' || type === 'meteor') {
      // Flaming fireball falling or streaking
      const fireMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: new THREE.Color(0xd97706),
        emissiveIntensity: 1.0,
      });
      const fireball = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), fireMat);
      fireball.position.set(targetX ?? originX, 6, targetZ ?? originZ);
      this.particlesGroup.add(fireball);

      this.activeSpellEffects.push({
        mesh: fireball,
        lifespan: 0.45,
        maxLifespan: 0.45,
        velocity: new THREE.Vector3(0, -14, 0),
        rotSpeed: 8,
      });
    } else if (type === 'holy_light' || type === 'heal') {
      // Golden Celestial Beam
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.85,
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 12), beamMat);
      beam.position.set(originX, 6, originZ);
      this.particlesGroup.add(beam);

      this.activeSpellEffects.push({
        mesh: beam,
        lifespan: 0.5,
        maxLifespan: 0.5,
        rotSpeed: 3,
      });
    } else if (type === 'slash' || type === 'bash') {
      // Crescent Slash Arc
      const slashMat = new THREE.MeshBasicMaterial({
        color: type === 'bash' ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const slashArc = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.8, 16, 1, 0, Math.PI * 0.9), slashMat);
      slashArc.position.set(originX, 1.2, originZ);
      slashArc.rotation.x = Math.PI / 2;
      this.particlesGroup.add(slashArc);

      this.activeSpellEffects.push({
        mesh: slashArc,
        lifespan: 0.25,
        maxLifespan: 0.25,
        rotSpeed: 12,
      });
    } else if (type === 'boss_quake') {
      // Expanding dark shockwave ring
      const quakeMat = new THREE.MeshBasicMaterial({
        color: 0xdc2626,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const quake = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.2, 24), quakeMat);
      quake.position.set(originX, 0.1, originZ);
      quake.rotation.x = -Math.PI / 2;
      this.particlesGroup.add(quake);

      this.activeSpellEffects.push({
        mesh: quake,
        lifespan: 0.6,
        maxLifespan: 0.6,
      });
      this.triggerCameraShake(0.8);
    }
  }

  public triggerCameraShake(intensity = 0.5) {
    this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, intensity);
  }

  public triggerHitstop(duration = 0.06) {
    this.hitstopTimer = duration;
  }

  /**
   * Main Simulation Loop
   */
  public update(dt: number, playerX: number, playerZ: number, playerRot: number, isMoving: boolean) {
    // Clamp delta time as per game craft guideline
    const clampedDt = Math.min(dt, 0.05);

    // Hitstop check
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= clampedDt;
      return;
    }

    // 1. Update Player position and walk cycle
    if (this.playerGroup) {
      this.playerGroup.position.set(playerX, 0, playerZ);
      this.playerGroup.rotation.y = playerRot;

      if (isMoving) {
        const time = performance.now() * 0.008;
        this.playerGroup.position.y = Math.abs(Math.sin(time)) * 0.12;
      } else {
        this.playerGroup.position.y = 0;
      }

      // Wings gentle flapping
      if (this.playerWingsGroup) {
        const flap = Math.sin(performance.now() * 0.005) * 0.15;
        this.playerWingsGroup.children.forEach((w, idx) => {
          w.rotation.y = idx === 0 ? 0.3 + flap : -0.3 - flap;
        });
      }
    }

    // 2. Pet follow with cute hopping
    if (this.petGroup) {
      _vec3A.set(playerX - Math.sin(playerRot) * 1.6, 0, playerZ - Math.cos(playerRot) * 1.6);
      this.petGroup.position.lerp(_vec3A, clampedDt * 4.5);
      this.petGroup.position.y = Math.abs(Math.sin(performance.now() * 0.007)) * 0.25;
      this.petGroup.lookAt(playerX, 0.3, playerZ);
    }

    // 3. Smooth Camera Follow with screen shake
    _targetPos.set(playerX, 0, playerZ).add(_camOffset);
    this.camera.position.lerp(_targetPos, clampedDt * 4.0);

    // Apply decaying camera shake
    if (this.cameraShakeIntensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.8;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.8;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - clampedDt * 2.2);
    }

    this.camera.lookAt(playerX, 1.2, playerZ);

    // 4. Weather Particles motion
    if (this.weatherParticles && this.weatherPositions) {
      const count = this.weatherPositions.length / 3;
      for (let i = 0; i < count; i++) {
        let y = this.weatherPositions[i * 3 + 1];
        y -= clampedDt * 4.0;
        if (y < 0) y = 25;
        this.weatherPositions[i * 3 + 1] = y;
      }
      this.weatherParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Active Spells & VFX decay
    for (let i = this.activeSpellEffects.length - 1; i >= 0; i--) {
      const fx = this.activeSpellEffects[i];
      fx.lifespan -= clampedDt;

      if (fx.velocity) {
        fx.mesh.position.addScaledVector(fx.velocity, clampedDt);
      }
      if (fx.rotSpeed) {
        fx.mesh.rotation.y += fx.rotSpeed * clampedDt;
      }

      // Scale or fade out
      const progress = fx.lifespan / fx.maxLifespan;
      if (fx.mesh instanceof THREE.Mesh && fx.mesh.material && 'opacity' in fx.mesh.material) {
        fx.mesh.material.opacity = progress;
      }

      if (fx.lifespan <= 0) {
        this.particlesGroup.remove(fx.mesh);
        this.activeSpellEffects.splice(i, 1);
      }
    }

    // 6. Rotate Boss Ground Auras
    this.mobAuras.forEach((aura) => {
      aura.rotation.z += clampedDt * 0.6;
    });

    // 7. Render scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
  }
}

const _targetPos = new THREE.Vector3();
