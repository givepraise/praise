# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Updated Activation page to look and work similar to the login page
- Prevent error display on Period Details Page due to improperly calling useVerifyQuantifierPoolSize
- Ensure default logo image loads properly
- Ensure receiver is parsed when praise is submitted via discord Android app (workaround for Discord Android app issue)
- Ensure period details are still displayed properly after closing period

### Added
- Check for required env variables on launch of api and discord-bot
- Manage messages used by discord-bot /forward command via praise app settings page
- /help command for getting more information about discord-bot commands

## [0.4.0] - 2022-04-14

### Added

- Periods can now be closed without assigning quantifiers first
- Dashboard now correctly displays markdown formatted messages
- Script `not-yet-activated` lists all users ... not yet activated

### Fixed

API:

- Prevent false mongoose validation error on assignQuantifiers

Frontend:

- Changed some column headers
- Centered som column values
- Removed mono typeface
- Minor adjustment of navigation alignment

Discord-bot:

- Warn when no periods quantifying

## [0.3.0] - 2022-04-07

### Added

- New bot command: `/admin announce`, send announcements to quantifiers and users #214 #145
- Modify settings architecture so Periods have their own unique settings. New periods are created with the "global" settings as default values. #138 #116
- Verify no quantifiers have been assigned in period before assigning
- Display Period start and end dates in UTC. All others in users' local timezone. #204
- Duplicate dialog message: "Duplicate praise are given a score that is X% of the original quantification."

### Fixed

- Login page UX improvements
- Minor refactor of praise/controllers/quantify to clarify logic flow. #221
- Sort recievers table by score descending on period detail page
- Ensure weekly divider in quant page displays every week & improve UX
- Fix cli command 'mongodb:clean'
- Refactor / UX improvents to period end date picker #204
- Refactor praise page infinite scroll to prevent inconsistent duplicated requests or initial loading of all pages #240
- Ensure period validator rules allow updating the end date of the one and only period. #241
- Hard-code settings directly in first db migration, remove from api .env

## [0.2.0] - 2022-03-31

### Added

- New bot comand: `/forward`, give praise on behalf of other users. #208 #213

### Fixed

- Revert back to old command structure. #203
  - `/praise dish` becomes `/praise`
  - `/praise-activate` becomes `/activate`
- Ensure api builds run properly with yarn 2. #205
- Typo in default setting label and description

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
