"use server";

import { revalidatePath } from "next/cache";
import {
  startWorkoutSession,
  updateWorkoutSession,
  type UpdateWorkoutSessionBodyExerciseLogsItem,
} from "@/app/_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "@/app/_lib/forward-auth-headers";

export async function startWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
) {
  const apiInit = await forwardAuthHeadersInit();
  await startWorkoutSession(workoutPlanId, workoutDayId, apiInit);
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}

export async function saveExerciseLogsAction(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
  exerciseLogs: UpdateWorkoutSessionBodyExerciseLogsItem[],
) {
  const apiInit = await forwardAuthHeadersInit();
  await updateWorkoutSession(
    workoutPlanId,
    workoutDayId,
    sessionId,
    { exerciseLogs },
    apiInit,
  );
}

export async function completeWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
  exerciseLogs: UpdateWorkoutSessionBodyExerciseLogsItem[],
) {
  const apiInit = await forwardAuthHeadersInit();
  await updateWorkoutSession(
    workoutPlanId,
    workoutDayId,
    sessionId,
    {
      completedAt: new Date().toISOString(),
      exerciseLogs,
    },
    apiInit,
  );
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
  revalidatePath("/");
}
