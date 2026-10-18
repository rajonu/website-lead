import { WebsiteLead } from '@/lib/types/lead';

export function generatePersonalOutreachDraft(lead: WebsiteLead): string {
  const market = lead.experiment?.market || lead.location.country;
  const isBd = market === 'BD' || market.includes('Bangladesh');
  const rating = lead.businessSignals?.rating || 4.8;
  const reviews = lead.businessSignals?.reviewCount || 30;
  const previewUrl = `https://live.d4f.me/preview/${lead.slug}`;

  if (isBd) {
    return `আসসালামু আলাইকুম ${lead.name} টিম! 🌸

গুগল ম্যাপসে ${lead.location.city}-তে আপনাদের বিজনেসের ${reviews}+ চমৎকার রিভিউ এবং ${rating}★ রেটিং দেখে খুব ভালো লাগলো।

লক্ষ্য করলাম গুগলে আপনাদের কোনো অফিসিয়াল ওয়েবসাইট লিংক করা নেই। ফলে অনেক কাস্টমার সার্ভিস ও রেটকার্ড দেখতে গিয়ে মিস করে যেতে পারেন।

আপনাদের ক্লায়েন্ট রিভিউ ও সার্ভিসগুলো দিয়ে আমরা সুন্দর একটি মোবাইল ওয়েবসাইট ডেমো বানিয়েছি:
👉 ${previewUrl}

ফোনে ওপেন করে দেখুন, সরাসরি WhatsApp বুকিং বাটনও যুক্ত করা আছে। ভালো লাগলে এটা আপনাদের নিজস্ব ডোমেইনে খুব সহজে লাইভ করে দেওয়া যাবে।

ধন্যবাদ,
রাজ | Web Developer
WhatsApp: +8801674410695`;
  }

  if (market === 'UK') {
    return `Hi ${lead.name} team,

I came across your business on Google Maps in ${lead.location.city} and saw your brilliant ${rating}★ rating with ${reviews} reviews. Huge congratulations on the reputation you've built!

I noticed your Google profile doesn't have an official website listed, which often means mobile users looking for urgent trades might hesitate before ringing.

I went ahead and designed a clean, mobile-first one-page preview for you with instant call buttons and your top reviews:
👉 ${previewUrl}

Have a quick look on your phone when you have a minute. If you fancy making it your official site, I'd be happy to set it up on your own domain. No obligation at all!

Best regards,
Raj
Web Developer | raj@d4f.me`;
  }

  // Default: US
  return `Hi ${lead.name} team,

I was looking at local ${lead.category} services in ${lead.location.city} and noticed your impressive ${rating}-star rating with over ${reviews} customer reviews on Google Maps. Congratulations on building such a strong local reputation!

I noticed that your Google Business Profile currently has no official website attached. When homeowners look for local services on mobile, having a fast site with click-to-call makes a huge difference.

To show what a clean mobile site would look like for you, our studio built a modern one-page preview loaded with your real reviews and services:
👉 ${previewUrl}

You can claim this website on your own custom domain whenever you'd like.

Would you be open to a quick email exchange if you'd like to make this your official web home?

Best regards,
Raj
Web Developer | raj@d4f.me`;
}
