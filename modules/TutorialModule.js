// modules/TutorialModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Log from '../logger.js';

class TutorialModule extends ModuleBase {
    constructor() {
        super();
        this.currentStep = 0;
        this.tutorialSteps = this.defineTutorialSteps();
        this.renderBaseUI(); // Render consistent UI elements once
        GFX.camera.position.set(0, 10, 20); // Set an appropriate camera position for the tutorial
        GFX.camera.lookAt(0, 0, 0);
        Log.clear(); // Clear the log for a fresh start
        Log.add("Welcome to DSA Arcade!", "success");
        Log.add("Use the 'Next' and 'Previous' buttons below to navigate the tutorial.", "info");
        this.displayStep(this.currentStep);
    }

    defineTutorialSteps() {
        return [
            {
                title: "Welcome to DSA Arcade!",
                desc: `
                    <h2 class="text-xl text-white font-bold mb-3 mt-2">Explore Data Structures & Algorithms</h2>
                    <p class="text-sm text-slate-300 leading-relaxed mb-4">
                        This interactive lab helps you visualize how fundamental Data Structures and Algorithms work.
                        No more guessing! See time and space complexity in action through engaging 3D visualizations.
                    </p>
                `,
                actionButton: null
            },
            {
                title: "What are Data Structures & Algorithms?",
                desc: `
                    <p class="text-sm text-slate-300 leading-relaxed mb-2 mt-4">
                        <strong>Data Structures</strong> are specialized formats for organizing, processing, retrieving, and storing data. Think of them as different ways to arrange your tools in a toolbox.
                    </p>
                    <p class="text-sm text-slate-300 leading-relaxed mb-4">
                        <strong>Algorithms</strong> are step-by-step procedures or formulas for solving a problem. They are like the instruction manuals for using your tools.
                    </p>
                `,
                actionButton: null
            },
            {
                title: "How to use this app",
                desc: `
                    <ul class="list-disc list-inside text-sm text-slate-300 leading-relaxed mb-4 mt-4 pl-4">
                        <li class="mb-1"><strong>Select a Module:</strong> Use the left sidebar to choose a topic (e.g., Big O Notation, Arrays, Stacks).</li>
                        <li class="mb-1"><strong>Interact with Visualizations:</strong> The main 3D canvas will come alive with interactive models.</li>
                        <li class="mb-1"><strong>Read the Explanations:</strong> The "Execution Log" on the right will provide step-by-step contextual information, pros, and cons.</li>
                        <li class="mb-1"><strong>Adjust Speed:</strong> Use the slider in the sidebar to control animation speed.</li>
                    </ul>
                `,
                actionButton: null
            },
            {
                title: "Your Learning Path",
                desc: `
                    <h3 class="text-lg text-sky-400 font-semibold mb-2 mt-4">🗺️ Where to start your learning journey:</h3>
                    <p class="text-sm text-slate-300 leading-relaxed mb-2">
                        We recommend beginning with <span class="text-sky-400 font-bold">"Big O Notation"</span> under the "Fundamentals" section. This will equip you with the language to understand efficiency.
                    </p>
                    <p class="text-sm text-slate-300 leading-relaxed mb-4">
                        Then, explore <span class="text-sky-400 font-bold">"Level 1: Linear Structures"</span> like Arrays, Stacks, and Queues to see basic data organization.
                    </p>
                `,
                actionButton: null
            },
            {
                title: "Key Insight",
                desc: `
                    <p class="text-sm text-slate-300 leading-relaxed mb-4 mt-4">
                        Understanding Data Structures and Algorithms isn't just about memorizing. It's about seeing the patterns, comprehending tradeoffs,
                        and developing a strong intuition for building performant and scalable software solutions. Let's make learning visual, interactive, and fun!
                    </p>
                `,
                actionButton: `<button data-action="load-module" data-module-id="bigO" class="btn-primary mt-4 py-3 px-6 text-base">Start Learning Big O Notation!</button>`
            }
        ];
    }

    renderBaseUI() {
        document.getElementById('module-title').innerText = "Tutorial"; // Initial title, will be updated by displayStep
        document.getElementById('complexity-badge').innerText = "TUTORIAL"; // Static for the tutorial
        
        // This sets up the navigation buttons and status for the entire tutorial module, fixed position
        document.getElementById('action-bar').innerHTML = `
            <button id="prev-step" data-action="prev-step" class="btn-secondary">Previous</button>
            <span id="tutorial-progress" class="text-sm text-slate-400 mx-3"></span>
            <button id="next-step" data-action="next-step" class="btn-primary">Next</button>
        `;
    }

    displayStep(stepIndex) {
        GFX.clear(); // Clear 3D scene for new step
        this.currentStep = stepIndex;
        const step = this.tutorialSteps[stepIndex];

        document.getElementById('module-title').innerText = step.title;
        document.getElementById('module-desc').innerHTML = step.desc;
        document.getElementById('complexity-badge').innerText = `TUTORIAL (Step ${this.currentStep + 1} of ${this.tutorialSteps.length})`;
        
        // Update navigation buttons state
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const tutorialProgress = document.getElementById('tutorial-progress');
        
        if (prevBtn) prevBtn.disabled = this.currentStep === 0;

        if (nextBtn) {
            // Reset next button to its default state/look first
            nextBtn.innerText = 'Next';
            nextBtn.className = 'btn-primary'; // Default styling
            // nextBtn.onclick = () => this.nextStep(); // Handled by delegated listener
            nextBtn.disabled = false; // Ensure it's enabled by default for next steps

            if (this.currentStep === this.tutorialSteps.length - 1) {
                if (step.actionButton) {
                    // Update innerHTML and data-action for the last step's action button
                    nextBtn.innerText = 'Start Learning Big O Notation!'; // Text for action
                    nextBtn.className = 'btn-primary mt-4 py-3 px-6 text-base'; // Specific styling for action button
                    nextBtn.dataset.action = "load-module"; // Set data-action
                    nextBtn.dataset.moduleId = "bigO"; // Set module id
                    // nextBtn.onclick = () => window.App.load('bigO'); // Handled by delegated listener
                } else {
                    nextBtn.innerText = 'Finish';
                }
            } else {
                nextBtn.dataset.action = "next-step"; // Ensure data-action is set for normal next
                delete nextBtn.dataset.moduleId; // Clean up module ID if not needed
            }
        }
        if (tutorialProgress) tutorialProgress.innerText = `Step ${this.currentStep + 1} of ${this.tutorialSteps.length}`;
        
        // Optionally, load specific 3D visuals for a step
        // if (step.visualHint === 'app_logo') {
        // GFX.loadAppLogoVisual(); // Future: Load a 3D model of the app logo
        // } else {
        // Default empty scene or generic background
        // }
    }

    nextStep(buttonElement) { // buttonElement is passed now
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.displayStep(this.currentStep + 1);
        } else {
            // Last step, click finish or go to Big O
            window.App.load('bigO'); // Direct to Big O as the next logical step
        }
        return Promise.resolve(); // These are sync calls, return a resolved promise
    }

    prevStep(buttonElement) { // buttonElement is passed now
        if (this.currentStep > 0) {
            this.displayStep(this.currentStep - 1);
        }
        return Promise.resolve(); // These are sync calls, return a resolved promise
    }
}

export default TutorialModule;