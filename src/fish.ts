import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import fish_glb from "../textures/high_detailed_fish/fish.glb";

export type FishEvent = { type: "started" } | { type: "stopped" };

export class Fish extends THREE.EventDispatcher<FishEvent> {
  private fish: THREE.Object3D;
  private light: THREE.Object3D;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private wake_lock: WakeLockSentinel | null = null;

  private _running: boolean = false;

  get running() {
    return this._running;
  }

  private _crunchiness: number = 0.5;

  get crunchiness() {
    return this._crunchiness;
  }

  set crunchiness(crunchiness) {
    this._crunchiness = Math.max(Math.min(crunchiness, 1.0), 0.0);
  }

  public bpm: number = 120;

  private constructor(fish: THREE.Object3D, canvas: HTMLCanvasElement) {
    super();

    this.fish = fish;
    this.light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1.0);
    this.camera = (() => {
      const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0.0, 1.0, 5.0);
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

  /**
   * @returns Weather the call affected the state of the fish
   */
  public start(): boolean {
    if (!this._running) {
      requestAnimationFrame(this.animate);

      this.dispatchEvent({ type: "started" });

      this._running = true;
      return true;
    }

    return false;
  }

  /**
   * @returns Weather the call affected the state of the fish
   */
  public stop(): boolean {
    const previous_running = this._running;

    if (!previous_running) {
      this.dispatchEvent({ type: "stopped" });

      this._running = false;

      return true;
    }

    return false;
  }

  private get animate() {
    return this._animate.bind(this);
  }

  private last_animate: number = 0;

  private _animate(milliseconds: DOMHighResTimeStamp) {
    const seconds = milliseconds * 0.001;
    const delta_time = seconds - this.last_animate;
    this.last_animate = seconds;

    const rotational_velocity = this.bpm / 60 / 2;
    this.fish.rotation.y -=
      (Math.PI * 2 * rotational_velocity * delta_time) % (Math.PI * 2);

    // Actually do the render
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const crunchy_width = width * (1 - this.crunchiness);
    const crunchy_height = height * (1 - this.crunchiness);
    const needResize =
      canvas.width !== crunchy_width || canvas.height !== crunchy_height;
    if (needResize) {
      this.renderer.setSize(crunchy_width, crunchy_height, false);
    }

    this.renderer.render(this.scene, this.camera);

    if (this._running) {
      requestAnimationFrame(this.animate);
    }
  }
}
