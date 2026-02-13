// modules/BigOModule.js
import ModuleBase from '../moduleBase.js';
import GFX from '../graphicsEngine.js';
import Log from '../logger.js';
import Config from '../config.js';
import ResourceManager from '../resourceManager.js';

class BigOModule extends ModuleBase {
    constructor() {
        super();
        this.renderUI();
        GFX.camera.position.set(0, 5, 15);
        GFX.camera.lookAt(0, 0, 0);
        this.showO1('btn-bigo-o1'); // Automatically show O(1) on load
    }

    renderUI() {
        document.getElementById('module-title').innerText = "Big O Notation";
        document.getElementById('module-desc').innerText = "Understand time and space complexity with interactive examples. Select a complexity below to learn more.";
        document.getElementById('complexity-badge').innerText = "Select a Complexity";
        document.getElementById('action-bar').innerHTML = `
            <button id="btn-bigo-o1" data-action="showO1" data-button-id="btn-bigo-o1" class="btn-primary btn-complexity">O(1) - Constant Time</button>
            <button id="btn-bigo-logn" data-action="showLogN" data-button-id="btn-bigo-logn" class="btn-secondary btn-complexity">O(log n) - Logarithmic Time</button>
            <button id="btn-bigo-on" data-action="showON" data-button-id="btn-bigo-on" class="btn-secondary btn-complexity">O(n) - Linear Time</button>
            <button id="btn-bigo-on2" data-action="showON2" data-button-id="btn-bigo-on2" class="btn-secondary btn-complexity">O(n²) - Quadratic Time</button>
            <button id="btn-bigo-nlogn" data-action="showNLogN" data-button-id="btn-bigo-nlogn" class="btn-secondary btn-complexity">O(n log n) - Linearithmic Time</button>
        `;
        // Ensure initial button state is active for O(1)
        this.setActiveComplexityButton('btn-bigo-o1');
    }

    setActiveComplexityButton(buttonId) {
        document.querySelectorAll('.btn-complexity').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary'); // Revert to secondary style
        });
        const activeButton = document.getElementById(buttonId);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.classList.remove('btn-secondary'); // Remove secondary style
            activeButton.classList.add('btn-primary'); // Apply primary style
        }
    }

    async showO1(buttonId) {
        this.setActiveComplexityButton(buttonId);
        document.getElementById('complexity-badge').innerText = "O(1)";
        GFX.clear();
        Log.clear();
        Log.add("✨ O(1) - Constant Time Complexity ✨", "highlight");
        Log.add("This refers to an operation that always takes the *same amount of time* to complete, no matter how large the input data (n) becomes. It's super efficient!");
        Log.add("In this visualization, we have an array of elements. We're directly accessing an element using its index.");
        Log.add("No matter if the array has 5, 500, or 5 million elements, finding a specific element by its index is a single, instant step.", "info");
        Log.add("Pros: Extremely fast and predictable. Ideal for critical operations.", "success");
        Log.add("Cons: Not always possible to achieve for complex tasks.", "warning");

        Log.add("🚀 Space Complexity: O(1) - Constant Space 🚀", "highlight");
        Log.add("An algorithm has O(1) space complexity if it requires a constant amount of memory, regardless of the input size (n).");
        Log.add("This means it doesn't need to create new data structures that grow with 'n'.");

        const arraySize = 5;
        const boxes = [];
        const startX = -(arraySize * 1.5) / 2 + 0.75;

        for (let i = 0; i < arraySize; i++) {
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.base));
            mesh.position.set(startX + (i * 1.5), 0, 0);
            GFX.addObj(mesh, `Index ${i}`);
            boxes.push(mesh);
        }

        await this.sleep(1000);
        Log.add("Accessing element at index 2...", "info");
        const targetIndex = 2;
        boxes[targetIndex].material = ResourceManager.getMaterial(Config.colors.success);
        await this.sleep(1500);
        boxes[targetIndex].material = ResourceManager.getMaterial(Config.colors.base);
        Log.add("Operation complete in constant time!", "success");
        Log.add("This visualization demonstrates O(1) space complexity. We only needed a few variables, not new structures proportional to the array size.", "success");
    }

    async showLogN(buttonId) {
        this.setActiveComplexityButton(buttonId);
        document.getElementById('complexity-badge').innerText = "O(log n)";
        GFX.clear();
        Log.clear();
        Log.add("🌲 O(log n) - Logarithmic Time Complexity 🌲", "highlight");
        Log.add("This means the time to complete an operation grows *very slowly* as the input size (n) increases. Think of it like a treasure hunt where clues always cut your search area in half!");
        Log.add("The most famous example is Binary Search, where we efficiently find an item in a sorted list.");
        Log.add("Each step of a logarithmic algorithm *eliminates a large portion* of the remaining data.", "info");
        Log.add("Pros: Extremely efficient for large datasets, especially for searching.", "success");
        Log.add("Cons: Requires data to be sorted (for search) or specific data structures (like balanced trees).", "warning");

        Log.add("🚀 Space Complexity: O(log n) - Logarithmic Space 🚀", "highlight");
        Log.add("Binary search itself typically has O(1) space complexity if implemented iteratively (without recursion).");
        Log.add("However, if implemented recursively, each recursive call adds a frame to the call stack. This stack depth grows logarithmically with 'n'.");
        Log.add("This visualization focuses on the time aspect, but remember that recursive binary search does use O(log n) space!", "info");
        await this.sleep(1000);

        const arraySize = 31; // For perfect halving (2^5 - 1)
        const numbers = Array.from({length: arraySize}, (_, i) => i + 1);
        const boxes = [];
        const startX = -(arraySize * 0.8) / 2 + 0.4;

        // Render initial array
        for (let i = 0; i < arraySize; i++) {
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [0.7, 0.7, 0.7]), ResourceManager.getMaterial(Config.colors.base));
            mesh.position.set(startX + (i * 0.8), 0, 0);
            GFX.addObj(mesh, numbers[i]);
            boxes.push(mesh);
        }

        await this.sleep(1000);
        const targetValue = 25;
        Log.add(`Searching for ${targetValue} using Binary Search...`, "info");

        let low = 0;
        let high = arraySize - 1;
        
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            
            // Highlight current search space
            for (let i = 0; i < arraySize; i++) {
                if (i >= low && i <= high) {
                    boxes[i].material = ResourceManager.getMaterial(Config.colors.warning);
                } else {
                    boxes[i].material = ResourceManager.getMaterial(Config.colors.base);
                }
            }
            boxes[mid].material = ResourceManager.getMaterial(Config.colors.highlight); // Highlight mid

            Log.add(`Checking mid element at index ${mid} (value: ${numbers[mid]})`, "info");
            await this.sleep(1000 / Config.animSpeed);

            if (numbers[mid] === targetValue) {
                Log.add(`${targetValue} found at index ${mid}!`, "success");
                boxes[mid].material = ResourceManager.getMaterial(Config.colors.success);
                break;
            } else if (numbers[mid] < targetValue) {
                Log.add(`${numbers[mid]} is too small. Searching right half.`, "info");
                low = mid + 1;
            } else {
                Log.add(`${numbers[mid]} is too large. Searching left half.`, "info");
                high = mid - 1;
            }
            await this.sleep(1000 / Config.animSpeed);
        }
        
        if (low > high) {
            Log.add(`${targetValue} not found in the array. Even when not found, the process is quick!`, "error");
        }
        Log.add("Iterative binary search typically uses O(1) space, meaning a fixed amount of memory regardless of the array size.", "success");
    }

        async showON(buttonId) {

            this.setActiveComplexityButton(buttonId);

            document.getElementById('complexity-badge').innerText = "O(n)";

            GFX.clear();

            Log.clear();

            Log.add("🚶 O(n) - Linear Time Complexity 🚶", "highlight");

            Log.add("This means the time to complete an operation grows *directly and proportionally* with the input size (n). If you double the input, you roughly double the time it takes.");

            Log.add("A common example is iterating through an array or list to find a specific value, or processing each item once.");

            Log.add("We have to potentially look at every single element once in the worst-case scenario.", "info");

            Log.add("Pros: Often the best achievable if you must process every item. Simple to understand.", "success");

            Log.add("Cons: Performance degrades noticeably with very large inputs. Avoid if a logarithmic solution is possible.", "warning");

    

            Log.add("🚀 Space Complexity: O(1) - Constant Space 🚀", "highlight");

            Log.add("Similar to O(1) time, O(1) space complexity means the memory usage does not depend on the input size (n).");

            Log.add("In this example, we only need a few variables to keep track of the current element and whether we found our target, regardless of the array's size.", "info");

            const arraySize = 8;

            const boxes = [];

            const startX = -(arraySize * 1.5) / 2 + 0.75;

            const targetValue = Math.floor(Math.random() * 9) + 1; // Target a value between 1-9

    

            for (let i = 0; i < arraySize; i++) {

                const val = Math.floor(Math.random() * 10); // Values 0-9

                const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.base));

                mesh.position.set(startX + (i * 1.5), 0, 0);

                GFX.addObj(mesh, val);

                boxes.push({val, mesh});

            }

            Log.add(`Searching for value: ${targetValue} in the array...`);

            await this.sleep(1000);

    

            let found = false;

            for(let i=0; i<arraySize; i++) {

                boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.highlight);

                Log.add(`Checking element at index ${i} (value: ${boxes[i].val})`, "info");

                await this.sleep(500 / Config.animSpeed);

    

                if(boxes[i].val === targetValue) {

                    boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.success);

                    Log.add(`Found ${targetValue} at index ${i}!`, "success");

                    found = true;

                    break;

                }

                boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.base); // Reset color if not found

            }

            if (!found) {

                Log.add(`${targetValue} not found in the array.`, "error");

            }

            Log.add("This linear search demonstrates O(1) space complexity.", "success");

        }

    async showON2(buttonId) {
        this.setActiveComplexityButton(buttonId);
        document.getElementById('complexity-badge').innerText = "O(n²)";
        GFX.clear();
        Log.clear();
        Log.add("💥 O(n²) - Quadratic Time Complexity 💥", "highlight");
        Log.add("This means the time to complete an operation grows *exponentially* with the square of the input size (n). If you double the input, the time could quadruple!");
        Log.add("This often happens when you have nested loops, where for each item in a collection, you iterate through the entire collection again.");
        Log.add("Example: Simple sorting algorithms like Bubble Sort or Selection Sort, where every element is compared with every other element.", "info");
        Log.add("Pros: Sometimes the most straightforward solution, or the only solution if no more efficient algorithm exists for a specific problem.", "success");
        Log.add("Cons: Becomes extremely slow very quickly as 'n' increases. Avoid for large datasets whenever possible. A classic 'performance killer'.", "warning");

        Log.add("🚀 Space Complexity: O(1) - Constant Space (for in-place sorting) 🚀", "highlight");
        Log.add("For many O(n²) algorithms like Bubble Sort, if implemented 'in-place' (modifying the original array without creating new ones), the space complexity can be O(1).");
        Log.add("We only need a few extra variables for comparisons and swaps, which doesn't grow with 'n'.", "info");
        const arraySize = 5;
        const boxes = [];
        const startX = -(arraySize * 1.5) / 2 + 0.75;

        for (let i = 0; i < arraySize; i++) {
            const val = Math.floor(Math.random() * 10);
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.base));
            mesh.position.set(startX + (i * 1.5), 0, 0);
            GFX.addObj(mesh, val);
            boxes.push({val, mesh});
        }
        Log.add("Simulating a quadratic time operation (nested loops)...");
        await this.sleep(1000);

        for (let i = 0; i < arraySize; i++) {
            boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.warning); // Outer loop element
            Log.add(`Outer loop: Element ${boxes[i].val} at index ${i}`);
            await this.sleep(500 / Config.animSpeed);
            for (let j = 0; j < arraySize; j++) {
                boxes[j].mesh.material = ResourceManager.getMaterial(Config.colors.highlight); // Inner loop element
                Log.add(`  Inner loop: Comparing with ${boxes[j].val} at index ${j}`);
                await this.sleep(200 / Config.animSpeed);
                boxes[j].mesh.material = ResourceManager.getMaterial(Config.colors.base); // Reset inner
            }
            boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.base); // Reset outer
        }
        Log.add("Quadratic operation complete!", "success");
        Log.add("Even with high time complexity, the space usage can be efficient if the algorithm works in-place (O(1) space).", "success");
    }

    async showNLogN(buttonId) {
        this.setActiveComplexityButton(buttonId);
        document.getElementById('complexity-badge').innerText = "O(n log n)";
        GFX.clear();
        Log.clear();
        Log.add("📈 O(n log n) - Linearithmic Time Complexity 📈", "highlight");
        Log.add("This is a very efficient complexity, much better than O(n²), and often the 'gold standard' for sorting algorithms.");
        Log.add("It combines the linear (n) and logarithmic (log n) factors. Think of algorithms that divide the problem into smaller parts (log n) and then process those parts linearly (n).");
        Log.add("Example: Efficient sorting algorithms like Merge Sort or Quick Sort. They divide the array to sort it (log n) and then merge/combine parts (n).", "info");
        Log.add("Pros: Highly scalable for large datasets, making them practical for real-world applications.", "success");
        Log.add("Cons: More complex to implement than O(n²) algorithms. Still not as fast as O(n) or O(log n) but a great general-purpose solution.", "warning");

        Log.add("🚀 Space Complexity: O(n) - Linear Space (for Merge Sort) 🚀", "highlight");
        Log.add("Merge Sort typically uses O(n) auxiliary space because it needs a temporary array to merge elements. Quick Sort can be O(log n) space in the average case but O(n) in worst case.");
        Log.add("For this visualization, we'll demonstrate a simplified O(n) space pattern for Merge Sort's auxiliary array, which temporarily grows with 'n'.", "info");
        
        const arraySize = 8;
        const boxes = [];
        const startX = -(arraySize * 1.5) / 2 + 0.75;

        for (let i = 0; i < arraySize; i++) {
            const val = Math.floor(Math.random() * 10);
            const mesh = new THREE.Mesh(ResourceManager.getGeometry('box', [1.2, 1, 1.2]), ResourceManager.getMaterial(Config.colors.base));
            mesh.position.set(startX + (i * 1.5), 0, 0);
            GFX.addObj(mesh, val);
            boxes.push({val, mesh});
        }
        Log.add("Simulating O(n log n) operation (e.g., Merge Sort)...");
        Log.add("Imagine dividing the array in halves (log n steps) and then merging (n steps).");
        await this.sleep(1000);

        // Simple visual approximation: multiple passes, highlighting groups
        for (let pass = 0; pass < Math.ceil(Math.log2(arraySize)); pass++) {
            Log.add(`Pass ${pass + 1}: Dividing and conquering...`, "info");
            Log.add(`  Simulating auxiliary space for sub-arrays: Approximately O(n / 2^pass)`, "info");
            for (let i = 0; i < arraySize; i++) {
                boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.warning);
            }
            await this.sleep(500 / Config.animSpeed);

            Log.add(`Merging sub-arrays...`, "info");
            Log.add(`  Auxiliary space temporarily increases to O(n) for merging.`, "info");
            for (let i = 0; i < arraySize; i++) {
                boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.highlight);
                await this.sleep(100 / Config.animSpeed);
                boxes[i].mesh.material = ResourceManager.getMaterial(Config.colors.base);
            }
            await this.sleep(500 / Config.animSpeed);
        }
        Log.add("O(n log n) operation complete!", "success");
        Log.add("Merge Sort uses O(n) auxiliary space, as it needs temporary arrays proportional to the input size during merging.", "success");
    }
}

export default BigOModule;