import * as THREE from 'three';

export class UIManager {
  constructor(onStartGame) {
    this.onStartGame = onStartGame;
    this.loginScreen = document.getElementById('login-screen');
    this.avatarScreen = document.getElementById('avatar-screen');
    this.uiLayer = document.getElementById('ui-layer');
    this.previewContainer = document.getElementById('avatar-preview-container');
    
    this.avatars = [
      { id: 'infiltrator', name: 'INFILTRATOR', color: 0x00f0ff },
      { id: 'technician', name: 'TECHNICIAN', color: 0x39ff14 },
      { id: 'enforcer', name: 'ENFORCER', color: 0xff2d7c }
    ];
    this.currentAvatarIndex = 0;
    
    this.initPreviewScene();
    this.initEvents();
  }

  initPreviewScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 800 / 400, 0.1, 100);
    this.camera.position.set(0, 1.8, 5);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(800, 400);
    this.previewContainer.appendChild(this.renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 20, 10);
    light.position.set(2, 2, 2);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    this.previewMesh = new THREE.Group();
    this.scene.add(this.previewMesh);
    
    this.animatePreview();
  }

  initEvents() {
    document.getElementById('login-btn').onclick = () => this.showAvatarSelection();
    document.getElementById('start-game-btn').onclick = () => this.startGame();
    document.getElementById('prev-avatar').onclick = () => this.cycleAvatar(-1);
    document.getElementById('next-avatar').onclick = () => this.cycleAvatar(1);
  }

  showAvatarSelection() {
    this.loginScreen.classList.add('hidden');
    this.avatarScreen.classList.remove('hidden');
    this.updateAvatarPreview();
  }

  cycleAvatar(dir) {
    this.currentAvatarIndex = (this.currentAvatarIndex + dir + this.avatars.length) % this.avatars.length;
    this.updateAvatarPreview();
  }

  updateAvatarPreview() {
    const avatar = this.avatars[this.currentAvatarIndex];
    document.getElementById('avatar-name').innerText = avatar.name;
    document.getElementById('avatar-name').style.color = `#${avatar.color.toString(16).padStart(6, '0')}`;
    
    // Update 3D Preview Mesh
    this.previewMesh.clear();
    const color = avatar.color;
    
    const bodyGeo = new THREE.BoxGeometry(1, 1.8, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111118 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    this.previewMesh.add(body);

    const visorGeo = new THREE.BoxGeometry(0.65, 0.2, 0.4);
    const visorMat = new THREE.MeshBasicMaterial({ color: color });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.85, 0.2);
    this.previewMesh.add(visor);

    const glowGeo = new THREE.BoxGeometry(1.1, 0.1, 0.7);
    const glowMat = new THREE.MeshBasicMaterial({ color: color });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 1.4;
    this.previewMesh.add(glow);
  }

  animatePreview() {
    requestAnimationFrame(() => this.animatePreview());
    this.previewMesh.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  startGame() {
    this.avatarScreen.classList.add('hidden');
    this.uiLayer.classList.remove('hidden');
    this.onStartGame(this.avatars[this.currentAvatarIndex]);
  }
}
