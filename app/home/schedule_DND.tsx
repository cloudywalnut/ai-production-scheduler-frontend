"use client";

import { ShootingDay, SceneRow } from "../types/types";
import { DndContext, closestCenter, DragEndEvent, DragOverlay, useSensors, useSensor, TouchSensor, PointerSensor } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";

interface ScheduleProps {
  schedule: ShootingDay[];
  setSchedule: React.Dispatch<React.SetStateAction<ShootingDay[]>>;
}

export default function ScheduleView({ schedule, setSchedule}: ScheduleProps) {

  const [activeScene, setActiveScene] = useState<SceneRow | null>(null);
  
  // The sensor to work fine with adjustments on mobile
  const sensor = useSensors(
    useSensor(PointerSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 5,
    },
    }),
    useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5
    }
  }))

  // Add the shifting logic over here - sorting the day wise schedule
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const daySceneMap = schedule.map(day => day.scenes.map(scene => scene.scene_number))
    const activeSceneId = active.id;
    const overSceneId = over?.id;

    // Initialization of Day they get there actual values later
    let activeSceneDay = -1
    let overSceneDay = -1
    
    daySceneMap.forEach((day,i) => {
        if (day.includes(Number(activeSceneId))){
            activeSceneDay = i+1;
        }
    })
    
    daySceneMap.forEach((day,i) => {
        if (day.includes(Number(overSceneId))){
            overSceneDay = i+1;
        }
    })

    // The new schedule after the changes
    const changedSchedule = schedule.map(day => ({
        ...day,
        scenes: [...day.scenes]
    }));

    // When moving to a different day - pushes to end
    if (activeSceneDay != overSceneDay){
        changedSchedule.forEach(day => {
            if (day.day == activeSceneDay){
                day.scenes = day.scenes.filter((scene) => scene.scene_number != activeSceneId)
                day.totalTime -= activeScene!.estimatedTime;
            }else if (day.day == overSceneDay){
                const overSceneIndex = day.scenes.findIndex(s => s.scene_number == overSceneId)
                day.scenes.splice(overSceneIndex+1, 0, activeScene!) // add to correct new index
                day.totalTime += activeScene!.estimatedTime;
            }
        })
    // When sorting within the same day
    }else if (activeSceneDay == overSceneDay){
        changedSchedule.forEach(day => {
            if (day.day == activeSceneDay){
                const activeSceneIndex = day.scenes.findIndex(s => s.scene_number == activeSceneId);
                const overSceneIndex = day.scenes.findIndex(s => s.scene_number == overSceneId);
                day.scenes.splice(activeSceneIndex,1); // removes from prev index
                day.scenes.splice(overSceneIndex, 0, activeScene!); // adds to new index
            }
        })
    }

    setSchedule(changedSchedule);
    setActiveScene(null);

  }

  // Contents of the Scene Card
  function SceneCardContent({ scene }: { scene: SceneRow }){
    return (
      <div>
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
    )
  }

  // The actual Scene Card - that is sortable
  function SceneCard({ scene, active }: { scene: SceneRow, active: boolean }){

    const { attributes, listeners, setNodeRef } = useSortable({
      id: scene.scene_number,
      data: scene, // this is where the data is coming from which is used later
    });

    // Need to fix something here with the styling when dragged
    const style = {
      cursor: "grab",
      opacity: active ? 0.5 : 1, // 0.5 when this is the card that is being dragged, 1 otherwise
    };

    return (
      
      <div
        ref={setNodeRef} // link DOM to sortable
        {...listeners}   // handle pointer events
        {...attributes}  // ARIA & accessibility
        style={style}
        className="bg-gray-50 border-l-4 border-indigo-500 rounded-lg p-4 "
      >
        <SceneCardContent scene={scene}/>
      </div>

    )
  }

  // The parent day card that contains scene cards
  function DayCard({ day }: { day: ShootingDay }) {
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Day {day.day}</h2>
          <span className="text-sm text-gray-600">Total: {day.totalTime} hrs</span>
        </div>

        <div className="space-y-3">
          { day.scenes.map((scene: SceneRow) => (
            <SceneCard key={scene.scene_number} scene={scene} active = {activeScene?.scene_number == scene.scene_number}/>
          ))}
          {day.scenes.length == 0 && (
            <button className="w-full cursor-pointer border-2 border-dotted border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded hover:bg-blue-50"> 
                Add Scene
            </button>            
          )}
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* The main DndContext everything is inside of this */}
        <DndContext 
          collisionDetection={closestCenter} 
          sensors={sensor}
          onDragStart={(e) => {
            console.log(e.active.data.current) // Can remove later
            setActiveScene(e.active.data.current as SceneRow)
          }}
          onDragEnd={handleDragEnd}
        >

          {schedule.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}

          <DragOverlay>
            {activeScene ? (
              <div className="bg-gray-50 border-l-4 border-indigo-500 rounded-lg p-4">
                <SceneCardContent scene={activeScene}/>
              </div>
            ) : null}
          </DragOverlay>

        </DndContext>

      </div>
    </div>

  );
  
}