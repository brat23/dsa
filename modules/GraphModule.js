// modules/GraphModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class GraphModule extends ModuleBase {
    constructor() {
        super();
        this.nodes = {}; // Stores { val, mesh, edges, position }
        this.startNode = null;
        this.renderUI();

        // Initial camera adjustment
        GFX.camera.position.set(0, 10, 18);
        GFX.camera.lookAt(0, 0, 0);

        this.createGraph();
        Log.add("Welcome to the Graph Traversal Module!", "info");
        Log.add("Select a starting node by clicking on it, then choose a traversal algorithm.", "info");
    }

    renderUI() {
        document.getElementById('module-title').innerText = "Graph Traversal (BFS & DFS)";
        document.getElementById('module-desc').innerText = "Visualizing Breadth-First Search (BFS) and Depth-First Search (DFS) algorithms on a graph.";
        document.getElementById('complexity-badge').innerText = "BFS/DFS: O(V + E)";
        document.getElementById('action-bar').innerHTML = `
            <button data-action="runBFS" class="btn-primary">Run BFS</button>
            <button data-action="runDFS" class="btn-secondary">Run DFS</button>
            <button data-action="createGraph" class="btn-secondary">Reset Graph</button>
        `;
    }
    
    createGraph(buttonElement) { // Added buttonElement
        GFX.clear();
        this.nodes = {};
        this.startNode = null;

        const graphData = {
            nodes: [
                { id: 'A', position: new THREE.Vector3(-6, 4, 0) },
                { id: 'B', position: new THREE.Vector3(-2, 6, 0) },
                { id: 'C', position: new THREE.Vector3(2, 6, 0) },
                { id: 'D', position: new THREE.Vector3(6, 4, 0) },
                { id: 'E', position: new THREE.Vector3(-4, 0, 0) },
                { id: 'F', position: new THREE.Vector3(0, 2, 0) },
                { id: 'G', position: new THREE.Vector3(4, 0, 0) },
            ],
            edges: [
                ['A', 'B'], ['A', 'E'],
                ['B', 'C'], ['B', 'F'],
                ['C', 'D'], ['C', 'F'],
                ['D', 'G'],
                ['E', 'F'],
                ['F', 'G']
            ]
        };

        graphData.nodes.forEach(nodeData => {
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1, 1, 1]), ResourceManager.getMaterial(Config.colors.primary));
            mesh.position.copy(nodeData.position);
            mesh.userData.id = nodeData.id;
            mesh.userData.hoverText = `Node: ${nodeData.id}`;
            mesh.userData.onClick = () => this.setStartNode(nodeData.id);

            GFX.addObj(mesh, nodeData.id);
            this.nodes[nodeData.id] = { val: nodeData.id, mesh: mesh, edges: [], position: nodeData.position };
        });

        graphData.edges.forEach(([from, to]) => {
            GFX.addArrow(this.nodes[from].position, this.nodes[to].position, 0xffffff);
            this.nodes[from].edges.push(to);
            this.nodes[to].edges.push(from); // Undirected graph
        });

        Log.add("Graph created. Select a start node.", "success");
    }

    setStartNode(nodeId) {
        if (this.startNode) {
            // Reset color of previous start node
            this.nodes[this.startNode].mesh.material = ResourceManager.getMaterial(Config.colors.primary);
        }
        this.startNode = nodeId;
        this.nodes[nodeId].mesh.material = ResourceManager.getMaterial(Config.colors.highlight);
        Log.add(`Start node set to: ${nodeId}`, "highlight");
    }
    
    async runBFS(buttonElement) { // Added buttonElement
        if (!this.startNode) {
            Log.add("Error: Please select a starting node first.", "error");
            return;
        }

        // Reset node colors
        Object.values(this.nodes).forEach(n => n.mesh.material = ResourceManager.getMaterial(Config.colors.primary));
        this.nodes[this.startNode].mesh.material = ResourceManager.getMaterial(Config.colors.highlight);

        const queue = [this.startNode];
        const visited = new Set([this.startNode]);
        
        Log.add(`Starting BFS from node ${this.startNode}...`, "info");
        Log.add(`Queue: [${queue.join(', ')}]`, "info");
        
        while (queue.length > 0) {
            const currentNodeId = queue.shift();
            const currentNode = this.nodes[currentNodeId];
            
            // Highlight current node being processed
            currentNode.mesh.material = ResourceManager.getMaterial(Config.colors.success);
            Log.add(`Visiting: ${currentNodeId}. Queue: [${queue.join(', ')}]`, "success");
            await this.sleep(500 / Config.animSpeed);

            for (const neighborId of currentNode.edges) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                    
                    // Highlight newly discovered neighbor
                    this.nodes[neighborId].mesh.material = ResourceManager.getMaterial(Config.colors.warning);
                    Log.add(`  Found neighbor: ${neighborId}. Adding to queue. Queue: [${queue.join(', ')}]`, "info");
                    await this.sleep(300 / Config.animSpeed);
                }
            }
        }
        Log.add("BFS Traversal Complete!", "highlight");
    }

    async runDFS(buttonElement) {
        if (!this.startNode) {
            Log.add("Error: Please select a starting node first.", "error");
            return;
        }

        // Reset node colors
        Object.values(this.nodes).forEach(n => n.mesh.material = ResourceManager.getMaterial(Config.colors.primary));
        this.nodes[this.startNode].mesh.material = ResourceManager.getMaterial(Config.colors.highlight);

        const visited = new Set();
        const stack = []; // For logging purposes, conceptually

        Log.add(`Starting DFS from node ${this.startNode}...`, "info");
        
        await this._dfsRecursive(this.startNode, visited, stack);
        
        Log.add("DFS Traversal Complete!", "highlight");
    }

    async _dfsRecursive(nodeId, visited, stack) {
        visited.add(nodeId);
        const currentNode = this.nodes[nodeId];
        stack.push(nodeId); // Add to conceptual stack for logging

        // Highlight current node being processed
        currentNode.mesh.material = ResourceManager.getMaterial(Config.colors.success); // Visited and currently processing
        Log.add(`Visiting: ${nodeId}. Stack: [${stack.join(', ')}]`, "success");
        await this.sleep(500 / Config.animSpeed);

        for (const neighborId of currentNode.edges) {
            if (!visited.has(neighborId)) {
                // Highlight newly discovered neighbor (about to be explored)
                this.nodes[neighborId].mesh.material = ResourceManager.getMaterial(Config.colors.warning);
                Log.add(`  Found unvisited neighbor: ${neighborId}. Exploring...`, "info");
                await this.sleep(300 / Config.animSpeed);
                await this._dfsRecursive(neighborId, visited, stack);
            }
        }
        stack.pop(); // Remove from conceptual stack after all neighbors explored
        // Revert color if not the start node (start node remains highlighted)
        if (nodeId !== this.startNode) {
            currentNode.mesh.material = ResourceManager.getMaterial(Config.colors.primary); 
        }
    }
}

export default GraphModule;
