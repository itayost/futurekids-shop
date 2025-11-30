import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronDown, Cpu, Lock, GitBranch, User } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import BookComposite from '@/components/BookComposite';
import { products, bundle } from '@/lib/products';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-pink-50/50 to-sky-50/50">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-right">
          <div className="inline-block bg-pink-200 border-2 border-black px-4 py-1 rounded-full font-bold text-sm mb-4 transform -rotate-2 animate-hero-1">
            <Star className="inline w-4 h-4 ml-1" fill="currentColor" />
            הספרים שהילדים שלכם צריכים!
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6 animate-hero-2">
            בואו נגלה את
            <span className="block text-sky-500">עולם הטכנולוגיה</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-hero-3">
            ספרים שמסבירים לילדים (ולהורים!) איך באמת עובדים המחשבים,
            הבינה המלאכותית והאינטרנט - בשפה פשוטה ועם המון כיף.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-hero-4">
            <Link
              href="/bundle"
              className="btn-retro bg-pink-400 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-black hover:bg-pink-500 text-center"
            >
              לכל הספרים במארז
            </Link>
            <a
              href="#books"
              className="btn-retro bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-black hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              גלו את הספרים
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center animate-hero-scale">
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow-lg">
            <BookComposite size="md" />
          </div>
        </div>
      </header>

      {/* Features Bar */}
      <section className="bg-black text-white py-6">
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
          <h2 className="text-4xl font-black text-gray-900 mb-4">הספרים שלנו</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            כל ספר מלמד נושא טכנולוגי בצורה מהנה ומובנת לילדים בכל הגילאים
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bundle CTA */}
        <div className="mt-16 bg-pink-100 border-4 border-black rounded-3xl p-8 md:p-12 hard-shadow text-center">
          <div className="inline-block bg-pink-500 text-white px-4 py-1 rounded-full font-bold text-sm mb-4">
            <Star className="inline w-4 h-4 ml-1" fill="currentColor" />
            הכי משתלם
          </div>
          <h3 className="text-3xl font-black mb-4">{bundle.name}</h3>
          <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
            {bundle.description}
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-5xl font-black">₪{bundle.price}</span>
            <span className="text-2xl text-gray-400 line-through">₪{bundle.originalPrice}</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-300">
              חיסכון של ₪{bundle.savings}
            </span>
          </div>
          <Link
            href="/bundle"
            className="btn-retro inline-block bg-pink-500 text-white px-10 py-4 rounded-xl font-black text-lg border-2 border-black hover:bg-pink-600"
          >
            לפרטים על המארז
          </Link>
        </div>
      </section>

      {/* Author Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-blue-50 border-4 border-black rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black px-6 py-2 rounded-full font-bold shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2">
            <User className="w-5 h-5" />
            מי אני?
          </div>

          <div className="md:w-1/3">
            <div className="w-48 h-48 bg-white border-4 border-black rounded-full mx-auto overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
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
              החלטתי לכתוב את הספרים האלה כי האמנתי שילדים יכולים להבין הכל - אם רק מסבירים להם את זה בשפה שלהם.
              בין אם זה מכונות לומדות או צפנים בני אלפי שנים, המטרה שלי היא לגרום לילדים להתאהב בטכנולוגיה, לחקור, לשאול שאלות ובעיקר - להנות מהדרך.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
