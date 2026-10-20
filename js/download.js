/* ==========================================================================
   Popup de download do SteatoDB
   Abre e fecha o popup. O envio do formulário fica em js/form-download.js
   ========================================================================== */
(() => {
    const modal = document.getElementById('modal-download');
    const form  = document.getElementById('form-download');
    const msg   = document.getElementById('download-msg');

    // Abre ao clicar em qualquer elemento com data-abrir-download
    document.querySelectorAll('[data-abrir-download]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            if (msg) {
                msg.textContent = '';
                msg.className = 'modal__msg';
            }
            modal.showModal();
            form.elements['email'].focus();
        });
    });

    // Fecha no X e clicando no fundo borrado (a tecla Esc já fecha sozinha)
    modal.querySelector('.modal__close').addEventListener('click', () => modal.close());

    modal.addEventListener('click', e => {
        if (e.target === modal) modal.close();
    });
})();