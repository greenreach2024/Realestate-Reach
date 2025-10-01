// Simple test version
console.log('Simple app starting...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('app-root not found');
        return;
    }
    
    console.log('app-root found, populating...');
    
    appRoot.innerHTML = `
        <div style="padding: 2rem;">
            <h1>✅ Basic App Working</h1>
            <p>The UI is now populating successfully!</p>
            <button onclick="alert('Button clicked!')">Test Button</button>
        </div>
    `;
    
    console.log('UI populated successfully');
});