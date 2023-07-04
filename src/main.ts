window.addEventListener("DOMContentLoaded", () => {
    const fish_button =
        document.querySelector<HTMLButtonElement>("button#fish_button")!;
    const fish_canvas = document.querySelector("canvas")!;

    let fish: import("./fish").Fish | null = null;

    fish_button.addEventListener(
        "click",
        async () => {
            const { Fish } = await import("./fish");

            if (fish === null) {
                fish = await Fish.load(fish_canvas);
            }

            console.dir(fish.running);

            if (fish.running) {
                fish.stop();
            } else {
                fish.start();
            }
        },
        { once: false }
    );
});
