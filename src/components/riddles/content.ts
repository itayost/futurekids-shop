import { riddlesBook } from '@/lib/products';

// Everything the landing page states about price and timing comes from the
// catalog entry, so the page and the cart can never disagree.
export const book = riddlesBook;
export const listPrice = riddlesBook.compareAtPrice ?? riddlesBook.price;
export const savings = listPrice - riddlesBook.price;

// "נובמבר 2026" -> { month: 'נובמבר', year: '2026' }. Null once the book is
// released and its catalog entry drops `preorder`.
export const shipsBy = riddlesBook.preorder?.shipsBy ?? null;
export const [shipMonth = null, shipYear = null] = shipsBy?.split(' ') ?? [];

export interface RiddlePage {
  src: string;
  title: string;
  alt: string;
}

export const galleryPages: RiddlePage[] = [
  { src: '/riddles/pages/words-hidden-word.jpg', title: 'מילה מסתתרת', alt: 'עמוד מהספר: חידת מילה מסתתרת, ממשחקי המילים' },
  { src: '/riddles/pages/cipher-spy-notes.jpg', title: 'סודות הריגול', alt: 'עמוד מהספר: פתקי ריגול מוצפנים, מפרק ההצפנה' },
  { src: '/riddles/pages/numbers-vertical-sum.jpg', title: 'תרגיל מאונך', alt: 'עמוד מהספר: תרגילי חשבון מאונכים עם סמלים, מפרק המספרים והתבניות' },
  { src: '/riddles/pages/words-combinations.jpg', title: 'צירופי מילים', alt: 'עמוד מהספר: חידת צירופי מילים, ממשחקי המילים' },
  { src: '/riddles/pages/cipher-code-crossword.jpg', title: 'תשבץ קוד', alt: 'עמוד מהספר: תשבץ שבו כל אות מוחלפת במספר, מפרק ההצפנה' },
  { src: '/riddles/pages/numbers-noahs-ark.jpg', title: 'תיבת נח', alt: 'עמוד מהספר: חידת היגיון על חיות בתיבת נח, מפרק המספרים והתבניות' },
  { src: '/riddles/pages/words-he-and-she.jpg', title: 'הוא והיא', alt: 'עמוד מהספר: חידת זכר ונקבה, ממשחקי המילים' },
  { src: '/riddles/pages/cipher-whats-in-the-picture.jpg', title: 'מה בתמונה?', alt: 'עמוד מהספר: רמזים שמתחבאים בתוך איור, מפרק ההצפנה' },
];
