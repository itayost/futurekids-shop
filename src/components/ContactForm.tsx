import { Send } from 'lucide-react';

export default function ContactForm() {
  return (
    <form
      action="https://formsubmit.co/stav.elbar@gmail.com"
      method="POST"
      className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow"
    >
      {/* Formsubmit configuration */}
      <input type="hidden" name="_subject" value="פנייה חדשה מהאתר" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value="https://www.kidcode.org.il/contact?success=true" />

      <h2 className="text-2xl font-black mb-8">שלחו הודעה</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-bold mb-2">
            שם מלא
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border-2 border-[#545454] rounded-xl p-3 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="השם שלכם"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-bold mb-2">
            אימייל
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border-2 border-[#545454] rounded-xl p-3 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block font-bold mb-2">
            נושא
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            className="w-full border-2 border-[#545454] rounded-xl p-3 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="נושא הפנייה"
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-bold mb-2">
            הודעה
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full border-2 border-[#545454] rounded-xl p-3 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            placeholder="ספרו לי במה אוכל לעזור..."
          />
        </div>

        <button
          type="submit"
          className="w-full btn-retro bg-pink-500 text-white py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-600 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          שליחה
        </button>
      </div>
    </form>
  );
}
