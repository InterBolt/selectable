import React, { createContext, useCallback } from "react";
import { createRoot } from "react-dom/client";
import selectable from "./lib/index.jsx";

const initialContextValue = {
  theme: {
    colors: {
      dark: "rgba(50, 50, 50, .8)",
      light: "rgba(245, 245, 245, .2)",
    },
  },
  mode: "dark",
};

const initialSecondContextValue = {
  theme: {
    colors: {
      dark: "white",
      light: "black",
    },
  },
  mode: "light",
};

const SecondContext = createContext(initialSecondContextValue);
const useContextSelector = selectable(() => initialContextValue);

// Hooks are just functions, functions are just objects,
// and useful methods can be attached to objects.
// note: any hook resulting from a previous `narrow` invocation can
// be further narrowed down by calling `narrow` on it.
const useTheme = useContextSelector.narrow(
  SecondContext,
  (secondCtx) => secondCtx.theme
);

// This is now composable because the author of `useColor`
// doesn't need to know the entire context data structure
// IF they know that the `.narrow` method exists.
const useColors = useTheme.narrow((theme) => theme.colors);

// Accessing entire context value in a narrowed down hook
// is still possible.
const useModeColor = useTheme.narrow((theme, root) => theme.colors[root.mode]);

const useNewProp = useContextSelector.narrow((root) => root.newProp);

const App = () => {
  const newProp = useNewProp();
  // and the classic `useContextSelector` as originally proposed
  const mode = useContextSelector((root) => root.mode);

  console.log(mode);

  // Must be memoized until react forget exists.
  const selectColor = useCallback((colors) => colors[mode], [mode]);

  // Or this way, using the composed hook:
  const currentColor = useColors(selectColor);

  // selectors are supported on any hook created via `narrow`
  const darkColor = useColors((colors) => colors.dark);

  // demonstrates another way to get the colors
  const colorsFromUseTheme = useTheme((theme) => theme.colors);

  console.log(colorsFromUseTheme);

  // `useModeColor` computed the color based on the
  // narrowed down root and full root.
  const currentColorFromNarrow = useModeColor();

  return (
    <div
      style={{
        backgroundColor: currentColor,
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <button
        style={{
          position: "relative",
          backgroundColor: "white",
          zIndex: 9999,
        }}
        onClick={() => initialContextValue.change()}
      >
        TEST SYNC CHANGE
      </button>
      {`newProp: ${newProp}, dark mode: ${darkColor}, light mode: ${colorsFromUseTheme.light}, mode: ${mode}`}
    </div>
  );
};

const Demo = () => {
  return (
    <SecondContext.Provider value={initialSecondContextValue}>
      <App />
    </SecondContext.Provider>
  );
};

const Wrapper = ({ children }) => {
  return <div>{children}</div>;
};

const mount = () => {
  window.onload = () => {
    const root = createRoot(document.getElementById("app"));
    root.render(
      <Wrapper>
        <Demo />
      </Wrapper>
    );
  };
};

export default mount;
