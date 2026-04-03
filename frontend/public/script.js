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
  if (!uploadPreview || !file) {
    return;
  }

  uploadPreview.innerHTML = `
    <p class="upload-preview__label">Inventory Slot</p>
    <strong>${file.name}</strong>
    <span>${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB uploaded for AI review.</span>
  `;
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
