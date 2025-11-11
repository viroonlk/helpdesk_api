// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    // (โหลดฟังก์ชันจาก api.js)
    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    // (หมายเหตุ: เราต้องมั่นใจว่า Agent ล็อกอินด้วย Token 
    // ที่มีสิทธิ์ 'is_staff' หรือ 'is_agent' ด้วยนะครับ)
    const token = getToken();
    const ticketListContainer = document.getElementById('ticket-list');

    // 1. ฟังก์ชันสำหรับดึง "Ticket ทั้งหมด"
    async function fetchAllTickets() {
        try {
            // ‼️‼️ นี่คือ Endpoint ที่ "สำคัญที่สุด" ‼️‼️
            // ผม "เดา" ว่า API ของคุณใช้ Endpoint เดียวกัน (/api/tickets/)
            // และ Backend (Django) "ฉลาดพอ" ที่จะเช็กว่า
            // "ถ้าคนขอเป็น Agent (is_staff) ให้ส่ง Ticket ทั้งหมด
            //  ถ้าคนขอเป็น User ธรรมดา ให้ส่งแค่ Ticket ของเขา"
            //
            // ‼️ (ถ้า API คุณไม่ฉลาดแบบนั้น... คุณต้องแก้ Endpoint นี้
            //  ให้เป็น Endpoint ที่คุณสร้างไว้สำหรับ Agent เช่น /api/all-tickets/)
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout(); // ไม่มีสิทธิ์ หรือ Token หมดอายุ
                }
                throw new Error('Failed to fetch ticket queue');
            }

            const tickets = await response.json();
            renderAgentTickets(tickets); 

        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not connect to the server.</p>';
        }
    }

    // 2. ฟังก์ชันสำหรับ "วาด" หน้าคิวงาน
    function renderAgentTickets(tickets) {
        ticketListContainer.innerHTML = ''; 
        if (tickets.length === 0) {
            ticketListContainer.innerHTML = '<p style="text-align: center;">There are no tickets in the queue.</p>';
            return;
        }

        // (เราอาจจะอยากเรียงลำดับ ให้ OPEN/HIGH มาก่อน)
        tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            
            // ✅ (สำคัญ) เราจะหุ้มการ์ดด้วย <a> tag
            // แต่คราวนี้ เราจะชี้ไปที่ "หน้า Detail ของ Agent"
            // (ซึ่งเรายังไม่ได้สร้าง... นี่คือขั้นตอนต่อไปครับ!)
            const cardLink = document.createElement('a');
            // ‼️ (ขั้นตอนต่อไป เราจะสร้างไฟล์ 'agent-ticket-detail.html')
            cardLink.href = `agent-ticket-detail.html?id=${ticket.id}`; 
            cardLink.className = 'card-link';

            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status.toLowerCase()}">
                            ${ticket.status}
                        </span>
                    </div>
                    <p><strong>From User:</strong> ${ticket.user.username}</p> 
                    <small>
                        Priority: ${ticket.priority} • Last updated: ${lastUpdated}
                    </small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }

    // (ปุ่ม Logout)
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout(); // (ฟังก์ชันจาก api.js)
    });

    // 3. เริ่มทำงาน!
    fetchAllTickets();
});