import { ShootingDay } from "../types/types";

// Shapes the schedule for the AI prompt, dropping empty optional fields
// so we don't spend tokens on props/wardrobe/etc. arrays that are empty.
export function formatScheduleForAI(schedule: ShootingDay[]) {
  return schedule.map(day => ({
    day: day.day,
    totalTime: day.totalTime,
    scenes: day.scenes.map(s => ({
      scene_number: s.scene_number,
      scene_heading: s.scene_heading,
      location_type: s.location_type,
      location_name: s.location_name,
      sub_location_name: s.sub_location_name,
      time_of_day: s.time_of_day,
      characters: s.characters,
      ...(s.props?.length && { props: s.props }),
      ...(s.wardrobe?.length && { wardrobe: s.wardrobe }),
      ...(s.set_dressing?.length && { set_dressing: s.set_dressing }),
      ...(s.vehicles?.length && { vehicles: s.vehicles }),
      ...(s.vfx?.length && { vfx: s.vfx }),
      ...(s.sfx?.length && { sfx: s.sfx }),
      ...(s.stunts?.length && { stunts: s.stunts }),
      ...(s.extras?.length && { extras: s.extras }),
      scene_summary: s.scene_summary,
      estimatedTime: s.estimatedTime
    }))
  }));
}
