import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | KidCode',
  description: 'מדיניות הפרטיות של אתר KidCode - ספרי מדע וטכנולוגיה לילדים',
};

export default function PrivacyPage() {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-pink-50/50 to-sky-50/50 min-h-screen">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-black text-[#545454] mb-8">מדיניות פרטיות</h1>
        <p className="text-gray-500 text-sm mb-8">עודכן לאחרונה: פברואר 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">כללי</h2>
            <p>
              אתר KidCode (kidcode.org.il) מופעל על ידי ד&quot;ר סתיו אלבר.
              מדיניות פרטיות זו מפרטת כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך,
              בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981 ותיקון 13 לחוק.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">איזה מידע אנחנו אוספים</h2>
            <p className="mb-3">בעת ביצוע הזמנה באתר, אנו אוספים את הפרטים הבאים:</p>
            <ul className="list-disc list-inside space-y-1 me-4">
              <li>שם מלא</li>
              <li>כתובת דוא&quot;ל</li>
              <li>מספר טלפון</li>
              <li>כתובת למשלוח</li>
              <li>עיר</li>
            </ul>
            <p className="mt-3">
              מידע זה נדרש לצורך עיבוד ההזמנה, משלוח המוצרים, והפקת חשבונית.
              פרטי התשלום מעובדים באופן מאובטח על ידי ספק התשלומים iCount ואינם נשמרים בשרתים שלנו.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">שימוש בקוקיז ומעקב</h2>
            <p className="mb-3">
              האתר משתמש בטכנולוגיית Meta Pixel (פייסבוק פיקסל) למטרות שיווק ואנליטיקה.
              טכנולוגיה זו פועלת כברירת מחדל, וניתן לבטל אותה בכל עת באמצעות באנר הקוקיז
              המופיע בכניסה לאתר. אם בחרת לסרב, המעקב יופסק.
            </p>
            <h3 className="text-lg font-bold text-[#545454] mb-2">מעקב בדפדפן (Browser Pixel)</h3>
            <p className="mb-3">
              אלא אם סירבת לשימוש בקוקיז, נטען סקריפט של Meta שמאפשר לנו לדעת:
            </p>
            <ul className="list-disc list-inside space-y-1 me-4 mb-3">
              <li>אילו עמודים נצפו באתר (PageView)</li>
              <li>אילו מוצרים נוספו לסל (AddToCart)</li>
              <li>מתי מתחילים תהליך תשלום (InitiateCheckout)</li>
              <li>מתי הושלמה רכישה (Purchase)</li>
            </ul>
            <h3 className="text-lg font-bold text-[#545454] mb-2">מעקב בצד השרת (Conversions API)</h3>
            <p>
              בעת השלמת רכישה, אנו שולחים פרטי ההזמנה לשרתי Meta באופן ישיר.
              המידע האישי (דוא&quot;ל, טלפון, שם ועיר) מוצפן באמצעות אלגוריתם SHA-256
              לפני שהוא נשלח, כך ש-Meta מקבלת רק גרסה מוצפנת של הנתונים.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">קוקיז ספציפיים</h2>
            <p className="mb-3">הקוקיז שבהם האתר משתמש:</p>
            <div className="bg-white border-2 border-[#545454] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-start p-3 font-bold">שם</th>
                    <th className="text-start p-3 font-bold">מטרה</th>
                    <th className="text-start p-3 font-bold">סוג</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-mono text-xs">_fbp</td>
                    <td className="p-3">זיהוי דפדפן לצורך מעקב שיווקי</td>
                    <td className="p-3">שיווקי</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-mono text-xs">_fbc</td>
                    <td className="p-3">מעקב אחר לחיצה ממודעת פייסבוק</td>
                    <td className="p-3">שיווקי</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-mono text-xs">cookie_consent</td>
                    <td className="p-3">שמירת העדפת הקוקיז שלך</td>
                    <td className="p-3">הכרחי</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-mono text-xs">anonymous_id, flashy_attribution</td>
                    <td className="p-3">זיהוי מבקר ושיוך פעילות של מערכת הדיוור Flashy (כולל הצגת חלון ההצטרפות למועדון)</td>
                    <td className="p-3">שיווקי</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">שיתוף מידע עם צדדים שלישיים</h2>
            <p>
              אנו משתפים מידע עם הגורמים הבאים בלבד:
            </p>
            <ul className="list-disc list-inside space-y-1 me-4 mt-3">
              <li><strong>Meta (Facebook)</strong> — נתוני מעקב שיווקי מוצפנים, לצורך אופטימיזציה של קמפיינים פרסומיים</li>
              <li><strong>iCount</strong> — עיבוד תשלומים והפקת חשבוניות</li>
              <li><strong>Flashy</strong> — פלטפורמת דיוור ישראלית, לניהול מועדון הלקוחות ושליחת מיילים (ראו סעיף &quot;דיוור ומועדון לקוחות&quot;)</li>
              <li><strong>שירות משלוחים</strong> — שם וכתובת למשלוח בלבד</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">דיוור ומועדון לקוחות</h2>
            <p className="mb-3">
              בהצטרפות למועדון הלקוחות של KidCode (באמצעות טופס ההרשמה באתר) אנו אוספים
              כתובת דוא&quot;ל ושם פרטי (אופציונלי). המידע נשמר אצל ספק הדיוור Flashy
              ומשמש לשליחת מייל הצטרפות עם קוד הנחה, עדכונים על ספרים חדשים ומבצעים.
            </p>
            <p className="mb-3">
              בנוסף, אם התחלת תהליך רכישה באתר והשארת כתובת דוא&quot;ל, ייתכן שנשלח לך
              תזכורת חד פעמית על הפריטים שנותרו בסל הקניות.
            </p>
            <p>
              ניתן להסיר את ההרשמה מהדיוור בכל עת באמצעות קישור ההסרה שמופיע בכל מייל,
              או בפנייה לכתובת{' '}
              <a href="mailto:hello@kidcode.org.il" className="text-pink-500 underline font-bold" dir="ltr">
                hello@kidcode.org.il
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">אבטחת מידע</h2>
            <p>
              אנו נוקטים באמצעים סבירים להגנה על המידע האישי שלך:
            </p>
            <ul className="list-disc list-inside space-y-1 me-4 mt-3">
              <li>תקשורת מוצפנת (HTTPS) בכל האתר</li>
              <li>הצפנת SHA-256 של נתונים אישיים לפני שליחה ל-Meta</li>
              <li>פרטי תשלום מעובדים על ידי ספק חיצוני מאובטח (iCount) ואינם נשמרים אצלנו</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">הזכויות שלך</h2>
            <p className="mb-3">
              בהתאם לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות:
            </p>
            <ul className="list-disc list-inside space-y-1 me-4">
              <li><strong>סירוב למעקב</strong> — ניתן לסרב לקוקיז שיווקיים באמצעות הבאנר שמופיע בכניסה לאתר</li>
              <li><strong>ביטול הסכמה</strong> — ניתן למחוק את הקוקיז דרך הגדרות הדפדפן בכל עת</li>
              <li><strong>עיון במידע</strong> — ניתן לבקש לקבל עותק של המידע האישי ששמור אצלנו</li>
              <li><strong>מחיקת מידע</strong> — ניתן לבקש מחיקה של המידע האישי שלך</li>
              <li><strong>תיקון מידע</strong> — ניתן לבקש תיקון של מידע שגוי</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">יצירת קשר</h2>
            <p>
              לשאלות, בקשות או תלונות בנושא פרטיות, ניתן לפנות אלינו דרך עמוד יצירת הקשר באתר
              או בכתובת{' '}
              <a href="mailto:hello@kidcode.org.il" className="text-pink-500 underline font-bold" dir="ltr">
                hello@kidcode.org.il
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#545454] mb-3">עדכונים למדיניות</h2>
            <p>
              אנו עשויים לעדכן מדיניות זו מעת לעת.
              שינויים מהותיים יפורסמו באתר. המשך השימוש באתר לאחר פרסום שינויים
              מהווה הסכמה למדיניות המעודכנת.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
