// Shared behavior: mobile nav toggle + FAQ accordion
document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", function () {
      item.classList.toggle("open");
    });
  });
});
