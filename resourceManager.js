// resourceManager.js
import Config from './config.js';

const ResourceManager = {
    geometries: new Map(),
    materials: new Map(),
    
    getGeometry(type, params) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.geometries.has(key)) {
            let geo;
            if(type === 'box') geo = new THREE.BoxGeometry(...params);
            else if(type === 'sphere') geo = new THREE.SphereGeometry(...params);
            else if(type === 'arrow') geo = new THREE.ConeGeometry(...params); // Arrow head
            this.geometries.set(key, geo);
        }
        return this.geometries.get(key);
    },

    getMaterial(color, transparent=false) {
        const key = `${color}_${transparent}`;
        if (!this.materials.has(key)) {
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.6,
                transparent: transparent,
                opacity: transparent ? 0.5 : 1.0
            });
            this.materials.set(key, mat);
        }
        return this.materials.get(key);
    },

    dispose() {
        // In a real app we'd dispose unused assets, but for this arcade 
        // we keep them cached as they are reused frequently across modules.
    }
};

export default ResourceManager;