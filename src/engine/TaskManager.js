export class TaskManager {
  constructor(player) {
    this.player = player;
    this.overlay = document.getElementById('task-overlay');
    this.content = document.getElementById('task-content');
    this.title = document.getElementById('task-title');
    this.feedback = document.getElementById('task-feedback');
    this.closeBtn = document.getElementById('close-task-btn');
    
    // Minimap
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = 180; this.minimapCanvas.height = 180;
    document.getElementById('minimap').innerHTML = '';
    document.getElementById('minimap').appendChild(this.minimapCanvas);
    this.ctx = this.minimapCanvas.getContext('2d');

    // Full Map
    this.fullMapOverlay = document.getElementById('map-overlay');
    this.fullMapCanvas = document.getElementById('full-map-canvas');
    this.fullMapCanvas.width = 1000; this.fullMapCanvas.height = 1000;
    this.fullCtx = this.fullMapCanvas.getContext('2d');
    
    document.getElementById('minimap').onclick = () => this.showFullMap();
    document.getElementById('close-map-btn').onclick = () => this.hideFullMap();

    this.activeTask = null;
    this.isTaskActive = false;
    this.isMapActive = false;

    this.closeBtn.onclick = () => this.hideTask();
    
    this.credits = 320;
    this.securedCount = 0;
    this.totalSystems = 20;
  }

  showFullMap() {
    this.isMapActive = true;
    this.fullMapOverlay.classList.remove('hidden');
    document.exitPointerLock();
  }

  hideFullMap() {
    this.isMapActive = false;
    this.fullMapOverlay.classList.add('hidden');
  }

  showTask(task) {
    if (task.secured) return;
    this.isTaskActive = true;
    this.activeTask = task;
    this.overlay.classList.remove('hidden');
    this.title.innerText = task.title;
    this.feedback.innerText = '';
    this.content.innerHTML = '';
    document.exitPointerLock();
    
    const avatarId = this.player.avatar.id;
    if (avatarId === 'infiltrator') this.initAdvancedMastermind();
    else if (avatarId === 'technician') this.initAdvancedACL();
    else this.initAdvancedBreach();
  }

  hideTask() {
    this.isTaskActive = false;
    this.activeTask = null;
    this.overlay.classList.add('hidden');
  }

  updateHUD(world) {
    document.getElementById('progress-text').innerText = `${this.securedCount} / ${this.totalSystems}`;
    const percent = (this.securedCount / this.totalSystems) * 100;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
    
    const remaining = this.totalSystems - this.securedCount;
    document.getElementById('mission-description').innerText = `${remaining} vulnerable systems remaining`;

    this.drawMinimap(world);
    if (this.isMapActive) this.drawFullMap(world);
  }

  drawMinimap(world) {
    const ctx = this.ctx; const w = this.minimapCanvas.width; const h = this.minimapCanvas.height;
    const scale = 0.6; ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, w, h);
    const px = this.player.mesh.position.x; const pz = this.player.mesh.position.z;
    
    world.interactables.forEach(t => {
      const tx = w/2 + (t.x - px) * scale; const ty = h/2 + (t.z - pz) * scale;
      if(tx > 0 && tx < w && ty > 0 && ty < h) {
        ctx.fillStyle = t.secured ? '#39ff14' : '#00f0ff';
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI*2); ctx.fill();
      }
    });

    ctx.fillStyle = '#ff2d7c'; ctx.save(); ctx.translate(w/2, h/2); ctx.rotate(-this.player.mesh.rotation.y);
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-4, 4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  drawFullMap(world) {
    const ctx = this.fullCtx; const w = this.fullMapCanvas.width; const h = this.fullMapCanvas.height;
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);
    
    const scale = 0.8;
    const offsetX = w/2; const offsetZ = h/2;

    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.beginPath();
    for(let i=0; i<w; i+=50) { ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.moveTo(0, i); ctx.lineTo(w, i); } ctx.stroke();

    // Draw Buildings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    world.colliders.forEach(c => {
      const x = offsetX + c.minX * scale;
      const z = offsetZ + c.minZ * scale;
      const width = (c.maxX - c.minX) * scale;
      const depth = (c.maxZ - c.minZ) * scale;
      ctx.fillRect(x, z, width, depth);
    });

    // Draw Tasks
    world.interactables.forEach(t => {
      const tx = offsetX + t.x * scale; const ty = offsetZ + t.z * scale;
      ctx.fillStyle = t.secured ? '#39ff14' : '#00f0ff';
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
      if(!t.secured) { ctx.strokeStyle = '#00f0ff'; ctx.beginPath(); ctx.arc(tx, ty, 8, 0, Math.PI*2); ctx.stroke(); }
    });

    // Draw Player
    const ppx = offsetX + this.player.mesh.position.x * scale;
    const ppz = offsetZ + this.player.mesh.position.z * scale;
    ctx.fillStyle = '#ff2d7c';
    ctx.beginPath(); ctx.arc(ppx, ppz, 6, 0, Math.PI*2); ctx.fill();
  }

  // --- COMPLEX TASKS ---
  initAdvancedACL() {
    this.content.innerHTML = `<div class="acl-description">FIREWALL OVERRIDE: Match the binary sequence.</div>`;
    const target = Array.from({length: 6}, () => Math.round(Math.random())).join('');
    this.content.innerHTML += `<div class="sequence-target" style="font-size: 24px; color: var(--neon-blue); margin: 1rem 0;">TARGET: ${target}</div>`;
    const input = document.createElement('input'); input.className = 'cyber-input'; input.placeholder = 'ENTER BINARY';
    const btn = document.createElement('button'); btn.className = 'cyber-btn-large'; btn.innerText = 'EXECUTE';
    btn.onclick = () => { if(input.value === target) this.completeTask(500); else this.feedback.innerText = "INVALID SEQUENCE"; };
    this.content.appendChild(input); this.content.appendChild(btn);
  }

  initAdvancedMastermind() {
    this.content.innerHTML = `<div class="acl-description">NEURAL DECRYPT: 5-digit hex key required.</div>`;
    const btn = document.createElement('button'); btn.className = 'cyber-btn-large'; btn.innerText = 'OVERRIDE';
    btn.onclick = () => this.completeTask(600);
    this.content.appendChild(btn);
  }

  initAdvancedBreach() {
    this.content.innerHTML = `<div class="acl-description">MANUAL OVERRIDE: Repeatedly pulse the system.</div>`;
    let clicks = 0;
    const btn = document.createElement('button'); btn.className = 'cyber-btn-large'; btn.innerText = `PULSE (0/20)`;
    btn.onclick = () => { clicks++; btn.innerText = `PULSE (${clicks}/20)`; if(clicks >= 20) this.completeTask(500); };
    this.content.appendChild(btn);
  }

  completeTask(reward) {
    this.credits += reward;
    this.securedCount += 1;
    this.activeTask.secured = true;
    this.activeTask.mesh.children.forEach(c => { if(c instanceof THREE.PointLight) c.color.set(0x39ff14); });
    this.activeTask.mesh.material.emissive.set(0x39ff14);
    
    this.feedback.innerText = `SUCCESS: SYSTEM SECURED.`;
    this.feedback.style.color = 'var(--neon-green)';
    setTimeout(() => this.hideTask(), 1500);
  }
}
