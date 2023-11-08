export default {
  'src/**/*.{js,jsx}': ['prettier --write', 'eslint --cache --fix'],
  'src/**/*.{ts,tsx}': [
    'prettier --write',
    'eslint --cache --fix',
    () => 'tsc -p tsconfig.json --noEmit'
  ],
  'backend/**/*.{rs,toml}': [
    () =>
      'cargo clippy --manifest-path=./backend/Cargo.toml --all-targets --all-features --fix -- -D warnings',
    () => 'cargo fmt --manifest-path=./backend/Cargo.toml --all'
  ],
  '*.{html,sass,scss,less}': ['prettier --write', 'stylelint --fix'],
  'package.json': ['prettier --write'],
  '*.md': ['prettier --write']
}
