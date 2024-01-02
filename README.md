**Disclaimer: 🚧 this lib requires react/react-dom 18.3.0-canary-\* as a peer dependency**

# ⚡ Narrow Ctx - Composable context selectors

Zero-dependency drop-in replacement for React's `createContext` that exposes a composable selector-based API. See the peerDeps in this repo to grab the canary version required.

# Must haves before I can release `>=0.1.0`:

- [ ] rewrite in TypeScript after React@18.3.0 is officially released
- [ ] minimal test suite to verify render and concurrency assumptions

# Usage

```tsx
import createContext from "@interbolt/narrow-ctx";

const initialCtxValue = {
  theme: {
    colors: {
      dark: "rgba(50, 50, 50, .2)",
      light: "rgba(245, 245, 245, .2)",
    },
  },
};

const Context = createContext(initialCtxValue);
const useThemeSelector = Context.narrow((ctx) => ctx.theme);
// 🎉 Composable because the author of `useColors` does not need to know
// the entire ctx structure to select a subset of the theme.
const useColorsSelector = useThemeSelector.narrow((theme) => theme.colors);

// The `narrow` method is attached to *any* hook that `narrow` itself returns
const useLightColorSelector = useThemeSelector.narrow((colors) => colors.light);

const DisplayColorOptions = () => {
  // 💡 Any hook created via `narrow` takes a selector as its first argument.
  // Beware, until React Forget is released, its important to memoize selectors
  // passed in within a render function.
  const selectDarkColor = useCallback((colors) => colors.dark);
  const darkModeColor = useColorsSelector(selectDarkColor);

  // The same way of doing the above but the selector was defined outside of
  // the render.
  const lightModeColor = useLightColorSelector();

  return (
    <div>
      <p>Dark mode color: {lightModeColor}</p>
      <p>Light mode color: {darkModeColor}</p>
    </div>
  );
};

const App = () => {
  return (
    <Context.Provider>
      <DisplayColorOptions />
    </Context.Provider>
  );
};
```

# API

The default export of `@interbolt/narrow-ctx` is a drop-in replacement for `React.createContext` that allows contexts to be created in two different ways:

### `createContext(useHook)`

Behind the scenes, this will inject the return value of `useHook()` into React's `Context.Provider` so that this:

```tsx
import { createContext } from "react";

const initialCtxValue = {
  theme: {
    // ...
  },
};

const useHook = () => {
  const [state, setState] = useState(initialCtxValue);
  // ...
};

const Context = createContext(initialCtxValue);

const CustomProvider = ({ children }) => {
  const value = useHook();
  // commonly implemented to prevent unnecessary rerenders in components that
  // don't call `useContext` anywhere.
  const memoizedChildren = useMemo(() => children, []);
  return <Context.Provider value={value}>{memoizedChildren}</Context.Provider>;
};
```

becomes:

```tsx
import createContext from "@interbolt/narrow-ctx";

const Context = createContext(() => {
  const [state, setState] = useState({
    theme: {
      // ...
    },
  });
  // ...
});

const App = ({ children }) => {
  // ✅ nice, the hook return value is injected into the Provider behind the
  // scenes, and the `children` prop does not need memoizing.
  return <Context.Provider>{children}</Context.Provider>;
};
```

### or `createContext(externalState)`

Useful when you want more fine grained, manual control over when changes to a context value should update the UI. Behind the scenes, `createContext` will attach a method to `externalState` called `.syncState`, which can be used likeso:

```tsx
import createContext from "@interbolt/narrow-ctx";

const externalState = {
  change: function () {
    this.newProp = "adding new prop";
    // Calling `syncState` makes changes to `externalState` accessible in the
    // render tree.
    this.syncState();
  },
  // ...
};

const context = createContext(externalState);
```

### The `narrow` API

Behind the scenes, `@interbolt/narrow-ctx` attaches a method named `narrow` to any context it creates _and_ to any hook created as a result of a previously calling `.narrow`. This might seem strange but remember that hooks are just JavaScript functions, and JavaScript functions are just objects, and objects can be extended with new properties.

Here's a look at the different ways `narrow` can be used:

```tsx
import createContext from "@interbolt/narrow-ctx";

const context = createContext({
  theme: {
    colors: {
      dark: "black",
      light: "white",
    },
  },
  mode: "dark",
});

// 1️⃣ When no selector function is provided as the first param to `narrow`
// it fallsback to `selector = a => a`. And since hooks created via `narrow`
// can take a selector as an argument as well, we've inadvertently created
// the `useContextSelector` api proposed here https://github.com/reactjs/rfcs/pull/119
const useContextSelector = context.narrow();

// 2️⃣ Since `useContextSelector` was created via `narrow`, it will have its own
// narrow function which we can use to further "narrow" the portion of the
// `ctx` that a consumer of `ctx.theme` would need to know.
const useThemeSelector = useContextSelector.narrow((ctx) => ctx.theme);

// 3️⃣ The author of `useColorsSelector` below does not need to know about the
// entire ctx structure.
const useColorsSelector = useThemeSelector.narrow((theme) => theme.colors);

// 4️⃣ I'm not sure if this is ever a great strategy 🤷🏼‍♂️, but the entire `ctx`
// value is always accessible, no matter how "narrowed" your selector becomes.
const useModeColorSelector = useColorsSelector(
  (colors, ctx) => colors[ctx.mode]
);
```

# Motivation

This was built in response to [the twitter discussion](https://nitter.net/TkDodo/status/1741193371283026422) started by [@DkDodo](https://twitter.com/TkDodo)(Dominik). In his tweet, Dominik shared a screenshot showing how the new `React.use` api will automatically memoize a selected portion of a context value likeso:

```tsx
import { createContext, use, useMemo } from "react";

const MyContext = createContext({
  foo: "",
  bar: 0,
});

// Will only rerender if `foo` changes
const useFoo = () => {
  return useMemo(() => {
    const { foo } = use(MyContext);

    return foo;
  }, []);
};
```

Upon seeing this tweet, I sloppily threw together an implementation of an API that the React community has long asked for, the `React.useContextSelector`, and asked Dominik if it made sense:

```tsx
const useContextSelector = (ctx, selector) => {
  return useMemo(() => {
    const value = use(ctx);
    return selector(value);
  }, []);
};
```

Dominik was quick to point out that I should have added the selector to the dependency array (oops!) and that, even so, this implementation might fare worse than his original example since the caller of `useContextSelector` must memoize the `selector` function they provide as an argument.

Then things started to get really interesting when [Dan Abramov](https://twitter.com/dan_abramov2) chimed in with the following quote, *"the whole point of this is to *not* have selectors btw. selectors don’t compose."* He then included the following code sample:

```tsx
useTheme() {
  return useContext(AppContext).theme
}

useColor() {
  return useTheme().color
}
```

along with the following quote, _"if this was done with context selectors then you have to know precisely what you’re selecting in advance. the author of useColor can’t “narrow down” the scope to just the color changes"_

But something still didn't feel quite right about doing away with the `useSelector` pattern altogether. So over the next couple of days I designed `@interbolt/narrow-ctx` to experiment with a way to somewhat "fix" `useContextSelector`'s composability problem.

See the usage section to see how I implement `useTheme` and `useColor` while retaining the selector pattern API from my suggested `useContextSelector`

# Blog

I plan to write about this in more depth via a blog post in the coming days. Until then stay tuned via RSS - [https://interbolt.org/rss.xml](https://interbolt.org/rss.xml).
