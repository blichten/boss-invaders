<?php
// Standalone Boss Invaders page
// Directory layout expected:
// /boss-invaders/
//   boss-invaders.php
//   assets/
//     css/boss-invaders.css
//     js/boss-invaders.js
//     img/*.png
//     sfx/*.wav
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boss Invaders</title>
  <link rel="preload" href="assets/img/vlp-ship.png" as="image">
  <link rel="preload" href="assets/img/megatron-1.png" as="image">
  <link rel="stylesheet" href="assets/css/boss-invaders.css?v=0.1.2" />
  <script>
    // Let JS know where the asset root lives (relative to THIS file)
    window.BOSS_INVADERS = { assetBase: 'assets/' };
  </script>
</head>
<body>
  <div class="boss-invaders-wrap">
    <img id="cornerLogo" src="assets/img/vlp-logo.png" alt="Virtual Leadership Programs Logo" />

    <div class="points-list">
      <div class="point-item"><img src="assets/img/michael-scott-1.png" width="60" alt="Michael Scott"> 10 pts</div>
      <div class="point-item"><img src="assets/img/mr-burns-1.png" width="60" alt="Mr Burns"> 20 pts</div>
      <div class="point-item"><img src="assets/img/bill-lumbergh-1.png" width="60" alt="Bill Lumbergh"> 30 pts</div>
      <div class="point-item"><img src="assets/img/miranda-priestly-1.png" width="60" alt="Miranda Priestly"> 40 pts</div>
      <div class="point-item"><img src="assets/img/megatron-1.png" width="60" alt="Megatron"> 100 pts</div>
    </div>

    <div class="right-cta">
      <div class="right-cta-inner">
        Got Bad Boss Behaviors invading your workplace?
        <br/>
        Get <a href="https://VirtualLeadershipPrograms.com" target="_blank" rel="noopener noreferrer">Virtual Leadership Programs</a>
      </div>
    </div>

    <div class="wrap">
      <div class="game-title">BOSS INVADERS</div>
      <div class="score-display">
        <div class="chip">Score: <span id="score">0</span></div>
      </div>
      <canvas id="game" width="800" height="600" aria-label="Boss Invaders"></canvas>
      <div class="controls">
        <div class="chip">Lives: <span id="lives">3</span></div>
        <div class="chip">Wave: <span id="wave">1</span></div>
        <button id="pauseBtn" class="btn">Pause (P)</button>
        <button id="resetBtn" class="btn" title="Reset game">Reset</button>
      </div>
      <div class="player-bar" style="display:flex;gap:12px;align-items:center;justify-content:center;margin-top:10px;flex-wrap:wrap">
        <div class="chip">Player: <span id="playerNameLabel">Not signed in</span></div>
        <button id="leaderboardBtn" class="btn" type="button">Leaderboard</button>
        <button id="logoutBtn" class="btn" type="button" title="Clear player and prompt signup next time">Logout</button>
      </div>
    </div>

    <!-- Overlays -->
    <div class="overlay overlay--solid" id="startOverlay">
      <div class="panel">
        <div class="hero-header">
          <img src="assets/img/boss-invaders-header.webp" alt="Boss Invaders - Leadership Game" class="hero-image">
        </div>
        <p>Bad Boss Behaviors kill morale, productivity, and results. In Boss Invaders, your shields are are the tools of <a href="https://virtualleadershipprograms.com" target="_blank">Virtual Leadership Programs</a>: Coaching, Goals, and Feedback. Defend your team, protect your culture, and blast those bad boss behaviors out of the workplace.</p>
        <h3>DIRECTIONS</h3>
        <p><span class="kbd">←</span>/<span class="kbd">A</span> move left • <span class="kbd">→</span>/<span class="kbd">D</span> move right • <span class="kbd">Space</span> shoot • <span class="kbd">P</span> pause</p>
        <div class="row">
            <button id="startBtn" class="btn">Start</button>
            <button id="heroLeaderboard" class="btn" type="button" style="background:#25308a">Leaderboard</button>
        </div>
      </div>
    </div>

    <div class="overlay" id="gameOverOverlay" style="display:none">
      <div class="panel">
        <h1 id="gameOverTitle">Game Over</h1>
        <p id="finalStats"></p>
        <div class="row">
          <button id="playAgainBtn" class="btn">Play Again</button>
          <button id="endGameBtn" class="btn" style="background:#0066ff">End Game</button>
        </div>
      </div>
    </div>

    <div class="overlay" id="resumeOverlay" style="display:none">
      <div class="panel">
        <h1>Life Lost</h1>
        <p>Press Next to continue</p>
        <div class="row"><button id="nextBtn" class="btn">Next</button></div>
      </div>
    </div>
    <!-- On-screen mobile controls (shown on small screens via CSS/JS) -->
    <div class="mobile-controls" id="mobileControls" aria-hidden="true">
      <div class="mc-btn mc-left"  id="mcLeft"  role="button" aria-label="Move left">&larr;</div>
      <div class="mc-btn mc-fire"  id="mcFire"  role="button" aria-label="Fire">FIRE</div>
      <div class="mc-btn mc-right" id="mcRight" role="button" aria-label="Move right">&rarr;</div>
    </div>
  </div>
  <script src="assets/js/boss-invaders.js?v=0.1.2"></script>
  <script>
  (function(){
    const SIGNUP_URL = 'https://staging9.virtualleadershipprograms.com/boss-invaders-signup/';
    const HS_API = 'https://staging9.virtualleadershipprograms.com/wp-json/boss-invaders/v1/high-scores';
    let playerName = localStorage.getItem('bi_name') || null;
    let playerToken = localStorage.getItem('bi_token') || null;

    // UI refs
    const playerNameLabel = document.getElementById('playerNameLabel');
    const logoutBtn = document.getElementById('logoutBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const startBtn = document.getElementById('startBtn');

    // Mobile detection and directions update
    function updateDirectionsForMobile() {
      const directionsElement = document.querySelector('#startOverlay .panel p:last-of-type');
      if (!directionsElement) return;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      (window.innerWidth <= 820) || 
                      ('ontouchstart' in window);
      
      if (isMobile) {
        directionsElement.innerHTML = 'Use <span class="kbd">arrow buttons</span> to move left or right and <span class="kbd">fire button</span> to shoot.';
      } else {
        directionsElement.innerHTML = '<span class="kbd">←</span>/<span class="kbd">A</span> move left • <span class="kbd">→</span>/<span class="kbd">D</span> move right • <span class="kbd">Space</span> shoot • <span class="kbd">P</span> pause';
      }
    }

    function syncPlayerUI(){
      if(playerNameLabel) playerNameLabel.textContent = playerName || 'Not signed in';
    }
    syncPlayerUI();

    // Initialize mobile directions and handle resize
    updateDirectionsForMobile();
    window.addEventListener('resize', updateDirectionsForMobile);
    window.addEventListener('orientationchange', () => setTimeout(updateDirectionsForMobile, 100));

    function showSignupOverlay(){
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;';
      const frame = document.createElement('iframe');
      frame.src = SIGNUP_URL;
      frame.style.cssText = 'width:100%;max-width:520px;height:auto;min-height:600px;border:0;border-radius:8px;box-shadow:0 0 20px rgba(0,0,0,0.8);background:#fff;';
      overlay.appendChild(frame);
      document.body.appendChild(overlay);

      window.addEventListener('message', function handler(ev){
        if(ev.data && ev.data.type === 'boss-invaders:registered'){
          playerName = ev.data.name;
          playerToken = ev.data.token;
          localStorage.setItem('bi_name', playerName);
          localStorage.setItem('bi_token', playerToken);
          syncPlayerUI();
          allowStart = true; // allow the native start handler to run now
          document.body.removeChild(overlay);
          window.removeEventListener('message', handler);
          // auto-start the game if startOverlay is present
          const startBtn = document.getElementById('startBtn');
          if(startBtn) setTimeout(()=>startBtn.click(), 0);
        }
      });
    }

    // Intercept start button to require signup if no token
    let allowStart = !!playerToken;
    if(startBtn){
      const guardStart = function(ev){
        if(!allowStart){
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
          showSignupOverlay();
        }
      };
      // Capture phase to pre-empt any other listeners
      startBtn.addEventListener('click', guardStart, true);
    }

    if(logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        localStorage.removeItem('bi_name');
        localStorage.removeItem('bi_token');
        playerName = null; playerToken = null;
        syncPlayerUI();
        // prevent immediate start until new signup
        allowStart = false;
        // optionally show the start overlay again
        const so = document.getElementById('startOverlay');
        if(so) so.style.display = 'grid';
      });
    }

    function showLeaderboard(){
      // Pause gameplay while leaderboard is open (if available)
      try { if (window.BOSS_INVADERS_PAUSE) window.BOSS_INVADERS_PAUSE(); } catch(_){}
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
      const panel = document.createElement('div');
      panel.style.cssText = 'background:#0b1021;border:1px solid #25308a;border-radius:12px;color:#fff;max-width:720px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 12px 30px rgba(0,0,0,.6);';
      panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #25308a"><strong>Leaderboard</strong><button id="lbClose" class="btn" style="background:#FF6600">Close</button></div><div id="lbBody" style="padding:12px 14px;">Loading…</div>';
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      function render(items){
        if(!items || !items.length){
          body.innerHTML = '<p>No scores yet. Be the first!</p>';
          return;
        }
        const rows = items.map((r,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(r.name||'Player')}</td><td>${r.score|0}</td><td>${r.wave|0}</td><td>${new Date(r.created_at).toLocaleDateString()}</td></tr>`).join('');
        body.innerHTML = `<table class="bil-highscores" style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #25308a">Rank</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #25308a">Name</th><th style="text-align:right;padding:6px 8px;border-bottom:1px solid #25308a">Score</th><th style="text-align:right;padding:6px 8px;border-bottom:1px solid #25308a">Wave</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #25308a">Date</th></tr></thead><tbody>${rows}</tbody></table>`;
        // right-align numbers
        panel.querySelectorAll('td:nth-child(3), td:nth-child(4)').forEach(td=>td.style.textAlign='right');
      }
      function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

      const body = panel.querySelector('#lbBody');
      fetch(HS_API).then(r=>r.json()).then(data=>{
        if(data && data.ok) render(data.items); else body.textContent='Unable to load scores.';
      }).catch(()=>{ body.textContent='Unable to load scores.'; });

      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
      panel.querySelector('#lbClose').addEventListener('click', ()=> overlay.remove());
    }

    if(leaderboardBtn){
      leaderboardBtn.addEventListener('click', (e)=>{ e.preventDefault(); showLeaderboard(); });
    }

    // End Game button in game over modal
    const endGameBtn = document.getElementById('endGameBtn');
    if(endGameBtn){
      endGameBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        // Hide the game over modal
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        if(gameOverOverlay) gameOverOverlay.style.display = 'none';
        // Show the leaderboard
        showLeaderboard();
      });
    }

    // Also open leaderboard from the hero modal (pre-start)
    const heroLB = document.getElementById('heroLeaderboard');
    if (heroLB) heroLB.addEventListener('click', (e)=>{ e.preventDefault(); showLeaderboard(); });

    // Expose function to send score to WP
    window.BOSS_INVADERS_SEND_SCORE = async function(score, wave){
      if(!playerToken) return;
      try{
        await fetch('https://staging9.virtualleadershipprograms.com/wp-json/boss-invaders/v1/score', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ token: playerToken, score, wave })
        });
      }catch(err){
        console.error('Error posting score', err);
      }
    }
  })();
  </script>
</body>
</html>