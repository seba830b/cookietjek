// Udfyld det her én gang. Det bliver flettet ind i alle rapporter.
export default {
  saelger: {
    navn: 'Caustic',
    by: 'Svendborg',
    email: 'DIN@MAIL.DK',
    telefon: '+45 00 00 00 00',
  },

  priser: {
    fuldRettelse: 1800,   // tracking fyrer før samtykke
    kunAfvisKnap: 1200,   // banner findes, men mangler afvis i første lag
  },

  // Bruges kun til at bygge links i outreach-mails. Sæt den til din faktiske
  // deploy-URL, fx https://cookietjek.pages.dev
  site: {
    baseUrl: 'https://cookietjek.example.dev',
  },

  // Valgfrit. Et Stripe Payment Link (start i test mode). Tom streng skjuler
  // knappen. Til første salg er en faktura med CPR-nummer og bankoverførsel
  // både nemmere og skattemæssigt renere, se FIRST-SALE.md.
  stripePaymentLink: '',
};
