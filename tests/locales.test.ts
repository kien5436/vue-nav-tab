import { describe, expect, it } from 'vitest';

import VueNavTabError from '../lib/utils/error';
import { defaultLocales, mergeWithDefaultLocales } from '../lib/hooks/use-contextmenu';

const REQUIRED_KEYS = [
  'close',
  'closeAbove',
  'closeAll',
  'closeBelow',
  'closeLeft',
  'closeOthers',
  'closeRight',
  'reload',
];

describe('defaultLocales', () => {

  it('ships complete en and vi message sets', () => {
    expect(Object.keys(defaultLocales.en).sort()).toEqual([...REQUIRED_KEYS].sort());
    expect(Object.keys(defaultLocales.vi).sort()).toEqual([...REQUIRED_KEYS].sort());
  });
});

describe('mergeWithDefaultLocales', () => {

  it('keeps the built-in locales when no options are given', () => {
    const i18n = mergeWithDefaultLocales({});

    expect(i18n.en).toEqual(defaultLocales.en);
    expect(i18n.vi).toEqual(defaultLocales.vi);
  });

  it('adds a fully-specified custom language without touching the defaults', () => {
    const i18n = mergeWithDefaultLocales({ fr: { ...defaultLocales.en, close: 'Fermer' } });

    expect(i18n.fr.close).toBe('Fermer');
    expect(i18n.en).toEqual(defaultLocales.en);
    expect(i18n.vi).toEqual(defaultLocales.vi);
  });

  it('rejects a language missing a required message', () => {
    try {
      mergeWithDefaultLocales({ fr: { ...defaultLocales.en, close: undefined as unknown as string } });
      expect.unreachable();
    }
    catch (error) {
      expect(error).toBeInstanceOf(VueNavTabError);
      expect((error as Error).message).toContain('\'close\' is missing from \'options.fr\'');
    }
  });

  it('rejects a message with a mismatched type', () => {
    try {
      mergeWithDefaultLocales({ fr: { ...defaultLocales.en, reload: 42 as unknown as string } });
      expect.unreachable();
    }
    catch (error) {
      expect(error).toBeInstanceOf(VueNavTabError);
      expect((error as Error).message).toContain('\'reload\' is missing from \'options.fr\'');
    }
  });
});
