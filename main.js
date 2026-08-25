/* The AGI Chronicles — interactions */
(function () {
  "use strict";

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) {
      // Above-the-fold content must never wait on observer timing.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- sticky mobile buy bar ---------- */
  var stickyBuy = document.getElementById("sticky-buy");
  var buySection = document.getElementById("buy");
  var hero = document.querySelector(".hero");
  if (stickyBuy && hero && "IntersectionObserver" in window) {
    var pastHero = false, overBuy = false;
    function updateSticky() {
      var show = pastHero && !overBuy;
      stickyBuy.classList.toggle("show", show);
      stickyBuy.setAttribute("aria-hidden", show ? "false" : "true");
    }
    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (entries) {
      overBuy = entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0.2 }).observe(buySection);
  }

  /* ---------- substack modal ---------- */
  var modal = document.getElementById("modal");
  var modalShownKey = "agi-substack-modal";
  var SUPPRESS_DAYS = 14;

  function modalSuppressed() {
    try {
      var t = localStorage.getItem(modalShownKey);
      return t && Date.now() - Number(t) < SUPPRESS_DAYS * 864e5;
    } catch (e) { return false; }
  }
  function rememberModal() {
    try { localStorage.setItem(modalShownKey, String(Date.now())); } catch (e) {}
  }

  var lastFocus = null;
  function openModal() {
    if (!modal.hidden) return;
    lastFocus = document.activeElement;
    var frame = modal.querySelector("iframe[data-src]");
    if (frame && !frame.src) frame.src = frame.getAttribute("data-src");
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("modal-close").focus();
    rememberModal();
  }
  function closeModal() {
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-dismiss").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  if (!modalSuppressed()) {
    var triggered = false;
    function trigger() {
      if (triggered) return;
      triggered = true;
      openModal();
    }
    setTimeout(trigger, 12000);
    var onScroll = function () {
      var depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (depth > 0.45) {
        trigger();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- contact form -> Cloudflare Worker (address never exposed) ---------- */
  var WORKER_URL = "https://kevinroose-form.kbroose.workers.dev/";
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();
    if (!name || !email || !message) {
      status.textContent = "Please fill in your name, email, and a message.";
      status.className = "form-status err";
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Sending…";
    status.className = "form-status";

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        inquiry_type: form.inquiry_type.value,
        _honey: form._honey.value
      })
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (data) {
        if (data.ok) {
          form.reset();
          status.textContent = "Sent — thanks!";
          status.className = "form-status ok";
        } else {
          status.textContent = data.error || "Something went wrong. Please try again.";
          status.className = "form-status err";
        }
      })
      .catch(function () {
        status.textContent = "Could not send right now. Please try again in a minute.";
        status.className = "form-status err";
      })
      .finally(function () { btn.disabled = false; });
  });
})();
