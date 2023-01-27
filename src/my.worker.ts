import { Scene, MeshBuilder } from 'babylonjs';
import * as util from "./util";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => {
    if (!("serialized" in event.data) || typeof event.data.serialized !== "string") {
        console.error("@worker invalid serialized data");
        return;
    }
    console.log("@worker event.data is valid");
    
    const scene = util.deserializeScene(event.data.serialized);
    console.log("@worker done to deserialize scene");

    const sphere = MeshBuilder.CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);
	sphere.checkCollisions = true;
    console.log("@worker done to create sphere");

    const serialized = util.serializeScene(scene);
    scene.dispose();
    console.log("@worker done to serialize modified scene");

    ctx.postMessage({
        result: serialized
    });
});