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

### Research

`researchLevels(from, to)` gives the factor on the base research time of a blueprint for one ME or TE research job. The base research time is the time from level 0 to level 1, from the `research_material` or `research_time` activity in the SDE.

```js
import { researchLevels } from 'eve-industry'

// Research Laboratory Blueprint: base research time 6300 seconds
6300 * researchLevels(0, 5)
// => 201600 (2d 8h)

6300 * researchLevels(5, 10)
// => 15158400 (175d 10h 40m)
```

| Name   | Description                                                                       |
| :----- | :-------------------------------------------------------------------------------- |
| `from` | The level of the blueprint now, `0` to `10`. For TE, use the TE ÷ 2.              |
| `to`   | The level of the blueprint after the job, `from` to `10`. For TE, use the TE ÷ 2. |

The time from level 0 to each level comes from a table that CCP set by hand. No formula gives these values. A job from level `a` to level `b` takes the time to level `b` minus the time to level `a`.

| Level                              |   1 |   2 |   3 |    4 |    5 |    6 |     7 |     8 |      9 |     10 |
| :--------------------------------- | --: | --: | --: | ---: | ---: | ---: | ----: | ----: | -----: | -----: |
| Time from level 0 (level 1 is 105) | 105 | 250 | 595 | 1414 | 3360 | 8000 | 19000 | 45255 | 107700 | 256000 |

Sources: [the CCP dev blog of 2014-07-17](https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know), [Qoi's Formulas for EVE Industry](https://eve-industry.org/export/IndustryFormulas.pdf), [the EVE Online forums](https://forums.eveonline.com/t/blueprints-me-te-research-time/68318), and [EVE Ref](https://everef.net/types/2821).

The factor does not include skills, implants, structures or rigs. Multiply those in separately.
