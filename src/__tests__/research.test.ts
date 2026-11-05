import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { researchLevels } from '../index.ts'

const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// The factor for a valid job. NaN would make the test fail.
const factor = (from: number, to: number): number =>
  researchLevels(from, to) ?? NaN

describe('researchLevels', () => {
  test('level 0 to level 1 is the base time', () => {
    assert.equal(researchLevels(0, 1), 1)
  })

  test('a job that does not change the level takes no time', () => {
    levels.forEach((level) => assert.equal(researchLevels(level, level), 0))
  })

  // Steve Ronuken's factor for each single level, 2018-04-07:
  // https://forums.eveonline.com/t/blueprints-me-te-research-time/68318
  describe('one level at a time', () => {
    const steps = [
      1,
      29 / 21,
      23 / 7,
      39 / 5,
      278 / 15,
      928 / 21,
      2200 / 21,
      5251 / 21,
      4163 / 7,
      29660 / 21,
    ]
    levels.forEach((level, i) =>
      test(`level ${level - 1} to level ${level}`, () => {
        assert.equal(researchLevels(level - 1, level), steps[i])
      })
    )
  })

  // Research Laboratory Blueprint, rank 60, base research time 6300 seconds.
  // EVE Ref gives the total time from level 0:
  // https://everef.net/types/2821
  describe('Research Laboratory Blueprint from level 0', () => {
    const base = 6300
    const seconds = [
      6300, // 1h 45m
      15000, // 4h 10m
      35700, // 9h 55m
      84840, // 23h 34m
      201600, // 2d 8h
      480000, // 5d 13h 20m
      1140000, // 13d 4h 40m
      2715300, // 31d 10h 15m
      6462000, // 74d 19h
      15360000, // 177d 18h 40m
    ]
    levels.forEach((level, i) =>
      test(`level ${level}`, () => {
        assert.equal(Math.round(base * factor(0, level)), seconds[i])
      })
    )
  })

  test('a job over several levels takes the sum of its levels', () => {
    const sum = factor(3, 5) + factor(5, 7)
    assert.equal(Math.round(105 * sum), 19000 - 595)
    assert.equal(Math.round(105 * factor(3, 7)), 19000 - 595)
  })

  describe('a level that is not a whole number from 0 to 10 gives undefined', () => {
    const jobs: [number | undefined, number | undefined][] = [
      [undefined, 5],
      [5, undefined],
      [undefined, undefined],
      [-1, 5],
      [5, -1],
      [0, 11],
      [11, 10],
      [-1, 11],
      [2.5, 5],
      [Number.NaN, 5],
    ]
    jobs.forEach(([from, to]) =>
      test(`from ${from} to ${to}`, () => {
        assert.equal(researchLevels(from, to), undefined)
      })
    )
  })
})
