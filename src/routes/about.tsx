import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "مسكرين | عن التطبيق وسياسة الخصوصية" },
      {
        name: "description",
        content:
          "معلومات عن تطبيق مسكرين التنبيه الطبي، وسياسة الخصوصية: التطبيق لا يجمع أي بيانات شخصية ويعمل بالكامل على جهازك.",
      },
      { property: "og:title", content: "مسكرين | عن التطبيق وسياسة الخصوصية" },
      {
        property: "og:description",
        content: "تنبيه طبي وسياسة خصوصية تطبيق مسكرين — لا يتم جمع أي بيانات شخصية.",
      },
    ],
  }),
  component: AboutScreen,
});

function AboutScreen() {
  return (
    <main
      className="safe-x mx-auto max-w-md scroll-native"
      style={{
        paddingTop: "calc(var(--safe-top) + 1rem)",
        paddingBottom: "calc(var(--tabbar-height) + var(--safe-bottom) + 1.5rem)",
      }}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate text-2xl font-extrabold text-primary">عن التطبيق</h1>
        <Link
          to="/"
          aria-label="رجوع إلى البحث"
          className="tap press grid shrink-0 place-items-center rounded-xl bg-card text-primary active:press-active"
        >
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <section className="card-surface mt-4 p-4">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
          <HeartPulse aria-hidden="true" className="size-5 text-destructive" />
          تنبيه طبي مهم
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          مسكرين تطبيق تعليمي لحساب القيم الغذائية التقديرية (الكربوهيدرات، البروتين، الدهون،
          السعرات، المؤشر والحمل الجلايسيمي). لا يقدّم التطبيق تشخيصًا أو علاجًا أو جرعات إنسولين،
          ولا يُغني عن استشارة الطبيب أو أخصائي التغذية. القيم تقديرية وقد تختلف حسب طريقة الطهي
          والمصدر، ويجب دائمًا مراجعة الطبيب المعالج قبل أي تغيير في الخطة الغذائية أو الدوائية.
        </p>
      </section>

      <section className="card-surface mt-3 p-4">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
          <ShieldCheck aria-hidden="true" className="size-5 text-success" />
          سياسة الخصوصية
        </h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>لا يجمع التطبيق أي بيانات شخصية ولا يطلب إنشاء حساب.</li>
          <li>لا يستخدم التطبيق أي أدوات تتبّع أو إعلانات أو تحليلات لسلوك المستخدم.</li>
          <li>
            تُحفظ وجبتك الحالية فقط على جهازك (التخزين المحلي)، ويمكنك حذفها في أي وقت من شاشة
            الوجبة.
          </li>
          <li>لا يطلب التطبيق أي أذونات للجهاز مثل الكاميرا أو الموقع أو جهات الاتصال.</li>
          <li>قاعدة بيانات الأطعمة مضمّنة داخل التطبيق ويعمل البحث بدون اتصال بالإنترنت.</li>
        </ul>
      </section>

      <p className="mt-4 text-center text-xs font-bold text-muted-foreground">
        مسكرين · دليل التغذية لمرضى السكري
      </p>
    </main>
  );
}
