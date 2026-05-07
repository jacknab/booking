const PLUM     = "#3B0764";
const PLUM_MID = "#5B21B6";
const INDIGO   = "#6366f1";

const COLS = [
  {
    title: "LaunchSite",
    titleStyle: { color: INDIGO, fontWeight: 700 },
    links: [
      { label: "LaunchSite Overview",    href: "/launchsite.php",          style: { color: INDIGO, fontWeight: 600 } },
      { label: "Website Builder",         href: "/editor/" },
      { label: "Templates",               href: "/launchsite.php#templates" },
      { label: "Features",                href: "/launchsite.php#features" },
      { label: "Barbershop Templates",    href: "/editor/?template=barbershop" },
      { label: "Hair Salon Templates",    href: "/editor/?template=hair-salon" },
      { label: "Nail Salon Templates",    href: "/editor/?template=nail-salon" },
    ],
  },
  {
    title: "SalonOS",
    links: [
      { label: "SalonOS Overview",  href: "/salonos.php",             style: { color: PLUM_MID, fontWeight: 600 } },
      { label: "Online Booking",    href: "/salonos.php#booking" },
      { label: "Built-in POS",      href: "/salonos.php#pos" },
      { label: "Loyalty Rewards",   href: "/salonos.php#loyalty" },
      { label: "Client Check-In",   href: "/salonos.php#checkin" },
      { label: "Waitlist",          href: "/salonos.php#waitlist" },
      { label: "Google Reviews",    href: "/salonos.php#reviews" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Platform Overview",   href: "/overview.php" },
      { label: "Online Booking",      href: "/online-booking.php" },
      { label: "Client Management",   href: "/client-management.php" },
      { label: "Notifications",       href: "/client-notifications.php" },
      { label: "Payment Solutions",   href: "/payments.php" },
      { label: "Card Reader & POS",   href: "/card-reader-pos.php" },
      { label: "Reserve With Google", href: "/reserve-with-google.php" },
      { label: "Client Reviews",      href: "/client-reviews.php" },
    ],
  },
  {
    title: "Salon Types",
    links: [
      { label: "Hair Salon Software",     href: "/hair-salon-software.php" },
      { label: "Nail Salon Software",     href: "/nail-salon-software.php" },
      { label: "Barbershop Software",     href: "/barbershop-software.php" },
    ],
    extras: {
      title: "Compare",
      links: [
        { label: "Certxa vs GlossGenius", href: "/vs-glossgenius.php" },
        { label: "Certxa vs Vagaro",      href: "/vs-vagaro.php" },
      ],
    },
  },
  {
    title: "Company",
    links: [
      { label: "Success Stories", href: "/case-studies.php" },
      { label: "Blog",            href: "/blog.php" },
      { label: "Pricing",         href: "/pricing.php" },
      { label: "About Us",        href: "#" },
      { label: "Careers",         href: "#" },
      { label: "Help Centre",     href: "#" },
      { label: "Contact Us",      href: "/contact.php" },
    ],
  },
];

const PAYMENT_BADGES = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "PCI-DSS"];

export default function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "#0a0014",
      color: "#cbd5e1",
      fontFamily: "'Inter', sans-serif",
      padding: "72px 0 0",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px repeat(5, 1fr)",
          gap: "40px 24px",
        }}
          className="marketing-footer-grid">

          {/* Brand column */}
          <div>
            <a href="/overview.php" style={{
              fontWeight: 900, fontSize: 22, letterSpacing: "-0.04em",
              color: "#fff", textDecoration: "none", display: "inline-block", marginBottom: 14,
            }}>
              Certxa<span style={{ color: "#F59E0B" }}>.</span>
            </a>
            <p style={{ fontSize: ".82rem", lineHeight: 1.65, color: "#64748b", marginBottom: 20, maxWidth: 200 }}>
              The all-in-one platform that helps beauty and wellness professionals book more clients, get paid faster, and build a brand they love.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PAYMENT_BADGES.map(b => (
                <span key={b} style={{
                  display: "inline-block", padding: "3px 8px",
                  borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: ".68rem", fontWeight: 600, color: "#94a3b8",
                  letterSpacing: ".03em",
                }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <p style={{
                fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".08em", color: "#94a3b8", marginBottom: 14,
                ...(col.titleStyle || {}),
              }}>
                {col.title}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map(link => (
                  <li key={link.href + link.label}>
                    <a href={link.href} style={{
                      fontSize: ".8rem", color: "#64748b", textDecoration: "none",
                      transition: "color .15s",
                      ...(link.style || {}),
                    }}
                      onMouseEnter={e => { if (!link.style?.color) (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
                      onMouseLeave={e => { if (!link.style?.color) (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {col.extras && (
                <>
                  <p style={{
                    fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: ".08em", color: "#94a3b8", marginTop: 20, marginBottom: 10,
                  }}>
                    {col.extras.title}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.extras.links.map(link => (
                      <li key={link.href}>
                        <a href={link.href} style={{ fontSize: ".8rem", color: "#64748b", textDecoration: "none" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 0 28px",
          marginTop: 56,
        }}>
          <p style={{ fontSize: ".78rem", color: "#475569", margin: 0 }}>
            © {year} Certxa. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookies", "Accessibility"].map(label => (
              <a key={label} href="#" style={{
                fontSize: ".78rem", color: "#475569", textDecoration: "none", transition: "color .15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .marketing-footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 32px 20px !important;
          }
        }
        @media (max-width: 600px) {
          .marketing-footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 380px) {
          .marketing-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
