// modules/StackModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class StackModule extends ModuleBase {
    constructor() {
        super();
        this.items = []; // Stores {val, mesh}
        this.STACK_HEIGHT_OFFSET = 0.2; // Small gap between stacked items (increased for clarity)
        this.MAX_STACK_SIZE = 5; // Reduced max size for more visible overflow
        this.renderUI();
        // Base
        const base = new THREE.Mesh(ResourceManager.getGeometry('box', [4, 0.2, 4]), ResourceManager.getMaterial(Config.colors.base));
        base.position.y = -0.5;
        GFX.addObj(base, "Stack Base"); // Add label for context
        // Initial camera adjustment for stack
        GFX.camera.position.set(0, 5, 10);
        GFX.camera.lookAt(0, 0, 0);

        Log.add("Welcome to the Stack Module! This demonstrates LIFO (Last-In First-Out) behavior.", "info");
        Log.add("Elements are added and removed only from the top. Think of a stack of plates!", "info");
        Log.add("Use 'Push' to add elements, 'Pop' to remove the top element, and 'Peek' to view the top without removing it.", "info");
    }

    renderUI() {
        document.getElementById('module-title').innerText = "Stack Operations";
        document.getElementById('module-desc').innerText = "LIFO (Last-In First-Out): Elements are added and removed from the top only. Useful for undo/redo, function call management, and expression evaluation.";
        document.getElementById('complexity-badge').innerText = "Push: O(1) | Pop: O(1) | Peek: O(1)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="push" class="btn-primary">Push Value</button>
            <button data-action="pop" class="btn-secondary">Pop Value</button>
            <button data-action="peek" class="btn-secondary">Peek Top</button>
            <button data-action="resetStack" class="btn-secondary">Reset Stack</button>
        `;
    }

    async push(buttonElement) { // buttonElement is passed now
        const val = Math.floor(Math.random() * 99);
        const attemptedPushY = (this.items.length * (1 + this.STACK_HEIGHT_OFFSET)) + 0.5;

        // Visualize Stack Overflow
        if (this.items.length >= this.MAX_STACK_SIZE) {
            Log.add(`Attempting to push ${val}...`, "info");
            const tempMesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.5, 1, 1.5]), ResourceManager.getMaterial(Config.colors.error));
            tempMesh.position.set(0, attemptedPushY + 1.5, 0); // Start above stack
            GFX.addObj(tempMesh, val);
            tempMesh.userData.hoverText = `Value: ${val}<br>State: Rejected (Stack Full)`;

            await this.sleep(500 / Config.animSpeed);
            Log.add("Error: Stack Overflow! Max capacity reached.", "error");
            
            // Animate rejection
            const startOpacity = tempMesh.material.opacity;
            while(tempMesh.position.y < attemptedPushY + 3) { // Ensure consistent animation time regardless of speed
                tempMesh.position.y += 0.2 * (Config.animSpeed / 1); // Adjust speed
                tempMesh.material.opacity -= 0.05 * (Config.animSpeed / 1); // Adjust speed
                if(tempMesh.material.opacity <= 0) tempMesh.material.opacity = 0; // Clamp opacity
                await this.sleep(16);
            }
            GFX.removeObj(tempMesh);
            return;
        }

        Log.add(`Pushing value: ${val} onto the stack. This element will be at the top and the first to be removed.`, "info");

        const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.5, 1, 1.5]), ResourceManager.getMaterial(Config.colors.primary));
        // Calculate target Y with offset for visual separation
        const targetY = attemptedPushY; // Already calculated
        mesh.position.set(0, 8, 0); // Start high for animation
        mesh.userData.hoverText = `Value: ${val}<br>Index: ${this.items.length} (Current Top)`; // For hover
        GFX.addObj(mesh, val); // Add to scene with label

        // Animate falling into place
        while (mesh.position.y > targetY) {
            mesh.position.y = Math.max(mesh.position.y - 0.2 * (Config.animSpeed / 1), targetY); // Adjust animation speed
            await this.sleep(16);
        }
        mesh.position.y = targetY; // Ensure exact targetY

        this.items.push({ val, mesh }); // Store both value and mesh
        Log.add(`Successfully pushed ${val}. Stack size: ${this.items.length}. New top value: ${val}`, "success");
    }

    async pop(buttonElement) { // buttonElement is passed now
        // Visualize Stack Underflow
        if (this.items.length === 0) {
            Log.add("Attempting to Pop from an empty stack...", "info");
            // Visual feedback for underflow: highlight base with error
            const baseMesh = GFX.objects.find(obj => obj.userData.labelText === "Stack Base");
            if (baseMesh) {
                const originalMaterial = baseMesh.material;
                baseMesh.material = ResourceManager.getMaterial(Config.colors.error);
                await this.sleep(500 / Config.animSpeed);
                baseMesh.material = originalMaterial;
            }
            Log.add("Error: Stack Underflow! Cannot pop from an empty stack.", "error");
            return;
        }

        const poppedItem = this.items.pop(); // Get {val, mesh}
        Log.add(`Popping value: ${poppedItem.val} from the stack. It was the last element pushed.`, "info");

        const mesh = poppedItem.mesh;
        mesh.material = ResourceManager.getMaterial(Config.colors.error); // Highlight red for removal
        
        // Animate moving out
        while (mesh.position.y < 8) { 
            mesh.position.y += 0.2 * (Config.animSpeed / 1); // Adjust speed
            await this.sleep(16);
        }
        
        GFX.removeObj(mesh); // Clean up from scene
        Log.add(`Successfully popped ${poppedItem.val}. Stack size: ${this.items.length}.`, "success");
        if (this.items.length > 0) {
            Log.add(`New top value: ${this.items[this.items.length - 1].val}.`, "success");
        } else {
            Log.add("Stack is now empty.", "warning");
        }
    }

    async peek(buttonElement) { // buttonElement is passed now
        // Visualize Stack Underflow
        if (this.items.length === 0) {
            Log.add("Attempting to Peek at an empty stack...", "info");
            // Visual feedback for underflow: highlight base with warning
            const baseMesh = GFX.objects.find(obj => obj.userData.labelText === "Stack Base");
            if (baseMesh) {
                const originalMaterial = baseMesh.material;
                baseMesh.material = ResourceManager.getMaterial(Config.colors.warning);
                await this.sleep(500 / Config.animSpeed);
                baseMesh.material = originalMaterial;
            }
            Log.add("Warning: Stack is empty. Nothing to peek at.", "warning");
            return;
        }

        const topItem = this.items[this.items.length - 1]; // Get {val, mesh}
        Log.add(`Peeking at the top element: ${topItem.val}. This allows you to view the top without removing it.`, "info");

        const originalMaterial = topItem.mesh.material;
        topItem.mesh.material = ResourceManager.getMaterial(Config.colors.highlight); // Highlight
        topItem.mesh.position.y += 0.5; // Lift slightly

        await this.sleep(1000 / Config.animSpeed); // Show for a moment, adjusted speed

        topItem.mesh.position.y -= 0.5; // Lower back
        topItem.mesh.material = originalMaterial; // Restore material
        Log.add(`Top element is ${topItem.val}. Stack remains unchanged.`, "success");
    }

    async resetStack(buttonElement) { // buttonElement is passed now
        Log.add("Resetting stack...", "info");
        GFX.clear(); // Clears all objects, including the base
        this.items = [];
        // Re-add the base
        const base = new THREE.Mesh(ResourceManager.getGeometry('box', [4, 0.2, 4]), ResourceManager.getMaterial(Config.colors.base));
        base.position.y = -0.5;
        GFX.addObj(base, "Stack Base");
        Log.add("Stack has been reset to empty.", "success");
    }
}

export default StackModule;