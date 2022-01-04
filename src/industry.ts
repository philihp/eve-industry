export type BlueprintME =
  | 0
  | 0.01
  | 0.02
  | 0.03
  | 0.04
  | 0.05
  | 0.06
  | 0.07
  | 0.08
  | 0.09
  | 0.1;

export type RigBonus = 0 | 0.02 | 0.024;

export type StructureBonus = 0 | 0.01;

export type SecBonus = 1 | 2.1;

export interface ModifierParams {
  base?: number[];
  runs?: number;
  blueprint?: BlueprintME;
  structure?: StructureBonus;
  rig?: RigBonus;
  sec?: SecBonus;
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
    .map((i) => Math.max(runs, i));
