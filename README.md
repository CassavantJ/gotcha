# Gotcha

Fifty trick questions, three lives. Nothing is what it seems.

An original trick-question quiz in the spirit of the old Flash classics: fifty questions, three
lives, and losing them all sends you back to question 1. Some answers are on the buttons; many
aren't. Timed questions burn a fuse, two passes let you skip, and a couple more are hidden in
the quiz. Every question, the host (Gus) and the music were made for this game.

- **Questions** (`src/quiz/questions.ts`): plain data for the multiple-choice, key and typing
  questions; interactive ones point at a scene in `src/components/scenes/`.
- **Rules** (`src/quiz/run.ts`): lives, passes and tickets as pure functions, with tests that
  also check self-referential questions stay true (question 2's answer really has four letters).

Part of [Jake's hub](https://raylmao.com). Scaffolded from the hub's app template, so it shares
the hub's theme, font and "back to the hub" bar (see `src/hub/`).

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm check` runs the typecheck, lint, format check and tests (Vitest, any `*.test.ts` under
`src/`); CI runs it on every push.

## Deploy

Hosted as its own Cloudflare Pages project at `https://gotcha.raylmao.com`. The full steps
(GitHub repo, Pages project, subdomain and hub registry entry) are in the hub's
`ADDING_AN_APP.md`.

`public/_headers` lets the hub embed this app (`frame-ancestors`). If the app calls an API or
loads anything from another origin, add that origin to the Content-Security-Policy there.
