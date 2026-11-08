# eve-industry

[![tests](https://github.com/philihp/eve-industry/actions/workflows/tests.yml/badge.svg)](https://github.com/philihp/eve-industry/actions/workflows/tests.yml) [![npm](https://img.shields.io/npm/v/eve-industry)](https://www.npmjs.com/package/eve-industry) [![license](https://img.shields.io/npm/l/eve-industry)](https://github.com/philihp/eve-industry/blob/main/package.json)

This library gives the industry mathematics of EVE Online as pure functions. It gives the exact material bill of a job and the exact factor of a research job. It rounds as the game rounds. The package has no dependencies and includes TypeScript types. It runs in Node and in a browser.

```bash
npm install eve-industry
```

## Why

Your spreadsheet says that a 10-run job needs 178.62 Morphite. The game asks for 179. On one job, one unit is not important. On a thousand jobs, you buy a thousand units that you do not need. Or a job does not start, because one unit is missing.

The game applies the ME, structure and rig bonuses in a fixed order. It rounds the total to two decimals. Then it rounds up to a whole unit, once for the whole job and not for each run. `eve-industry` does the same. Each number in the library comes from a CCP dev blog or from an SDE attribute.

## Materials for a manufacturing job

A [720mm Howitzer Artillery II](https://everef.net/types/2970) blueprint needs these materials for each run:

| Quantity | Material                   |
| -------: | :------------------------- |
|        1 | 720mm Howitzer Artillery I |
|       20 | Morphite                   |
|       20 | Thermonuclear Trigger Unit |
|        1 | R.A.M.- Weapon Tech        |
|        5 | Robotics                   |

Example: you have a 10-run copy at ME 5. You build in a Raitaru in nullsec. The Raitaru has a Tech II material rig for equipment. `cost()` gives the exact bill:

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

The result has the same order as `base`. You can join the result with the names of the materials.

| Name        | Default | Description                                                                                                                                          |
| :---------- | ------: | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`      |    `[]` | The quantity of each material for one run, from the blueprint.                                                                                       |
| `runs`      |     `1` | The number of runs. More runs can need fewer materials for each run.                                                                                 |
| `blueprint` |     `0` | The ME of the blueprint as a fraction. ME 5 is `0.05`. ME 10 is `0.1`.                                                                               |
| `structure` |     `0` | `0.01` in a Raitaru, an Azbel or a Sotiyo. `0` in a station or in another structure.                                                                 |
| `rig`       |     `0` | `0.02` for a Tech I material rig. `0.024` for a Tech II material rig. `0` for no rig. If the group of the rig does not include the product, use `0`. |
| `sec`       |     `1` | `1` in highsec. `1.9` in lowsec. `2.1` in nullsec and in wormhole space. This value multiplies the rig bonus only.                                   |

### Where the inputs come from

| Input                       | Source                                                                                                                                                                                                        |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Base quantities             | The `blueprints` file of the [SDE](https://developers.eveonline.com/static-data), in `activities.manufacturing.materials`. [EVE Ref](https://everef.net/) shows the same table on the page of each blueprint. |
| ME and TE of your blueprint | ESI `GET /characters/{character_id}/blueprints/`. The fields are `material_efficiency` (0 to 10) and `time_efficiency` (0 to 20). `blueprint` is the ME divided by 100.                                       |
| Structure bonus             | The type of the structure. An Engineering Complex (Raitaru, Azbel, Sotiyo) gives 1%. A citadel, a refinery or a station gives 0.                                                                              |
| Rig                         | The fitting of the structure. A ship scanner shows the fitting. The structure browser also shows the fitting of a structure that you can use.                                                                 |
| Security                    | The security status of the system in the game. 0.5 and more is highsec. 0.1 to 0.4 is lowsec. 0.0 and less is nullsec. Wormhole space counts as nullsec.                                                      |

<details>
<summary><strong>Sources</strong>: the rule for each step</summary>

- **`blueprint`**: each ME level decreases the materials by 1%, to a maximum of 10%. Source: [CCP Greyscale, 2014](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know): "Each step of ME reduces materials by 1% (always rounded up)."
- **`structure`**: a Raitaru, an Azbel or a Sotiyo decreases the materials by 1%. Source: [Team Five 0, 2016](https://www.eveonline.com/news/view/building-dreams-introducing-engineering-complexes): "1% reduction in manufacturing job required materials."
- **`rig`**: a Tech I material rig decreases the materials by 2%, a Tech II rig by 2.4%. Sources: Team Five 0, 2016, and the dogma attribute Material Reduction Bonus (2594) on [a T1 rig](https://everef.net/types/43875) (−2%) and on [a T2 rig](https://everef.net/types/43921) (−2.4%).
- **`sec`**: the rig bonus is ×1 in highsec, ×1.9 in lowsec, and ×2.1 in nullsec and wormhole space. The structure bonus does not change with security. Source: Team Five 0, 2016: lowsec has "a 90% higher bonus than the base value", and nullsec and wormhole space have "a 110% higher bonus". The dogma attributes 2355, 2356 and 2357 on each rig give the same values. [Steve Ronuken, 2020](https://forums.eveonline.com/t/material-efficiency-production-formula/275553): "It's only the rig bonus which is affected."
- **The bonuses multiply.** Team Five 0, 2016, gives a maximum material bonus of 5.99%. The product 1 − 0.99 × (1 − 0.024 × 2.1) is 5.99%. The sum 0.01 + 0.024 × 2.1 is 6.04%. So the bonuses multiply. Source: [Qoi, 2016](https://eve-industry.org/export/IndustryFormulas.pdf): "materialModifier is a product of the ME modifier … and the facility modifier".
- **Round to two decimals, then up to a whole unit.** Source: Qoi, 2016: `required = max(runs, ceil(round(runs ∗ baseQuantity ∗ materialModifier, 2)))`. The rounding is for the job, not for each run. Source: CCP Greyscale, 2014: "we are now rounding materials per-job rather than per-run, so savings of less than one unit can often be realized with a long enough production run."
- **At least `runs` of each material.** Source: CCP Greyscale, 2014: "every run requires a minimum of one unit of every listed material."

</details>

## Research time

`researchLevels(from, to)` gives the factor on the base research time of a blueprint for one ME or TE research job. The base research time is the time from level 0 to level 1. The SDE has this time in `research_material.time` and `research_time.time`, in seconds. EVE Ref shows it on the page of the blueprint.

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

| Name   | Description                                                                            |
| :----- | :------------------------------------------------------------------------------------- |
| `from` | The level of the blueprint now, `0` to `10`. For TE, the level is TE ÷ 2.              |
| `to`   | The level of the blueprint after the job, `from` to `10`. For TE, the level is TE ÷ 2. |

If `from` or `to` is not a whole number from `0` to `10`, the result is `undefined`.

The time to each level comes from a table that CCP made by hand. No formula gives these values. A job from level `a` to level `b` takes the time to level `b` minus the time to level `a`. The last levels take the most time. Level 10 alone is 58% of the time from level 0 to level 10.

| Level                              |   1 |   2 |   3 |    4 |    5 |    6 |     7 |     8 |      9 |     10 |
| :--------------------------------- | --: | --: | --: | ---: | ---: | ---: | ----: | ----: | -----: | -----: |
| Time from level 0 (level 1 is 105) | 105 | 250 | 595 | 1414 | 3360 | 8000 | 19000 | 45255 | 107700 | 256000 |

The factor does not include the bonuses of skills, implants, structures or rigs. You multiply the factor by those bonuses.

<details>
<summary><strong>Sources</strong></summary>

- [CCP Greyscale, 2014](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know): the table, and "Research times are always rank \* 105 for the first level."
- [Qoi, Formulas for EVE Industry v2.2, 2016](https://eve-industry.org/export/IndustryFormulas.pdf): "Research Time from level 0 to level n = baseResearchTime ∗ timeModifier ∗ levelModifier_n / 105".
- [Steve Ronuken, 2018](https://forums.eveonline.com/t/blueprints-me-te-research-time/68318): the factor of each single level, and "from 0->2 you add the time for 0->1 and 1->2 together".
- [EVE Ref, Research Laboratory Blueprint](https://everef.net/types/2821): the total time from level 0 at each level for a rank-60 blueprint. The tests give all ten.

</details>

## Each number has a source

- Each rule has a source: a CCP dev blog, an SDE attribute, or a post of a known third-party developer. The Sources block under each function quotes the source.
- The tests use real blueprints. `researchLevels` gives the ten research times that EVE Ref lists for the Research Laboratory Blueprint. It also gives the step factors that Steve Ronuken published.
- From version 0.2.0, each release on npm has a signed [provenance attestation](https://docs.npmjs.com/generating-provenance-statements). The attestation links the package to the commit and to the GitHub Actions run that built it. `npm audit signatures` in your project compares your copy with the attestation.

## Planned functions

This library has pure functions only. It makes no ESI calls, uses no market data, and keeps no state.

- `time()`: the duration of a manufacturing, reaction, copy, research or invention job.
- The chance of success of an invention job.
- The yield of reprocessing.

If you need a formula, open an issue that gives a source for its numbers.

## Release procedure

When you publish a GitHub release, the `release` workflow publishes the package to npm. The workflow has no npm token. npm trusts the workflow through the OIDC token of GitHub ([trusted publishing](https://docs.npmjs.com/trusted-publishers)), and npm attaches the provenance attestation. `publishConfig.provenance` in `package.json` makes `npm publish` refuse a publish without an attestation. So a publish from a laptop fails.

1. Set the version in `package.json` on `main`.
2. Publish a GitHub release with the tag `v` + the version, for example `v0.2.0`.

If the tag does not match the version, the workflow stops. If the tag matches, the workflow installs, lints, tests, builds and publishes.

Before the first release, configure the trusted publisher on npmjs.com, in the settings of the package:

- Organization or user: `philihp`
- Repository: `eve-industry`
- Workflow filename: `release.yml`
- Allowed actions: `npm publish`

If no publish succeeds in the two days after you save these settings, the settings expire.

---

EVE Online and all related logos and designs are trademarks of [CCP hf.](https://www.ccpgames.com/) This project is not affiliated with or endorsed by CCP hf.
