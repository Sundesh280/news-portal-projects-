/* data.js — Nepal Khabar (PHP + MySQL backend) */
const DB = {
  _get(file, params) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "php/" + file + ".php?" + params, false);
    xhr.send();
    try {
      return JSON.parse(xhr.responseText);
    } catch (e) {
      return null;
    }
  },
  _post(file, params, body) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "php/" + file + ".php?" + params, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body || {}));
    try {
      return JSON.parse(xhr.responseText);
    } catch (e) {
      return null;
    }
  },

  /* Articles */
  getArticles() {
    var r = this._get("articles", "action=get_all");
    return r && r.ok ? r.articles : [];
  },
  getArticleById(id) {
    var r = this._get(
      "articles",
      "action=get_one&id=" + encodeURIComponent(id),
    );
    return r && r.ok ? r.article : null;
  },
  addArticle(a) {
    var r = this._post("articles", "action=add", a);
    if (r && r.ok) {
      a.id = r.id;
      a.date = new Date().toISOString().slice(0, 10);
      a.views = 0;
    }
    return a;
  },
  updateArticle(id, data) {
    data.id = id;
    var r = this._post("articles", "action=update", data);
    return r && r.ok;
  },
  deleteArticle(id) {
    this._get("articles", "action=delete&id=" + encodeURIComponent(id));
  },
  incrementViews(id) {
    this._get(
      "articles",
      "action=increment_views&id=" + encodeURIComponent(id),
    );
  },
  toggleStop(id) {
    this._get("articles", "action=toggle_stop&id=" + encodeURIComponent(id));
  },

  /* Users */
  getUsers() {
    var r = this._get("users", "action=get_all");
    return r && r.ok ? r.users : [];
  },
  registerUser(name, email, password) {
    var r = this._post("users", "action=register", { name, email, password });
    return r && r.ok
      ? { ok: true }
      : { ok: false, error: r && r.error ? r.error : "Registration failed." };
  },
  loginUser(email, password) {
    var r = this._post("users", "action=login", { email, password });
    if (r && r.ok) {
      sessionStorage.setItem("nk__session", JSON.stringify(r.user));
      return { ok: true, user: r.user };
    }
    return { ok: false, error: r && r.error ? r.error : "Login failed." };
  },
  logout() {
    this._get("users", "action=logout");
    sessionStorage.removeItem("nk__session");
  },
  adminLogout() {
    this._get("users", "action=admin_logout");
    sessionStorage.removeItem("nk__admin_session");
  },
  getSession() {
    var c = sessionStorage.getItem("nk__session");
    if (c) {
      try {
        return JSON.parse(c);
      } catch (e) {}
    }
    var r = this._get("users", "action=get_session");
    if (r && r.ok && r.user) {
      sessionStorage.setItem("nk__session", JSON.stringify(r.user));
      return r.user;
    }
    return null;
  },
  getAdminSession() {
    var c = sessionStorage.getItem("nk__admin_session");
    if (c) {
      try {
        return JSON.parse(c);
      } catch (e) {}
    }
    var r = this._get("users", "action=get_admin_session");
    if (r && r.ok && r.user) {
      sessionStorage.setItem("nk__admin_session", JSON.stringify(r.user));
      return r.user;
    }
    return null;
  },
  deleteUser(id) {
    this._get("users", "action=delete&id=" + encodeURIComponent(id));
  },
  saveUsers() {},

  /* Comments */
  getComments(articleId) {
    var r = this._get(
      "comments",
      "action=get&article_id=" + encodeURIComponent(articleId),
    );
    return r && r.ok ? r.comments : [];
  },
  addComment(articleId, text) {
    var s = this.getSession();
    if (!s) return { ok: false, error: "Login required." };
    var r = this._post("comments", "action=add", { articleId, text });
    return r && r.ok
      ? { ok: true, comment: r.comment }
      : { ok: false, error: r && r.error ? r.error : "Failed." };
  },
  editComment(commentId, text) {
    var s = this.getSession();
    if (!s) return { ok: false, error: "Login required." };
    var r = this._post("comments", "action=edit", { id: commentId, text });
    return r && r.ok
      ? { ok: true }
      : { ok: false, error: r && r.error ? r.error : "Failed." };
  },
  deleteComment(commentId) {
    this._get("comments", "action=delete&id=" + encodeURIComponent(commentId));
  },
  getAllComments() {
    var r = this._get("comments", "action=get_all");
    return r && r.ok ? r.comments : {};
  },

  /* Submissions */
  getSubmissions() {
    var r = this._get("submissions", "action=get_all");
    return r && r.ok ? r.submissions : [];
  },
  addSubmission(data) {
    var r = this._post("submissions", "action=add", data);
    return r && r.ok ? { id: r.id } : null;
  },
  updateSubmissionStatus(id, status) {
    this._post("submissions", "action=update_status", { id, status });
  },
  deleteSubmission(id) {
    this._get("submissions", "action=delete&id=" + encodeURIComponent(id));
  },

  /* Ticker */
  getTickerHeadlines() {
    var r = this._get("ticker", "action=get_all");
    return r && r.ok
      ? { headlines: r.headlines, allStopped: r.allStopped }
      : { headlines: [], allStopped: false };
  },
  addTickerHeadline(text) {
    return this._post("ticker", "action=add", { text });
  },
  rewriteTickerHeadline(id, text) {
    return this._post("ticker", "action=rewrite", { id, text });
  },
  toggleTickerHeadline(id) {
    return this._get("ticker", "action=toggle&id=" + encodeURIComponent(id));
  },
  toggleAllTicker() {
    return this._get("ticker", "action=toggle_all");
  },
  deleteTickerHeadline(id) {
    return this._get("ticker", "action=delete&id=" + encodeURIComponent(id));
  },
};