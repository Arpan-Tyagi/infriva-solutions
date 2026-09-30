import { Reveal } from "@/components/ui/Reveal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Infriva Solutions",
  description: "Learn how Infriva Solutions collects, uses, and protects your personal data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12 bg-white selection:bg-brand-900 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900 uppercase">Legal</span>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8">
            Privacy Policy
          </h1>
          <p className="text-lg text-black/60 mb-16 font-sans">
            Effective Date: October 2026
          </p>
        </Reveal>
        
        <Reveal delay={0.2}>
          <div className="prose prose-lg prose-neutral max-w-none text-black/80 font-sans leading-[1.6]">
            <p className="mb-8">
              At <strong>Infriva Solutions</strong> ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, process, and safeguard the data you provide to us when you visit our website, use our AI chatbot, interact with our Meta (WhatsApp/Messenger) integrations, or engage our digital architecture services.
            </p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">1. Information We Collect</h2>
            <p className="mb-4">We collect information that you voluntarily provide to us, as well as data gathered automatically when you interact with our digital systems:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Personal Identification Data:</strong> Name, email address, phone number, and company details provided via our contact forms.</li>
              <li><strong>Conversational Data:</strong> Transcripts of interactions with our Gemini-powered AI chatbot and Meta webhooks (WhatsApp/Messenger) to improve response quality and context.</li>
              <li><strong>Usage & Analytics Data:</strong> IP addresses, browser types, device information, and interaction events tracked via PostHog to optimize UI/UX performance.</li>
            </ul>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">2. How We Use Your Data</h2>
            <p className="mb-4">The information we collect is strictly utilized to operate our business and deliver premium digital services. Specifically, we use your data to:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Design, develop, and deploy your custom CRM systems and web architectures.</li>
              <li>Respond to your inquiries via our automated AI systems and human sales representatives.</li>
              <li>Analyze website traffic and identify UI/UX bottlenecks using PostHog analytics.</li>
              <li>Send critical project updates, legal notices, and marketing communications (which you can opt out of at any time).</li>
            </ul>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">3. AI and Third-Party Integrations</h2>
            <p className="mb-4">To provide cutting-edge automated services, we integrate with secure third-party platforms. Your data may be processed by these services strictly under our instruction:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Google Gemini AI:</strong> Chatbot inputs are processed by Gemini AI to generate conversational responses. Sensitive personal information should not be shared with the public chatbot.</li>
              <li><strong>Meta Platforms (WhatsApp/Messenger):</strong> Messages sent to our business accounts are processed via secure Meta Webhooks.</li>
              <li><strong>Supabase:</strong> Our primary database infrastructure. All data is encrypted at rest and in transit using PostgreSQL industry standards.</li>
            </ul>
            <p className="mb-8">We <strong>do not sell</strong>, rent, or trade your personal information to third-party data brokers or marketing agencies under any circumstances.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">4. Data Security</h2>
            <p className="mb-8">
              We implement robust, enterprise-grade security measures to protect your data. This includes HMAC-SHA256 payload verification for all Meta webhooks, strict CORS policies, and server-side input sanitization to prevent XSS and injection attacks. However, no electronic transmission over the internet can be guaranteed to be 100% secure.
            </p>

            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">5. Your Data Rights (GDPR & CCPA)</h2>
            <p className="mb-4">Depending on your location, you have specific rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Deletion:</strong> Request that we delete your data ("Right to be Forgotten").</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data.</li>
            </ul>
            <p className="mb-8">To exercise any of these rights, please contact us using the information below.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-6 text-brand-900">6. Changes to This Policy</h2>
            <p className="mb-8">
              We may update this Privacy Policy periodically to reflect changes in our practices or regulatory requirements. Any updates will be posted on this page with a revised "Effective Date."
            </p>

            <div className="bg-brand-50 border border-black/5 p-8 rounded-2xl mt-12">
              <h2 className="text-xl leading-[1.4] font-medium tracking-tight-display mb-4 text-brand-900">Contact Us</h2>
              <p className="mb-2">If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at:</p>
              <p className="font-medium text-brand-900">Email: infrivasolutions@gmail.com</p>
              <p className="font-medium text-brand-900">Website: https://www.infrivasolutions.com/contact</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
