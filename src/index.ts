import * as BABYLON from 'babylonjs';
import * as BABYLONGUI from 'babylonjs-gui';
import _ from "lodash";
import * as util from "./util";
import MyWorker from "./my.worker.ts";


export function testLodash(): void {
    const strs = [
        "test",
        "desu",
        "test-data",
        "desu"
    ];
    const result = _.filter(strs, (val) => val == "test");
    console.log(result);
}


type SceneContainer = {
    scene?: BABYLON.Scene;
    serialized: string;
}
const container: SceneContainer = { serialized: "" }


export function testBabylon(): void {
    // setup 3D Viewer
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3.2,
        2,
        BABYLON.Vector3.Zero(),
        scene);
    camera.attachControl(canvas);
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene);
    const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });

    container.scene = scene;

    // UI
    const createButton = (
        text: string,
        callback?: (eventData: BABYLONGUI.Vector2WithInfo, eventState: BABYLON.EventState) => void): BABYLONGUI.Button => {
        const button = BABYLONGUI.Button.CreateSimpleButton(text, text);
        button.width = 0.2;
        button.height = "40px";
        button.color = "white";
        button.background = "green";
        button.horizontalAlignment = BABYLONGUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        if (callback) {
            button.onPointerClickObservable.add(callback);
        }
        return button;
    };

    const advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new BABYLONGUI.StackPanel();    
    advancedTexture.addControl(panel);
    panel.addControl(createButton("clear scene", () => {
        scene.meshes.forEach(mesh => scene.removeMesh(mesh));
    }));
    panel.addControl(createButton("serialize scene", () => {
        container.serialized = JSON.stringify(BABYLON.SceneSerializer.Serialize(scene));
        console.log(container.serialized);
        alert("done to serialize");
    }));
    panel.addControl(createButton("deserialize scene", () => {
        if (!container.serialized) {
            alert("you must serialize the scene firstly");
            return;
        }
        BABYLON.SceneLoader.Append("", "data: " + container.serialized, scene, () => {
            alert("done to deserialize");
        });
    }));


    const worker = new MyWorker();
    worker.addEventListener("message", (event) => {
        if (!("result" in event.data) || typeof event.data.result !== "string") {
            console.error("invalid result data");
            return;
        }
        scene.meshes.forEach(mesh => scene.removeMesh(mesh));
        BABYLON.SceneLoader.Append("", "data: " + event.data.result, scene, () => {
            alert("done to receive scene from the worker");
        });
    });
    panel.addControl(createButton("post to worker", () => {
        worker.postMessage({ serialized: util.serializeScene(scene) });
        alert("done to post the worker scene");
    }));
}
