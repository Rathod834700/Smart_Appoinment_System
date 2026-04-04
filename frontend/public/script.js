const layers = document.querySelectorAll(".layer");
const hero = document.querySelector(".hero");
const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("report-file");
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

const renderFilePreview = (file) => {
    const analyzeBtn = document.getElementById("analyze-report-btn");
    if (!uploadPreview || !file) {
        if (analyzeBtn) analyzeBtn.style.display = "none";
        return;
    }

    uploadPreview.innerHTML = `
    <p class="upload-preview__label">Inventory Slot</p>
    <strong>${file.name}</strong>
    <span>${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB uploaded for AI review.</span>
  `;
    if (analyzeBtn) analyzeBtn.style.display = "block";
};

if (window.matchMedia("(pointer: fine)").matches && hero) {
    hero.addEventListener("pointermove", updateParallax);
    hero.addEventListener("pointerleave", resetParallax);
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        const [file] = fileInput.files || [];
        renderFilePreview(file);
    });
}

if (uploadZone && fileInput) {
    ["dragenter", "dragover"].forEach((eventName) => {
        uploadZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadZone.classList.add("is-dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        uploadZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadZone.classList.remove("is-dragover");
        });
    });

    uploadZone.addEventListener("drop", (event) => {
        const [file] = event.dataTransfer?.files || [];
        if (!file) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        renderFilePreview(file);
    });
}

// AI Integration
document.addEventListener("DOMContentLoaded", () => {
    // 1. Upload Panel Analyze
    const analyzeBtn = document.getElementById("analyze-report-btn");
    const resultList = document.querySelector(".result-list");
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", async () => {
            const file = fileInput?.files?.[0];
            if (!file) {
                alert("Please select a file first.");
                return;
            }

            analyzeBtn.textContent = "Analyzing...";
            analyzeBtn.disabled = true;

            const formData = new FormData();
            formData.append("report", file);

            try {
                const response = await fetch("http://localhost:5000/api/ai/analyze-report", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                if (response.ok && data.diagnosis) {
                    resultList.innerHTML = data.diagnosis.map(d => `
                        <article>
                            <strong>${d.title}</strong>
                            <p>${d.description}</p>
                        </article>
                    `).join("");
                } else {
                    alert(data.error || "Failed to analyze report");
                }
            } catch (err) {
                console.error(err);
                alert("Error connecting to server.");
            } finally {
                analyzeBtn.textContent = "Analyze Report";
                analyzeBtn.disabled = false;
            }
        });
    }

    // 2. AI Diagnosis Modal
    const aiDiagCard = document.getElementById("ai-diagnosis-card");
    const aiDiagModal = document.getElementById("ai-diagnosis-modal");
    const closeAiDiagBtn = document.getElementById("close-diagnosis-modal-btn");
    const checkDiagBtn = document.getElementById("check-diagnosis-btn");
    const aiDiagInput = document.getElementById("ai-diagnosis-input");
    const aiDiagResult = document.getElementById("ai-diagnosis-result");

    if (aiDiagCard && aiDiagModal) {
        aiDiagCard.addEventListener("click", () => {
            aiDiagModal.style.display = "flex";
            aiDiagResult.innerHTML = "";
            aiDiagInput.value = "";
        });
        closeAiDiagBtn.addEventListener("click", () => aiDiagModal.style.display = "none");
        
        checkDiagBtn.addEventListener("click", async () => {
            const indicators = aiDiagInput.value.trim();
            if (!indicators) {
                aiDiagResult.innerHTML = "<span style='color: red;'>Please enter your clinical indicators.</span>";
                return;
            }
            checkDiagBtn.textContent = "Analyzing...";
            checkDiagBtn.disabled = true;
            aiDiagResult.innerHTML = "Processing...";

            try {
                const response = await fetch("http://localhost:5000/api/ai/ai-diagnosis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ indicators })
                });
                const data = await response.json();
                if (response.ok) {
                    aiDiagResult.innerHTML = `
                        <strong>Summary:</strong> ${data.diagnosis_summary}<br/><br/>
                        <strong>Recommendation:</strong> ${data.recommendation}<br/><br/>
                        <strong>Risk Level:</strong> <span style="color: ${data.risk_level === 'High Risk' ? 'red' : 'lightgreen'};">${data.risk_level}</span>
                    `;
                } else {
                    aiDiagResult.innerHTML = `<span style='color: red;'>${data.error || "Failed to diagnose"}</span>`;
                }
            } catch (err) {
                console.error(err);
                aiDiagResult.innerHTML = `<span style='color: red;'>Error connecting to server.</span>`;
            } finally {
                checkDiagBtn.textContent = "Get Diagnosis";
                checkDiagBtn.disabled = false;
            }
        });
    }

    // 3. Report Analysis UI Modal
    const reportCard = document.getElementById("report-analysis-card");
    const reportModal = document.getElementById("report-analysis-modal");
    const closeReportBtn = document.getElementById("close-report-modal-btn");
    const modalAnalyzeBtn = document.getElementById("modal-analyze-report-btn");
    const modalReportFile = document.getElementById("modal-report-file");
    const modalReportResult = document.getElementById("modal-report-result");

    if (reportCard && reportModal) {
        reportCard.addEventListener("click", () => {
            reportModal.style.display = "flex";
            modalReportResult.innerHTML = "";
            modalReportFile.value = "";
        });
        closeReportBtn.addEventListener("click", () => reportModal.style.display = "none");
        
        modalAnalyzeBtn.addEventListener("click", async () => {
            const file = modalReportFile?.files?.[0];
            if (!file) {
                modalReportResult.innerHTML = "<span style='color: red;'>Please upload a report file.</span>";
                return;
            }
            modalAnalyzeBtn.textContent = "Analyzing...";
            modalAnalyzeBtn.disabled = true;
            modalReportResult.innerHTML = "Scanning document...";
            
            const formData = new FormData();
            formData.append("report", file);

            try {
                const response = await fetch("http://localhost:5000/api/ai/analyze-report", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();
                if (response.ok && data.diagnosis) {
                    modalReportResult.innerHTML = data.diagnosis.map(d => `
                        <div style="margin-bottom: 0.8rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 4px;">
                            <strong>${d.title}</strong>
                            <p style="margin-top: 0.3rem;">${d.description}</p>
                        </div>
                    `).join("");
                } else {
                    modalReportResult.innerHTML = `<span style='color: red;'>${data.error || "Failed to analyze report"}</span>`;
                }
            } catch (err) {
                console.error(err);
                modalReportResult.innerHTML = `<span style='color: red;'>Error connecting to server.</span>`;
            } finally {
                modalAnalyzeBtn.textContent = "Analyze Report";
                modalAnalyzeBtn.disabled = false;
            }
        });
    }

    // 4. Symptom Checker Modal
    const symptomCard = document.getElementById("symptom-checker-card");
    const symptomModal = document.getElementById("symptom-modal");
    const closeSymptomBtn = document.getElementById("close-modal-btn");
    const checkSymptomBtn = document.getElementById("check-symptom-btn");
    const symptomInput = document.getElementById("symptom-input");
    const symptomResult = document.getElementById("symptom-result");

    if (symptomCard && symptomModal) {
        symptomCard.addEventListener("click", () => {
            symptomModal.style.display = "flex";
            symptomResult.innerHTML = "";
            symptomInput.value = "";
        });

        closeSymptomBtn.addEventListener("click", () => {
            symptomModal.style.display = "none";
        });

        checkSymptomBtn.addEventListener("click", async () => {
            const symptoms = symptomInput.value.trim();
            if (!symptoms) {
                symptomResult.innerHTML = "<span style='color: red;'>Please enter your symptoms.</span>";
                return;
            }

            checkSymptomBtn.textContent = "Checking...";
            checkSymptomBtn.disabled = true;
            symptomResult.innerHTML = "Thinking...";

            try {
                const response = await fetch("http://localhost:5000/api/ai/symptom-checker", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ symptoms })
                });
                const data = await response.json();

                if (response.ok) {
                    symptomResult.innerHTML = `
                        <strong>Prediction:</strong> ${data.prediction}<br/><br/>
                        <strong>Possible Conditions:</strong> <br/>
                        <ul style="margin: 0; padding-left: 1.2rem;">
                            ${data.possible_conditions.map(c => `<li>${c}</li>`).join("")}
                        </ul><br/>
                        <strong>Urgency:</strong> <span style="color: ${data.urgency === 'High (Emergency)' ? 'red' : 'inherit'};">${data.urgency}</span>
                    `;
                } else {
                    symptomResult.innerHTML = `<span style='color: red;'>${data.error || "Failed to check"}</span>`;
                }
            } catch (err) {
                console.error(err);
                symptomResult.innerHTML = `<span style='color: red;'>Error connecting to server.</span>`;
            } finally {
                checkSymptomBtn.textContent = "Check Symptoms";
                checkSymptomBtn.disabled = false;
            }
        });
    }

    // 5. Doctor Availability Modal
    const doctorNavBtn = document.getElementById("doctor-nav-btn");
    const doctorModal = document.getElementById("doctor-modal");
    const closeDoctorModalBtn = document.getElementById("close-doctor-modal-btn");
    const doctorList = document.getElementById("doctor-list");
    const doctorCountBadge = document.getElementById("doctor-count-badge");

    const fetchAndShowDoctors = async () => {
        doctorList.innerHTML = "Loading doctors...";
        doctorCountBadge.textContent = "";
        doctorModal.style.display = "flex";

        try {
            const response = await fetch("http://localhost:5000/api/doctors");
            const doctors = await response.json();

            const available = doctors.filter(d => d.isAvailable);
            const unavailable = doctors.filter(d => !d.isAvailable);

            doctorCountBadge.textContent = `${available.length} Available`;

            if (doctors.length === 0) {
                doctorList.innerHTML = "<p style='color: var(--text-secondary);'>No doctors found. Please seed the database.</p>";
                return;
            }

            doctorList.innerHTML = [...available, ...unavailable].map(d => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: rgba(0,0,0,0.3); border-radius: 6px; border-left: 3px solid ${d.isAvailable ? '#4CAF50' : '#f44336'};">
                    <div>
                        <strong style="color: var(--text-primary); display: block;">${d.name}</strong>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">${d.specialization}</span>
                    </div>
                    <span style="background: ${d.isAvailable ? '#4CAF5022' : '#f4433622'}; color: ${d.isAvailable ? '#4CAF50' : '#f44336'}; border: 1px solid ${d.isAvailable ? '#4CAF50' : '#f44336'}; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; white-space: nowrap;">
                        ${d.isAvailable ? '✓ Available' : '✗ Busy'}
                    </span>
                </div>
            `).join("");
        } catch (err) {
            console.error(err);
            doctorList.innerHTML = "<span style='color: red;'>Error connecting to server.</span>";
        }
    };

    if (doctorNavBtn && doctorModal) {
        doctorNavBtn.addEventListener("click", (e) => {
            e.preventDefault();
            fetchAndShowDoctors();
        });
        closeDoctorModalBtn.addEventListener("click", () => {
            doctorModal.style.display = "none";
        });
    }
});
