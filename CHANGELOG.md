# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

- **Frontend:** Fix styling bug that caused the login button to be hidden on short screens. #1107

### Changed

- **Discord bot**: Improved user onboarding - Activation flow when praising first-time #1070

### Deprecated

## [0.13.1] - 2023-01-20

### Fixed

- **API:** Fixed bug that prevented user activation and gave new users wrong usernames
- **Frontend:** Clicking on user popover should take you to the user page #686
- **API:** Fixing some export issues due to changes in how the export transformer work because of the change to ses-node-json-transform for evalutaing untrusted code. #685
- **Frontend**: Praise sort should be dark in dark mode #688
- **Frontend**: Export dropdown gets squeezed when "close period" button is visible #684 #687

### Changed

- **Frontend**: Better handling of relative dates #720
- **Devops**: Added docker-compose installation script and modified scripts #754
- **Devops**: Allow mongodb port number to be configurable in .env #760
- **Devops**: Enhanced the multi-setup scripts #761

## [0.13.0] - 2022-11-18

### Added

- **API:** Transformer option to include/exclude header row in csv exports #614 #622
- **Frontend:** Most settings have now been given default values. To reset a setting to its default value, click the "Reset to default" button that appears next to the setting header. #580 #613
- **Frontend:** User pages! The user pages include things like: all praise sent and received, score summaries and various other user stats. #633
- **Frontend:** User profiles allowing the user to change their display name and rewards ethereum address. #633
- **Frontend:** Period page now lists number of praise in the period #651

### Changed

- **API:** Export transformers was using `safeEval` which has a [critical sandbox escape issue](https://security.snyk.io/vuln/SNYK-JS-SAFEEVAL-608076). The code using `safeEval` has been removed and replaced with a hardened transformer using [SES](https://github.com/endojs/endo).[ses-node-json-transform](https://www.npmjs.com/package/ses-node-json-transform). #622
- **Discord-bot:** Updated the bot to use the new `discord.js` version 14 #619
- **Discord-bot:** Minor refactors to make code easier to read #619
- **Frontend:** The settings pages have been reorganised slightly and given section descriptions with links to documentation. #586 #631
- **API:** Increases the number of quantifier assignment attempts from 3 to 5. Note that under some circumstances the algorithm cannot assign quantifiers and uphold the rules defined in the settings. The solution is then to change the assignment parameterd, for example by adding an additional quantifier. #644
- **Frontend:** Moved settings checkbox to be inline with description instead of under it. #635
- **API:** CSV header fields are now lower case to avoid issues with some distribution services #639
- **Frontend:** Upgraded RainbowKit and Wagmi versions to improve login experience. Login should now be more reliable. Tested with MetaMask in browser, mobile MetaMask and Ledger. #674
- **Frontend:** The Users page is now accessible to all users. #655
- **Devops:** Upgraded Node version to 16.17.1 to fix security vulnerabilities #667
- **Devops:** Upgraded Node version to 16.18.1 to fix security vulnerabilities #640

### Fixed

- **Devops:** `database-restore.sh` did not work under certain circumstances. Script have now been upgraded.
- **API:** Bug causing period praise counting to return the total number of praises instead of the number of praise for the period. #622
- **Discord-bot:** Praising does not work in threads #524 #619
- **Frontend:** Fixed a bug causing checkbox settings to be saved even if the user did not change the value. #629 #632
- **API:** Image upload should only accept jpg and png files #653 #636
- **Frontend:** Prevent custom export settings from loading when user is not admin #656 #628
- **API:** Add check when reassigning quantifiers: Replacement quantifier cannot be assigned to quantify their own received praise. #681
- **Devops:** GitHub actions upgraded #659
- **API:** Upgraded various dependencies - mongoose, mongoose-paginate-ts, mocha, nodemon - to fix security vulnerabilities #654

## [0.12.2] - 2022-09-28

### Added

- **Devops:** Setup script now uses a prebuilt Docker image to speed up setup process. #575 #606
- **Devops:** Merged project `.env` files into a single root file to simplify for automated setup #591

### Fixed

- **API:** Quantify endpoint now disallows any scores that are not in the configured range #608 #610
- **Frontend:** Praise logo in dashboard is now linked again, taking user to start page #609 #611

### Upgrade Instructions

Beacause of changes to the `.env` file structure, you need to run the setup script after pulling
changes from GitHub.

1. `git pull`
2. `bash setup.sh`
3. `bash upgrade.sh`

## [0.12.1] - 2022-09-27

A minor release to fix some bugs related to image uploading.

### Fixed

- Better handling of uploaded logo images. Image uploads are now stored outside of the Docker container. This means that the logo image will persist across container restarts and upgrades. #564 #604
- Better support for serving Praise over http on localhost. No manual edits of `.env` needed, all settings are managed by `setup.sh`. #577 #604

## [0.12.0] - 2022-09-26

### Added

- **API:** Custom praise exports using transformation maps that can perform calculations on Praise data #549 #532
- **Frontend:** New items on the main navigation #596 #430
  - Give us feedback
  - Latest changes
  - Docs

### Fixed

- **API:** Fix/evenly assign quantifiers prevent overlap #573 #535
- **Frontend:** Custom emojis get the wrong size when displayed in Praise dashboard #592
- **API:** Settings are now allowed to have empty values #597
- **Frontend:** Update Search Input in dark mode #594
- **Frontend:** Add a `replace` option to NavItem to better handle subpage navigation and backlink clicks #579
- **Frontend:** Fix quantifier dark mode and correct onclick behaviour #588
- **Frontend:** Better darkmode looks for analytics #570
- **Frontend:** Show placeholder while loading avatar image #574

### Removed

- **Frontend:** Removed the FAQ page #586

## [0.11.1] - 2022-08-24

Hotfix resolving an issue with building Docker images for production.

## [0.11.0] - 2022-08-24

### Added

- **Frontend:** Period analytics - graph and stats about the current quantification period. Stats include top scored praise, top givers and receivers by number and score, quantifiers by score, quantifier scoring distribution and quantification spread. #351 #551
- **Discord Bot:** New setting that allows restricting praise to certain Discord channels. #264 #452
- **Discord Bot:** Message to first time praisers. The default message contains a greeting and a link to the documentation: https://givepraise.xyz/docs/writing-excellent-praise. #516
- **Frontend:** Notify Administrators when there is a new version of Praise out. Adds a notification bar at the top of the screen when a new version is out. #493 #522
- **Devops:** Upgraded server scripts. Now includes scripts for resetting the installation, doing backups, upgrading, etc. https://givepraise.xyz/docs/server-setup/server-scripts #531

### Fixed

- **Frontend:** The User page should remember state when navigating to the User detail page and back #494 #519
- **API:** Added tests for quantifying multiple praise. #515
- **API:** Remove statically-defined users from application seeder #500 #520
- **Discord Bot:** Some praise bot messages that currently are public should be ephemeral #496 #521
- **Frontend:** Recoil upgrade and overall refactor of frontend #523
- **Frontend:** Improve UI of table in QuantifyPeriodPage #505 #527
- **Frontend:** Refactor: Replace day picker with builtin #483 #529
- **API:** Make several attempts to assign praise to quantifiers if first one fails. #497 #533
- **Frontend:** Refactor UI components to reduce code duplication. #482 #536
- **Frontend:** Make UI look better on small screens. #480 #546
- **Frontend:** Allow header banner messages to be closed #528 #541
- **API:** Re-introduces the enforcement of validation rules when creating periods. New periods must be created at least 7 days after the previous/latest period. #518 #550
- **Frontend:** Upgraded Caddy, the web server that serves the frontend to v2.5.2. The upgrade amongst others resolves a minor security vulnerability.

## [0.10.0] - 2022-07-01

### Added

- Admins can replace an actively assigned quantifier with another #432 #503
- Additional test coverage for api
- Freetext filter of quantification list #422
- Quantify multiple items at the same time #499

### Fixed

- Seeder generates periods and praise in the past, not future
- Remove check that was throwing an error when not all quantifiers were assigned praise and `PRAISE_QUANTIFIERS_ASSIGN_ALL` was enabled #492 #498
- Codebase cleanup, documentation and refactor #509

## [0.9.0] - 2022-06-20

### Added

- Filter, search and sort the event log #376 #455
- Dark mode! #420 #453
- Export the user list as csv #402 #450
- Option to turn on/off the Discord role requirement for Praise givers #419 #434 #440
- Support multiple wallets: WalletConneect, Trust, Rainbow etc #424
- Option to assign praise evenly between all quantifiers #263
- More verbose output from the `/admin announce` command #317 #441
- Option to disable self-praise (#464)

### Fixed

- Improve dapp responsiviness #190 #356
- Opening dialog to mark praise as duplicate should place focus on input #80
- Prevent Quantify Table from overflowing content area #458
- Ensure human-readable praise reason is included in exported csv #467
- Prevent unncessary import of mongoose package by frontend #466
- Switching eth wallet should result in logging out the user #469
- Logging out of MetaMask causes EthAccount in navigation to disappear #470
- Changed lodash imports to single method import #486
- Prevent error when not all quantifers are assigned praise and "Assign praise evenly" setting enabled

## [0.8.0] - 2022-06-06

### Added

- Convert the Quantifier Pool screen to a User Admin screen #320 #395
- Option - Require discord role to allow praise giving #434

### Fixed

- Removed migration unable to fetch info from Discord threads #445
- Quantify slider displaying praise score #444 #443
- Clicking a link within a Praise reason should _only_ trigger opening the link #427 #437
- Whoami command says user does not have praise powers, when they do #419

## [0.7.0] - 2022-05-31

### Added

- Group setting groups to improve settings UI #131 #333 #399
- Normalize format of praise reason, converting usernames and channel names into their human-readable text #156 #397
- Hightlight active page in Navbar, update page routes to nest under top-level routes #244 #396
- Praise dates now displayed in a "relative" format, with the absolute format displayed in a tooltip #249 #404
- Display calculated score of praise marked as duplicate instead of disabled slider on Quantify page #378 #407
- Added FAQ page #219 #372
- Removed docs package, move documentation to https://givepraise.xyz/docs

### Fixed

- Remove 1s login delay
- Ensure period is updated reactively on frontend when closed, name changed, or end date changed #389 #390
- Immediately reflect authorization changes after modifying your own user's roles #313
- Ensure'Assign Quantifiers' dialog is updated reactively when quantifier pool changes #388 #408
- Ensure period settings created before migration `07_settings_add_group` can be updated
- Prevent users from marking a praise as duplicate, if it is already the original of another praise marked duplicate #394 #406
- Fetch period data on period detail page only once
- Prevent error notice when non-admin visits PeriodDetailPage #425
- Upgraded to Create React App 5.0.1 and Tailwind 3 #416
- Fixed bug affecting marking of duplicates #335 #389 #393

## [0.6.0] - 2022-05-09

### Added

- Add giver and receiver id to exported praise csv #364
- Increased precision in calculation of duplicate praise score, from 0 to 2 decimals #342

### Fixed

- Quantifiers displayed as not being done when they in fact are done #349
- UI issue: checkbox unchecked when praise score changes #354
- Responds with an error message if the user tries to activate their account via the discord bot, and it has already been activated. #357 #362
- Better handling of env variable SERVER_URL #348

## [0.5.0] - 2022-05-02

### Fixed

- Updated Activation page to look and work similar to the login page
- Prevent error display on Period Details Page due to improperly calling useVerifyQuantifierPoolSize
- Ensure default logo image loads properly
- Ensure receiver is parsed when praise is submitted via discord Android app (workaround for Discord Android app issue)
- Ensure period details are still displayed properly after closing period
- Fix bug where dismissed praise were not included in composite score in csv export
- Refactor score calculation logic to reduce complexity and make verification simpler #315

### Added

- GitHub actions to auto build Docker images on dev and main. Images are pushed to [GitHub Packages](https://github.com/orgs/CommonsBuild/packages?repo_name=praise). #326
- Setup script to configure Praise runtime environment #332
- Check for required env variables on launch of api and discord-bot
- Manage messages used by discord-bot /forward command via praise app settings page
- `/help` command for getting more information about discord-bot commands
- `/whomai` command for getting personal information inside praise from discord-bot
- Api testing harness setup
- Run api tests via github actions
- Split up github actions to only run checks relevant to the workspace where files were modified
- Api tests for auth endpoints
- Prevent devs accidentally pushing to 'dev' and 'main' branch with husky pre-push hooks
- Api unit tests for score calculations
- Improved quantification UX: dismiss & mark duplicates of multiple praise simultaneously

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
