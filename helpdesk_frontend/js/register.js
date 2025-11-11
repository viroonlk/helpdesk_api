document.addEventListener("DOMContentLoaded", () => {
    
    const registerForm = document.getElementById("register-form");
    const errorBox = document.getElementById("error-box");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // หยุดการ submit แบบปกติ

        // 1. ซ่อน Error box (ถ้าเคยโชว์)
        errorBox.style.display = "none";
        errorBox.textContent = "";

        // 2. รวบรวมข้อมูลจากฟอร์ม
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const firstName = document.getElementById("first_name").value;
        const lastName = document.getElementById("last_name").value;

        try {
            // 3. ยิง API ไปที่ Endpoint สมัครสมาชิก
            const response = await fetch("https://helpdesk-api-z5q9.onrender.com/api/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    first_name: firstName,
                    last_name: lastName
                    // (เราไม่ต้องส่ง 'role' เพราะ Backend จะ default เป็น 'user' ให้อัตโนมัติ)
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                // 4. ถ้าสมัครสำเร็จ (201 Created)
                alert("Registration successful! You will now be redirected to the login page.");
                // 5. พาไปหน้า Login
                window.location.href = "login.html";

            } else {
                // 6. ถ้า Error (เช่น 400 Bad Request)
                // (โค้ดนี้จะพยายามหา Error แรกที่ Django ส่งมาแสดง)
                let errorMessage = "Registration failed. Please try again.";
                
                // (Django มักส่ง Error มาในรูปแบบ object { field: ["message"] })
                if (data.username) {
                    errorMessage = `Username: ${data.username[0]}`;
                } else if (data.email) {
                    errorMessage = `Email: ${data.email[0]}`;
                } else if (data.password) {
                    errorMessage = `Password: ${data.password[0]}`;
                }

                errorBox.textContent = errorMessage;
                errorBox.style.display = "block";
            }

        } catch (error)
        {
            console.error("Fetch Error:", error);
            errorBox.textContent = "Could not connect to the server.";
            errorBox.style.display = "block";
        }
    });
});