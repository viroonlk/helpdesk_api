// js/ticket-detail.js

document.addEventListener('DOMContentLoaded', () => {

    if (!isAuthenticated()) {
        logout();
        return;
    }

    // 1. ดึง "id" ของ Ticket ออกมาจาก URL (เช่น ...?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');

    if (!ticketId) {
        window.location.href = 'mytickets.html'; 
        return;
    }

    const token = getToken();
    const detailsContainer = document.getElementById('ticket-details'); // ‼️ HTML ต้องมี <div id="ticket-details">
    // (ส่วนของ Comment)
    const commentsList = document.getElementById('comments-list'); // ‼️ HTML ต้องมี <div id="comments-list">
    const commentForm = document.getElementById('comment-form'); // ‼️ HTML ต้องมี <form id="comment-form">
    const commentText = document.getElementById('comment-text'); // ‼️ HTML ต้องมี <textarea id="comment-text">
    const commentSubmitBtn = document.getElementById('comment-submit-btn');
    const commentMessage = document.getElementById('comment-message'); // ‼️ HTML ต้องมี <div id="comment-message">

    // 2. ฟังก์ชันสำหรับดึงข้อมูล "Ticket"
    async function fetchTicketDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ticket details');
            const ticket = await response.json();
            renderTicketDetails(ticket);
        } catch (error) {
            console.error('Error:', error);
            detailsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // 3. ฟังก์ชันสำหรับดึง "Comments"
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');
            
            const responseData = await response.json();
            renderComments(responseData.results); 
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // --- (เพิ่ม) ฟังก์ชัน renderTicketDetails ---
    function renderTicketDetails(ticket) {
        if (!detailsContainer) return;
        
        const created = new Date(ticket.created_at).toLocaleString();
        const updated = new Date(ticket.updated_at).toLocaleString();

        detailsContainer.innerHTML = `
            <h3>${ticket.title}</h3>
            <span class="status-tag status-${ticket.status ? ticket.status.toLowerCase() : 'unknown'}">
                ${ticket.status || 'N/A'}
            </span>
            <p><strong>Priority:</strong> ${ticket.priority || 'N/A'}</p>
            <p><strong>Description:</strong></p>
            <p>${ticket.description || 'No description provided.'}</p>
            <hr>
            <small>Created by: ${ticket.created_by_username || 'Unknown'} at ${created}</small><br>
            <small>Last updated: ${updated}</small>
        `;
    }

    // --- (เพิ่ม) ฟังก์ชัน renderComments ---
    function renderComments(comments) {
        if (!commentsList) return;

        commentsList.innerHTML = ''; // ล้างของเก่า
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<p>No comments yet.</p>';
            return;
        }

        comments.forEach(comment => {
            const created = new Date(comment.created_at).toLocaleString();
            
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-card';
            
            // --- ⭐️ จุดที่แก้ไขอยู่ตรงนี้ ⭐️ ---
            // เปลี่ยน comment.text เป็น comment.body
            commentEl.innerHTML = `
                <p>${comment.body}</p> 
                <small>By: <strong>${comment.author_username || 'Unknown'}</strong> at ${created}</small>
            `;
            // --- ⭐️ สิ้นสุดจุดที่แก้ไข ⭐️ ---

            commentsList.appendChild(commentEl);
        });
    }

    // 4. "ดัก" การ submit Comment ใหม่
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        
        const text = commentText.value;
        if (!text) {
            commentSubmitBtn.disabled = false;
            return;
        }

        const data = {
            body: text,      // 👈 ‼️ (อันนี้ถูกต้องแล้ว)
            ticket: ticketId 
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                commentText.value = ''; // ล้างช่องพิมพ์
                fetchComments(); // โหลด Comment ใหม่อย่างเดียว
                if (commentMessage) commentMessage.innerHTML = ''; // ล้าง error
            } else {
                const err = await response.json();
                const errorText = Object.values(err).join(' '); 
                throw new Error(errorText);
            }
        } catch (error) {
            if (commentMessage) {
                commentMessage.innerHTML = `<span style="color: red;">${error.message}</span>`;
            }
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    // 5. เริ่มทำงาน!
    fetchTicketDetails();
    fetchComments();
});