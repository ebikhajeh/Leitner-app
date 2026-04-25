export const authPageEntrance = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
} as const;

export const authLogoEntrance = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { delay: 0.1, type: "spring", stiffness: 200 },
} as const;
