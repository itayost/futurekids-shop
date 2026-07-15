import Image from 'next/image';

// Press outlets that featured KidCode (assets reused from public/content/articles/)
const pressLogos = [
  { src: '/content/articles/the-marker.jpg', alt: 'דה מרקר' },
  { src: '/content/articles/ynet.png', alt: 'Ynet' },
  { src: '/content/articles/calcalist.webp', alt: 'כלכליסט' },
  { src: '/content/articles/geektime.png', alt: 'גיקטיים' },
  { src: '/content/articles/N12.png', alt: 'N12' },
  { src: '/content/articles/mako.svg', alt: 'מאקו' },
  { src: '/content/articles/walla.jpeg', alt: 'וואלה' },
  { src: '/content/articles/haaretz.png', alt: 'הארץ' },
  { src: '/content/articles/reshet13.png', alt: 'רשת 13' },
  { src: '/content/articles/economy-channel.png', alt: 'ערוץ הכלכלה' },
];

function LogoTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex items-center gap-12 pl-12 shrink-0"
      aria-hidden={ariaHidden || undefined}
    >
      {pressLogos.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={ariaHidden ? '' : logo.alt}
          width={120}
          height={48}
          className="h-10 md:h-12 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
        />
      ))}
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="bg-white border-b-4 border-[#545454] py-8 overflow-hidden">
      <div className="container mx-auto px-6 mb-6 text-center">
        <h2 className="text-lg md:text-2xl font-black text-[#545454]">זכינו להופיע ב-</h2>
      </div>
      <div className="flex w-max animate-marquee">
        <LogoTrack />
        <LogoTrack ariaHidden />
      </div>
    </section>
  );
}
