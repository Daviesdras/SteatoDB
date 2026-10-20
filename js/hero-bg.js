(function () {
    const canvas = document.getElementById('hero-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;

    // Ajustes fáceis de mexer
    const COR = '139, 92, 246';     // roxo (RGB)
    const VELOCIDADE = 0.03;        // menor = mais lento
    const DISTANCIA_LIGACAO = 170;  // alcance das linhas
    const DENSIDADE = 14000;        // maior = menos pontos

    let w, h, particulas = [], rafId;
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function criarParticulas() {
        const qtd = Math.min(80, Math.max(25, Math.floor((w * h) / DENSIDADE)));
        particulas = Array.from({ length: qtd }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * VELOCIDADE * 2,
            vy: (Math.random() - 0.5) * VELOCIDADE * 2,
            r: Math.random() * 1.5 + 1
        }));
    }

    function redimensionar() {
        const dpr = window.devicePixelRatio || 1;
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        criarParticulas();
        desenhar();
    }

    function desenhar() {
        ctx.clearRect(0, 0, w, h);

        // linhas
        for (let i = 0; i < particulas.length; i++) {
            for (let j = i + 1; j < particulas.length; j++) {
                const a = particulas[i], b = particulas[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < DISTANCIA_LIGACAO) {
                    const alpha = (1 - dist / DISTANCIA_LIGACAO) * 0.35;
                    ctx.strokeStyle = `rgba(${COR}, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        // pontos
        ctx.fillStyle = `rgba(${COR}, 0.7)`;
        for (const p of particulas) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function atualizar() {
        for (const p of particulas) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }
    }

    function loop() {
        atualizar();
        desenhar();
        rafId = requestAnimationFrame(loop);
    }

    new ResizeObserver(redimensionar).observe(hero);

    if (!reduzirMovimento) {
        loop();
        // pausa quando a aba não está visível
        document.addEventListener('visibilitychange', () => {
            cancelAnimationFrame(rafId);
            if (!document.hidden) loop();
        });
    }
})();