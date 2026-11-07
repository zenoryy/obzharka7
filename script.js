/* =========================================================
   Обжарка №7 — интерактив и motion
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Данные меню ---------- */
  const MENU = {
    classic: [
      { name: "Эспрессо", price: 160, desc: "Бленд «Покровка»: шоколад, орех, карамель. 30 мл.", emoji: "☕", c1: "#5a3420" },
      { name: "Капучино", price: 240, desc: "Двойной эспрессо и шелковистое молоко. 250 мл.", img: "assets/hero.jpg", tag: "Хит" },
      { name: "Флэт уайт", price: 260, desc: "Насыщенный, плотный, с тонким слоем микропены.", emoji: "🥛", c1: "#8a5a36" },
      { name: "Американо", price: 190, desc: "Эспрессо и горячая вода. Чистый вкус зерна.", emoji: "🫖", c1: "#4b2a18" },
      { name: "Латте", price: 250, desc: "Мягкий и молочный. На выбор — овсяное или кокосовое.", emoji: "🍶", c1: "#a67148" },
      { name: "Фильтр V60", price: 280, desc: "Моносорт недели. Сегодня — Эфиопия Иргачефф.", emoji: "⚗️", c1: "#6e3f22", tag: "Моносорт" },
    ],
    signature: [
      { name: "Раф «Пряная груша»", price: 320, desc: "Груша, кардамон, ваниль и сливки.", img: "assets/drink-raf.jpg", tag: "Новинка" },
      { name: "Лавандовый латте", price: 310, desc: "Домашний сироп из лаванды и мёда.", emoji: "💜", c1: "#6b4a7a" },
      { name: "Солёная карамель", price: 300, desc: "Капучино с карамелью на флёр-де-сель.", emoji: "🍯", c1: "#b5752f" },
      { name: "Халва-раф", price: 330, desc: "Подсолнечная халва, сливки и эспрессо.", emoji: "🌻", c1: "#9a7a3a" },
      { name: "Кокосовый флэт", price: 290, desc: "На кокосовом молоке с ноткой тростникового сахара.", emoji: "🥥", c1: "#7a6450" },
      { name: "Матча-эспрессо", price: 300, desc: "Церемониальная матча и шот эспрессо сверху.", emoji: "🍵", c1: "#4f6b3a" },
    ],
    cold: [
      { name: "Айс-латте", price: 270, desc: "Эспрессо, холодное молоко и много льда.", img: "assets/drink-iced.jpg", tag: "Хит" },
      { name: "Эспрессо-тоник", price: 290, desc: "Тоник, лёд, цедра апельсина и эспрессо.", emoji: "🍸", c1: "#3f5a6b" },
      { name: "Бамбл", price: 300, desc: "Апельсиновый фреш, карамель и эспрессо.", emoji: "🍊", c1: "#c26a2a" },
      { name: "Колд брю", price: 250, desc: "Холодное заваривание 18 часов. Сладкий и мягкий.", emoji: "🧊", c1: "#3a4a5a" },
      { name: "Фраппе", price: 320, desc: "Взбитый кофе со льдом и шариком пломбира.", emoji: "🍨", c1: "#8a6a5a" },
      { name: "Облепиховый лимонад", price: 260, desc: "Облепиха, розмарин, мёд и газированная вода.", emoji: "🍹", c1: "#c08a20" },
    ],
    food: [
      { name: "Круассан", price: 190, desc: "Французское масло, 27 слоёв. Печём каждое утро.", img: "assets/pastry.jpg", tag: "Свежее" },
      { name: "Синнабон", price: 220, desc: "Булочка с корицей и сливочным кремом.", emoji: "🥐", c1: "#a0672e" },
      { name: "Сырники", price: 390, desc: "Со сметаной и ягодным соусом. До 15:00.", emoji: "🥞", c1: "#b07a3c" },
      { name: "Авокадо-тост", price: 450, desc: "Чиабатта, авокадо, яйцо пашот, микрозелень.", emoji: "🥑", c1: "#5a6b2e" },
      { name: "Баскский чизкейк", price: 330, desc: "Карамельная корочка, нежная середина.", emoji: "🍰", c1: "#9a6a40" },
      { name: "Гранола-боул", price: 340, desc: "Йогурт, домашняя гранола, сезонные ягоды.", emoji: "🫐", c1: "#4a3a6b" },
    ],
  };

  /* ---------- Разбивка текста на буквы/слова ---------- */
  function splitChars(el, startIndex = 0) {
    let i = startIndex;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...child.textContent].forEach((ch) => {
            if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = ch;
            span.style.setProperty("--i", i++);
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return i;
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/ +/);
    el.innerHTML = words.map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(" ");
  }

  let charIndex = 0;
  $$(".hero__title .split").forEach((el) => { charIndex = splitChars(el, charIndex); });
  splitChars($(".footer__big"));
  $$(".reveal-words").forEach(splitWords);

  /* ---------- Прелоадер ---------- */
  const preloader = $(".preloader");
  const level = $(".preloader__level");
  const countEl = $("#loaderCount");
  let progress = 0;
  let pageLoaded = false;
  window.addEventListener("load", () => (pageLoaded = true));
  setTimeout(() => (pageLoaded = true), 3500); // страховка

  const loaderStart = performance.now();
  const LOADER_MIN = reduceMotion ? 0 : 1600; // минимальная длительность анимации, мс
  function tickLoader(now = performance.now()) {
    const timeP = LOADER_MIN ? ((now - loaderStart) / LOADER_MIN) * 100 : 100;
    progress = Math.min(pageLoaded ? 100 : 90, Math.max(progress, timeP));
    countEl.textContent = Math.round(progress);
    level.style.setProperty("--p", progress / 100);
    if (progress < 100) requestAnimationFrame(tickLoader);
    else setTimeout(finishLoading, 300);
  }
  function finishLoading() {
    preloader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    setTimeout(() => preloader.remove(), 1200);
  }
  if (reduceMotion) pageLoaded = true;
  requestAnimationFrame(tickLoader);

  /* ---------- Появление при скролле ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        if (e.target.matches(".stat")) animateCount(e.target.querySelector("[data-count]"));
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  const observeReveal = () =>
    $$(".reveal-up:not(.is-in), .reveal-words:not(.is-in), .reveal-mask:not(.is-in), .footer__big").forEach((el) => io.observe(el));
  observeReveal();

  function animateCount(el) {
    if (!el) return;
    const end = +el.dataset.count;
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(end * eased).toLocaleString("ru-RU");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Меню: вкладки и карточки ---------- */
  const grid = $("#menuGrid");
  const tabs = $$(".tabs__btn");
  const indicator = $(".tabs__indicator");

  function cardHTML(item, i) {
    const media = item.img
      ? `<img src="${item.img}" alt="${item.name}" loading="lazy" />`
      : `<span class="card__emoji">${item.emoji}</span>`;
    return `
      <article class="card" style="--i:${i};--c1:${item.c1 || "#6b3e22"}">
        <div class="card__media" data-cursor="view">
          ${media}
          ${item.tag ? `<span class="card__tag">${item.tag}</span>` : ""}
        </div>
        <div class="card__row"><h3>${item.name}</h3><span class="card__price">${item.price} ₽</span></div>
        <p>${item.desc}</p>
        <button class="card__add" aria-label="Добавить ${item.name}">+</button>
      </article>`;
  }

  function renderMenu(key) {
    grid.innerHTML = MENU[key].map(cardHTML).join("");
    bindCards();
  }

  function moveIndicator(btn) {
    indicator.style.width = btn.offsetWidth + "px";
    indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  let switching = false;
  tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active") || switching) return;
      switching = true;
      tabs.forEach((b) => b.classList.toggle("is-active", b === btn));
      moveIndicator(btn);
      btn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      const cards = $$(".card", grid);
      cards.forEach((c) => c.classList.add("is-leaving"));
      setTimeout(() => { renderMenu(btn.dataset.filter); switching = false; }, reduceMotion ? 0 : 420);
    })
  );

  function bindCards() {
    $$(".card", grid).forEach((card) => {
      if (finePointer && !reduceMotion) {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty("--ry", `${x * 12}deg`);
          card.style.setProperty("--rx", `${-y * 12}deg`);
        });
        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--ry", "0deg");
          card.style.setProperty("--rx", "0deg");
        });
      }
      const add = $(".card__add", card);
      add.addEventListener("click", () => {
        add.classList.remove("is-added");
        void add.offsetWidth;
        add.classList.add("is-added");
        add.textContent = "✓";
        setTimeout(() => (add.textContent = "+"), 1400);
      });
      bindCursorTargets(card);
    });
  }

  renderMenu("classic");
  requestAnimationFrame(() => moveIndicator($(".tabs__btn.is-active")));
  window.addEventListener("resize", () => moveIndicator($(".tabs__btn.is-active")));
  document.fonts && document.fonts.ready.then(() => moveIndicator($(".tabs__btn.is-active")));

  /* ---------- Курсор ---------- */
  const cursor = $(".cursor");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const cur = { x: mouse.x, y: mouse.y };

  function bindCursorTargets(root = document) {
    if (!finePointer) return;
    $$("a, button, [data-cursor]", root).forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      const isView = el.dataset.cursor === "view";
      el.addEventListener("mouseenter", () => cursor.classList.add(isView ? "is-view" : "is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-view", "is-hover"));
    });
  }
  $$(".about__img, .feature__img").forEach((el) => (el.dataset.cursor = "view"));
  bindCursorTargets();

  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ---------- Магнитные кнопки ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Зёрна в hero следуют за мышью ---------- */
  const beans = $$(".bean");
  if (finePointer && !reduceMotion) {
    $(".hero").addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      beans.forEach((b) => {
        const d = +b.dataset.depth;
        b.style.setProperty("--mx", `${x * 60 * d}px`);
        b.style.setProperty("--my", `${y * 60 * d}px`);
      });
    });
  }

  /* ---------- Шапка, активный пункт меню ---------- */
  const header = $(".header");
  const navLinks = $$(".nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  let lastY = scrollY;

  function updateHeader() {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 400 && !document.body.classList.contains("menu-open"));
    lastY = y;

    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle("is-active", i === current));
  }

  /* ---------- Мобильное меню ---------- */
  const burger = $(".burger");
  const mobileMenu = $(".mobile-menu");
  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileMenu.setAttribute("aria-hidden", !open);
  }
  burger.addEventListener("click", () => toggleMenu());
  $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && toggleMenu(false));
  window.addEventListener("resize", () => innerWidth > 900 && toggleMenu(false));

  /* ---------- Скролл-эффекты (параллакс, процесс, большой текст) ---------- */
  const parallaxEls = $$("[data-parallax]");
  const bigLines = $$(".big-text__line");
  const processWrap = $(".process__wrap");
  const steps = $$(".step");

  function onScrollEffects() {
    const vh = innerHeight;

    parallaxEls.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const max = r.height * 0.08; // картинка увеличена до 1.2 — не даём вылезти краям
      const offset = clamp((r.top + r.height / 2 - vh / 2) * +el.dataset.parallax, -max, max);
      el.style.translate = `0 ${offset}px`;
    });

    bigLines.forEach((line) => {
      const r = line.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const shift = (r.top - vh / 2) * 0.3 * +line.dataset.speed;
      line.style.transform = `translateX(${shift - line.scrollWidth * 0.25}px)`;
    });

    if (processWrap) {
      const r = processWrap.getBoundingClientRect();
      const p = clamp((vh * 0.75 - r.top) / (r.height + vh * 0.1), 0, 1);
      processWrap.style.setProperty("--progress", p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle("is-active", p >= (i / steps.length) * 0.95 + 0.02));
    }
  }

  /* ---------- Главный цикл ---------- */
  function loop() {
    if (finePointer) {
      cur.x = lerp(cur.x, mouse.x, 0.18);
      cur.y = lerp(cur.y, mouse.y, 0.18);
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      if (!reduceMotion) onScrollEffects();
      ticking = false;
    });
  }, { passive: true });
  updateHeader();
  if (!reduceMotion) onScrollEffects();
  else $$(".step").forEach((s) => s.classList.add("is-active"));

  /* ---------- Слайдер отзывов ---------- */
  const track = $(".slider__track");
  const slides = $$(".review", track);
  const dotsWrap = $(".slider__dots");
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Отзыв ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);

  const slideStep = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const currentSlide = () => Math.round(track.scrollLeft / slideStep());
  const goTo = (i) => track.scrollTo({ left: clamp(i, 0, slides.length - 1) * slideStep(), behavior: "smooth" });

  function updateDots() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    let idx = currentSlide();
    if (track.scrollLeft >= maxScroll - 4) idx = slides.length - 1;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }
  track.addEventListener("scroll", () => requestAnimationFrame(updateDots), { passive: true });
  updateDots();

  $$(".slider-nav__btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const max = track.scrollWidth - track.clientWidth;
      const dir = +btn.dataset.dir;
      if (dir > 0 && track.scrollLeft >= max - 4) goTo(0);
      else goTo(currentSlide() + dir);
    })
  );

  // перетаскивание мышью на десктопе
  if (finePointer) {
    let down = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => { if (down) track.scrollLeft = startScroll - (e.clientX - startX); });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false; track.classList.remove("is-dragging");
      goTo(currentSlide());
    });
  }

  // автопрокрутка, пауза при наведении/касании
  let autoplay;
  const startAuto = () => {
    if (reduceMotion) return;
    stopAuto();
    autoplay = setInterval(() => {
      const max = track.scrollWidth - track.clientWidth;
      track.scrollLeft >= max - 4 ? goTo(0) : goTo(currentSlide() + 1);
    }, 5000);
  };
  const stopAuto = () => clearInterval(autoplay);
  ["pointerenter", "touchstart"].forEach((ev) => track.addEventListener(ev, stopAuto, { passive: true }));
  ["pointerleave", "touchend"].forEach((ev) => track.addEventListener(ev, startAuto, { passive: true }));
  startAuto();

  /* ---------- Форма бронирования ---------- */
  const form = $("#bookingForm");
  const dateInput = form.elements.date;
  dateInput.min = new Date().toISOString().split("T")[0];

  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    let d = phone.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = "+7";
    if (p.length) out += " (" + p.slice(0, 3);
    if (p.length >= 3) out += ") " + p.slice(3, 6);
    if (p.length >= 6) out += "-" + p.slice(6, 8);
    if (p.length >= 8) out += "-" + p.slice(8, 10);
    phone.value = out;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "phone", "date"].forEach((n) => {
      const input = form.elements[n];
      const field = input.closest(".field");
      const valid = n === "phone" ? input.value.replace(/\D/g, "").length === 11 : input.value.trim() !== "";
      field.classList.remove("is-error");
      if (!valid) { void field.offsetWidth; field.classList.add("is-error"); ok = false; }
    });
    if (!ok) return;
    form.classList.add("is-sent");
    const btnText = $(".btn span", form);
    btnText.textContent = "Заявка отправлена ✓";
    setTimeout(() => {
      form.reset();
      form.classList.remove("is-sent");
      btnText.textContent = "Отправить заявку";
    }, 4000);
  });
})();
