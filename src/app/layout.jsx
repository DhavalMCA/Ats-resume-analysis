import '../index.css';

export const metadata = {
  title: "ATS Resume Analyzer — Free Resume Score & Fix Tool",
  description: "Analyze your resume for ATS compatibility instantly. Get keyword gaps, formatting fixes, and a shareable score — 100% client-side, no signup.",
  metadataBase: new URL("https://ats-resume-analysis-sigma.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://ats-resume-analysis-sigma.vercel.app/",
    title: "ATS Resume Analyzer — Free Resume Score & Fix Tool",
    description: "Analyze your resume for ATS compatibility instantly. Get keyword gaps, formatting fixes, and a shareable score — 100% client-side, no signup.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ATS Resume Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATS Resume Analyzer — Free Resume Score & Fix Tool",
    description: "Analyze your resume for ATS compatibility instantly. Get keyword gaps, formatting fixes, and a shareable score — 100% client-side, no signup.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7LZ6CYPP1T"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7LZ6CYPP1T');
            `,
          }}
        />
        {/* JSON-LD Structured Data: WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ATS Resume Analyzer",
              "url": "https://ats-resume-analysis-sigma.vercel.app/",
              "description": "Free client-side ATS resume analysis tool with severity inspection.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        {/* JSON-LD Structured Data: FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is an ATS resume score?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "An ATS (Applicant Tracking System) resume score is a rating that measures how well your resume matches a job description and how easily it can be parsed by automated recruiting software. Our analyzer helps you identify formatting issues, missing keywords, and readability gaps to maximize your score."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is my resume data stored?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No, your privacy is our top priority. The analysis runs 100% client-side inside your browser tab using your own API key (BYOK). Your PDF is parsed locally and never uploaded to any external server."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I improve my ATS score for free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can improve your score by tailoring your resume to the job description, inserting relevant keywords from the job listing, avoiding complex formatting like columns or text boxes, and fixing any spelling or grammatical errors."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do I need to sign up to use the ATS resume checker?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No signup or registration is required. You can check your resume compatibility completely anonymously and instantly."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-[#0a0d14] text-slate-100 min-h-screen font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
