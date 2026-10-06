import styles from './riddles.module.css';

// Enough copies per half to cover a 1920px screen while the track slides.
const COPIES_PER_HALF = 8;

interface PreorderTapeProps {
  text: string;
}

// A strip of packing tape across the hero repeating the pre-order terms, so
// the ship date is the first thing read on every screen size.
export function PreorderTape({ text }: PreorderTapeProps) {
  return (
    <div className={`${styles.tape} relative z-10 overflow-hidden border-y-4 border-(--r-ink) bg-(--r-sun) py-2 md:py-2.5`}>
      <p className="sr-only">{text}</p>
      <div className={styles.tapeTrack} aria-hidden="true">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {Array.from({ length: COPIES_PER_HALF }, (_, i) => (
              <span
                key={i}
                className="flex items-center gap-5 whitespace-nowrap px-5 text-base font-black text-(--r-ink) md:text-lg"
              >
                {text}
                <span className="size-2.5 rounded-full bg-(--r-red) ring-2 ring-(--r-ink)" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
