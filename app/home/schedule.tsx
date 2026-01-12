"use client";

import { ShootingDay, SceneRow } from "../types/types";

export default function ScheduleView({ schedule }: { schedule: ShootingDay[] }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {schedule.map((day) => (
          <div
            key={day.day}
            className="bg-white rounded-xl shadow p-5"
          >
            {/* Day Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Day {day.day}
              </h2>
              <span className="text-sm text-gray-600">
                Total: {day.totalTime} hrs
              </span>
            </div>

            {/* Scenes */}
            <div className="space-y-3">
              {day.scenes.map((scene: SceneRow) => (
                <div
                  key={scene.scene_number}
                  className="bg-gray-50 border-l-4 border-indigo-500 rounded-lg p-4"
                >
                  {/* Scene Title */}
                  <div className="font-semibold text-gray-900 mb-1">
                    Scene {scene.scene_number} — {scene.scene_heading}
                  </div>

                  {/* Scene Details */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {scene.location_name} {scene.sub_location_name && `- ${scene.sub_location_name}`}
                    </p>

                    <p>
                      <span className="font-medium">Characters:</span>{" "}
                      {scene.characters.join(", ")}
                    </p>

                    <p>
                      <span className="font-medium">Estimated Time:</span>{" "}
                      {scene.estimatedTime} hrs
                    </p>

                    <p>
                      <span className="font-medium">Summary:</span>{" "}
                      {scene.scene_summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
