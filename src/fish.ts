import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import fish_glb from "../textures/high_detailed_fish/fish.glb";

export class Fish {
    private fish: THREE.Object3D;
    private light: THREE.Object3D;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;

    private _running: boolean = false;

    get running() {
        return this._running;
    }

    private constructor(fish: THREE.Object3D, canvas: HTMLCanvasElement) {
        this.fish = fish;
        this.light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1.0);
        this.camera = (() => {
            const camera = new THREE.PerspectiveCamera(
                75,
                canvas.clientWidth / canvas.clientHeight,
                0.1,
                1000
            );
            camera.position.set(0.0, 5.0, 5.0);
            camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

            return camera;
        })();

        this.scene = (() => {
            const scene = new THREE.Scene();
            scene.add(this.fish);
            scene.add(this.light);

            return scene;
        })();

        this.renderer = (() => {
            const renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
            });
            renderer.setClearColor(new THREE.Color(0xffffff));

            return renderer;
        })();
    }

    public static async load(canvas: HTMLCanvasElement) {
        const loader = new GLTFLoader();
        const fish_model = await loader.loadAsync(fish_glb);
        const fish = fish_model.scene.getObjectByName("fish")!;

        return new Fish(fish, canvas);
    }

    public start() {
        if (!this._running) {
            requestAnimationFrame(this.animate);

            this._running = true;
            return true;
        }

        return false;
    }

    public stop() {
        const previous_running = this._running;

        this._running = false;

        return previous_running;
    }

    private get animate() {
        return this._animate.bind(this);
    }

    private _animate(milliseconds: DOMHighResTimeStamp) {
        const seconds = milliseconds * 0.001;
        void seconds; // FIXME: actually use delta time
        // console.dir(seconds);

        this.fish.rotateY(Math.PI / 48.0);

        this.camera.aspect =
            this.renderer.domElement.clientWidth /
            this.renderer.domElement.clientHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.render(this.scene, this.camera);

        if (this._running) {
            requestAnimationFrame(this.animate);
        }
    }
}
