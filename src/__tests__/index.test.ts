import { cost, BlueprintME, StructureBonus, RigBonus, SecBonus } from '..'

describe('cost', () => {
  const base = [11, 1, 2, 27]
  describe('1 run', () => {
    const runs = 1
    describe('0 ME', () => {
      const blueprint: BlueprintME = 0.0
      describe('base structure', () => {
        const structure: StructureBonus = 0.0
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([11, 1, 2, 27])
        })
      })
      describe('raitaru', () => {
        const structure: StructureBonus = 0.01
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([11, 1, 2, 27])
        })

        describe('T1 rig', () => {
          const rig: RigBonus = 0.02
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([11, 1, 2, 26])
          })
        })
        describe('T2 rig', () => {
          const rig: RigBonus = 0.024
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([11, 1, 2, 26])
          })
        })
      })
    })
    describe('10 ME', () => {
      const blueprint: BlueprintME = 0.1
      describe('base structure', () => {
        const structure: StructureBonus = 0.0
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([10, 1, 2, 25])
        })
      })
      describe('raitaru', () => {
        const structure: StructureBonus = 0.01
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([10, 1, 2, 25])
        })

        describe('T1 rig', () => {
          const rig: RigBonus = 0.02
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([10, 1, 2, 24])
          })
        })
        describe('T2 rig', () => {
          const rig: RigBonus = 0.024
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([10, 1, 2, 23])
          })
        })
      })
    })
  })
  describe('1000 runs', () => {
    const runs = 1000
    describe('0 ME', () => {
      const blueprint: BlueprintME = 0.0
      describe('base structure', () => {
        const structure: StructureBonus = 0.0
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([11000, 1000, 2000, 27000])
        })
      })
      describe('raitaru', () => {
        const structure: StructureBonus = 0.01
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([10890, 1000, 1980, 26730])
        })

        describe('T1 rig', () => {
          const rig: RigBonus = 0.02
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([10433, 1000, 1897, 25608])
          })
        })
        describe('T2 rig', () => {
          const rig: RigBonus = 0.024
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([10342, 1000, 1881, 25383])
          })
        })
      })
    })
    describe('10 ME', () => {
      const blueprint: BlueprintME = 0.1
      describe('base structure', () => {
        const structure: StructureBonus = 0.0
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([9900, 1000, 1800, 24300])
        })
      })
      describe('raitaru', () => {
        const structure: StructureBonus = 0.01
        test('returns expected', () => {
          const options = { base, runs, blueprint, structure }
          expect(cost(options)).toStrictEqual([9801, 1000, 1782, 24057])
        })

        describe('T1 rig', () => {
          const rig: RigBonus = 0.02
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([9390, 1000, 1708, 23047])
          })
        })
        describe('T2 rig', () => {
          const rig: RigBonus = 0.024
          const sec: SecBonus = 2.1
          test('returns expected', () => {
            const options = { base, runs, blueprint, structure, rig, sec }
            expect(cost(options)).toStrictEqual([9308, 1000, 1693, 22845])
          })
        })
      })
    })
  })
})
