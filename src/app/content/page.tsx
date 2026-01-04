import Image from 'next/image';
import { Mic, FileText, ExternalLink } from 'lucide-react';

const articles = [
  {
    id: 1,
    publication: 'דה מרקר',
    title: 'סתיו אלבר – 40 מתחת ל-40',
    link: 'https://www.themarker.com/magazine/2025-01-01/ty-article-magazine/.premium/00000194-12bb-d983-af97-1abb76830000',
    logo: '/content/articles/the-marker.jpg',
  },
  {
    id: 2,
    publication: 'Ynet',
    title: 'ד"ר סתיו אלבר פותחת צוהר לילדים לעולם הצפנים',
    link: 'https://www.ynet.co.il/laisha/article/syiz20bgkl',
    logo: '/content/articles/ynet.png',
  },
  {
    id: 3,
    publication: 'כלכליסט',
    title: 'הדור הדיגיטלי חי בעולם חדש אך עדיין לומד בכלים ישנים',
    link: 'https://www.calcalist.co.il/local_news/article/skaczhwkle',
    logo: '/content/articles/calcalist.webp',
  },
  {
    id: 4,
    publication: 'ערוץ הכלכלה',
    title: 'הילדים נחשפים לטכנולוגיה, אז למה שהם לא יבינו איך זה קורה?',
    link: 'https://www.youtube.com/watch?v=6Ov9bzpzqoc',
    logo: '/content/articles/economy-channel.png',
  },
  {
    id: 5,
    publication: 'גיקטיים',
    title: 'מומחית הצפנה ישראלית בגוגל מנגישה הצפנה לילדים בספר חדש',
    link: 'https://www.geektime.co.il/encryption-for-kids-book/',
    logo: '/content/articles/geektime.png',
  },
  {
    id: 6,
    publication: 'N12',
    title: 'המהדורה הצעירה – סודות ההצפנה לילדים',
    link: 'https://www.mako.co.il/news-channel12?subChannelId=cb4387fb2e4e2910VgnVCM200000650a10acRCRD&vcmid=57792afadd9d3910VgnVCM200000650a10acRCRD',
    logo: '/content/articles/N12.png',
  },
  {
    id: 7,
    publication: 'מאקו',
    title: 'לגדול עם AI: הספר החדש שמקרב את הבינה המלאכותית לילדים',
    link: 'https://www.mako.co.il/home-family-kids/Article-182a489c211f691026.htm',
    logo: '/content/articles/mako.svg',
  },
  {
    id: 8,
    publication: 'וואלה',
    title: 'ספר חדש מלמד ילדים את סודות ההצפנה',
    link: 'https://tech.walla.co.il/item/3695826',
    logo: '/content/articles/walla.jpeg',
  },
  {
    id: 9,
    publication: 'רשת 13',
    title: 'סודות ההצפנה לילדים – איך אנחנו נכנסים לחשבון הפורטנייט או הטיקטוק שלנו?',
    link: 'https://www.youtube.com/watch?v=E1BH6Cr-COs',
    logo: '/content/articles/reshet13.png',
  },
  {
    id: 10,
    publication: 'הארץ',
    title: 'לגלות לילדים את סודות ההצפנה',
    link: 'https://www.haaretz.co.il/tmr/00000194-12bb-d983-af97-1abb76830000',
    logo: '/content/articles/haaretz.png',
  },
  {
    id: 11,
    publication: 'גיקטיים',
    title: 'מעשה בחמישה משתנים: חוקרת בגוגל כתבה ספרי ילדים על אלגוריתמים',
    link: 'https://www.geektime.co.il/google-researcher-is-back-with-2-new-books-for-kids/',
    logo: '/content/articles/geektime.png',
  },
  {
    id: 12,
    publication: 'מאקו',
    title: '7 חידות צופן שיעבירו לכם את כל כיפור',
    link: 'https://www.mako.co.il/home-family-kids/Article-e0712c3e1bf8991026.htm',
    logo: '/content/articles/mako.svg',
  },
];

const podcasts = [
  {
    id: 1,
    showName: 'גיקונומי',
    episodeTitle: 'ד"ר סתיו אלבר והצפנה לילדים',
    logo: '/content/podcasts/Geekonomy.jpg',
  },
  {
    id: 2,
    showName: 'עושים תוכנה',
    episodeTitle: 'סודות ההצפנה העתיקים',
    logo: '/content/podcasts/osim-tochna.jpeg',
  },
  {
    id: 3,
    showName: 'מפתחים מחוץ לקופסה',
    episodeTitle: 'הסודות שמאחורי הסודות – ד"ר סתיו אלבר מפצחת הצפנות',
    logo: '/content/podcasts/out-of-the-box.jpeg',
  },
  {
    id: 4,
    showName: 'פופקורן',
    episodeTitle: 'יכולים לשמור סוד? | יוליוס קיסר השתמש בוואטסאפ? | איך מסבירים הצפנה לילדים?',
    logo: '/content/podcasts/popcorn.jpeg',
  },
  {
    id: 5,
    showName: 'Think&Drink Different',
    episodeTitle: 'סודות ההצפנה. אורחת: ד"ר סתיו אלבר',
    logo: '/content/podcasts/think&drink different.webp',
  },
  {
    id: 6,
    showName: 'הטכניוניסטים',
    episodeTitle: 'פיצחה את הצופן | ד"ר סתיו אלבר',
    logo: '/content/podcasts/the-technionists.jpeg',
  },
  {
    id: 7,
    showName: 'מדברימדע',
    episodeTitle: 'ד"ר סתיו אלבר - סודות ההצפנה לילדים',
    logo: '/content/podcasts/מדברימדע-פודקאסט.jpg',
  },
  {
    id: 8,
    showName: 'Hard Reset',
    episodeTitle: 'Data Security (Stav Elbar)',
    logo: '/content/podcasts/hard-reset.jpeg',
  },
  {
    id: 9,
    showName: 'שלושה שיודעים',
    episodeTitle: 'חידה את לי',
    logo: '/content/podcasts/shlosha.webp',
  },
  {
    id: 10,
    showName: 'האותיות הקטנות',
    episodeTitle: 'ד"ר סתיו אלבר כותבת ספר ילדים על הצפנה',
    logo: '/content/podcasts/otiot-ktanot.jpeg',
  },
];

export default function MediaPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Author Card */}
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-pink-100 border-4 border-[#545454] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/Stav.png"
              alt="ד״ר סתיו אלבר"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-black mb-2">שמחה שקפצתם לבקר!</h2>
            <p className="text-gray-600 text-lg">
              כאן ריכזתי עבורכם ראיונות וכתבות שנערכו איתי. בשיחות האלו אני משתפת במסע המקצועי שלי, המשלב את עולם המחקר בטכניון עם העשייה הטכנולוגית ב-Google, וכמובן – את האהבה לכתיבה. בחלק מהפודקאסטים תשמעו אותי מדברת על &quot;מאחורי הקלעים&quot; של הספרים, ובאחרים אני צוללת ישר לעומק המדע: מסבירה איך עובדת הצפנה, מהי בינה מלאכותית ואיך אלגוריתמים משפיעים על החיים של כולנו.
            </p>
          </div>
        </div>

        {/* Articles - now first as requested */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center border-2 border-[#545454]">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black">כתבות ומאמרים</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border-4 border-[#545454] rounded-2xl p-6 hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#545454] flex-shrink-0 bg-white p-1">
                    <Image
                      src={article.logo}
                      alt={article.publication}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sky-500 font-bold text-sm mb-1">{article.publication}</p>
                    <h3 className="text-lg font-black leading-tight">{article.title}</h3>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Podcasts - changed from "הופעות בפודקאסטים" to "פודקאסטים" */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center border-2 border-[#545454]">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black">פודקאסטים</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="bg-white border-4 border-[#545454] rounded-2xl p-6 hard-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#545454] flex-shrink-0 bg-white p-1">
                    <Image
                      src={podcast.logo}
                      alt={podcast.showName}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-pink-500 font-bold text-sm mb-1">{podcast.showName}</p>
                    <h3 className="text-lg font-black leading-tight">{podcast.episodeTitle}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
