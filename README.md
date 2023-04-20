# TeslaRIS-frontend

# Instalation and running

In order to install and run the project simply follow these instructions:

-   Open your project folder in your terminal
-   Run `npm install` or `npm i` command to install the project dependencies (good practice might be to run `npm ci` in order to avoid potential change of the lock file)
-   After the installation is complete, run the `npm run dev` command to start the development server

# Codestyle and formatting

Due to different codestyle and code formatting tool configurations it is possible to have conflicting rule configurations with our eslint configuration. Therefore, it is strongly advised to run `npm run lint-autofix` before pushing or opening a PR in order to avoid the possibility of failing the GitHub Actions pipeline.
