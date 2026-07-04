# רשימת קניות משפחתית

אפליקציית PWA לרשימת קניות משותפת למשפחה, בעברית ו-RTL, עם סנכרון בזמן אמת דרך Supabase.
בלי התחברות, בלי משתמשים — כל מי שנכנס לקישור רואה ועורך את אותה רשימה.

## מה בפנים

- **React + Vite** — צד לקוח בלבד, אין שרת נפרד.
- **Supabase** — מסד נתונים (Postgres) + סנכרון בזמן אמת (Realtime). ה-client מתחבר אליו ישירות.
- **Render** — אחסון (Static Site) שמגיש את הקבצים הסטטיים אחרי בנייה.

שני מסכים בלבד, בדיוק לפי האפיון: מסך חנויות, ומסך פריטים לחנות בודדת.

---

## שלב 1 — הקמת Supabase

1. נכנסים ל-[supabase.com](https://supabase.com) ופותחים פרויקט חדש (יש טיר חינמי).
2. בתפריט השמאלי: **SQL Editor → New query**.
3. מעתיקים את כל התוכן של `supabase/schema.sql` (בתיקיית הפרויקט הזו) ומריצים (Run).
   הסקריפט יוצר את הטבלאות `stores` / `items` / `product_suggestions`, מפעיל Row Level Security עם מדיניות פתוחה (כי אין authentication — כך ביקשת באפיון), ומפעיל Realtime.
4. בתפריט **Project Settings → API** מעתיקים שני ערכים:
   - `Project URL`
   - `anon public` key

   ⚠️ שני אלה יגיעו לקוד הצד-לקוח (זה תקין ומקובל ב-Supabase), אבל הם נותנים גישת קריאה/כתיבה מלאה לנתונים כי אין authentication. זה בסדר גמור לרשימת קניות משפחתית פרטית — פשוט לא לשתף את כתובת האפליקציה בפומבי.

---

## שלב 2 — העלאה ל-GitHub

```bash
cd family-shopping-list
git init
git add .
git commit -m "Family shopping list app"
```

יוצרים repo חדש (ריק) ב-GitHub, ואז:

```bash
git remote add origin https://github.com/USERNAME/family-shopping-list.git
git branch -M main
git push -u origin main
```

(קובץ `.env` לא יעלה — הוא ב-`.gitignore` בכוונה, כי הוא מיועד לערכים מקומיים בלבד.)

---

## שלב 3 — פריסה ב-Render

1. ב-[Render](https://render.com): **New → Static Site**.
2. מחברים את ה-repo מ-GitHub.
3. הגדרות בנייה:
   - **Build Command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. תחת **Environment**, מוסיפים שני משתנים (הערכים מ-Supabase בשלב 1):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Create Static Site — Render יבנה ויפרוס אוטומטית. כל push ל-`main` יעדכן את האתר.

בסיום תקבלו כתובת כמו `https://family-shopping-list.onrender.com` — זה הקישור לשתף עם המשפחה.

יש גם קובץ `render.yaml` בתיקייה שמאפשר "Blueprint deploy" ישיר מ-Render אם רוצים לדלג על ההגדרה הידנית.

### התקנה כאפליקציה בנייד

זו PWA — כשפותחים את הקישור מהנייד (Android/iPhone) אפשר "הוספה למסך הבית" מתפריט הדפדפן, והיא תיפתח כמו אפליקציה רגילה.

---

## פיתוח מקומי

```bash
npm install
cp .env.example .env   # וממלאים את הערכים מ-Supabase
npm run dev
```

## הערות על החלטות שלא היו כתובות באפיון במפורש

- **הגדרות (Smart Search, אישור לפני מחיקה)** נשמרות מקומית בכל מכשיר (localStorage), לא בטבלה משותפת — כי האפיון לא הגדיר טבלת settings, וזה מונע מצב שבו בן משפחה אחד מכבה הגדרה לכולם בטעות.
- **שם ומידה (quantity) של פריט קיים** ניתנים לעריכה ישירה בשורה (לא רק בזמן יצירה), כי זה עקבי עם עיקרון "no save buttons — auto-save only".
- הפריסה ל-Render כ-**Static Site** בלבד (אין שרת Node) כי כל התקשורת מול הדאטהבייס עוברת ישירות מהדפדפן ל-Supabase — אין צורך ב-backend.
