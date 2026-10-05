import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { apiGet } from "@/lib/server";
import type { Progress } from "@/lib/types";

export const metadata: Metadata = { title: "Malla curricular" };

const STATUS = {
  aprobada: { label: "Aprobada", tone: "success" },
  cursando: { label: "Cursando", tone: "primary" },
  reprobada: { label: "Por repetir", tone: "danger" },
  pendiente: { label: "Pendiente", tone: "neutral" },
} as const;

export default async function CurriculumPage() {
  const p = await apiGet<Progress>("/students/me/progress");

  // Agrupa por semestre (las materias sin semestre van al final)
  const bySemester = new Map<number | null, Progress["subjects"]>();
  for (const s of p.subjects) {
    if (!bySemester.has(s.semester)) bySemester.set(s.semester, []);
    bySemester.get(s.semester)!.push(s);
  }
  const semesters = [...bySemester.entries()].sort(([a], [b]) => (a ?? 99) - (b ?? 99));

  return (
    <>
      <PageHeader title="Malla curricular" subtitle={p.program.name} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="success">{p.summary.passed} aprobadas</Badge>
        <Badge tone="primary">{p.summary.inProgress} cursando</Badge>
        <Badge tone="danger">{p.summary.failed} por repetir</Badge>
        <Badge tone="neutral">{p.summary.pending} pendientes</Badge>
        <Badge tone="primary">
          {p.summary.creditsApproved} / {p.summary.creditsTotal} créditos
        </Badge>
      </div>

      {semesters.length === 0 ? (
        <EmptyState title="Tu programa aún no tiene materias registradas" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {semesters.map(([semester, subjects]) => (
            <Card key={semester ?? "x"} className="p-5">
              <h2 className="mb-3 font-extrabold">{semester ? `Semestre ${semester}` : "Sin semestre"}</h2>
              <ul className="space-y-2.5">
                {subjects.map((s) => (
                  <li key={s.id} className={cn("rounded-xl border border-line p-3", s.status === "aprobada" && "bg-success-100/50")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm leading-snug font-bold">{s.name}</p>
                        <p className="text-xs text-muted">
                          {s.code} · {s.credits} créditos
                        </p>
                      </div>
                      <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                    </div>
                    {s.status !== "aprobada" && s.missingPrerequisites.length > 0 && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <Lock className="size-3" aria-hidden /> Requiere: {s.missingPrerequisites.join(", ")}
                      </p>
                    )}
                    {s.canEnroll && <p className="mt-2 text-xs font-semibold text-primary-700">Puedes matricularla</p>}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
