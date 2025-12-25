document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.querySelector(".nav-item.dropdown");
    let menu = dropdown.querySelector(".dropdown-menu");
    let openTimeout, closeTimeout;

    dropdown.addEventListener("mouseenter", function () {
        clearTimeout(closeTimeout); // Zrušení zavíracího timeoutu, pokud uživatel vrátí myš
        openTimeout = setTimeout(() => {
            menu.style.display = "block";
            setTimeout(() => {
                menu.style.opacity = "1";
                menu.style.visibility = "visible";
            }, 50);
        }, 300); // ⏳ PRODLEVA pro otevření (300ms)
    });

    dropdown.addEventListener("mouseleave", function () {
        clearTimeout(openTimeout); // Zruší otevření, pokud uživatel rychle odjede
        closeTimeout = setTimeout(() => {
            menu.style.opacity = "0";
            menu.style.visibility = "hidden";
            setTimeout(() => {
                menu.style.display = "none";
            }, 400); // Čas odpovídající CSS přechodu
        }, 300); // ⏳ PRODLEVA před zavřením (300ms)
    });
});



