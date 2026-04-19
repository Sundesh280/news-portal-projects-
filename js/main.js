/* main.js */
var CATEGORIES = ['general','business','technology','science','health','sports','entertainment'];
var CAT_LABELS = {general:'Top Stories',business:'Business',technology:'Technology',science:'Science',health:'Health',sports:'Sports',entertainment:'Entertainment'};
var currentCat = 'general';

function applyTickerState() {
  var td = DB.getTickerHeadlines();
  var allStopped = td.allStopped;
  var headlines  = td.headlines || [];
  var ticker = document.querySelector('.ticker-bar');
  if (!ticker) return;
  var label  = ticker.querySelector('.ticker-label');
  var active = allStopped ? [] : headlines.filter(function(h){ return h.active; });
  var track  = document.getElementById('tickerTrack');
  if (track) {
    track.innerHTML = active.length > 0
      ? active.map(function(h){ return '<span class="ticker-item">'+h.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span>'; }).join('')
      : '<span class="ticker-item">— No active breaking news —</span>';
  }
  if (allStopped || active.length === 0) {
    ticker.classList.add('ticker-paused');
    if (label) label.textContent = '⏹ Breaking';
  } else {
    ticker.classList.remove('ticker-paused');
    if (label) label.textContent = '🔴 Breaking';
  }
}

function getStoppedIds() {
  return DB.getArticles().filter(function(a){ return a.isStopped; }).map(function(a){ return a.id; });
}

document.addEventListener('DOMContentLoaded', function() {
  applyTickerState();
  buildCategoryNav();
  renderArticles(currentCat);
  buildSidebar();

  var dateEl = document.getElementById('topBarDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-NP',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  var session   = DB.getSession();
  var loginLink = document.getElementById('topBarLogin');
  var regLink   = document.getElementById('topBarRegister');
  var userInfo  = document.getElementById('topBarUserInfo');
  var userName  = document.getElementById('topBarUserName');
  var logoutBtn = document.getElementById('topBarLogout');
  var showSess  = !!session;
  if (showSess) {
    if (loginLink) loginLink.style.display='none';
    if (regLink)   regLink.style.display='none';
    if (userInfo)  userInfo.style.display='inline';
    if (userName)  userName.textContent=session.name+(session.role==='admin'?' (Admin)':'');
  } else {
    if (loginLink) loginLink.style.display='inline-flex';
    if (regLink)   regLink.style.display='inline-flex';
    if (userInfo)  userInfo.style.display='none';
  }
  if (logoutBtn) logoutBtn.addEventListener('click',function(e){ e.preventDefault(); DB.logout(); window.location.reload(); });
});

function buildCategoryNav() {
  var nav = document.getElementById('categoryNav');
  if (!nav) return;
  nav.innerHTML = '';
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'nav-btn'+(cat===currentCat?' active':'');
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS[cat];
    btn.addEventListener('click', function() {
      currentCat = cat;
      document.querySelectorAll('.nav-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var h = document.getElementById('sectionHeading');
      if (h) h.textContent = CAT_LABELS[cat];
      renderArticles(cat);
    });
    nav.appendChild(btn);
  });
}

function renderArticles(cat) {
  var heroContainer = document.getElementById('heroContainer');
  var grid = document.getElementById('newsGrid');
  if (!grid) return;
  var stopped  = getStoppedIds();
  var all      = DB.getArticles();
  var filtered = (cat==='general' ? all : all.filter(function(a){ return a.category===cat; })).filter(function(a){ return !stopped.includes(a.id); });
  if (filtered.length===0) {
    if (heroContainer) heroContainer.innerHTML='';
    grid.innerHTML='<p class="empty-msg">No articles in this category yet.</p>'; return;
  }
  var featured = filtered[0], rest = filtered.slice(1);
  var heroHtml = '<div class="hero-card" onclick="openArticle(\''+featured.id+'\')">'
    +'<div class="hero-img-wrap"><img src="'+featured.image+'" alt="" onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80\'" /></div>'
    +'<div class="hero-body">'
    +'<h2 class="hero-title">'+escHtml(featured.titleEn)+'</h2>'
    +'<p class="hero-summary">'+escHtml(featured.summaryEn)+'</p>'
    +'<div class="hero-labels"><span class="hero-badge">TOP STORIES</span><span class="hero-category-pill">'+CAT_LABELS[featured.category]+'</span></div>'
    +'<div class="hero-meta"><span>👤 '+escHtml(featured.author)+'</span><span>🕐 '+featured.date+'</span></div>'
    +'<div class="hero-scroll-hint">↓ Scroll for more stories</div>'
    +'</div></div>';
  if (heroContainer) heroContainer.innerHTML = heroHtml;
  var html = rest.length > 0 ? '<div class="cards-grid">' : '';
  rest.forEach(function(art) {
    html += '<div class="news-card" onclick="openArticle(\''+art.id+'\')"><div class="card-img-wrap"><img src="'+art.image+'" alt="" onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=60\'" /></div><div class="card-body"><span class="cat-badge cat-'+art.category+'">'+CAT_LABELS[art.category]+'</span><h3 class="card-title">'+escHtml(art.titleEn)+'</h3><p class="card-summary">'+escHtml(art.summaryEn)+'</p><div class="meta"><span>✍ '+escHtml(art.author)+'</span><span>📅 '+art.date+'</span></div><button class="read-more-btn" onclick="event.stopPropagation();openArticle(\''+art.id+'\')">Read More →</button></div></div>';
  });
  if (rest.length > 0) html += '</div>';
  grid.innerHTML = html;
}

function buildSidebar() {
  var stopped = getStoppedIds();
  var visible = DB.getArticles().filter(function(a){ return !stopped.includes(a.id); });
  var mostRead = visible.slice().sort(function(a,b){ return b.views-a.views; }).slice(0,5);
  var latest   = visible.slice().sort(function(a,b){ return b.date>a.date?1:-1; }).slice(0,5);
  buildSidebarList('mostReadList', mostRead, true);
  buildSidebarList('latestList',   latest,   false);
}
function buildSidebarList(id, articles, showRank) {
  var el = document.getElementById(id);
  if (!el) return;
  var html = '';
  articles.forEach(function(art, i) {
    html += '<div class="sidebar-article-item" onclick="openArticle(\''+art.id+'\')"><img src="'+art.image+'" alt="" onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60\'" />';
    if (showRank) html += '<div class="sidebar-rank">'+(i+1)+'</div>';
    html += '<div class="sidebar-article-item-body"><div class="sidebar-article-item-title">'+escHtml(art.titleEn)+'</div><div class="sidebar-article-item-meta">📅 '+art.date+' · 👁 '+art.views+'</div></div></div>';
  });
  el.innerHTML = html;
}
function escHtml(s){ if(!s)return''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
