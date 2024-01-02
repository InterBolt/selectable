import r, {
  createContext as t,
  useMemo as e,
  useState as n,
  useCallback as o,
  use as i,
} from "react";
function u(r, t) {
  var e = Object.keys(r);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(r);
    t &&
      (n = n.filter(function (t) {
        return Object.getOwnPropertyDescriptor(r, t).enumerable;
      })),
      e.push.apply(e, n);
  }
  return e;
}
function a(r) {
  var t = (function (r, t) {
    if ("object" != typeof r || !r) return r;
    var e = r[Symbol.toPrimitive];
    if (void 0 !== e) {
      var n = e.call(r, t || "default");
      if ("object" != typeof n) return n;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === t ? String : Number)(r);
  })(r, "string");
  return "symbol" == typeof t ? t : String(t);
}
function c(r) {
  return (
    (c =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (r) {
            return typeof r;
          }
        : function (r) {
            return r &&
              "function" == typeof Symbol &&
              r.constructor === Symbol &&
              r !== Symbol.prototype
              ? "symbol"
              : typeof r;
          }),
    c(r)
  );
}
function l(r, t, e) {
  return (
    (t = a(t)) in r
      ? Object.defineProperty(r, t, {
          value: e,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (r[t] = e),
    r
  );
}
function f(r, t) {
  return (
    (function (r) {
      if (Array.isArray(r)) return r;
    })(r) ||
    (function (r, t) {
      var e =
        null == r
          ? null
          : ("undefined" != typeof Symbol && r[Symbol.iterator]) ||
            r["@@iterator"];
      if (null != e) {
        var n,
          o,
          i,
          u,
          a = [],
          c = !0,
          l = !1;
        try {
          if (((i = (e = e.call(r)).next), 0 === t)) {
            if (Object(e) !== e) return;
            c = !1;
          } else
            for (
              ;
              !(c = (n = i.call(e)).done) && (a.push(n.value), a.length !== t);
              c = !0
            );
        } catch (r) {
          (l = !0), (o = r);
        } finally {
          try {
            if (!c && null != e.return && ((u = e.return()), Object(u) !== u))
              return;
          } finally {
            if (l) throw o;
          }
        }
        return a;
      }
    })(r, t) ||
    v(r, t) ||
    (function () {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    })()
  );
}
function y(r) {
  return (
    (function (r) {
      if (Array.isArray(r)) return b(r);
    })(r) ||
    (function (r) {
      if (
        ("undefined" != typeof Symbol && null != r[Symbol.iterator]) ||
        null != r["@@iterator"]
      )
        return Array.from(r);
    })(r) ||
    v(r) ||
    (function () {
      throw new TypeError(
        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    })()
  );
}
function v(r, t) {
  if (r) {
    if ("string" == typeof r) return b(r, t);
    var e = Object.prototype.toString.call(r).slice(8, -1);
    return (
      "Object" === e && r.constructor && (e = r.constructor.name),
      "Map" === e || "Set" === e
        ? Array.from(r)
        : "Arguments" === e ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)
        ? b(r, t)
        : void 0
    );
  }
}
function b(r, t) {
  (null == t || t > r.length) && (t = r.length);
  for (var e = 0, n = new Array(t); e < t; e++) n[e] = r[e];
  return n;
}
var p = function () {
    var r =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
    if ("development" === process.env.NODE_ENV && void 0 !== r.narrow)
      throw new Error("ctx.narrow is a reserved property");
    return (
      (r.narrow = (function t() {
        var n =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        return function () {
          var o =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : function (r) {
                    return r;
                  },
            u = function () {
              var t =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : function (r) {
                      return r;
                    };
              return e(
                function () {
                  var e = i(r);
                  return t(
                    o(
                      n.reduce(function (r, t) {
                        return t(r);
                      }, e),
                      e
                    ),
                    e
                  );
                },
                [t]
              );
            };
          return (u.narrow = t([].concat(y(n), [o]))), u;
        };
      })([])),
      r
    );
  },
  s = function (i) {
    var a = t(null),
      c = a.Provider;
    return (
      (a.Provider = function (t) {
        var a = t.children,
          y = f(n(i), 2),
          v = y[0],
          b = y[1];
        i.syncState = o(function () {
          return b(
            (function (r) {
              for (var t = 1; t < arguments.length; t++) {
                var e = null != arguments[t] ? arguments[t] : {};
                t % 2
                  ? u(Object(e), !0).forEach(function (t) {
                      l(r, t, e[t]);
                    })
                  : Object.getOwnPropertyDescriptors
                  ? Object.defineProperties(
                      r,
                      Object.getOwnPropertyDescriptors(e)
                    )
                  : u(Object(e)).forEach(function (t) {
                      Object.defineProperty(
                        r,
                        t,
                        Object.getOwnPropertyDescriptor(e, t)
                      );
                    });
              }
              return r;
            })({}, i)
          );
        }, []);
        var p = e(function () {
          return a;
        }, []);
        return r.createElement(c, { value: v }, p);
      }),
      a
    );
  },
  m = function (n) {
    return "function" == typeof n
      ? p(
          ((o = n),
          (u = (i = t(null)).Provider),
          (i.Provider = function (t) {
            var n = t.children,
              i = o(),
              a = e(function () {
                return n;
              }, []);
            return r.createElement(u, { value: i }, a);
          }),
          i)
        )
      : "object" === ("undefined" == typeof val ? "undefined" : c(val)) &&
        val.$$typeof === Symbol.for("react.context")
      ? p(n)
      : p(s(n || null));
    var o, i, u;
  };
export { m as default };
