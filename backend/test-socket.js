// test-simple.js
const http = require('http');

// Test if server is running
function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Server is running!');
        console.log('Response:', JSON.parse(data));
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Server is not running:', err.message);
      reject(err);
    });
    
    req.end();
  });
}

// Test authentication
function testAuth(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('🔐 Auth test response:', JSON.parse(data));
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Auth test failed:', err.message);
      reject(err);
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRlYmFjMTBmYWM0Yzg4MTk4MWY4ZDUiLCJpYXQiOjE3NTk0MzA4NjQsImV4cCI6MTc2MjAyMjg2NH0.E5xbhlBOBpmY8_5vEkCirvkNr2TN5Yjr99sNzgyvj3Q';

  console.log('🚀 Starting AdiChat Backend Tests...\n');
  
  try {
    await testServer();
    console.log('\n---\n');
    await testAuth(token);
    console.log('\n🎉 All basic tests passed!');
    console.log('\n💡 Next: Test WebSocket in Postman with:');
    console.log('   URL: ws://localhost:5000');
    console.log('   Header: Authorization: Bearer ' + token);
  } catch (error) {
    console.log('\n💥 Tests failed');
  }
}

runTests();