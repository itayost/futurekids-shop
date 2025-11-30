import Image from 'next/image';
import { Mic, FileText, ExternalLink } from 'lucide-react';

// Placeholder data - will be replaced with real content later
const podcastAppearances = [
  {
    id: 1,
    showName: 'שם הפודקאסט',
    episodeTitle: 'כותרת הפרק',
    description: 'תיאור קצר של הפרק והנושאים שנדונו...',
    link: '#',
  },
  {
    id: 2,
    showName: 'שם הפודקאסט',
    episodeTitle: 'כותרת הפרק',
    description: 'תיאור קצר של הפרק והנושאים שנדונו...',
    link: '#',
  },
];

const articles = [
  {
    id: 1,
    publication: 'שם האתר/העיתון',
    title: 'כותרת הכתבה',
    description: 'תיאור קצר של הכתבה...',
    link: '#',
  },
  {
    id: 2,
    publication: 'שם האתר/העיתון',
    title: 'כותרת הכתבה',
    description: 'תיאור קצר של הכתבה...',
    link: '#',
  },
];

export default function MediaPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
            מדברים עליי
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">הופעות ומאמרים</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            ריכזתי כאן הופעות בפודקאסטים וכתבות שפורסמו על הספרים ועל הדרך שלי
          </p>
        </div>

        {/* Author Card */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-pink-100 border-4 border-black rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/Stav.png"
              alt="ד״ר סתיו אלבר"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-black mb-2">ד&quot;ר סתיו אלבר</h2>
            <p className="text-gray-600 text-lg">
              מחברת סדרת הספרים FutureKids שמסבירה לילדים טכנולוגיה בשפה פשוטה ומהנה.
              אשמח לארח אתכם בפודקאסט או לשתף בכתבה!
            </p>
          </div>
        </div>

        {/* Podcast Appearances */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center border-2 border-black">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black">הופעות בפודקאסטים</h2>
          </div>

          {podcastAppearances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {podcastAppearances.map((podcast) => (
                <a
                  key={podcast.id}
                  href={podcast.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-4 border-black rounded-2xl p-6 hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-pink-500 font-bold text-sm mb-1">{podcast.showName}</p>
                      <h3 className="text-xl font-black mb-2">{podcast.episodeTitle}</h3>
                      <p className="text-gray-600">{podcast.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <Mic className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">בקרוב יתווספו הופעות בפודקאסטים</p>
            </div>
          )}
        </section>

        {/* Articles */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center border-2 border-black">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black">כתבות ומאמרים</h2>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-4 border-black rounded-2xl p-6 hard-shadow hover:translate-x-1 hover:-translate-y-1 transition-transform block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sky-500 font-bold text-sm mb-1">{article.publication}</p>
                      <h3 className="text-xl font-black mb-2">{article.title}</h3>
                      <p className="text-gray-600">{article.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">בקרוב יתווספו כתבות ומאמרים</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
