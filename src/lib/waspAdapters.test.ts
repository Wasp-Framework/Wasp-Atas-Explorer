import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene } from 'three';
import { frameVisualizerToScene, updateVisualizerCameraConstraints } from './waspAdapters';

describe('waspAdapters camera helpers', () => {
  it('derives camera constraints from visible scene bounds and ignores ghost overlays', () => {
    const scene = new Scene();
    const mesh = new Mesh(new BoxGeometry(10, 20, 30), new MeshBasicMaterial());
    mesh.position.set(5, 0, 0);
    scene.add(mesh);

    const ghostGroup = new Mesh(new BoxGeometry(1000, 1000, 1000), new MeshBasicMaterial());
    ghostGroup.name = '__atlas_ghost_group__';
    scene.add(ghostGroup);

    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    const visualizer = {
      scene,
      camera,
      cameraControls: {
        minDistance: 0,
        maxDistance: 0,
        setLookAt: vi.fn(),
      },
    };

    frameVisualizerToScene(visualizer, 1);
    updateVisualizerCameraConstraints(visualizer);

    expect(visualizer.cameraControls.setLookAt).toHaveBeenCalled();
    expect(visualizer.cameraControls.minDistance).toBeGreaterThan(0.25);
    expect(visualizer.cameraControls.maxDistance).toBeGreaterThan(visualizer.cameraControls.minDistance);
    expect(visualizer.camera.near).toBeGreaterThanOrEqual(0.01);
    expect(visualizer.camera.far).toBeGreaterThan(250);
  });
});
