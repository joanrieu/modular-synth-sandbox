// Middle Square Weyl Sequence PRNG
// https://en.wikipedia.org/wiki/Middle-square_method#Middle_Square_Weyl_Sequence_PRNG

function uint64(x: bigint) {
  return BigInt.asUintN(64, x);
}

function uint32(x: bigint) {
  return BigInt.asUintN(32, x);
}

function uint32_to_float(x: bigint) {
  return Number(x) / 2 ** 32;
}

export function* msws(
  seed = 0xb5ad4eceda1ce2a9n
): Generator<number, never, never> {
  let rnd = 0n;
  let weyl = 0n;

  for (;;) {
    weyl = uint64(weyl + seed);
    rnd = uint64(uint64(rnd * rnd) + weyl);
    rnd = uint64(rnd >> 32n) | uint64(rnd << 32n);
    yield uint32_to_float(uint32(rnd));
  }
}
