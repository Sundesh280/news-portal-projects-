/* lang.js - Shared language toggle and translation helper */

var currentLang = localStorage.getItem('nk_lang') || 'en';

function getCurrentLang() {
  return currentLang;
}

function setCurrentLang(lang) {
  currentLang = lang === 'np' ? 'np' : 'en';
  localStorage.setItem('nk_lang', currentLang);
  updateDocumentLang();
  updateLanguageToggleButton();
}

function getItemLabel(labelEn, labelNp) {
  return currentLang === 'np' ? labelNp : labelEn;
}

function updateLanguageToggleButton() {
  var btn = document.getElementById('langToggleBtn');
  if (!btn) return;
  btn.textContent = currentLang === 'np' ? 'En/ने' : 'ने/En';
}

function updateDocumentLang() {
  if (document.documentElement) {
    document.documentElement.lang = currentLang === 'np' ? 'ne' : 'en';
  }
}

function initLanguageToggle() {
  updateDocumentLang();
  updateLanguageToggleButton();

  var btn = document.getElementById('langToggleBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    setCurrentLang(currentLang === 'en' ? 'np' : 'en');
    if (typeof onLanguageChanged === 'function') {
      onLanguageChanged();
    }
  });
}

// If a page defines onLanguageChanged(), it will be called after initLanguageToggle.
document.addEventListener('DOMContentLoaded', function () {
  initLanguageToggle();
  if (typeof onLanguageChanged === 'function') {
    onLanguageChanged();
  }
});
