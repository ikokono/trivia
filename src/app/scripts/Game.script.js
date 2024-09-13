// script.js

document.addEventListener('mousemove', (event) => {
    const background = document.querySelector('.background');
    const x = event.clientX;
    const y = event.clientY;

    // Menggerakkan latar belakang mengikuti kursor
    background.style.transform = `translate(-50%, -50%) translate(${x / 10}px, ${y / 10}px)`;

    // Memindahkan elemen ::before juga
    const beforeElement = background.querySelector('::before');
    beforeElement.style.transform = `translate(-50%, -50%) translate(${x / 5}px, ${y / 5}px)`;
});
