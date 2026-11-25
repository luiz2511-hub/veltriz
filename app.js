"use strict";

const models = {
  asfalto: {
    description: "Para treinos de ritmo e corridas no asfalto. Combina malha respirável com uma entressola de perfil curvo.",
    color: "Azul elétrico",
    use: "Asfalto e treinos de ritmo"
  },
  treino: {
    description: "Para somar quilômetros ao longo da semana, com uma base ampla e espuma de densidade uniforme.",
    color: "Areia",
    use: "Rodagem diária"
  },
  trilha: {
    description: "Para os dias fora do asfalto. O solado com cravos e a proteção no bico acompanham terrenos irregulares.",
    color: "Grafite e verde-sálvia",
    use: "Trilhas e caminhos de terra"
  }
};

const products = [...document.querySelectorAll(".product")];
const filters = [...document.querySelectorAll("[data-filter]")];
const filterStatus = document.querySelector("#filter-status");
const dialog = document.querySelector("#product-dialog");
let lastTrigger;

filters.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));

    let count = 0;
    products.forEach(product => {
      product.hidden = category !== "todos" && product.dataset.category !== category;
      count += Number(!product.hidden);
    });
    filterStatus.textContent = count === 1 ? "1 modelo exibido." : count + " modelos exibidos.";
    window.ScrollTrigger?.refresh();
  });
});

products.forEach(product => {
  const button = product.querySelector("button");
  button.addEventListener("click", () => {
    const model = models[product.dataset.category];
    const sourceImage = product.querySelector("img");
    const dialogImage = dialog.querySelector(".dialog-image");

    lastTrigger = button;
    dialogImage.src = sourceImage.getAttribute("src");
    dialogImage.alt = sourceImage.alt;
    dialog.querySelector("#dialog-title").textContent = product.querySelector("h3").textContent;
    dialog.querySelector(".dialog-category").textContent = product.querySelector(".product-media span").textContent;
    dialog.querySelector(".dialog-description").textContent = model.description;
    dialog.querySelector(".dialog-color").textContent = model.color;
    dialog.querySelector(".dialog-use").textContent = model.use;
    dialog.showModal();
  });
});

dialog.addEventListener("close", () => lastTrigger?.focus());

const runway = document.querySelector(".spotlight-runway");
const spotlight = runway.querySelector(".spotlight");
const slides = [...spotlight.querySelectorAll("img")];
const names = products.map(product => product.querySelector("h3").textContent);
const spotlightName = spotlight.querySelector(".spotlight-name");
let activeSlide;
let galleryScroll;

// Uma volta distribui os modelos em profundidade. O que cruza por trás
// permanece menor durante toda a passagem entre as duas laterais.
function frameSpotlight(position) {
  slides.forEach((image, index) => {
    const angle = (index - position) * 2 * Math.PI / slides.length;
    const depth = (1 + Math.cos(angle)) / 2;
    const x = `calc(var(--gallery-radius) * ${Math.sin(angle)})`;
    image.style.transform = `translate(${x}, ${(1 - depth) * 13}%) scale(${.44 + depth * .56})`;
    image.style.zIndex = Math.round(depth * 100);
    image.style.opacity = .25 + depth * .75;
  });
  const index = Math.round(position) % slides.length;
  if (index !== activeSlide) {
    activeSlide = index;
    spotlightName.textContent = names[index];
  }
}

const stops = [.10, .50, .90];
function scrollToModel(index, behavior) {
  const { start, end } = galleryScroll;
  window.scrollTo({ top: start + stops[index] * (end - start), behavior });
}

spotlight.addEventListener("focusin", () => {
  if (galleryScroll && window.scrollY > galleryScroll.end) {
    scrollToModel(activeSlide, "instant");
    ScrollTrigger.update();
  }
});

spotlight.querySelectorAll("[data-step]").forEach(button => {
  button.addEventListener("click", () => {
    const next = (activeSlide + Number(button.dataset.step) + slides.length) % slides.length;
    if (galleryScroll) {
      scrollToModel(next, "smooth");
    } else {
      frameSpotlight(next);
    }
  });
});
frameSpotlight(0);
runway.hidden = false;

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference) and (min-height: 450px)", () => {
    runway.classList.add("travelling");
    const hero = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "revelacao", trigger: ".hero", start: "top top",
        end: "+=90%", pin: true, scrub: true
      }
    });
    hero.set(".hero-image", { filter: "grayscale(1) brightness(.78)" }, 0)
      .fromTo(".hero-reveal",
        { visibility: "visible", clipPath: "polygon(104% 0, 115% 0, 115% 100%, 116% 100%, 110% 60%)" },
        { clipPath: "polygon(38% 0, 115% 0, 115% 100%, 62% 100%, 52% 60%)", duration: .48 }, 0)
      .to(".hero-reveal", {
        clipPath: "polygon(-24% 0, 115% 0, 115% 100%, -5% 100%, -14% 60%)", duration: .32
      }, .48)
      .fromTo(".hero-frame", { scale: 1 }, { scale: 1.17, duration: .82 }, 0)
      .to(".hero-frame", { scale: 1.32, duration: .18 }, .82)
      .to(".hero-copy", { y: -24, duration: 1 }, 0);

    const race = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "percurso", trigger: ".race", start: "top top",
        end: "+=115%", pin: true, scrub: true
      }
    });
    race.fromTo(".race-landscape",
      { scale: 1.03, transformOrigin: "64% 54%" },
      { scale: 1.45, xPercent: -2.5, duration: 1 }, 0)
      .fromTo(".race-lines", { scale: .65, yPercent: -5 },
        { scale: 2.2, yPercent: 23, duration: 1 }, 0)
      .fromTo(".race-copy", { xPercent: 9, y: 48, opacity: 0 },
        { xPercent: 0, y: 0, opacity: 1, duration: .35 }, .12)
      .to(".race-copy", { xPercent: -8, duration: .42 }, .58);

    // A pista sai do quadro. A vitrine permanece atrás da coleção
    // apenas até a borda clara alcançar o topo da janela.
    ScrollTrigger.create({
      id: "palco", trigger: runway, start: "top top",
      endTrigger: ".collection", end: "top top", pin: spotlight, pinSpacing: false
    });
    const orbit = { position: 0 };
    const gallery = gsap.timeline({
      defaults: { ease: "sine.inOut" },
      onUpdate: () => frameSpotlight(orbit.position),
      scrollTrigger: {
        id: "vitrine", trigger: runway, start: "top top",
        end: "bottom bottom", scrub: true
      }
    });
    gallery.to(orbit, { position: 1, duration: .26 }, .18)
      .to(orbit, { position: 2, duration: .26 }, .58)
      .to(orbit, { position: 2, duration: .16 }, .84);
    galleryScroll = gallery.scrollTrigger;
    frameSpotlight(orbit.position);

    gsap.fromTo(".collection .product-grid", { y: 46 }, {
      y: 0, ease: "none",
      scrollTrigger: { id: "editorial", trigger: ".collection", start: "top bottom", end: "top 12%", scrub: true }
    });

    return () => {
      runway.classList.remove("travelling");
      galleryScroll = null;
      frameSpotlight(activeSlide);
    };
  });
}
