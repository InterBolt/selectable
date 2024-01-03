# ⚡ @interbolt/selectable - _(theoretically) Performant and composable hook selectors_

A proof of concept API to enable (theoretically render-optimized) composable selector hooks based on Context values and hook returns.

**Disclaimer: 🚧 this lib only demonstrates the API, but requires more work from the core React team before it can deliver on any render-optimization claims.**

# Requirements to make render-optimization work

- [ ] release of React version 18.3 or greater which will include the `React.use` hook
- [ ] support for calling hooks in `React.useMemo`

# TODOS required to release v0.1.0

- [ ] add types
- [ ] minimal test suite

# Table of Contents

- [Usage](#usage)
- [API](#api)
- [Demo](#demo)
- [Motivation](#motivation)
- [Blog](#blog)

# Usage

### Example 1) make a context "selectable".

```tsx
import { createContext } from "react";

const useApp = () => {
  const timeInSeconds = useTimeInSeconds();
  const isDarkOutside = useIsDarkOutside();

  return {
    theme: {
      colors: {
        dark: "black",
        light: "white",
      },
      mode: isDarkOutside ? "dark" : "light",
    },
    timeInSeconds,
  };
};

const Context = createContext(null);

// This can be called within a render function likeso:
// `const mode = useAppSelector(ctx => ctx.theme.mode)`
// or further narrowed, as seen in the code below.
const useAppSelector = selectable(Context);

// Narrow the portion of the context we want to select from.
const useThemeSelector = useAppSelector.narrow((ctx) => ctx.theme);

// 🎉 Composable! author of `useDarkModeColorSelector` doesn't need to know the
// structure of the entire `ctx` value.
const useDarkModeColorSelector = useThemeSelector.narrow(
  (theme) => theme.colors.dark
);

// NOTE: once React adds the useMemo hook/context optimizations,
// none of the hooks calls below should trigger rerenders when
// `ctx.timeInSeconds` changes.
const DisplayColorOptions = () => {
  const selectLightColor = useCallback((colors) => colors.dark);

  const darkModeColor = useDarkModeColorSelector();
  const lightModeColor = useColorsSelector(selectLightColor);

  return (
    <div>
      <p>Light mode color: {lightModeColor}</p>
      <p>Dark mode color: {darkModeColor}</p>
    </div>
  );
};

const AppProvider = () => {
  const app = useApp();

  return (
    <Context.Provider value={app}>
      <DisplayColorOptions />
    </Context.Provider>
  );
};
```

### Example 2) make a hook "selectable".

```tsx
const useApp = () => {
  const timeInSeconds = useTimeInSeconds();
  const isDarkOutside = useIsDarkOutside();

  return {
    theme: {
      colors: {
        dark: "black",
        light: "white",
      },
      mode: isDarkOutside ? "dark" : "light",
    },
    timeInSeconds,
  };
};

// This can be called within a render function likeso:
// `const mode = useAppSelector(ctx => ctx.theme.mode)`
// or further narrowed, as seen in the code below.
const useAppSelector = selectable(useApp);

// Narrow the portion of the `useApp` return value we want to select from.
const useThemeSelector = useAppSelector.narrow((ctx) => ctx.theme);

// 🎉 Composable! author of `useDarkModeColorSelector` doesn't need to know the
// structure of the entire `ctx` value.
const useDarkModeColorSelector = useThemeSelector.narrow(
  (theme) => theme.colors.dark
);

// NOTE: once React adds the useMemo hook/context optimizations,
// none of the hooks calls below should trigger rerenders when
// `ctx.timeInSeconds` changes.
const DisplayColorOptions = () => {
  const selectLightColor = useCallback((colors) => colors.dark);

  const darkModeColor = useDarkModeColorSelector();
  const lightModeColor = useColorsSelector(selectLightColor);

  return (
    <div>
      <p>Light mode color: {lightModeColor}</p>
      <p>Dark mode color: {darkModeColor}</p>
    </div>
  );
};
```

# API

`@interbolt/selectable`'s default export is a function called `selectable`.

Any hook produced by calling `selectable` will have a `.narrow` method attached to it (_remember, fns are just objs_).

The `narrow` method will return a _useSelector(selector)_-style hook based on the selector function provided to `narrow`. Compositions of new "narrowed" selector hooks are not constrained to using only the original hook or context provided to `selectable`. The `narrow` method can take any number of other context or hooks as params and pass their values to the "narrowing" selector.

That's all a little confusing so let's look at the ways we can use `selectable` and `.narrow`:

```tsx
import { UserContext, ThemeContext } from "./myAppsContexts";
import {
  useDashboardFeatures,
  useFeatureFlags,
  useAnalytics,
} from "./myAppsHooks";

// EX: 1️⃣ - create a selectable user context and then
// use the `narrow` method to get their preferred colors by
// by composing `useUserSelector` with `ThemeContext`.

// Step 1 - create the selector hook from the `UserContext`
const useUserSelector = selectable(UserContext);

// Step 2 - create a hook that we can use to select from
// the user's preferred colors. See how we were able to
// use the `ThemeContext` by passing it in as the first param
// to `.narrow`.
const usePreferredColorsSelector = useUserSelector.narrow(
  ThemeContext,
  (theme, user) => theme.colors[user.colorPreference]
);

// EX: 2️⃣ - create a selectable user context and then
// use the `useFeatureFlags` and `useDashboardFeatures` hooks
// to create a hook that will tell us which features our UI should
// suggest the user try on their dashboard page.

// Step 1 - create the selector hook from the `UserContext`
const useUserSelector = selectable(UserContext);

// Step 2 - include the return values of `useFeatureFlags` and
// `useDashboardFeatures` in the selector param so that we can
// determine which active dashboard features we should suggest
// the user try.
const useDashboardFeaturesToSuggest = useUserSelector.narrow(
  useFeatureFlags,
  useDashboardFeatures,
  (featureFlags, dashboardFeatures, user) => {
    const { activeFeatures } = featureFlags;
    const { acknowledgedFeatures } = user;
    return _.difference(acknowledgedFeatures, activeFeatures);
  }
);

// Now go crazy - what if we want to change the color of something
// in our UI based on how many pending suggestions a user has
// on the dashboard page.
const useFeatureSuggestionsColor = useDashboardFeaturesToSuggest.narrow(
  ThemeContext,
  (theme, suggestions) => {
    if (suggestions.length === 0) {
      return theme.colors.pendingSuggestions.none;
    }

    // maybe a warning orange?
    if (suggestions.length > 0 && suggestions.length < 3) {
      return theme.colors.pendingSuggestions.some;
    }

    // maybe show a danger red?
    return theme.colors.pendingSuggestions.lots;
  }
);

// The author of `useFeatureSuggestionsColor` doesn't need to care
// at all about how `useDashboardFeaturesToSuggest`
// was implemented. Composability!!! 🎉🎉🎉
```

# Demo

I included a demo in the `demo/` folder. To get it running do:

```shell
cd demo
npm ci
npm run start
```

Then navigate to `http://localhost:8080/` to see it in action. I suggest using the demo as a playground to familiarize yourself with the API. The code inside of `demo/src/lib` is the exact code that lives in `src` so feel free to play around with the source code.

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

But something still didn't feel quite right about doing away with the `useSelector` pattern altogether. So over the next couple of days I designed `@interbolt/selectable` to experiment with a way to somewhat "fix" `useContextSelector`'s composability problem.

# Blog

I plan to write about this in more depth via a blog post in the coming days. Until then stay tuned via RSS - [https://interbolt.org/rss.xml](https://interbolt.org/rss.xml).
