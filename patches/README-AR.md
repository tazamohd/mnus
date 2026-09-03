# 🔧 تعريب بوابة الفني — patch جاهز للتطبيق على `tazamohd/salis-gms`

> أُعدّ في ٣ سبتمبر ٢٠٢٦ بناء على طلب المالك (اكتشفنا أثناء تخطيط الفيديو الرابع أن بوابة الفني نصوصها إنجليزية ثابتة خارج نظام الترجمة). لم أستطع الدفع مباشرة لمستودع `salis-gms` من هذه الجلسة (الصلاحية قراءة فقط)، فهذا الملف يحمل التعديل كاملاً.

## ماذا يغيّر `technician-portal-arabic-i18n.patch`؟

**١٠ ملفات، ~١٥٦٠ سطر diff:**

| الملف | التغيير |
|-------|---------|
| `client/src/i18n/locales/en.json` | إضافة قسم `techPortal` (~١١٠ مفتاحاً — النصوص الإنجليزية الحالية كما هي) |
| `client/src/i18n/locales/ar.json` | إضافة قسم `techPortal` بالترجمة العربية الكاملة |
| `client/src/components/TechnicianLayout.tsx` | عنوان البوابة + عناصر التنقل التسعة عبر `t()` |
| `client/src/pages/technician/Dashboard.tsx` | المؤشرات الأربعة، جدول اليوم، الأعمال النشطة، شارات الحالة والأولوية |
| `client/src/pages/technician/MyJobs.tsx` | البحث، الفلاتر، التبويبات، أزرار بدء/إنهاء العمل، رسائل التوست |
| `client/src/pages/technician/TimeClock.tsx` | ساعة الدوام وسجلاتها |
| `client/src/pages/technician/Attendance.tsx` | الحضور بتحقق GPS، الجدول، مواقع الورشة، رسائل التوست |
| `client/src/pages/technician/PartsLookup.tsx` | البحث عن القطع وشارات المخزون |
| `client/src/pages/technician/Profile.tsx` | الملف الشخصي وبطاقاته |
| `client/src/pages/technician/JobDocumentation.tsx` | توثيق الأعمال بالصور |

**مضمون سلامته:** الـpatch وُلّد من نسخة المستودع الحالية وتحقّقنا أنه يطبَّق نظيفاً، وملفا JSON صالحان بعده، وكل ملفات TSX عُبرت فحص صياغة esbuild. معرّفات الاختبار `data-testid` بقيت إنجليزية ثابتة (استُبدل اشتقاقها من العناوين بمفاتيح ثابتة) حتى لا تنكسر الاختبارات.

## طريقة التطبيق

```bash
cd salis-gms
git checkout -b i18n/technician-portal
git apply /path/to/technician-portal-arabic-i18n.patch
npm run build        # أو أمر البناء المعتاد عندك للتحقق
git add -A && git commit -m "Localize technician portal (Arabic i18n)"
```

بعد النشر: افتح بوابة الفني وبدّل اللغة إلى العربية — الاتجاه RTL يُضبط تلقائياً من `i18n/config.ts` الموجود أصلاً.

## خارج نطاق هذه الدفعة (مرحلة ثانية مقترحة)

1. **`ServiceGuides.tsx` و`TechnicalSoftware.tsx`** — واجهتاهما تحتاجان نفس المعالجة، لكن معظم محتواهما بيانات تجريبية (عناوين أدلة وبرامج بالإنجليزية) تحتاج قرار محتوى لا قرار واجهة.
2. **نسخة الجوال `technician-app`** (`TechnicianMobile*.tsx`) — نفس النمط.
3. **تنسيقات التواريخ** (`date-fns`) لا تزال إنجليزية (مثل `MMMM d, yyyy`) — يمكن تمرير locale عربي لاحقاً.
4. **مساحات RTL الدقيقة** — بعض الهوامش (`mr-2` على الأيقونات) تظهر معكوسة بالعربية؛ تجميلها بتحويلها لـ`gap` أو خصائص منطقية.
