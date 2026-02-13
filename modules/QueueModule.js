// modules/QueueModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';
// Removed: import * as THREE from 'three'; // THREE is globally available

class QueueModule extends ModuleBase {
    constructor() {
        super();
        this.items = []; // Stores {val, mesh}
        this.QUEUE_Y = 0.5; // Y position for queue elements
        this.ELEMENT_SPACING = 1.5; // Gap between elements
        this.MAX_QUEUE_SIZE = 8;
        this.renderUI();

        // Base: Create a long horizontal plane to define the queue path
        const basePath = new THREE.Mesh(ResourceManager.getGeometry('box', [(this.MAX_QUEUE_SIZE + 1) * this.ELEMENT_SPACING, 0.2, 2]), ResourceManager.getMaterial(Config.colors.base));
        basePath.position.y = this.QUEUE_Y - 0.5; // Below the elements
        // Center the base horizontally
        basePath.position.x = -((this.MAX_QUEUE_SIZE) * this.ELEMENT_SPACING) / 2 + this.ELEMENT_SPACING / 2;
        GFX.addObj(basePath, "Queue Path");

        // Initial camera adjustment for queue (side view)
        GFX.camera.position.set(0, 5, 15);
        GFX.camera.lookAt(0, this.QUEUE_Y, 0);

        Log.add("Welcome to the Queue Module! This demonstrates FIFO (First-In First-Out) behavior.", "info");
        Log.add("Elements (nodes) enter at the rear and leave from the front, just like a waiting line.", "info");
    }

    renderUI() {
        document.getElementById('module-title').innerText = "Queue Operations";
        document.getElementById('module-desc').innerText = "FIFO (First-In First-Out): Elements are added to the rear and removed from the front. Used in task scheduling, printer queues, and breadth-first search.";
        document.getElementById('complexity-badge').innerText = "Enqueue: O(1) | Dequeue: O(1) | Peek: O(1)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="enqueue" class="btn-primary">Enqueue Value</button>
            <button data-action="dequeue" class="btn-secondary">Dequeue Value</button>
            <button data-action="peek" class="btn-secondary">Peek Front</button>
        `;
    }

    async repositionElements(animate = true) {
        // Calculate the base X position to keep the queue centered
        const queueWidth = this.items.length * this.ELEMENT_SPACING;
        const startX = -(queueWidth / 2) + (this.ELEMENT_SPACING / 2); // X position for the first element

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const targetX = startX + (i * this.ELEMENT_SPACING);
            const targetY = this.QUEUE_Y;

            if (animate) {
                const startPosition = item.mesh.position.clone();
                const endPosition = new THREE.Vector3(targetX, targetY, 0);
                const duration = 200 / Config.animSpeed; // milliseconds
                const startTime = Date.now();

                while (Date.now() - startTime < duration) {
                    const elapsed = Date.now() - startTime;
                    const alpha = elapsed / duration;
                    item.mesh.position.lerpVectors(startPosition, endPosition, alpha);
                    await this.sleep(16);
                }
            }
            item.mesh.position.set(targetX, targetY, 0); // Ensure final position
            item.mesh.userData.hoverText = `Position: ${i}<br>Value: ${item.val}`; // Update hover text with new position
        }
    }

    async enqueue() {
        if (this.items.length >= this.MAX_QUEUE_SIZE) {
            Log.add("Error: Queue is full (Overflow)! Cannot enqueue more items.", "error");
            return;
        }

        const val = Math.floor(Math.random() * 99);
        Log.add(`Enqueuing value: ${val} (entering from the rear)...`, "info");

        const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.primary));
        // Position initially far right (rear)
        const initialX = ((this.MAX_QUEUE_SIZE / 2) * this.ELEMENT_SPACING) + 5; 
        mesh.position.set(initialX, this.QUEUE_Y, 0);
        
        mesh.userData.hoverText = `Value: ${val}<br>Position: Enqueueing`; // Initial hover text
        GFX.addObj(mesh, val); // Add to scene with label

        this.items.push({ val, mesh }); // Add to end (rear)

        await this.repositionElements(); // Animate new item and shift others

        Log.add(`Successfully enqueued ${val}. Queue size: ${this.items.length}`, "success");
    }

    async dequeue() {
        if (this.items.length === 0) {
            Log.add("Error: Queue is empty (Underflow)! Nothing to dequeue.", "error");
            return;
        }

        const dequeuedItem = this.items.shift(); // Remove from front ({val, mesh})
        Log.add(`Dequeuing front value: ${dequeuedItem.val} (leaving from the front)...`, "info");

        const mesh = dequeuedItem.mesh;
        mesh.material = ResourceManager.getMaterial(Config.colors.error); // Highlight for removal
        await this.sleep(200 / Config.animSpeed);

        // Animate leaving the scene to the left (front)
        const targetX = -((this.MAX_QUEUE_SIZE / 2) * this.ELEMENT_SPACING) - 5;
        const startPosition = mesh.position.clone();
        const endPosition = new THREE.Vector3(targetX, mesh.position.y, 0);
        const duration = 200 / Config.animSpeed; // milliseconds
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            const elapsed = Date.now() - startTime;
            const alpha = elapsed / duration;
            mesh.position.lerpVectors(startPosition, endPosition, alpha);
            await this.sleep(16);
        }
        
        GFX.removeObj(mesh); // Clean up from scene
        
        await this.repositionElements(); // Animate remaining items shifting forward

        Log.add(`Successfully dequeued ${dequeuedItem.val}. Queue size: ${this.items.length}`, "success");
    }

    async peek() {
        if (this.items.length === 0) {
            Log.add("Warning: Queue is empty. Nothing to peek at.", "warning");
            return;
        }

        const frontItem = this.items[0]; // Get {val, mesh} at the front
        Log.add(`Peeking at the front element: ${frontItem.val}...`, "info");

        const originalMaterial = frontItem.mesh.material;
        frontItem.mesh.material = ResourceManager.getMaterial(Config.colors.highlight); // Highlight
        frontItem.mesh.position.y += 0.5; // Lift slightly

        await this.sleep(1000); // Show for a moment

        frontItem.mesh.position.y -= 0.5; // Lower back
        frontItem.mesh.material = originalMaterial; // Restore material
        Log.add(`Front element is ${frontItem.val}. (No change to queue).`, "success");
    }
}

export default QueueModule;