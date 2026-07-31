// Quiet hours for outgoing marketing email: nothing is sent from Friday
// 16:00 until Saturday 21:30, Israel time (Shabbat). Senders are pull-based,
// so skipped sends simply go out on the next allowed cron run; welcome emails
// signed up during quiet hours are marked owed (welcome_sent_at NULL) and
// delivered by the cron afterwards.

const QUIET_START_MINUTES = 16 * 60;
const QUIET_END_MINUTES = 21 * 60 + 30;

function jerusalemParts(date: Date): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    weekday: get('weekday'),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function isQuietHours(date: Date): boolean {
  const { weekday, minutes } = jerusalemParts(date);
  if (weekday === 'Fri') return minutes >= QUIET_START_MINUTES;
  if (weekday === 'Sat') return minutes < QUIET_END_MINUTES;
  return false;
}
