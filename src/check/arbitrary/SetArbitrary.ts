import { ArrayArbitrary, maxLengthFromMinLength } from './ArrayArbitrary';
import { Arbitrary } from './definition/Arbitrary';
import { Shrinkable } from './definition/Shrinkable';

/** @internal */
function subArrayContains<T>(tab: T[], upperBound: number, includeValue: (v: T) => boolean): boolean {
  for (let idx = 0; idx < upperBound; ++idx) {
    if (includeValue(tab[idx])) return true;
  }
  return false;
}

/** @internal */
function swap<T>(tab: T[], idx1: number, idx2: number): void {
  const temp = tab[idx1];
  tab[idx1] = tab[idx2];
  tab[idx2] = temp;
}

/** @internal */
export function buildCompareFilter<T>(compare: (a: T, b: T) => boolean): (tab: Shrinkable<T>[]) => Shrinkable<T>[] {
  return (tab: Shrinkable<T>[]): Shrinkable<T>[] => {
    let finalLength = tab.length;
    for (let idx = tab.length - 1; idx !== -1; --idx) {
      if (subArrayContains(tab, idx, (t) => compare(t.value_, tab[idx].value_))) {
        --finalLength;
        swap(tab, idx, finalLength);
      }
    }
    return tab.slice(0, finalLength);
  };
}

/**
 * Build fully set SetConstraints from a partial data
 * @internal
 */
function buildCompleteSetConstraints<T>(constraints: SetConstraints<T>): Required<SetConstraints<T>> {
  const minLength = constraints.minLength !== undefined ? constraints.minLength : 0;
  const maxLength = constraints.maxLength !== undefined ? constraints.maxLength : maxLengthFromMinLength(minLength);
  const compare = constraints.compare !== undefined ? constraints.compare : (a: T, b: T) => a === b;
  return { minLength, maxLength, compare };
}

/**
 * Extract constraints from args received by set
 * @internal
 */
function extractSetConstraints<T>(
  args:
    | []
    | [number]
    | [number, number]
    | [(a: T, b: T) => boolean]
    | [number, (a: T, b: T) => boolean]
    | [number, number, (a: T, b: T) => boolean]
    | [SetConstraints<T>]
): SetConstraints<T> {
  switch (args.length) {
    case 0:
      return {}; // set(arb)
    case 1:
      if (typeof args[0] === 'number') return { maxLength: args[0] }; // set(arb, maxLength)
      if (typeof args[0] === 'function') return { compare: args[0] }; // set(arb, compare)
      return args[0]; // set(arb, constraints)
    case 2:
      if (typeof args[1] === 'number') return { minLength: args[0], maxLength: args[1] }; // set(arb, minLength, maxLength)
      return { maxLength: args[0], compare: args[1] }; // set(arb, maxLength, compare)
    case 3:
      return { minLength: args[0], maxLength: args[1], compare: args[2] }; // set(arb, minLength, maxLength, compare)
  }
}

/**
 * Constraints to be applied on {@link set}
 * @public
 */
export interface SetConstraints<T> {
  /** Lower bound of the generated array size */
  minLength?: number;
  /** Upper bound of the generated array size */
  maxLength?: number;
  /** Compare function - Return true when the two values are equals */
  compare?: (a: T, b: T) => boolean;
}

/**
 * For arrays of unique values coming from `arb`
 *
 * @param arb - Arbitrary used to generate the values inside the array
 *
 * @public
 */
function set<T>(arb: Arbitrary<T>): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb` having an upper bound size
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param maxLength - Upper bound of the generated array size
 *
 * @deprecated Superceded by `fc.set(arb, {maxLength})`. Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/master/codemods/2.4.0_explicit-min-max-length | our codemod script}
 * @public
 */
function set<T>(arb: Arbitrary<T>, maxLength: number): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb` having lower and upper bound size
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param minLength - Lower bound of the generated array size
 * @param maxLength - Upper bound of the generated array size
 *
 * @deprecated Superceded by `fc.set(arb, {minLength, maxLength})`. Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/master/codemods/2.4.0_explicit-min-max-length | our codemod script}
 * @public
 */
function set<T>(arb: Arbitrary<T>, minLength: number, maxLength: number): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb` - unicity defined by `compare`
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param compare - Return true when the two values are equals
 *
 * @deprecated Superceded by `fc.set(arb, {compare})`. Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/master/codemods/2.4.0_explicit-min-max-length | our codemod script}
 * @public
 */
function set<T>(arb: Arbitrary<T>, compare: (a: T, b: T) => boolean): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb` having an upper bound size - unicity defined by `compare`
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param maxLength - Upper bound of the generated array size
 * @param compare - Return true when the two values are equals
 *
 * @deprecated Superceded by `fc.array(arb, {maxLength, compare})`. Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/master/codemods/2.4.0_explicit-min-max-length | our codemod script}
 * @public
 */
function set<T>(arb: Arbitrary<T>, maxLength: number, compare: (a: T, b: T) => boolean): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb` having lower and upper bound size - unicity defined by `compare`
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param minLength - Lower bound of the generated array size
 * @param maxLength - Upper bound of the generated array size
 * @param compare - Return true when the two values are equals
 *
 * @deprecated Superceded by `fc.array(arb, {minLength, maxLength, compare})`. Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/master/codemods/2.4.0_explicit-min-max-length | our codemod script}
 * @public
 */
function set<T>(
  arb: Arbitrary<T>,
  minLength: number,
  maxLength: number,
  compare: (a: T, b: T) => boolean
): Arbitrary<T[]>;
/**
 * For arrays of unique values coming from `arb`
 *
 * @param arb - Arbitrary used to generate the values inside the array
 * @param constraints - Constraints to apply when building instances
 *
 * @public
 */
function set<T>(arb: Arbitrary<T>, constraints: SetConstraints<T>): Arbitrary<T[]>;
function set<T>(
  arb: Arbitrary<T>,
  ...args:
    | []
    | [number]
    | [number, number]
    | [(a: T, b: T) => boolean]
    | [number, (a: T, b: T) => boolean]
    | [number, number, (a: T, b: T) => boolean]
    | [SetConstraints<T>]
): Arbitrary<T[]> {
  const constraints = buildCompleteSetConstraints(extractSetConstraints(args));

  const minLength = constraints.minLength;
  const maxLength = constraints.maxLength;
  const compare = constraints.compare;

  const arrayArb = new ArrayArbitrary<T>(arb, minLength, maxLength, buildCompareFilter(compare));
  if (minLength === 0) return arrayArb;
  return arrayArb.filter((tab) => tab.length >= minLength);
}

export { set };
