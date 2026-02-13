// modules/ArrayModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class ArrayModule extends ModuleBase {
    constructor() {
        super();
        this.array = []; // Example array
        this.MAX_ARRAY_SIZE = 8; // Define max size for array
        this.renderUI();
        // Set initial camera position if needed for array visualization
        GFX.camera.position.set(0, 5, 10);
        GFX.camera.lookAt(0, 0, 0);
        this.generateArray(5); // Start with a small array
    }

    renderUI() {
        document.getElementById('module-title').innerText = "Array Operations";
        document.getElementById('module-desc').innerText = "Visualizing basic array operations (fixed-size for simplicity).";
        document.getElementById('complexity-badge').innerText = "Access: O(1) | Insert/Delete: O(n)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="addValue" class="btn-primary">Add Value</button>
            <button data-action="removeValue" class="btn-secondary">Remove Value</button>
            <button data-action="generateArray" data-size="5" class="btn-secondary">Reset Array</button>
        `;
    }

    // Placeholder for array visualization and operations
    generateArray(size) {
        GFX.clear();
        this.array = [];
        // Consistent startX calculation based on MAX_ARRAY_SIZE
        const startXBase = -(this.MAX_ARRAY_SIZE * 1.5) / 2 + 0.75;
        for (let i = 0; i < size; i++) {
            const val = Math.floor(Math.random() * 99);
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.primary));
            mesh.position.set(startXBase + (i * 1.5), 0, 0);
            mesh.userData.hoverText = `Index: ${i}<br>Value: ${val}`; // Add hover text
            GFX.addObj(mesh, val);
            this.array.push({ val, mesh });
        }
        Log.add(`Generated array of size ${size}`);
    }

    async addValue() {
        if (this.array.length >= this.MAX_ARRAY_SIZE) {
            Log.add("Array is full. Cannot add more elements.", "warning");
            return;
        }

        const val = Math.floor(Math.random() * 99);
        const nextIndex = this.array.length;
        // Consistent startX calculation based on MAX_ARRAY_SIZE
        const startXBase = -(this.MAX_ARRAY_SIZE * 1.5) / 2 + 0.75;
        
        const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.success)); // Use success color for added
        mesh.position.set(startXBase + (nextIndex * 1.5), 0, 0);
        mesh.userData.hoverText = `Index: ${nextIndex}<br>Value: ${val}`; // Add hover text
        GFX.addObj(mesh, val);
        this.array.push({ val, mesh });
        
        Log.add(`Added value: ${val} at index ${nextIndex}.`, "success");
        // Reset color after a brief moment
        await this.sleep(500);
        mesh.material = ResourceManager.getMaterial(Config.colors.primary);
    }

    async removeValue() {
        if (this.array.length === 0) {
            Log.add("Array is already empty! Cannot remove.", "warning");
            return;
        }

        const removed = this.array.pop();
        GFX.removeObj(removed.mesh);
        
        Log.add(`Removed value: ${removed.val} from the end of the array.`, "success");
    }
}

export default ArrayModule;
