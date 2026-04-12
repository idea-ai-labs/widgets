import { radius, shadow, motion } from "./designSystem";

export const components = {
  card: (colors: any) => ({
    minWidth: 260,
    height: 150,
    borderRadius: radius.lg,
    padding: 16,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    scrollSnapAlign: "start",
    transition: motion.base,
    boxShadow: shadow.soft,
  }),

  hero: {
    margin: "12px 20px",
    height: 240,
    borderRadius: radius.xl,
    padding: 24,
    background: "linear-gradient(135deg, #007aff, #5856d6)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: motion.base,
  },

  search: (colors: any) => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    fontSize: 15,
    outline: "none",
    transition: motion.fast,
  }),
};
