module.exports = {
  add: (a, b) => a + b,
  ZERO: 0,
}

// ダメな例(mod変数はこのファイル内でしか参照できない)
const mod = {
  add: (a, b) => a + b,
  ZERO: 0,
}
