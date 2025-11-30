import Image from 'next/image';

interface BookCompositeProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function BookComposite({ size = 'md' }: BookCompositeProps) {
  const sizes = {
    sm: { container: 'w-48 h-56', book: 'w-24 h-32' },
    md: { container: 'w-72 h-80', book: 'w-36 h-52' },
    lg: { container: 'w-96 h-[26rem]', book: 'w-48 h-64' },
  };

  const { container, book } = sizes[size];

  return (
    <div className={`relative ${container} flex items-center justify-center transform scale-75 sm:scale-100 origin-center`}>
      {/* Algorithms book (back) */}
      <Image
        src="/algorythm.png"
        alt="אלגוריתמים לילדים"
        width={size === 'lg' ? 192 : size === 'md' ? 144 : 96}
        height={size === 'lg' ? 256 : size === 'md' ? 208 : 128}
        className={`absolute ${book} object-cover border-2 border-black shadow-lg rounded-lg transform -rotate-12 -translate-x-16 z-10`}
      />
      {/* Encryption book (middle) */}
      <Image
        src="/encryption.png"
        alt="סודות ההצפנה לילדים"
        width={size === 'lg' ? 192 : size === 'md' ? 144 : 96}
        height={size === 'lg' ? 256 : size === 'md' ? 208 : 128}
        className={`absolute ${book} object-cover border-2 border-black shadow-lg rounded-lg transform rotate-0 z-20`}
      />
      {/* AI book (front) */}
      <Image
        src="/AI.png"
        alt="בינה מלאכותית לילדים"
        width={size === 'lg' ? 192 : size === 'md' ? 144 : 96}
        height={size === 'lg' ? 256 : size === 'md' ? 208 : 128}
        className={`absolute ${book} object-cover border-2 border-black shadow-lg rounded-lg transform rotate-12 translate-x-16 z-30`}
      />
    </div>
  );
}
