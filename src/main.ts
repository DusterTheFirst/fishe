import { login } from "./spotify";

window.addEventListener("DOMContentLoaded", () => {
  // TODO: do this on button click or smthn
  login();

  const fish_button =
    document.querySelector<HTMLButtonElement>("button#fish_button")!;
  const fish_canvas = document.querySelector("canvas")!;
  const crunch_slider =
    document.querySelector<HTMLInputElement>("input#crunch")!;
  const bpm_input = document.querySelector<HTMLInputElement>("input#bpm")!;

  let fish: import("./fish").Fish | null = null;
  let wake_lock: WakeLockSentinel | null = null;

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

      fish.addEventListener("started", () => {
        if (navigator.wakeLock) {
          navigator.wakeLock
            .request("screen")
            .then((sentinel) => {
              wake_lock = sentinel;
              console.info("Wake Lock is active!");
            })
            .catch((err) => {
              const error = err as Error;
              // The Wake Lock request has failed - usually system related, such as battery.
              console.warn(`${error.name}, ${error.message}`);
            });
        }
      });

      fish.addEventListener("stopped", async () => {
        if (wake_lock !== null) {
          await wake_lock.release();
          wake_lock = null;
        }
      });
    }

    console.dir(fish.running);

    if (fish.running) {
      fish.stop();
    } else {
      fish.start();
    }
  });

  document.addEventListener("visibilitychange", async () => {
    if (fish !== null) {
      switch (document.visibilityState) {
        case "hidden": {
          fish.stop();

          break;
        }
        case "visible": {
          fish.start();

          break;
        }
      }
    }
  });
});
