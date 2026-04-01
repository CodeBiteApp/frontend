# Agent Guidelines

## Package Manager

This project uses **yarn**. Always use yarn for all package operations.

```bash
# Install dependencies
yarn

# Add a package
yarn add <package>

# Add a dev dependency
yarn add -D <package>

# Remove a package
yarn remove <package>

# Run scripts
yarn <script>
```

Do **not** use `npm install`, `npm ci`, or any other npm commands.
Do **not** create or commit `package-lock.json`.
