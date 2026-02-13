// app.js
import Log from './logger.js';
import Config from './config.js';
import ArrayModule from './modules/ArrayModule.js';
import StackModule from './modules/StackModule.js';
import QueueModule from './modules/QueueModule.js';
import LinkedListModule from './modules/LinkedListModule.js';
import BSTModule from './modules/BSTModule.js';
import RecursionModule from './modules/RecursionModule.js';
import SortingModule from './modules/SortingModule.js';
import BigOModule from './modules/BigOModule.js';
import TutorialModule from './modules/TutorialModule.js';
import GraphModule from './modules/GraphModule.js'; // New import

const App = {
    module: null,
    _actionBarListener: null, // To store the delegated listener for action-bar
    
    load(id) {
        // Cleanup previous
        if(this.module) {
            this.module.destroy();
        }
        
        // UI State
        document.querySelectorAll('.btn-sidebar').forEach(b => b.classList.remove('active'));
        const navElement = document.getElementById(`nav-${id}`);
        if (navElement) {
            navElement.classList.add('active');
        }
        Log.clear();
        Log.add(`Loading module: ${id}...`);

        // Factory
        if(id === 'tutorial') this.module = new TutorialModule();
        else if(id === 'bigO') this.module = new BigOModule();
        else if(id === 'array') this.module = new ArrayModule();
        else if(id === 'stack') this.module = new StackModule();
        else if(id === 'queue') this.module = new QueueModule();
        else if(id === 'sll') this.module = new LinkedListModule(false);
        else if(id === 'dll') this.module = new LinkedListModule(true);
        else if(id === 'bst') this.module = new BSTModule();
        else if(id === 'recursion') this.module = new RecursionModule();
        else if(id.startsWith('sort_')) this.module = new SortingModule(id.split('_')[1]);
        else if(id === 'graph') this.module = new GraphModule(); // Added graph
        else { Log.add("Module under construction", "warning"); }

        // Re-initialize action bar listeners after module loads and potentially updates action-bar HTML
        this.initActionBarListeners();
    },

    setSpeed(val) {
        Config.animSpeed = parseFloat(val);
        document.getElementById('speed-val').innerText = `${val}x`;
        Log.add(`Speed set to ${val}x`);
    },

    // New function to initialize all event listeners
    initEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('[data-action="load-module"]').forEach(button => {
            button.addEventListener('click', (event) => {
                this.load(event.currentTarget.dataset.moduleId);
            });
        });

        // Speed slider
        const speedSlider = document.querySelector('[data-action="set-speed"]');
        if (speedSlider) {
            speedSlider.addEventListener('input', (event) => {
                this.setSpeed(event.target.value);
            });
        }

        // Log clear button
        const logClearButton = document.querySelector('[data-action="log-clear"]');
        if (logClearButton) {
            logClearButton.addEventListener('click', () => {
                Log.clear();
            });
        }

        // Action bar listeners (delegated)
        // This will be called once on initial load, and then again after each module load
        this.initActionBarListeners();
    },

    initActionBarListeners() {
        const actionBar = document.getElementById('action-bar');
        if (actionBar) {
            // Remove any existing delegated listener to prevent duplicates
            if (this._actionBarListener) {
                actionBar.removeEventListener('click', this._actionBarListener);
            }

            // Create and store a new delegated listener
            this._actionBarListener = (event) => {
                const target = event.target.closest('button[data-action]');
                if (!target) return; // Not a button with data-action

                const action = target.dataset.action;
                const moduleId = target.dataset.moduleId; // For tutorial nav buttons
                const dataSize = target.dataset.size; // For ArrayModule's generateArray

                // Temporarily disable the button
                target.disabled = true; 

                // Handle actions relevant to current module
                // Module functions are now expected to be async and receive the button element
                let moduleActionPromise;
                if (this.module && typeof this.module[action] === 'function') {
                    // Pass target (button) and any relevant dataset info
                    moduleActionPromise = this.module[action](target, moduleId || dataSize); 
                } else if (action === 'prev-step' && this.module && typeof this.module.prevStep === 'function') {
                    moduleActionPromise = this.module.prevStep(target);
                } else if (action === 'next-step' && this.module && typeof this.module.nextStep === 'function') {
                    moduleActionPromise = this.module.nextStep(target);
                } else if (action === 'load-module') { // Specific for tutorial's last button
                    this.load(moduleId); 
                    moduleActionPromise = Promise.resolve(); // Immediately resolve since load is sync
                } else {
                    Log.add(`Action "${action}" not recognized or not implemented in current module.`, "warning");
                    moduleActionPromise = Promise.resolve(); // Resolve to re-enable button
                }

                // Re-enable button after action (if it was an async module action)
                if (moduleActionPromise && typeof moduleActionPromise.finally === 'function') {
                    moduleActionPromise.finally(() => {
                        target.disabled = false;
                    });
                } else {
                    target.disabled = false; // Re-enable immediately for non-async actions
                }
            };
            actionBar.addEventListener('click', this._actionBarListener);
        }
    }
};

window.App = App; // Ensure App is globally accessible for onclick handlers
export default App;