import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "J.TEST - Định Hướng Mục Tiêu" },
      {
        name: "description",
        content:
          "Công cụ đánh giá thời điểm và kỳ thi tối ưu để đạt chứng chỉ tiếng Nhật cho Du học hoặc Miễn thi môn Ngoại ngữ THPT.",
      },
      { property: "og:title", content: "J.TEST - Định Hướng Mục Tiêu" },
      {
        property: "og:description",
        content:
          "Công cụ đánh giá thời điểm và kỳ thi tối ưu để đạt chứng chỉ tiếng Nhật cho Du học hoặc Miễn thi môn Ngoại ngữ THPT.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

type Goal = "school" | "thpt";
type SchoolLevel = "have" | "studying" | "none";
type ThptLevel = "n3" | "n4" | "n5" | "below";

interface ExamOccurrence {
  type: "JTEST" | "JLPT";
  date: Date;
  label: string;
}

function addMonths(d: Date, m: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
}
function diffMonths(a: Date, b: Date) {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()) +
    (b.getDate() >= a.getDate() ? 0 : -1)
  );
}
function fmtYM(d: Date) {
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Generate J.TEST (odd months, day 15) and JLPT (Jul/Dec, day 7) occurrences within range
function buildExams(from: Date, to: Date): ExamOccurrence[] {
  const out: ExamOccurrence[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  let cursor = new Date(start);
  while (cursor <= to) {
    const m = cursor.getMonth() + 1;
    if (m % 2 === 1) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
      if (d >= from && d <= to)
        out.push({ type: "JTEST", date: d, label: fmtYM(d) });
    }
    if (m === 7 || m === 12) {
      const day = m === 7 ? 6 : 7;
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      if (d >= from && d <= to)
        out.push({ type: "JLPT", date: d, label: fmtYM(d) });
    }
    cursor = addMonths(cursor, 1);
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function Index() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [schoolMonth, setSchoolMonth] = useState<string>("");
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | "">("");
  const [thptYear, setThptYear] = useState<string>("");
  const [thptLevel, setThptLevel] = useState<ThptLevel | "">("");
  const [showResult, setShowResult] = useState(false);

  const now = useMemo(() => new Date(), []);

  // school entry month options: from current+3 months, only 1/4/7/10, up to 3 years
  const schoolOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const min = addMonths(now, 3);
    for (let i = 0; i < 36; i++) {
      const d = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), i);
      const m = d.getMonth() + 1;
      if (![1, 4, 7, 10].includes(m)) continue;
      if (d < new Date(min.getFullYear(), min.getMonth(), 1)) continue;
      opts.push({
        value: `${d.getFullYear()}-${m}`,
        label: `Nhập học Tháng ${m}/${d.getFullYear()}`,
      });
    }
    return opts;
  }, [now]);

  const thptOptions = useMemo(() => {
    const y = now.getFullYear();
    const list: { value: string; label: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const yr = y + i;
      const target = new Date(yr, 5, 26);
      if (target > now)
        list.push({
          value: String(yr),
          label: `Năm thi THPT ${yr}（Tháng 6/${yr}）`,
        });
    }
    return list.slice(0, 3);
  }, [now]);

  const canDiagnose =
    (goal === "school" && schoolMonth && schoolLevel) ||
    (goal === "thpt" && thptYear && thptLevel);

  const result = useMemo(() => {
    if (!showResult || !canDiagnose) return null;

    let targetDate: Date;
    let targetLabel: string;
    let monthsNeeded: number;
    let jtestTargetLabel: string;
    let jlptTargetLabel: string;

    if (goal === "school") {
      const [y, m] = schoolMonth.split("-").map(Number);
      targetDate = new Date(y, m - 1, 1);
      targetLabel = `Nhập học Tháng ${m}/${y}`;
      monthsNeeded =
        schoolLevel === "have" ? 0 : schoolLevel === "studying" ? 2 : 3;
      jtestTargetLabel = "J.TEST Cấp độ F";
      jlptTargetLabel = "JLPT N5";
    } else {
      const y = Number(thptYear);
      targetDate = new Date(y, 5, 26);
      targetLabel = `Năm thi THPT ${y}`;
      monthsNeeded =
        thptLevel === "n3"
          ? 0
          : thptLevel === "n4"
          ? 6
          : thptLevel === "n5"
          ? 15
          : 22;
      jtestTargetLabel = "J.TEST Cấp độ D";
      jlptTargetLabel = "JLPT N3";
    }

    const remaining = diffMonths(now, targetDate);
    const readyDate = addMonths(now, monthsNeeded);
    const readyMonthStart = new Date(
      readyDate.getFullYear(),
      readyDate.getMonth(),
      1,
    );

    const exams = buildExams(now, targetDate);
    const eligible = exams.filter((e) => e.date >= readyMonthStart);
    const jtestAll = exams.filter((e) => e.type === "JTEST");
    const jlptAll = exams.filter((e) => e.type === "JLPT");
    const jtestNext = eligible.find((e) => e.type === "JTEST") ?? null;
    const jlptNext = eligible.find((e) => e.type === "JLPT") ?? null;

    const fastest: "JTEST" | "JLPT" | null =
      jtestNext && jlptNext
        ? jtestNext.date <= jlptNext.date
          ? "JTEST"
          : "JLPT"
        : jtestNext
        ? "JTEST"
        : jlptNext
        ? "JLPT"
        : null;

    let status: "ok" | "warn" | "danger" = "ok";
    if (!fastest) status = "danger";
    else if (remaining < monthsNeeded + 2) status = "warn";

    return {
      goal,
      level: (isSchoolGoalLevel()) as SchoolLevel | ThptLevel,
      targetDate,
      targetLabel,
      remaining,
      monthsNeeded,
      jtestTargetLabel,
      jlptTargetLabel,
      jtestCount: jtestAll.length,
      jlptCount: jlptAll.length,
      jtestNext,
      jlptNext,
      fastest,
      status,
    };

    function isSchoolGoalLevel() {
      return goal === "school" ? schoolLevel : thptLevel;
    }
  }, [showResult, canDiagnose, goal, schoolMonth, schoolLevel, thptYear, thptLevel, now]);

  const reset = () => {
    setShowResult(false);
    setGoal(null);
    setSchoolMonth("");
    setSchoolLevel("");
    setThptYear("");
    setThptLevel("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:pt-12">
        {/* HERO */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            J.TEST VIETNAM
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            J.TEST<br />Định Hướng Mục Tiêu
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Công cụ đánh giá thời điểm và kỳ thi tối ưu để đạt chứng chỉ tiếng Nhật cho Du học hoặc Miễn thi môn Ngoại ngữ THPT.
          </p>
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
            <p className="text-sm font-semibold text-primary">
              J.TEST có thể thi 6 lần/năm（tổ chức vào các tháng lẻ）
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Tổ chức vào tháng 1・3・5・7・9・11. So với JLPT chỉ 2 lần/năm, J.TEST có nhiều cơ hội lấy chứng chỉ hơn và có thể là lộ trình ngắn nhất đến mục tiêu của bạn.
            </p>
          </div>
        </header>

        {!showResult && (
          <>
            {/* GOAL SELECT */}
            <section className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                01 Chọn mục tiêu của bạn
              </h2>
              <div className="grid gap-3">
                <GoalCard
                  active={goal === "school"}
                  onClick={() => setGoal("school")}
                  title="Du học Trường Nhật ngữ"
                  badge="J.TEST Cấp độ F / JLPT N5"
                  desc="Đánh giá khả năng đạt chứng chỉ tiếng Nhật trước tháng nhập học mong muốn"
                />
                <GoalCard
                  active={goal === "thpt"}
                  onClick={() => setGoal("thpt")}
                  title="Miễn thi môn Ngoại ngữ THPT"
                  badge="J.TEST Cấp độ D / JLPT N3"
                  desc="Đánh giá khả năng đáp ứng điều kiện miễn thi trước năm thi THPT"
                />
              </div>
            </section>

            {/* INPUTS */}
            {goal && (
              <section className="mb-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  02 Nhập thông tin hiện tại
                </h2>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  {goal === "school" ? (
                    <>
                      <Label>Tháng/năm nhập học mong muốn</Label>
                      <select
                        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                        value={schoolMonth}
                        onChange={(e) => setSchoolMonth(e.target.value)}
                      >
                        <option value="">Vui lòng chọn</option>
                        {schoolOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>

                      <Label className="mt-5">Trình độ tiếng Nhật hiện tại</Label>
                      <div className="mt-2 grid gap-2">
                        {[
                          { v: "have", l: "Đã đạt Cấp độ F / N5" },
                          { v: "studying", l: "Đang học（chưa đạt）" },
                          { v: "none", l: "Chưa bắt đầu học" },
                        ].map((opt) => (
                          <Radio
                            key={opt.v}
                            name="schoolLevel"
                            checked={schoolLevel === opt.v}
                            onChange={() => setSchoolLevel(opt.v as SchoolLevel)}
                            label={opt.l}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Label>Năm thi THPT dự kiến</Label>
                      <select
                        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                        value={thptYear}
                        onChange={(e) => setThptYear(e.target.value)}
                      >
                        <option value="">Vui lòng chọn</option>
                        {thptOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>

                      <Label className="mt-5">Trình độ tiếng Nhật hiện tại</Label>
                      <div className="mt-2 grid gap-2">
                        {[
                          { v: "n3", l: "Đã đạt N3 / J.TEST Cấp độ D trở lên" },
                          { v: "n4", l: "Tương đương N4（Đang học J.TEST Cấp độ C〜D）" },
                          { v: "n5", l: "Tương đương N5（J.TEST Cấp độ D〜F）" },
                          { v: "below", l: "Dưới N5・hầu như chưa học" },
                        ].map((opt) => (
                          <Radio
                            key={opt.v}
                            name="thptLevel"
                            checked={thptLevel === opt.v}
                            onChange={() => setThptLevel(opt.v as ThptLevel)}
                            label={opt.l}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <button
              disabled={!canDiagnose}
              onClick={() => {
                setShowResult(true);
                setTimeout(
                  () => window.scrollTo({ top: 0, behavior: "smooth" }),
                  0,
                );
              }}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kiểm tra ngay
            </button>
          </>
        )}

        {showResult && result && <Result result={result} onReset={reset} />}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Powered by J.TEST VIETNAM
        </footer>
      </main>
    </div>
  );
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-xs font-semibold text-foreground ${className}`}>
      {children}
    </div>
  );
}

function Radio({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
        checked
          ? "border-primary bg-primary-soft"
          : "border-border bg-background hover:bg-secondary"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function GoalCard({
  active,
  onClick,
  title,
  badge,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  badge: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition-all ${
        active
          ? "border-primary bg-primary-soft ring-2 ring-primary/30"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold">{title}</div>
          <div className="mt-1 inline-block rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {badge}
          </div>
        </div>
        <div
          className={`h-5 w-5 shrink-0 rounded-full border-2 ${
            active ? "border-primary bg-primary" : "border-border"
          }`}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </button>
  );
}

function Result({
  result,
  onReset,
}: {
  result: NonNullable<ReturnType<typeof useDummy>>;
  onReset: () => void;
}) {
  const isSchool = result.goal === "school";
  const remainLabel = isSchool ? "Đến ngày nhập học" : "Đến kỳ thi THPT";

  const prepNote: string | null = (() => {
    if (isSchool) {
      if (result.level === "studying")
        return "Dựa trên tình trạng học tập hiện tại, chúng tôi hiển thị tháng thi với thời gian chuẩn bị tối thiểu khoảng 2 tháng. Nếu muốn thi sớm hơn, hãy xác nhận trình độ hiện tại qua PreCheck.";
      if (result.level === "none")
        return "Chúng tôi hiển thị tháng thi sớm nhất với thời gian học khuyến nghị 3 tháng. Nếu muốn thi ngay, hãy xác nhận trình độ hiện tại qua PreCheck.";
      return null;
    }
    if (result.level === "n4")
      return "Dựa trên trình độ N4, chúng tôi hiển thị tháng thi với thời gian chuẩn bị khoảng 6 tháng. Nếu muốn thi sớm hơn, hãy xác nhận trình độ chính xác qua PreCheck.";
    if (result.level === "n5")
      return "Dựa trên trình độ hiện tại, thời gian chuẩn bị khuyến nghị là khoảng 15 tháng. Hãy xác nhận trình độ chính xác của bạn qua PreCheck.";
    if (result.level === "below")
      return "Dựa trên trình độ hiện tại, thời gian chuẩn bị khuyến nghị là khoảng 22 tháng. Hãy xác nhận trình độ chính xác của bạn qua PreCheck.";
    return null;
  })();

  const precheckUrl =
    isSchool || result.level === "n5" || result.level === "below"
      ? "https://precheck-fg-01.lovable.app/"
      : "https://precheck-de-01.lovable.app/";

  const statusColor =
    result.status === "ok"
      ? "bg-success-soft text-success border-success/30"
      : result.status === "warn"
      ? "bg-warning-soft text-warning-foreground border-warning/40"
      : "bg-danger-soft text-danger border-danger/30";

  const statusLabel =
    result.status === "ok"
      ? "Có thể đạt được"
      : result.status === "warn"
      ? "Chú ý"
      : "Nguy hiểm";

  const fastestText =
    result.fastest === "JTEST"
      ? `Lộ trình nhanh nhất là J.TEST（${result.jtestNext?.label}）.`
      : result.fastest === "JLPT"
      ? `Lộ trình nhanh nhất là JLPT（${result.jlptNext?.label}）.`
      : "Không còn cơ hội thi kịp trước thời hạn mục tiêu. Khuyến nghị xem xét lại thời hạn.";

  // Build timeline
  const timeline: { date: string; text: string; highlight?: boolean }[] = [];
  timeline.push({ date: "Hiện tại", text: "Bắt đầu học" });
  timeline.push({ date: "Hiện tại", text: "Làm PreCheck" });
  const fastestExam =
    result.fastest === "JTEST" ? result.jtestNext : result.jlptNext;
  if (fastestExam) {
    timeline.push({
      date: fastestExam.label,
      text: `Thi ${fastestExam.type === "JTEST" ? result.jtestTargetLabel : result.jlptTargetLabel}（Đạt mục tiêu）`,
      highlight: true,
    });
  }
  if (isSchool && fastestExam) {
    timeline.push({
      date: fmtYM(addMonths(fastestExam.date, 1)),
      text: "Bắt đầu chuẩn bị hồ sơ đăng ký",
    });
    timeline.push({ date: result.targetLabel, text: "Nhập học" });
  } else if (!isSchool && fastestExam) {
    timeline.push({
      date: fmtYM(new Date(result.targetDate.getFullYear(), 3, 1)),
      text: "Chuẩn bị hồ sơ xin miễn thi THPT",
    });
    timeline.push({ date: fmtYM(result.targetDate), text: "Kỳ thi THPT" });
  }

  const actions: string[] = isSchool
    ? [
        "Trước tiên, xác nhận trình độ tiếng Nhật hiện tại qua PreCheck",
        result.fastest === "JTEST"
          ? `Lộ trình nhanh nhất: Đăng ký thi J.TEST Cấp độ F（${result.jtestNext?.label}）ngay bây giờ`
          : result.fastest === "JLPT"
          ? `Lộ trình nhanh nhất: Đăng ký thi JLPT N5（${result.jlptNext?.label}）ngay bây giờ`
          : "Cân nhắc dời thời hạn mục tiêu lùi lại một chu kỳ",
        "Xác nhận lịch đăng ký với trường mong muốn và chuẩn bị hồ sơ cần thiết sớm",
      ]
    : [
        "Trước tiên, xác nhận trình độ hiện tại qua PreCheck và lập kế hoạch học đến Cấp độ D/N3",
        result.fastest === "JTEST"
          ? `Lộ trình nhanh nhất: Đăng ký thi J.TEST Cấp độ D（${result.jtestNext?.label}）ngay bây giờ`
          : result.fastest === "JLPT"
          ? `Lộ trình nhanh nhất: Đăng ký thi JLPT N3（${result.jlptNext?.label}）ngay bây giờ`
          : "Xem xét lại thời điểm bắt đầu học và năm mục tiêu",
        "J.TEST Cấp độ D có thể dùng làm điều kiện miễn thi môn Ngoại ngữ THPT",
      ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Kết quả đánh giá
          </div>
          <div className="mt-1 text-lg font-bold">{result.targetLabel}</div>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium"
        >
          Làm lại
        </button>
      </div>

      {/* 01 現在地と残り期間 */}
      <Section num="01" title="Trình độ hiện tại và thời gian còn lại">
        <div className="grid grid-cols-3 gap-2">
          <Stat label={remainLabel} value={`${Math.max(result.remaining, 0)}`} unit="tháng" />
          <Stat label="Cơ hội thi J.TEST" value={`${result.jtestCount}`} unit="lần" tone="primary" />
          <Stat label="Cơ hội thi JLPT" value={`${result.jlptCount}`} unit="lần" tone="jlpt" />
        </div>
      </Section>

      {/* 02 要件チェック */}
      <Section num="02" title="Kiểm tra yêu cầu">
        <div className={`rounded-xl border p-4 ${statusColor}`}>
          <div className="text-xs font-bold uppercase tracking-wider">
            {statusLabel}
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed">
            Còn {Math.max(result.remaining, 0)} tháng. {fastestText}
          </p>
          <p className="mt-2 text-xs leading-relaxed opacity-90">
            J.TEST tổ chức vào các tháng lẻ, có thể thi 6 lần/năm. Có thể lấy chứng chỉ sớm hơn JLPT.
          </p>
        </div>
        {prepNote && (
          <div className="mt-3 rounded-xl border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
            {prepNote}
          </div>
        )}
      </Section>

      {/* 03 J.TEST vs JLPT */}
      <Section num="03" title="J.TEST vs JLPT — Lộ trình nào nhanh hơn?">
        <div className="grid gap-3 sm:grid-cols-2">
          <ExamCard
            tone="primary"
            name="J.TEST"
            target={result.jtestTargetLabel}
            next={result.jtestNext?.label ?? null}
            isFastest={result.fastest === "JTEST"}
            desc="6 lần/năm・các tháng lẻ"
          />
          <ExamCard
            tone="jlpt"
            name="JLPT"
            target={result.jlptTargetLabel}
            next={result.jlptNext?.label ?? null}
            isFastest={result.fastest === "JLPT"}
            desc="2 lần/năm・tháng 7/12"
          />
        </div>
      </Section>

      {/* 04 タイムライン */}
      <Section num="04" title="Lộ trình thi được khuyến nghị">
        <ol className="relative space-y-3 border-l-2 border-border pl-5">
          {timeline.map((t, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 ${
                  t.highlight
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                }`}
              />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.date}
              </div>
              <div
                className={`text-sm ${t.highlight ? "font-bold text-primary" : "font-medium"}`}
              >
                {t.text}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 05 アクション */}
      <Section num="05" title="Hành động cần thực hiện ngay">
        <ul className="space-y-2">
          {actions.map((a, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex-1 leading-relaxed">
                <span>{a}</span>
                {i === 0 && (
                  <a
                    href={precheckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-between gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  >
                    <span>Làm PreCheck ngay</span>
                    <span aria-hidden>→</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

// helper type
function useDummy() {
  return null as null | {
    goal: Goal;
    level: SchoolLevel | ThptLevel | "";
    targetDate: Date;
    targetLabel: string;
    remaining: number;
    monthsNeeded: number;
    jtestTargetLabel: string;
    jlptTargetLabel: string;
    jtestCount: number;
    jlptCount: number;
    jtestNext: ExamOccurrence | null;
    jlptNext: ExamOccurrence | null;
    fastest: "JTEST" | "JLPT" | null;
    status: "ok" | "warn" | "danger";
  };
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 flex items-baseline gap-2 text-sm font-bold">
        <span className="text-xs font-semibold text-muted-foreground">{num}</span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "default" | "primary" | "jlpt";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary-soft border-primary/20"
      : tone === "jlpt"
      ? "bg-jlpt-soft border-jlpt/20"
      : "bg-card border-border";
  const valCls =
    tone === "primary"
      ? "text-primary"
      : tone === "jlpt"
      ? "text-jlpt"
      : "text-foreground";
  return (
    <div className={`rounded-xl border p-3 ${toneCls}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${valCls}`}>{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ExamCard({
  tone,
  name,
  target,
  next,
  isFastest,
  desc,
}: {
  tone: "primary" | "jlpt";
  name: string;
  target: string;
  next: string | null;
  isFastest: boolean;
  desc: string;
}) {
  const cls =
    tone === "primary"
      ? "border-primary/30 bg-primary-soft"
      : "border-jlpt/30 bg-jlpt-soft";
  const accent = tone === "primary" ? "text-primary" : "text-jlpt";
  return (
    <div className={`relative rounded-2xl border-2 p-4 ${cls}`}>
      {isFastest && (
        <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
          最速
        </span>
      )}
      <div className={`text-xs font-bold uppercase tracking-wider ${accent}`}>
        {name}
      </div>
      <div className="mt-1 text-sm font-semibold">{target}</div>
      <div className="mt-3 text-[11px] font-medium text-muted-foreground">
        次に受験できる最速月
      </div>
      <div className={`mt-0.5 text-xl font-bold ${accent}`}>
        {next ?? "機会なし"}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
