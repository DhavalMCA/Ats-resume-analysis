export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://ats-resume-analysis-sigma.vercel.app/sitemap.xml',
  };
}
