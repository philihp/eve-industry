export type BlueprintME =
  0 | 0.01 | 0.02 | 0.03 | 0.04 | 0.05 | 0.06 | 0.07 | 0.08 | 0.09 | 0.1

export type RigBonus = 0 | 0.02 | 0.024

export type StructureBonus = 0 | 0.01

export type SecBonus = 1 /* highsec */ | 1.9 /* lowsec */ | 2.1 /* nullsec */

export interface ModifierParams {
  base?: number[]
  runs?: number
  blueprint?: BlueprintME
  structure?: StructureBonus
  rig?: RigBonus
  sec?: SecBonus
}

export const cost = ({
  base = [],
  runs = 1,
  blueprint = 0,
  structure = 0,
  rig = 0,
  sec = 1,
}: ModifierParams): number[] =>
  base
    // first multiply all multipliers
    .map((i) => runs * i * (1 - blueprint) * (1 - structure) * (1 - rig * sec))
    // then round and keep two decimals
    .map((i) => Math.round(i * 100) / 100)
    // then ceiling, because consuming any part consumes the whole
    .map(Math.ceil)
    // but each run takes at least 1
    .map((i) => Math.max(runs, i))

// Research time from level 0 to each level, where level 1 is 105. CCP set
// these values by hand, so no formula gives them: the even levels repeat the
// skill point table on purpose.
// https://www.eveonline.com/news/view/eve-industry-all-you-want-to-know
const RESEARCH_LEVELS = [
  0, 105, 250, 595, 1414, 3360, 8000, 19000, 45255, 107700, 256000,
] as const

// The time from level 0 to `level`, or undefined when the table has no such
// level (undefined, negative, above 10, or not a whole number).
const timeToLevel = (level: number | undefined): number | undefined =>
  level === undefined ? undefined : RESEARCH_LEVELS[level]

// The factor on a blueprint's base research time (the SDE time for level 0
// to level 1) for one job from level `from` to level `to`, or undefined when
// either level is not a whole number from 0 to 10.
export const researchLevels = (
  from: number | undefined,
  to: number | undefined
): number | undefined => {
  const start = timeToLevel(from)
  const end = timeToLevel(to)
  return start === undefined || end === undefined
    ? undefined
    : (end - start) / 105
}
