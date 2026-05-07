<?php if (basename($_SERVER['PHP_SELF']) !== 'preview.php'): ?>
<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-brand">
                <a href="https://certxa.com" class="logo">
                    <span class="logo-text">Certxa<span class="logo-dot">.</span></span>
                </a>
                <p class="footer-tagline">Professional salon websites, built and ready to launch — with your domain, your brand, your text.</p>
            </div>
            <div class="footer-col">
                <h4>Product</h4>
                <ul>
                    <li><a href="https://certxa.com/launchit">Launchit</a></li>
                    <li><a href="https://certxa.com/salonos">SalonOS</a></li>
                    <li><a href="https://certxa.com/pricing">Pricing</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Designs</h4>
                <ul>
                    <li><a href="<?php echo BASE_PATH; ?>/hair-salons.php">Hair Salons</a></li>
                    <li><a href="<?php echo BASE_PATH; ?>/barbershops.php">Barbershops</a></li>
                    <li><a href="<?php echo BASE_PATH; ?>/nail-salons.php">Nail Salons</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Company</h4>
                <ul>
                    <li><a href="https://certxa.com/about">About</a></li>
                    <li><a href="https://certxa.com/contact">Contact</a></li>
                    <li><a href="https://certxa.com/privacy">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <?php echo date('Y'); ?> Certxa. All rights reserved.</p>
        </div>
    </div>
</footer>
<?php endif; ?>
<script src="<?php echo BASE_PATH; ?>/assets/js/main.js"></script>
</body>
</html>
