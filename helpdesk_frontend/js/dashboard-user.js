// js/dashboard-user.js

document.addEventListener('DOMContentLoaded', () => {

    // (ฟังก์ชันจาก api.js) ถ้ายังไม่ล็อกอิน ให้เด้งกลับไป
    if (!isAuthenticated()) {
        logout(); // (logout() จะจัดการเด้งกลับไปหน้า login)
        return;
    }

    const ticketListContainer = document.getElementById('ticket-list'); // ‼️ HTML ต้องมี <div id="ticket-list">
    const token = getToken(); // (ฟังก์ชันจาก api.js)

    async function fetchTickets() {
        try {
            // (API_BASE_URL มาจาก api.js)
            // ‼️ Endpoint นี้ต้องตรงกับ API ที่ "ดึง Ticket ของตัวเอง"
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) logout(); // Token หมดอายุ
                throw new Error('Failed to fetch tickets');
            }
            
            // --- ⭐️ จุดที่แก้ไขอยู่ตรงนี้ ⭐️ ---
            const responseData = await response.json(); // 1. เปลี่ยนชื่อตัวแปร
            renderTickets(responseData.results);      // 2. ส่ง .results เข้าไปแทน
            // --- ⭐️ สิ้นสุดจุดที่แก้ไข ⭐️ ---

        } catch (error) {
            console.error('Error fetching tickets:', error);
            // ตรวจสอบว่ามี ticketListContainer จริงหรือไม่ ก่อนจะ .innerHTML
            if (ticketListContainer) {
                ticketListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not connect to the server.</p>';
            }
        }
    }

    function renderTickets(tickets) {
        // ตรวจสอบเผื่อ container ไม่มี (อาจจะย้ายไปหน้าอื่น)
        if (!ticketListContainer) return; 

        ticketListContainer.innerHTML = ''; 
        if (!tickets || tickets.length === 0) { // เพิ่มการตรวจสอบว่า tickets ไม่ใช่ null/undefined
            ticketListContainer.innerHTML = '<p style="text-align: center;">You have not created any tickets yet.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            
            // ✅ หุ้มการ์ดด้วย <a> tag
            const cardLink = document.createElement('a');
            cardLink.href = `ticket-detail.html?id=${ticket.id}`; // 👈 ชี้ไปที่หน้ารายละเอียด
            cardLink.className = 'card-link'; 

            // ‼️ ตรวจสอบชื่อ Field (ticket.title, ticket.status) ให้ตรงกับ API
            // ใช้ (ticket.description || '...') เพื่อป้องกัน error ถ้า description เป็น null
            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status ? ticket.status.toLowerCase() : 'unknown'}">
                            ${ticket.status || 'N/A'}
                        </span>
                    </div>
                    <p>${ticket.description || 'No description provided.'}</p> 
                    <small>
                        Priority: ${ticket.priority || 'N/A'} • Last updated: ${lastUpdated}
                    </small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }

    // (ปุ่ม Create)
    const createBtn = document.getElementById('create-ticket-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => { // ‼️ HTML ต้องมี <button id="create-ticket-btn">
            window.location.href = 'create-ticket.html'; 
        });
    }

    // (ปุ่ม Logout)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { // ‼️ HTML ต้องมี <button id="logout-btn">
            logout(); // (ฟังก์ชันจาก api.js)
        });
    }

    // เริ่มทำงาน!
    fetchTickets();
});