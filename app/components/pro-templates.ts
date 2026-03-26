import { SignatureData, Template } from "./templates";

function socialIconsHtml(data: SignatureData, color: string): string {
  const links: { url: string; label: string }[] = [];
  if (data.linkedin) links.push({ url: data.linkedin, label: "LinkedIn" });
  if (data.twitter) links.push({ url: data.twitter, label: "X" });
  if (data.github) links.push({ url: data.github, label: "GitHub" });
  if (data.instagram) links.push({ url: data.instagram, label: "Instagram" });
  if (links.length === 0) return "";
  return links
    .map(
      (l) =>
        `<a href="${l.url}" style="color:${color};text-decoration:none;font-size:12px;margin-right:10px;" target="_blank">${l.label}</a>`
    )
    .join("");
}

function photoHtml(url: string, size: number, borderRadius: string = "50%"): string {
  if (!url) return "";
  return `<img src="${url}" alt="Photo" width="${size}" height="${size}" style="border-radius:${borderRadius};display:block;" />`;
}

// Pro templates have no moltcorp branding
const executive: Template = {
  id: "executive",
  name: "Executive",
  description: "Premium layout with gold accent",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 90, "50%");
    const socials = socialIconsHtml(data, "#b8860b");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;color:#2c2c2c;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:18px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:22px;font-weight:bold;color:#1a1a1a;letter-spacing:-0.3px;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#b8860b;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#555;padding-bottom:10px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #b8860b;padding-top:10px;">
          <table cellpadding="0" cellspacing="0" border="0">
            ${data.phone ? `<tr><td style="font-size:12px;color:#333;padding-bottom:3px;">${data.phone}</td></tr>` : ""}
            ${data.email ? `<tr><td style="font-size:12px;"><a href="mailto:${data.email}" style="color:#b8860b;text-decoration:none;">${data.email}</a></td></tr>` : ""}
            ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#b8860b;text-decoration:none;">${data.website}</a></td></tr>` : ""}
          </table>
        </td></tr>
        ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const startup: Template = {
  id: "startup",
  name: "Startup",
  description: "Vibrant gradient-inspired tech look",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 70, "12px");
    const socials = socialIconsHtml(data, "#7c3aed");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Arial,sans-serif;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:20px;font-weight:800;color:#1e1b4b;letter-spacing:-0.5px;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#64748b;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="background:linear-gradient(90deg,#7c3aed,#ec4899);height:2px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr><td style="padding-top:8px;">
          ${data.phone ? `<span style="font-size:12px;color:#475569;margin-right:12px;">${data.phone}</span>` : ""}
          ${data.email ? `<a href="mailto:${data.email}" style="font-size:12px;color:#7c3aed;text-decoration:none;margin-right:12px;">${data.email}</a>` : ""}
          ${data.website ? `<a href="${data.website}" style="font-size:12px;color:#7c3aed;text-decoration:none;">${data.website}</a>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const elegant: Template = {
  id: "elegant",
  name: "Elegant",
  description: "Serif font with refined spacing",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#4a5568");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Palatino Linotype',Palatino,Georgia,serif;color:#2d3748;">
  <tr><td style="font-size:24px;font-weight:normal;color:#1a202c;letter-spacing:1px;">${data.name || "Your Name"}</td></tr>
  ${data.title || data.company ? `<tr><td style="font-size:13px;color:#718096;font-style:italic;padding-bottom:10px;letter-spacing:0.5px;">${[data.title, data.company].filter(Boolean).join(" — ")}</td></tr>` : ""}
  <tr><td style="border-top:1px solid #cbd5e0;border-bottom:1px solid #cbd5e0;padding:8px 0;">
    <table cellpadding="0" cellspacing="0" border="0">
      ${data.phone ? `<tr><td style="font-size:12px;color:#4a5568;padding-bottom:2px;">${data.phone}</td></tr>` : ""}
      ${data.email ? `<tr><td style="font-size:12px;"><a href="mailto:${data.email}" style="color:#4a5568;text-decoration:none;">${data.email}</a></td></tr>` : ""}
      ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#4a5568;text-decoration:none;">${data.website}</a></td></tr>` : ""}
    </table>
  </td></tr>
  ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const boldBlock: Template = {
  id: "bold-block",
  name: "Bold Block",
  description: "Big name with colored background block",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#ffffff");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="background:#1e293b;padding:16px 20px;border-radius:8px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:22px;font-weight:bold;color:#ffffff;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#94a3b8;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#60a5fa;font-weight:600;padding-bottom:10px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:1px solid #334155;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#cbd5e1;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#60a5fa;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#60a5fa;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const healthcare: Template = {
  id: "healthcare",
  name: "Healthcare",
  description: "Clean medical-professional style",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 75, "50%");
    const socials = socialIconsHtml(data, "#0891b2");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#1e293b;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#0e7490;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#64748b;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;font-weight:600;color:#0891b2;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #0891b2;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#0891b2;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#0891b2;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const legal: Template = {
  id: "legal",
  name: "Legal",
  description: "Formal law firm style with dark navy",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#1e3a5f");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;color:#1e3a5f;">
  <tr><td style="font-size:20px;font-weight:bold;letter-spacing:0.5px;">${data.name || "Your Name"}</td></tr>
  ${data.title ? `<tr><td style="font-size:13px;color:#4a5568;padding-bottom:2px;">${data.title}</td></tr>` : ""}
  ${data.company ? `<tr><td style="font-size:14px;font-weight:bold;color:#1e3a5f;text-transform:uppercase;letter-spacing:2px;padding-bottom:8px;">${data.company}</td></tr>` : ""}
  <tr><td style="border-top:3px double #1e3a5f;padding-top:8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      ${data.phone ? `<tr><td style="font-size:12px;color:#4a5568;padding-bottom:2px;">Tel: ${data.phone}</td></tr>` : ""}
      ${data.email ? `<tr><td style="font-size:12px;"><a href="mailto:${data.email}" style="color:#1e3a5f;text-decoration:none;">Email: ${data.email}</a></td></tr>` : ""}
      ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#1e3a5f;text-decoration:none;">${data.website}</a></td></tr>` : ""}
    </table>
  </td></tr>
  ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const realEstate: Template = {
  id: "real-estate",
  name: "Real Estate",
  description: "Warm tones with photo emphasis",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 95, "8px");
    const socials = socialIconsHtml(data, "#b45309");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:16px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:20px;font-weight:bold;color:#78350f;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:12px;color:#b45309;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:14px;color:#92400e;font-weight:bold;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #f59e0b;padding-top:8px;">
          ${data.phone ? `<div style="font-size:13px;font-weight:bold;color:#78350f;padding-bottom:3px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#b45309;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#b45309;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const academia: Template = {
  id: "academia",
  name: "Academia",
  description: "Scholarly with understated style",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#5b21b6");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Book Antiqua','Palatino Linotype',Georgia,serif;color:#1e1b4b;">
  <tr><td style="font-size:18px;font-weight:bold;">${data.name || "Your Name"}</td></tr>
  ${data.title ? `<tr><td style="font-size:13px;color:#5b21b6;padding-bottom:2px;">${data.title}</td></tr>` : ""}
  ${data.company ? `<tr><td style="font-size:13px;color:#64748b;font-style:italic;padding-bottom:8px;">${data.company}</td></tr>` : ""}
  <tr><td style="border-top:1px solid #c4b5fd;padding-top:6px;">
    ${data.phone ? `<div style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</div>` : ""}
    ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#5b21b6;text-decoration:none;">${data.email}</a></div>` : ""}
    ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#5b21b6;text-decoration:none;">${data.website}</a></div>` : ""}
  </td></tr>
  ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const consulting: Template = {
  id: "consulting",
  name: "Consulting",
  description: "Sharp and business-forward",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 70, "50%");
    const socials = socialIconsHtml(data, "#0f766e");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#134e4a;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#134e4a;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:12px;color:#0f766e;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#64748b;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-left:3px solid #0f766e;padding-left:10px;">
          ${data.phone ? `<div style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#0f766e;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#0f766e;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const darkMode: Template = {
  id: "dark-mode",
  name: "Dark Mode",
  description: "Dark background for bold presence",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 75, "50%");
    const socials = socialIconsHtml(data, "#a78bfa");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;background:#0f172a;border-radius:8px;padding:16px;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;padding:16px 14px 16px 16px;">${photo}</td>` : ""}
    <td style="vertical-align:top;padding:16px 16px 16px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:20px;font-weight:bold;color:#f1f5f9;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#a78bfa;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#94a3b8;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:1px solid #334155;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#cbd5e1;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#a78bfa;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#a78bfa;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const photography: Template = {
  id: "photography",
  name: "Photography",
  description: "Visual-forward with large photo",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 110, "4px");
    const socials = socialIconsHtml(data, "#78716c");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Arial,sans-serif;color:#292524;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:18px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:22px;font-weight:300;color:#1c1917;letter-spacing:2px;text-transform:uppercase;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;padding-bottom:10px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#57534e;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:1px solid #d6d3d1;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#78716c;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#78716c;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#78716c;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const finance: Template = {
  id: "finance",
  name: "Finance",
  description: "Conservative with green accent",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#166534");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;color:#14532d;">
  ${data.company ? `<tr><td style="font-size:14px;font-weight:bold;color:#166534;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:8px;border-bottom:2px solid #166534;">${data.company}</td></tr>` : ""}
  <tr><td style="padding-top:10px;font-size:17px;font-weight:bold;color:#14532d;">${data.name || "Your Name"}</td></tr>
  ${data.title ? `<tr><td style="font-size:12px;color:#4b5563;font-style:italic;padding-bottom:8px;">${data.title}</td></tr>` : ""}
  <tr><td>
    ${data.phone ? `<div style="font-size:12px;color:#374151;padding-bottom:2px;">${data.phone}</div>` : ""}
    ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#166534;text-decoration:none;">${data.email}</a></div>` : ""}
    ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#166534;text-decoration:none;">${data.website}</a></div>` : ""}
  </td></tr>
  ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const architect: Template = {
  id: "architect",
  name: "Architect",
  description: "Clean geometric with thin lines",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 65, "0");
    const socials = socialIconsHtml(data, "#374151");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;border-right:1px solid #d1d5db;">${photo}</td>` : ""}
    <td style="vertical-align:top;${photo ? "padding-left:14px;" : ""}">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px;font-weight:300;letter-spacing:2px;text-transform:uppercase;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:11px;color:#6b7280;letter-spacing:1px;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:11px;color:#9ca3af;letter-spacing:1px;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td>
          ${data.phone ? `<div style="font-size:11px;color:#6b7280;padding-bottom:1px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:11px;"><a href="mailto:${data.email}" style="color:#374151;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:11px;"><a href="${data.website}" style="color:#374151;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const wellness: Template = {
  id: "wellness",
  name: "Wellness",
  description: "Soft greens for health & wellness",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 80, "50%");
    const socials = socialIconsHtml(data, "#059669");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#064e3b;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:19px;font-weight:bold;color:#064e3b;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#059669;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#6b7280;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #a7f3d0;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#374151;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#059669;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#059669;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const marketing: Template = {
  id: "marketing",
  name: "Marketing",
  description: "Bold and attention-grabbing",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 80, "50%");
    const socials = socialIconsHtml(data, "#dc2626");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:22px;font-weight:900;color:#111827;letter-spacing:-1px;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#dc2626;font-weight:700;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#6b7280;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:3px solid #dc2626;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#374151;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#dc2626;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#dc2626;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const ocean: Template = {
  id: "ocean",
  name: "Ocean",
  description: "Deep blue tones, calm and professional",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 75, "50%");
    const socials = socialIconsHtml(data, "#2563eb");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#1e3a8a;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#1e3a8a;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#2563eb;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#64748b;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #3b82f6;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#2563eb;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const sunset: Template = {
  id: "sunset",
  name: "Sunset",
  description: "Warm orange and coral tones",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 75, "50%");
    const socials = socialIconsHtml(data, "#ea580c");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#431407;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#431407;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#ea580c;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#78716c;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #fb923c;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#57534e;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#ea580c;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#ea580c;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const mono: Template = {
  id: "mono",
  name: "Monochrome",
  description: "Pure black and white, zero color",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#000000");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Courier New',Courier,monospace;color:#000000;">
  <tr><td style="font-size:18px;font-weight:bold;letter-spacing:-0.5px;">${data.name || "Your Name"}</td></tr>
  ${data.title || data.company ? `<tr><td style="font-size:12px;color:#555555;padding-bottom:8px;">${[data.title, data.company].filter(Boolean).join(" / ")}</td></tr>` : ""}
  <tr><td style="border-top:2px solid #000000;padding-top:6px;">
    ${data.phone ? `<div style="font-size:12px;padding-bottom:1px;">${data.phone}</div>` : ""}
    ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#000000;text-decoration:none;">${data.email}</a></div>` : ""}
    ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#000000;text-decoration:none;">${data.website}</a></div>` : ""}
  </td></tr>
  ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const sidebar: Template = {
  id: "sidebar",
  name: "Sidebar",
  description: "Colored sidebar with stacked info",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 60, "50%");
    const socials = socialIconsHtml(data, "#4f46e5");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="background:#4f46e5;width:60px;vertical-align:top;text-align:center;padding:12px 8px;border-radius:6px 0 0 6px;" width="60">
      ${photo || `<div style="width:40px;height:40px;background:#6366f1;border-radius:50%;margin:0 auto;"></div>`}
    </td>
    <td style="vertical-align:top;padding:12px 16px;border:1px solid #e5e7eb;border-left:none;border-radius:0 6px 6px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#1e1b4b;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:12px;color:#4f46e5;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:12px;color:#64748b;padding-bottom:6px;">${data.company}</td></tr>` : ""}
        <tr><td>
          ${data.phone ? `<div style="font-size:11px;color:#475569;padding-bottom:1px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:11px;"><a href="mailto:${data.email}" style="color:#4f46e5;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:11px;"><a href="${data.website}" style="color:#4f46e5;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:4px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const topBanner: Template = {
  id: "top-banner",
  name: "Banner",
  description: "Header banner with name below",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#0ea5e9");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;width:100%;max-width:400px;">
  <tr><td style="background:#0c4a6e;padding:12px 16px;border-radius:6px 6px 0 0;">
    <span style="font-size:18px;font-weight:bold;color:#ffffff;">${data.name || "Your Name"}</span>
    ${data.title ? `<span style="font-size:12px;color:#7dd3fc;margin-left:8px;">${data.title}</span>` : ""}
  </td></tr>
  <tr><td style="padding:12px 16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;">
    <table cellpadding="0" cellspacing="0" border="0">
      ${data.company ? `<tr><td style="font-size:13px;font-weight:600;color:#0c4a6e;padding-bottom:6px;">${data.company}</td></tr>` : ""}
      ${data.phone ? `<tr><td style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</td></tr>` : ""}
      ${data.email ? `<tr><td style="font-size:12px;"><a href="mailto:${data.email}" style="color:#0ea5e9;text-decoration:none;">${data.email}</a></td></tr>` : ""}
      ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#0ea5e9;text-decoration:none;">${data.website}</a></td></tr>` : ""}
      ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
    </table>
  </td></tr>
</table>`;
  },
};

const techMinimal: Template = {
  id: "tech-minimal",
  name: "Tech",
  description: "Clean monospace tech aesthetic",
  pro: true,
  render: (data) => {
    const socials = socialIconsHtml(data, "#10b981");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'SF Mono','Fira Code','Courier New',monospace;color:#d1d5db;background:#111827;padding:14px 18px;border-radius:6px;">
  <tr><td style="font-size:16px;font-weight:bold;color:#10b981;">${data.name || "Your Name"}</td></tr>
  ${data.title || data.company ? `<tr><td style="font-size:12px;color:#6b7280;padding-bottom:8px;">${[data.title, data.company].filter(Boolean).join(" @ ")}</td></tr>` : ""}
  <tr><td style="border-top:1px solid #374151;padding-top:6px;">
    ${data.phone ? `<div style="font-size:11px;color:#9ca3af;">$ phone: ${data.phone}</div>` : ""}
    ${data.email ? `<div style="font-size:11px;">$ email: <a href="mailto:${data.email}" style="color:#10b981;text-decoration:none;">${data.email}</a></div>` : ""}
    ${data.website ? `<div style="font-size:11px;">$ web: <a href="${data.website}" style="color:#10b981;text-decoration:none;">${data.website}</a></div>` : ""}
  </td></tr>
  ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
</table>`;
  },
};

const education: Template = {
  id: "education",
  name: "Education",
  description: "Warm and approachable for educators",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 75, "50%");
    const socials = socialIconsHtml(data, "#d97706");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#451a03;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#78350f;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#d97706;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:13px;color:#92400e;font-weight:600;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #fbbf24;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#57534e;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#d97706;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#d97706;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const nonprofit: Template = {
  id: "nonprofit",
  name: "Nonprofit",
  description: "Warm purple for mission-driven orgs",
  pro: true,
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 70, "50%");
    const socials = socialIconsHtml(data, "#7c3aed");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#3b0764;">
  <tr>
    ${photo ? `<td style="vertical-align:top;padding-right:14px;">${photo}</td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#581c87;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:13px;color:#7c3aed;padding-bottom:2px;">${data.title}</td></tr>` : ""}
        ${data.company ? `<tr><td style="font-size:14px;font-weight:600;color:#6d28d9;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #c4b5fd;padding-top:8px;">
          ${data.phone ? `<div style="font-size:12px;color:#475569;padding-bottom:2px;">${data.phone}</div>` : ""}
          ${data.email ? `<div style="font-size:12px;"><a href="mailto:${data.email}" style="color:#7c3aed;text-decoration:none;">${data.email}</a></div>` : ""}
          ${data.website ? `<div style="font-size:12px;"><a href="${data.website}" style="color:#7c3aed;text-decoration:none;">${data.website}</a></div>` : ""}
        </td></tr>
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  },
};

export const proTemplates: Template[] = [
  executive,
  startup,
  elegant,
  boldBlock,
  healthcare,
  legal,
  realEstate,
  academia,
  consulting,
  darkMode,
  photography,
  finance,
  architect,
  wellness,
  marketing,
  ocean,
  sunset,
  mono,
  sidebar,
  topBanner,
  techMinimal,
  education,
  nonprofit,
];
