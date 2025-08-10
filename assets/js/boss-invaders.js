(function(){
  const ASSET_BASE = (window.BOSS_INVADERS && BOSS_INVADERS.assetBase) || '';

  // Helpers
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const chance = (p)=>Math.random()<p;

  // DOM refs
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const gameOverTitle = document.getElementById('gameOverTitle');
  const finalStats = document.getElementById('finalStats');
  const resumeOverlay = document.getElementById('resumeOverlay');

  const startBtn = document.getElementById('startBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Mobile controls elements & state
  const mobileControls = document.getElementById('mobileControls');
  const mcLeft = document.getElementById('mcLeft');
  const mcRight = document.getElementById('mcRight');
  const mcFire = document.getElementById('mcFire');
  const mqMobile = window.matchMedia('(max-width: 820px), (hover: none) and (pointer: coarse)');
  let touchLeft = false, touchRight = false, touchFire = false;

  function setupMobileControls(){
    const isMobile = mqMobile.matches || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    if (mobileControls) {
      if (isMobile) {
        mobileControls.classList.add('active');
        mobileControls.setAttribute('aria-hidden','false');
      } else {
        mobileControls.classList.remove('active');
        mobileControls.setAttribute('aria-hidden','true');
      }
    }
    // Bind helpers
    function bindHold(el, onDown, onUp){
      if (!el) return;
      const down = (e)=>{ e.preventDefault(); try{ el.setPointerCapture && el.setPointerCapture(e.pointerId);}catch(_){}; el.classList.add('pressed'); onDown(); };
      const up = (e)=>{ e.preventDefault(); el.classList.remove('pressed'); onUp(); try{ el.releasePointerCapture && el.releasePointerCapture(e.pointerId);}catch(_){} };
      el.addEventListener('pointerdown', down, {passive:false});
      el.addEventListener('pointerup', up, {passive:false});
      el.addEventListener('pointercancel', up, {passive:false});
      el.addEventListener('pointerleave', up, {passive:false});
    }
    bindHold(mcLeft, ()=>{ touchLeft = true; }, ()=>{ touchLeft = false; });
    bindHold(mcRight, ()=>{ touchRight = true; }, ()=>{ touchRight = false; });
    bindHold(mcFire, ()=>{ touchFire = true; }, ()=>{ touchFire = false; });
  }
  if (mobileControls) {
    setupMobileControls();

    // Watch for matchMedia changes (modern + Safari fallback)
    if (mqMobile && typeof mqMobile.addEventListener === 'function') {
      mqMobile.addEventListener('change', setupMobileControls);
    } else if (mqMobile && typeof mqMobile.addListener === 'function') {
      // Older Safari
      mqMobile.addListener(setupMobileControls);
    }

    // Also re-check on orientation changes and resizes (iOS landscape cases)
    window.addEventListener('orientationchange', () => setTimeout(setupMobileControls, 150), {passive:true});
    window.addEventListener('resize', () => setTimeout(setupMobileControls, 100), {passive:true});
  }

  // Game state
  let running=false, paused=false, awaitingResume=false; let t=0; let last=0;
  const world = { score:0, lives:3, wave:1, width:canvas.width, height:canvas.height };

  // Sprites
  const spriteSources = [
    'img/michael-scott-1.png',
    'img/mr-burns-1.png',
    'img/bill-lumbergh-1.png',
    'img/miranda-priestly-1.png'
  ];
  const spriteSourcesAlt = [
    'img/michael-scott-2.png',
    'img/mr-burns-2.png',
    'img/bill-lumbergh-2.png',
    'img/miranda-priestly-2.png'
  ];
  const sprites = spriteSources.map(src=>{ const img=new Image(); img.src = ASSET_BASE + src; return img; });
  const spritesAlt = spriteSourcesAlt.map(src=>{ const img=new Image(); img.src = ASSET_BASE + src; return img; });
  const playerImg = new Image(); playerImg.src = ASSET_BASE + 'img/vlp-ship.png';
  const bossImg = new Image(); bossImg.src = ASSET_BASE + 'img/megatron-1.png';
  const bossImgAlt = new Image(); bossImgAlt.src = ASSET_BASE + 'img/megatron-2.png';

  // Optional SFX (boss laugh) – safe/gated
  const bossAppearSfx = new window.Audio(ASSET_BASE + 'sfx/evil-laugh.wav');
  bossAppearSfx.preload='auto'; bossAppearSfx.volume=0.5;
  let lastLaughTime=-999;
  function playBossLaugh(){ try{ bossAppearSfx.currentTime=0; const p=bossAppearSfx.play(); if(p&&p.catch) p.catch(()=>{});}catch(_){} }

  // Entities
  const player={ x: canvas.width/2, y: canvas.height-40, w:46, h:46, speed:300, cooldown:0, fireDelay:0.3,
    reset(){ this.x=canvas.width/2; this.y=canvas.height-40; this.cooldown=0; },
    move(dx,dt){ this.x = clamp(this.x + dx*this.speed*dt, this.w/2+8, canvas.width-this.w/2-8); },
    canFire(){ return this.cooldown<=0; },
    fire(){ bullets.push({ x:this.x, y:this.y-this.h/2, r:3, vy:-520 }); this.cooldown=this.fireDelay; AudioFX.shoot(); }
  };

  const bullets=[]; // player
  const enemyBullets=[]; // regular enemies (white)
  const bossBullets=[]; // boss bombs
  const explosions=[]; // {x,y,ttl}

  // ===== Shields (text-based) =====
  const BRAND_BLUE = '#0066FF';
  const SHIELD_WORDS = ['COACHING','GOALS','FEEDBACK'];
  const SHIELD_FONT_SIZE = 24; // px (base); will auto-scale per word
  const SHIELD_FONT = `bold ${SHIELD_FONT_SIZE}px Arial, Helvetica, sans-serif`;
  const SHIELD_LETTER_SP = 0; // no extra spacing between letters
  const SHIELD_SIDE_MARGIN = 28; // space to canvas edges
  const SHIELD_SEGMENT_PAD = 28; // a bit tighter so words can sit closer
  const SHIELD_FIRST_OFFSET = 12; // still leave breathing room on far left
  const SHIELD_INWARD_NUDGE = 24; // pull edge words toward center to reduce gaps
  let shields = []; // array of {word, letters:[{x,y,w,h,topHits,bottomHits,destroyed, off:CanvasRenderingContext2D's canvas}]}
  const debris = []; // small particles from shield hits

  function textMeasureWidth(ctx2d, txt){ return ctx2d.measureText(txt).width; }

  function buildShields(){
    shields = [];
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    octx.font = SHIELD_FONT;

    // Y position: above player
    const baseY = mqMobile.matches ? (canvas.height - 220) : (canvas.height - 180);

      // U-SHAPED SHIELD LAYOUT: More compact horizontal arrangement
  const segments = SHIELD_WORDS.length;
  const centerX = canvas.width / 2;
  
  // Calculate U-shape parameters
  const uRadius = Math.min(120, (canvas.width - SHIELD_SIDE_MARGIN * 2) / 3); // Radius of the U curve
  const uHeight = 80; // Height of the U curve
  const wordSpacing = 20; // Space between words in the curve
  
  // Add shield energy/health system
  const shieldEnergy = 100; // Base shield energy
    
    for(let i=0;i<SHIELD_WORDS.length;i++){
      const word = SHIELD_WORDS[i];
      
      // Pre-measure letters (unscaled)
      const lettersMeta = [];
      let wordW = 0;
      for(const ch of word){
        if(ch===' '){ wordW += SHIELD_LETTER_SP * 2; continue; }
        const w = Math.ceil(textMeasureWidth(octx, ch));
        lettersMeta.push({ch, w});
        wordW += w + SHIELD_LETTER_SP;
      }
      if(wordW>0) wordW -= SHIELD_LETTER_SP; // trim trailing spacing

      // Position words in U-shape
      let wordX, wordY;
      if (i === 0) { // COACHING - left side of U
        wordX = centerX - uRadius - wordW/2;
        wordY = baseY - uHeight;
      } else if (i === 1) { // GOALS - top of U
        wordX = centerX - wordW/2;
        wordY = baseY - uHeight - 15;
      } else { // FEEDBACK - right side of U
        wordX = centerX + uRadius - wordW/2;
        wordY = baseY - uHeight;
      }

      // Scale word to fit if needed
      const maxWordWidth = uRadius * 1.8; // Allow words to be wider than radius
      const scale = Math.min(1, wordW > 0 ? (maxWordWidth / wordW) : 1);
      const letterSpScaled = 0; // remove inter-letter gaps for legibility

      // Compute scaled dimensions per letter
      const baseH = Math.ceil(SHIELD_FONT_SIZE * 1.25);
      const scaledDims = lettersMeta.map(meta => {
        const wUn = Math.max(18, meta.w);
        const hUn = baseH;
        const w = Math.ceil((wUn + 8) * scale);
        const h = Math.ceil((hUn + 8) * scale);
        return { ch: meta.ch, w, h };
      });

      // Build letters with offscreen glyphs (scaled)
      const letters = [];
      let currentX = wordX;
      for(const dim of scaledDims){
        const c = document.createElement('canvas');
        c.width = dim.w; c.height = dim.h;
        const cx = c.getContext('2d');
        cx.font = SHIELD_FONT;
        cx.textBaseline = 'alphabetic';
        cx.save();
        cx.scale(scale, scale);
        cx.lineWidth = 3;
        cx.strokeStyle = '#ffffff';
        cx.fillStyle = BRAND_BLUE;
        const baselineY = Math.round(baseH * 0.82);
        cx.strokeText(dim.ch, 4, baselineY);
        cx.fillText(dim.ch, 4, baselineY);
        cx.restore();

        letters.push({ x: currentX, y: wordY, w: c.width, h: c.height, topHits:0, bottomHits:0, destroyed:false, off:c });
        currentX += c.width + letterSpScaled;
      }
      
      // Build curved protective segments above the word (following U-shape)
      const segs = [];
      for (let j = 0; j < letters.length; j++){
        const L = letters[j];
        let segX = L.x;
        let segY = L.y - L.h - 8;
        
        // Curve the segments to follow the U-shape
        if (i === 0) { // Left side - curve up and right
          segY -= Math.sin((j / (letters.length - 1)) * Math.PI * 0.3) * 15;
          segX += Math.sin((j / (letters.length - 1)) * Math.PI * 0.3) * 8;
        } else if (i === 2) { // Right side - curve up and left
          segY -= Math.sin((j / (letters.length - 1)) * Math.PI * 0.3) * 15;
          segX -= Math.sin((j / (letters.length - 1)) * Math.PI * 0.3) * 8;
        } else { // Top - slight curve
          segY -= Math.sin((j / (letters.length - 1)) * Math.PI) * 10;
        }
        
        segs.push({ x: segX, y: segY, w: L.w, h: 6, hits: 0, destroyed: false });
      }
      
      shields.push({ 
        word, 
        letters, 
        segments: segs, 
        uPosition: i,
        energy: shieldEnergy,
        maxEnergy: shieldEnergy,
        regenerationRate: 0.5, // Energy per second
        lastRegenTime: 0
      });
    }
  }

  function collideBulletWithShields(b){
    // returns true if bullet consumed by shield or segment
    for(const sh of shields){
      // 1) Check word-top segments (energy-based system)
      if (sh.segments) {
        for (const S of sh.segments){
          if (S.destroyed) continue;
          const sx=S.x, sy=S.y, sw=S.w, shh=S.h;
          if (b.x>sx && b.x<sx+sw && b.y>sy && b.y<sy+shh){
            // Decrease shield energy on hit
            sh.energy = Math.max(0, sh.energy - 15); // Each hit reduces energy by 15
            
            // Destroy segment if shield energy is depleted
            if (sh.energy <= 0) {
              S.destroyed = true;
            }
            
            spawnDebris(b.x, b.y, b.vy<0 ? 1 : -1);
            return true; // bullet consumed
          }
        }
      }
      
      // 2) Check letters (energy-based system)
      for(const L of sh.letters){
        if(L.destroyed) continue;
        const lx = L.x, lyTop = L.y - L.h, lw = L.w, lh = L.h;
        if(b.x>lx && b.x<lx+lw && b.y>lyTop && b.y<lyTop+lh){
          // Decrease shield energy on hit
          sh.energy = Math.max(0, sh.energy - 10); // Each hit reduces energy by 10
          
          // Mark letter as destroyed if shield energy is depleted
          if (sh.energy <= 0) {
            L.destroyed = true;
          }
          
          // Spawn debris
          spawnDebris(b.x, b.y, b.vy<0 ? 1 : -1);
          // consume bullet
          return true;
        }
      }
    }
    return false;
  }

  function spawnDebris(x,y,dir){
    for(let i=0;i<6;i++){
      debris.push({ x, y, vx:(Math.random()*80-40), vy:(-dir)*(40+Math.random()*80), ttl:0.4 });
    }
  }

  let enemies=[]; let enemyDir=1; let enemySpeed=35;

  function spawnWave(wave){
    enemies.length=0;
    const cols=10; const rows=Math.min(1+(wave-1),4); // 1..4
    const enemyW=44, enemyH=44; const paddingX=18, paddingY=14; const startX=60;
    const lowestRowY=200; // row 1 baseline stays constant, stack upward
    for(let r=0;r<rows;r++){
      const y = lowestRowY - r*(enemyH+paddingY);
      for(let c=0;c<cols;c++){
        enemies.push({ x:startX + c*(enemyW+paddingX), y, w:enemyW, h:enemyH, alive:true, dying:false, dieTimer:0, row:r, col:c, variant:0, canShoot:true });
      }
    }
    enemyDir=1; enemySpeed = 35 + (wave-1)*10;
  }

  function enemiesAlive(){ return enemies.some(e=>e.alive); }

  // Boss entity
  const boss={ active:false, dying:false, dieTimer:0, invulnerable:false, x:0, y:40, w:72, h:54, dir:1, speed:160,
    spawn(){ this.active=true; this.dying=false; this.invulnerable=false; this.dieTimer=0; this.y=40; this.w=72; this.h=54; this.dir=Math.random()<0.5?1:-1; this.x=this.dir>0? -this.w : canvas.width+this.w; if(t-lastLaughTime>1.0){ playBossLaugh(); lastLaughTime=t; } },
    despawn(){ this.active=false; this.dying=false; this.invulnerable=false; }
  };

  // Boss spawn control
  const bossConfig={ spawnProb:0.0015, cooldown:10 };
  let bossLastSpawnTime=-999;

  // Minimal audio bleeps via Web Audio
  const AudioFX=(()=>{ let ac; function ctx(){ return ac || (ac=new (window.AudioContext||window.webkitAudioContext)()); }
    function beep({freq=440,type='square',duration=0.08,vol=0.2,attack=0.002,release=0.06}={}){ const a=ctx(); const t0=a.currentTime; const o=a.createOscillator(); const g=a.createGain(); o.type=type; o.frequency.setValueAtTime(freq,t0); g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+attack); g.gain.exponentialRampToValueAtTime(0.0001,t0+duration+release); o.connect(g).connect(a.destination); o.start(t0); o.stop(t0+duration+release+0.02);} return {
      shoot(){ beep({freq:920,type:'square',duration:0.06,vol:0.18}); },
      hit(){ beep({freq:320,type:'triangle',duration:0.1,vol:0.22}); },
      playerHit(){ beep({freq:180,type:'sawtooth',duration:0.15,vol:0.25}); },
      wave(){ beep({freq:660,type:'sine',duration:0.08,vol:0.2}); setTimeout(()=>beep({freq:880,type:'sine',duration:0.08,vol:0.2}),100); },
      gameOver(){ beep({freq:220,type:'sawtooth',duration:0.2,vol:0.25}); setTimeout(()=>beep({freq:160,type:'triangle',duration:0.25,vol:0.22}),140); }
    }; })();

  // Input
  const keys=new Set();
  addEventListener('keydown',e=>{ if(['ArrowLeft','ArrowRight','a','d','A','D',' '].includes(e.key)) e.preventDefault(); keys.add(e.key); if(e.key==='p'||e.key==='P') togglePause(); });
  addEventListener('keyup',e=>keys.delete(e.key));

  // Loop
  function loop(ts){ if(!running) return; if(paused){ requestAnimationFrame(loop); return; } const dt=(ts-last)/1000; last=ts; t+=dt; update(dt); draw(); requestAnimationFrame(loop); }

  function update(dt){
    // Player
    const left = (keys.has('ArrowLeft')||keys.has('a')||keys.has('A')) || touchLeft;
    const right = (keys.has('ArrowRight')||keys.has('d')||keys.has('D')) || touchRight;
    if(left&&!right) player.move(-1,dt); if(right&&!left) player.move(1,dt);
    player.cooldown -= dt;
    const firing = (keys.has(' ')||keys.has('Spacebar')) || touchFire;
    if(firing && player.canFire()) player.fire();

    // Bullets
    for(const b of bullets) b.y += b.vy*dt; for(const b of enemyBullets) b.y += b.vy*dt; for(const b of bossBullets) b.y += b.vy*dt;

    // Collisions: bullets vs shields (absorb bullets)
    for(let i=bullets.length-1;i>=0;i--){ if(collideBulletWithShields(bullets[i])) bullets.splice(i,1); }
    for(let i=enemyBullets.length-1;i>=0;i--){ if(collideBulletWithShields(enemyBullets[i])) enemyBullets.splice(i,1); }
    for(let i=bossBullets.length-1;i>=0;i--){ if(collideBulletWithShields(bossBullets[i])) bossBullets.splice(i,1); }
    
    // Shield regeneration system
    for(const shield of shields){
      if(shield.energy < shield.maxEnergy && (t - shield.lastRegenTime) >= 1.0){
        shield.energy = Math.min(shield.maxEnergy, shield.energy + shield.regenerationRate);
        shield.lastRegenTime = t;
      }
    }

    // Enemy formation move
    if(enemiesAlive()){
      let minX=Infinity, maxX=-Infinity; for(const e of enemies) if(e.alive && !e.dying){ minX=Math.min(minX,e.x); maxX=Math.max(maxX,e.x+e.w);} const hitEdge=(enemyDir>0 && maxX + enemySpeed*dt > canvas.width-12) || (enemyDir<0 && minX - enemySpeed*dt < 12);
      if(hitEdge){ enemyDir*=-1; for(const e of enemies) if(e.alive && !e.dying) e.y += 16; } else { for(const e of enemies) if(e.alive && !e.dying) e.x += enemySpeed*enemyDir*dt; }

      // Adjust fire rate/speed by row (0 bottom .. 3 top)
      const aliveCols={}; enemies.forEach(e=>{ if(e.alive && !e.dying && e.canShoot) aliveCols[e.col]=e; }); const cols=Object.values(aliveCols);
      if(cols.length){ const shooter=cols[Math.floor(Math.random()*cols.length)]; let fireChance,speed; switch(shooter.row){ case 0: fireChance=0.01; speed=180; break; case 1: fireChance=0.015; speed=200; break; case 2: fireChance=0.02; speed=220; break; case 3: fireChance=0.025; speed=240; break; default: fireChance=0.02; speed=200; }
        if(chance(fireChance)) enemyBullets.push({ x:shooter.x+shooter.w/2, y:shooter.y+shooter.h, r:3, vy:speed }); }
    }

    // Boss spawn/move/shoot (wave >= 2)
    if(!boss.active && world.wave>=2 && (t-bossLastSpawnTime)>=bossConfig.cooldown && chance(bossConfig.spawnProb)){ boss.spawn(); bossLastSpawnTime=t; }
    if(boss.active){
      if(!boss.dying) boss.x += boss.speed*boss.dir*dt; // freeze in place when dying
      if(!boss.dying && chance(0.02)) bossBullets.push({ x:boss.x+boss.w/2, y:boss.y+boss.h, r:12, vy:240 });
      if(boss.dying){ boss.dieTimer -= dt; if(boss.dieTimer<=0) boss.despawn(); }
      // Only auto-despawn by leaving screen if NOT dying
      if(!boss.dying && ((boss.dir>0 && boss.x>canvas.width+boss.w) || (boss.dir<0 && boss.x<-boss.w))) boss.despawn();
    }

    // Collisions: player bullets vs enemies
    for(const b of bullets){
      for(const e of enemies){
        if(!e.alive || e.dying) continue; // skip already-dying
        if(b.x>e.x && b.x<e.x+e.w && b.y>e.y && b.y<e.y+e.h){
          // Start death reaction (keep alive until timer finishes)
          e.dying = true; e.dieTimer = 0.6; e.variant = 1; e.canShoot = false;
          b.y = -9999;
          const pointsPerRow=[10,20,30,40];
          world.score += pointsPerRow[e.row]||10; scoreEl.textContent=world.score;
          AudioFX.hit();
          explosions.push({x:b.x,y:b.y,ttl:.25});
          break; // this bullet is spent
        }
      }
    }

    // Collisions: enemy bullets vs player
    for(const b of enemyBullets){ if(b.x>player.x-player.w/2 && b.x<player.x+player.w/2 && b.y>player.y-player.h/2 && b.y<player.y+player.h/2){ b.y=9999; world.lives=Math.max(0,world.lives-1); livesEl.textContent=world.lives; AudioFX.playerHit(); explosions.push({x:player.x,y:player.y-8,ttl:.3}); player.reset(); if(world.lives<=0) return endGame(false); paused=true; awaitingResume=true; resumeOverlay.style.display='grid'; } }

    // Collisions: player bullets vs boss (100 pts)
    if(boss.active && !boss.invulnerable){
      for(const b of bullets){
        if(b.x>boss.x && b.x<boss.x+boss.w && b.y>boss.y && b.y<boss.y+boss.h){
          b.y=-9999; world.score+=100; scoreEl.textContent=world.score; AudioFX.hit(); explosions.push({x:b.x,y:b.y,ttl:.3});
          // Start boss death animation
          boss.dying=true; boss.invulnerable=true; boss.dieTimer=0.8; // show alt sprite briefly
          break;
        }
      }
    }
    // Update enemy death timers (now flip to not-alive after flash)
    for(const e of enemies){
      if(e.dying){
        e.dieTimer -= dt;
        if(e.dieTimer<=0){ e.dying=false; e.alive=false; }
      }
    }

    // Collisions: boss bombs vs player
    for(const b of bossBullets){ if(b.x>player.x-player.w/2 && b.x<player.x+player.w/2 && b.y>player.y-player.h/2 && b.y<player.y+player.h/2){ b.y=9999; world.lives=Math.max(0,world.lives-1); livesEl.textContent=world.lives; AudioFX.playerHit(); explosions.push({x:player.x,y:player.y-8,ttl:.3}); player.reset(); if(world.lives<=0) return endGame(false); paused=true; awaitingResume=true; resumeOverlay.style.display='grid'; } }

    // Cull offscreen bullets
    for(let i=bullets.length-1;i>=0;i--) if(bullets[i].y<-20) bullets.splice(i,1);
    for(let i=enemyBullets.length-1;i>=0;i--) if(enemyBullets[i].y>canvas.height+20) enemyBullets.splice(i,1);
    for(let i=bossBullets.length-1;i>=0;i--) { const bb=bossBullets[i]; if(bb.y>canvas.height+20){ explosions.push({x:bb.x,y:canvas.height-12,ttl:0.35}); bossBullets.splice(i,1);} }

    // Explosions decay
    for(let i=explosions.length-1;i>=0;i--){ explosions[i].ttl -= dt; if(explosions[i].ttl<=0) explosions.splice(i,1); }

    // Debris update
    for(let i=debris.length-1;i>=0;i--){ const d=debris[i]; d.x += d.vx*dt; d.y += d.vy*dt; d.ttl -= dt; if(d.ttl<=0) debris.splice(i,1); }

    // Lose by descent
    for(const e of enemies) if(e.alive && e.y+e.h >= player.y-6) return endGame(false);

    // Next wave
    if(!enemiesAlive()){ world.wave+=1; waveEl.textContent=world.wave; spawnWave(world.wave); AudioFX.wave(); }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // starfield
    ctx.globalAlpha=.5; for(let i=0;i<70;i++){ const x=(i*97 + (t*20)%800)%800; const y=(i*53 % 600); ctx.fillStyle = i%7===0?'#8ab6ff':'#5563a5'; ctx.fillRect(x,y,2,2);} ctx.globalAlpha=1;

    // shields – top orange segments (draw first so letters appear below them)
    for (const sh of shields){
      if (!sh.segments) continue;
      for (const S of sh.segments){
        if (S.destroyed) continue;
        
        // Enhanced U-shaped shield segments with gradient and glow
        const shield = shields.find(s => s.segments.includes(S));
        const energyRatio = shield ? shield.energy / shield.maxEnergy : 1;
        
        // Dynamic color based on energy level
        const baseColor = energyRatio > 0.7 ? '#FF6600' : energyRatio > 0.3 ? '#FF8800' : '#FF4400';
        const secondaryColor = energyRatio > 0.7 ? '#FF4400' : energyRatio > 0.3 ? '#FF6600' : '#FF2200';
        
        const gradient = ctx.createLinearGradient(S.x, S.y, S.x, S.y + S.h);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, secondaryColor);
        
        // Add glow effect (stronger when energy is high)
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = energyRatio > 0.5 ? 6 : 2;
        ctx.fillStyle = gradient;
        
        // Rounded small bar with slight curve based on U-position
        const r = 3;
        ctx.beginPath();
        ctx.moveTo(S.x + r, S.y);
        ctx.lineTo(S.x + S.w - r, S.y);
        ctx.quadraticCurveTo(S.x + S.w, S.y, S.x + S.w, S.y + r);
        ctx.lineTo(S.x + S.w, S.y + S.h - r);
        ctx.quadraticCurveTo(S.x + S.w, S.y + S.h, S.x + S.w - r, S.y + S.h);
        ctx.lineTo(S.x + r, S.y + S.h);
        ctx.quadraticCurveTo(S.x, S.y + S.h, S.x, S.y + S.h - r);
        ctx.lineTo(S.x, S.y + r);
        ctx.quadraticCurveTo(S.x, S.y, S.x + r, S.y);
        ctx.closePath();
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      }
    }

    // shields
    for(const sh of shields){
      for(const L of sh.letters){
        if(L.destroyed) continue;
        // Clip to remove top/bottom slices based on hits
        const topClip = Math.floor(L.h * 0.25 * L.topHits);
        const botClip = Math.floor(L.h * 0.25 * L.bottomHits);
        const clipY = (L.y - L.h) + topClip;
        const clipH = Math.max(0, L.h - topClip - botClip);
        if(clipH<=0) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(L.x, clipY, L.w, clipH);
        ctx.clip();
        ctx.drawImage(L.off, L.x, L.y - L.h);
        ctx.restore();
      }
    }
    
    // Draw connecting U-shape lines to enhance the shield formation
    if (shields.length > 0) {
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Find the three shield positions
      const leftShield = shields.find(s => s.uPosition === 0);
      const topShield = shields.find(s => s.uPosition === 1);
      const rightShield = shields.find(s => s.uPosition === 2);
      
      if (leftShield && topShield && rightShield) {
        // Draw curved connecting lines
        ctx.beginPath();
        
        // Left to top curve
        const leftCenter = {
          x: leftShield.letters[Math.floor(leftShield.letters.length/2)].x + leftShield.letters[Math.floor(leftShield.letters.length/2)].w/2,
          y: leftShield.letters[Math.floor(leftShield.letters.length/2)].y
        };
        const topCenter = {
          x: topShield.letters[Math.floor(topShield.letters.length/2)].x + topShield.letters[Math.floor(topShield.letters.length/2)].w/2,
          y: topShield.letters[Math.floor(topShield.letters.length/2)].y
        };
        const rightCenter = {
          x: rightShield.letters[Math.floor(rightShield.letters.length/2)].x + rightShield.letters[Math.floor(rightShield.letters.length/2)].w/2,
          y: rightShield.letters[Math.floor(rightShield.letters.length/2)].y
        };
        
        // Draw curved path
        ctx.moveTo(leftCenter.x, leftCenter.y);
        ctx.quadraticCurveTo(leftCenter.x + 40, leftCenter.y - 40, topCenter.x, topCenter.y);
        ctx.quadraticCurveTo(rightCenter.x - 40, rightCenter.y - 40, rightCenter.x, rightCenter.y);
        
        ctx.stroke();
      }
      
      ctx.setLineDash([]); // Reset line dash
      
      // Draw shield energy indicators
      for(const shield of shields){
        if(shield.energy < shield.maxEnergy){
          const centerLetter = shield.letters[Math.floor(shield.letters.length/2)];
          const energyBarWidth = 30;
          const energyBarHeight = 4;
          const energyBarX = centerLetter.x + centerLetter.w/2 - energyBarWidth/2;
          const energyBarY = centerLetter.y - centerLetter.h - 20;
          
          // Background bar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight);
          
          // Energy bar
          const energyWidth = (shield.energy / shield.maxEnergy) * energyBarWidth;
          ctx.fillStyle = shield.energy > 0.7 ? '#00FF00' : shield.energy > 0.3 ? '#FFFF00' : '#FF0000';
          ctx.fillRect(energyBarX, energyBarY, energyWidth, energyBarHeight);
        }
      }
    }

    // player
    ctx.save(); if(playerImg && playerImg.complete){ ctx.drawImage(playerImg, player.x-player.w/2, player.y-player.h/2, player.w, player.h); } else { ctx.translate(player.x,player.y); ctx.fillStyle='#6fd3a5'; roundedRect(ctx,-player.w/2,-player.h/2,player.w,player.h,6); ctx.fill(); } ctx.restore();

    // enemies (show alt sprite when dying briefly)
    for(const e of enemies){
      if(!(e.alive||e.dying)) continue;
      const img = (e.dying && spritesAlt[e.row] && spritesAlt[e.row].complete) ? spritesAlt[e.row] : sprites[e.row];
      if(img && img.complete){ ctx.drawImage(img,e.x,e.y,e.w,e.h); }
      else { ctx.save(); ctx.translate(e.x,e.y); ctx.fillStyle='#f3b24b'; roundedRect(ctx,0,0,e.w,e.h,6); ctx.fill(); ctx.restore(); }
    }

    // boss (alt image during dying)
    if(boss.active){
      const img = (boss.dying && bossImgAlt && bossImgAlt.complete) ? bossImgAlt : bossImg;
      if(img && img.complete) ctx.drawImage(img,boss.x,boss.y,boss.w,boss.h);
      else { ctx.fillStyle='#ccc'; ctx.fillRect(boss.x,boss.y,boss.w,boss.h);} }

    // bullets
    ctx.fillStyle = '#FF6600'; for(const b of bullets){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; for(const b of enemyBullets){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }

    // boss bombs glow + trail
    for(const b of bossBullets){
      const trailLen = Math.min(40, Math.max(10, b.r*3));
      const gradTrail = ctx.createLinearGradient(b.x, b.y - trailLen, b.x, b.y);
      gradTrail.addColorStop(0,'rgba(255,204,102,0.0)'); gradTrail.addColorStop(1,'rgba(255,204,102,0.6)');
      ctx.fillStyle=gradTrail; ctx.fillRect(b.x - Math.max(2,b.r*0.3), b.y - trailLen, Math.max(4,b.r*0.6), trailLen);
      const grad = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,Math.max(0.0001,b.r*1.6));
      grad.addColorStop(0,'rgba(255,230,150,0.9)'); grad.addColorStop(1,'rgba(255,120,60,0.0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(b.x,b.y,Math.max(0.0001,b.r*1.2),0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffcc66'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    }

    // explosions (clamped so r never negative)
    for(const ex of explosions){ ctx.save(); const k=Math.min(1,Math.max(0,ex.ttl/0.3)); ctx.globalAlpha=k; const r=18*(1-k); const grad=ctx.createRadialGradient(ex.x,ex.y,0,ex.x,ex.y,Math.max(0.0001,r)); grad.addColorStop(0,'rgba(255,230,150,0.9)'); grad.addColorStop(1,'rgba(255,120,60,0.0)'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(ex.x,ex.y,Math.max(0.0001,r),0,Math.PI*2); ctx.fill(); ctx.restore(); }

    // debris
    for(const d of debris){
      ctx.globalAlpha = Math.max(0, d.ttl/0.4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(d.x-1, d.y-1, 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function roundedRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }

  function startGame(){ startOverlay.style.display='none'; gameOverOverlay.style.display='none'; resumeOverlay.style.display='none'; running=true; paused=false; awaitingResume=false; resetWorld(); last=performance.now(); requestAnimationFrame(loop); }
  function endGame(won){
    running=false;
    gameOverTitle.textContent = won?'You Win!':'Game Over';
    finalStats.textContent = `Final Score: ${world.score} — Wave ${world.wave}`;
    gameOverOverlay.style.display='grid';
    AudioFX.gameOver();
    // Post score to WP if available
    try{ if(window.BOSS_INVADERS_SEND_SCORE) window.BOSS_INVADERS_SEND_SCORE(world.score, world.wave); }catch(_){}
  }
  function togglePause(){ if(!running) return; paused=!paused; pauseBtn.textContent = paused? 'Resume (P)' : 'Pause (P)'; }

  // Expose a safe global pause so external UI (e.g., leaderboard) can pause gameplay
  window.BOSS_INVADERS_PAUSE = function(){
    try { if (running && !paused) togglePause(); } catch(_){}
  };
  function hardReset(){ running=false; paused=false; awaitingResume=false; startOverlay.style.display='grid'; gameOverOverlay.style.display='none'; resumeOverlay.style.display='none'; }
  function resetWorld(){ 
    world.score=0; 
    world.lives=3; 
    world.wave=1; 
    scoreEl.textContent=world.score; 
    livesEl.textContent=world.lives; 
    waveEl.textContent=world.wave; 
    player.reset(); 
    bullets.length=0; 
    enemyBullets.length=0; 
    bossBullets.length=0; 
    explosions.length=0;
    
    // Reset shield energy
    for(const shield of shields){
      shield.energy = shield.maxEnergy;
      shield.lastRegenTime = 0;
    }
    debris.length=0;
    buildShields();
    spawnWave(world.wave); t=0; }

  // Buttons
  startBtn.addEventListener('click', startGame);
  playAgainBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  resetBtn.addEventListener('click', hardReset);
  nextBtn.addEventListener('click', ()=>{ resumeOverlay.style.display='none'; paused=false; awaitingResume=false; });

  // Idle state
  hardReset();
})();
