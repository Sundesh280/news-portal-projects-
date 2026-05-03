/* data.js - Nepal Khabar (PHP + MySQL backend)
   This file handles all communication between the browser and the server.
   DB is an object that holds all the functions we need to get/save data.
*/

var DB = {

  // ------------------------------------------------------------------
  // _base - Returns the folder path where PHP files are located
  // Pages at root level (index.php, etc.) use 'php/' as the prefix.
  // Pages inside the php/ folder set window.__NK_BASE = '' first.
  // ------------------------------------------------------------------
  _base: function () {
    if (typeof window.__NK_BASE !== "undefined") {
      return window.__NK_BASE;
    }
    return "php/";
  },

  // ------------------------------------------------------------------
  // _get - Sends a GET request to a PHP file and returns the response
  // file   = name of the PHP file (without .php), e.g. "articles"
  // params = query string, e.g. "action=get_all"
  // ------------------------------------------------------------------
  _get: function (file, params) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", this._base() + file + ".php?" + params, false); // false = wait for response
    xhr.send();
    try {
      return JSON.parse(xhr.responseText); // convert JSON text to an object
    } catch (e) {
      return null; // return nothing if JSON is broken
    }
  },

  // ------------------------------------------------------------------
  // _post - Sends a POST request with a JSON body to a PHP file
  // file   = name of the PHP file (without .php), e.g. "users"
  // params = query string
  // body   = JavaScript object to send as JSON (the data payload)
  // ------------------------------------------------------------------
  _post: function (file, params, body) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", this._base() + file + ".php?" + params, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body || {})); // convert object to JSON text before sending
    try {
      return JSON.parse(xhr.responseText);
    } catch (e) {
      return null;
    }
  },

  // ==================== ARTICLES ====================

  // Get all articles from the server
  getArticles: function () {
    var response = this._get("articles", "action=get_all");
    if (response && response.ok) {
      return response.articles;
    }
    return []; // return empty list if something went wrong
  },

  // Get one article by its ID
  getArticleById: function (id) {
    var response = this._get("articles", "action=get_one&id=" + encodeURIComponent(id));
    if (response && response.ok) {
      return response.article;
    }
    return null;
  },

  // Add a new article
  addArticle: function (a) {
    var response = this._post("articles", "action=add", a);
    if (response && response.ok) {
      a.id    = response.id;
      a.date  = new Date().toISOString().slice(0, 10); // today's date, e.g. "2025-04-30"
      a.views = 0;
    }
    return a;
  },

  // Update an existing article
  updateArticle: function (id, data) {
    data.id = id;
    var response = this._post("articles", "action=update", data);
    if (response && response.ok) {
      return true;
    }
    return false;
  },

  // Delete an article by ID
  deleteArticle: function (id) {
    this._get("articles", "action=delete&id=" + encodeURIComponent(id));
  },

  // Add one view count to an article
  incrementViews: function (id) {
    this._get("articles", "action=increment_views&id=" + encodeURIComponent(id));
  },

  // Toggle whether an article is stopped (hidden) or active
  toggleStop: function (id) {
    this._get("articles", "action=toggle_stop&id=" + encodeURIComponent(id));
  },

  // ==================== USERS ====================

  // Get all users (admin use only)
  getUsers: function () {
    var response = this._get("users", "action=get_all");
    if (response && response.ok) {
      return response.users;
    }
    return [];
  },

  // Register a new user account
  registerUser: function (name, email, password) {
    var body = { name: name, email: email, password: password };
    var response = this._post("users", "action=register", body);
    if (response && response.ok) {
      return { ok: true };
    }
    var errorMsg = "Registration failed.";
    if (response && response.error) {
      errorMsg = response.error;
    }
    return { ok: false, error: errorMsg };
  },

  // Log in a user
  loginUser: function (email, password) {
    var body = { email: email, password: password };
    var response = this._post("users", "action=login", body);
    if (response && response.ok) {
      // Save session to browser storage so we don't have to re-check every page load
      sessionStorage.setItem("nk__session", JSON.stringify(response.user));
      return { ok: true, user: response.user };
    }
    var errorMsg = "Login failed.";
    if (response && response.error) {
      errorMsg = response.error;
    }
    return { ok: false, error: errorMsg };
  },

  // Log out the current user
  logout: function () {
    this._get("users", "action=logout");
    sessionStorage.removeItem("nk__session");
  },

  // Log out the admin
  adminLogout: function () {
    this._get("users", "action=admin_logout");
    sessionStorage.removeItem("nk__admin_session");
  },

  // Get the currently logged-in user session
  getSession: function () {
    // First check browser storage (fast, no server call)
    var stored = sessionStorage.getItem("nk__session");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Stored data was broken, ignore it
      }
    }
    // If not in storage, ask the server
    var response = this._get("users", "action=get_session");
    if (response && response.ok && response.user) {
      sessionStorage.setItem("nk__session", JSON.stringify(response.user));
      return response.user;
    }
    return null; // no one is logged in
  },

  // Get the currently logged-in admin session
  getAdminSession: function () {
    // First check browser storage
    var stored = sessionStorage.getItem("nk__admin_session");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Stored data was broken, ignore it
      }
    }
    // Ask the server
    var response = this._get("users", "action=get_admin_session");
    if (response && response.ok && response.user) {
      sessionStorage.setItem("nk__admin_session", JSON.stringify(response.user));
      return response.user;
    }
    return null;
  },

  // Delete a user by ID (admin use)
  deleteUser: function (id) {
    this._get("users", "action=delete&id=" + encodeURIComponent(id));
  },

  // Empty function kept for compatibility (no longer needed)
  saveUsers: function () {},

  // ==================== COMMENTS ====================

  // Get all comments for a specific article
  getComments: function (articleId) {
    var response = this._get("comments", "action=get&article_id=" + encodeURIComponent(articleId));
    if (response && response.ok) {
      return response.comments;
    }
    return [];
  },

  // Add a comment to an article (user must be logged in)
  addComment: function (articleId, text) {
    var session = this.getSession();
    if (!session) {
      return { ok: false, error: "Login required." };
    }
    var body = { articleId: articleId, text: text };
    var response = this._post("comments", "action=add", body);
    if (response && response.ok) {
      return { ok: true, comment: response.comment };
    }
    var errorMsg = "Failed.";
    if (response && response.error) {
      errorMsg = response.error;
    }
    return { ok: false, error: errorMsg };
  },

  // Edit an existing comment
  editComment: function (commentId, text) {
    var session = this.getSession();
    if (!session) {
      return { ok: false, error: "Login required." };
    }
    var body = { id: commentId, text: text };
    var response = this._post("comments", "action=edit", body);
    if (response && response.ok) {
      return { ok: true };
    }
    var errorMsg = "Failed.";
    if (response && response.error) {
      errorMsg = response.error;
    }
    return { ok: false, error: errorMsg };
  },

  // Delete a comment
  deleteComment: function (commentId) {
    this._get("comments", "action=delete&id=" + encodeURIComponent(commentId));
  },

  // Get all comments from all articles (admin use)
  getAllComments: function () {
    var response = this._get("comments", "action=get_all");
    if (response && response.ok) {
      return response.comments;
    }
    return {};
  },

  // ==================== SUBMISSIONS ====================

  // Get all news submissions from the public
  getSubmissions: function () {
    var response = this._get("submissions", "action=get_all");
    if (response && response.ok) {
      return response.submissions;
    }
    return [];
  },

  // Submit a new news tip
  addSubmission: function (data) {
    var response = this._post("submissions", "action=add", data);
    if (response && response.ok) {
      return { id: response.id };
    }
    return null;
  },

  // Update the status of a submission (e.g. "approved" or "rejected")
  updateSubmissionStatus: function (id, status) {
    var body = { id: id, status: status };
    this._post("submissions", "action=update_status", body);
  },

  // Delete a submission
  deleteSubmission: function (id) {
    this._get("submissions", "action=delete&id=" + encodeURIComponent(id));
  },

  // ==================== TICKER (Breaking News) ====================

  // Get all breaking news headlines
  getTickerHeadlines: function () {
    var response = this._get("ticker", "action=get_all");
    if (response && response.ok) {
      return { headlines: response.headlines, allStopped: response.allStopped };
    }
    return { headlines: [], allStopped: false };
  },

  // Add a new breaking news headline
  addTickerHeadline: function (text) {
    return this._post("ticker", "action=add", { text: text });
  },

  // Edit an existing headline text
  rewriteTickerHeadline: function (id, text) {
    return this._post("ticker", "action=rewrite", { id: id, text: text });
  },

  // Toggle one headline on or off
  toggleTickerHeadline: function (id) {
    return this._get("ticker", "action=toggle&id=" + encodeURIComponent(id));
  },

  // Toggle ALL headlines on or off at once
  toggleAllTicker: function () {
    return this._get("ticker", "action=toggle_all");
  },

  // Delete a headline
  deleteTickerHeadline: function (id) {
    return this._get("ticker", "action=delete&id=" + encodeURIComponent(id));
  }

};