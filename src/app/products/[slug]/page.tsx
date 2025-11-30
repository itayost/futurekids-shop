import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { getProductBySlug, products } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';

const colorClasses = {
  blue: {
    bg: 'bg-sky-50',
    bgLight: 'bg-sky-100',
    text: 'text-sky-600',
    border: 'border-sky-400',
    button: 'bg-sky-500 hover:bg-sky-600',
  },
  pink: {
    bg: 'bg-pink-50',
    bgLight: 'bg-pink-100',
    text: 'text-pink-600',
    border: 'border-pink-400',
    button: 'bg-pink-500 hover:bg-pink-600',
  },
  green: {
    bg: 'bg-emerald-50',
    bgLight: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-600',
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const colors = colorClasses[product.color];

  return (
    <div className={`${colors.bg} min-h-screen`}>
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-sm font-bold text-gray-500 mb-8">
          <Link href="/" className="hover:underline">
            החנות
          </Link>
          <ChevronLeft className="inline w-4 h-4 mx-1" />
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="bg-white border-4 border-black rounded-3xl p-6 hard-shadow relative">
            <div className="absolute -top-4 left-2 sm:-top-6 sm:-left-6 bg-yellow-400 border-4 border-black text-black font-black text-xl sm:text-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-full transform -rotate-12 shadow-lg">
              ₪{product.price}
            </div>

            <div className={`${colors.bgLight} rounded-xl h-64 sm:h-80 md:h-96 flex items-center justify-center p-4`}>
              <Image
                src={product.image}
                alt={product.name}
                width={280}
                height={400}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-5xl font-black mb-4 leading-tight text-gray-900">
              {product.name}
            </h1>
            <div className="text-lg font-medium text-gray-600 mb-6 border-b-2 border-gray-200 pb-6">
              מאת: <span className="text-black font-bold">ד&quot;ר סתיו אלבר</span> | איור:{' '}
              <span className="text-black font-bold">שמרית שולמן</span>
            </div>

            <p className="text-xl text-gray-800 leading-relaxed mb-8">{product.description}</p>

            <div className="flex gap-4 mb-10">
              <AddToCartButton
                product={product}
                className={`btn-retro ${colors.button} text-white text-xl w-full py-4 rounded-xl font-bold border-2 border-black text-center`}
              />
            </div>

            {/* Features */}
            <div className="bg-white border-4 border-black rounded-xl p-6">
              <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                <BookOpen className={`w-6 h-6 ${colors.text}`} />
                מה לומדים בספר?
              </h3>
              <ul className="space-y-3 text-lg font-medium text-gray-700">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`${colors.text} font-bold`}>•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all products
export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}
