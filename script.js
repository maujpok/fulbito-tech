/* ==========================================================================
   Fulbito — landing page
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURACIÓN
     Pegá acá el endpoint de tu formulario de Formspree (https://formspree.io).
     Se ve así:  https://formspree.io/f/xxxxxxxx
     Mientras esté vacío, el formulario abre el cliente de correo como respaldo.
     ---------------------------------------------------------------------- */
  var WAITLIST_ENDPOINT = 'https://formspree.io/f/mnpappnn';
  var CONTACT_EMAIL = 'hola@fulbito.tech';

  var MESSAGES = {
    invalid: 'Revisá el correo: parece que le falta algo.',
    sending: 'Enviando…',
    ok: '¡Listo! Te avisamos apenas Fulbito esté en las tiendas.',
    already: 'Ya estabas en la lista. Te avisamos igual, quedate tranquilo.',
    error: 'No pudimos guardarte. Probá de nuevo o escribinos a ' + CONTACT_EMAIL + '.',
    mailto: 'Te abrimos el correo para que nos mandes el mail. ¡Gracias!'
  };

  var STORAGE_KEY = 'fulbito:waitlist';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ------------------------------ helpers -------------------------------- */

  function setStatus(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('is-ok', 'is-error');
    if (kind) el.classList.add(kind);
  }

  function remember(email) {
    try {
      window.localStorage.setItem(STORAGE_KEY, email);
    } catch (err) {
      /* modo privado o storage deshabilitado: no es crítico */
    }
  }

  function alreadyJoined(email) {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === email;
    } catch (err) {
      return false;
    }
  }

  /* ---------------------------- lista de espera --------------------------- */

  function initWaitlist(form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.waitlist-status');
    var buttonLabel = button ? button.textContent : '';

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var email = (input.value || '').trim().toLowerCase();

      if (!EMAIL_RE.test(email)) {
        setStatus(status, MESSAGES.invalid, 'is-error');
        input.focus();
        return;
      }

      if (alreadyJoined(email)) {
        setStatus(status, MESSAGES.already, 'is-ok');
        return;
      }

      if (!WAITLIST_ENDPOINT) {
        // Respaldo sin backend: abrimos el cliente de correo del visitante.
        var subject = encodeURIComponent('Quiero probar Fulbito');
        var body = encodeURIComponent('Hola! Sumenme a la lista de espera.\n\nMi correo: ' + email + '\n');
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
        remember(email);
        setStatus(status, MESSAGES.mailto, 'is-ok');
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = MESSAGES.sending;
      }
      setStatus(status, '', null);

      var payload = new FormData();
      payload.append('email', email);
      payload.append('origen', 'landing www.fulbito.tech');

      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          remember(email);
          form.reset();
          setStatus(status, MESSAGES.ok, 'is-ok');
        })
        .catch(function () {
          setStatus(status, MESSAGES.error, 'is-error');
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.textContent = buttonLabel;
          }
        });
    });

    input.addEventListener('input', function () {
      if (status.textContent) setStatus(status, '', null);
    });
  }

  /* ------------------------------ navegación ------------------------------ */

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav-menu');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  }

  /* -------------------------- header al hacer scroll ---------------------- */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 12);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------ animación de aparición ------------------------ */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* --------------------------------- init --------------------------------- */

  function init() {
    document.querySelectorAll('.waitlist').forEach(initWaitlist);
    initNav();
    initHeader();
    initReveal();

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
