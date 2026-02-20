export type SceneRow = {
  id: number;
  scene_number: string;
  scene_heading: string;
  location_type: string;
  location_name: string;
  sub_location_name: string;
  time_of_day: string;
  characters: string[];
  props: string[];
  wardrobe: string[];
  set_dressing: string[];
  vehicles: string[];
  vfx: string[];
  sfx: string[];
  stunts: string[];
  extras: string[];
  lines_count: number;
  page_estimate: number;
  scene_summary: string;
  estimatedTime: number;
};

export type ShootingDay = {
  day: number;
  totalTime: number;
  scenes: SceneRow[];
}

export type LocationGroup = {
  scenes: SceneRow[],
  sceneCount: number,
  hasDayScene: boolean
};

export type AddItemModalType = {
  display: boolean;
  name: string;
  fieldName: keyof SceneRow;
  scene: string;
};

export type UserProjectsType ={
  id: string,
  name: string,
  type: string,
  description: string
}

export type MessagesType = { 
  fromUser: boolean,
  text: string 
}