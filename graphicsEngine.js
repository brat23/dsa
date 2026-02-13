// graphicsEngine.js - Space Complexity integrated into Log
import ResourceManager from './resourceManager.js';
import Config from './config.js'; // Needed for colors in some methods
import Log from './logger.js'; // Log error if context-menu is not found

class GraphicsEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020617);
        this.scene.fog = new THREE.FogExp2(0x020617, 0.02);

        this.container = document.getElementById('canvas-container');
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // Lighting
        const amb = new THREE.AmbientLight(0xffffff, 1.2);
        const hemisphereLight = new THREE.HemisphereLight(0xccccff, 0x666688, 0.5);
        const dir = new THREE.DirectionalLight(0xffffff, 1.5);
        dir.position.set(15, 25, 10); 
        dir.castShadow = true;
        this.scene.add(amb, dir, hemisphereLight);

        // Grid
        const grid = new THREE.GridHelper(60, 60, 0x1e293b, 0x0f172a);
        this.scene.add(grid);

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null; // Track currently hovered object
        this.tooltip = null; // HTML element for tooltip

        // Event Listeners
        window.addEventListener('resize', this.onResize);
        this.renderer.domElement.addEventListener('click', this.onClick);
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove); // New mousemove listener

        this.objects = []; // Track active objects for cleanup
        this.labels = [];  // Track DOM labels
        this.arrows = []; // Track arrows

        this.createTooltip(); // Create the tooltip element

        this.render();
    }

    onResize = () => {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onClick = (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Filter only interactive meshes
        const intersects = this.raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData && obj.userData.onClick) {
                obj.userData.onClick(obj);
            }
        } else {
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu) {
                contextMenu.style.display = 'none';
            } else {
                Log.add("Error: #context-menu element not found.", "error");
            }
        }
    }

    onMouseMove = (event) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'gfx-tooltip';
        this.tooltip.className = 'glass-panel text-xs text-slate-200 px-3 py-2 rounded-lg pointer-events-none opacity-0 transition-opacity duration-100 ease-in-out';
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.zIndex = 1000;
        document.body.appendChild(this.tooltip);
    }

    clear() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.arrows.forEach(a => this.scene.remove(a));
        this.objects = [];
        this.arrows = [];
        
        const labelContainer = document.getElementById('labels-layer');
        if (labelContainer) {
            labelContainer.innerHTML = '';
        } else {
            Log.add("Error: #labels-layer element not found.", "error");
        }
        this.labels = [];

        // Reset hovered object and hide tooltip
        if (this.hoveredObject && this.hoveredObject.userData.originalMaterial) {
            this.hoveredObject.material = this.hoveredObject.userData.originalMaterial; // Restore original material
        }
        this.hoveredObject = null;
        if (this.tooltip) {
            this.tooltip.style.opacity = 0; // Hide tooltip
        }

        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        } else {
            Log.add("Error: #context-menu element not found.", "error");
        }
    }

    removeObj(mesh) {
        if (!mesh) return;

        // If mesh is a string, assume it's a name
        if (typeof mesh === 'string') {
            const objToRemove = this.objects.find(obj => obj.userData.name === mesh);
            if (objToRemove) {
                this._removeSingleObj(objToRemove);
            }
        } else {
            this._removeSingleObj(mesh);
        }
    }

    _removeSingleObj(objToRemove) {
        this.scene.remove(objToRemove);

        const objIndex = this.objects.indexOf(objToRemove);
        if (objIndex > -1) {
            this.objects.splice(objIndex, 1);
        }

        const labelIndex = this.labels.findIndex(l => l.mesh === objToRemove);
        if (labelIndex > -1) {
            const label = this.labels[labelIndex];
            if (label.el) {
                label.el.remove();
            }
            this.labels.splice(labelIndex, 1);
        }

        if (this.hoveredObject === objToRemove) {
            this.hoveredObject = null;
            if (this.tooltip) {
                this.tooltip.style.opacity = 0;
            }
        }
    }

    addObj(mesh, labelText, name = null) {
        this.scene.add(mesh);
        this.objects.push(mesh);
        mesh.userData.originalMaterial = mesh.material;
        if (name) {
            mesh.userData.name = name;
        }
        if(labelText !== undefined) {
            const el = document.createElement('div');
            el.className = 'node-label';
            el.innerText = labelText;
            const labelContainer = document.getElementById('labels-layer');
            if (labelContainer) {
                labelContainer.appendChild(el);
                this.labels.push({ el, mesh });
            } else {
                Log.add("Error: #labels-layer element not found for adding label.", "error");
            }
        }
    }

    addArrow(from, to, color=0xffffff, name = null) {
        const dir = new THREE.Vector3().subVectors(to, from);
        // Adjust arrow length based on distance, but ensure it's not negative
        const len = Math.max(0.1, dir.length() - 1.2); 
        
        dir.normalize();
        
        const arrow = new THREE.ArrowHelper(dir, from, len, color, 0.5, 0.3);
        if (name) {
            arrow.userData.name = name;
        }
        this.scene.add(arrow);
        this.arrows.push(arrow);
    }

    clearNamedArrows(names) {
        this.arrows = this.arrows.filter(arrow => {
            if (names.includes(arrow.userData.name)) {
                this.scene.remove(arrow);
                return false; // Remove from array
            }
            return true; // Keep in array
        });
    }

    project3DPointToScreen(position) {
        const vector = position.clone();
        vector.project(this.camera); // Project the 3D point to 2D screen space

        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;

        return { x, y };
    }

    render() {
        requestAnimationFrame(() => this.render());
        this.controls.update();

        // Hover Detection
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const newHoveredObject = intersect.object;

            if (this.hoveredObject !== newHoveredObject) {
                // Mouse moved to a new object or from no object to an object
                if (this.hoveredObject && this.hoveredObject.userData.originalMaterial) {
                    this.hoveredObject.material = this.hoveredObject.userData.originalMaterial; // Restore original material
                }
                this.hoveredObject = newHoveredObject;
                this.hoveredObject.userData.originalMaterial = this.hoveredObject.material; // Store original
                this.hoveredObject.material = ResourceManager.getMaterial(Config.colors.highlight); // Apply highlight
                
                if (this.tooltip && this.hoveredObject.userData.hoverText) {
                    this.tooltip.innerHTML = this.hoveredObject.userData.hoverText;
                    this.tooltip.style.opacity = 1;
                    // Position tooltip near cursor or object
                    const rect = this.renderer.domElement.getBoundingClientRect(); // Get fresh rect for positioning
                    const x = event ? event.clientX + 10 : rect.left + this.mouse.x * (rect.width / 2) + rect.width / 2 + 10;
                    const y = event ? event.clientY + 10 : rect.top + ( -this.mouse.y * (rect.height / 2) + rect.height / 2) + 10;
                    this.tooltip.style.left = `${x}px`;
                    this.tooltip.style.top = `${y}px`;
                }
            }
            // If the same object is hovered, just ensure tooltip is updated (e.g., position)
            else if (this.tooltip && this.hoveredObject.userData.hoverText && this.tooltip.style.opacity == 1) {
                 const rect = this.renderer.domElement.getBoundingClientRect();
                 const x = event ? event.clientX + 10 : rect.left + this.mouse.x * (rect.width / 2) + rect.width / 2 + 10;
                 const y = event ? event.clientY + 10 : rect.top + ( -this.mouse.y * (rect.height / 2) + rect.height / 2) + 10;
                 this.tooltip.style.left = `${x}px`;
                 this.tooltip.style.top = `${y}px`;
            }

        } else {
            // No object is hovered
            if (this.hoveredObject && this.hoveredObject.userData.originalMaterial) {
                this.hoveredObject.material = this.hoveredObject.userData.originalMaterial; // Restore original material
            }
            this.hoveredObject = null;
            if (this.tooltip) {
                this.tooltip.style.opacity = 0; // Hide tooltip
            }
        }

        // Sync Labels (existing code)
        for(let l of this.labels) {
            const v = l.mesh.position.clone();
            v.y += 0.6; // Offset
            v.project(this.camera);
            
            const x = (v.x * .5 + .5) * this.container.clientWidth;
            const y = (-(v.y * .5) + .5) * this.container.clientHeight;

            l.el.style.transform = `translate(-50%, -50%)`;
            l.el.style.left = `${x}px`;
            l.el.style.top = `${y}px`;
            l.el.style.opacity = (v.z > 1) ? 0 : 1; // Hide if behind camera
        }

        this.renderer.render(this.scene, this.camera);
    }
}

const GFX = new GraphicsEngine();
export default GFX;