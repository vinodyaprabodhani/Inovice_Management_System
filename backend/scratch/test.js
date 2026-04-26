const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@acme.com',
      password: 'password123'
    });
    const token = res.data.token;
    console.log('Got token:', token);
    
    const inviteRes = await axios.post('http://localhost:5000/api/users/invite', {
      name: 'Staff',
      email: 'staff@millenium.com',
      password: 'password123',
      role: 'staff'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Invite success:', inviteRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
