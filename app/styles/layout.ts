import { spacing } from "./designSystem";

export const layout = {
  page: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },

  section: {
    padding: `${spacing.lg}px ${spacing.xl}px`,
    marginBottom: spacing.md,
  },

  row: {
    display: "flex",
    gap: spacing.md,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },

  stack: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
};
