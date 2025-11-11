const API_BASE_URL = "https://helpdesk-api-z5q9.onrender.com/"; // 👈 ‼️‼️ แก้ไขตรงนี้

/**
 * บันทึก Token ลงใน localStorage
 * @param {string} token - The JWT access token
 */
function saveToken(token) {
    localStorage.setItem('token', token);
}

/**
 * ดึง Token จาก localStorage
 * @returns {string|null} 
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง (มี Token ไหม)
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getToken(); 
}


function logout() {
    localStorage.removeItem('token');
    
    window.location.href = '/login.html'; 
}

