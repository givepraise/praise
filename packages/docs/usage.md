# Using Praise

## How to praise?
You could praise people in your discord server using the `/praise` slash command-
```
/praise receivers: @user1 @user2 reason: for adding valuable comments to the meeting notes.
```

## How to quantify praise?
- #TODO

## How to export data from praise?
- #TODO

## How to replace an active quantifier?
To replace an actively assigned quantifier who is unresponsive, run the following command,
replacing <PERIOD_ID>, <CURRENT_QUANTIFIER_USER_ID>, <NEW_QUANTIFIER_USER_ID>
```
yarn workspace api replace-quantifier --periodId=<PERIOD_ID> --currentQuantifierId=<CURRENT_QUANTIFIER_USER_ID> --newQuantifierId=<NEW_QUANTIFIER_USER_ID>
```