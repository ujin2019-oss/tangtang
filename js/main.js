gsap.registerPlugin(ScrollTrigger);

// JS가 살아있음을 표시 → CSS의 등장 애니메이션(숨김 상태)이 이때만 적용됨
document.documentElement.classList.add('js-ready');

let currentSlide = 0;
const slides = document.querySelectorAll('.system-slide');
const totalSlides = slides.length;

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initInteractions();
  initSystemSlider();
  initScrollTop();
  // 헤더·푸터가 비동기로 끼어들며 레이아웃이 밀리므로, 로딩 완료 후 트리거 위치 재계산
  Promise.all([loadHeader(), loadFooter()]).then(() => ScrollTrigger.refresh());
});

function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const show = (v) => btn.classList.toggle('show', v);

  // 1) IntersectionObserver: 기기 에뮬레이션/터치 스크롤에서도 안정적으로 감지
  //    문서 상단 300px 지점에 감지용 sentinel을 두고, 그 지점을 지나면 버튼 표시
  if ('IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:300px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.appendChild(sentinel);
    new IntersectionObserver(([e]) => show(!e.isIntersecting), { threshold: 0 }).observe(sentinel);
  }

  // 2) 스크롤 이벤트(보강/폴백): 여러 소스에서 스크롤 위치 읽기
  const toggle = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    show(y > 300);
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

function loadHeader() {
  return fetch('includes/header.html')
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
  return fetch('includes/footer.html')
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
  // 등장 애니메이션: IntersectionObserver로 안정적으로 처리.
  // 화면에 들어오면 .in-view 클래스를 붙여 CSS 트랜지션으로 나타냄.
  const revealEls = document.querySelectorAll('.scroll-reveal, .character-card, .section-title, .ship-preview');

  // IntersectionObserver 미지원 환경이면 전부 즉시 표시
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => io.observe(el));
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
