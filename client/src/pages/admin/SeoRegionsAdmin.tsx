import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "./AdminLayout";

interface SeoRegion {
  id: number;
  city: string;
  state: string;
  stateCode: string;
  slug: string;
  phone?: string;
  zip?: string;
  product: string;
  businessTypes?: string;
  nearbyCities?: string;
  metaTitle?: string;
  metaDesc?: string;
  h1Override?: string;
  pageGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

const PRODUCT_OPTIONS = [
  { value: "booking", label: "Certxa Booking (Appointments)" },
  { value: "queue",   label: "Certxa Queue (Walk-Ins)" },
  { value: "pro",     label: "Certxa Pro (Field Service)" },
];

const DEFAULT_BUSINESS_TYPES: Record<string, string[]> = {
  booking: ["Hair Salons", "Barber Shops", "Nail Salons", "Spas & Massage", "Estheticians", "Tattoo Artists", "Pet Groomers", "Personal Trainers", "Tutors"],
  queue:   ["Barber Shops", "Walk-In Hair Salons", "Nail Studios", "Urgent Care", "Food Counters", "Auto Service"],
  pro:     ["HVAC", "Plumbing", "Electrical", "Landscaping", "Appliance Repair", "Carpet Cleaning", "Pressure Washing", "Handyman Services"],
};

function slugify(city: string, stateCode: string, product: string) {
  const c = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const s = stateCode.toLowerCase().replace(/[^a-z]/g, "");
  const p = product === "all" ? "" : `-${product}`;
  return `${c}-${s}${p}`;
}

interface FormState {
  city: string;
  state: string;
  stateCode: string;
  slug: string;
  phone: string;
  zip: string;
  product: string;
  businessTypes: string;
  nearbyCities: string;
  metaTitle: string;
  metaDesc: string;
  h1Override: string;
}

const EMPTY_FORM: FormState = {
  city: "", state: "", stateCode: "", slug: "",
  phone: "", zip: "", product: "booking",
  businessTypes: "", nearbyCities: "",
  metaTitle: "", metaDesc: "", h1Override: "",
};

export default function SeoRegionsAdmin() {
  const [regions, setRegions] = useState<SeoRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<number | "all" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const slugManual = useRef(false);

  useEffect(() => { loadRegions(); }, []);

  async function loadRegions() {
    setLoading(true);
    try {
      const r = await fetch("/api/seo-regions");
      setRegions(await r.json());
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    slugManual.current = false;
    setError(null);
    setShowForm(true);
  }

  function openEdit(region: SeoRegion) {
    setEditId(region.id);
    setForm({
      city: region.city,
      state: region.state,
      stateCode: region.stateCode,
      slug: region.slug,
      phone: region.phone ?? "",
      zip: region.zip ?? "",
      product: region.product,
      businessTypes: region.businessTypes
        ? JSON.parse(region.businessTypes).join(", ")
        : "",
      nearbyCities: region.nearbyCities ?? "",
      metaTitle: region.metaTitle ?? "",
      metaDesc: region.metaDesc ?? "",
      h1Override: region.h1Override ?? "",
    });
    slugManual.current = true;
    setError(null);
    setShowForm(true);
  }

  function handleField(key: keyof FormState, value: string) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if ((key === "city" || key === "stateCode" || key === "product") && !slugManual.current) {
        next.slug = slugify(
          key === "city" ? value : prev.city,
          key === "stateCode" ? value : prev.stateCode,
          key === "product" ? value : prev.product,
        );
      }
      if (key === "slug") slugManual.current = true;
      return next;
    });
  }

  function fillDefaultBusinessTypes() {
    const types = DEFAULT_BUSINESS_TYPES[form.product] ?? [];
    setForm(p => ({ ...p, businessTypes: types.join(", ") }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const businessTypesArr = form.businessTypes
        ? form.businessTypes.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const payload = {
        city: form.city,
        state: form.state,
        stateCode: form.stateCode.toUpperCase(),
        slug: form.slug,
        phone: form.phone || null,
        zip: form.zip || null,
        product: form.product,
        businessTypes: businessTypesArr.length ? JSON.stringify(businessTypesArr) : null,
        nearbyCities: form.nearbyCities || null,
        metaTitle: form.metaTitle || null,
        metaDesc: form.metaDesc || null,
        h1Override: form.h1Override || null,
      };
      const url = editId ? `/api/seo-regions/${editId}` : "/api/seo-regions";
      const method = editId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error ?? "Save failed");
      }
      setShowForm(false);
      setSuccessMsg(editId ? "Region updated and page regenerated!" : "Region created and page generated!");
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadRegions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate(id: number) {
    setGenerating(id);
    try {
      const r = await fetch(`/api/seo-regions/${id}/generate`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSuccessMsg(`Page regenerated: /regions/${data.slug}.html`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadRegions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerateAll() {
    setGenerating("all");
    try {
      const r = await fetch("/api/seo-regions/generate-all", { method: "POST" });
      const data = await r.json();
      setSuccessMsg(`Regenerated ${data.generated} of ${data.total} pages`);
      setTimeout(() => setSuccessMsg(null), 5000);
      await loadRegions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(null);
    }
  }

  async function handleDelete(id: number, city: string) {
    if (!confirm(`Delete the SEO page for ${city}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/seo-regions/${id}`, { method: "DELETE" });
      await loadRegions();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const productLabel: Record<string, string> = {
    booking: "Booking", queue: "Queue", pro: "Pro", all: "All"
  };
  const productColor: Record<string, string> = {
    booking: "#00D4AA", queue: "#F59E0B", pro: "#3B82F6", all: "#a78bfa"
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "#111" }}>SEO Regional Pages</h1>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: "0.9rem" }}>
              Auto-generated static HTML pages — one per city/region — optimized for Google search ranking.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleGenerateAll}
              disabled={generating === "all" || regions.length === 0}
              style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f9fafb", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem" }}
            >
              {generating === "all" ? "Rebuilding…" : "⟳ Rebuild All Pages"}
            </button>
            <button
              onClick={openNew}
              style={{ padding: "9px 20px", borderRadius: 10, background: "#111827", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.9rem" }}
            >
              + Add Region
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 600, fontSize: "0.9rem" }}>
            {error}
            <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}>✕</button>
          </div>
        )}
        {successMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 600, fontSize: "0.9rem" }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{editId ? "Edit Region" : "Add New Region"}</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#9ca3af" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="City *" value={form.city} onChange={v => handleField("city", v)} placeholder="Dallas" />
                <FormField label="State (full name) *" value={form.state} onChange={v => handleField("state", v)} placeholder="Texas" />
                <FormField label="State Code *" value={form.stateCode} onChange={v => handleField("stateCode", v)} placeholder="TX" maxLength={10} />
                <FormField label="Phone Number" value={form.phone} onChange={v => handleField("phone", v)} placeholder="(214) 555-0100" />
                <FormField label="ZIP Code" value={form.zip} onChange={v => handleField("zip", v)} placeholder="75201" />
                <div>
                  <label style={labelStyle}>Product *</label>
                  <select value={form.product} onChange={e => handleField("product", e.target.value)} style={inputStyle as any}>
                    {PRODUCT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label style={labelStyle}>URL Slug *</label>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Will be: /regions/<strong>{form.slug}</strong>.html</span>
                </div>
                <input value={form.slug} onChange={e => handleField("slug", e.target.value)} placeholder="dallas-tx-booking" style={{ ...inputStyle, fontFamily: "monospace" }} />
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label style={labelStyle}>Business Types (comma separated)</label>
                  <button onClick={fillDefaultBusinessTypes} style={{ fontSize: "0.75rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Fill defaults for {productLabel[form.product]}
                  </button>
                </div>
                <textarea value={form.businessTypes} onChange={e => handleField("businessTypes", e.target.value)} rows={2} placeholder="Hair Salons, Barber Shops, Nail Salons…" style={{ ...inputStyle, resize: "vertical" } as any} />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Nearby Cities (comma separated — boosts long-tail keywords)</label>
                <textarea value={form.nearbyCities} onChange={e => handleField("nearbyCities", e.target.value)} rows={2} placeholder="Plano, Frisco, Arlington, Fort Worth, Irving…" style={{ ...inputStyle, resize: "vertical" } as any} />
              </div>

              <details style={{ marginTop: 20 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", color: "#6366f1" }}>⚙ Advanced SEO Overrides (optional)</summary>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  <FormField label="Custom Meta Title" value={form.metaTitle} onChange={v => handleField("metaTitle", v)} placeholder="Leave blank to auto-generate" />
                  <div>
                    <label style={labelStyle}>Custom Meta Description</label>
                    <textarea value={form.metaDesc} onChange={e => handleField("metaDesc", e.target.value)} rows={3} placeholder="Leave blank to auto-generate (recommended)" style={{ ...inputStyle, resize: "vertical" } as any} />
                  </div>
                  <FormField label="Custom H1 Override" value={form.h1Override} onChange={v => handleField("h1Override", v)} placeholder="Leave blank to auto-generate" />
                </div>
              </details>

              {error && (
                <div style={{ marginTop: 16, color: "#b91c1c", fontWeight: 600, fontSize: "0.88rem", background: "#fef2f2", padding: "10px 14px", borderRadius: 8 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.city || !form.state || !form.stateCode || !form.slug} style={{ padding: "10px 28px", borderRadius: 10, background: "#111827", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  {saving ? "Saving…" : editId ? "Save & Rebuild Page" : "Create & Generate Page"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading…</p>
        ) : regions.length === 0 ? (
          <div style={{ background: "#f9fafb", border: "2px dashed #e5e7eb", borderRadius: 16, padding: "56px 32px", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>No regions yet</p>
            <p style={{ color: "#9ca3af", marginBottom: 20, fontSize: "0.9rem" }}>Add your first city to generate a local SEO landing page for it.</p>
            <button onClick={openNew} style={{ padding: "10px 24px", background: "#111827", color: "#fff", borderRadius: 10, border: "none", fontWeight: 700, cursor: "pointer" }}>
              + Add Your First Region
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>City / State</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>URL Slug</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < regions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: "#111" }}>{r.city}</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{r.state} ({r.stateCode})</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `${productColor[r.product]}18`, color: productColor[r.product], fontSize: "0.8rem", fontWeight: 700 }}>
                        {productLabel[r.product] ?? r.product}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {r.phone ? <a href={`tel:${r.phone}`} style={{ color: "#6366f1", fontWeight: 600 }}>{r.phone}</a> : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <a href={`/regions/${r.slug}.html`} target="_blank" rel="noreferrer" style={{ color: "#6366f1", fontFamily: "monospace", fontSize: "0.82rem" }}>
                        /regions/{r.slug}.html ↗
                      </a>
                    </td>
                    <td style={tdStyle}>
                      {r.pageGenerated
                        ? <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.8rem" }}>✓ Live</span>
                        : <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.8rem" }}>✗ Not generated</span>
                      }
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleGenerate(r.id)}
                          disabled={generating === r.id}
                          title="Rebuild HTML page"
                          style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          {generating === r.id ? "…" : "⟳ Rebuild"}
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.city)}
                          style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 36, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontWeight: 800, margin: "0 0 10px", color: "#0369a1" }}>How the SEO Page Builder Works</h3>
          <ul style={{ paddingLeft: 20, color: "#0c4a6e", fontSize: "0.9rem", lineHeight: 1.8 }}>
            <li>Each region you add gets its own <strong>standalone HTML page</strong> at <code>/regions/your-slug.html</code></li>
            <li>Pages include proper <strong>title tags, meta descriptions, JSON-LD structured data, Open Graph tags, and canonical URLs</strong></li>
            <li>Content is keyword-rich and city-specific — Google crawls the raw HTML, no JavaScript required</li>
            <li>Adding <strong>nearby cities</strong> boosts long-tail keyword coverage for the surrounding metro area</li>
            <li>Pages are <strong>rebuilt automatically</strong> when you save changes — no redeploy needed</li>
            <li>To submit pages to Google, add the URLs to your sitemap or use Google Search Console</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

function FormField({ label, value, onChange, placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={inputStyle} />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #d1d5db",
  fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
  background: "#fff", boxSizing: "border-box",
};
const thStyle: React.CSSProperties = {
  padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: "0.8rem",
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
};
const tdStyle: React.CSSProperties = {
  padding: "13px 16px", verticalAlign: "middle",
};
