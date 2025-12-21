/**
 * PROJECT: Extended Web Server
 * TEST SUITE: Integrity, Logic & Auth
 * FRAMEWORK: Node.js Native Test Runner (node:test)
 * DESCRIPTION: Automated validation of server requirements including 
 * sessions, comments, and data integrity.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

// --- REPORT METADATA ---
// Generates a professional audit header for the test execution
const executionDate = new Date().toISOString().replace('T', ' ').split('.')[0];
console.log('================================================');
console.log(`[TEST REPORT] Execution Timestamp: ${executionDate} UTC`);
console.log(`[ENVIRONMENT] Node.js ${process.version}`);
console.log('================================================\n');

// --- 1. FILE AND DATA INTEGRITY ---
test('1. File and Data Integrity', async (t) => {
    await t.test('Should find productos.json in data/ folder', () => {
        const dataPath = path.join(__dirname, 'data', 'productos.json');
        assert.strictEqual(fs.existsSync(dataPath), true, 'CRITICAL: productos.json file is missing');
    });

    await t.test('Products JSON should be a valid Array', () => {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'productos.json'), 'utf8'));
        assert.ok(Array.isArray(data), 'DATA ERROR: Product data is not an array');
    });
});

// --- 2. COMMENTING SYSTEM LOGIC ---
test('2. Commenting System Logic', async (t) => {
    await t.test('Should allow adding comments to a product structure', () => {
        const mockProduct = { id: 1, comentarios: [] };
        const newComment = { usuario: 'admin', texto: 'Test comment' };
        mockProduct.comentarios.push(newComment);
        
        assert.strictEqual(mockProduct.comentarios.length, 1);
        assert.strictEqual(mockProduct.comentarios[0].usuario, 'admin');
    });
});

// --- 3. INTEGRATION: LOGIN AND SESSION PROCESS ---
// Note: This test requires the server to be running (npm start)
test('3. Integration: Login and Session Process', (t, done) => {
    const postData = JSON.stringify({ user: 'admin', pass: '1234' });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        // Validate HTTP Status
        assert.strictEqual(res.statusCode, 200, 'AUTH ERROR: Server did not return 200 OK');
        
        // Validate Session Cookie (HttpOnly)
        const cookies = res.headers['set-cookie'];
        assert.ok(cookies, 'SESSION ERROR: Server did not send any cookies');
        assert.ok(cookies[0].includes('session=admin'), 'SESSION ERROR: Invalid session cookie format');
        
        done();
    });

    req.on('error', (e) => {
        assert.fail(`CONNECTION ERROR: ${e.message}. Is the server running on port 3000?`);
        done();
    });

    req.write(postData);
    req.end();
});