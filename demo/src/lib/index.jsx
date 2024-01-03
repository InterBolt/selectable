import React from "react";
import useFutureMemoShim from "./useFutureMemoShim.jsx";
import useFutureShim from "./useFutureShim.jsx";

const getIsCtx = (val) => {
  return (
    typeof val === "object" && val["$$typeof"] === Symbol.for("react.context")
  );
};

const buildHook = (ctxOrHook) => {
  if (getIsCtx(ctxOrHook)) {
    return () => useFutureShim(ctxOrHook);
  }
  return ctxOrHook;
};

const selectable = (rootHookOrCtx = null) => {
  if (process.env.NODE_ENV === "development") {
    if (typeof rootHookOrCtx.narrow !== "undefined") {
      throw new Error("narrow: cannot narrow a narrowed hook");
    }
  }

  const rootHook = buildHook(rootHookOrCtx);

  const nextNarrow =
    (accumNarrowHooks = [], accumSelectors = []) =>
    (...args) => {
      const nextSelector = args.at(-1);
      const nextNarrowHooks = args.slice(0, -1).map((a) => buildHook(a));
      const nextAccumSelectors = accumSelectors.concat([nextSelector]);
      const nextAccumNarrowHooks = accumNarrowHooks.concat([nextNarrowHooks]);

      const useSelector = (hookSelector = (a) => a) =>
        useFutureMemoShim(() => {
          const rootVal = rootHook();
          const hookOutputs = [];
          let selected = rootVal;

          nextAccumSelectors.forEach((selector, i) => {
            nextAccumNarrowHooks[i].forEach((hook) => {
              hookOutputs.push(hook());
            });
            selected = selector(...hookOutputs, selected, rootVal);
            hookOutputs.length = 0;
          });

          return hookSelector(selected, rootVal);
        }, []);

      useSelector.narrow = nextNarrow(
        [...nextAccumNarrowHooks],
        [...nextAccumSelectors]
      );
      return useSelector;
    };

  return nextNarrow()((a) => a);
};

export default selectable;
