// modules/LinkedListModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';


class LinkedListModule extends ModuleBase {
    constructor(doubly = false) {
        super();
        this.doubly = doubly;
        this.nodes = []; // Stores {val, mesh}
        // this.headLabelMesh = null; // No longer needed, replaced by HTML labels
        // this.tailLabelMesh = null; // No longer needed, replaced by HTML labels

        this.labelElements = {}; // Stores references to 2D HTML label elements

        this.NODE_SPACING = 2.5; // Horizontal distance between node centers
        this.NODE_Y = 0; // Vertical position of nodes
        this.NODE_Z = 0; // Z position of nodes

        this.renderUI();

        // No longer set initial camera here; it's handled by redraw()
        // GFX.camera.position.set(0, 5, 15);
        // GFX.camera.lookAt(0, this.NODE_Y, 0);

        Log.add(`Welcome to the ${this.doubly ? "Doubly" : "Singly"} Linked List Module!`, "info");
        Log.add("Linked Lists store elements (nodes) in a linear fashion, but not in contiguous memory locations.", "info");
        Log.add("Each node points to the next (and previous for Doubly) node.", "info");
    }

    // Helper to create and position 2D HTML labels
    _createHTMLLabel(id, text, position, className = 'node-label') {
        let label = this.labelElements[id];
        if (!label) {
            label = document.createElement('div');
            label.id = `label-${id}`;
            label.className = className;
            const labelsLayer = document.getElementById('labels-layer');
            if (labelsLayer) {
                labelsLayer.appendChild(label);
            } else {
                document.body.appendChild(label); // Fallback
                Log.add("Warning: #labels-layer not found in index.html. Appending labels to body.", "warning");
            }
        }
        label.textContent = text;

        const screenPosition = GFX.project3DPointToScreen(position);

        label.style.left = `${screenPosition.x}px`;
        label.style.top = `${screenPosition.y}px`;
        label.style.transform = `translate(-50%, -50%)`; // Center the label
        // Make sure it's visible
        label.style.opacity = '1';
        label.style.pointerEvents = 'none'; // Ensure it doesn't block mouse events

        this.labelElements[id] = label;
        return label;
    }

    _removeHTMLLabel(id) {
        const label = this.labelElements[id];
        if (label) {
            label.remove();
            delete this.labelElements[id];
        }
    }

    renderUI() {
        const type = this.doubly ? "Doubly" : "Singly";
        document.getElementById('module-title').innerText = `${type} Linked List`;
        document.getElementById('module-desc').innerText = this.doubly
            ? "Nodes have Next and Prev pointers, allowing bidirectional traversal. More complex operations but easier backward navigation."
            : "Nodes point to the next node only, allowing unidirectional traversal. Simpler but less flexible.";
        document.getElementById('complexity-badge').innerText = "Access: O(n) | Insert/Delete Head: O(1) | Insert/Delete Tail (SLL): O(n) | Insert/Delete Tail (DLL): O(1)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="addHead" class="btn-primary">Add Head</button>
            <button data-action="addTail" class="btn-secondary">Add Tail</button>
            <button data-action="removeHead" class="btn-secondary">Remove Head</button>
            <button data-action="removeTail" class="btn-secondary">Remove Tail</button>
            <button data-action="resetList" class="btn-secondary">Reset List</button>
        `;
    }
    
    // Helper to animate node movement
    async _animateNodeMovement(nodeMesh, targetX, targetY, targetZ, duration = 300) {
        const startPosition = nodeMesh.position.clone();
        const endPosition = new THREE.Vector3(targetX, targetY, targetZ);
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            const elapsed = Date.now() - startTime;
            const alpha = elapsed / duration;
            nodeMesh.position.lerpVectors(startPosition, endPosition, alpha);
            await this.sleep(16);
        }
        nodeMesh.position.copy(endPosition); // Ensure final position is exact
    }

    async redraw() {
        GFX.clearArrows();
        GFX.arrows.forEach(a => GFX.scene.remove(a));
        GFX.arrows = [];
        
        // Calculate total list width and target camera position
        const nodeCount = this.nodes.length;
        const totalWidth = nodeCount * this.NODE_SPACING;
        const targetCameraX = (nodeCount > 0) ? (this.nodes[nodeCount - 1].mesh.position.x + this.nodes[0].mesh.position.x) / 2 : 0;
        
        // Adjust camera zoom based on list length
        let targetCameraZ = 15; // Default zoom
        if (nodeCount > 4) { // Start zooming out after a few nodes
            targetCameraZ = 15 + (nodeCount - 4) * 1.5; // Adjust zoom factor as needed
        }
        
        // Animate camera position (optional, but improves UX)
        // For simplicity, directly set for now, but smooth animation would be better.
        // TODO: Implement smooth camera animation
        GFX.camera.position.set(targetCameraX, 5, targetCameraZ);
        GFX.camera.lookAt(targetCameraX, this.NODE_Y, 0);

        // Animate nodes to their correct positions
        const listVisualWidth = (nodeCount > 0) ? (nodeCount - 1) * this.NODE_SPACING : 0;
        const startX = -listVisualWidth / 2;

        const nodeAnimations = [];
        this.nodes.forEach((n, i) => {
            const targetX = startX + (i * this.NODE_SPACING);
            nodeAnimations.push(this._animateNodeMovement(n.mesh, targetX, this.NODE_Y, this.NODE_Z));
        });
        await Promise.all(nodeAnimations); // Wait for all nodes to move

        // Re-draw arrows after nodes are in place
        this.nodes.forEach((n, i) => {
            // Update hover text with current index/position
            n.mesh.userData.hoverText = `Value: ${n.val}<br>Index: ${i}`;
            if(i === 0) n.mesh.userData.hoverText += "<br>HEAD";
            if(i === this.nodes.length - 1) n.mesh.userData.hoverText += "<br>TAIL";

            if(i < this.nodes.length - 1) {
                const nextNodeMesh = this.nodes[i+1].mesh;
                // Forward Arrow (Next Pointer)
                GFX.addArrow(
                    new THREE.Vector3(n.mesh.position.x + (this.NODE_SPACING/2) - 0.2, this.NODE_Y, this.NODE_Z),
                    new THREE.Vector3(nextNodeMesh.position.x - (this.NODE_SPACING/2) + 0.2, this.NODE_Y, this.NODE_Z),
                    Config.colors.primary // Blue for forward
                );
                if(this.doubly) {
                    // Back Arrow (Prev Pointer)
                     GFX.addArrow(
                        new THREE.Vector3(nextNodeMesh.position.x - (this.NODE_SPACING/2) + 0.2, this.NODE_Y, this.NODE_Z + 0.7), // Increased Z-offset
                        new THREE.Vector3(n.mesh.position.x + (this.NODE_SPACING/2) - 0.2, this.NODE_Y, this.NODE_Z + 0.7), // Increased Z-offset
                        Config.colors.success // Green for backward
                    );
                }
            }
        });
        this._updateHeadTailLabels();
        this._updateNullPointers();
    }

    async _updateHeadTailLabels() {
        this._removeHTMLLabel('head');
        this._removeHTMLLabel('tail');
        // Clear any previous conceptual arrows related to HEAD/TAIL
        // Assuming GFX can clear named conceptual arrows
        // If not, we'd need to manually track and remove them from GFX.arrows
        GFX.clearNamedArrows(['headArrow', 'tailArrow']); // This function needs to be added to GFX.js

        if (this.nodes.length > 0) {
            const headNode = this.nodes[0];
            const tailNode = this.nodes[this.nodes.length - 1];

            // HEAD Label and Arrow
            // Position the start of the arrow slightly above and to the left of the head node
            const headArrowStartPos = new THREE.Vector3(headNode.mesh.position.x - this.NODE_SPACING * 1.5, headNode.mesh.position.y + 2, this.NODE_Z);
            GFX.addArrow(headArrowStartPos, headNode.mesh.position, Config.colors.highlight, 'headArrow');
            this._createHTMLLabel('head', "HEAD", headArrowStartPos);

            // TAIL Label and Arrow
            // Position the start of the arrow slightly above and to the right of the tail node
            const tailArrowStartPos = new THREE.Vector3(tailNode.mesh.position.x + this.NODE_SPACING * 1.5, tailNode.mesh.position.y + 2, this.NODE_Z);
            GFX.addArrow(tailArrowStartPos, tailNode.mesh.position, Config.colors.highlight, 'tailArrow');
            this._createHTMLLabel('tail', "TAIL", tailArrowStartPos);

        } else {
            // If list is empty, display HEAD and TAIL pointing to a single conceptual NULL
            const center = new THREE.Vector3(0, this.NODE_Y + 1, this.NODE_Z);
            this._createHTMLLabel('head', "HEAD", center.clone().setX(-2));
            this._createHTMLLabel('tail', "TAIL", center.clone().setX(2));
        }
    }
    async _updateNullPointers() {
        // Clear previous NULL meshes and arrows by name
        GFX.removeObj("nullNextMesh");
        GFX.removeObj("nullPrevMesh");
        GFX.clearNamedArrows(['nullNextArrow', 'nullPrevArrow']);

        if (this.nodes.length > 0) {
            const tailNode = this.nodes[this.nodes.length - 1];
            // NULL for Tail's Next pointer
            const nullNextPos = tailNode.mesh.position.clone();
            nullNextPos.x += this.NODE_SPACING * 1.5; // Position further right
            const nullNextMesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.error));
            nullNextMesh.position.copy(nullNextPos);
            GFX.addObj(nullNextMesh, "NULL", "nullNextMesh"); // Add with a name
            GFX.addArrow(
                new THREE.Vector3(tailNode.mesh.position.x + (this.NODE_SPACING/2) - 0.2, this.NODE_Y, this.NODE_Z), 
                new THREE.Vector3(nullNextMesh.position.x - (this.NODE_SPACING/2) + 0.2, this.NODE_Y, this.NODE_Z),
                Config.colors.error,
                'nullNextArrow'
            );

            if (this.doubly) {
                const headNode = this.nodes[0];
                // NULL for Head's Prev pointer
                const nullPrevPos = headNode.mesh.position.clone();
                nullPrevPos.x -= this.NODE_SPACING * 1.5; // Position further left
                const nullPrevMesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.error));
                nullPrevMesh.position.copy(nullPrevPos);
                GFX.addObj(nullPrevMesh, "NULL", "nullPrevMesh"); // Add with a name
                GFX.addArrow(
                    new THREE.Vector3(headNode.mesh.position.x - (this.NODE_SPACING/2) + 0.2, this.NODE_Y, this.NODE_Z + 0.7), // Use increased Z-offset
                    new THREE.Vector3(nullPrevMesh.position.x + (this.NODE_SPACING/2) - 0.2, this.NODE_Y, this.NODE_Z + 0.7), // Use increased Z-offset
                    Config.colors.error,
                    'nullPrevArrow'
                );
            }
        } else {
            // List is empty, show HEAD and TAIL pointing to a single NULL
            const center = new THREE.Vector3(0, this.NODE_Y, this.NODE_Z);
            const nullNextMesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.error));
            nullNextMesh.position.copy(center);
            GFX.addObj(nullNextMesh, "NULL", "nullNextMesh"); // Add with a name
        }
    }
    
    // Original methods modified
    async addHead() {
        const val = Math.floor(Math.random()*99);
        Log.add(`Inserting ${val} at the Head...`, "info");

        // Animate new node flying in
        const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.primary));
        mesh.position.set(-15, this.NODE_Y, this.NODE_Z); // Start far left (off-screen)
        GFX.addObj(mesh, val); // Add to scene with label
        mesh.userData.hoverText = `Value: ${val}<br>Current: Head`; // Initial hover text

        this.nodes.unshift({ val, mesh }); // Add to front of array
        
        Log.add(`Successfully inserted ${val} as the new Head.`, "success");
        await this.redraw(); // Redraw and animate all nodes
    }
    async addTail() {
        const val = Math.floor(Math.random()*99);
        Log.add(`Inserting ${val} at the Tail...`, "info");

        const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.primary));
        mesh.position.set(15, this.NODE_Y, this.NODE_Z); // Start far right (off-screen)
        GFX.addObj(mesh, val); // Add to scene with label
        mesh.userData.hoverText = `Value: ${val}<br>Current: Tail`; // Initial hover text

        this.nodes.push({val, mesh}); // Add to end of array
        
        Log.add(`Successfully inserted ${val} as the new Tail.`, "success");
        await this.redraw(); // Redraw and animate all nodes
    }
    async removeHead() {
        if(this.nodes.length === 0) {
            Log.add("Error: Cannot remove Head from an empty list.", "error");
            return;
        }

        const removedNode = this.nodes.shift(); // Remove from front of array
        Log.add(`Removing Head node with value: ${removedNode.val}...`, "info");

        // Animate removed node dropping and disappearing
        const mesh = removedNode.mesh;
        mesh.material = ResourceManager.getMaterial(Config.colors.error); // Highlight for removal
        const startPosition = mesh.position.clone();
        const endPosition = new THREE.Vector3(startPosition.x, -10, startPosition.z); // Drop far below
        const duration = 500 / Config.animSpeed;
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            const elapsed = Date.now() - startTime;
            const alpha = elapsed / duration;
            mesh.position.lerpVectors(startPosition, endPosition, alpha);
            await this.sleep(16);
        }
        
        GFX.removeObj(mesh); // Clean up from scene

        Log.add(`Successfully removed Head node (Value: ${removedNode.val}).`, "success");
        if (this.nodes.length > 0) {
            Log.add(`New Head node has value: ${this.nodes[0].val}.`, "success");
        } else {
            Log.add("List is now empty.", "warning");
        }
        await this.redraw(); // Redraw and animate remaining nodes
    }

    async removeTail() {
        if (this.nodes.length === 0) {
            Log.add("Error: Cannot remove Tail from an empty list.", "error");
            return;
        }
        if (this.nodes.length === 1) { // If only one node, it's also the head
            await this.removeHead();
            return;
        }

        Log.add(`Removing Tail node...`, "info");
        let removedNode;
        if (this.doubly) {
            // O(1) for Doubly Linked List
            removedNode = this.nodes.pop(); // Direct access
            Log.add(`DLL: Direct access to Tail (O(1)).`, "info");
        } else {
            // O(n) for Singly Linked List
            Log.add(`SLL: Traversing to find second-to-last node (O(n))...`, "info");
            for (let i = 0; i < this.nodes.length - 1; i++) {
                this.nodes[i].mesh.material = ResourceManager.getMaterial(Config.colors.highlight); // Highlight traversal
                await this.sleep(100 / Config.animSpeed);
                this.nodes[i].mesh.material = ResourceManager.getMaterial(Config.colors.primary); // Restore color
            }
            removedNode = this.nodes.pop(); // Remove from array
        }

        const mesh = removedNode.mesh;
        mesh.material = ResourceManager.getMaterial(Config.colors.error); // Highlight for removal
        const startPosition = mesh.position.clone();
        const endPosition = new THREE.Vector3(startPosition.x, -10, startPosition.z); // Drop far below
        const duration = 500 / Config.animSpeed;
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            const elapsed = Date.now() - startTime;
            const alpha = elapsed / duration;
            mesh.position.lerpVectors(startPosition, endPosition, alpha);
            await this.sleep(16);
        }

        GFX.removeObj(mesh); // Clean up from scene
        Log.add(`Successfully removed Tail node (Value: ${removedNode.val}).`, "success");
        Log.add(`New Tail node has value: ${this.nodes[this.nodes.length - 1].val}.`, "success");
        await this.redraw();
    }
    
    async resetList() {
        Log.add("Resetting Linked List...", "info");
        GFX.clear(); // Clears all objects, including 3D meshes and GFX-managed arrows
        // Explicitly clear HTML labels
        Object.keys(this.labelElements).forEach(id => this._removeHTMLLabel(id));
        GFX.clearNamedArrows(['headArrow', 'tailArrow', 'nullNextArrow', 'nullPrevArrow']); // Clear named arrows
        GFX.removeObj("nullNextMesh"); // Clear NULL box if it exists
        GFX.removeObj("nullPrevMesh"); // Clear NULL box if it exists
        this.nodes = [];
        
        Log.add("Linked List has been reset to empty.", "success");
        await this.redraw();
    }
}

export default LinkedListModule;