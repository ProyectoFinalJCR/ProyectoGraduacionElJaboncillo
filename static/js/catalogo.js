window.addEventListener('scroll', () => {
    const imgInfo = document.querySelector('.img-info');
    const scrollPos = window.scrollY; // Detecta la posición del scroll
    const zoomValue = 110 + scrollPos * 0.05; // Ajusta el zoom dinámicamente

    // Aplica el zoom limitado
    imgInfo.style.backgroundSize = `${Math.min(zoomValue, 150)}%`; // Máximo 150%
});

window.addEventListener('load', () => {
    const imgInfo = document.querySelector('.img-info');
    const textoImg = document.querySelector('.texto-img');

    // Muestra la imagen y el texto al cargar
    imgInfo.style.opacity = '1';
    imgInfo.style.transform = 'translateY(0)';
    
    textoImg.style.opacity = '1';
    textoImg.style.transform = 'translateY(0)';
});
