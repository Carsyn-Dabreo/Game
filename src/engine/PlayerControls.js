import * as THREE from 'three';

export class Player {
  constructor(scene, camera, domElement, colliders, avatar) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders; // This is a reference to the array in World
    this.avatar = avatar;

    this.velocity = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.isSprinting = false;
    this.isRightMouseDown = false;

    // High speed for the massive city scale
    this.speed = 100.0; 
    this.jumpForce = 35.0;
    this.gravity = 80.0;
    
    this.cameraDistance = 30.0;
    this.cameraHeight = 15.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.initModel();
    this.initEvents();
  }

  initModel() {
    this.mesh = new THREE.Group();
    const color = this.avatar.color;
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.1, metalness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1), mat);
    body.position.y = 2;
    this.mesh.add(body);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 0.8), new THREE.MeshBasicMaterial({ color: color }));
    visor.position.set(0, 3.8, 0.4);
    this.mesh.add(visor);
    this.scene.add(this.mesh);
    
    // Initial spawn safely at 0,0,0
    this.mesh.position.set(0, 2, 0);
  }

  initEvents() {
    document.addEventListener('keydown', (e) => this.onKey(e, true));
    document.addEventListener('keyup', (e) => this.onKey(e, false));
    
    document.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
        document.exitPointerLock();
      }
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('mousemove', (e) => {
      if (this.isRightMouseDown && document.pointerLockElement === this.domElement) {
        this.mouseX -= e.movementX * 0.003;
        this.mouseY -= e.movementY * 0.003;
        this.mouseY = Math.max(-0.4, Math.min(0.4, this.mouseY));
      }
    });
  }

  onKey(event, isDown) {
    switch (event.code) {
      case 'KeyW': this.moveForward = isDown; break;
      case 'KeyA': this.moveLeft = isDown; break;
      case 'KeyS': this.moveBackward = isDown; break;
      case 'KeyD': this.moveRight = isDown; break;
      case 'Space': 
        if (isDown && this.canJump) {
          this.velocity.y = this.jumpForce;
          this.canJump = false;
        }
        break;
      case 'ShiftLeft': this.isSprinting = isDown; break;
    }
  }

  checkCollisions(nextPos) {
    // Check against the latest colliders in the array
    const radius = 2.5;
    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      if (nextPos.x + radius > box.minX && nextPos.x - radius < box.maxX &&
          nextPos.z + radius > box.minZ && nextPos.z - radius < box.maxZ) {
        return true;
      }
    }
    return false;
  }

  update(delta) {
    const currentSpeed = this.isSprinting ? this.speed * 2.5 : this.speed;
    
    // Gravity
    this.velocity.y -= this.gravity * delta;
    
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      forward.y = 0; forward.normalize();
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
      right.y = 0; right.normalize();

      if (this.moveForward) moveDir.add(forward);
      if (this.moveBackward) moveDir.sub(forward);
      if (this.moveLeft) moveDir.sub(right);
      if (this.moveRight) moveDir.add(right);
      
      if (moveDir.length() > 0) moveDir.normalize();
    }

    this.velocity.x = moveDir.x * currentSpeed;
    this.velocity.z = moveDir.z * currentSpeed;

    const nextPos = this.mesh.position.clone().add(this.velocity.clone().multiplyScalar(delta));
    
    // Simple Ground
    if (nextPos.y <= 2) {
      nextPos.y = 2;
      this.velocity.y = 0;
      this.canJump = true;
    }

    // World Boundaries (-1000 to 1000 for a large city)
    const worldLimit = 1500;
    nextPos.x = Math.max(-worldLimit, Math.min(worldLimit, nextPos.x));
    nextPos.z = Math.max(-worldLimit, Math.min(worldLimit, nextPos.z));

    // Attempt to move horizontally, then vertically
    const horizontalPos = this.mesh.position.clone();
    horizontalPos.x = nextPos.x;
    horizontalPos.z = nextPos.z;
    
    if (!this.checkCollisions(horizontalPos)) {
      this.mesh.position.x = nextPos.x;
      this.mesh.position.z = nextPos.z;
    }
    
    this.mesh.position.y = nextPos.y;

    if (moveDir.length() > 0) {
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetRotation, 10 * delta);
    }

    const idealOffset = new THREE.Vector3(0, this.cameraHeight + (this.mouseY * 15), this.cameraDistance);
    idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mouseX);
    const targetPos = this.mesh.position.clone().add(idealOffset);
    this.camera.position.lerp(targetPos, 10 * delta);
    this.camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0, 5, 0)));
  }
}
