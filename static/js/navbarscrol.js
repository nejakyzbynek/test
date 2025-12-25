// Detect scroll position
window.addEventListener('scroll', function () {
            let navbar = document.querySelector('.navbar');
            if (window.scrollY > 650) {  // Change this value to trigger when you want the effect
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });