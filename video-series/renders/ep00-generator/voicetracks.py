"""Generate full-length, script-timed narration tracks for episodes 2-11 in
English and Arabic. Each track is silence with the spoken lines placed at their
script timestamps — ready to lay under a screen recording (add your own music).

Usage: python3 voicetracks.py [ep03-en ep11-ar ...]   (default: all)
Output: voice-tracks/epNN-lang.mp3
"""
import asyncio, os, subprocess, sys, wave, contextlib
import edge_tts, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')
VOICES = {'en': 'en-US-AndrewNeural', 'ar': 'ar-SA-HamedNeural'}
MAX_RATE = 15          # % speed-up cap; beyond this the next line is pushed later
GAP = 0.35             # minimum silence between lines when pushing

EP = {
 'ep02': dict(dur=75, starts=[0,8,20,26,36,46,53,65],
  en=["You don't need to sign up to explore SALIS AUTO — the demo ships with nine free accounts, one for every role in a garage.",
      "Here they are. Every account uses a simple password — the role name plus one-two-three. Screenshot this table, or find it in the Platform Guide in the repository.",
      "Let's log in as a customer. Open the app and you'll land on the login page.",
      "Enter the demo email — client at salisauto dot com — and the password, client one-two-three.",
      "Click Sign In. Notice what happens: the platform reads the account's role and routes you straight to the right portal — no URLs to remember.",
      "Because this is a customer account, we've landed in the Customer Portal, with the seeded demo data already loaded.",
      "To try a different role, just log out and sign in with another account from the table — finance, technician, support — each one lands in its own portal.",
      "That's all there is to it. In the next episode we'll stay logged in as the customer and book a real service. See you there."],
  ar=["لست بحاجة إلى التسجيل لتستكشف «سالس أوتو» — النسخة التجريبية تأتي مع تسعة حسابات مجانية، حساب لكل دور في الورشة.",
      "ها هي أمامك. كل حساب بكلمة مرور بسيطة: اسم الدور متبوعاً بـ«123». صوّر الجدول، أو ستجده في دليل المنصة.",
      "لنسجّل الدخول كعميل. افتح التطبيق وستصل إلى صفحة تسجيل الدخول.",
      "أدخل البريد التجريبي client@salisauto.com وكلمة المرور client123.",
      "اضغط «تسجيل الدخول» ولاحظ: المنصة تقرأ دور الحساب وتوجهك مباشرة إلى بوابتك الصحيحة — دون حفظ أي روابط.",
      "ولأن هذا حساب عميل، وصلنا إلى بوابة العملاء، والبيانات التجريبية جاهزة أمامنا.",
      "ولتجربة دور آخر، سجّل الخروج وادخل بحساب آخر من الجدول — المالية، الفني، الدعم — كلٌّ يصل إلى بوابته.",
      "هذا كل شيء. في الحلقة القادمة نبقى بحساب العميل ونحجز موعد صيانة حقيقياً. أراكم هناك."]),
 'ep03': dict(dur=90, starts=[0,6,18,28,36,52,64,74,82],
  en=["This is SALIS AUTO from your customer's point of view — and it's where our story starts.",
      "Logged in as a customer, you get a personal dashboard: your vehicles, upcoming appointments, invoices, and live service tracking — all in one place.",
      "Every vehicle has a full digital history, so customers always know what's been done and when.",
      "Need a service? Find Garage locates a workshop in the network...",
      "...and booking takes seconds: choose your vehicle, the service, and a time slot. Confirm — and the garage sees it instantly. Remember this booking; we'll follow it through the whole series.",
      "Once work begins, Track Service shows live progress — checked in, diagnosed, in repair, ready for pickup — updated in real time.",
      "If the garage finds extra work, they send a quotation. The customer approves or declines right here — no phone tag, full transparency.",
      "There's even a parts store for accessories, and every invoice lives in the portal, ready to download.",
      "That booking we just made? In the next episode, we switch sides and handle it as the service advisor."],
  ar=["هذه «سالس أوتو» من عين عميلك — وهنا تبدأ قصتنا مع أمل وسيارتها الكامري.",
      "بحساب العميل، لديك لوحة شخصية: سياراتك، مواعيدك، فواتيرك، ومتابعة حية للصيانة — كل ذلك في مكان واحد.",
      "لكل سيارة سجل رقمي كامل، فيعرف العميل دائماً ما تم إنجازه ومتى.",
      "تحتاج صيانة؟ «ابحث عن ورشة» تجد لك أقرب ورشة في الشبكة...",
      "...والحجز يستغرق ثوانٍ: اختر السيارة والخدمة والموعد، ثم أكّد — وتصل الورشة الحجز فوراً. تذكّروا هذا الحجز؛ سنتابعه طوال السلسلة.",
      "وحين يبدأ العمل، تعرض «متابعة الخدمة» التقدم لحظة بلحظة: استلام، تشخيص، إصلاح، جاهزة للتسليم — بتحديث فوري.",
      "وإذا وجدت الورشة عملاً إضافياً، أرسلت عرض سعر توافق عليه أمل أو ترفضه من هنا — بلا مكالمات، وبشفافية كاملة.",
      "وهناك متجر لقطع الغيار والإكسسوارات، وكل فاتورة محفوظة في البوابة وجاهزة للتنزيل.",
      "الحجز الذي أنشأناه للتو؟ في الحلقة القادمة ننتقل إلى الطرف الآخر، ونستقبله بصفتنا مستشار الخدمة فيصل."]),
 'ep04': dict(dur=90, starts=[0,7,16,24,38,52,66,74,82],
  en=["The service advisor is the bridge between the customer and the workshop — and their portal is built around exactly that job.",
      "Log in with the advisor demo account, and you land on a dashboard of today's appointments, active jobs, and pending estimates.",
      "And there it is — the booking our customer made in the last episode, waiting at the top of the list.",
      "When the car arrives, Vehicle Check-In captures its condition: mileage, fuel level, existing damage — protecting both the garage and the customer.",
      "From check-in, one click opens a job card. Add the service lines, assign a technician, and the job is officially in the workshop.",
      "Next, the estimate. Parts and labor are priced from the catalog, and sending it pushes a quotation straight to the customer's portal — the same approval screen we saw in Episode 3.",
      "All communication is logged here too — messages, status updates, even SMS reminders.",
      "Active Jobs tracks everything in progress, so the front desk always has an answer when a customer calls.",
      "The job card is now assigned. Next episode: the technician's side of the story."],
  ar=["مستشار الخدمة هو حلقة الوصل بين العميل والورشة — وبوابته مبنية لهذه المهمة بالضبط.",
      "سجّل الدخول بحساب المستشار التجريبي، وستصل إلى لوحة اليوم: المواعيد، والأعمال الجارية، وعروض الأسعار المعلّقة.",
      "وها هو — حجز أمل الذي أنشأناه في الحلقة الماضية، في أعلى القائمة.",
      "عند وصول السيارة، يوثّق «استلام المركبة» حالتها: العداد، والوقود، والأضرار السابقة — حمايةً للورشة والعميل معاً.",
      "ومن الاستلام، بنقرة واحدة تُفتح بطاقة العمل: أضف بنود الخدمة، وعيّن الفني، وتدخل السيارة الورشة رسمياً.",
      "ثم عرض السعر: قطع الغيار والعمالة تُسعَّر من الكتالوج، وبإرساله يصل العرض مباشرة إلى بوابة أمل — نفس شاشة الموافقة التي رأيناها.",
      "وكل التواصل مسجّل هنا أيضاً: الرسائل، وتحديثات الحالة، وحتى تذكيرات الرسائل النصية.",
      "وتعرض «الأعمال الجارية» كل ما يدور في الورشة، فيملك موظف الاستقبال الجواب دائماً حين يتصل عميل.",
      "بطاقة العمل أُسندت الآن. الحلقة القادمة: القصة من جهة الفني سعد."]),
 'ep05': dict(dur=60, starts=[0,8,17,27,38,50],
  en=["Out on the workshop floor, technicians don't need dashboards full of finance charts — they need their jobs. That's all this portal shows.",
      "Log in with the technician demo account, and the job our advisor assigned in the last episode is sitting right in the queue.",
      "Opening it shows everything the tech needs: the service lines, the vehicle's history, and the advisor's check-in notes.",
      "Starting the job starts the clock. Time tracking runs per job, feeding labor costs straight into the invoice later — no paper timesheets.",
      "As the tech progresses the work, every status change ripples outward — the advisor's board updates, and the customer's live tracker moves in real time.",
      "One thing's missing before this job can finish: parts. Next up, the store keeper."],
  ar=["في صالة الورشة، لا يحتاج الفني لوحات مالية — يحتاج أعماله فقط. وهذا كل ما تعرضه هذه البوابة.",
      "سجّل الدخول بحساب الفني، وستجد العمل الذي أسنده فيصل في الحلقة الماضية بانتظارك في القائمة.",
      "افتح بطاقة العمل لترى كل ما يحتاجه سعد: بنود الخدمة، وتاريخ السيارة، وملاحظات الاستلام.",
      "بدء العمل يشغّل العدّاد: تتبع الوقت يعمل لكل مهمة، وتصب تكلفة العمالة مباشرة في الفاتورة لاحقاً — بلا أوراق دوام.",
      "ومع تقدم العمل، ينتشر كل تحديث تلقائياً: لوحة فيصل تتحدّث، ومتابعة أمل على جوالها تتحرك لحظياً.",
      "لكن العمل لا يكتمل بلا قطع الغيار. التالي: أمين المستودع سالم."]),
 'ep06': dict(dur=75, starts=[0,8,18,34,42,56,68],
  en=["Every repair runs on parts — and parts are money sitting on shelves. The store keeper portal keeps both under control.",
      "The stock overview shows every part in the store: quantities, locations, and values, searchable in seconds.",
      "Here's our job from the last episode. Issuing parts against it takes three clicks — and watch the stock count: it updates the moment we confirm, and the parts' cost lands on the job automatically.",
      "When stock runs low, the platform flags it before it becomes a problem...",
      "...and it goes further: predictive demand forecasting suggests what to reorder and when, based on real usage — so fast-moving parts never run out mid-job.",
      "Receiving deliveries is just as quick — scan barcodes, match against the purchase order, and shelves are up to date.",
      "Parts issued, job complete. Time to get paid — the finance portal is next."],
  ar=["كل إصلاح يقوم على قطع الغيار — والقطع أموال نائمة على الرفوف. بوابة أمين المستودع تضبط الاثنين معاً.",
      "نظرة المخزون تعرض كل قطعة في المستودع: الكميات والمواقع والقيم، مع بحث في ثوانٍ.",
      "وهذا عملنا من الحلقة الماضية. صرف القطع عليه ثلاث نقرات — ولاحظ الرصيد: يتحدّث فور التأكيد، وتكلفة القطع تُحمَّل على العمل تلقائياً.",
      "وحين ينخفض المخزون، ينبهك النظام قبل أن تتحول المشكلة إلى أزمة...",
      "...بل يذهب أبعد: توقّع الطلب الذكي يقترح ماذا تطلب ومتى بناءً على الاستهلاك الفعلي — فلا تنفد القطع السريعة في منتصف عمل.",
      "واستلام التوريدات بنفس السهولة: امسح الباركود، وطابق مع أمر الشراء، وتتحدّث الرفوف.",
      "القطع صُرفت، والعمل اكتمل. حان وقت التحصيل — بوابة المالية في الحلقة القادمة."]),
 'ep07': dict(dur=90, starts=[0,8,18,34,48,58,68,80],
  en=["Labor hours from the technician, parts from the store keeper — it all flows here, into the finance portal.",
      "The finance dashboard gives an accountant the whole picture at a glance: revenue, outstanding invoices, and expenses.",
      "Here's the invoice for our job — and notice: the labor lines come from the technician's tracked time, the parts lines from the store keeper's issue. Nobody typed any of this twice.",
      "Now the Saudi part. Fifteen percent VAT is calculated automatically, and every invoice carries a ZATCA-compliant QR code for e-invoicing — scannable and verifiable, exactly as the regulation requires.",
      "Dates print in both Gregorian and Hijri, and documents export to PDF and Excel with full Arabic support.",
      "Recording payment closes the loop — cash, card, or online.",
      "And when the tax period ends, the VAT report is already built. P&L, revenue, payroll, budgets — the whole back office lives in this one portal.",
      "Job done, invoice paid. But what happens when a customer needs help? That's the next episode."],
  ar=["ساعات الفني، وقطع المستودع — كل شيء يصب هنا، في بوابة المالية عند نورة.",
      "لوحة المالية تمنح المحاسب الصورة كاملة بنظرة واحدة: الإيرادات، والفواتير المستحقة، والمصروفات.",
      "وها هي فاتورة عملنا — ولاحظوا: بنود العمالة من وقت الفني المسجّل، وبنود القطع من صرف المستودع. لا أحد كتب شيئاً مرتين.",
      "والآن الجانب السعودي: ضريبة خمسة عشر بالمئة تُحسب تلقائياً، وكل فاتورة تحمل رمز QR متوافقاً مع «فاتورة» زاتكا — قابلاً للمسح والتحقق كما يقتضي النظام.",
      "والتواريخ تُطبع هجرياً وميلادياً، والمستندات تُصدَّر PDF وExcel بدعم عربي كامل.",
      "وتسجيل الدفعة يغلق الدائرة — نقداً أو ببطاقة أو عبر الإنترنت.",
      "وحين ينتهي الربع الضريبي، تقرير الضريبة جاهز سلفاً. الأرباح والخسائر، والإيرادات، والرواتب، والميزانيات — كل الإدارة المالية في بوابة واحدة.",
      "العمل أُنجز والفاتورة سُددت. لكن ماذا لو احتاجت أمل مساعدة؟ هذا موضوع الحلقة القادمة مع سارة."]),
 'ep08': dict(dur=60, starts=[0,8,17,28,38,47,55],
  en=["Great garages aren't just good with cars — they're good with people. The support portal is where that happens.",
      "The support demo account opens on the ticket queue: every customer question, sorted by priority and status.",
      "Opening a ticket shows the customer's full history alongside it — their vehicles, jobs, and invoices — so agents never ask a customer to repeat themselves.",
      "Live Chat runs in real time — customers chat from their portal, agents answer here.",
      "SLA tracking keeps response times honest, and anything stuck can be escalated with one click.",
      "A built-in knowledge base answers the common questions, and customer ratings feed back into service quality.",
      "That's the front line covered. Next: the view from the manager's chair."],
  ar=["الورش الممتازة لا تتقن السيارات فقط — بل تتقن التعامل مع الناس. وهنا يحدث ذلك: بوابة الدعم.",
      "حساب الدعم يفتح على قائمة التذاكر: كل استفسارات العملاء مرتبة بالأولوية والحالة.",
      "وبفتح التذكرة يظهر سجل العميل كاملاً بجانبها — سياراته وأعماله وفواتيره — فلا يضطر أحد لإعادة قصته.",
      "والمحادثة الفورية تعمل مباشرة: أمل تكتب من بوابتها، وسارة ترد من هنا.",
      "وتتبع اتفاقيات مستوى الخدمة يحفظ سرعة الاستجابة، وأي تذكرة متعثرة تُصعَّد بنقرة واحدة.",
      "وقاعدة المعرفة تجيب عن الأسئلة الشائعة، وتقييمات العملاء تغذّي جودة الخدمة.",
      "هكذا تبقى أمل مطمئنة. التالي: المشهد من كرسي المدير — أبو خالد."]),
 'ep09': dict(dur=90, starts=[0,7,17,32,45,58,68,80],
  en=["Every episode so far showed one role's slice of the garage. The admin account sees all of it.",
      "Log in as admin, and the main dashboard opens on the numbers that matter: jobs in progress, revenue, bookings, and alerts.",
      "The sidebar is the whole platform, organized as eighteen groups that follow the real flow of a garage — from customer intake at the top to system settings at the bottom. And it's resizable — drag it to fit your screen.",
      "The workshop calendar is where the week gets planned. Jobs drag and drop between days and technicians, with availability checked as you move them.",
      "The service bay dashboard shows the floor in real time — which bay is occupied, who's working in it, and how far along each job is. It updates live, no refresh needed.",
      "On the growth side, a tiered loyalty program rewards repeat customers automatically — points, tiers, and referral bonuses.",
      "And analytics ties it together: revenue trends, technician productivity, parts turnover — the numbers to run the business on, not guesswork.",
      "That's one garage, fully managed. But SALIS AUTO scales further — the final episode shows the multi-tenant platform admin view."],
  ar=["كل حلقة سابقة أرت جانباً واحداً من الورشة. حساب المدير يرى كل شيء — هذا صباح أبو خالد الجديد.",
      "سجّل الدخول كمدير، وتفتح اللوحة الرئيسية على الأرقام المهمة: الأعمال الجارية، والإيرادات، والحجوزات، والتنبيهات.",
      "القائمة الجانبية هي المنصة كلها: ثمانية عشر قسماً تسير كما تسير الورشة فعلاً — من استقبال العميل حتى إعدادات النظام. وهي قابلة لتعديل العرض بالسحب.",
      "وتقويم الورشة هو مكان تخطيط الأسبوع: اسحب الأعمال وأفلتها بين الأيام والفنيين، والنظام يتحقق من التوافر أثناء الحركة.",
      "ولوحة أحواض الخدمة تعرض أرض الورشة لحظياً: أي حوض مشغول، ومن يعمل فيه، وأين وصل كل عمل — تحديث حي بلا إنعاش للصفحة.",
      "وفي جانب النمو، برنامج ولاء متدرج يكافئ العملاء الدائمين تلقائياً: نقاط وفئات ومكافآت إحالة.",
      "والتحليلات تجمع الخيوط: اتجاهات الإيراد، وإنتاجية الفنيين، ودوران القطع — أرقام تُدار بها الورشة، لا تخمين.",
      "هذه ورشة واحدة بكامل إدارتها. لكن «سالس أوتو» تكبر أكثر — الحلقة القادمة تعرض إدارة الشبكة متعددة الورش."]),
 'ep10': dict(dur=75, starts=[0,8,20,28,38,46,58,64],
  en=["One garage is a business. Many garages are a network — and this is the account that runs the network.",
      "The super admin lands in a dedicated full-screen console with eight tabs: Overview, Garages, Suppliers, E-Commerce, Help and Support, Billing, Roles, and System Health.",
      "Overview aggregates the entire platform — every garage, every user, every riyal — in one set of numbers.",
      "The Garages tab manages the tenants themselves: onboard a new location, and it gets its own isolated data, users, and settings.",
      "Suppliers and e-commerce stores across the network are managed centrally too.",
      "And this is what powers everything you've seen in this series: twenty-four professional roles with granular permissions across more than a hundred and fifty resources. Roles decide the portal, the sidebar, and every API call.",
      "System Health keeps an eye on the machine itself.",
      "And that's the series — one platform, nine roles, one repair followed from booking to payment. Every account you saw is free to try. Grab the credentials, log in, and explore SALIS AUTO for yourself."],
  ar=["ورشة واحدة عملٌ تجاري. وورش كثيرة شبكة — وهذا هو الحساب الذي يدير الشبكة.",
      "المشرف العام يدخل إلى وحدة تحكم مستقلة بثماني تبويبات: نظرة عامة، الورش، الموردون، التجارة الإلكترونية، الدعم، الفوترة، الأدوار، وصحة النظام.",
      "«نظرة عامة» تجمع المنصة كلها — كل ورشة، وكل مستخدم، وكل ريال — في أرقام واحدة.",
      "وتبويب «الورش» يدير الفروع نفسها: أضف موقعاً جديداً، فيحصل على بياناته ومستخدميه وإعداداته المعزولة.",
      "والموردون والمتاجر الإلكترونية عبر الشبكة يُدارون مركزياً كذلك.",
      "وهذا ما يشغّل كل ما رأيتموه في السلسلة: أربعة وعشرون دوراً مهنياً بصلاحيات دقيقة على أكثر من مئة وخمسين مورداً. الأدوار تحدد البوابة والقوائم وكل طلب.",
      "و«صحة النظام» تراقب المحرك نفسه.",
      "وهذه نهاية السلسلة: منصة واحدة، وتسعة أدوار، وسيارة واحدة تابعناها من الحجز إلى الدفع. كل حساب رأيتموه مجاني للتجربة. خذوا البيانات، وسجّلوا الدخول، واستكشفوا «سالس أوتو» بأنفسكم."]),
 'ep11': dict(dur=96, starts=[0,10,22,36,50,62,74,86],
  en=["Welcome! I'm Abu Khalid, and this is my garage. Let me show you why I say this platform \"gets us.\"",
      "First thing: the Arabic here isn't a bolted-on translation. The whole interface is right-to-left, the way we read and write. Every screen, every report.",
      "Second: the date. For us, Hijri isn't a luxury — contracts, salaries, appointments. Here every document carries both dates, Hijri and Gregorian, without you doing the math.",
      "And VAT? Fifteen percent calculated automatically, and every invoice carries the ZATCA Fatoora QR. My accountant used to lose sleep at month's end — now he prints and goes home.",
      "There are Zakat settings too, and TRN validation — fifteen digits the system checks by itself. Our regulations, not imported ones.",
      "And you know our seasons — before Eid and the holidays, the garage flips upside down. This calendar takes the pressure: drag and drop, and every technician knows what's on him.",
      "And your customer? An Arabic SMS with the appointment, and live tracking from their phone. That transparency is what builds reputation here — and reputation is everything.",
      "In short: a platform that speaks our language and runs by our rules. Try it free — the demo accounts are in the description. God grant you success."],
  ar=["يا هلا والله. أنا أبو خالد، وهذي ورشتي. خلني أوريك ليش أقول إن هالمنصة «تفهمنا».",
      "أول شي: العربي هنا مو ترجمة مركّبة. الواجهة كلها من اليمين لليسار، زي ما نقرأ ونكتب. كل شاشة، كل تقرير.",
      "ثاني شي: التاريخ. عندنا الهجري مو رفاهية — عقود، رواتب، مواعيد. هنا كل مستند يطلع بالتاريخين، هجري وميلادي، بدون ما تحسب أنت.",
      "والضريبة؟ خمسطعشر بالمية محسوبة لحالها، وكل فاتورة فيها رمز «فاتورة» حق زاتكا. المحاسب عندي كان يسهر آخر كل شهر — الحين يطبع ويمشي.",
      "وفيه إعدادات الزكاة، والتحقق من الرقم الضريبي — خمسطعشر خانة يدقق عليها النظام بنفسه. أنظمتنا، مو أنظمة مستوردة.",
      "وأنت تعرف مواسمنا — قبل العيد والإجازات، الورشة تنقلب. التقويم هذا يشيل الضغط: تسحب وتفلت، وكل فني يعرف وش عليه.",
      "وعميلك؟ توصله رسالة بالعربي فيها موعده، ويتابع سيارته من جواله أول بأول. الشفافية هذي هي اللي تبني السمعة عندنا — والسمعة كل شي.",
      "قصتها باختصار: منصة تتكلم لغتنا وتمشي على أنظمتنا. جرّبها ببلاش، والحسابات التجريبية في وصف الفيديو. الله يوفقكم."]),
}

def dur_of(p):
    with contextlib.closing(wave.open(p, 'rb')) as w:
        return w.getnframes() / w.getframerate()

def to_wav(src, dst):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-ar', '44100', '-ac', '2', dst], check=True)

async def synth(txt, voice, rate, out):
    kw = dict(voice=voice, proxy=PROXY)
    if rate:
        kw['rate'] = rate
    await edge_tts.Communicate(txt, **kw).save(out)

async def build(ep, lang):
    cfg = EP[ep]
    lines = cfg[lang]
    starts = cfg['starts']
    voice = VOICES[lang]
    wdir = f'vt-{ep}-{lang}'
    os.makedirs(wdir, exist_ok=True)
    placed, cursor = [], 0.0
    for i, (t0, line) in enumerate(zip(starts, lines)):
        slot_end = (starts[i + 1] if i + 1 < len(starts) else cfg['dur']) - 0.3
        mp3, wav_ = f'{wdir}/l{i}.mp3', f'{wdir}/l{i}.wav'
        await synth(line, voice, None, mp3)
        to_wav(mp3, wav_)
        d = dur_of(wav_)
        at = max(t0 + 0.4, cursor + GAP)
        slot = slot_end - at
        if d > slot > 0:
            pct = min(int((d / slot - 1) * 100) + 3, MAX_RATE)
            await synth(line, voice, f'+{pct}%', mp3)
            to_wav(mp3, wav_)
            d = dur_of(wav_)
        drift = at - (t0 + 0.4)
        note = f' (pushed +{drift:.1f}s)' if drift > 0.05 else ''
        print(f'  [{ep}-{lang}] line {i}: at {at:.1f}s, {d:.1f}s{note}')
        placed.append((at, wav_))
        cursor = at + d
    # assemble: silence bed + delayed clips
    inputs = ['-f', 'lavfi', '-t', str(cfg['dur']), '-i', 'anullsrc=r=44100:cl=stereo']
    fparts, labels = [], ['[0:a]']
    for j, (at, wav_) in enumerate(placed):
        inputs += ['-i', wav_]
        ms = int(at * 1000)
        fparts.append(f'[{j+1}:a]adelay={ms}|{ms}[v{j}]')
        labels.append(f'[v{j}]')
    fparts.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.95[out]')
    out = f'voice-tracks/{ep}-{lang}.mp3'
    os.makedirs('voice-tracks', exist_ok=True)
    subprocess.run([FF, '-y', '-loglevel', 'error'] + inputs +
                   ['-filter_complex', ';'.join(fparts), '-map', '[out]',
                    '-c:a', 'libmp3lame', '-b:a', '128k', out], check=True)
    print(f'[{ep}-{lang}] -> {out}')

async def main():
    targets = sys.argv[1:] or [f'{ep}-{lang}' for ep in EP for lang in ('en', 'ar')]
    for t in targets:
        ep, lang = t.rsplit('-', 1)
        await build(ep, lang)

asyncio.run(main())
