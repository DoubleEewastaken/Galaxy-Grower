// main.js - entry
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // start UI + game
  const ui = new UI();

  // small usability: keyboard click (space) activates big button
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      document.getElementById('big-button').click();
      e.preventDefault();
    }
  });
});

