# Was Norway really an underdog?

A static HTML/CSS/JavaScript explainer for GitHub Pages. The interactive forecasts are precomputed from the accompanying Norway analysis notebook using only international matches dated before June 10, 2026. `data.json` contains nine model settings, six opponent forecasts per setting, and three dated knockout opening prices for a 90-minute Norway-win market.

## Preview locally

From this directory:

```bash
python3 -m http.server 8000
```

Visit `http://localhost:8000`. A web server is needed because JavaScript fetches `data.json`; opening `index.html` directly with `file://` may block the request.

## GitHub Pages

Put the four site files (`index.html`, `styles.css`, `app.js`, `data.json`) at the root of a GitHub repository, or inside a `docs/` directory. In the repository’s **Settings → Pages**, choose **Deploy from a branch**, the branch you use, and the matching `/ (root)` or `/docs` folder. All paths are relative, so the site works under a project URL such as `username.github.io/repository/`.

## Methods and scope

- Training matches: January 1, 2024–June 9, 2026; no 2026 World Cup results entered the model.
- Rate-proxy attack/defense model, with six average-strength pseudo-matches; scenario half-lives of 180, 365, 730 days and friendly weights of 25%, 50%, 100%.
- Independent Poisson score probabilities for neutral one-off matches. These are illustrative, uncalibrated forecasts. The market quote is an outright title price and must not be compared numerically with match win probabilities.
- A retrospective $100-stake illustration applies a more-than-five-percentage-point edge rule to all three Norway knockout matches, using reported opening 90-minute prices. The default model skips Ivory Coast and selects Brazil and England; settlement is +$310 and −$100, for +$210 net on $200 staked. This tiny, post-hoc example is not evidence of a robust or executable strategy.
- The full calculations, price sources, caveats, and AI assistance disclosure are in the notebook and page footer.
