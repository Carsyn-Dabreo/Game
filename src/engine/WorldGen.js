import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // This MUST be the same array reference for the Player
    this.interactables = [];
    this.npcs = [];
    
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.005);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dLight.position.set(50, 100, 50);
    this.scene.add(dLight);

    this.loader = new GLTFLoader();
    this.loadCity();
  }

  loadCity() {
    this.loader.load('/models/future_city.glb', (gltf) => {
      const city = gltf.scene;
      city.scale.set(100, 100, 100);
      this.scene.add(city);
      
      const b = new THREE.Box3().setFromObject(city);

      // Use .push(...) to keep the same array reference
      city.traverse((child) => {
        if (child.isMesh) {
          const name = child.name.toLowerCase();
          
          // Only add colliders for tall things that are NOT named ground/road
          if (name.includes('building') || name.includes('wall') || name.includes('structure')) {
            const box = new THREE.Box3().setFromObject(child);
            this.colliders.push({
              minX: box.min.x - 1, maxX: box.max.x + 1,
              minZ: box.min.z - 1, maxZ: box.max.z + 1
            });
          }
        }
      });

      this.placeTerminals(b);
      this.addNPCs(b);
      console.log("City Loaded. Total Colliders:", this.colliders.length);
    });
  }

  placeTerminals(b) {
    const colors = [0x00f0ff, 0xff00ff, 0x39ff14, 0xff6a00];
    const width = b.max.x - b.min.x;
    const depth = b.max.z - b.min.z;
    for(let i=0; i<20; i++) {
      const x = b.min.x + Math.random() * width;
      const z = b.min.z + Math.random() * depth;
      this.addTerminal(x, z, 'auto', `SECURE NODE ${i+1}`, colors[i%4]);
    }
  }

  addTerminal(x, z, type, title, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshStandardMaterial({ color: 0x111118, emissive: new THREE.Color(color), emissiveIntensity: 0.5 }));
    mesh.position.set(x, 2, z);
    const light = new THREE.PointLight(color, 20, 15);
    light.position.y = 4;
    mesh.add(light);
    this.scene.add(mesh);
    this.interactables.push({ type, title, x, z, mesh, secured: false });
  }

  addNPCs(b) {
    const width = b.max.x - b.min.x;
    const depth = b.max.z - b.min.z;
    for(let i=0; i<30; i++) {
      const npc = new THREE.Group();
      npc.add(new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), new THREE.MeshStandardMaterial({ color: 0x222233 })));
      const x = b.min.x + Math.random() * width;
      const z = b.min.z + Math.random() * depth;
      npc.position.set(x, 2, z);
      this.scene.add(npc);
      this.npcs.push({ mesh: npc, startX: x, startZ: z, range: 100, speed: 5, offset: Math.random() * 10 });
    }
  }

  update(delta, time) {
    this.npcs.forEach(n => {
      n.mesh.position.x = n.startX + Math.sin(time * 0.2 + n.offset) * n.range;
      n.mesh.position.z = n.startZ + Math.cos(time * 0.2 + n.offset) * n.range;
    });
  }
}
