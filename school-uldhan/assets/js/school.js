document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      siteNav.classList.toggle("open");
    });
  }

  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#siteNav a[data-page]").forEach(function (link) {
    if (link.dataset.page === page) {
      link.classList.add("active");
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
        "Demo login submitted. Portal access will be enabled by school administration."
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
});

function showMessage(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = text;
  el.classList.add("success");
}
