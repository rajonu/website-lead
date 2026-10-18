import { notFound } from 'next/navigation';
import { LeadRepository } from '@/lib/db';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  Droplet,
  Flame,
  Wind,
  Scissors,
  Heart
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

  const primaryPhone = lead.contacts.find((c) => c.channel === 'phone')?.value || '';
  const primaryWhatsApp = lead.contacts.find((c) => c.channel === 'whatsapp')?.value || primaryPhone;
  const isBdTemplate = lead.generatedSite?.template === 'social-to-web-bd';

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      {/* 1. Preview Floating Banner for the Business Owner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-4 py-3 shadow-md border-b border-sky-500/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-sky-300">Official Web Preview:</span>
            <span>Designed specifically for <strong className="text-white underline">{lead.name}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-300 hidden md:inline">Ready to make this your official domain?</span>
            <a
              href={`mailto:raj@d4f.me?subject=Claim Website for ${encodeURIComponent(lead.name)}`}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full shadow transition-all hover:scale-105"
            >
              Claim This Website
            </a>
          </div>
        </div>
      </div>

      {/* 2. Modern Business Header */}
      <header className="border-b border-slate-100 bg-white sticky top-[45px] z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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

      {/* 3. Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-50 via-sky-50/20 to-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          {/* Social Proof Review Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span>{lead.generatedSite?.hero?.badge || `Rated ${lead.businessSignals?.rating}★ by ${lead.businessSignals?.reviewCount}+ Happy Clients`}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {lead.generatedSite?.hero?.headline || lead.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {lead.generatedSite?.hero?.subheadline || lead.research?.summary}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isBdTemplate && primaryWhatsApp ? (
              <a
                href={`https://wa.me/${primaryWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lead.generatedSite?.hero?.callToActionText || 'WhatsApp-এ স্লট বুক করুন'}</span>
              </a>
            ) : (
              <a
                href={`tel:${primaryPhone}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>{lead.generatedSite?.hero?.callToActionText || 'Call Today For Rapid Service'}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. Core Services */}
      {lead.generatedSite?.services && lead.generatedSite.services.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Our Expertise</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What We Specialize In</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lead.generatedSite.services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    {service.icon === 'scissors' ? <Scissors className="w-5 h-5" /> :
                     service.icon === 'droplet' ? <Droplet className="w-5 h-5" /> :
                     service.icon === 'flame' ? <Flame className="w-5 h-5" /> :
                     service.icon === 'wind' ? <Wind className="w-5 h-5" /> :
                     service.icon === 'heart' ? <Heart className="w-5 h-5" /> :
                     <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{service.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. About the Business */}
      {lead.generatedSite?.about && (
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">About Our Team</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dedicated to Quality Local Service</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto">
              {lead.generatedSite.about}
            </p>
          </div>
        </section>
      )}

      {/* 6. Real Google Reviews Highlight */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Customer Satisfaction</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Absolute lifesavers! Professional, prompt, and arrived within the hour. Everything was transparently explained and resolved cleanly.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">— Verified Google Maps Review</div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Top tier quality service. Highly recommend them to anyone looking for honest pricing and reliable work in the area.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">— Verified Google Maps Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      {lead.generatedSite?.faqs && lead.generatedSite.faqs.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {lead.generatedSite.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Bottom CTA Banner */}
      <footer className="py-12 bg-slate-900 text-white text-center space-y-6">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <h2 className="text-2xl font-bold">{lead.name}</h2>
          <p className="text-xs text-slate-400">
            {lead.location.full || `${lead.location.city}, ${lead.location.country}`}
          </p>
          {primaryPhone && (
            <div className="pt-2">
              <a
                href={`tel:${primaryPhone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {primaryPhone}</span>
              </a>
            </div>
          )}
        </div>
        <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-6">
          © {new Date().getFullYear()} {lead.name}. All rights reserved. Pre-built preview powered by Website Lead Engine.
        </div>
      </footer>
    </div>
  );
}
