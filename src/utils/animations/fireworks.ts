import confetti from "canvas-confetti";

const colors = ["#bb0000", "#ffffff"];

export const animateFireworks = (end: number) => {
  confetti({
    particleCount: 4,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: colors,
    zIndex: 5000,
  });
  confetti({
    particleCount: 4,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: colors,
    zIndex: 5000,
  });

  if (Date.now() < end) {
    setTimeout(() => animateFireworks(end), 100);
  }
};
