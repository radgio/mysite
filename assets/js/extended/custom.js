document.addEventListener("DOMContentLoaded", function() {
    // Seleziona tutti i link nella pagina
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        // Se il link punta a /admin/, forzalo ad aprirsi in una nuova scheda
        if (link.getAttribute('href') && link.getAttribute('href').includes('/admin/')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
});
