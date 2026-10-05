const textarea = document.getElementById('note-text');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

const LIMIT = 200;
const WARN_AT = 180;
const DRAFT_KEY = 'quicknotes-draft';
const THEME_KEY = 'quicknotes-theme';

function countWords(text) {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

function updateCounts() {
  const chars = textarea.value.length;
  const words = countWords(textarea.value);

  charCount.textContent = `${chars} / ${LIMIT} characters`;
  wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;

  // Reset both states, then apply whichever applies.
  charCount.classList.remove('warning', 'over');
  if (chars > LIMIT) {
    charCount.classList.add('over');
  } else if (chars > WARN_AT) {
    charCount.classList.add('warning');
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, textarea.value);
}

function clearAll() {
  textarea.value = '';
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
  textarea.focus();
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
}

// --- Restore saved state on load ---
const savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  textarea.value = savedDraft;
}

applyTheme(localStorage.getItem(THEME_KEY));
updateCounts();

// --- Events ---
textarea.addEventListener('input', () => {
  updateCounts();
  saveDraft();
});

clearBtn.addEventListener('click', clearAll);

textarea.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    clearAll();
  }
});

themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});