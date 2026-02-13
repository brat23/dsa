// modules/SortingModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Config from '../config.js';
import Log from '../logger.js';
import ResourceManager from '../resourceManager.js';

class SortingModule extends ModuleBase {
    constructor(type) {
        super();
        this.type = type;
        this.array = [];
        this.renderUI();
        this.generate();
    }
    renderUI() {
        const names = {
            'bubble': 'Bubble Sort', 'selection': 'Selection Sort', 
            'insertion': 'Insertion Sort', 'quick': 'Quick Sort'
        };
        document.getElementById('module-title').innerText = names[this.type];
        document.getElementById('module-desc').innerText = "Visualizing sorting algorithms. Comparing efficiency and mechanics.";
        document.getElementById('complexity-badge').innerText = (this.type === 'quick') ? "O(n log n)" : "O(n²)";
        document.getElementById('action-bar').innerHTML = `
            <button onclick="window.App.module.generate()" class="btn-secondary">Randomize</button>
            <button onclick="window.App.module.run()" class="btn-primary">Sort</button>
        `;
    }
    generate() {
        GFX.clear();
        this.array = [];
        for(let i=0; i<10; i++) {
            const h = Math.floor(Math.random()*8) + 1;
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1, h, 1]), ResourceManager.getMaterial(0xffffff));
            mesh.position.set((i*1.5)-7, h/2, 0);
            GFX.addObj(mesh, h);
            this.array.push({ val: h, mesh });
        }
    }
    async run() {
        if(this.type === 'bubble') await this.bubbleSort();
        if(this.type === 'selection') await this.selectionSort();
        if(this.type === 'insertion') await this.insertionSort();
        if(this.type === 'quick') await this.quickSort(0, this.array.length-1);
        Log.add("Array Sorted!", "success");
    }

    async swap(i, j) {
        const tempPos = this.array[i].mesh.position.x;
        this.array[i].mesh.position.x = this.array[j].mesh.position.x;
        this.array[j].mesh.position.x = tempPos;
        
        const temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        await this.sleep(200);
    }

    async bubbleSort() {
        const n = this.array.length;
        for(let i=0; i<n; i++) {
            for(let j=0; j<n-i-1; j++) {
                this.highlight(j, 0xffff00); this.highlight(j+1, 0xffff00);
                await this.sleep(200);
                if(this.array[j].val > this.array[j+1].val) {
                    await this.swap(j, j+1);
                }
                this.resetColor(j); this.resetColor(j+1);
            }
            this.highlight(n-1-i, Config.colors.success); // Sorted
        }
    }

    async selectionSort() {
        const n = this.array.length;
        for(let i=0; i<n; i++) {
            let minIdx = i;
            this.highlight(i, 0x0000ff); // Current position
            
            for(let j=i+1; j<n; j++) {
                this.highlight(j, 0xffff00); // Check
                await this.sleep(100);
                if(this.array[j].val < this.array[minIdx].val) {
                    if(minIdx !== i) this.resetColor(minIdx);
                    minIdx = j;
                    this.highlight(minIdx, 0xff0000); // New Min
                } else {
                    this.resetColor(j);
                }
            }
            if(minIdx !== i) await this.swap(i, minIdx);
            this.highlight(i, Config.colors.success);
        }
    }

    async insertionSort() {
         const n = this.array.length;
         this.highlight(0, Config.colors.success);
         for (let i = 1; i < n; i++) {
             let key = this.array[i];
             let j = i - 1;
             
             key.mesh.position.z = 2; // Pull out
             this.highlight(i, 0xff0000);
             await this.sleep(400);

             while (j >= 0 && this.array[j].val > key.val) {
                 this.highlight(j, 0xffff00);
                 await this.sleep(200);
                 // Shift visual
                 this.array[j].mesh.position.x += 1.5;
                 this.array[j+1] = this.array[j];
                 this.resetColor(j);
                 j--;
             }
             // Insert
             const targetX = ((j+1)*1.5)-7;
             key.mesh.position.x = targetX;
             key.mesh.position.z = 0;
             this.array[j+1] = key;
             
             // Mark sorted range
             for(let k=0; k<=i; k++) this.highlight(k, Config.colors.success);
         }
    }

    async quickSort(low, high) {
        if(low < high) {
            let pi = await this.partition(low, high);
            await this.quickSort(low, pi-1);
            await this.quickSort(pi+1, high);
        }
    }

    async partition(low, high) {
        let pivot = this.array[high];
        this.highlight(high, 0xff00ff); // Pivot
        let i = low - 1;
        for(let j=low; j<high; j++) {
            this.highlight(j, 0xffff00);
            await this.sleep(100);
            if(this.array[j].val < pivot.val) {
                i++;
                await this.swap(i, j);
            }
            this.resetColor(j);
        }
        await this.swap(i+1, high);
        return i+1;
    }

    highlight(idx, color) { this.array[idx].mesh.material = ResourceManager.getMaterial(color); }
    resetColor(idx) { this.array[idx].mesh.material = ResourceManager.getMaterial(0xffffff); }
}

export default SortingModule;