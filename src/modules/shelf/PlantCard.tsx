import type { Plant } from "../../types/plant";

export default function PlantCard({
  plant,
  onEdit,
  onToggleFavorite,
}: {
  plant: Plant;
  onEdit: (plant: Plant) => void;
  onToggleFavorite: (id: string, fav: boolean) => void;
}) {
  return (
    <div className="border rounded p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold break-words" title={plant.name}>
          {plant.name}
          {plant.nickname ? (
            <span className="text-sm text-gray-500"> • {plant.nickname}</span>
          ) : null}
        </div>
        <button
          aria-label="Favorite"
          onClick={() => onToggleFavorite(plant.id, !plant.favorite)}
          className="text-xl"
          title={plant.favorite ? "Unfavorite" : "Favorite"}
        >
          {plant.favorite ? "★" : "☆"}
        </button>
      </div>
      {plant.notes ? (
        <div className="text-sm whitespace-pre-wrap break-words">{plant.notes}</div>
      ) : null}
      {plant.nextWaterAt ? (
        <div className="text-xs text-gray-600">Next water: {plant.nextWaterAt}</div>
      ) : null}

      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 border rounded" onClick={() => onEdit(plant)}>Edit</button>
      </div>
    </div>
  );
}