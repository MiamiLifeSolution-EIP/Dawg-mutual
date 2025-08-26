#!/usr/bin/env node

// Simple test to check if app.js can be loaded and executed in Node.js environment
// This will help identify syntax errors or missing browser APIs

try {
    // Mock browser APIs that the code might use
    global.document = {
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        getElementById: () => null,
        readyState: 'complete'
    };
    global.window = {};
    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
    global.location = { hash: '' };
    global.navigator = { serviceWorker: null };
    
    console.log('Loading app.js...');
    require('./app.js');
    console.log('app.js loaded successfully');
} catch (error) {
    console.error('Error loading app.js:', error.message);
    console.error('Stack:', error.stack);
}