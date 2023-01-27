import * as BABYLON from 'babylonjs';


export function serializeScene(scene: BABYLON.Scene): string {
    return JSON.stringify(BABYLON.SceneSerializer.Serialize(scene));
}

export function deserializeScene(serializedScene: string): BABYLON.Scene {
    const scene = new BABYLON.Scene(new BABYLON.NullEngine());
    BABYLON.SceneLoader.Append("", "data: " + serializedScene, scene);
    return scene;
}