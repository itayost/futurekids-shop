'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { BookOpen, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import { ExamplePage } from '@/types';

interface ExamplePagesGalleryProps {
  pages: ExamplePage[];
  colorClasses: {
    bgLight: string;
    text: string;
  };
}

const SOURCE_LABELS = {
  book: 'מתוך הספר',
  workbook: 'מתוך חוברת הפעילויות',
} as const;

export function ExamplePagesGallery({ pages, colorClasses }: ExamplePagesGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + pages.length - 1) % pages.length)),
    [pages.length]
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % pages.length)),
    [pages.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      // RTL: ArrowRight goes to the previous page, ArrowLeft to the next
      if (event.key === 'ArrowRight') showPrev();
      if (event.key === 'ArrowLeft') showNext();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, showPrev, showNext]);

  const bookPages = pages.filter((p) => p.source === 'book');
  const workbookPages = pages.filter((p) => p.source === 'workbook');
  const openPage = openIndex === null ? null : pages[openIndex];

  const renderThumb = (page: ExamplePage) => {
    const index = pages.indexOf(page);
    return (
      <button
        key={page.src}
        type="button"
        onClick={() => setOpenIndex(index)}
        className="group relative bg-white border-4 border-[#545454] rounded-xl overflow-hidden cursor-zoom-in transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
        aria-label={`הגדלת עמוד לדוגמה, ${SOURCE_LABELS[page.source]}`}
      >
        <Image
          src={page.src}
          alt={`עמוד לדוגמה, ${SOURCE_LABELS[page.source]}`}
          width={page.width}
          height={page.height}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 50vw"
          className="w-full h-auto"
        />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </button>
    );
  };

  return (
    <section aria-labelledby="example-pages-heading" className="mt-16">
      <div className="bg-white border-4 border-[#545454] rounded-3xl p-6 sm:p-10 hard-shadow">
        <h2 id="example-pages-heading" className="text-3xl sm:text-4xl font-black text-[#545454] mb-8">
          הצצה לדפים מבפנים
        </h2>

        <div className="mb-10">
          <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-[#545454]">
            <BookOpen className={`w-6 h-6 ${colorClasses.text}`} />
            {SOURCE_LABELS.book}
          </h3>
          <div className={`${colorClasses.bgLight} rounded-xl p-4 grid grid-cols-1 gap-4`}>
            {bookPages.map(renderThumb)}
          </div>
        </div>

        <div>
          <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-[#545454]">
            <Pencil className={`w-6 h-6 ${colorClasses.text}`} />
            {SOURCE_LABELS.workbook}
          </h3>
          <div className={`${colorClasses.bgLight} rounded-xl p-4 grid grid-cols-2 gap-4`}>
            {workbookPages.map(renderThumb)}
          </div>
        </div>
      </div>

      {openPage &&
        createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`עמוד לדוגמה, ${SOURCE_LABELS[openPage.source]}`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 left-4 z-10 bg-white border-4 border-[#545454] rounded-full p-2 hover:bg-yellow-400 transition-colors"
            aria-label="סגירה"
          >
            <X className="w-6 h-6 text-[#545454]" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
            className="absolute right-2 sm:right-6 z-10 bg-white border-4 border-[#545454] rounded-full p-2 hover:bg-yellow-400 transition-colors"
            aria-label="העמוד הקודם"
          >
            <ChevronRight className="w-6 h-6 text-[#545454]" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute left-2 sm:left-6 z-10 bg-white border-4 border-[#545454] rounded-full p-2 hover:bg-yellow-400 transition-colors"
            aria-label="העמוד הבא"
          >
            <ChevronLeft className="w-6 h-6 text-[#545454]" />
          </button>

          <figure
            className="max-w-full max-h-full flex flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={openPage.src}
              alt={`עמוד לדוגמה, ${SOURCE_LABELS[openPage.source]}`}
              width={openPage.width}
              height={openPage.height}
              sizes="100vw"
              className="max-w-full max-h-[80vh] w-auto h-auto rounded-xl border-4 border-white"
            />
            <figcaption className="text-white font-bold text-lg">
              {SOURCE_LABELS[openPage.source]}
            </figcaption>
          </figure>
        </div>,
        document.body
      )}
    </section>
  );
}
