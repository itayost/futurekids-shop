import Image from 'next/image';

// Outlets & institutions that featured KidCode (assets in public/press-logos/).
// Real intrinsic dimensions so each logo reserves correct width before load.
const pressLogos = [
  { src: '/press-logos/themarker.webp', alt: 'דה מרקר', w: 1280, h: 268 },
  { src: '/press-logos/ynet.webp', alt: 'Ynet', w: 960, h: 411 },
  { src: '/press-logos/calcalist.webp', alt: 'כלכליסט', w: 960, h: 191 },
  { src: '/press-logos/haaretz.webp', alt: 'הארץ', w: 497, h: 152 },
  { src: '/press-logos/jpost.webp', alt: 'The Jerusalem Post', w: 1256, h: 162 },
  { src: '/press-logos/n12.webp', alt: 'N12', w: 3840, h: 832 },
  { src: '/press-logos/mako.webp', alt: 'מאקו', w: 250, h: 101 },
  { src: '/press-logos/walla.webp', alt: 'וואלה', w: 500, h: 141 },
  { src: '/press-logos/kan.webp', alt: 'כאן', w: 960, h: 235 },
  { src: '/press-logos/reshet13.webp', alt: 'רשת 13', w: 783, h: 238 },
  { src: '/press-logos/geektime.webp', alt: 'גיקטיים', w: 626, h: 111 },
  { src: '/press-logos/economy-channel.webp', alt: 'ערוץ הכלכלה', w: 1225, h: 260 },
  { src: '/press-logos/laisha.webp', alt: 'לאשה', w: 420, h: 81 },
  { src: '/press-logos/madatech.webp', alt: 'מדעטק', w: 236, h: 132 },
  { src: '/press-logos/technion.webp', alt: 'הטכניון', w: 384, h: 185 },
  { src: '/press-logos/google.webp', alt: 'Google', w: 256, h: 87 },
  { src: '/press-logos/osim-historia.webp', alt: 'עושים היסטוריה', w: 1200, h: 520 },
  { src: '/press-logos/think-drink-different.webp', alt: 'Think&Drink Different', w: 982, h: 1024 },
  // Pending identification: green-unknown.webp
];

export default function LogoMarquee() {
  return (
    <section className="bg-white border-b-4 border-[#545454] py-8 overflow-hidden">
      <div className="container mx-auto px-6 mb-6 text-center">
        <h2 className="text-lg md:text-2xl font-black text-[#545454]">זכינו להופיע ב-</h2>
      </div>
      <div className="overflow-hidden">
        {/* Single track with the logo list duplicated; the doubled width plus a
            translateX(50%) loop makes the scroll seamless. Proven pattern
            ported from the Improvement-center repo. */}
        <div className="flex items-center gap-12 w-max animate-marquee px-6">
          {[...pressLogos, ...pressLogos].map((logo, idx) => (
            <Image
              key={idx}
              src={logo.src}
              alt={idx < pressLogos.length ? logo.alt : ''}
              width={logo.w}
              height={logo.h}
              loading="eager"
              aria-hidden={idx >= pressLogos.length || undefined}
              className="h-10 md:h-12 w-auto object-contain shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
