const canvas = document.getElementById("constellation");
const ctx = canvas.getContext("2d");
const particles = [];
const particleCount = window.innerWidth < 768 ? 60 : 110;
let mouse = { x: null, y: null };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles.length = 0;
  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.8 + 0.2,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(108, 229, 246, 0.45)";
    ctx.fill();
    connectParticles(p, i);
  }
  requestAnimationFrame(updateParticles);
}

function connectParticles(particle, index) {
  for (let j = index + 1; j < particles.length; j += 1) {
    const other = particles[j];
    const dx = particle.x - other.x;
    const dy = particle.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = window.innerWidth < 768 ? 90 : 140;
    if (distance < threshold) {
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(other.x, other.y);
      ctx.strokeStyle = `rgba(108, 229, 246, ${0.18 - distance / (threshold * 5)})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
}

function updateParticles() {
  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (mouse.x && mouse.y) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influenceRadius = 120;

      if (dist < influenceRadius) {
        const force = (influenceRadius - dist) / influenceRadius;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 0.3;
        particle.vy -= Math.sin(angle) * force * 0.3;
      }
    }

    if (particle.x > canvas.width || particle.x < 0) particle.vx *= -1;
    if (particle.y > canvas.height || particle.y < 0) particle.vy *= -1;
  }
  drawParticles();
}

function throttle(fn, wait) {
  let timeout = null;
  return function throttled(event) {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn(event);
        timeout = null;
      }, wait);
    }
  };
}

resizeCanvas();
createParticles();
drawParticles();

window.addEventListener("resize", throttle(() => {
  resizeCanvas();
  createParticles();
}, 120));

window.addEventListener("mousemove", (event) => {
  mouse = { x: event.clientX, y: event.clientY };
});

window.addEventListener("mouseleave", () => {
  mouse = { x: null, y: null };
});

// Interactive hover tilt for cards
const tiltElements = document.querySelectorAll(".card, .project-card");
tiltElements.forEach((element) => {
  const handleMove = (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    element.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const reset = () => {
    element.style.transform = "";
  };

  element.addEventListener("mousemove", handleMove);
  element.addEventListener("mouseleave", reset);
  element.addEventListener("blur", reset);
});

// Smooth scroll for nav
document.querySelectorAll("a[href^='#']").forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Form handling (placeholder)
const contactForm = document.querySelector(".contact__form");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactForm.reset();
  const button = contactForm.querySelector("button");
  const original = button.textContent;
  button.textContent = "Signal sent ✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 2200);
});

// Update footer year
document.getElementById("year").textContent = new Date().getFullYear();
