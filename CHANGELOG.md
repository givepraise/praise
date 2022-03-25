# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Switch back to the old command structure for discord slash-commands.
- New command structure for the discord-bot package, with subcommands under the /praise command. #167
- Settings now supports image uploads. Initially used for the top left logo. #124
- Command-line script to replace an actively assigned quantifier with a new one, as a short-term workaround for #173.
- Github actions to build & lint PRs #152 #107
- Implements JWT refresh tokens. A user with an expired accessToken, but an active refreshToken, can request a new accessToken with a later expiration date.

### Changed

- Disallow removal of users from the quantifier pool that are assigned as quantifiers in an ongoing quantification #150 #120
- Refactoring of Login component to improve flow & reliability
- Refactoring of recoil axios request wrappers -- extracted into axios instances defined in utils/api. Recoil wrappers are kept, but simply call the axios instance, to limit the scope of this refactor.
- Remove recoil auth query wrappers -- moved into utils/auth
- Ensure expired tokens fail validation in api middleware
- Logout user (redirect to /login and delete saved TokenSet) upon receiving a 401 response after refreshing tokens

## [0.0.1] - 2022-03-10

### Added

- First release. Praise v0.0.1 should be regarded as alpha software.
