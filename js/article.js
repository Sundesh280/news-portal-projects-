/* article.js - Handles opening, closing, and commenting on a single article */

// Open and display a full article
function openArticle(id) {
  var art = DB.getArticleById(id);
  if (!art) return; // Article not found, do nothing

  // Count this as one view
  DB.incrementViews(id);

  // Hide the home page, show the article page
  document.getElementById("homeView").style.display    = "none";
  document.getElementById("articleView").style.display = "";

  // Update the login/logout buttons in the header
  updateHeaderAuth();

  // Fill in article details on the page
  document.getElementById("artCategory").textContent = art.category;
  document.getElementById("artCategory").className   = "cat-badge cat-" + art.category;

  // Use currentLang from lang-toggle.js if available
  var lang = (typeof currentLang !== "undefined") ? currentLang : "en";

  // If Nepali mode and applyArticleLang exists, use it (handles auto-translation)
  if (lang === "ne" && typeof applyArticleLang === "function") {
    document.getElementById("artAuthor").textContent   = art.author   || "";
    document.getElementById("artDate").textContent     = art.date     || "";
    var viewsLabel = typeof t === "function" ? t("views") : "views";
    document.getElementById("artViews").textContent    = (art.views   || 0) + " " + viewsLabel;
    document.getElementById("artImage").src            = art.image    || "";
    applyArticleLang(id);
  } else {
    document.getElementById("artTitleEn").textContent  = art.titleEn  || art.title   || "";
    document.getElementById("artTitle").textContent    = art.title    || "";
    document.getElementById("artSummaryEn").textContent = art.summaryEn || art.summary || "";
    document.getElementById("artAuthor").textContent   = art.author   || "";
    document.getElementById("artDate").textContent     = art.date     || "";
    document.getElementById("artViews").textContent    = (art.views   || 0) + " views";
    document.getElementById("artImage").src            = art.image    || "";

    var rawText = art.contentEn || art.content || art.summaryEn || art.summary || "";
    if (rawText.toUpperCase().indexOf("ONLY AVAILABLE IN PAID PLANS") !== -1) {
      rawText = art.summaryEn || art.summary || "";
    }

    var bodyText = rawText;

    var cutIndex = bodyText.indexOf("[+");
    if (cutIndex !== -1 && bodyText.indexOf("chars]") !== -1) {
      bodyText = bodyText.substring(0, cutIndex).trim();
    }

    var paragraphs = bodyText.split("\n\n");
    if (paragraphs.length <= 1) {
      paragraphs = bodyText.split("\n");
    }

    if (paragraphs.length <= 1 && bodyText.length > 400) {
      var sentences = bodyText.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 3) {
        paragraphs = [];
        var chunk = "";
        for (var s = 0; s < sentences.length; s++) {
          chunk += sentences[s];
          if ((s + 1) % 3 === 0) {
            paragraphs.push(chunk.trim());
            chunk = "";
          }
        }
        if (chunk.trim() !== "") {
          paragraphs.push(chunk.trim());
        }
      }
    }

    var bodyHtml = "";
    for (var i = 0; i < paragraphs.length; i++) {
      var para = paragraphs[i].trim();
      if (para !== "") {
        if (typeof isCodeJunk === "function" && isCodeJunk(para)) {
          continue;
        }
        if (para.toLowerCase().startsWith("source: http")) {
          continue;
        }
        bodyHtml += "<p>" + escHtml(para) + "</p>";
      }
    }

    if (!bodyHtml) {
      bodyHtml = "<p style=\"color:#aaa;\">No article content available.</p>";
    }

    document.getElementById("artBody").innerHTML = bodyHtml;
  } // end else (English mode)

  // Build share links
  var pageUrl  = window.location.href.split("?")[0] + "?article=" + id;
  var shareUrl = encodeURIComponent(pageUrl);
  var shareTitle = encodeURIComponent(art.titleEn || art.title || "");

  document.getElementById("shareFacebook").href =
    "https://www.facebook.com/sharer/sharer.php?u=" + shareUrl;

  document.getElementById("shareWhatsapp").href =
    "https://wa.me/?text=" + shareTitle + "%20" + shareUrl;

  document.getElementById("shareTwitter").href =
    "https://twitter.com/intent/tweet?text=" + shareTitle + "&url=" + shareUrl;

  // Load comments for this article
  loadComments(id);

  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Setup buttons and check URL for article ID
document.addEventListener("DOMContentLoaded", function () {

  // Back button — goes back to the home view
  var backBtn = document.getElementById("backToHome");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeArticle();
    });
  }

  // Clicking the logo also goes back to home
  var logoHome = document.getElementById("logoHome");
  if (logoHome) {
    logoHome.addEventListener("click", function () {
      closeArticle();
    });
  }

  // Submit comment button
  var commentSubmit = document.getElementById("commentSubmit");
  if (commentSubmit) {
    commentSubmit.addEventListener("click", function () {
      var artId = commentSubmit.dataset.artId; // the article this comment belongs to
      var text  = document.getElementById("commentText").value.trim();

      if (!text) return; // Don't submit empty comment

      var result = DB.addComment(artId, text);
      if (!result.ok) {
        // Show error message
        document.getElementById("commentMsg").textContent = result.error;
        document.getElementById("commentMsg").className  = "form-msg error";
        return;
      }

      // Clear the text box and reload comments
      document.getElementById("commentText").value = "";
      loadComments(artId);
    });
  }

  // If the URL has ?article=123, open that article directly
  var search    = window.location.search;           // e.g. "?article=5"
  var params    = new URLSearchParams(search);
  var articleId = params.get("article");
  if (articleId) {
    openArticle(articleId);
  }
});

// Close article, go back to home
function closeArticle() {
  document.getElementById("articleView").style.display = "none";
  document.getElementById("homeView").style.display   = "";
}

// Load and show comments for an article
function loadComments(artId) {
  var session     = DB.getSession();
  var userSession = null;

  // Only treat as logged in if it's a regular user (not admin)
  if (session && session.role !== "admin") {
    userSession = session;
  }

  var commentForm   = document.getElementById("commentForm");
  var commentLocked = document.getElementById("commentLocked");
  var commentList   = document.getElementById("commentList");
  var submitBtn     = document.getElementById("commentSubmit");

  // Save the article ID on the submit button so we can use it later
  if (submitBtn) submitBtn.dataset.artId = artId;

  // Show or hide the comment form depending on login status
  if (userSession) {
    if (commentForm)   commentForm.style.display   = "";
    if (commentLocked) commentLocked.style.display = "none";
  } else {
    if (commentForm)   commentForm.style.display   = "none";
    if (commentLocked) commentLocked.style.display = "";
  }

  var comments = DB.getComments(artId);
  if (!commentList) return;

  // No comments yet
  if (comments.length === 0) {
    commentList.innerHTML = '<p style="color:#aaa;font-size:0.88rem;">No comments yet.</p>';
    return;
  }

  // Build HTML for each comment using a simple for loop
  var html = "";
  for (var i = 0; i < comments.length; i++) {
    var c = comments[i];

    // Check if this user owns the comment (can edit/delete)
    var isOwner = false;
    if (userSession) {
      if (userSession.id === c.userId || userSession.role === "admin") {
        isOwner = true;
      }
    }

    // Build edit/delete buttons if the user owns this comment
    var actionsHtml = "";
    if (isOwner) {
      actionsHtml = '<div class="comment-actions">'
        + '<button class="btn-edit-comment" onclick="editCommentUI(\'' + artId + "', '" + c.id + '\')">Edit</button> '
        + '<button class="btn-delete-comment" onclick="deleteCommentUI(\'' + artId + "', '" + c.id + '\')">Delete</button>'
        + '</div>';
    }

    // Build the comment card HTML
    html += '<div class="comment-item" id="comment-item-' + c.id + '">'
      + '<span class="comment-name">' + escHtml(c.name) + '</span>'
      + '<span class="comment-date">' + escHtml(c.date) + '</span>'
      + '<p class="comment-text" id="comment-text-' + c.id + '">' + escHtml(c.text) + '</p>'
      + actionsHtml
      + '</div>';
  }

  commentList.innerHTML = html;
}

// Edit a comment via prompt
window.editCommentUI = function (artId, commentId) {
  var textEl = document.getElementById("comment-text-" + commentId);
  if (!textEl) return;

  var currentText = textEl.textContent;
  var newText = prompt("Edit your comment:", currentText);

  // Only save if user typed something and clicked OK
  if (newText !== null && newText.trim() !== "") {
    var result = DB.editComment(commentId, newText.trim());
    if (result.ok) {
      loadComments(artId); // reload comments to show update
    } else {
      alert(result.error || "Failed to edit comment");
    }
  }
};

// Delete a comment with confirmation
window.deleteCommentUI = function (artId, commentId) {
  var confirmed = confirm("Are you sure you want to delete this comment?");
  if (confirmed) {
    DB.deleteComment(commentId);
    loadComments(artId); // reload comments to remove deleted one
  }
};

// Escape HTML special characters
function escHtml(text) {
  if (!text) return "";
  var safe = String(text);
  safe = safe.replace(/&/g, "&amp;");
  safe = safe.replace(/</g, "&lt;");
  safe = safe.replace(/>/g, "&gt;");
  safe = safe.replace(/"/g, "&quot;");
  return safe;
}

// Check if text looks like code/script junk
function isCodeJunk(text) {
  if (!text || text.length < 5) return false;

  // Patterns that strongly indicate code (JS, JSON, etc.)
  var codePatterns = [
    /\{"[\w\-]+":/i,          // JSON start
    /function\s*[\w\$]*\(/i,  // Function definition
    /var\s+[\w\$]+\s*=/i,     // Variable assignment
    /let\s+[\w\$]+\s*=/i,
    /const\s+[\w\$]+\s*=/i,
    /\.getAttribute\(/i,       // DOM manipulation
    /\.innerHTML\s*=/i,
    /return\s+[\w\$]+/i,      // Return statement
    /\(function\(e,t,n\)\{/i, // Minified wrapper
    /window\.\w+/i,           // Window object
    /document\.\w+/i,         // Document object
    /if\s*\(.*\)\s*\{/i       // If block
  ];

  for (var i = 0; i < codePatterns.length; i++) {
    if (codePatterns[i].test(text)) return true;
  }

  // Check for excessive special characters (code density)
  var specialChars = (text.match(/[\{\}\(\);=\[\]\$\|&\!\>\<\*\+]/g) || []).length;
  // If more than 12% of text is special characters, it's probably code
  if (specialChars > text.length * 0.12) return true;

  // Check for very long words without spaces (often minified code)
  var words = text.split(/\s+/);
  for (var j = 0; j < words.length; j++) {
    if (words[j].length > 40 && words[j].indexOf("/") === -1) return true;
  }

  return false;
}
