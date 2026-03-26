export interface SignatureData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  photoUrl: string;
  linkedin: string;
  twitter: string;
  github: string;
  instagram: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  pro?: boolean;
  render: (data: SignatureData) => string;
}

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

function photoHtml(
  url: string,
  size: number,
  borderRadius: string = "50%"
): string {
  if (!url) return "";
  return `<img src="${url}" alt="Photo" width="${size}" height="${size}" style="border-radius:${borderRadius};display:block;" />`;
}

function moltcorpBranding(): string {
  return `<tr><td style="padding-top:10px;"><a href="https://moltcorp.com" style="color:#999999;text-decoration:none;font-size:10px;font-family:Arial,sans-serif;">Made with Email Signature Generator by Moltcorp</a></td></tr>`;
}

const professional: Template = {
  id: "professional",
  name: "Professional",
  description: "Clean and corporate with a horizontal divider",
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 80);
    const socials = socialIconsHtml(data, "#0066cc");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#333333;">
  <tr>
    <td style="vertical-align:top;padding-right:15px;">
      ${photo}
    </td>
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:bold;color:#1a1a1a;padding-bottom:2px;">${data.name || "Your Name"}</td></tr>
        ${data.title || data.company ? `<tr><td style="font-size:13px;color:#666666;padding-bottom:8px;">${[data.title, data.company].filter(Boolean).join(" | ")}</td></tr>` : ""}
        <tr><td style="border-top:2px solid #0066cc;padding-top:8px;">
          <table cellpadding="0" cellspacing="0" border="0">
            ${data.phone ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:3px;">Phone: ${data.phone}</td></tr>` : ""}
            ${data.email ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:3px;">Email: <a href="mailto:${data.email}" style="color:#0066cc;text-decoration:none;">${data.email}</a></td></tr>` : ""}
            ${data.website ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:3px;">Web: <a href="${data.website}" style="color:#0066cc;text-decoration:none;">${data.website}</a></td></tr>` : ""}
          </table>
        </td></tr>
        ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
        ${moltcorpBranding()}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const minimal: Template = {
  id: "minimal",
  name: "Minimal",
  description: "Just the essentials, no frills",
  render: (data) => {
    const contactParts: string[] = [];
    if (data.phone) contactParts.push(data.phone);
    if (data.email)
      contactParts.push(
        `<a href="mailto:${data.email}" style="color:#555555;text-decoration:none;">${data.email}</a>`
      );
    if (data.website)
      contactParts.push(
        `<a href="${data.website}" style="color:#555555;text-decoration:none;">${data.website}</a>`
      );
    const socials = socialIconsHtml(data, "#555555");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#333333;">
  <tr><td style="font-size:16px;font-weight:bold;color:#111111;">${data.name || "Your Name"}</td></tr>
  ${data.title || data.company ? `<tr><td style="font-size:12px;color:#777777;padding-bottom:6px;">${[data.title, data.company].filter(Boolean).join(", ")}</td></tr>` : ""}
  ${contactParts.length > 0 ? `<tr><td style="font-size:12px;color:#555555;padding-top:4px;">${contactParts.join(" &middot; ")}</td></tr>` : ""}
  ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
  ${moltcorpBranding()}
</table>`;
  },
};

const modern: Template = {
  id: "modern",
  name: "Modern",
  description: "Bold name with colored accent bar",
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 70, "8px");
    const socials = socialIconsHtml(data, "#6366f1");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="background:#6366f1;width:4px;border-radius:4px;" width="4"></td>
    <td style="padding-left:14px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:12px;">${photo}</td>` : ""}
          <td style="vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-size:20px;font-weight:bold;color:#1e1b4b;letter-spacing:-0.5px;">${data.name || "Your Name"}</td></tr>
              ${data.title ? `<tr><td style="font-size:13px;color:#6366f1;font-weight:600;padding-bottom:2px;">${data.title}</td></tr>` : ""}
              ${data.company ? `<tr><td style="font-size:12px;color:#64748b;padding-bottom:8px;">${data.company}</td></tr>` : ""}
              ${data.phone ? `<tr><td style="font-size:12px;color:#334155;">${data.phone}</td></tr>` : ""}
              ${data.email ? `<tr><td style="font-size:12px;"><a href="mailto:${data.email}" style="color:#6366f1;text-decoration:none;">${data.email}</a></td></tr>` : ""}
              ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#6366f1;text-decoration:none;">${data.website}</a></td></tr>` : ""}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td></td>
    <td style="padding-left:14px;">
      ${socials ? `<div style="padding-top:8px;">${socials}</div>` : ""}
      <table cellpadding="0" cellspacing="0" border="0">${moltcorpBranding()}</table>
    </td>
  </tr>
</table>`;
  },
};

const creative: Template = {
  id: "creative",
  name: "Creative",
  description: "Colorful with personality and a gradient accent",
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 85, "50%");
    const socials = socialIconsHtml(data, "#e11d48");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="vertical-align:top;text-align:center;padding-right:16px;">
      ${photo}
      ${data.name ? `<div style="font-size:16px;font-weight:bold;color:#1a1a2e;padding-top:8px;white-space:nowrap;">${data.name}</div>` : ""}
      ${data.title ? `<div style="font-size:11px;color:#e11d48;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${data.title}</div>` : ""}
    </td>
    <td style="border-left:3px solid #e11d48;padding-left:16px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        ${data.company ? `<tr><td style="font-size:14px;font-weight:bold;color:#1a1a2e;padding-bottom:8px;">${data.company}</td></tr>` : ""}
        ${data.phone ? `<tr><td style="font-size:12px;color:#444444;padding-bottom:3px;">&#9742; ${data.phone}</td></tr>` : ""}
        ${data.email ? `<tr><td style="font-size:12px;padding-bottom:3px;">&#9993; <a href="mailto:${data.email}" style="color:#e11d48;text-decoration:none;">${data.email}</a></td></tr>` : ""}
        ${data.website ? `<tr><td style="font-size:12px;padding-bottom:3px;">&#127760; <a href="${data.website}" style="color:#e11d48;text-decoration:none;">${data.website}</a></td></tr>` : ""}
        ${socials ? `<tr><td style="padding-top:6px;">${socials}</td></tr>` : ""}
        ${moltcorpBranding()}
      </table>
    </td>
  </tr>
</table>`;
  },
};

const corporate: Template = {
  id: "corporate",
  name: "Corporate",
  description: "Traditional and formal with company emphasis",
  render: (data) => {
    const photo = photoHtml(data.photoUrl, 60, "4px");
    const socials = socialIconsHtml(data, "#1e3a5f");
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;color:#1e3a5f;">
  <tr>
    <td colspan="2" style="border-bottom:3px solid #1e3a5f;padding-bottom:8px;">
      ${data.company ? `<span style="font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">${data.company}</span>` : ""}
    </td>
  </tr>
  <tr>
    <td style="padding-top:10px;vertical-align:top;padding-right:12px;">
      ${photo}
    </td>
    <td style="padding-top:10px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:15px;font-weight:bold;color:#1e3a5f;">${data.name || "Your Name"}</td></tr>
        ${data.title ? `<tr><td style="font-size:12px;color:#4a6a8a;font-style:italic;padding-bottom:6px;">${data.title}</td></tr>` : ""}
        ${data.phone ? `<tr><td style="font-size:12px;color:#1e3a5f;padding-bottom:2px;">T: ${data.phone}</td></tr>` : ""}
        ${data.email ? `<tr><td style="font-size:12px;padding-bottom:2px;"><a href="mailto:${data.email}" style="color:#1e3a5f;text-decoration:none;">E: ${data.email}</a></td></tr>` : ""}
        ${data.website ? `<tr><td style="font-size:12px;"><a href="${data.website}" style="color:#1e3a5f;text-decoration:none;">W: ${data.website}</a></td></tr>` : ""}
      </table>
    </td>
  </tr>
  ${socials ? `<tr><td colspan="2" style="padding-top:8px;">${socials}</td></tr>` : ""}
  <tr><td colspan="2">${`<table cellpadding="0" cellspacing="0" border="0">${moltcorpBranding()}</table>`}</td></tr>
</table>`;
  },
};

export const templates: Template[] = [
  professional,
  minimal,
  modern,
  creative,
  corporate,
];
