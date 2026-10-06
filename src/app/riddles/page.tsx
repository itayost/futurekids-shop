import type { Metadata } from 'next';
import { Karantina } from 'next/font/google';
import { RiddlesHero } from '@/components/riddles/RiddlesHero';
import { RiddlesGallery } from '@/components/riddles/RiddlesGallery';
import { PreorderTerms, RiddleCategories, RiddlesAbout, RiddlesClose } from '@/components/riddles/RiddlesDetails';
import { book, listPrice, shipsBy } from '@/components/riddles/content';
import styles from '@/components/riddles/riddles.module.css';

// Hand-lettered display face echoing the book's cover titles.
const hand = Karantina({
  variable: '--font-hand',
  subsets: ['hebrew', 'latin'],
  weight: '700',
  display: 'swap',
});

const BASE_URL = 'https://www.kidcode.org.il';
const TITLE = shipsBy ? 'חידה! לכל המשפחה | רכישה מוקדמת' : 'חידה! לכל המשפחה';
const DESCRIPTION = shipsBy
  ? `ספר חידות לכל המשפחה מאת ד"ר סתיו אלבר ושמרית שולמן. רכישה מוקדמת ב-₪${book.price} במקום ₪${listPrice}, הספר יגיע במהלך ${shipsBy}.`
  : `ספר חידות לכל המשפחה מאת ד"ר סתיו אלבר ושמרית שולמן: משחקי מילים, הצפנה, מספרים ותבניות.`;
// 1200x630 share card: the cover on the site's cream, logo in the corner.
const OG_IMAGE = { url: '/riddles/og.jpg', width: 1200, height: 630, alt: 'כריכת הספר חידה! לכל המשפחה' };

export const metadata: Metadata = {
  title: `${TITLE} | KidCode`,
  description: DESCRIPTION,
  alternates: { canonical: '/riddles' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/riddles`,
    siteName: 'KidCode',
    locale: 'he_IL',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

function productJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: book.name,
    description: DESCRIPTION,
    image: `${BASE_URL}${book.image}`,
    brand: { '@type': 'Brand', name: 'KidCode' },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/riddles`,
      priceCurrency: 'ILS',
      price: book.price,
      availability: shipsBy ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    },
  };
}

export default function RiddlesPage() {
  return (
    <div className={`${styles.root} ${hand.variable} text-(--r-ink)`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd()) }}
      />
      <RiddlesHero />
      <div className="container mx-auto px-4 pb-20 md:px-6 md:pb-24">
        <section className="mt-14 md:mt-20" aria-labelledby="riddles-gallery">
          <h2 id="riddles-gallery" className="text-center text-[32px] font-black tracking-[-0.02em] md:text-[44px]">
            הצצה לתוך הספר
          </h2>
          <p className="mt-2 text-center text-lg md:text-[19px]">מאות חידות בסגנונות שונים. הנה כמה מהן.</p>
          <RiddleCategories />
          <RiddlesGallery />
        </section>
        <RiddlesAbout />
        <PreorderTerms />
        <RiddlesClose />
      </div>
    </div>
  );
}
