import { REACT_USE_MIN_VERSION } from "./constants.ts";
import React from "react";

// note: this way, a future PR only has to change the min version
// in the variables above and the rest of the code will work.
const useFutureShim = (...args) =>
  REACT_USE_MIN_VERSION ? React.use(...args) : React.useContext(...args);

export default useFutureShim;
