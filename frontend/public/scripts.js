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
