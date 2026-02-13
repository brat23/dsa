// main.js
import App from './app.js';
import Log from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
    Log.init();
    App.load('tutorial'); // Load default module (Tutorial)
    App.initEventListeners(); // Initialize all event listeners
});
