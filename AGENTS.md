use absolute imports like `"#src/router"`
run `git add . && git commit -m '' # only run pre-commit hook` to ensure code quality
whenever you add a feature or fix a bug, add tests and documentation for it (jsdoc)
you may not suppress eslint rules or typescript errors
functions must either be 100% pure, or be 100% side-effectful
if a function returns a value other than undefined, then it must be pure
if a function has side-effects, then it must only return undefined
