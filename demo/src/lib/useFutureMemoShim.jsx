import {
  REACT_HOOK_IN_USE_MEMO_MIN_VERSION,
  REACT_USE_MIN_VERSION,
} from "./constants.ts";
import React, { useMemo } from "react";

// note: this way, a future PR only has to change the min version
// in the variables above and the rest of the code will work.
const useFutureMemoShim = (fn, deps = []) => {
  const isReactHookInUseMemoMinVersion =
    Number(React.version.split(".").slice(0, 2).join(".")) >=
    REACT_HOOK_IN_USE_MEMO_MIN_VERSION;
  const isReactUseMinVersion =
    Number(React.version.split(".").slice(0, 2).join(".")) >=
    REACT_USE_MIN_VERSION;

  if (isReactHookInUseMemoMinVersion && isReactUseMinVersion) {
    return useMemo(fn, deps);
  }
  return fn();
};

export default useFutureMemoShim;
