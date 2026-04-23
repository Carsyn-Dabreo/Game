import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { Player } from './engine/PlayerControls.js';
import { World } from './engine/WorldGen.js';
import { TaskManager } from './engine/TaskManager.js';
import { UIManager } from './ui/UIManager.js';

class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.uiManager = new UIManager((avatar) => this.initGame(avatar));
    this.initialized = false;
  }

  initGame(avatar) {
    if (this.initialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 0.85));

    this.world = new World(this.scene);
    this.player = new Player(this.scene, this.camera, this.renderer.domElement, this.world.colliders, avatar);
    this.taskManager = new TaskManager(this.player);

    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', (e) => this.handleGlobalInput(e));

    this.initialized = true;
    this.animate();
  }

  onResize() {
    if (!this.initialized) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  handleGlobalInput(e) {
    if (!this.initialized) return;
    if (e.code === 'KeyE') this.checkInteractions();
  }

  checkInteractions() {
    const playerPos = this.player.mesh.position;
    for (let inter of this.world.interactables) {
      if (Math.hypot(playerPos.x - inter.x, playerPos.z - inter.z) < 10) {
        this.taskManager.showTask(inter);
        break;
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.player.update(delta);
    this.world.update(delta, time);
    this.taskManager.updateHUD(this.world);
    
    this.composer.render();
  }
}

new Game();
