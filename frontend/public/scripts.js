const layers = document.querySelectorAll(".layer");
const hero = document.querySelector(".hero");
const uploadZone = document.getElementById("upload-zone");
const appointmentInput = document.getElementById("appointment-name");
const uploadPreview = document.getElementById("upload-preview");

const updateParallax = (event) => {
    if (!hero) {
        return;
    }

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        const offsetX = x * depth * 38;
        const offsetY = y * depth * 38;
        layer.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    });
};

const resetParallax = () => {
    layers.forEach((layer) => {
        layer.style.transform = "";
    });
};
const renderAppointmentPreview = (name) => {
    if (!uploadPreview || !name) {
        return;
    }

    uploadPreview.innerHTML = `
<p class="upload-preview__label">Booking Slot</p>
    <strong>${name}</strong>
    <span>Ready to continue to the appointment scheduler.</span>  `;
};

if (window.matchMedia("(pointer: fine)").matches && hero) {
    hero.addEventListener("pointermove", updateParallax);
    hero.addEventListener("pointerleave", resetParallax);
}
if (appointmentInput) {
    appointmentInput.addEventListener("input", () => {
        renderAppointmentPreview(appointmentInput.value.trim());
    });
}

if (uploadZone) {
    uploadZone.addEventListener("click", () => {
        window.location.href = "./appointment.html";
    });
}

// Login & Signup Logic
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");

// Determine correct backend URL
const getBackendUrl = (path) => {
    const host = window.location.hostname;
    // Using port 5001 to avoid AirPlay/System conflicts on port 5000
    const baseUrl = (host === "localhost" || host === "127.0.0.1") 
        ? "http://localhost:5001" 
        : `http://${host}:5001`;
    return `${baseUrl}/api/patients${path}`;
};

// Check backend health on load
(async () => {
    try {
        const host = window.location.hostname;
        const baseUrl = (host === "localhost" || host === "127.0.0.1") ? "http://localhost:5001" : `http://${host}:5001`;
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) console.log("✅ Backend connection established on port 5001.");
    } catch (e) {
        console.warn("⚠️ Initial backend connection failed. Is the server running on port 5001?");
    }
})();

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        loginMessage.style.display = "block";
        loginMessage.style.color = "var(--blue-2)";
        loginMessage.textContent = "Checking credentials...";

        try {
            const response = await fetch(getBackendUrl("/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                loginMessage.style.color = "var(--green-2)";
                loginMessage.innerHTML = "✓ Level Up! Login Successful!";
                alert("✓ Success! Redirecting to home page...");
                setTimeout(() => window.location.href = "index.html", 1000);
            } else {
                loginMessage.style.color = "var(--red-2)";
                loginMessage.textContent = "✗ Error: " + (data.message || "Invalid credentials");
            }
        } catch (err) {
            loginMessage.style.color = "var(--red-2)";
            loginMessage.textContent = "✗ Connection Error. Backend connection failed.";
            console.error(err);
        }
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;

        signupMessage.style.display = "block";
        signupMessage.style.color = "var(--blue-2)";
        signupMessage.textContent = "Creating your account...";

        try {
            const response = await fetch(getBackendUrl("/create"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: `${firstName} ${lastName}`,
                    email, 
                    phone,
                    password 
                })
            });

            const data = await response.json();

            if (response.ok) {
                signupMessage.style.color = "var(--green-2)";
                signupMessage.innerHTML = "✓ Welcome! Account Created Successfully!";
                alert("✓ Success! Your account is ready. Redirecting to login...");
                setTimeout(() => window.location.href = "sign-in.html", 1000);
            } else {
                signupMessage.style.color = "var(--red-2)";
                signupMessage.textContent = "✗ Error: " + (data.error || "Failed to create account");
            }
        } catch (err) {
            signupMessage.style.color = "var(--red-2)";
            signupMessage.textContent = "✗ Connection Error. Backend connection failed.";
            console.error(err);
        }
    });
}
