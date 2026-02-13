// modules/BSTModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class BSTModule extends ModuleBase {
    constructor() {
        super();
        this.root = null;
        this.renderUI();
        GFX.camera.position.set(0, 10, 20);
    }
    renderUI() {
        document.getElementById('module-title').innerText = "Binary Search Tree";
        document.getElementById('module-desc').innerText = "Ordered Tree. Left < Root < Right. Interactive: Click nodes to delete.";
        document.getElementById('complexity-badge').innerText = "Search/Insert: O(log n)";
        document.getElementById('action-bar').innerHTML = `
            <button onclick="window.App.module.insertRandom()" class="btn-primary">Insert Random</button>
            <button onclick="window.App.module.traverse('inorder')" class="btn-secondary">In-Order</button>
            <button onclick="window.App.module.traverse('preorder')" class="btn-secondary">Pre-Order</button>
        `;
    }

    async insertRandom() {
        const val = Math.floor(Math.random()*99);
        Log.add(`Inserting ${val}...`);
        
        if(!this.root) {
            this.root = this.createNode(val, 0, 5);
            Log.add("Created Root", "success");
            return;
        }

        await this._insertRec(this.root, val, 0, 5, 8);
    }

    createNode(val, x, y) {
        const mesh = new THREE.Mesh(ResourceManager.getGeometry('sphere', [0.6, 32, 32]), ResourceManager.getMaterial(Config.colors.success));
        mesh.position.set(x, y, 0);
        
        // Interaction
        mesh.userData.onClick = (obj) => {
            Log.add(`Selected Node: ${val}`, 'highlight');
            obj.material = ResourceManager.getMaterial(Config.colors.error);
            // In a full implementation, we would show a delete context menu here
        };

        GFX.addObj(mesh, val);
        return { val, x, y, mesh, left: null, right: null };
    }

    async _insertRec(node, val, x, y, width) {
        node.mesh.material = ResourceManager.getMaterial(Config.colors.highlight);
        await this.sleep(400);
        node.mesh.material = ResourceManager.getMaterial(Config.colors.success);

        if(val < node.val) {
            if(!node.left) {
                const nx = x - width/2; const ny = y - 2;
                node.left = this.createNode(val, nx, ny);
                GFX.addArrow(node.mesh.position, node.left.mesh.position);
            } else {
                await this._insertRec(node.left, val, x - width/2, y - 2, width/2);
            }
        } else {
            if(!node.right) {
                const nx = x + width/2; const ny = y - 2;
                node.right = this.createNode(val, nx, ny);
                GFX.addArrow(node.mesh.position, node.right.mesh.position);
            } else {
                await this._insertRec(node.right, val, x + width/2, y - 2, width/2);
            }
        }
    }

    async traverse(type) {
        Log.add(`Starting ${type} traversal...`, 'highlight');
        if(type === 'inorder') await this._inOrder(this.root);
        if(type === 'preorder') await this._preOrder(this.root);
        Log.add("Traversal Complete.");
    }

    async _inOrder(node) {
        if(!node) return;
        await this._inOrder(node.left);
        await this.visit(node);
        await this._inOrder(node.right);
    }

    async _preOrder(node) {
        if(!node) return;
        await this.visit(node);
        await this._preOrder(node.left);
        await this._preOrder(node.right);
    }

    async visit(node) {
        node.mesh.material = ResourceManager.getMaterial(Config.colors.highlight);
        Log.add(`Visited: ${node.val}`);
        await this.sleep(500);
        node.mesh.material = ResourceManager.getMaterial(Config.colors.success);
    }
}

export default BSTModule;
