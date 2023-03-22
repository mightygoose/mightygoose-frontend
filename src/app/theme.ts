import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const buttonTheme = defineStyleConfig({
  baseStyle: {
    color: "black",
    backgroundColor: "yellow.200 !important",
    textTransform: "uppercase",
    fontFamily: `'Roboto Condensed', sans-serif`,
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "1px",
    padding: "0.7em 2.5em",
    borderRadius: "3px",
    cursor: "pointer",

    _hover: {
      backgroundColor: "yellow.100 !important",
    },
  },
});

const theme = {
  colors: {
    white: {
      100: "#ffffff",
      200: "#f2f2f2",
    },
    black: "#2f2f2f",
    grey: {
      100: "#ededed",
      200: "#8e8e8e",
      300: "#9a9a9a",
      400: "#837b7b",
      500: "#a9a9a9",
    },
    yellow: {
      100: "#ffe10b",
      200: "#ffd900",
    },
  },
  fonts: {
    body: `'Roboto', sans-serif`,
  },
  components: {
    Button: buttonTheme,
  },
};

const extendedTheme = extendTheme(theme);

export type Theme = typeof theme;

export default extendedTheme;
