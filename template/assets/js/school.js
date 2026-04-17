document.addEventListener("DOMContentLoaded", function () {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#main-menu a, .mobile_menu a").forEach(function (link) {
    const href = (link.getAttribute("href") || "").split("#")[0];
    if (href === page) {
      link.classList.add("active");
      const listItem = link.closest("li");
      if (listItem) {
        listItem.classList.add("current");
      }
    }
  });

  document.querySelectorAll("[data-notice-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      const listId = input.getAttribute("data-target");
      const query = input.value.trim().toLowerCase();
      const list = document.getElementById(listId);

      if (!list) {
        return;
      }

      list.querySelectorAll(".notice-item").forEach(function (item) {
        const text = item.getAttribute("data-search-text") || "";
        const matches = text.toLowerCase().includes(query);
        item.style.display = matches ? "flex" : "none";
      });
    });
  });

  const demoPdfData =
    "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggMTQ4ID4+CnN0cmVhbQpCVAovRjEgMjAgVGYKNzIgNzMwIFRkCihHT1ZULiBISUdIIFNDSC4gVUxESEFOIC0gRG9jdW1lbnQgVGVtcGxhdGUpIFRqCjAgLTI4IFRkCi9GMSAxMiBUZgooVGhpcyBQREYgaXMgZ2VuZXJhdGVkIGZvciB3ZWJzaXRlIGRlbW8gZG93bmxvYWRzLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDMxMSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjUwOQolJUVPRgo=";

  document.querySelectorAll("[data-demo-pdf]").forEach(function (link) {
    link.setAttribute("href", "data:application/pdf;base64," + demoPdfData);
  });

  const admissionForm = document.getElementById("admissionForm");
  if (admissionForm) {
    admissionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showMessage(
        "admissionMessage",
        "Application saved. Please visit the school office with documents for final verification."
      );
      admissionForm.reset();
    });
  }

  const loginForm = document.getElementById("portalLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showMessage(
        "portalMessage",
        "Login request submitted. Portal access is managed by school administration."
      );
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showMessage(
        "contactMessage",
        "Thank you. Your message has been noted. School office will connect with you."
      );
      contactForm.reset();
    });
  }

  initDataVisuals();

  // Language switcher (English/Hindi) using Google Translate.
  initLanguageSwitcher();
});

function showMessage(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = text;
  el.classList.add("success");
}

function initDataVisuals() {
  const targets = [
    ...document.querySelectorAll("[data-meter-fill]"),
    ...document.querySelectorAll("[data-trend-value]")
  ];

  if (!targets.length) {
    return;
  }

  const animate = function (el, attrName) {
    const raw = parseFloat(el.getAttribute(attrName));
    if (Number.isNaN(raw)) {
      return;
    }

    const clamped = Math.max(0, Math.min(100, raw));
    el.style.width = clamped + "%";
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      if (el.hasAttribute("data-meter-fill")) {
        animate(el, "data-meter-fill");
      }
      if (el.hasAttribute("data-trend-value")) {
        animate(el, "data-trend-value");
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const el = entry.target;
        if (el.hasAttribute("data-meter-fill")) {
          animate(el, "data-meter-fill");
        }
        if (el.hasAttribute("data-trend-value")) {
          animate(el, "data-trend-value");
        }
        observer.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

function initLanguageSwitcher() {
  if (document.getElementById("uldhan-lang-switcher")) {
    return;
  }

  if (!document.getElementById("uldhan-lang-style")) {
    const style = document.createElement("style");
    style.id = "uldhan-lang-style";
    style.textContent =
      "#uldhan-lang-switcher{position:fixed;right:16px;bottom:16px;z-index:99999;background:#fff;border:1px solid #d9d9d9;border-radius:8px;padding:6px;box-shadow:0 6px 18px rgba(0,0,0,.15);display:flex;gap:6px;align-items:center;}" +
      ".uldhan-lang-btn{border:1px solid #0d6efd;background:#fff;color:#0d6efd;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;line-height:1;cursor:pointer;}" +
      ".uldhan-lang-btn.active{background:#0d6efd;color:#fff;}" +
      "#uldhan-google-translate{display:none;}" +
      ".goog-te-banner-frame.skiptranslate{display:none!important;}" +
      "body{top:0!important;}";
    document.head.appendChild(style);
  }

  const switcher = document.createElement("div");
  switcher.id = "uldhan-lang-switcher";
  switcher.innerHTML =
    '<button type="button" class="uldhan-lang-btn" data-lang="en">EN</button><button type="button" class="uldhan-lang-btn" data-lang="hi">HI</button><div id="uldhan-google-translate"></div>';
  document.body.appendChild(switcher);

  function setGoogleCookie(lang) {
    const value = "/auto/" + lang;
    document.cookie = "googtrans=" + value + ";path=/";
  }

  function updateButtons(lang) {
    document.querySelectorAll("#uldhan-lang-switcher .uldhan-lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  function applyLanguage(lang) {
    localStorage.setItem("uldhan-lang", lang);
    setGoogleCookie(lang);
    updateButtons(lang);

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    }
  }

  const savedLang = localStorage.getItem("uldhan-lang") || "en";
  setGoogleCookie(savedLang);
  updateButtons(savedLang);

  document.querySelectorAll("#uldhan-lang-switcher .uldhan-lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLanguage(btn.getAttribute("data-lang"));
    });
  });

  window.uldhanGoogleTranslateInit = function () {
    if (!window.google || !google.translate || !google.translate.TranslateElement) {
      return;
    }

    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi",
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      },
      "uldhan-google-translate"
    );

    setTimeout(function () {
      applyLanguage(localStorage.getItem("uldhan-lang") || "en");
    }, 250);
  };

  if (!document.querySelector('script[src*="translate_a/element.js"]')) {
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=uldhanGoogleTranslateInit";
    script.async = true;
    document.body.appendChild(script);
  } else {
    setTimeout(function () {
      applyLanguage(savedLang);
    }, 500);
  }
}
