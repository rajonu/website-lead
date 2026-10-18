import { notFound } from 'next/navigation';
import { LeadRepository } from '@/lib/db';
import { getVisualsForCategory } from '@/lib/utils/imagery';
import { 
  Star, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  Droplet,
  Flame,
  Wind,
  Scissors,
  Heart,
  Award,
  Clock,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';

export const revalidate = 0;

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lead = await LeadRepository.getLeadBySlug(slug);

  if (!lead) {
    notFound();
  }

  const visuals = getVisualsForCategory(lead.category);
  const heroImage = lead.assets?.[0]?.url || visuals.heroBanner;
  const galleryImages = visuals.gallery;

  const primaryPhone = lead.contacts.find((c) => c.channel === 'phone')?.value || '';
  const primaryWhatsApp = lead.contacts.find((c) => c.channel === 'whatsapp')?.value || primaryPhone;
  const isBdTemplate = lead.generatedSite?.template === 'social-to-web-bd';

  // Raj's Direct WhatsApp link for claiming the website
  const rajWhatsAppNumber = '8801674410695';
  const claimMessage = `Hi Raj, I am the owner/manager of ${lead.name} (${lead.location.city}). I saw the pre-built website you designed for us (https://lead.d4f.me/preview/${lead.slug}) and I would like to claim it!`;
  const claimWhatsAppUrl = `https://wa.me/${rajWhatsAppNumber}?text=${encodeURIComponent(claimMessage)}`;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased relative selection:bg-sky-500 selection:text-white">
      {/* 1. Sticky Top Claim Bar for Business Owner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white px-4 py-2.5 shadow-lg border-b border-sky-500/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-sky-300">Live Website Preview:</span>
            <span>Created for <strong className="text-white underline decoration-sky-400">{lead.name}</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-slate-300 hidden md:inline">Own this business?</span>
            <a
              href={claimWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-1.5 uppercase tracking-wide text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>Claim on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Modern Business Header */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-[41px] z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="font-black text-xl md:text-2xl tracking-tight text-slate-900">
              {lead.name}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>{lead.location.city}, {lead.location.stateRegion || lead.location.country}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone}`}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>{primaryPhone}</span>
              </a>
            )}

            {isBdTemplate && primaryWhatsApp ? (
              <a
                href={`https://wa.me/${primaryWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Booking</span>
              </a>
            ) : primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {/* 3. Hero Section with High-Impact Visual Image Banner */}
      <section className="relative min-h-[500px] md:min-h-[580px] flex items-center justify-center overflow-hidden">
        {/* Background Visual with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center text-white space-y-6">
          {/* Social Proof Review Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs font-bold text-amber-300">
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span>{lead.generatedSite?.hero?.badge || `Rated ${lead.businessSignals?.rating}★ by ${lead.businessSignals?.reviewCount}+ Verified Customers`}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {lead.generatedSite?.hero?.headline || lead.name}
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {lead.generatedSite?.hero?.subheadline || lead.research?.summary}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isBdTemplate && primaryWhatsApp ? (
              <a
                href={`https://wa.me/${primaryWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-extrabold text-base shadow-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
                <span>{lead.generatedSite?.hero?.callToActionText || 'WhatsApp-এ স্লট বুক করুন'}</span>
              </a>
            ) : primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-extrabold text-base shadow-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 fill-white" />
                <span>{lead.generatedSite?.hero?.callToActionText || 'Call For Immediate Service'}</span>
              </a>
            ) : null}

            {/* Direct WhatsApp Claim Button */}
            <a
              href={claimWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Claim This Website ($0 Setup)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Infographic / Trust & Reputation Badges */}
      <section className="py-8 bg-slate-900 border-y border-slate-800 text-slate-200">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="font-black text-xl text-white">{lead.businessSignals?.rating || 4.9} / 5.0</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Google Rating</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-sky-400">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div className="font-black text-xl text-white">{lead.businessSignals?.reviewCount || 50}+ Verified</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Client Reviews</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-black text-xl text-white">100% Quality</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Guaranteed Service</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-black text-xl text-white">Fast Response</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Priority Booking</div>
          </div>
        </div>
      </section>

      {/* 5. Core Services */}
      {lead.generatedSite?.services && lead.generatedSite.services.length > 0 && (
        <section className="py-20 bg-slate-50/50">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Our Expertise</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What We Specialize In</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Tailored solutions delivered with precision craftsmanship and honest local care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lead.generatedSite.services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
                      {service.icon === 'scissors' ? <Scissors className="w-6 h-6" /> :
                       service.icon === 'droplet' ? <Droplet className="w-6 h-6" /> :
                       service.icon === 'flame' ? <Flame className="w-6 h-6" /> :
                       service.icon === 'wind' ? <Wind className="w-6 h-6" /> :
                       service.icon === 'heart' ? <Heart className="w-6 h-6" /> :
                       <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-xl">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-sky-600">
                    <span>Learn more</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. High-Quality Visual Photo Gallery / Showcase */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Visual Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Work & Facility In Action</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Real equipment, modern styling, and dedicated professionals ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm aspect-4/3 bg-slate-100"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-bold text-white tracking-wide drop-shadow">
                    {img.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. About the Business */}
      {lead.generatedSite?.about && (
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">About Us</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dedicated to Quality Local Service</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto">
              {lead.generatedSite.about}
            </p>
          </div>
        </section>
      )}

      {/* 8. Real Google Reviews Highlight */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Client Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Verified 5-Star Experiences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Absolute lifesavers! Professional, prompt, and arrived within the hour. Everything was transparently explained and resolved cleanly.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>— Verified Local Customer</span>
                <span className="text-slate-400 font-normal">Google Maps Review</span>
              </div>
            </div>

            <div className="p-7 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Top tier quality service. Highly recommend them to anyone looking for honest pricing and reliable work in the area.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>— Verified Local Customer</span>
                <span className="text-slate-400 font-normal">Google Maps Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQs */}
      {lead.generatedSite?.faqs && lead.generatedSite.faqs.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {lead.generatedSite.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Claim Callout Section (Special for Owner) */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Ready to Go Live?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">Is this your business website?</h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            We already did all the design work for you. Message Raj directly on WhatsApp to attach your own custom domain (.com) and start converting local searchers.
          </p>
          <div className="pt-2">
            <a
              href={claimWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-base shadow-2xl transition-transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>Claim This Site via WhatsApp (+8801674410695)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="py-12 bg-slate-950 text-white text-center space-y-4 border-t border-slate-900">
        <div className="max-w-xl mx-auto px-4 space-y-2">
          <h3 className="text-xl font-bold">{lead.name}</h3>
          <p className="text-xs text-slate-400">
            {lead.location.full || `${lead.location.city}, ${lead.location.country}`}
          </p>
        </div>
        <div className="text-[11px] text-slate-500 pt-4">
          © {new Date().getFullYear()} {lead.name}. Powered by Website Lead Engine.
        </div>
      </footer>

      {/* 12. Floating WhatsApp Claim Action Button (Always on screen) */}
      <div className="fixed bottom-5 right-5 z-50">
        <a
          href={claimWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-white/60"
        >
          <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
          <span className="text-xs tracking-tight">Claim Website</span>
        </a>
      </div>
    </div>
  );
}
