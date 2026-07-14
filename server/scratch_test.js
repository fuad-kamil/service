const email = 'admin@servicehub.com';
const password = 'Admin@123456';

async function testAdminFlow() {
  console.log('Sending login request for Admin...');
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status);
    console.log('Login Response Data:', JSON.stringify(loginData, null, 2));
    
    if (loginRes.status !== 200) {
      console.error('Login failed on server');
      process.exit(1);
    }
    
    const token = loginData.accessToken;
    console.log('Received access token. Sending GET /api/auth/me...');
    
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const meData = await meRes.json();
    console.log('GET /me Response Status:', meRes.status);
    console.log('GET /me Response Data:', JSON.stringify(meData, null, 2));
    
  } catch (error) {
    console.error('HTTP Request failed:', error);
  }
  process.exit(0);
}

testAdminFlow();
