// modules/RecursionModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class RecursionModule extends ModuleBase {
    constructor() {
        super();
        this.frames = [];
        this.renderUI();
        GFX.camera.position.set(10, 10, 10);
        GFX.camera.lookAt(0, 5, 0);

        Log.add("Welcome to the Recursion Visualizer!", "info");
        Log.add("This module demonstrates how recursion uses the Call Stack. We'll visualize factorial(n).", "info");
    }
    renderUI() {
        document.getElementById('module-title').innerText = "Recursion Visualizer";
        document.getElementById('module-desc').innerText = "Visualizing the Call Stack for Factorial(n). Each box represents a function call added to the stack.";
        document.getElementById('complexity-badge').innerText = "Time: O(n) | Space: O(n)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="runFact" data-size="3" class="btn-primary">Factorial(3)</button>
            <button data-action="runFact" data-size="5" class="btn-secondary">Factorial(5)</button>
        `;
    }
    async runFact(buttonElement, nStr) {
        let n = parseInt(nStr);
        // Clear previous run if any
        this.frames.forEach(f => GFX.removeObj(f));
        this.frames = [];
        Log.clear();

        Log.add(`Starting calculation for factorial(${n})...`, "highlight");
        const finalResult = await this.factorial(n);
        Log.add(`Final result of factorial(${n}) is ${finalResult}.`, "success");
    }

    async factorial(n) {
        Log.add(`Calling factorial(${n}). Pushing new frame to the Call Stack.`, "info");
        
        // --- Animate PUSH to Call Stack ---
        const frame = new THREE.Mesh(ResourceManager.getGeometry('box', [3, 0.8, 3]), ResourceManager.getMaterial(Config.colors.primary));
        frame.position.set(0, this.frames.length + 5, 0); // Start high
        frame.userData.hoverText = `Call: factorial(${n})<br>State: Executing`;
        GFX.addObj(frame, `fact(${n})`);
        this.frames.push(frame);

        const targetY = (this.frames.length - 1) * (0.8 + 0.2); // Position in stack with offset
        
        while (frame.position.y > targetY) {
            frame.position.y = Math.max(frame.position.y - 0.2 * (Config.animSpeed / 1), targetY);
            await this.sleep(16);
        }
        frame.position.y = targetY; // Snap to final position

        await this.sleep(800 / Config.animSpeed);

        if(n <= 1) {
            Log.add("Base case (n <= 1) reached. Returning 1.", "success");
            frame.material = ResourceManager.getMaterial(Config.colors.success); // Highlight base case
            frame.userData.hoverText = `Call: factorial(${n})<br>State: Returning 1`;
            await this.sleep(800 / Config.animSpeed);
            
            // Animate POP from Call Stack
            const poppedFrame = this.frames.pop();
            while (poppedFrame.position.x > -10) {
                poppedFrame.position.x -= 0.3 * (Config.animSpeed / 1);
                poppedFrame.material.opacity -= 0.05 * (Config.animSpeed / 1);
                await this.sleep(16);
            }
            GFX.removeObj(poppedFrame);
            return 1;
        }

        Log.add(`factorial(${n}) needs to compute ${n} * factorial(${n-1}). Calling factorial(${n-1})...`, "info");
        frame.material = ResourceManager.getMaterial(Config.colors.warning); // Change color to show it's waiting
        frame.userData.hoverText = `Call: factorial(${n})<br>State: Waiting for factorial(${n-1})`;

        const recursiveResult = await this.factorial(n-1);
        
        const res = n * recursiveResult;
        
        // --- Animate POP and Return Phase ---
        Log.add(`factorial(${n-1}) returned ${recursiveResult}. Now computing ${n} * ${recursiveResult} = ${res}.`, "success");
        frame.material = ResourceManager.getMaterial(Config.colors.success); // Highlight returning frame
        frame.userData.hoverText = `Call: factorial(${n})<br>State: Returning ${res}`;
        await this.sleep(800 / Config.animSpeed);
        
        const popped = this.frames.pop();
        while (popped.position.x > -10) {
            popped.position.x -= 0.3 * (Config.animSpeed / 1);
            popped.material.opacity -= 0.05 * (Config.animSpeed / 1);
            if(popped.material.opacity <= 0) popped.material.opacity = 0;
            await this.sleep(16);
        }
        GFX.removeObj(popped);
        
        return res;
    }
}

export default RecursionModule;
