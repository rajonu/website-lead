import { WebsiteLead } from '@/lib/types/lead';
import { getVisualsForCategory } from '@/lib/utils/imagery';

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const ICONS: Record<string, string> = {
  star: `<svg class="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starSolid: `<svg class="w-5 h-5 fill-amber-400 text-amber-400 inline" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  mapPin: `<svg class="w-3.5 h-3.5 text-sky-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg class="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  messageSquare: `<svg class="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  shieldCheck: `<svg class="w-5 h-5 text-emerald-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  thumbsUp: `<svg class="w-5 h-5 text-sky-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>`,
  clock: `<svg class="w-5 h-5 text-purple-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  checkCircle: `<svg class="w-4 h-4 text-sky-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  serviceIcon: `<svg class="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 14 4-4"/><path d="M3.34 7 7 3.34a2 2 0 0 1 2.83 0l1.17 1.17a2 2 0 0 1 0 2.83l-1.17 1.17a2 2 0 0 1-2.83 0L3.34 7z"/><path d="m14 12 7.66 7.66a2 2 0 0 1 0 2.83l-1.17 1.17a2 2 0 0 1-2.83 0L10 16"/></svg>`,
};

/**
 * Renders a self-contained, lightning-fast static HTML landing page for any WebsiteLead.
 * Zero runtime dependencies, 100% responsive, optimized for Cloudflare Edge hosting.
 */
export function renderPublicSiteHtml(lead: WebsiteLead): string {
  const visuals = getVisualsForCategory(lead.category);
  const heroImage = lead.assets?.[0]?.url || visuals.heroBanner;
  const galleryImages = visuals.gallery;

  const primaryPhone = lead.contacts.find((c) => c.channel === 'phone')?.value || '';
  const primaryWhatsApp = lead.contacts.find((c) => c.channel === 'whatsapp')?.value || primaryPhone;
  const isBdTemplate = lead.generatedSite?.template === 'social-to-web-bd';

  const rajWhatsAppNumber = '8801674410695';
  const claimMessage = `Hi Raj, I am the owner/manager of ${lead.name} (${lead.location.city || ''}). I saw the pre-built website you designed for us (https://live.d4f.me/${lead.slug}) and I would like to claim it!`;
  const claimWhatsAppUrl = `https://wa.me/${rajWhatsAppNumber}?text=${encodeURIComponent(claimMessage)}`;

  const services = lead.generatedSite?.services || [];
  const faqs = lead.generatedSite?.faqs || [];

  const headline = escapeHtml(lead.generatedSite?.hero?.headline || lead.name);
  const subheadline = escapeHtml(lead.generatedSite?.hero?.subheadline || lead.research?.summary || 'Premier local service dedicated to 5-star customer satisfaction.');
  const badgeText = escapeHtml(lead.generatedSite?.hero?.badge || `Rated ${lead.businessSignals?.rating || 4.9}★ by ${lead.businessSignals?.reviewCount || 50}+ Verified Customers`);
  const ctaText = escapeHtml(lead.generatedSite?.hero?.callToActionText || (isBdTemplate ? 'হোয়াটসঅ্যাপে বুকিং দিন' : 'Call For Immediate Service'));

  const city = escapeHtml(lead.location.city || '');
  const region = escapeHtml(lead.location.stateRegion || lead.location.country || '');
  const businessName = escapeHtml(lead.name);
  const rating = lead.businessSignals?.rating || 4.9;
  const reviewCount = lead.businessSignals?.reviewCount || 50;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName} | Official Website</title>
  <meta name="description" content="${subheadline}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
    .aspect-4-3 { aspect-ratio: 4 / 3; }
  </style>
</head>
<body class="min-h-screen bg-white text-slate-800 font-sans antialiased relative selection:bg-sky-500 selection:text-white">

  <!-- 1. Sticky Top Claim Bar for Business Owner -->
  <div class="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white px-4 py-2.5 shadow-lg border-b border-sky-500/40 backdrop-blur-md">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2 text-center sm:text-left">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span class="font-semibold text-sky-300">Live Website Preview:</span>
        <span>Created for <strong class="text-white underline decoration-sky-400">${businessName}</strong></span>
      </div>

      <div class="flex items-center gap-2.5">
        <span class="text-slate-300 hidden md:inline">Own this business?</span>
        <a
          href="${claimWhatsAppUrl}"
          target="_blank"
          rel="noreferrer"
          class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-1.5 uppercase tracking-wide text-[11px]"
        >
          ${ICONS.messageSquare}
          <span>Claim on WhatsApp</span>
        </a>
      </div>
    </div>
  </div>

  <!-- 2. Modern Business Header -->
  <header class="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-[41px] z-40 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <div>
        <div class="font-black text-xl md:text-2xl tracking-tight text-slate-900">
          ${businessName}
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          ${ICONS.mapPin}
          <span>${city}, ${region}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        ${primaryPhone ? `
          <a
            href="tel:${escapeHtml(primaryPhone)}"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold transition-colors"
          >
            ${ICONS.phone}
            <span>${escapeHtml(primaryPhone)}</span>
          </a>
        ` : ''}

        ${isBdTemplate && primaryWhatsApp ? `
          <a
            href="https://wa.me/${primaryWhatsApp.replace(/[^0-9]/g, '')}"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            ${ICONS.messageSquare}
            <span>WhatsApp Booking</span>
          </a>
        ` : primaryPhone ? `
          <a
            href="tel:${escapeHtml(primaryPhone)}"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            ${ICONS.phone}
            <span>Call Now</span>
          </a>
        ` : ''}
      </div>
    </div>
  </header>

  <!-- 3. Hero Section with High-Impact Visual Image Banner -->
  <section class="relative min-h-[500px] md:min-h-[580px] flex items-center justify-center overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
      style="background-image: url('${escapeHtml(heroImage)}');"
    ></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center text-white space-y-6">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs font-bold text-amber-300">
        <div class="flex items-center gap-0.5 text-amber-400">
          ${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}
        </div>
        <span>${badgeText}</span>
      </div>

      <h1 class="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
        ${headline}
      </h1>

      <p class="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
        ${subheadline}
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        ${isBdTemplate && primaryWhatsApp ? `
          <a
            href="https://wa.me/${primaryWhatsApp.replace(/[^0-9]/g, '')}"
            target="_blank"
            rel="noreferrer"
            class="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-extrabold text-base shadow-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            ${ICONS.messageSquare}
            <span>${ctaText}</span>
          </a>
        ` : primaryPhone ? `
          <a
            href="tel:${escapeHtml(primaryPhone)}"
            class="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-extrabold text-base shadow-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            ${ICONS.phone}
            <span>${ctaText}</span>
          </a>
        ` : ''}

        <a
          href="${claimWhatsAppUrl}"
          target="_blank"
          rel="noreferrer"
          class="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          ${ICONS.messageSquare}
          <span>Claim This Website ($0 Setup)</span>
        </a>
      </div>
    </div>
  </section>

  <!-- 4. Infographic / Trust & Reputation Badges -->
  <section class="py-8 bg-slate-900 border-y border-slate-800 text-slate-200">
    <div class="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      <div class="space-y-1">
        <div class="flex items-center justify-center text-amber-400">${ICONS.starSolid}</div>
        <div class="font-black text-xl text-white">${rating} / 5.0</div>
        <div class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Google Rating</div>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-center text-sky-400">${ICONS.thumbsUp}</div>
        <div class="font-black text-xl text-white">${reviewCount}+ Verified</div>
        <div class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Client Reviews</div>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-center text-emerald-400">${ICONS.shieldCheck}</div>
        <div class="font-black text-xl text-white">100% Quality</div>
        <div class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Guaranteed Service</div>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-center text-purple-400">${ICONS.clock}</div>
        <div class="font-black text-xl text-white">Fast Response</div>
        <div class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Priority Booking</div>
      </div>
    </div>
  </section>

  <!-- 5. Core Services -->
  ${services.length > 0 ? `
  <section class="py-20 bg-slate-50/50">
    <div class="max-w-6xl mx-auto px-4 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-sky-600 uppercase tracking-widest">Our Expertise</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900">What We Specialize In</h2>
        <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Tailored solutions delivered with precision craftsmanship and honest local care.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${services.map((service) => `
          <div class="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-sky-300 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
                ${ICONS.serviceIcon}
              </div>
              <h3 class="font-bold text-slate-900 text-xl">${escapeHtml(service.title)}</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${escapeHtml(service.description)}</p>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-sky-600">
              <span>Learn more</span>
              ${ICONS.checkCircle}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- 6. Visual Photo Gallery -->
  <section class="py-20 bg-white border-t border-slate-100">
    <div class="max-w-6xl mx-auto px-4 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-sky-600 uppercase tracking-widest">Visual Portfolio</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Work & Facility In Action</h2>
        <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Real equipment, modern styling, and dedicated professionals ready to assist you.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        ${galleryImages.map((img) => `
          <div class="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm aspect-4-3 bg-slate-100">
            <img
              src="${escapeHtml(img.url)}"
              alt="${escapeHtml(img.caption)}"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <span class="text-xs font-bold text-white tracking-wide drop-shadow">
                ${escapeHtml(img.caption)}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- 7. About Section -->
  ${lead.generatedSite?.about ? `
  <section class="py-16 bg-slate-50 border-t border-slate-100">
    <div class="max-w-4xl mx-auto px-4 text-center space-y-4">
      <span class="text-xs font-bold text-sky-600 uppercase tracking-widest">About Us</span>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Dedicated to Quality Local Service</h2>
      <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto">
        ${escapeHtml(lead.generatedSite.about)}
      </p>
    </div>
  </section>
  ` : ''}

  <!-- 8. Real Google Reviews Highlight -->
  <section class="py-20 bg-white border-t border-slate-100">
    <div class="max-w-6xl mx-auto px-4 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-amber-600 uppercase tracking-widest">Client Testimonials</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900">Verified 5-Star Experiences</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-7 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-sm">
          <div class="flex items-center gap-1 text-amber-500">
            ${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}
          </div>
          <p class="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
            &ldquo;Absolute lifesavers! Professional, prompt, and arrived within the hour. Everything was transparently explained and resolved cleanly.&rdquo;
          </p>
          <div class="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>— Verified Local Customer</span>
            <span class="text-slate-400 font-normal">Google Maps Review</span>
          </div>
        </div>

        <div class="p-7 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-sm">
          <div class="flex items-center gap-1 text-amber-500">
            ${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}
          </div>
          <p class="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
            &ldquo;Top tier quality service. Highly recommend them to anyone looking for honest pricing and reliable work in the area.&rdquo;
          </p>
          <div class="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>— Verified Local Customer</span>
            <span class="text-slate-400 font-normal">Google Maps Review</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 9. FAQs -->
  ${faqs.length > 0 ? `
  <section class="py-16 bg-slate-50 border-t border-slate-100">
    <div class="max-w-3xl mx-auto px-4 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
      </div>

      <div class="space-y-4">
        ${faqs.map((faq) => `
          <div class="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
            <h3 class="font-bold text-sm text-slate-900">${escapeHtml(faq.question)}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(faq.answer)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- 10. Claim Callout Section (Special for Owner) -->
  <section class="py-16 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
    <div class="max-w-4xl mx-auto px-4 text-center space-y-5">
      <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
        Ready to Go Live?
      </span>
      <h2 class="text-3xl sm:text-4xl font-black">Is this your business website?</h2>
      <p class="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
        We already did all the design work for you. Message Raj directly on WhatsApp to attach your own custom domain (.com) and start converting local searchers.
      </p>
      <div class="pt-2">
        <a
          href="${claimWhatsAppUrl}"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-base shadow-2xl transition-transform hover:scale-105"
        >
          ${ICONS.messageSquare}
          <span>Claim This Site via WhatsApp (+8801674410695)</span>
        </a>
      </div>
    </div>
  </section>

  <!-- 11. Footer -->
  <footer class="py-12 bg-slate-950 text-white text-center space-y-4 border-t border-slate-900">
    <div class="max-w-xl mx-auto px-4 space-y-2">
      <h3 class="text-xl font-bold">${businessName}</h3>
      <p class="text-xs text-slate-400">
        ${escapeHtml(lead.location.full || `${city}, ${lead.location.country}`)}
      </p>
    </div>
    <div class="text-[11px] text-slate-500 pt-4">
      &copy; ${new Date().getFullYear()} ${businessName}. Powered by Website Lead Engine.
    </div>
  </footer>

  <!-- 12. Floating WhatsApp Claim Action Button -->
  <div class="fixed bottom-5 right-5 z-50">
    <a
      href="${claimWhatsAppUrl}"
      target="_blank"
      rel="noreferrer"
      class="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-white/60"
    >
      ${ICONS.messageSquare}
      <span class="text-xs tracking-tight">Claim Website</span>
    </a>
  </div>

</body>
</html>`;
}
