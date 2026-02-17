import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#545454] text-white py-12 border-t-8 border-pink-400">
      <div className="container mx-auto px-6 text-center">
        <Image
          src="/logo.png"
          alt="KidCode"
          width={120}
          height={40}
          className="mx-auto mb-2"
        />
        <p className="text-gray-400 text-sm">כל הזכויות שמורות לד&quot;ר סתיו אלבר © 2025</p>
        <a href="/privacy" className="text-gray-400 text-xs mt-2 inline-block hover:text-pink-400 transition">
          מדיניות פרטיות
        </a>
        <p className="text-gray-400 text-xs mt-4">
          בנייה ועיצוב:{' '}
          <a
            href="https://itayost.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition"
          >
            ItayOst
          </a>
        </p>
      </div>
    </footer>
  );
}
