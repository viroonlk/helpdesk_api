// js/create-ticket.js

document.addEventListener('DOMContentLoaded', () => {

    // (ฟังก์ชันจาก api.js) ถ้ายังไม่ล็อกอิน ให้เด้งกลับไป
    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    const ticketForm = document.getElementById('create-ticket-form');
    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-btn');
    const token = getToken(); // (ฟังก์ชันจาก api.js)

    ticketForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        messageDiv.textContent = ''; 

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;

        if (!title) {
            showMessage('Please enter a title.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Ticket';
            return;
        }

        const data = {
            title: title,
            description: description,
            priority: priority
        };

        try {
            // (API_BASE_URL มาจาก api.js)
            const response = await fetch(`https://helpdesk-api-z5q9.onrender.com/api/tickets/`, { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            });

            if (response.ok) { 
                showMessage('Ticket created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'mytickets.html'; // 👈 เด้งกลับไปหน้า List
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

        } catch (error) {
            console.error('Error creating ticket:', error);
            showMessage(`Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Ticket';
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.style.color = (type === 'error') ? 'red' : 'green';
    }
});