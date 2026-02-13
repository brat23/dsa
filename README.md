# DSA Arcade 🚀

Welcome to DSA Arcade, a stunning 3D interactive environment for visualizing fundamental Data Structures and Algorithms. Built with pure JavaScript and Three.js, this project aims to make learning complex computer science concepts intuitive and fun.

**[Live Demo](https://brat23.github.io/dsa/)** 🎮

![DSA Arcade In Action](https://raw.githubusercontent.com/brat23/dsa/main/Screenshot_dsa.png)

---

## 📖 What It Is

DSA Arcade is a web-based educational tool that transforms abstract data structures and algorithms into tangible 3D visualizations. Users can select different modules, generate data, and watch in real-time as the algorithms operate on the data structures. It's designed to provide a clear, step-by-step visual representation of how these concepts work under the hood.

## ✨ Features

- **Fully Interactive 3D World**: Built with Three.js for a smooth, engaging experience.
- **Modular Learning**: Each data structure and algorithm is its own isolated module.
- **Real-time Visualization**: Watch algorithms animate step-by-step.
- **Speed Control**: Adjust the simulation speed to watch in slow-motion or fast-forward.
- **Execution Log**: A clear, color-coded log that explains each operation as it happens.
- **Responsive Design**: A clean, modern UI built with Tailwind CSS that works on various screen sizes.

## 📚 What It Teaches

This project is an excellent resource for students, developers, and anyone looking to solidify their understanding of core computer science concepts.

#### **Data Structures:**
-   **Arrays**: Generating, inserting, and deleting elements.
-   **Stacks (LIFO)**: Push and Pop operations.
-   **Queues (FIFO)**: Enqueue and Dequeue operations.
-   **Singly & Doubly Linked Lists**: Creating nodes, linking them, and traversing the list.
-   **Binary Search Trees (BST)**: Insertion and traversal.
-   **Graphs**: Implementation of Breadth-First Search (BFS) and Depth-First Search (DFS).

#### **Algorithms:**
-   **Big O Notation**: A conceptual module explaining time and space complexity.
-   **Recursion**: A visual demonstration of the call stack.
-   **Sorting Algorithms**:
    -   Bubble Sort
    -   Selection Sort
    -   Insertion Sort
    -   Quick Sort

---

## 🛠️ Tech Stack & Architecture

DSA Arcade is built with a focus on modularity and separation of concerns, using vanilla JavaScript and powerful libraries.

-   **Frontend**: HTML5, JavaScript (ES6 Modules), Tailwind CSS
-   **3D Graphics**: [Three.js](https://threejs.org/)
-   **Controls**: `OrbitControls` for camera manipulation.

### **Architectural Overview**

The application is architected around a central `App` controller that manages different `Modules`. The 3D rendering is handled by a dedicated `GraphicsEngine`.

1.  **`main.js`**: The entry point. It initializes the `App`.
2.  **`app.js`**: The core controller. It loads the appropriate module based on user selection and handles UI events.
3.  **`graphicsEngine.js` (`GFX`)**: A singleton that manages the entire Three.js scene, including the camera, lighting, objects, and rendering loop. It provides a simple API for modules to add, remove, and animate objects.
4.  **`moduleBase.js`**: A base class that all specific modules inherit from. It provides common functionalities like `sleep` and a cancellation token for cleanup.
5.  **`/modules`**: This directory contains the logic for each data structure and algorithm. Each module is a class that:
    -   Sets up the UI controls and description for its topic.
    -   Contains the core logic for the data structure or algorithm.
    -   Uses the `GFX` API to create, animate, and manage 3D objects to visualize its operations.

---

## 📂 Code Structure

```
E:\gamification\dsav2
├── app.js               # Main application controller
├── config.js            # Global settings (colors, speeds)
├── graphicsEngine.js    # Manages all Three.js scene and rendering
├── index.html           # Main HTML file
├── logger.js            # Handles the on-screen execution log
├── main.js              # Application entry point
├── moduleBase.js        # Base class for all modules
├── resourceManager.js   # Manages materials and other resources
├── style.css            # Custom CSS styles
│
└── modules/
    ├── ArrayModule.js
    ├── BigOModule.js
    ├── BSTModule.js
    ├── GraphModule.js
    ├── LinkedListModule.js
    ├── QueueModule.js
    ├── RecursionModule.js
    ├── SortingModule.js
    ├── StackModule.js
    └── TutorialModule.js
```

---

## 🚀 How to Run Locally

You can run this project directly, but a local server is recommended to avoid any potential browser restrictions on loading ES6 modules from the file system.

#### **1. Clone the Repository**
```bash
git clone https://github.com/brat23/dsa.git
cd dsa
```

#### **2. Run with a Local Server**

**Option A: Using Python** (usually built-in)
```bash
# For Python 3.x
python -m http.server
```

**Option B: Using Node.js** (if you have Node installed)
First, install the `serve` package globally:
```bash
npm install -g serve
```
Then run it in the project directory:
```bash
serve
```

#### **3. Open in Browser**
Open your web browser and navigate to `http://localhost:8000` (for Python) or the address provided by `serve`.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new modules, improvements, or bug fixes, feel free to open an issue or submit a pull request.

1.  **Fork the repository.**
2.  **Create a new branch:** `git checkout -b feature/your-awesome-feature`
3.  **Make your changes.**
4.  **Commit your changes:** `git commit -m 'Add some awesome feature'`
5.  **Push to the branch:** `git push origin feature/your-awesome-feature`
6.  **Open a Pull Request.**

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
