import { MobileAuditDetails, MobileAuditIssue } from '@/lib/types/lead';
import { logger } from '@/lib/logger';

export class MobileAuditService {
  /**
   * Performs an automated mobile-friendliness and responsiveness audit on a target website URL.
   * Can evaluate live HTML from the web or accept custom HTML string for verification.
   */
  static async auditUrl(targetUrl: string, htmlOverride?: string): Promise<MobileAuditDetails> {
    const issues: MobileAuditIssue[] = [];
    let html = htmlOverride || '';
    let isHttps = targetUrl.startsWith('https://');
    let reachable = true;

    // 1. Fetch HTML if not provided directly
    if (!htmlOverride && targetUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
          },
        });

        clearTimeout(timeoutId);
        isHttps = response.url.startsWith('https://');
        if (response.ok) {
          html = await response.text();
        } else {
          reachable = false;
        }
      } catch (err: unknown) {
        reachable = false;
        logger.warn('Failed to fetch URL for mobile audit, performing fallback heuristic audit', {
          url: targetUrl,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Default heuristics if website is completely unreachable / timed out
    if (!reachable && !html) {
      return {
        isMobileFriendly: false,
        mobileScore: 15,
        viewportConfigured: false,
        hasResponsiveLayout: false,
        hasMobileTapCta: false,
        isHttps,
        hasOutdatedTech: true,
        issues: [
          {
            code: 'unreachable_site',
            label: 'Website Unreachable / Slow Response',
            labelBn: 'ওয়েবসাইটটি লোড হতে ব্যর্থ হয়েছে বা সার্ভার ডাউন',
            severity: 'critical',
            detail: 'Server failed to respond within 6 seconds. Customers on mobile experience timeouts.',
            detailBn: 'মোবাইল থেকে পেজ লোড হতে অতিরিক্ত সময় নিচ্ছে বা সার্ভার কানেকশন এরর দেখাচ্ছে।',
          },
          {
            code: 'missing_viewport',
            label: 'No Mobile Optimization Detected',
            labelBn: 'কোনো মোবাইল অপ্টিমাইজেশন পাওয়া যায়নি',
            severity: 'critical',
            detail: 'No responsive viewport tag detected for modern smartphone screens.',
            detailBn: 'স্মার্টফোনের স্ক্রিনে প্রদর্শনের জন্য কোনো ভিউপোর্ট ট্যাগ সেট করা নেই।',
          },
        ],
        summary: 'Website server is unreachable or loading extremely slowly for smartphone visitors.',
        summaryBn: 'ওয়েবসাইটটি স্মার্টফোন ভিজিটরদের জন্য লোড হতে ব্যর্থ বা চরম ধীরগতির।',
        testedUrl: targetUrl,
        auditedAt: new Date().toISOString(),
      };
    }

    let mobileScore = 100;

    // 2. Viewport Meta Tag Check
    const viewportRegex = /<meta\s+[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i;
    const viewportMatch = html.match(viewportRegex);
    const viewportConfigured = Boolean(
      viewportMatch && viewportMatch[1] && viewportMatch[1].toLowerCase().includes('width=device-width')
    );

    if (!viewportConfigured) {
      mobileScore -= 35;
      issues.push({
        code: 'missing_viewport',
        label: 'Missing Mobile Viewport Meta Tag',
        labelBn: 'মোবাইল ভিউপোর্ট ট্যাগ অনুপস্থিত (স্ক্রিন ছোট দেখায়)',
        severity: 'critical',
        detail:
          'Without <meta name="viewport" content="width=device-width, initial-scale=1">, mobile browsers render a 980px wide desktop view zoomed out, making text illegibly small.',
        detailBn:
          'ভিউফোর্ট ট্যাগ না থাকায় মোবাইল স্ক্রিনে ওয়েবসাইটটি ছোট হয়ে জুম আউট অবস্থায় প্রদর্শিত হয় এবং পড়া অসম্ভব হয়ে দাঁড়ায়।',
      });
    }

    // 3. Fixed-Width Layouts / Desktop Table Structures
    const fixedWidthRegex =
      /(?:width|min-width)\s*:\s*(?:9[0-9]{2}|1[0-9]{3}|2000)px|width=["'](?:9[0-9]{2}|1[0-9]{3})["']/i;
    const hasFixedWidth = fixedWidthRegex.test(html);

    if (hasFixedWidth) {
      mobileScore -= 25;
      issues.push({
        code: 'fixed_width_layout',
        label: 'Fixed-Width Desktop Container Layout',
        labelBn: 'ফিক্সড ডেস্কটপ লেআউট (অনুভূমিক স্ক্রলিং সমস্যা)',
        severity: 'critical',
        detail:
          'Fixed desktop width containers (e.g. 960px - 1200px) force horizontal scrolling on mobile screens (< 500px), cutting off content and service details.',
        detailBn:
          'ফিক্সড উইডথ কনটেইনার ব্যবহারের কারণে মোবাইলে ডানে-বামে টেনে স্ক্রল করতে হয় এবং অনেক কন্টেন্ট ডিসপ্লের বাইরে চলে যায়।',
      });
    }

    // 4. Tap-To-Call or WhatsApp Action Button
    const hasTelLink = /href=["']tel:[^"']+["']/i.test(html);
    const hasWhatsAppLink = /href=["']https?:\/\/(?:wa\.me|api\.whatsapp\.com)[^"']*["']/i.test(html);
    const hasMobileTapCta = hasTelLink || hasWhatsAppLink;

    if (!hasMobileTapCta) {
      mobileScore -= 20;
      issues.push({
        code: 'missing_mobile_cta',
        label: 'No 1-Click Tap-to-Call or WhatsApp CTA',
        labelBn: 'মোবাইল থেকে সরাসরি কল বা হোয়াটসঅ্যাপ বাটন নেই',
        severity: 'warning',
        detail:
          'Mobile visitors must manually memorize or copy phone numbers instead of tapping an instant call or WhatsApp button.',
        detailBn:
          'মোবাইল ব্যবহারকারীদের সরাসরি কল বা হোয়াটসঅ্যাপ বুকিং করার কোনো ওয়ান-ক্লিক বাটন নেই, ফলে কাস্টমার ড্রপ হয়।',
      });
    }

    // 5. SSL / HTTPS Security
    if (!isHttps) {
      mobileScore -= 10;
      issues.push({
        code: 'insecure_http',
        label: 'Insecure Connection (No HTTPS/SSL)',
        labelBn: 'অনিরাপদ সংযোগ (SSL / HTTPS নেই)',
        severity: 'warning',
        detail: 'Mobile Chrome and Safari flag HTTP sites as "Not Secure", scaring off visitors.',
        detailBn: 'সাইটটিতে SSL সার্টিফিকেট না থাকায় মোবাইল ব্রাউজারে "Not Secure" সতর্কবার্তা দেখায়।',
      });
    }

    // 6. Outdated Legacy HTML Structures
    const legacyTagRegex = /<(?:font|center|marquee|frameset|frame|applet)\b/i;
    const hasOutdatedTech = legacyTagRegex.test(html);

    if (hasOutdatedTech) {
      mobileScore -= 15;
      issues.push({
        code: 'legacy_html_tags',
        label: 'Legacy Outdated HTML Tags & Styling',
        labelBn: 'পুরোনো ও আউটডেটেড কোডিং স্ট্রাকচার',
        severity: 'warning',
        detail: 'Deprecated HTML tags like <font>, <center>, or frames indicate code that predates mobile web standards.',
        detailBn: 'পুরোনো আমলের এইচটিএমএল কোডিং ব্যবহার করা হয়েছে যা আধুনিক স্মার্টফোনে সঠিকভাবে রেন্ডার হয় না।',
      });
    }

    // 7. Small Unreadable Text
    const smallFontRegex = /font-size\s*:\s*(?:[6-9]|1[0-1])px/i;
    if (smallFontRegex.test(html)) {
      mobileScore -= 10;
      issues.push({
        code: 'small_mobile_fonts',
        label: 'Small Font Sizes on Mobile Screens',
        labelBn: 'মোবাইলে পড়ার অনুপযোগী ছোট ফন্ট সাইজ',
        severity: 'info',
        detail: 'Font sizes below 12px require mobile users to pinch and zoom to read.',
        detailBn: '১০-১১ পিক্সেলের ছোট ফন্ট সাইজ থাকায় মোবাইল ব্যবহারকারীদের জুম না করে পড়তে সমস্যা হয়।',
      });
    }

    // Ensure score stays bounded [0, 100]
    mobileScore = Math.max(0, Math.min(100, mobileScore));

    const isMobileFriendly = mobileScore >= 70 && viewportConfigured && !hasFixedWidth;
    const hasResponsiveLayout = viewportConfigured && !hasFixedWidth;

    // Generate bilingual summaries
    const issueLabelsBn = issues.map((i) => i.labelBn).join('; ');
    const summaryBn = isMobileFriendly
      ? 'ওয়েবসাইটটি মোবাইলের জন্য মোটামুটি উপযোগী।'
      : `মোবাইল সমস্যাসমূহ: ${issueLabelsBn}। স্মার্টফোনে সাইটটি পড়তে ও বুকিং করতে সমস্যা হচ্ছে।`;

    const issueLabelsEn = issues.map((i) => i.label).join(', ');
    const summary = isMobileFriendly
      ? 'Website meets standard mobile responsiveness criteria.'
      : `Mobile issues detected: ${issueLabelsEn || 'Sub-optimal smartphone experience'}.`;

    return {
      isMobileFriendly,
      mobileScore,
      viewportConfigured,
      hasResponsiveLayout,
      hasMobileTapCta,
      isHttps,
      hasOutdatedTech,
      issues,
      summary,
      summaryBn,
      testedUrl: targetUrl,
      auditedAt: new Date().toISOString(),
    };
  }
}
