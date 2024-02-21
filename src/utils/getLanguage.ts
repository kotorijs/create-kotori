import { I18n } from '@kotori-bot/i18n';
import { resolve } from 'path';

type LocaleType = 'en_US' | 'ja_JP' | 'zh_TW' | 'zh_CN';

function linkLocale(locale: string) {
  let linkedLocale: string;
  switch (locale) {
    case 'zh_TW':
    case 'zh_HK':
    case 'zh_MO':
      linkedLocale = 'zh_TW';
      break;
    case 'zh_CN':
    case 'zh_SG':
      linkedLocale = 'zh_CN';
      break;
    case 'ja_JP':
      linkedLocale = 'ja_JP';
      break;
    default:
      linkedLocale = 'en_US';
  }
  return linkedLocale;
}

function getLocale() {
  const shellLocale =
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    Intl.DateTimeFormat().resolvedOptions().locale ||
    'en-US';
  return linkLocale(shellLocale.split('.')[0]) as LocaleType;
}

export default function getLanguage() {
  const locale = getLocale();
  const i18n = new I18n({ supports: ['en_US', 'ja_JP', 'zh_TW', 'zh_CN'], lang: locale });
  i18n.use(resolve(__dirname, '../../locales'));
  return i18n;
}
