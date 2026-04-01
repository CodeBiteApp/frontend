<<<<<<< HEAD
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
=======
# Agent Rules

## Package Installation

패키지 설치는 반드시 `yarn`을 사용한다.

```bash
# 올바른 방법
yarn add <package>
yarn add -D <package>
npx expo install <package>   # Expo 호환성이 필요한 경우

# 사용 금지
npm install <package>
```
>>>>>>> 59c572f27004fd8269832c0a145b551ad151a084
