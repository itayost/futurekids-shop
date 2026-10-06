'use client';

import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { galleryPages } from './content';
import styles from './riddles.module.css';

const lightboxButton =
  'grid size-12 cursor-pointer place-items-center rounded-xl border-[3px] border-(--r-ink) bg-(--r-paper) text-(--r-ink) shadow-[3px_3px_0_0_var(--r-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-(--r-sun)';

// Real pages from the book, laid out askew; tapping one opens it full size.
export function RiddlesGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const open = (index: number) => {
    setOpenIndex(index);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? null : (i + delta + galleryPages.length) % galleryPages.length));

  // RTL: the right arrow goes back, the left arrow goes forward.
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') step(-1);
    if (event.key === 'ArrowLeft') step(1);
  };
  // A click on the backdrop lands on the dialog element itself.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  const page = openIndex === null ? null : galleryPages[openIndex];

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-x-7 md:gap-y-10">
        {galleryPages.map((p, index) => (
          <li key={p.src} className={styles.page}>
            <figure>
              <button
                type="button"
                onClick={() => open(index)}
                className={`${styles.pageButton} block w-full cursor-zoom-in overflow-hidden rounded-[10px] border-4 border-(--r-ink) bg-(--r-paper) shadow-[6px_6px_0_0_var(--r-ink)]`}
                aria-label={`הגדלת העמוד ${p.title}`}
              >
                <Image src={p.src} alt={p.alt} width={1080} height={1080} sizes="(max-width: 767px) 45vw, 280px" className="h-auto w-full" />
              </button>
              <figcaption className={`${styles.hand} mt-3 text-center text-[26px] leading-none md:text-[28px]`}>{p.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        onClose={() => setOpenIndex(null)}
        onKeyDown={onKeyDown}
        onClick={onDialogClick}
        aria-label={page ? `עמוד מהספר: ${page.title}` : 'עמוד מהספר'}
      >
        {page && (
          <figure className="grid gap-4">
            <Image
              src={page.src}
              alt={page.alt}
              width={1080}
              height={1080}
              sizes="(max-width: 767px) 92vw, 760px"
              className="h-auto max-h-[78vh] w-full rounded-xl border-4 border-(--r-ink) bg-(--r-paper) object-contain"
            />
            <figcaption className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => step(-1)} className={lightboxButton} aria-label="העמוד הקודם">
                <ChevronRight className="size-6" strokeWidth={2.5} />
              </button>
              <span className={`${styles.hand} text-[34px] leading-none text-white`}>{page.title}</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => step(1)} className={lightboxButton} aria-label="העמוד הבא">
                  <ChevronLeft className="size-6" strokeWidth={2.5} />
                </button>
                <button type="button" onClick={close} className={lightboxButton} aria-label="סגירה" autoFocus>
                  <X className="size-6" strokeWidth={2.5} />
                </button>
              </div>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
