document.addEventListener("DOMContentLoaded", () => {
    
    // 1. "ดึง" Token ที่เคย "จำ" ไว้ตอน Login
    const accessToken = localStorage.getItem("accessToken");

    // 2. [Auth Guard] เช็คว่ามี Token ไหม (Login หรือยัง)
    if (!accessToken) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = "login.html";
        return; // หยุดการทำงาน
    }

    // 3. หาที่ที่จะแสดงผล Ticket
    const ticketListContainer = document.getElementById("ticket-list");

    // 4. สร้างฟังก์ชันสำหรับดึง Ticket
    async function fetchTickets() {
        try {
            const response = await fetch("https://helpdesk-api-z5q9.onrender.com/api/tickets/", {
                method: "GET",
                headers: {
                    // 5. "แนบ" Token ไปใน Header เพื่อยืนยันตัวตน
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json(); // (API ของเรามี Pagination)
                
                // 6. เคลียร์ของเก่า (ถ้ามี)
                ticketListContainer.innerHTML = ""; 

                // 7. วน Loop สร้าง Card Ticket
                data.results.forEach(ticket => {
                    const ticketCard = createTicketCard(ticket);
                    ticketListContainer.appendChild(ticketCard);
                });

            } else if (response.status === 401) {
                // 8. ถ้า Token "หมดอายุ"
                alert("Your session has expired. Please log in again.");
                localStorage.removeItem("accessToken"); // ลบ Token ที่ใช้ไม่ได้
                window.location.href = "login.html";
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            ticketListContainer.innerHTML = "<p>Error loading tickets.</p>";
        }
    }

    // 9. ฟังก์ชันช่วยสร้าง HTML Card (เพื่อความสะอาด)
    function createTicketCard(ticket) {
        const card = document.createElement("div");
        card.className = "card";

        // ฟังก์ชันช่วยแปลง Status เป็น Class สี
        const statusClass = getStatusClass(ticket.status);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${ticket.title}</h3>
                <span class="status-tag ${statusClass}">${ticket.status}</span>
            </div>
            <p>${ticket.description.substring(0, 100)}...</p>
            <small>Priority: ${ticket.priority} • Last updated: ${new Date(ticket.updated_at).toLocaleDateString()}</small>
        `;
        
        // (ขั้นสูง) เมื่อคลิก Card นี้ ให้ไปหน้า Detail
        card.onclick = () => {
             // (เราจะสร้างหน้านี้ทีหลัง)
             // window.location.href = `ticket-detail.html?id=${ticket.id}`;
        };

        return card;
    }

    function getStatusClass(status) {
        if (status === "OPEN") return "status-open";
        if (status === "IN_PROGRESS") return "status-progress";
        if (status === "CLOSED") return "status-closed";
        return "";
    }

    // 10. สั่งให้ฟังก์ชันทำงาน (ดึง Ticket) ทันทีที่หน้าโหลด
    fetchTickets();
});