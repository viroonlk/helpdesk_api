// js/dashboard-user.js

document.addEventListener('DOMContentLoaded', () => {

    // (ฟังก์ชันจาก api.js) ถ้ายังไม่ล็อกอิน ให้เด้งกลับไป
    if (!isAuthenticated()) {
        logout(); // (logout() จะจัดการเด้งกลับไปหน้า login)
        return;
    }

    const ticketListContainer = document.getElementById('ticket-list');
    const token = getToken(); // (ฟังก์ชันจาก api.js)

    async function fetchTickets() {
        try {
            // (API_BASE_URL มาจาก api.js)
            const response = await fetch(`https://helpdesk-api-z5q9.onrender.com/api/tickets/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout(); // Token หมดอายุ
                }
                throw new Error('Failed to fetch tickets');
            }

            const tickets = await response.json();
            renderTickets(tickets); 

        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not connect to the server.</p>';
        }
    }

    function renderTickets(tickets) {
        ticketListContainer.innerHTML = ''; 
        if (tickets.length === 0) {
            ticketListContainer.innerHTML = '<p style="text-align: center;">You have not created any tickets yet.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            
            // ✅ (สำคัญ) เราจะหุ้มการ์ดด้วย <a> tag เพื่อให้คลิกไปดูรายละเอียดได้
            const cardLink = document.createElement('a');
            cardLink.href = `ticket-detail.html?id=${ticket.id}`; // 👈 ชี้ไปที่หน้ารายละเอียด
            cardLink.className = 'card-link'; // (สำหรับ CSS ถ้าต้องการ)

            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status.toLowerCase()}">
                            ${ticket.status}
                        </span>
                    </div>
                    <p>${ticket.description || 'No description provided.'}</p> 
                    <small>
                        Priority: ${ticket.priority} • Last updated: ${lastUpdated}
                    </small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }

    // (ปุ่ม Create)
    document.getElementById('create-ticket-btn').addEventListener('click', () => {
        window.location.href = 'create-ticket.html'; 
    });

    // (ปุ่ม Logout)
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout(); // (ฟังก์ชันจาก api.js)
    });

    // เริ่มทำงาน!
    fetchTickets();
});