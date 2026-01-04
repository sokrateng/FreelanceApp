const http = require('http');

// Test login
const loginData = JSON.stringify({
  email: 'engin.coban@penta.com.tr',
  password: 'Test1234!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Login response:', data);
    
    try {
      const loginResult = JSON.parse(data);
      if (loginResult.success && loginResult.data.token) {
        const token = loginResult.data.token;
        
        // Now test time entries stats
        const statsOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/time-entries/stats',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        };
        
        const statsReq = http.request(statsOptions, (statsRes) => {
          let statsData = '';
          statsRes.on('data', (chunk) => { statsData += chunk; });
          statsRes.on('end', () => {
            console.log('Stats response status:', statsRes.statusCode);
            console.log('Stats response:', statsData);
          });
        });
        
        statsReq.on('error', (e) => {
          console.error('Stats request error:', e.message);
        });
        
        statsReq.end();
      }
    } catch (err) {
      console.error('Error parsing login response:', err.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Login request error:', e.message);
});

req.write(loginData);
req.end();
