export type ScheduleItem = {
  timeEn: string;
  timeUr: string;
  titleEn: string;
  titleUr: string;
  descEn: string;
  descUr: string;
  filled: boolean;
};

export const schedulesData: Record<'mehndi' | 'baraat' | 'waleema', {
  nameEn: string;
  nameUr: string;
  items: ScheduleItem[];
}> = {
  mehndi: {
    nameEn: 'Mehndi',
    nameUr: 'مہندی',
    items: [
      {
        timeEn: '06:30 PM',
        timeUr: 'شام ۶:۳۰',
        titleEn: 'Guest Arrival',
        titleUr: 'مہمانوں کی آمد',
        descEn: 'Welcome, greetings & refreshments',
        descUr: 'استقبال اور خوش آمدید',
        filled: false,
      },
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Nikah Ceremony',
        titleUr: 'تقریبِ نکاح',
        descEn: 'The beautiful beginning of forever',
        descUr: 'ہمیشہ کے خوبصورت سفر کا آغاز',
        filled: true,
      },
      {
        timeEn: '08:00 PM',
        timeUr: 'رات ۸:۰۰',
        titleEn: 'Dinner',
        titleUr: 'طعامِ خاص',
        descEn: 'An evening of delicious food & laughter',
        descUr: 'لذیذ پکوان اور پرمسرت محفل',
        filled: false,
      },
      {
        timeEn: '09:00 PM',
        timeUr: 'رات ۹:۰۰',
        titleEn: 'Celebration',
        titleUr: 'جشن و مسرت',
        descEn: "Let's celebrate this beautiful union",
        descUr: 'اس خوبصورت بندھن کا خوشیوں بھرا جشن',
        filled: false,
      },
    ],
  },
  baraat: {
    nameEn: 'Baraat',
    nameUr: 'بارات',
    items: [
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'Welcoming the arrival of the Baraat & groom',
        descUr: 'بارات کی آمد اور شاندار استقبال',
        filled: false,
      },
      {
        timeEn: '07:30 PM',
        timeUr: 'شام ۷:۳۰',
        titleEn: 'Refreshments',
        titleUr: 'مشروبات و لوازمات',
        descEn: 'Welcome drinks & evening appetizers',
        descUr: 'خوش آمدیدی مشروبات اور پروقار آغاز',
        filled: true,
      },
      {
        timeEn: '08:30 PM',
        timeUr: 'رات ۸:۳۰',
        titleEn: 'Dinner',
        titleUr: 'شاہانہ عشائیہ',
        descEn: 'A royal feast of authentic delicacies & laughter',
        descUr: 'شاہانہ پکوان اور پرتکلف ضیافت',
        filled: false,
      },
      {
        timeEn: '09:30 PM',
        timeUr: 'رات ۹:۳۰',
        titleEn: 'Celebration',
        titleUr: 'رخصتی و جشن',
        descEn: 'Blessings, fond farewells & joyful celebration',
        descUr: 'دعاؤں، نیک تمناؤں اور خوشیوں بھرا اختتام',
        filled: false,
      },
    ],
  },
  waleema: {
    nameEn: 'Waleema',
    nameUr: 'ولیمہ',
    items: [
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'Warm welcome & greetings to all beloved guests',
        descUr: 'معزز مہمانوں کا پرجوش اور پرتپاک استقبال',
        filled: false,
      },
      {
        timeEn: '07:30 PM',
        timeUr: 'شام ۷:۳۰',
        titleEn: 'Refreshments',
        titleUr: 'مشروبات و لوازمات',
        descEn: 'Welcome appetizers & evening drinks',
        descUr: 'خوش آمدیدی مشروبات اور ہلکا پھلکا ناشتہ',
        filled: true,
      },
      {
        timeEn: '08:30 PM',
        timeUr: 'رات ۸:۳۰',
        titleEn: 'Dinner',
        titleUr: 'طعامِ ولیمہ',
        descEn: 'Grand feast in celebration of the newlyweds',
        descUr: 'نو بیاہتا جوڑے کی خوشی میں پروقار ضیافت',
        filled: false,
      },
      {
        timeEn: '09:30 PM',
        timeUr: 'رات ۹:۳۰',
        titleEn: 'Celebration',
        titleUr: 'یادگار لمحات و جشن',
        descEn: 'Capturing memories & joyful celebration',
        descUr: 'یادگار تصاویر اور پرمسرت محفل',
        filled: false,
      },
    ],
  },
};

