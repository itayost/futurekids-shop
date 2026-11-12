import { describe, it, expect } from 'vitest';
import {
  PRICE_BOUNDARIES,
  PRICE_CLOCK_SCRIPT,
  priceBoundaries,
  priceClockScript,
  priceMoment,
  promoCss,
  type PriceWindow,
} from './price-clock';
import { priceOf } from './sale';
import { products } from './products';

const SALE_W: PriceWindow = {
  attr: 'data-sale',
  startsAt: Date.parse('2026-11-04T00:00:00+02:00'),
  endsAt: Date.parse('2026-11-06T00:00:00+02:00'),
};
const LAUNCH_W: PriceWindow = {
  attr: 'data-promo-riddles-book-1',
  startsAt: Date.parse('2026-11-12T00:00:00+02:00'),
  endsAt: Date.parse('2026-12-01T00:00:00+02:00'),
};

// Runs the inline script against a stand-in <html> at a given moment.
function runAt(script: string, now: number) {
  const attrs = new Map<string, boolean>();
  const timers: number[] = [];
  const documentStub = { documentElement: { toggleAttribute: (name: string, on: boolean) => attrs.set(name, on) } };
  new Function('document', 'Date', 'setTimeout', script)(documentStub, { now: () => now }, (_: unknown, ms: number) =>
    timers.push(ms)
  );
  return { attrs, timers };
}

describe('priceClockScript', () => {
  const script = priceClockScript([SALE_W, LAUNCH_W]);

  it('marks each window open or closed on its own', () => {
    const { attrs } = runAt(script, Date.parse('2026-11-20T12:00:00+02:00'));
    expect(attrs.get('data-sale')).toBe(false);
    expect(attrs.get('data-promo-riddles-book-1')).toBe(true);
  });

  it('closes the launch price at midnight into 1.12', () => {
    const { attrs, timers } = runAt(script, LAUNCH_W.endsAt);
    expect(attrs.get('data-promo-riddles-book-1')).toBe(false);
    expect(timers).toHaveLength(0);
  });

  // An open tab must flip at the very next change, or it disagrees with the cart.
  it('arms a timer for the nearest upcoming change', () => {
    const now = LAUNCH_W.endsAt - 60_000;
    expect(runAt(script, now).timers).toEqual([60_050]);
  });

  it('arms a timer even when the next change is days away', () =>
    expect(runAt(script, Date.parse('2026-11-01T12:00:00+02:00')).timers).toHaveLength(1));

  it('escapes markup in attribute names', () =>
    expect(priceClockScript([{ ...SALE_W, attr: '</script>' }])).not.toContain('</script>'));

  it('is built from the live catalog', () => expect(PRICE_CLOCK_SCRIPT).toContain('data-promo-riddles-book-1'));
});

describe('promoCss', () => {
  it('hides each side of a promo by its attribute', () => {
    const css = promoCss(['riddles-book-1']);
    expect(css).toContain('html:not([data-promo-riddles-book-1]) .when-promo-riddles-book-1{display:none!important}');
    expect(css).toContain('html[data-promo-riddles-book-1] .when-no-promo-riddles-book-1{display:none!important}');
  });

  it('skips ids that are not plain slugs', () => expect(promoCss(['a{}b', 'x y'])).toBe(''));
});

describe('priceMoment', () => {
  const b = priceBoundaries([SALE_W, LAUNCH_W]);

  it('sorts and de-duplicates boundaries', () =>
    expect(priceBoundaries([LAUNCH_W, SALE_W, LAUNCH_W])).toEqual([
      SALE_W.startsAt, SALE_W.endsAt, LAUNCH_W.startsAt, LAUNCH_W.endsAt,
    ]));

  it('stays put between boundaries', () =>
    expect(priceMoment(b, Date.parse('2026-11-20T12:00:00+02:00'))).toBe(LAUNCH_W.startsAt));

  it('lands just before the first boundary when nothing has started', () =>
    expect(priceMoment(b, 0)).toBe(SALE_W.startsAt - 1));

  it('moves on exactly at a boundary', () => expect(priceMoment(b, LAUNCH_W.endsAt)).toBe(LAUNCH_W.endsAt));

  // The whole point: any price at the moment equals the price right now.
  it('prices every product the same as the real clock does', () => {
    const samples = [
      '2026-11-03T12:00:00+02:00', '2026-11-04T12:00:00+02:00', '2026-11-08T12:00:00+02:00',
      '2026-11-20T12:00:00+02:00', '2026-11-30T23:59:59+02:00', '2026-12-02T12:00:00+02:00',
    ].map(Date.parse);
    for (const now of samples) {
      const moment = priceMoment(PRICE_BOUNDARIES, now);
      for (const p of products) expect(priceOf(p, moment)).toBe(priceOf(p, now));
    }
  });
});
