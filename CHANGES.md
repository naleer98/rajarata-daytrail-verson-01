# Next-level release

## Stability hotfix

- Fixed the `ScrollToTop` route effect so React no longer treats the browser scroll result as an effect cleanup function.
- Resolved the `destroy is not a function` crash that caused blank pages after opening routes such as `/explore`.
- Hardened the remaining navigation, admin and chat effects so every effect returns only a valid cleanup function or nothing.

## Experience and design

- Rebuilt the entire interface with a refined forest, parchment, gold and clay visual system.
- Added a cinematic HD hero, consistent photography, responsive spacing, motion and accessible focus states.
- Replaced legacy decorative icons with a consistent Lucide icon language and a new branded favicon.
- Reworked navigation, footer, home, explorer, place detail, planner, authentication and admin views.
- Removed redundant page-level styling and consolidated the interface into one maintainable design system.

## Maps and planning

- Added numbered custom map markers, destination popups, marker focus, fit-to-results behaviour and geolocation.
- Added map/list controls for smaller screens and a plotted route line for generated itineraries.
- Added a reliable local planner fallback using real coordinates, pace, opening times and visit durations.
- Improved planner selection, timing summaries, warnings, cultural notes and mobile route presentation.

## Travel assistant

- Rebuilt the chat experience with persistent session history, typing feedback, contextual prompts and clearer message formatting.
- Expanded the backend assistant to understand place names, hours, fees, directions, etiquette, categories, nearby stops, sunset ideas and time-based routes.
- Added an immediate local knowledge fallback so the assistant remains useful when the API is offline.

## Reliability and security

- Added locally bundled destination data and photos so public pages never collapse into empty error states.
- Moved every API route before server startup and added health, 404 and central error responses.
- Removed the insecure fallback JWT secret and strengthened new administrator passwords to eight characters.
- Added origin-aware CORS, request-size limits, object-ID validation, itinerary ownership checks and safer upload paths.
- Removed the hardcoded seed password; seed credentials now come from environment variables.
- Normalized destination form data, coordinates and facilities on the backend.

## Validation

- Frontend production bundle completed successfully.
- All backend JavaScript files passed syntax validation.
- Frontend destination assets and local itinerary generation passed smoke tests.
- Backend itinerary generation passed a two-stop route smoke test.
