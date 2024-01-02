import React, {
  use,
  useMemo,
  createContext as ogCreateContext,
  useState,
  useCallback,
} from "react";

const withNarrow = (ctx = null, freeze = false) => {
  if (process.env.NODE_ENV === "development") {
    if (typeof ctx.narrow !== "undefined") {
      throw new Error("ctx.narrow is a reserved property");
    }
  }

  const narrow =
    (accumSelectors = []) =>
    (narrowSelector = (a) => a) => {
      const useSelector = (hookSelector = (a) => a) => {
        return useMemo(() => {
          const val = use(ctx);
          return hookSelector(
            narrowSelector(
              accumSelectors.reduce((accum, selector) => selector(accum), val),
              val
            ),
            val
          );
        }, [hookSelector]);
      };

      useSelector.narrow = narrow([...accumSelectors, narrowSelector]);
      return useSelector;
    };

  ctx.narrow = narrow([]);
  return ctx;
};

const createContextWithHook = (hook) => {
  const ctx = ogCreateContext(null);
  const OGProvider = ctx.Provider;

  const Provider = ({ children }) => {
    const hookValue = hook();
    const memoizedChildren = useMemo(() => children, []);

    return <OGProvider value={hookValue}>{memoizedChildren}</OGProvider>;
  };
  ctx.Provider = Provider;

  return ctx;
};

const createContextWithObject = (obj) => {
  const ctx = ogCreateContext(null);
  const OGProvider = ctx.Provider;

  const Provider = ({ children }) => {
    const [state, setState] = useState(obj);
    obj.syncState = useCallback(
      () =>
        setState({
          ...obj,
        }),
      []
    );
    const memoizedChildren = useMemo(() => children, []);

    return <OGProvider value={state}>{memoizedChildren}</OGProvider>;
  };

  ctx.Provider = Provider;

  return ctx;
};

const createContext = (input) => {
  // assume all functions are valid react hooks
  if (typeof input === "function") {
    return withNarrow(createContextWithHook(input));
  }

  // handle contexts that were created elsewhere
  if (
    typeof val === "object" &&
    val["$$typeof"] === Symbol.for("react.context")
  ) {
    return withNarrow(input);
  }

  // handle objects and nonexistent values
  return withNarrow(createContextWithObject(input || null));
};

export default createContext;
