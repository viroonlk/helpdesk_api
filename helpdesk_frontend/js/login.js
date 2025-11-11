// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. หาฟอร์ม Login จาก id
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
        // 2. หยุดการ submit แบบปกติ (ที่หน้าจะ refresh)
        event.preventDefault();

        // 3. ดึงค่า username และ password จากช่อง input
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            // 4. "ยิง" API ไปที่ Django (นี่คือส่วนที่สำคัญที่สุด)
            const response = await fetch("https://helpdesk-api-z5q9.onrender.com/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.ok) {
                // 5. ถ้า Login สำเร็จ (ได้ 200 OK)
                const data = await response.json();
                
                // 6. "จำ" Token ไว้ในเบราว์เซอร์ (localStorage)
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);

                alert("Login Successful!");
                
                // 7. พาไปหน้า Dashboard
                // (ในโลกจริง เราจะเช็ค Role ก่อน แต่ตอนนี้ไปหน้า User ก่อน)
                window.location.href = "dashboard-user.html";

            } else if (response.status === 401) {
                // ถ้า 401 (Unauthorized)
                alert("Login Failed: Incorrect username or password.");
            } else {
                alert("An error occurred. Please try again.");
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the server.");
        }
    });
});