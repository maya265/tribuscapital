// Client portal: login (login.html) + authenticated dashboard (portal.html).
// Note: links/redirects use clean URLs (no .html) — GitHub Pages resolves
// "/login" to login.html automatically.
document.addEventListener("DOMContentLoaded", function () {

  // ---------- Login page ----------
  var loginForm = document.getElementById("login-form");
  var loginStatus = document.getElementById("form-status");
  if (loginForm && loginStatus) {
    supabaseClient.auth.getSession().then(function (res) {
      if (res.data.session) window.location.href = "portal";
    });

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = loginForm.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "מתחבר...";
      loginStatus.textContent = "";
      loginStatus.className = "";

      var email = loginForm.querySelector('input[name="email"]').value;
      var password = loginForm.querySelector('input[name="password"]').value;

      supabaseClient.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) {
            loginStatus.textContent = "אימייל או סיסמה שגויים. נסו שוב.";
            loginStatus.className = "form-status error";
            submitBtn.disabled = false;
            submitBtn.textContent = "כניסה";
            return;
          }
          window.location.href = "portal";
        })
        .catch(function () {
          loginStatus.textContent = "אירעה שגיאה. נסו שוב מאוחר יותר.";
          loginStatus.className = "form-status error";
          submitBtn.disabled = false;
          submitBtn.textContent = "כניסה";
        });
    });

    var forgotLink = document.getElementById("forgot-password-link");
    if (forgotLink) {
      forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        var email = loginForm.querySelector('input[name="email"]').value;
        if (!email) {
          loginStatus.textContent = "הזינו קודם את כתובת האימייל שלכם בשדה למעלה.";
          loginStatus.className = "form-status error";
          return;
        }
        supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/login"
        }).then(function () {
          loginStatus.textContent = "אם הכתובת קיימת במערכת, נשלח אליה קישור לאיפוס סיסמה.";
          loginStatus.className = "form-status success";
        });
      });
    }
  }

  // ---------- Portal (dashboard) page ----------
  var loansList = document.getElementById("loans-list");
  var portalStatus = document.getElementById("portal-status");
  if (loansList && portalStatus) {
    supabaseClient.auth.getSession().then(function (res) {
      if (!res.data.session) {
        window.location.href = "login";
        return;
      }
      loadLoans();
    });

    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        supabaseClient.auth.signOut().then(function () {
          window.location.href = "/";
        });
      });
    }

    function loadLoans() {
      portalStatus.textContent = "טוען נתונים...";
      portalStatus.className = "";

      supabaseClient
        .from("loans")
        .select("id, loan_number, loan_type, principal_amount, status, start_date, loan_documents(id, title, storage_path)")
        .order("created_at", { ascending: false })
        .then(function (res) {
          if (res.error) {
            portalStatus.textContent = "אירעה שגיאה בטעינת הנתונים. נסו לרענן את הדף.";
            portalStatus.className = "form-status error";
            return;
          }
          var loans = res.data || [];
          portalStatus.textContent = "";
          if (loans.length === 0) {
            portalStatus.textContent = "לא נמצאו הלוואות משויכות לחשבון שלך כרגע.";
            return;
          }
          renderLoans(loans);
        });
    }

    function renderLoans(loans) {
      loansList.innerHTML = "";
      loans.forEach(function (loan) {
        var card = document.createElement("div");
        card.className = "card";

        var docsHtml = "";
        var docs = loan.loan_documents || [];
        if (docs.length === 0) {
          docsHtml = '<p style="color:var(--color-text-muted);font-size:0.88rem;">טרם הועלו מסמכים להלוואה זו.</p>';
        } else {
          docsHtml = '<div class="doc-list">' + docs.map(function (doc) {
            return '<div class="doc-item">' +
              '<span>' + escapeHtml(doc.title) + "</span>" +
              '<button type="button" class="btn btn-outline btn-sm download-btn" data-path="' + escapeHtml(doc.storage_path) + '">הורדה</button>' +
              "</div>";
          }).join("") + "</div>";
        }

        card.innerHTML =
          "<h3>הלוואה מס' " + escapeHtml(loan.loan_number) + "</h3>" +
          '<p style="color:var(--color-text-muted);font-size:0.92rem;">' +
          (loan.loan_type ? "סוג: " + escapeHtml(loan.loan_type) + " · " : "") +
          (loan.principal_amount != null ? "סכום: " + Number(loan.principal_amount).toLocaleString("he-IL") + " ₪ · " : "") +
          "סטטוס: " + escapeHtml(loan.status) +
          "</p>" +
          docsHtml;

        loansList.appendChild(card);
      });

      loansList.querySelectorAll(".download-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var path = btn.getAttribute("data-path");
          btn.disabled = true;
          var originalText = btn.textContent;
          btn.textContent = "...";
          supabaseClient.storage.from("loan-documents").createSignedUrl(path, 90)
            .then(function (res) {
              btn.disabled = false;
              btn.textContent = originalText;
              if (res.error || !res.data) {
                alert("אירעה שגיאה בהורדת המסמך. נסו שוב או צרו קשר איתנו.");
                return;
              }
              window.open(res.data.signedUrl, "_blank");
            });
        });
      });
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str == null ? "" : String(str);
      return div.innerHTML;
    }
  }
});
