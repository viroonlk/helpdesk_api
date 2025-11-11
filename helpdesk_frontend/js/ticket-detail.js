// js/ticket-detail.js
// ‼️ (เวอร์ชันแก้ไข - ตรงกับ API /api/comments/) ‼️

document.addEventListener('DOMContentLoaded', () => {

    // (โหลดฟังก์ชันจาก api.js)
    if (!isAuthenticated()) {
        logout();
        return;
    }

    // 1. ดึง "id" ของ Ticket ออกมาจาก URL (เช่น ...?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');

    if (!ticketId) {
        window.location.href = 'mytickets.html'; // ถ้าไม่มี id ให้กลับไปหน้า List
        return;
    }

    const token = getToken();
    const detailsContainer = document.getElementById('ticket-details');
    // (ส่วนของ Comment)
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const commentMessage = document.getElementById('comment-message');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');

    // 2. ฟังก์ชันสำหรับดึงข้อมูล "Ticket" (อันนี้เหมือนเดิม)
    async function fetchTicketDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) logout();
                throw new Error('Failed to fetch ticket details');
            }

            const ticket = await response.json();
            renderTicketDetails(ticket);
        
        } catch (error) {
            console.error('Error:', error);
            detailsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // 3. ‼️ (ใหม่!) ฟังก์ชันสำหรับดึง "Comments" (แยกต่างหาก)
    async function fetchComments() {
        try {
            // ‼️ (สำคัญ) เช็ก API ของคุณว่า filter ชื่อ 'ticket' หรือ 'ticket_id'
            // เราจะ GET ไปที่ /api/comments/ แต่ "กรอง" เอาเฉพาะของ ticket นี้
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');

            const comments = await response.json();
            renderComments(comments);

        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }


    // 4. ฟังก์ชันสำหรับ "วาด" รายละเอียด Ticket (เหมือนเดิม)
    function renderTicketDetails(ticket) {
        const lastUpdated = new Date(ticket.updated_at).toLocaleString();
        detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1>${ticket.title}</h1>
                <span class="status-tag status-${ticket.status.toLowerCase()}">
                    ${ticket.status}
                </span>
            </div>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Last Updated:</strong> ${lastUpdated}</p>
            <hr>
            <p>${ticket.description}</p>
        `;
        // (ถ้า Ticket ปิดไปแล้ว ก็ไม่ต้องให้ Comment ได้)
        if (ticket.status === 'CLOSED') {
            commentForm.style.display = 'none';
        }
    }

    // 5. ฟังก์ชันสำหรับ "วาด" Comment (เหมือนเดิม)
    function renderComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<p>No comments yet.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDate = new Date(comment.created_at).toLocaleString();
            commentsList.innerHTML += `
                <div class="comment-card">
                    <strong>${comment.user.username}</strong> 
                    <small>on ${commentDate}</small>
                    <p>${comment.text}</p>
                </div>
            `;
        });
    }

    // 6. ‼️ (แก้ไข!) "ดัก" การ submit Comment ใหม่
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        commentSubmitBtn.textContent = 'Posting...';
        commentMessage.textContent = '';
        
        const text = commentText.value;
        if (!text) return; // ไม่ส่ง comment ว่างๆ

        // ‼️ (สำคัญ) สร้าง Body ที่จะส่งไป POST
        // เราต้องแนบ 'ticketId' ไปด้วย
        const data = {
            text: text,
            ticket: ticketId // ‼️ (สำคัญ) เช็ก API ของคุณว่า Key นี้ชื่อ 'ticket' หรือ 'ticket_id'
        };

        try {
            // ‼️ (แก้ไข!) เราจะ POST ไปที่ /api/comments/ (ไม่ใช่ /api/tickets/...)
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data) // 👈 ส่งข้อมูล (text + ticketId)
            });

            if (response.ok) { // (ปกติ 201 Created)
                commentText.value = ''; // ล้างช่องพิมพ์
                fetchComments(); // 👈 (แก้ไข!) โหลด Comment ใหม่อย่างเดียว (มีประสิทธิภาพกว่า)
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

        } catch (error) {
            console.error('Error posting comment:', error);
            commentMessage.textContent = `Error: ${error.message}`;
            commentMessage.style.color = 'red';
        } finally {
            commentSubmitBtn.disabled = false;
            commentSubmitBtn.textContent = 'Submit Reply';
        }
    });

    // 7. ‼️ (แก้ไข!) เริ่มทำงาน!
    // เราต้องเรียก 2 ฟังก์ชัน (ดึง Ticket และ ดึง Comments)
    fetchTicketDetails();
    fetchComments();
});