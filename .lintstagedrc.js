export default {
  'src/**.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --cache --fix'],
  '*.vue': ['prettier --write', 'eslint --fix', 'stylelint --fix'],
  '*.{html,sass,scss,less}': ['prettier --write', 'stylelint --fix'],
  'package.json': ['prettier --write'],
  '*.md': ['prettier --write']
}
