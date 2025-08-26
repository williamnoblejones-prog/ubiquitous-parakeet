const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const galleryDiv = document.getElementById('gallery');

uploadBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) return alert("Select a file first!");
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        alert(`Uploaded: ${data.file}`);
        loadGallery();
    } else {
        alert("Upload failed");
    }
});

async function loadGallery() {
    galleryDiv.innerHTML = "";
    const res = await fetch('/files');
    const files = await res.json();

    for (const file of files) {
        const img = document.createElement('img');
        img.src = `/download/${file.Key}`;
        img.style.maxWidth = "300px";
        img.style.margin = "10px";
        galleryDiv.appendChild(img);
    }
}

// Initial load
loadGallery();
