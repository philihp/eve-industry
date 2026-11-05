[![tests](https://github.com/philihp/eve-industry/actions/workflows/tests.yml/badge.svg)](https://github.com/philihp/eve-industry/actions/workflows/tests.yml)

A library for expressing functions of mechanics found in EVE Online.

### Industry

The base requirements of a [720mm Howitzer Artillery II](https://everef.net/type/2970) blueprint are:

| Quantity | Type                       |
| -------: | :------------------------- |
|        1 | 720mm Howitzer Artillery I |
|       20 | Morphite                   |
|       20 | Thermonuclear Trigger Unit |
|        1 | R.A.M.- Weapon Tech        |
|        5 | Robotics                   |

However various bonuses affect this, although the timing of multiplier bonuses is important before and after rounding, and only to a certain decimal precision. This function will tell you exactly how many you need:

```js
import { cost } from 'eveonline/industry'

cost({
  base: [1, 20, 20, 1, 5],
  runs: 10,
  blueprint: 0.05,
  rig: 0.024,
  sec: 2.1,
  structure: 0.01,
})
// => [10, 179, 179, 10, 45]
```

| Name        | Default | Description                                                                                                                                                                                                       |
| :---------- | ------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`      |    `[]` | This should be an array of integers, where each element indicates a quantity used in the blueprint. The positions of each material are retained, so you can zip/transpose them back in with a list of item types. |
| `runs`      |     `1` | Number of runs, more runs lets you potentially use fewer                                                                                                                                                          |
| `blueprint` |     `0` | ME of blueprint, `0.00`, `0.01`, `0.02`, ..., `0.10`                                                                                                                                                              |
| `structure` |     `0` | The structure bonus, `0` or `0.01`.                                                                                                                                                                               |
| `rig`       |     `0` | `0` for no rig, `0.02` for a T1 rig, and `0.024` for a T2 rig. You can confirm this by using a ship scanner on the structure                                                                                      |
| `sec`       |     `1` | `1` for highsec, `1.9` for lowsec, `2.1` for nullsec and wormhole space                                                                                                                                           |

#### Sources

Each step of `cost()` follows a published rule:

- **`blueprint`** — each ME level removes 1% of the materials, from 0% to 10%. [CCP Greyscale, 2014](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know): "Each step of ME reduces materials by 1% (always rounded up)."
- **`structure`** — a Raitaru, Azbel or Sotiyo removes 1%. [Team Five 0, 2016](https://www.eveonline.com/news/view/building-dreams-introducing-engineering-complexes): "1% reduction in manufacturing job required materials."
- **`rig`** — a T1 material rig removes 2%, a T2 rig 2.4%. Team Five 0, 2016, and the dogma attribute Material Reduction Bonus (2594) on [a T1 rig](https://everef.net/types/43875) (−2%) and [a T2 rig](https://everef.net/types/43921) (−2.4%).
- **`sec`** — the rig bonus is ×1 in highsec, ×1.9 in lowsec and ×2.1 in nullsec and wormhole space. The structure bonus does not scale. Team Five 0, 2016: lowsec has "a 90% higher bonus than the base value", nullsec and wormhole space "a 110% higher bonus"; the dogma attributes 2355, 2356 and 2357 on each rig; [Steve Ronuken, 2020](https://forums.eveonline.com/t/material-efficiency-production-formula/275553): "It's only the rig bonus which is affected."
- **The bonuses multiply.** Team Five 0, 2016, gives a maximum material bonus of 5.99%. That is 1 − 0.99 × (1 − 0.024 × 2.1) = 5.99%; added, the bonuses would give 6.04%. [Qoi, 2016](https://eve-industry.org/export/IndustryFormulas.pdf): "materialModifier is a product of the ME modifier … and the facility modifier".
- **Round to two decimals, then up to a whole unit.** Qoi, 2016: `required = max(runs, ceil(round(runs ∗ baseQuantity ∗ materialModifier, 2)))`. The rounding is per job, not per run. CCP Greyscale, 2014: "we are now rounding materials per-job rather than per-run, so savings of less than one unit can often be realized with a long enough production run."
- **At least `runs` of each material.** CCP Greyscale, 2014: "every run requires a minimum of one unit of every listed material."

### Research

`researchLevels(from, to)` gives the factor on the base research time of a blueprint for one ME or TE research job. The base research time is the time from level 0 to level 1, from the `research_material` or `research_time` activity in the SDE.

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

| Name   | Description                                                                       |
| :----- | :-------------------------------------------------------------------------------- |
| `from` | The level of the blueprint now, `0` to `10`. For TE, use the TE ÷ 2.              |
| `to`   | The level of the blueprint after the job, `from` to `10`. For TE, use the TE ÷ 2. |

If `from` or `to` is not a whole number from `0` to `10`, the result is `undefined`. This includes `undefined`, `-1`, `11`, `2.5` and `NaN`.

The time from level 0 to each level comes from a table that CCP set by hand. No formula gives these values. A job from level `a` to level `b` takes the time to level `b` minus the time to level `a`.

| Level                              |   1 |   2 |   3 |    4 |    5 |    6 |     7 |     8 |      9 |     10 |
| :--------------------------------- | --: | --: | --: | ---: | ---: | ---: | ----: | ----: | -----: | -----: |
| Time from level 0 (level 1 is 105) | 105 | 250 | 595 | 1414 | 3360 | 8000 | 19000 | 45255 | 107700 | 256000 |

Sources: [the CCP dev blog of 2014-07-17](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know), [Qoi's Formulas for EVE Industry](https://eve-industry.org/export/IndustryFormulas.pdf), [the EVE Online forums](https://forums.eveonline.com/t/blueprints-me-te-research-time/68318), and [EVE Ref](https://everef.net/types/2821).

The factor does not include skills, implants, structures or rigs. Multiply those in separately.

### Releases

The package is published to npm by the `release` workflow, with a [provenance attestation](https://docs.npmjs.com/generating-provenance-statements) that links the package to the commit and the workflow run that built it. The workflow holds no npm token: npm trusts it through GitHub's OIDC token ([trusted publishing](https://docs.npmjs.com/trusted-publishers)). `publishConfig.provenance` in `package.json` makes `npm publish` refuse to publish without an attestation, so a publish from a laptop fails.

To release a version:

1. Set the version in `package.json` on `main`.
2. Publish a GitHub release whose tag is `v` and that version, for example `v0.2.0`. The workflow refuses a tag that does not match.
3. The workflow installs, lints, tests, builds and publishes. The npm page of the version then shows a Provenance panel.

Before the first release, set up the trusted publisher once on npmjs.com, under the package's settings:

- Organization or user: `philihp`
- Repository: `eve-industry`
- Workflow filename: `release.yml`
- Allowed actions: `npm publish`

The configuration expires if no publish succeeds within two days of saving it.

To check a downloaded copy, run `npm audit signatures` in a project that depends on it.
