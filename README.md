[![tests](https://github.com/philihp/evemath/actions/workflows/tests.yml/badge.svg)](https://github.com/philihp/evemath/actions/workflows/tests.yml)

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
