// scrollTop.js

document.addEventListener("DOMContentLoaded", function () {
  const scrollBtn = document.getElementById("scrolujnahoru");

  // zobrazit/skrýt tlačítko podle pozice
  window.addEventListener("scroll", function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      scrollBtn.style.display = "block";
    } else {
      scrollBtn.style.display = "none";
    }
  });

  // kliknutí na tlačítko
  scrollBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
