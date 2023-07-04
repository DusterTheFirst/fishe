import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import fish_glb from "../textures/high_detailed_fish/fish.glb";

export async function show_fish(canvas: HTMLCanvasElement) {
    const loader = new GLTFLoader();

    const fish_model = await loader.loadAsync(fish_glb);
    const fish = fish_model.scene.getObjectByName("fish")!;

    const scene = new THREE.Scene();
    scene.add(fish);
    const light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1.0);
    scene.add(light);
    let camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0.0, 5.0, 5.0);
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xffffff));

    document.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        fish.rotateY(Math.PI / 48.0);
        renderer.render(scene, camera);
    }
    animate();
}
