// logger.js
const Log = {
    el: null, // This will be set after the DOM is loaded
    init() {
        this.el = document.getElementById('code-log');
    },
    add(msg, type='info') {
        if (!this.el) {
            console.warn("Log element not initialized. Message:", msg);
            return;
        }
        const div = document.createElement('div');
        div.className = 'log-entry';
        let color = 'text-slate-300';
        if(type === 'success') color = 'text-emerald-400';
        if(type === 'error') color = 'text-rose-400';
        if(type === 'highlight') color = 'text-yellow-400';
        
        div.innerHTML = `<span class="opacity-50 font-mono mr-2">${new Date().toLocaleTimeString().split(' ')[0]}</span><span class="${color}">${msg}</span>`;
        this.el.appendChild(div);
        this.el.scrollTop = this.el.scrollHeight;
    },
    clear() { 
        if (this.el) {
            this.el.innerHTML = ''; 
        }
    }
};

window.Log = Log; // Expose Log globally for inline onclick handlers
export default Log;