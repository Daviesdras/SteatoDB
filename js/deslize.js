 // Fecha o menu do celular depois de clicar em um link
    const menuToggle = document.getElementById('menu-toggle');
    document.querySelectorAll('.site-nav a, .btn-inscreva').forEach(link => {
        link.addEventListener('click', () => { menuToggle.checked = false; });
    });

    // Abre o bloco retrátil quando o link aponta para ele
    function abrirBloco() {
        const alvo = document.getElementById(location.hash.slice(1));
        if (alvo && alvo.tagName === 'DETAILS') alvo.open = true;
    }
    window.addEventListener('hashchange', abrirBloco);
    abrirBloco();