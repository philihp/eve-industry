# eve-industry

[![tests](https://github.com/philihp/eve-industry/actions/workflows/tests.yml/badge.svg)](https://github.com/philihp/eve-industry/actions/workflows/tests.yml) [![npm](https://img.shields.io/npm/v/eve-industry)](https://www.npmjs.com/package/eve-industry) [![license](https://img.shields.io/npm/l/eve-industry)](https://github.com/philihp/eve-industry/blob/main/package.json)

The industry mathematics of EVE Online as pure functions. It gives the exact material bill of a job and the exact factor of a research job, rounded the way the game rounds. No dependencies. TypeScript types included. It runs in Node and in a browser.

```bash
npm install eve-industry
```

## Why

Your spreadsheet says a 10-run job needs 178.62 Morphite. The game asks for 179. One unit is nothing on one job. On a thousand jobs it is a hangar of Morphite you bought and do not need, or a job that does not start.

The game applies the ME, structure and rig bonuses in a fixed order. It rounds the total to two decimals, then up to a whole unit, once for the whole job and not for each run. `eve-industry` does the same. Every number in it is tied to the CCP dev blog or the SDE attribute it comes from.

## Materials for a manufacturing job

A [720mm Howitzer Artillery II](https://everef.net/types/2970) blueprint needs, for each run:

| Quantity | Material                   |
| -------: | :------------------------- |
|        1 | 720mm Howitzer Artillery I |
|       20 | Morphite                   |
|       20 | Thermonuclear Trigger Unit |
|        1 | R.A.M.- Weapon Tech        |
|        5 | Robotics                   |

You hold a 10-run copy at ME 5. You build in a Raitaru in nullsec with a Tech II equipment material rig. `cost()` gives the exact bill:

```js
import { cost } from 'eve-industry'

cost({
  base: [1, 20, 20, 1, 5],
  runs: 10,
  blueprint: 0.05, // ME 5
  structure: 0.01, // Raitaru, Azbel or Sotiyo
  rig: 0.024, // Tech II material rig
  sec: 2.1, // nullsec
})
// => [10, 179, 179, 10, 45]
```

The result keeps the order of `base`, so you can zip it back together with the material names.

| Name        | Default | Description                                                                                                                  |
| :---------- | ------: | :--------------------------------------------------------------------------------------------------------------------------- |
| `base`      |    `[]` | The quantity of each material for one run, from the blueprint.                                                               |
| `runs`      |     `1` | The number of runs. More runs can need fewer materials per run.                                                              |
| `blueprint` |     `0` | The ME of the blueprint as a fraction: ME 5 is `0.05`, ME 10 is `0.1`.                                                       |
| `structure` |     `0` | `0.01` in a Raitaru, Azbel or Sotiyo. `0` in a station or any other structure.                                               |
| `rig`       |     `0` | `0.02` for a Tech I material rig, `0.024` for a Tech II rig, `0` for none. Count a rig only if its group covers the product. |
| `sec`       |     `1` | `1` in highsec, `1.9` in lowsec, `2.1` in nullsec and wormhole space. It scales the rig bonus only.                          |

### Where the inputs come from

| Input                       | Source                                                                                                                                                                                                    |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base quantities             | The `blueprints` file of the [SDE](https://developers.eveonline.com/static-data), under `activities.manufacturing.materials`. [EVE Ref](https://everef.net/) shows the same table on each blueprint page. |
| ME and TE of your blueprint | ESI `GET /characters/{character_id}/blueprints/`: `material_efficiency` (0 to 10) and `time_efficiency` (0 to 20). Divide the ME by 100 for `blueprint`.                                                  |
| Structure bonus             | The structure type. An Engineering Complex (Raitaru, Azbel, Sotiyo) gives 1%. A citadel, a refinery or a station gives none.                                                                              |
| Rig                         | The fitting of the structure. A ship scanner shows it, and so does the structure browser for a structure you can use.                                                                                     |
| Security                    | The security status of the system as the game shows it: 0.5 and above is highsec, 0.1 to 0.4 is lowsec, 0.0 and below is nullsec. Wormhole space counts as nullsec.                                       |

<details>
<summary><strong>Sources</strong>: the rule behind each step</summary>

- **`blueprint`** — each ME level removes 1% of the materials, from 0% to 10%. [CCP Greyscale, 2014](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know): "Each step of ME reduces materials by 1% (always rounded up)."
- **`structure`** — a Raitaru, Azbel or Sotiyo removes 1%. [Team Five 0, 2016](https://www.eveonline.com/news/view/building-dreams-introducing-engineering-complexes): "1% reduction in manufacturing job required materials."
- **`rig`** — a T1 material rig removes 2%, a T2 rig 2.4%. Team Five 0, 2016, and the dogma attribute Material Reduction Bonus (2594) on [a T1 rig](https://everef.net/types/43875) (−2%) and [a T2 rig](https://everef.net/types/43921) (−2.4%).
- **`sec`** — the rig bonus is ×1 in highsec, ×1.9 in lowsec and ×2.1 in nullsec and wormhole space. The structure bonus does not scale. Team Five 0, 2016: lowsec has "a 90% higher bonus than the base value", nullsec and wormhole space "a 110% higher bonus"; the dogma attributes 2355, 2356 and 2357 on each rig; [Steve Ronuken, 2020](https://forums.eveonline.com/t/material-efficiency-production-formula/275553): "It's only the rig bonus which is affected."
- **The bonuses multiply.** Team Five 0, 2016, gives a maximum material bonus of 5.99%. That is 1 − 0.99 × (1 − 0.024 × 2.1) = 5.99%; added, the bonuses would give 6.04%. [Qoi, 2016](https://eve-industry.org/export/IndustryFormulas.pdf): "materialModifier is a product of the ME modifier … and the facility modifier".
- **Round to two decimals, then up to a whole unit.** Qoi, 2016: `required = max(runs, ceil(round(runs ∗ baseQuantity ∗ materialModifier, 2)))`. The rounding is per job, not per run. CCP Greyscale, 2014: "we are now rounding materials per-job rather than per-run, so savings of less than one unit can often be realized with a long enough production run."
- **At least `runs` of each material.** CCP Greyscale, 2014: "every run requires a minimum of one unit of every listed material."

</details>

## Research time

`researchLevels(from, to)` gives the factor on the base research time of a blueprint for one ME or TE research job. The base research time is the time from level 0 to level 1. The SDE holds it as `research_material.time` and `research_time.time`, in seconds, and EVE Ref shows it on the blueprint page.

```js
import { researchLevels } from 'eve-industry'

// Research Laboratory Blueprint: base research time 6300 seconds
6300 * researchLevels(0, 5)
// => 201600 (2d 8h)

6300 * researchLevels(5, 10)
// => 15158400 (175d 10h 40m)

researchLevels(0, 11)
// => undefined
```

With a blueprint row from ESI:

```js
const toMaxMe = researchLevels(blueprint.material_efficiency, 10)
const toMaxTe = researchLevels(blueprint.time_efficiency / 2, 10)
```

| Name   | Description                                                                       |
| :----- | :-------------------------------------------------------------------------------- |
| `from` | The level of the blueprint now, `0` to `10`. For TE, use the TE ÷ 2.              |
| `to`   | The level of the blueprint after the job, `from` to `10`. For TE, use the TE ÷ 2. |

If `from` or `to` is not a whole number from `0` to `10`, the result is `undefined`.

The time to each level is a table that CCP set by hand. No formula gives these values. A job from level `a` to level `b` takes the time to `b` minus the time to `a`, so the last levels cost the most: level 10 alone is 58% of the whole climb from 0.

| Level                              |   1 |   2 |   3 |    4 |    5 |    6 |     7 |     8 |      9 |     10 |
| :--------------------------------- | --: | --: | --: | ---: | ---: | ---: | ----: | ----: | -----: | -----: |
| Time from level 0 (level 1 is 105) | 105 | 250 | 595 | 1414 | 3360 | 8000 | 19000 | 45255 | 107700 | 256000 |

The factor does not include skills, implants, structure or rig bonuses. Multiply those in yourself.

<details>
<summary><strong>Sources</strong></summary>

- [CCP Greyscale, 2014](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know): the table, and "Research times are always rank \* 105 for the first level."
- [Qoi, Formulas for EVE Industry v2.2, 2016](https://eve-industry.org/export/IndustryFormulas.pdf): "Research Time from level 0 to level n = baseResearchTime ∗ timeModifier ∗ levelModifier_n / 105".
- [Steve Ronuken, 2018](https://forums.eveonline.com/t/blueprints-me-te-research-time/68318): the factor of each single level, and "from 0->2 you add the time for 0->1 and 1->2 together".
- [EVE Ref, Research Laboratory Blueprint](https://everef.net/types/2821): the total time from level 0 at every level for a rank-60 blueprint. The tests reproduce all ten.

</details>

## Every number has a source

- Each rule is quoted from a CCP dev blog, an SDE attribute or a post by a known third-party developer. The Sources block under each function lists them.
- The tests check real blueprints. `researchLevels` reproduces the ten research times EVE Ref lists for the Research Laboratory Blueprint, and the step factors Steve Ronuken published.
- From 0.2.0 on, each release on npm carries a signed [provenance attestation](https://docs.npmjs.com/generating-provenance-statements) that links the package to the commit and the GitHub Actions run that built it. Run `npm audit signatures` in your project to check your copy.

## Planned

Pure functions only: no ESI calls, no market data, no state.

- `time()`: the duration of a manufacturing, reaction, copy, research or invention job.
- The chance of success of an invention job.
- The yield of reprocessing.

Open an issue for a formula you need. Give a source for its numbers.

## Releasing

The `release` workflow publishes to npm when a GitHub release is published. It holds no npm token: npm trusts it through GitHub's OIDC token ([trusted publishing](https://docs.npmjs.com/trusted-publishers)) and attaches the provenance attestation itself. `publishConfig.provenance` in `package.json` makes `npm publish` refuse to publish without an attestation, so a publish from a laptop fails.

1. Set the version in `package.json` on `main`.
2. Publish a GitHub release whose tag is `v` and that version, for example `v0.2.0`. The workflow refuses a tag that does not match.
3. The workflow installs, lints, tests, builds and publishes.

Before the first release, set up the trusted publisher once on npmjs.com, under the package's settings: user `philihp`, repository `eve-industry`, workflow `release.yml`, allowed action `npm publish`. The configuration expires if no publish succeeds within two days of saving it.

---

EVE Online and all related logos and designs are trademarks of [CCP hf.](https://www.ccpgames.com/) This project is not affiliated with or endorsed by CCP hf.
