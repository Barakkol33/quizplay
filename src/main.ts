import './styles.css';
import { runLeave } from './leave';
import { setLang } from './i18n';
import * as store from './store';
import * as s from './ui/screens';

const root = document.getElementById('app')!;

async function route(): Promise<void> {
  runLeave();
  setLang(store.uiLang());
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c, d] = parts;
  try {
    if (!a) await s.renderHome(root);
    else if (a === 'p' && b && c === 's' && d) await s.renderSubject(root, b, d);
    else if (a === 'p' && b) await s.renderProject(root, b);
    else if (a === 'play' && b && c) await s.renderPlay(root, b, c);
    else if (a === 'mistakes' && b) await s.renderMistakes(root, b);
    else if (a === 'review' && b) await s.renderReview(root, b);
    else if (a === 'load') await s.renderLoad(root);
    else if (a === 'profile') s.renderProfile(root);
    else if (a === 'about') s.renderAbout(root, b === 'ai');
    else location.hash = '#/';
  } catch (e) {
    console.error(e);
    s.renderError(root, e);
  }
}

s.applyTheme();
s.setRerender(route);
window.addEventListener('hashchange', route);
// A link to the route we're already on doesn't fire hashchange; re-render instead.
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a[href^="#"]');
  if (a && a.getAttribute('href') === location.hash) {
    e.preventDefault();
    route();
  }
});
setLang(store.uiLang());
s.renderLoading(root);
route();
