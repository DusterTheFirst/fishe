window.addEventListener("DOMContentLoaded", () => {
    const fish_button =
        document.querySelector<HTMLButtonElement>("button#fish_button")!;
    const fish_canvas = document.querySelector("canvas")!;

    fish_button.addEventListener("click", async () => {
        const { show_fish } = await import("./fish");

        show_fish(fish_canvas);
    });
});
