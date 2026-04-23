import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class VehicleManager {
  constructor(scene, player, colliders) {
    this.scene = scene;
    this.player = player;
    this.colliders = colliders;
    
    this.loader = new GLTFLoader();
    this.vehicles = [];
    this.activeVehicle = null;
    
    this.initUI();
    this.initEvents();
  }

  initUI() {
    const menu = document.createElement('div');
    menu.id = 'vehicle-menu';
    menu.className = 'screen hidden';
    menu.innerHTML = `
      <div class="cyber-card">
        <h2 class="section-title">GARAGE</h2>
        <button class="spawn-btn" data-type="car">COUPEOX INTERCEPTOR</button>
        <button class="spawn-btn" data-type="bike">NEON MOTORCYCLE</button>
        <button class="cyber-btn-large" id="close-garage">CLOSE</button>
      </div>
    `;
    document.body.appendChild(menu);
    
    menu.querySelectorAll('.spawn-btn').forEach(btn => {
      btn.onclick = () => {
        this.spawnVehicle(btn.dataset.type);
        menu.classList.add('hidden');
      };
    });
    
    document.getElementById('close-garage').onclick = () => {
      menu.classList.add('hidden');
    };
  }

  initEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !this.activeVehicle) {
        document.getElementById('vehicle-menu').classList.toggle('hidden');
      }
      if (e.code === 'KeyE' && this.activeVehicle) {
        this.exitVehicle();
      }
    });
  }

  spawnVehicle(type) {
    const path = type === 'car' 
      ? '/models/coupeox_futuristic_vehicle.glb' 
      : '/models/futuristic_cyberpunk_neon_motorcycle.glb';
      
    this.loader.load(path, (gltf) => {
      const model = gltf.scene;
      
      // Scaling and Y-Offsets fixed for ground alignment
      if (type === 'car') {
        model.scale.set(10, 10, 10);
        model.userData.yOffset = 1.2;
      } else {
        model.scale.set(8, 8, 8); // Scaled up motorcycle
        model.userData.yOffset = 0.5;
      }
      
      model.position.copy(this.player.mesh.position).add(new THREE.Vector3(15, model.userData.yOffset, 0));
      this.scene.add(model);
      
      const vehicle = {
        mesh: model,
        speed: 0,
        maxSpeed: type === 'car' ? 140 : 180,
        acceleration: type === 'car' ? 45 : 70,
        rotation: model.rotation.y,
        type: type,
        steering: 0,
        tilt: 0
      };
      
      this.vehicles.push(vehicle);
      this.enterVehicle(vehicle);
    });
  }

  enterVehicle(vehicle) {
    this.activeVehicle = vehicle;
    this.player.mesh.visible = false;
    this.player.isDriving = true;
  }

  exitVehicle() {
    this.player.mesh.position.copy(this.activeVehicle.mesh.position).add(new THREE.Vector3(8, 0, 8));
    this.player.mesh.visible = true;
    this.player.isDriving = false;
    this.activeVehicle = null;
  }

  update(delta) {
    if (!this.activeVehicle) return;

    const v = this.activeVehicle;
    
    // Physics-based acceleration
    const targetAccel = this.player.moveForward ? v.acceleration : (this.player.moveBackward ? -v.acceleration : -v.speed * 0.8);
    v.speed += targetAccel * delta;
    v.speed = Math.max(-v.maxSpeed/3, Math.min(v.maxSpeed, v.speed));
    
    // Steering Smoothing
    const targetSteer = (this.player.moveLeft ? 1 : 0) - (this.player.moveRight ? 1 : 0);
    v.steering = THREE.MathUtils.lerp(v.steering, targetSteer, 5 * delta);
    
    if (Math.abs(v.speed) > 1) {
      v.rotation += v.steering * (v.speed / v.maxSpeed) * 5 * delta;
      v.mesh.rotation.y = v.rotation;
      
      // Real-vehicle Tilt/Lean
      const tiltFactor = v.type === 'bike' ? 0.4 : 0.15;
      v.tilt = THREE.MathUtils.lerp(v.tilt, v.steering * (v.speed / v.maxSpeed) * tiltFactor, 8 * delta);
      
      // Apply tilt (roll for bike, subtle for car)
      v.mesh.rotation.z = v.tilt;
      
      // Subtle pitch for acceleration/braking
      v.mesh.rotation.x = -targetAccel * 0.0005;
    }

    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), v.rotation));
    v.mesh.position.add(dir.multiplyScalar(v.speed * delta));
    
    // Keep on ground with offset
    v.mesh.position.y = v.mesh.userData.yOffset;

    // Follow camera
    this.player.mesh.position.copy(v.mesh.position);
  }
}
