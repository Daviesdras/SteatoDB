const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const lightboxCaption = lightbox.querySelector('.lightbox__caption');

    // Abre ao clicar na imagem
    document.querySelectorAll('.sample__img').forEach(btn => {
        btn.addEventListener('click', () => {
            const img = btn.querySelector('img');
            const caption = btn.closest('.sample').querySelector('figcaption');

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption.textContent.trim();

            lightbox.showModal();
        });
    });

    // Fecha no X
    lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());

    // Fecha clicando fora da imagem (no fundo escuro)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.close();
    });