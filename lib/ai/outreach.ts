import { WebsiteLead } from '@/lib/types/lead';

export const RAJ_OFFICIAL_SIGNATURE = `Best Regards,
Raj Syful — Senior Web Developer
[Top Rated Plus Freelancer | Upwork Inc.](https://www.upwork.com/freelancers/~0198d6650c592b6bc2?p=1494224534121791488)
----------------------------------------------------------------------
🌐 [www.d4f.me](https://d4f.me/) | ✉️ [raj@d4f.me](mailto:raj@d4f.me) | 💬 [WhatsApp](https://wa.me/8801674410695) | ✈️ [Telegram](https://telegram.me/rajsyful)
📞 +8801719647717 | 💼 [LinkedIn](https://www.linkedin.com/in/syful-i-70788581/)
A Passionate ♡ Web-Developer`;

export const RAJ_OFFICIAL_SIGNATURE_BD = `ধন্যবাদ ও শুভেচ্ছা,
Raj Syful — Senior Web Developer
[Top Rated Plus Freelancer | Upwork Inc.](https://www.upwork.com/freelancers/~0198d6650c592b6bc2?p=1494224534121791488)
----------------------------------------------------------------------
🌐 [www.d4f.me](https://d4f.me/) | ✉️ [raj@d4f.me](mailto:raj@d4f.me) | 💬 [WhatsApp](https://wa.me/8801674410695) | ✈️ [Telegram](https://telegram.me/rajsyful)
📞 +8801719647717 | 💼 [LinkedIn](https://www.linkedin.com/in/syful-i-70788581/)
A Passionate ♡ Web-Developer`;

export function generatePersonalOutreachDraft(lead: WebsiteLead): string {
  const market = lead.experiment?.market || lead.location.country;
  const isBd = market === 'BD' || market.includes('Bangladesh');
  const rating = lead.businessSignals?.rating || 4.8;
  const reviews = lead.businessSignals?.reviewCount || 30;
  const previewUrl = `https://live.d4f.me/preview/${lead.slug}`;
  const existingWebsite = lead.website?.url;
  const mobileAudit = lead.website?.mobileAudit;

  if (isBd) {
    if (existingWebsite) {
      const topIssue =
        mobileAudit?.issues?.[0]?.labelBn ||
        'মোবাইল স্ক্রিনে সাইটটি ছোট দেখায় এবং সরাসরি কল বা WhatsApp বুকিং বাটন নেই';

      return `আসসালামু আলাইকুম ${lead.name} টিম! 🌸

গুগল ম্যাপসে ${lead.location.city}-তে আপনাদের বিজনেসের ${reviews}+ চমৎকার রিভিউ এবং ${rating}★ রেটিং দেখে যোগাযোগ করলাম।

আপনাদের বর্তমান ওয়েবসাইটটি (${existingWebsite}) মোবাইল থেকে ভিজিট করে দেখলাম যে স্মার্টফোনে এটি দেখতে ও ব্যবহার করতে বেশ সমস্যা হচ্ছে (${topIssue})। বর্তমান সময়ে ৮০%+ কাস্টমার সরাসরি স্মার্টফোন থেকে সার্ভিস খোঁজেন।

আপনাদের আসল রিভিউ ও সার্ভিসগুলো দিয়ে আমরা সম্পূর্ণ নতুন একটি সুপারফাস্ট ও মোবাইল-ফ্রেন্ডলি লাইভ ডেমো বানিয়েছি:
👉 ${previewUrl}

ফোনে ওপেন করে দেখুন, সরাসরি ১-ক্লিকে WhatsApp বুকিং ও কল বাটন যুক্ত করা আছে। কোনো অগ্রিম ফি ছাড়া বা অত্যন্ত সুলভ খরচে আমরা এটি আপনাদের নিজস্ব ডোমেইনে আধুনিকায়ন করে দিতে পারি।

${RAJ_OFFICIAL_SIGNATURE_BD}`;
    }

    return `আসসালামু আলাইকুম ${lead.name} টিম! 🌸

গুগল ম্যাপসে ${lead.location.city}-তে আপনাদের বিজনেসের ${reviews}+ চমৎকার রিভিউ এবং ${rating}★ রেটিং দেখে খুব ভালো লাগলো।

লক্ষ্য করলাম গুগলে আপনাদের কোনো অফিসিয়াল ওয়েবসাইট লিংক করা নেই। ফলে অনেক কাস্টমার সার্ভিস ও রেটকার্ড দেখতে গিয়ে মিস করে যেতে পারেন।

আপনাদের ক্লায়েন্ট রিভিউ ও সার্ভিসগুলো দিয়ে আমরা সুন্দর একটি মোবাইল ওয়েবসাইট ডেমো বানিয়েছি:
👉 ${previewUrl}

ফোনে ওপেন করে দেখুন, সরাসরি WhatsApp বুকিং বাটনও যুক্ত করা আছে। ভালো লাগলে এটা আপনাদের নিজস্ব ডোমেইনে খুব সহজে লাইভ করে দেওয়া যাবে।

${RAJ_OFFICIAL_SIGNATURE_BD}`;
  }

  if (market === 'UK') {
    return `Hi ${lead.name} team,

I came across your business on Google Maps in ${lead.location.city} and saw your brilliant ${rating}★ rating with ${reviews} reviews. Huge congratulations on the reputation you've built!

I noticed your Google profile doesn't have an official website listed, which often means mobile users looking for urgent trades might hesitate before ringing.

I went ahead and designed a clean, mobile-first one-page preview for you with instant call buttons and your top reviews:
👉 ${previewUrl}

Have a quick look on your phone when you have a minute. If you fancy making it your official site, I'd be happy to set it up on your own domain. No obligation at all!

${RAJ_OFFICIAL_SIGNATURE}`;
  }

  // Default: US
  return `Hi ${lead.name} team,

I was looking at local ${lead.category} services in ${lead.location.city} and noticed your impressive ${rating}-star rating with over ${reviews} customer reviews on Google Maps. Congratulations on building such a strong local reputation!

I noticed that your Google Business Profile currently has no official website attached. When homeowners look for local services on mobile, having a fast site with click-to-call makes a huge difference.

To show what a clean mobile site would look like for you, our studio built a modern one-page preview loaded with your real reviews and services:
👉 ${previewUrl}

You can claim this website on your own custom domain whenever you'd like.

Would you be open to a quick email exchange if you'd like to make this your official web home?

${RAJ_OFFICIAL_SIGNATURE}`;
}

export function getEmailSubject(lead: WebsiteLead): string {
  const market = lead.experiment?.market || lead.location.country;
  const isBd = market === 'BD' || market.includes('Bangladesh');
  if (isBd) {
    if (lead.website?.url) {
      return `${lead.name}-এর ওয়েবসাইটের জন্য আধুনিক মোবাইল-ফ্রেন্ডলি আপডেট`;
    }
    return `${lead.name}-এর জন্য একটি আধুনিক ওয়েবসাইট প্রিভিউ`;
  }
  return `Website preview for ${lead.name}`;
}

export function splitBodyAndSignature(draft: string, isBd = false): { body: string; signature: string } {
  const sigMarker = isBd ? 'ধন্যবাদ ও শুভেচ্ছা,' : 'Best Regards,';
  const defaultSig = isBd ? RAJ_OFFICIAL_SIGNATURE_BD : RAJ_OFFICIAL_SIGNATURE;

  if (draft.includes(sigMarker)) {
    const parts = draft.split(sigMarker);
    return {
      body: parts[0].trim(),
      signature: defaultSig,
    };
  }

  if (draft.includes('Best Regards,')) {
    const parts = draft.split('Best Regards,');
    return {
      body: parts[0].trim(),
      signature: RAJ_OFFICIAL_SIGNATURE,
    };
  }

  if (draft.includes('ধন্যবাদ ও শুভেচ্ছা,')) {
    const parts = draft.split('ধন্যবাদ ও শুভেচ্ছা,');
    return {
      body: parts[0].trim(),
      signature: RAJ_OFFICIAL_SIGNATURE_BD,
    };
  }

  return {
    body: draft.trim(),
    signature: defaultSig,
  };
}

export function formatEmailPreviewHtml(textContent: string): string {
  let safe = textContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Convert dashed divider lines into styled hr
  safe = safe.replace(/^-{5,}$/gm, '<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 14px 0;" />');

  // Convert markdown links [Label](url) into clickable styled <a> tags
  safe = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: underline;">$1</a>'
  );

  return safe;
}

/**
 * Generates a short, high-converting, personalized WhatsApp outreach message.
 * Optimized specifically for chat readability on mobile.
 */
export function generateWhatsAppTemplate(lead: WebsiteLead): string {
  const market = lead.experiment?.market || lead.location?.country || '';
  const isBd = market === 'BD' || market.includes('Bangladesh');
  const city = lead.location?.city || '';
  const rating = lead.businessSignals?.rating || 4.9;
  const previewUrl = `https://live.d4f.me/${lead.slug}`;
  const existingWebsite = lead.website?.url;

  if (isBd) {
    if (existingWebsite) {
      return `আসসালামু আলাইকুম ${lead.name} টিম,

গুগল ম্যাপসে আপনাদের দারুণ রিভিউ (${rating}★) দেখে যোগাযোগ করলাম।

আপনাদের বর্তমান ওয়েবসাইট (${existingWebsite}) ফোনে ভিজিট করে দেখলাম মোবাইলে স্ক্রিন ছোট হয়ে আসে ও সরাসরি কল/WhatsApp বুকিং বাটন নেই। তাই আপনাদের আসল রিভিউ ও সার্ভিস দিয়ে নতুন একটি আধুনিক ও দ্রুতগতির মোবাইল ডেমো বানিয়েছি:
👉 ${previewUrl}

ফোনে যেকোনো সময় একটু দেখে নিবেন। কোনো অগ্রিম ফি ছাড়া বা অত্যন্ত সুলভ খরচে আপনাদের সাইটটি এভাবে স্মার্টফোনের উপযোগী করে দেওয়া যাবে। কেমন লাগলো জানাবেন!

ধন্যবাদ,
Raj Syful — Senior Web Developer (https://d4f.me)`;
    }

    return `আসসালামু আলাইকুম ${lead.name} টিম,

গুগল ম্যাপসে ${city ? city + '-তে ' : ''}আপনাদের দারুণ রিভিউ (${rating}★) দেখে যোগাযোগ করলাম।

লক্ষ্য করলাম অনলাইনে সরাসরি বুকিং নেওয়ার জন্য আপনাদের কোনো মোবাইল ওয়েবসাইট নেই। তাই আপনাদের জন্য একটি ফ্রি লাইভ ডেমো বানিয়েছি:
👉 ${previewUrl}

ফোনে যেকোনো সময় একটু দেখে নিবেন। আপনাদের ব্যবসার জন্য এটি কাজে লাগাতে চাইলে বা কোনো পরিবর্তন চাইলে জানাবেন!

ধন্যবাদ,
Raj Syful — Senior Web Developer (https://d4f.me)`;
  }

  return `Hi ${lead.name} team,

I saw your great reviews on Google Maps${city ? ' in ' + city : ''} (${rating}★) and noticed you don't have a mobile site for booking yet.

So I built a free live demo preview for you:
👉 ${previewUrl}

Take a look on your phone whenever you have a minute! If you'd like to use this for your business or customize anything, feel free to reply here.

Best regards,
Raj Syful — Senior Web Developer (https://d4f.me)`;
}



