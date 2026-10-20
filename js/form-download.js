// Envia o formulário do modal de download para solicitar.php
(() => {
    const form = document.getElementById('form-download');
    if (!form) return;

    const msg = document.getElementById('download-msg');
    const btn = form.querySelector('.modal__submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const textoOriginal = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        msg.textContent = '';
        msg.className = 'modal__msg';

                try {
            const resp = await fetch('solicitar.php', {
                method: 'POST',
                body: new FormData(form),
            });
            const texto = await resp.text();
            console.log('STATUS:', resp.status, 'RESPOSTA:', texto);
            const dados = JSON.parse(texto);

            msg.textContent = dados.mensagem;
            msg.classList.add(dados.ok ? 'modal__msg--ok' : 'modal__msg--erro');

            if (dados.ok) form.reset();
        } catch (erro) {
            console.error(erro);
            msg.textContent = 'Erro de conexão. Tente novamente.';
            msg.classList.add('modal__msg--erro');
        }
        
    });
})();