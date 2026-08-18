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

  var contactForm = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");
  if (contactForm && statusEl) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "שולח...";
      statusEl.textContent = "";
      statusEl.className = "";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            statusEl.textContent = "הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.";
            statusEl.className = "form-status success";
            contactForm.reset();
          } else {
            statusEl.textContent = "אירעה שגיאה בשליחת הטופס. נסו שוב או צרו קשר בטלפון.";
            statusEl.className = "form-status error";
          }
        })
        .catch(function () {
          statusEl.textContent = "אירעה שגיאה בשליחת הטופס. נסו שוב או צרו קשר בטלפון.";
          statusEl.className = "form-status error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "שליחה";
        });
    });
  }
});
