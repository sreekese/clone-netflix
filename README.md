# Netflix Clone — Movie Discovery

A responsive React application with Firebase email/password authentication, protected browsing, TMDB movie search, a rotating video banner, multiple movie categories, detailed movie profiles, and YouTube trailers. This is an independent learning project, not a Netflix subscription or full-movie streaming service.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
cp .env.example .env.local
# Fill in your Firebase web configuration and TMDB read access token.
npm run dev
```

If `.env.local` already exists, keep it rather than overwriting it. Enable Email/Password in Firebase Authentication and add your local/deployed hostname to Firebase's authorized domains. The app displays a setup error if Firebase configuration is missing. Existing project configuration was migrated to the ignored `.env.local` during this update.

## Checks

```sh
npm run format:check
npm run lint
npm test
npm run test:coverage
npm run build
# Or run formatting, lint, tests, and build together:
npm run check
```

`npm run format` applies consistent formatting. GitHub Actions runs formatting, lint, coverage, and build checks on pushes and pull requests.

`npm run test:watch` runs tests during development. Vitest, Testing Library, and jsdom cover validation, authentication forms and route guards, session cleanup, sign-out failure, API errors, request cancellation, trailer selection, movie cards, details, search, and retries. Firebase and HTTP are mocked: tests do not create accounts or call external APIs.

## Configuration and hosting

The default API base is `https://api.themoviedb.org`, so requests work in both development and static production builds. `VITE_TMDB_API_BASE_URL` can instead point to a trusted backend; requests append `/3/movie/...` or `/3/search/movie?...`.

**All `VITE_` values are public in the browser bundle.** The direct TMDB token setup is for a demo. For a public production application, attach the TMDB token in your own backend and leave `VITE_TMDB_ACCESS_TOKEN` empty. Never put privileged Firebase service-account keys in frontend environment variables. See [Vite environment documentation](https://vite.dev/guide/env-and-mode).

Firebase web configuration is intentionally client-visible. Configure your own Firebase project and its authentication policy. Session restoration uses one [Firebase authentication observer](https://firebase.google.com/docs/auth/web/manage-users).

`npm run build` outputs `dist/`; `npm run preview` serves that build locally. The existing `firebase.json` includes the SPA fallback for direct links such as `/browse`. Supply environment variables at build time. No hosting deployment is performed by the checks.

## Structure

- `src/component/`: pages, navigation, movie rows, and movie detail pages.
- `src/hook/`: abortable movie and trailer requests.
- `src/services/`: HTTP response validation and supported trailer selection.
- `src/utlis/`: Redux state, configuration, and form validation (existing directory name retained).
- `src/test/`: isolated unit and component regression tests.

Movie lists are kept in Redux and cleared on sign-out. Search is debounced; obsolete requests are aborted and ignored. The banner features up to five now-playing movies, requests muted autoplay, and rotates every 30 seconds. Slide selectors allow manual navigation; pause stops the banner video and rotation. Keyboard focus stops rotation, opening a movie page stops the banner, and reduced-motion preferences disable automatic playback by default. A backdrop remains available when a trailer is missing. Browser autoplay policies, YouTube embedding restrictions, and network availability can affect playback.

Discover movies and search sit below the banner. The catalog includes Now Playing, Trending This Week, Popular Movies, Top Rated, and Coming Soon, with independent loading and retry states. Movie details load genres, runtime, ratings, director, cast, languages, countries, production companies, budget, box office, a trailer, and related titles. Every movie opens at `/movie/:id`, supporting direct links and refreshes. Related titles navigate to their own detail pages. The header overlays the banner and provides an avatar menu with a profile page and sign-out. Detail trailers start through the player controls.

Live Firebase/TMDB credentials and third-party availability are required for end-to-end use. TMDB supplies movie metadata; YouTube supplies trailers. This product is not endorsed or certified by TMDB.

## Performance behavior

- Pages load through React lazy imports with a shimmer fallback, so page-specific code is split into separate bundles.
- Movie lists, search, trailers, and details share a five-minute in-memory response cache capped at 100 entries. Concurrent identical requests share one fetch; cancellation affects only the departing consumer until no consumers remain. Failed and abandoned requests are not cached. The cache stores public movie metadata, not account data, and is reset on a full page reload.
- Posters and backdrops use responsive TMDB image sizes instead of original-resolution backdrops. Poster and cast images load lazily.
- Lower catalog sections begin loading within 400 pixels of the viewport. Browsers without IntersectionObserver fall back to immediate loading.
- Banner playback and rotation stop when the banner is offscreen or the document is hidden. Returning to it recreates the video player, restarting its preview.
- Search state is isolated from the banner and catalog, so typing does not rerender those sibling sections. Existing search debouncing and request cancellation remain in place.

To measure performance, build and preview the production app, then use Lighthouse with mobile throttling and React DevTools Profiler. Compare first navigation, repeat navigation, typing, and scrolling with both cold and warm caches. Automated tests verify the optimization behavior; they do not establish real-device loading times or Core Web Vitals scores.
