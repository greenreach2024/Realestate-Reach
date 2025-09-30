# Realestate-Reach

This repository contains two main assets:

1. **Buyer Registry UX & Engineering Specification** – a detailed product and platform blueprint located at `docs/buyer-registry-ux-engineering-spec.md`.
2. **Buyer Registry Experience Demo** – a static front-end prototype located in the `web/` directory that visualises the core workflows for buyers, sellers, agents, and mortgage professionals.

## Running the demo

The prototype is built with vanilla HTML, CSS, and JavaScript (ES modules). No build step is required.

1. Open `web/index.html` in any modern browser (double-click the file or serve the folder with a static web server such as `python -m http.server`).
2. Use the navigation bar to explore landing content, onboarding flows, notifications, subscription plans, and each persona’s workspace.
3. Interact with wishlist cards, listing insights, lead cards, and modal forms to experience the demand-led workflows described in the specification.

## Repository structure

```
├── docs/
│   └── buyer-registry-ux-engineering-spec.md
├── web/
│   ├── app.js
│   ├── data.js
│   ├── index.html
│   └── styles.css
└── README.md
```

## Browser compatibility

The demo uses modern browser APIs (`dialog`, `structuredClone`, `crypto.randomUUID`). For the best experience, use the latest versions of Chrome, Edge, Safari, or Firefox.
