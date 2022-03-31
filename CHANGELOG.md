# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2022-03-31

### Added

- New bot comand: `/forward`, give praise on behalf of other users. #208 #213

### Fixed

- Revert back to old command structure. #203
  - `/praise dish` becomes `/praise`
  - `/praise-activate` becomes `/activate`
- Ensure api builds run properly with yarn 2. #205

## [0.1.0] - 2022-03-25

### Added

- Switch back to the old command structure for discord slash-commands.
- Added a weekly divider to the quant page
- Page layout and navbar have been made more responsive
- System settings now have labels and descriptions
- Allow scrolling the quantification page while the duplicate dialog is open
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

### Fixed

- Default logo is now included
- Export of quantified praise calculated wrong average score on duplicate praise. #182

## [0.0.1] - 2022-03-10

### Added

- First release. Praise v0.0.1 should be regarded as alpha software.
