import { SettingsModel } from '@settings/entities';

const settings = [
  { key: 'NAME', value: process.env.NAME, type: 'String' },
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
