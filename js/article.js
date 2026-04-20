/* article.js */
function openArticle(id) {
  var art = DB.getArticleById(id);
  if (!art) return;
  DB.incrementViews(id);
  document.getElementById('homeView').style.display   = 'none';
  document.getElementById('articleView').style.display = '';
  updateHeaderAuth();
  document.getElementById('artCategory').textContent  = art.category;
  document.getElementById('artCategory').className    = 'cat-badge cat-'+art.category;
  document.getElementById('artTitleEn').textContent   = art.titleEn || art.title || '';
  document.getElementById('artTitle').textContent     = art.title   || '';
  document.getElementById('artSummaryEn').textContent = art.summaryEn || art.summary || '';
  document.getElementById('artAuthor').textContent    = art.author || '';
  document.getElementById('artDate').textContent      = art.date   || '';
  document.getElementById('artViews').textContent     = (art.views || 0) + ' views';
  document.getElementById('artImage').src             = art.image  || '';
  var body  = art.contentEn || art.content || '';
  var bodyEl = document.getElementById('artBody');
  bodyEl.innerHTML = body.split(/\n\n+/).map(function(p){ return '<p>'+escHtml(p.trim())+'</p>'; }).join('');
  var url = encodeURIComponent(window.location.href.split('?')[0]+'?article='+id);
  var title = encodeURIComponent(art.titleEn || art.title || '');
  document.getElementById('shareFacebook').href = 'https://www.facebook.com/sharer/sharer.php?u='+url;
  document.getElementById('shareWhatsapp').href = 'https://wa.me/?text='+title+'%20'+url;
  document.getElementById('shareTwitter').href  = 'https://twitter.com/intent/tweet?text='+title+'&url='+url;
  loadComments(id);
  window.scrollTo({top:0,behavior:'smooth'});
}

document.addEventListener('DOMContentLoaded', function() {
  var backBtn = document.getElementById('backToHome');
  if (backBtn) backBtn.addEventListener('click', function(e){ e.preventDefault(); closeArticle(); });
  var logoHome = document.getElementById('logoHome');
  if (logoHome) logoHome.addEventListener('click', function(){ closeArticle(); });
  var commentSubmit = document.getElementById('commentSubmit');
  if (commentSubmit) {
    commentSubmit.addEventListener('click', function() {
      var artId = commentSubmit.dataset.artId;
      var text  = document.getElementById('commentText').value.trim();
      if (!text) return;
      var result = DB.addComment(artId, text);
      if (!result.ok) { document.getElementById('commentMsg').textContent=result.error; document.getElementById('commentMsg').className='form-msg error'; return; }
      document.getElementById('commentText').value='';
      loadComments(artId);
    });
  }
  var params = new URLSearchParams(window.location.search);
  if (params.get('article')) openArticle(params.get('article'));
});

function closeArticle() {
  document.getElementById('articleView').style.display = 'none';
  document.getElementById('homeView').style.display   = '';
}

function loadComments(artId) {
  var session     = DB.getSession();
  // Only show session if it's a regular user (not admin leaking into user panel)
  var userSession = (session && session.role !== 'admin') ? session : null;
  var commentForm = document.getElementById('commentForm');
  var commentLocked = document.getElementById('commentLocked');
  var commentList = document.getElementById('commentList');
  var submitBtn   = document.getElementById('commentSubmit');
  if (submitBtn) submitBtn.dataset.artId = artId;
  if (userSession) {
    if (commentForm)   commentForm.style.display   = '';
    if (commentLocked) commentLocked.style.display = 'none';
  } else {
    if (commentForm)   commentForm.style.display   = 'none';
    if (commentLocked) commentLocked.style.display = '';
  }
  var comments = DB.getComments(artId);
  if (!commentList) return;
  if (comments.length === 0) { commentList.innerHTML='<p style="color:#aaa;font-size:0.88rem;">No comments yet.</p>'; return; }
  commentList.innerHTML = comments.map(function(c){
    var isOwner = userSession && (userSession.id === c.userId || userSession.role === 'admin');
    var actionsHtml = isOwner ? '<div class="comment-actions"><button class="btn-edit-comment" onclick="editCommentUI(\''+artId+'\', \''+c.id+'\')">Edit</button> <button class="btn-delete-comment" onclick="deleteCommentUI(\''+artId+'\', \''+c.id+'\')">Delete</button></div>' : '';
    return '<div class="comment-item" id="comment-item-'+c.id+'"><span class="comment-name">'+escHtml(c.name)+'</span><span class="comment-date">'+escHtml(c.date)+'</span><p class="comment-text" id="comment-text-'+c.id+'">'+escHtml(c.text)+'</p>'+actionsHtml+'</div>';
  }).join('');
}

window.editCommentUI = function(artId, commentId) {
  var textEl = document.getElementById('comment-text-' + commentId);
  if (!textEl) return;
  var currentText = textEl.textContent;
  var newText = prompt("Edit your comment:", currentText);
  if (newText !== null && newText.trim() !== "") {
    var res = DB.editComment(commentId, newText.trim());
    if (res.ok) {
      loadComments(artId);
    } else {
      alert(res.error || "Failed to edit comment");
    }
  }
};

window.deleteCommentUI = function(artId, commentId) {
  if (confirm("Are you sure you want to delete this comment?")) {
    DB.deleteComment(commentId);
    loadComments(artId);
  }
};

function escHtml(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
