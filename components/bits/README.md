# bits

Micro-interaction components in the [React Bits](https://reactbits.dev) idiom — its component
vocabulary (SplitText, CountUp, ShinyText, SpotlightCard, ClickSpark, Magnet, DotGrid,
AnimatedContent, Marquee), written here against this project's conventions rather than copied.

React Bits is copy-in, not a package: you own the file. These are ours, so they use
`framer-motion` (already a dependency), the house `EASE` from `lib/motion.js`, and Tailwind v4
utilities. They are JavaScript, like the rest of the app.

**Every component honours `prefers-reduced-motion`.** Under it, a reveal becomes a plain fade,
a counter lands on its value, a canvas holds still and a spark does not fire. That is a
requirement from `docs/kb/30-decisions.md` D-008, not a nicety.

**They decorate; they never carry meaning.** A number is legible before `CountUp` reaches it,
a headline is readable before `SplitText` assembles it, and nothing is behind a hover.
