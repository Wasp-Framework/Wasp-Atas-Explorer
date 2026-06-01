import { Box3, Vector3 } from 'three';

export type AggregationColors = {
  colors?: string[];
  palette?: string[];
  byPart?: Record<string, string>;
};

export function applyAggregationColors(aggregation: any, colorsConfig: AggregationColors | null | undefined) {
  if (!aggregation || !colorsConfig) return;
  const palette = colorsConfig.colors || colorsConfig.palette || [];
  const byPart = colorsConfig.byPart || {};
  const parts = Object.values(aggregation?.parts || {});

  parts.forEach((part: any, idx: number) => {
    const color = byPart[part.name] || palette[idx % palette.length];
    if (color && part.geo?.material?.color) {
      part.geo.material.color.set(color);
    }
  });
}

export async function setAggregationPartCount(aggregation: any, targetCount: number, visualizer: any) {
  if (!aggregation || !visualizer) return;
  await aggregation.modifyParts(targetCount, visualizer);
}

export function frameVisualizerToScene(visualizer: any, distanceScale = 0.8) {
  if (!visualizer?.scene || !visualizer?.camera) return;

  const box = new Box3().setFromObject(visualizer.scene);
  if (!isFinite(box.max.x) || box.isEmpty()) return;

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxDim * distanceScale;

  visualizer.camera.position.set(center.x + distance, center.y + distance, center.z + distance);

  if (visualizer.cameraControls) {
    visualizer.cameraControls.setLookAt(
      center.x + distance,
      center.y + distance,
      center.z + distance,
      center.x,
      center.y,
      center.z,
      false
    );
  } else {
    visualizer.camera.lookAt(center);
  }
}

export function placeFirstPartManually(aggregation: any, partName: string, visualizer?: any) {
  if (!aggregation) return { success: false, error: 'No aggregation' };
  const result = aggregation.placeFirstPart(partName);
  if (result.success && visualizer) {
    visualizer.addEntity(result.part);
  }
  return result;
}

export function placePartManually(
  aggregation: any,
  parentPartId: number,
  connectionId: number,
  partName: string,
  connectionBId: number,
  visualizer?: any
) {
  if (!aggregation) return { success: false, error: 'No aggregation' };
  const result = aggregation.placePartAtConnection(parentPartId, connectionId, partName, connectionBId);
  if (result.success && visualizer) {
    visualizer.addEntity(result.part);
  }
  return result;
}

export function removePartById(aggregation: any, partId: number, visualizer?: any) {
  if (!aggregation) return false;
  const part = aggregation.aggregated_parts.find((p: any) => p.id === partId);
  if (!part) return false;
  if (part.children && part.children.length > 0) return false;
  if (visualizer) {
    visualizer.removeEntity(part);
  }
  return aggregation.removePartFromAggregation(partId);
}
