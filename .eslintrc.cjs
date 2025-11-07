module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // omit `project` to avoid type-aware linting across the repo (keeps lint fast and permissive)
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  // Minimal set: prefer zero surprises for now; we'll tighten rules later
  rules: {
    // Turn off core rules that don't play well with TS AST by default
    'no-unused-vars': 'off',
    'no-undef': 'off'
  }
}
