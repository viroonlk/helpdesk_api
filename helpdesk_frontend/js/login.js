// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // (ฟังก์ชันจาก api.js) ถ้าล็อกอินอยู่แล้ว ให้เด้งไปหน้า My Tickets เลย
    if (isAuthenticated()) {
        window.location.href = 'mytickets.html';
    }

    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-btn');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        messageDiv.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // (API_BASE_URL มาจากไฟล์ api.js ที่เราโหลดก่อนหน้า)
            // ‼️ Endpoint นี้ต้องตรงกับ Django simple-jwt
            const response = await fetch(`${API_BASE_URL}/api/token/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username, // ‼️ ถ้า API รับ email ให้แก้ key นี้เป็น 'email'
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ สำเร็จ! บันทึก Token (ใช้ฟังก์ชันจาก api.js)
                saveToken(data.access); 
                
                // เด้งไปหน้า My Tickets
                window.location.href = 'mytickets.html';
            } else {
                // (เช่น รหัสผ่านผิด)
                throw new Error(data.detail || 'Failed to login');
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage(`Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.style.color = (type === 'error') ? 'red' : 'green';
    }
});