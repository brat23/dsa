// moduleBase.js
import GFX from './graphicsEngine.js';
import Config from './config.js';

class ModuleBase {
    constructor() {
        this.cancelToken = false;
        GFX.clear();
    }
    async sleep(ms) {
        if(this.cancelToken) throw new Error("CANCELLED");
        return new Promise(r => setTimeout(r, ms / Config.animSpeed));
    }
    destroy() { this.cancelToken = true; }
}

export default ModuleBase;
