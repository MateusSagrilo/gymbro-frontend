"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type {
  GetWorkoutDay200ExercisesItem,
  UpdateWorkoutSessionBodyExerciseLogsItem,
} from "@/app/_lib/api/fetch-generated";
import { completeWorkoutAction, saveExerciseLogsAction } from "../_actions";
import { ExerciseCard } from "./exercise-card";

function buildLogs(
  exercises: GetWorkoutDay200ExercisesItem[],
  state: Record<string, { w: string; r: string }>,
): UpdateWorkoutSessionBodyExerciseLogsItem[] {
  return exercises.map((ex) => {
    const row = state[ex.id];
    const w = parseFloat((row?.w ?? "").replace(",", "."));
    const r = parseInt(row?.r ?? "", 10);
    const weightKg =
      Number.isFinite(w) && w >= 0
        ? w
        : (ex.sessionLog?.weightKg ?? ex.previousPerformance?.weightKg ?? 0);
    const reps =
      Number.isFinite(r) && r > 0
        ? r
        : (ex.sessionLog?.reps ??
          ex.previousPerformance?.reps ??
          ex.reps);
    return { exerciseId: ex.id, weightKg, reps };
  });
}

export function WorkoutInProgressSection({
  exercises,
  workoutPlanId,
  workoutDayId,
  sessionId,
}: {
  exercises: GetWorkoutDay200ExercisesItem[];
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
}) {
  const sorted = useMemo(
    () => [...exercises].sort((a, b) => a.order - b.order),
    [exercises],
  );

  const [values, setValues] = useState<Record<string, { w: string; r: string }>>(
    () => {
      const init: Record<string, { w: string; r: string }> = {};
      for (const ex of sorted) {
        const w =
          ex.sessionLog?.weightKg ?? ex.previousPerformance?.weightKg;
        const r =
          ex.sessionLog?.reps ??
          ex.previousPerformance?.reps ??
          ex.reps;
        init[ex.id] = {
          w: w == null ? "" : String(w),
          r: String(r),
        };
      }
      return init;
    },
  );

  const [, startSave] = useTransition();
  const [completing, startComplete] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      const logs = buildLogs(sorted, values);
      startSave(() => {
        void saveExerciseLogsAction(
          workoutPlanId,
          workoutDayId,
          sessionId,
          logs,
        );
      });
    }, 650);
    return () => clearTimeout(t);
  }, [
    values,
    sorted,
    workoutPlanId,
    workoutDayId,
    sessionId,
    startSave,
  ]);

  const setWR = (id: string, field: "w" | "r", v: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, [field]: v },
    }));
  };

  return (
    <>
      {sorted.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          logWeight={values[exercise.id]?.w ?? ""}
          logReps={values[exercise.id]?.r ?? ""}
          onLogWeightChange={(v) => setWR(exercise.id, "w", v)}
          onLogRepsChange={(v) => setWR(exercise.id, "r", v)}
          showLogInputs
        />
      ))}
      <div className="pt-2">
        <Button
          variant="outline"
          disabled={completing}
          className="w-full rounded-full py-3 font-heading text-sm font-semibold"
          onClick={() => {
            const logs = buildLogs(sorted, values);
            startComplete(() => {
              void completeWorkoutAction(
                workoutPlanId,
                workoutDayId,
                sessionId,
                logs,
              );
            });
          }}
        >
          Marcar como concluído
        </Button>
      </div>
    </>
  );
}
