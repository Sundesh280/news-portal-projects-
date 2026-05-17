/* translate.js - Auto-translation for Admin Panel
   Uses MyMemory API (via php/translate.php) to automatically translate
   between English and Nepali when the admin leaves a field (blur).
   After translation, the source field is cleared — only the translated text remains.
*/

// Translate text via our PHP proxy
function translateText(text, fromLang, toLang, callback) {
  if (!text || !text.trim()) {
    callback(null, "Nothing to translate.");
    return;
  }

  var xhr = new XMLHttpRequest();
  var url = "php/translate.php"
    + "?text=" + encodeURIComponent(text.trim())
    + "&from=" + fromLang
    + "&to=" + toLang;

  xhr.open("GET", url, true);
  xhr.timeout = 30000;

  xhr.onload = function () {
    if (xhr.status !== 200) {
      callback(null, "Server error: " + xhr.status);
      return;
    }
    try {
      var res = JSON.parse(xhr.responseText);
      if (res.ok) {
        callback(res.translated, null);
      } else {
        callback(null, res.error || "Translation failed.");
      }
    } catch (e) {
      callback(null, "Invalid response from server.");
    }
  };

  xhr.onerror = function () {
    callback(null, "Network error. Check your connection.");
  };

  xhr.ontimeout = function () {
    callback(null, "Translation timed out. Try shorter text.");
  };

  xhr.send();
}

// Track which fields are currently being translated (prevent duplicate calls)
var _translating = {};

// Auto-translate on blur: when admin leaves a field, translate and fill the other
function setupAutoTranslate() {
  // Each pair: source field → target field, with language direction
  var pairs = [
    // English → Nepali
    { src: "formTitleEn",   dst: "formTitle",    from: "en", to: "ne" },
    { src: "formSummaryEn", dst: "formSummary",  from: "en", to: "ne" },
    { src: "formContentEn", dst: "formContent",  from: "en", to: "ne" },
    // Nepali → English
    { src: "formTitle",     dst: "formTitleEn",  from: "ne", to: "en" },
    { src: "formSummary",   dst: "formSummaryEn",from: "ne", to: "en" },
    { src: "formContent",   dst: "formContentEn",from: "ne", to: "en" },
  ];

  for (var i = 0; i < pairs.length; i++) {
    bindAutoTranslate(pairs[i]);
  }
}

// Bind blur handler to auto-translate
function bindAutoTranslate(pair) {
  var srcEl = document.getElementById(pair.src);
  if (!srcEl) return;

  srcEl.addEventListener("blur", function () {
    var text = srcEl.value.trim();
    if (!text) return; // nothing to translate

    var dstEl = document.getElementById(pair.dst);
    if (!dstEl) return;

    // Don't translate if already translating this field
    if (_translating[pair.src]) return;

    _translating[pair.src] = true;

    // Show translating indicator on the source field
    srcEl.style.opacity = "0.5";
    srcEl.placeholder = "⏳ Translating...";

    translateText(text, pair.from, pair.to, function (translated, error) {
      _translating[pair.src] = false;

      if (error) {
        // Restore field if translation failed
        srcEl.style.opacity = "1";
        srcEl.placeholder = "";
        showAutoTranslateMsg("❌ " + error, "error");
      } else {
        // Fill the target field with translated text
        dstEl.value = translated;

        // Clear the source field (original written language is removed)
        srcEl.value = "";
        srcEl.style.opacity = "1";
        srcEl.placeholder = "";

        // Flash the target field green briefly
        dstEl.classList.add("translate-success-flash");
        setTimeout(function () {
          dstEl.classList.remove("translate-success-flash");
        }, 1500);

        var direction = pair.from === "en" ? "EN → NE" : "NE → EN";
        showAutoTranslateMsg("✅ Auto-translated (" + direction + ")", "success");
      }
    });
  });
}

// Show a brief message in the form area
function showAutoTranslateMsg(text, type) {
  var el = document.getElementById("formMsg");
  if (!el) return;
  el.textContent = text;
  el.className = "form-msg " + type;
  setTimeout(function () {
    el.textContent = "";
    el.className = "form-msg";
  }, 4000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", setupAutoTranslate);
