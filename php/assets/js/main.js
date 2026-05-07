document.addEventListener('DOMContentLoaded', function () {

    /* ── Mobile menu ── */
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileMenu    = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            mobileMenuBtn.classList.toggle('is-open');
        });
    }

    /* ── Scroll-in entrance animations ── */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06 });

    document.querySelectorAll('.template-card, .category-card, .hero-badge, .section-label').forEach(function (el) {
        observer.observe(el);
    });
});
