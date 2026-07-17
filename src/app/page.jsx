import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the ClientApp with SSR disabled to avoid sessionStorage / window errors on server
const ClientApp = dynamic(() => import('../components/ClientApp'), { ssr: false });

export default function Page() {
  return (
    <div>
      {/* Interactive Client Application Container */}
      <ClientApp />

      {/* Server-Rendered Semantic Content & FAQs (fully crawlable by search/AI engines) */}
      <div className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-800/60 space-y-16">
        
        {/* About & Explanatory section */}
        <section id="about" className="space-y-6">
          <h1 className="font-heading text-3xl font-extrabold text-white text-center leading-tight">
            Free ATS Resume Analyzer — Score &amp; Fix Your Resume Instantly
          </h1>
          
          <div className="p-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-4">
            <p className="text-slate-300 leading-relaxed font-sans text-sm sm:text-base">
              Optimize your job application with our free ATS resume checker and compatibility online tool. 
              Resume Intelligence conducts deep, privacy-first, line-by-line analyses of your resume against any 
              job description, identifying critical keyword gaps, formatting errors, and readability constraints. 
              Built on a local-first, Bring Your Own Key (BYOK) architecture, this tool runs entirely within your 
              browser tab. Your files are parsed locally using pdfjs-dist and never uploaded to external databases, 
              keeping your contact details, work history, and keys completely secure. Get actionable recommendations, 
              instant ATS score improvements, and export optimized PDF or Markdown files without signing up or 
              creating an account.
            </p>
          </div>
        </section>

        {/* Static FAQ section */}
        <section id="faq" className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-white text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
              <h3 className="font-heading font-semibold text-lg text-amber-400 mb-2">
                What is an ATS resume score?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                An ATS (Applicant Tracking System) resume score is a rating that measures how well your resume matches a job description and how easily it can be parsed by automated recruiting software. Our analyzer helps you identify formatting issues, missing keywords, and readability gaps to maximize your score.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
              <h3 className="font-heading font-semibold text-lg text-amber-400 mb-2">
                Is my resume data stored?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No, your privacy is our top priority. The analysis runs 100% client-side inside your browser tab using your own API key (BYOK). Your PDF is parsed locally and never uploaded to any external server.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
              <h3 className="font-heading font-semibold text-lg text-amber-400 mb-2">
                How can I improve my ATS score for free?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                You can improve your score by tailoring your resume to the job description, inserting relevant keywords from the job listing, avoiding complex formatting like columns or text boxes, and fixing any spelling or grammatical errors.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
              <h3 className="font-heading font-semibold text-lg text-amber-400 mb-2">
                Do I need to sign up to use the ATS resume checker?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No signup or registration is required. You can check your resume compatibility completely anonymously and instantly.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
