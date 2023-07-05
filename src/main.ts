window.addEventListener("DOMContentLoaded", () => {
  const fish_button =
    document.querySelector<HTMLButtonElement>("button#fish_button")!;
  const fish_canvas = document.querySelector("canvas")!;
  const crunch_slider =
    document.querySelector<HTMLInputElement>("input#crunch")!;
  const bpm_input = document.querySelector<HTMLInputElement>("input#bpm")!;

  let fish: import("./fish").Fish | null = null;

  crunch_slider.addEventListener("input", () => {
    if (fish !== null) {
      fish.crunchiness = crunch_slider.valueAsNumber / 100;

      console.dir(fish.crunchiness);
    }
  });

  bpm_input.addEventListener("change", () => {
    if (fish !== null) {
      fish.bpm = bpm_input.valueAsNumber;

      console.dir(fish.bpm);
    }
  });

  fish_button.addEventListener("click", async () => {
    const { Fish } = await import("./fish");

    if (fish === null) {
      fish = await Fish.load(fish_canvas);
      fish.crunchiness = crunch_slider.valueAsNumber / 100;
      fish.bpm = bpm_input.valueAsNumber;
    }

    console.dir(fish.running);

    if (fish.running) {
      fish.stop();
    } else {
      fish.start();
    }
  });
});
