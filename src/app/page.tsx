'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronDown, Cpu, Lock, GitBranch, User, BookOpen, Gift, Users } from 'lucide-react';
import BookWorkbookPairCard from '@/components/BookWorkbookPairCard';
import { books, workbooks, bundles } from '@/lib/products';
import { useCart } from '@/components/CartProvider';

// Create book+workbook pairs
const bookWorkbookPairs = [
  { book: books.find(b => b.id === 'ai-book')!, workbook: workbooks.find(w => w.id === 'ai-workbook')! },
  { book: books.find(b => b.id === 'encryption-book')!, workbook: workbooks.find(w => w.id === 'encryption-workbook')! },
  { book: books.find(b => b.id === 'algorithms-book')!, workbook: workbooks.find(w => w.id === 'algorithms-workbook')! },
];

const bundleIcons = [
  <BookOpen key="books" className="w-5 h-5" />,
  <Gift key="complete" className="w-5 h-5" />,
  <Users key="ultimate" className="w-5 h-5" />,
];

export default function Home() {
  const { addItem } = useCart();
  const [selectedBundleIndex, setSelectedBundleIndex] = useState(1); // Default to Bundle 2
  const selectedBundle = bundles[selectedBundleIndex];
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedBundleIndex(index);

    // Scroll the clicked tab to center
    const container = tabsContainerRef.current;
    const button = event.currentTarget;

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate the scroll position to center the button
      const scrollLeft = button.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAddBundle = () => {
    // Add all books
    selectedBundle.bookIds.forEach((bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (book) addItem(book);
    });

    // Add workbooks based on bundle
    if (selectedBundle.workbookQuantity > 0) {
      selectedBundle.workbookIds.forEach((workbookId) => {
        const workbook = workbooks.find((w) => w.id === workbookId);
        if (workbook) {
          for (let i = 0; i < selectedBundle.workbookQuantity; i++) {
            addItem(workbook);
          }
        }
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-pink-50/50 to-sky-50/50">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-black text-[#545454] leading-tight mb-6 animate-hero-2">
            הדור הבא של מומחי
            <span className="block">הטכנולוגיה גדל כאן</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-hero-3">
            בואו לגלות את סדרת הספרים המצליחה של ד&quot;ר סתיו אלבר שמנגישה לילדים (ולהורים!) את עולמות ההצפנה, הבינה המלאכותית והאלגוריתמים בצורה חווייתית ומרתקת.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-hero-4">
            <a
              href="#books"
              className="btn-retro bg-pink-400 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-500 flex items-center justify-center gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              אני רוצה להזמין
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center animate-hero-scale pb-3 pr-3 md:pb-4 md:pr-4">
          <div className="bg-white border-4 border-[#545454] rounded-2xl md:rounded-3xl p-4 md:p-8 hard-shadow-lg flex items-center justify-center">
            <div className="relative w-[240px] h-[210px] md:w-[320px] md:h-[280px]">
              {/* Book 1 - AI (back left) */}
              <div className="absolute left-0 top-1/2 -translate-y-[60%] transform -rotate-12 animate-book-1">
                <Image
                  src="/AI.png"
                  alt="בינה מלאכותית לילדים"
                  width={160}
                  height={220}
                  className="w-[120px] md:w-[160px] h-auto drop-shadow-[4px_6px_8px_rgba(0,0,0,0.25)]"
                />
              </div>
              {/* Book 2 - Encryption (back right) */}
              <div className="absolute right-0 top-1/2 -translate-y-[60%] transform rotate-12 animate-book-2">
                <Image
                  src="/encryption.png"
                  alt="סודות ההצפנה לילדים"
                  width={160}
                  height={220}
                  className="w-[120px] md:w-[160px] h-auto drop-shadow-[4px_6px_8px_rgba(0,0,0,0.25)]"
                />
              </div>
              {/* Book 3 - Algorithms (front center) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] z-10 animate-book-3">
                <Image
                  src="/algorythm.png"
                  alt="אלגוריתמים לילדים"
                  width={170}
                  height={230}
                  className="w-[130px] md:w-[170px] h-auto drop-shadow-[4px_8px_10px_rgba(0,0,0,0.3)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Bar */}
      <section className="bg-[#545454] text-white py-6">
        <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8 text-center font-bold">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-400" />
            <span>בינה מלאכותית</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-pink-400" />
            <span>הצפנה וסייבר</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-emerald-400" />
            <span>אלגוריתמים</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="books" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#545454] mb-4">ארגז הכלים לילדי העתיד</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bookWorkbookPairs.map((pair) => (
            <BookWorkbookPairCard
              key={pair.book.id}
              book={pair.book}
              workbook={pair.workbook}
            />
          ))}
        </div>

        {/* Bundle Section with Tabs */}
        <div className="mt-16 bg-pink-100 border-4 border-[#545454] rounded-3xl p-4 sm:p-8 md:p-12 hard-shadow">
          {/* Bundle Tabs */}
          <div className="flex justify-center mb-8">
            <div ref={tabsContainerRef} className="bg-white border-2 border-[#545454] rounded-xl p-1.5 max-w-full overflow-x-auto">
              <div className="flex gap-1.5 min-w-max">
                {bundles.map((bundle, index) => (
                  <button
                    key={bundle.id}
                    onClick={(e) => handleTabClick(index, e)}
                    className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                      selectedBundleIndex === index
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {bundleIcons[index]}
                    <span className="hidden sm:inline">{bundle.name}</span>
                    <span className="sm:hidden">{bundle.subtitle}</span>
                    {index === 1 && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full border border-[#545454]">
                        פופולרי
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bundle Content */}
          <div className="text-center">
            <div className="inline-block bg-pink-500 text-white px-4 py-1 rounded-full font-bold text-sm mb-4">
              <Star className="inline w-4 h-4 ml-1" fill="currentColor" />
              {selectedBundleIndex === 1 ? 'הכי פופולרי' : selectedBundleIndex === 2 ? 'הכי משתלם' : 'בסיסי'}
            </div>
            <h3 className="text-3xl font-black mb-2">{selectedBundle.name}</h3>
            <p className="text-pink-600 font-bold mb-4">{selectedBundle.subtitle}</p>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              {selectedBundle.description}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-5xl font-black">₪{selectedBundle.price}</span>
              <span className="text-2xl text-gray-400 line-through">₪{selectedBundle.originalPrice}</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-300">
                חיסכון של ₪{selectedBundle.savings}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAddBundle}
                className="btn-retro bg-pink-500 text-white px-10 py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-600"
              >
                הוסף לסל
              </button>
              <Link
                href={`/bundle?selected=${selectedBundleIndex}`}
                className="btn-retro bg-white text-pink-500 px-10 py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-50"
              >
                לפרטים נוספים
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-blue-50 border-4 border-[#545454] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white border-2 border-[#545454] px-6 py-2 rounded-full font-bold shadow-[4px_4px_0px_0px_#545454] flex items-center gap-2">
            <User className="w-5 h-5" />
            מי אני?
          </div>

          <div className="md:w-1/3">
            <div className="w-48 h-48 bg-white border-4 border-[#545454] rounded-full mx-auto overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <Image
                src="/Stav.png"
                alt="ד״ר סתיו אלבר"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-2/3 text-center md:text-right">
            <h3 className="text-3xl font-black mb-4">היי, אני ד&quot;ר סתיו אלבר!</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              היום אני מהנדסת תוכנה ב-Google ומרצה בטכניון, אבל הרבה לפני שכתבתי שורת קוד אחת – הייתי ילדה סקרנית שאהבה לפתור חידות. כתבתי את הספרים האלו כי אני מאמינה שילדים יכולים להבין הכל – מצפנים עתיקים ועד בינה מלאכותית – אם רק מסבירים להם את זה בגובה העיניים. המטרה שלי היא לפתוח לכל ילד וילדה דלת לעולם הטכנולוגי, ולתת להם את הספרים שתמיד חלמתי לקרוא כשאני הייתי ילדה.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
