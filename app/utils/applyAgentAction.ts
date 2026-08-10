import { AIResponseType, ShootingDay } from "../types/types";

// Applies a schedule-editing action confirmed by the AI (see swap_type in
// the system prompt in app/api/ai/route.ts). Returns the updated schedule,
// or null if there's nothing to apply (swap_type "none", missing fields,
// or a day/scene the AI hallucinated that doesn't actually exist).
export function applyAgentAction(schedule: ShootingDay[], aiResponse: AIResponseType): ShootingDay[] | null {
  if (aiResponse.swap_type !== "move") return null;

  const { day_from, day_to, scene_active } = aiResponse;
  if (!day_from || !day_to || !scene_active) return null;

  const fromIndex = Number(day_from) - 1;
  const toIndex = Number(day_to) - 1;

  // Guard against the AI hallucinating a day number outside the schedule
  if (
    !Number.isInteger(fromIndex) || !Number.isInteger(toIndex) ||
    fromIndex < 0 || fromIndex >= schedule.length ||
    toIndex < 0 || toIndex >= schedule.length
  ) {
    return null;
  }

  const updatedSchedule = schedule.map(day => ({
    ...day,
    scenes: [...day.scenes]
  }));

  const sceneIndex = updatedSchedule[fromIndex].scenes.findIndex(s => s.scene_number == scene_active);
  if (sceneIndex === -1) return null;

  const [sceneContent] = updatedSchedule[fromIndex].scenes.splice(sceneIndex, 1);
  updatedSchedule[toIndex].scenes.push(sceneContent);

  return updatedSchedule;
}
