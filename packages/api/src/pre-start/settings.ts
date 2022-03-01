import { SettingsModel } from '@settings/entities';

const settings = [
  { key: 'NAME', value: process.env.NAME, type: 'String' },
  { key: 'LOGO', value: process.env.LOGO, type: 'File' },
  { key: 'DESCRIPTION', value: process.env.DESCRIPTION, type: 'Textarea' },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    value: process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER || 3,
    type: 'Number',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    value: process.env.PRAISE_PER_QUANTIFIER || 50,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    value: process.env.PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS || false,
    type: 'Boolean',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    value: process.env.PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE || 0.1,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    value:
      process.env.PRAISE_QUANTIFY_ALLOWED_VALUES ||
      '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
    type: 'List',
  },
  {
    key: 'DISCORD_ACTIVATION',
    value: process.env.DISCORD_ACTIVATION,
    type: 'String',
  },
  {
    key: 'DISCORD_MESSAGE',
    value: process.env.DISCORD_MESSAGE,
    type: 'Textarea',
  },
  { key: 'DISCORD_LOGO', value: process.env.DISCORD_LOGO, type: 'File' },
  {
    key: 'TELEGRAM_ACTIVATION',
    value: process.env.TELEGRAM_ACTIVATION,
    type: 'String',
  },
  {
    key: 'TELEGRAM_MESSAGE',
    value: process.env.TELEGRAM_MESSAGE,
    type: 'Textarea',
  },
  { key: 'TELEGRAM_LOGO', value: process.env.TELEGRAM_LOGO, type: 'File' },
];

const seedSettings = async (): Promise<void> => {
  for (const s of settings) {
    const document = await SettingsModel.findOne({ key: s.key });
    if (!document && s.value) {
      await SettingsModel.create(s);
    }
  }
};

export { seedSettings };
