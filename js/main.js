gsap.registerPlugin(ScrollTrigger);

let currentSlide = 0;
const slides = document.querySelectorAll('.system-slide');
const totalSlides = slides.length;

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
  initScrollAnimations();
  initInteractions();
  initSystemSlider();
  initScrollTop();
});

function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  const toggle = () => btn.classList.toggle('show', window.pageYOffset > 300);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function loadHeader() {
  fetch('includes/header.html')
    .then(r => r.text())
    .then(data => {
      document.getElementById('header').innerHTML = data;
      initNavLinks();
    })
    .catch(e => console.error('헤더 로드 오류:', e));
}

function initNavLinks() {
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.getElementById('header')?.offsetHeight || 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
}

function loadFooter() {
  fetch('includes/footer.html')
    .then(r => r.text())
    .then(data => { document.getElementById('footer').innerHTML = data; })
    .catch(e => console.error('푸터 로드 오류:', e));
}

function initSystemSlider() {
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');

  if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));
}

function changeSlide(direction) {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');
}

function initScrollAnimations() {
  gsap.to('.hero::before', {
    y: 100,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  const reveals = gsap.utils.toArray('.scroll-reveal');
  reveals.forEach(reveal => {
    gsap.fromTo(reveal,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: reveal,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  const cards = gsap.utils.toArray('.character-card');
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30, rotationZ: -3 },
      {
        opacity: 1,
        y: 0,
        rotationZ: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'back.out',
        scrollTrigger: {
          trigger: '.character-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.fromTo(title,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  gsap.fromTo('.ship-preview',
    { opacity: 0, x: 300 },
    {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.ship-system',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
}

function initInteractions() {
  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      gsap.to(this, { scale: 1.08, duration: 0.3 });
      gsap.to(this.querySelector('.character-image'), { scale: 1.2, rotation: 10, duration: 0.3 });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(this, { scale: 1, duration: 0.3 });
      gsap.to(this.querySelector('.character-image'), { scale: 1, rotation: 0, duration: 0.3 });
    });
  });

  document.querySelectorAll('.item-slot').forEach(slot => {
    slot.addEventListener('mouseenter', () => gsap.to(slot, { scale: 1.15, duration: 0.2 }));
    slot.addEventListener('mouseleave', () => gsap.to(slot, { scale: 1, duration: 0.2 }));
    slot.addEventListener('click', () => {
      gsap.timeline()
        .to(slot, { scale: 0.8, duration: 0.1 })
        .to(slot, { scale: 1.15, duration: 0.2 })
        .to(slot, { scale: 1, duration: 0.1 });
    });
  });

  const ctaBtn = document.querySelector('.cta-button');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      gsap.timeline()
        .to(ctaBtn, { scale: 0.95, duration: 0.05 })
        .to(ctaBtn, { scale: 1.05, duration: 0.2 }, 0.05)
        .to(ctaBtn, { scale: 1, duration: 0.1 });
      showNotification('게임 준비 중입니다! 곧 출시됩니다.');
    });
  }

  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.timeline()
        .to(btn, { scale: 0.95, duration: 0.05 })
        .to(btn, { scale: 1.05, duration: 0.2 }, 0.05)
        .to(btn, { scale: 1, duration: 0.1 });
      const platform = btn.classList.contains('android') ? 'Google Play' : 'App Store';
      showNotification(platform + '로 이동합니다.');
    });
  });

}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.cssText = 'position:fixed;top:100px;right:20px;background:linear-gradient(135deg,#FFD700,#FF8800);color:#1a1a1a;padding:16px 24px;border-radius:8px;font-weight:600;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,0.3)';
  document.body.appendChild(notif);
  gsap.timeline()
    .fromTo(notif, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
    .to(notif, { opacity: 0, y: -20, duration: 0.3 }, 2)
    .call(() => notif.remove());
}
