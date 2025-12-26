export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KidCode",
    "url": "https://www.kidcode.org.il",
    "logo": "https://www.kidcode.org.il/logo.png",
    "description": "ספרים שמסבירים לילדים את העולם הטכנולוגי - בינה מלאכותית, הצפנה ואלגוריתמים",
    "founder": {
      "@type": "Person",
      "name": "ד\"ר סתיו אלבר",
      "jobTitle": "מהנדסת תוכנה ב-Google ומרצה בטכניון"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KidCode",
    "url": "https://www.kidcode.org.il",
    "description": "ספרי מדע וטכנולוגיה לילדים",
    "inLanguage": "he-IL"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
