import Image from 'next/image';

// Outlets & institutions that featured KidCode (assets in public/press-logos/)
const pressLogos = [
  { src: '/press-logos/themarker.webp', alt: 'דה מרקר' },
  { src: '/press-logos/ynet.webp', alt: 'Ynet' },
  { src: '/press-logos/calcalist.webp', alt: 'כלכליסט' },
  { src: '/press-logos/haaretz.webp', alt: 'הארץ' },
  { src: '/press-logos/jpost.webp', alt: 'The Jerusalem Post' },
  { src: '/press-logos/n12.webp', alt: 'N12' },
  { src: '/press-logos/mako.webp', alt: 'מאקו' },
  { src: '/press-logos/walla.webp', alt: 'וואלה' },
  { src: '/press-logos/kan.webp', alt: 'כאן' },
  { src: '/press-logos/reshet13.webp', alt: 'רשת 13' },
  { src: '/press-logos/geektime.webp', alt: 'גיקטיים' },
  { src: '/press-logos/economy-channel.webp', alt: 'ערוץ הכלכלה' },
  { src: '/press-logos/laisha.webp', alt: 'לאשה' },
  { src: '/press-logos/madatech.webp', alt: 'מדעטק' },
  { src: '/press-logos/technion.webp', alt: 'הטכניון' },
  { src: '/press-logos/google.webp', alt: 'Google' },
  { src: '/press-logos/osim-historia.webp', alt: 'עושים היסטוריה' },
  { src: '/press-logos/think-drink-different.webp', alt: 'Think&Drink Different' },
  // Pending identification: green-unknown.webp
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
          className="h-10 md:h-12 w-auto object-contain"
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
      {/* dir=ltr so the duplicated track sits to the right and fills the
          scroll seamlessly (parent page is rtl, which would otherwise gap) */}
      <div dir="ltr" className="flex w-max animate-marquee">
        <LogoTrack />
        <LogoTrack ariaHidden />
      </div>
    </section>
  );
}
