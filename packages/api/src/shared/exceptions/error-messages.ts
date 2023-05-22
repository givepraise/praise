export interface ErrorMessage {
  message: string;
  httpStatusCode: number;
  // This is a custom code that we can use to identify the error
  code: number;
}

// Move all hard coded error messages to this file
export const errorMessages: { [key: string]: ErrorMessage } = {
  COMMUNITY_NOT_FOUND: {
    message: 'Community not found',
    httpStatusCode: 404,
    code: 1001,
  },
  COMMUNITY_IS_ALREADY_ACTIVE: {
    message: 'Community is already active',
    httpStatusCode: 400,
    code: 1002,
  },
  USER_ACCOUNT_NOT_FOUND: {
    message: 'UserAccount not found',
    httpStatusCode: 404,
    code: 1003,
  },
  ACTIVATION_TOKEN_NOT_FOUND: {
    message: 'Activation token not found',
    httpStatusCode: 404,
    code: 1004,
  },
  USER_ACCOUNT_IS_ALREADY_ACTIVATED: {
    message: 'User account already activated',
    httpStatusCode: 400,
    code: 1005,
  },
  INVALID_DATA_FOR_ACTIVATION: {
    message: 'identityEthAddress, signature, and accountId required',
    httpStatusCode: 400,
    code: 1006,
  },
  VERIFICATION_FAILED: {
    message: 'Verification failed',
    httpStatusCode: 400,
    code: 1007,
  },
  USER_NOT_FOUND_AFTER_UPDATE: {
    message: 'User not found after update',
    // In normal flow we should not get this error, so if it happened it's bug in our server and we should throw 500
    httpStatusCode: 500,
    code: 1008,
  },
  PERIOD_NOT_FOUND: {
    message: 'Period not found.',
    httpStatusCode: 404,
    code: 1009,
  },
  INVALID_END_DATE_FOR_CREATE_PERIOD: {
    message: 'End date must be at least 7 days after the latest end date',
    httpStatusCode: 400,
    code: 1010,
  },
  PERIOD_IS_ALREADY_CLOSED: {
    message: 'Period is already closed',
    httpStatusCode: 400,
    code: 1011,
  },
  CANT_CLOSE_NOT_ENDED_PERIOD: {
    message: 'Can not close a period that has not ended',
    httpStatusCode: 400,
    code: 1012,
  },
  FAILED_TO_PAGINATE_PERIOD_DATA: {
    message: 'Failed to paginate period data',
    httpStatusCode: 500,
    code: 1013,
  },
  UPDATE_PERIOD_NAME_OR_END_DATE_MUST_BE_SPECIFIED: {
    message: 'Updated name or endDate to must be specified',
    httpStatusCode: 400,
    code: 1013,
  },
  UPDATE_PERIOD_DATE_CHANGE_ONLY_ALLOWED_ON_LATEST_PERIOD: {
    message: 'Date change only allowed on latest period.',
    httpStatusCode: 400,
    code: 1014,
  },
  DATE_CHANGE_IS_ONLY_ALLOWED_ON_OPEN_PERIODS: {
    message: 'Date change only allowed on open periods.',
    httpStatusCode: 400,
    code: 1015,
  },
  SETTING_NOT_FOUND: {
    message: 'Settings not found.',
    httpStatusCode: 400,
    code: 1016,
  },
  VALUE_IS_REQUIRED_FIELD: {
    message: 'Value is required field',
    httpStatusCode: 400,
    code: 1017,
  },
  INVALID_VALUE_FIELD_FOR_SETTING: {
    message: 'Invalid value',
    httpStatusCode: 400,
    code: 1018,
  },
  UPLOADED_FILE_IS_NOT_AN_IMAGE: {
    message: 'Uploaded file is not an image.',
    httpStatusCode: 400,
    code: 1019,
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    httpStatusCode: 404,
    code: 1020,
  },
  PERIOD_SETTING_NOT_FOUND: {
    message: 'Period setting not found',
    httpStatusCode: 404,
    code: 1021,
  },
  PRAISE_NOT_FOUND: {
    message: 'Praise not found.',
    httpStatusCode: 404,
    code: 1022,
  },
  NO_RECEIVER_SPECIFIED: {
    message: 'No receivers specified',
    httpStatusCode: 400,
    code: 1023,
  },
  PRAISE_GIVER_ACCOUNT_IS_NOT_ACTIVATED: {
    message: 'This praise giver account is not activated.',
    httpStatusCode: 400,
    code: 1024,
  },
  PRAISE_FORWARDED_IS_NOT_ACTIVATED: {
    message: 'This praise forwarder account is not activated.',
    httpStatusCode: 400,
    code: 1025,
  },
  SELF_PRAISE_IS_NOT_ALLOWED: {
    message: 'Self praise is not allowed',
    httpStatusCode: 400,
    code: 1026,
  },
  USER_NOT_FOUND_IN_CONTEXT_REQUEST: {
    message: 'User not found in request context',
    httpStatusCode: 401,
    code: 1027,
  },
  PRAISE_DOESNT_HAVE__AN_ASSOCIATED_PERIOD: {
    message: 'Praise does not have an associated period',
    httpStatusCode: 400,
    code: 1028,
  },
  PRAISE_ASSOCIATED_WITH_PRAISE_IS_NOT_QUANTIFY: {
    message: 'Period associated with praise does have status QUANTIFY',
    httpStatusCode: 400,
    code: 1029,
  },
  PRAISE_CANT_BE_MARKED_DUPLICATE_OF_ANOTHER_DUPLICATE: {
    message: 'Praise cannot be marked duplicate of another duplicate',
    httpStatusCode: 400,
    code: 1030,
  },
  FAILED_TO_PAGINATE_PRAISE_DATA: {
    message: 'Failed to paginate praise data',
    httpStatusCode: 500,
    code: 1031,
  },
  USER_NOT_ASSIGNED_AS_QUANTIFIER_FOR_PRAISE: {
    message: 'User not assigned as quantifier for praise.',
    httpStatusCode: 400,
    code: 1032,
  },
  PRAISE_CANT_BE_DUPLICATE_OF_ITSELF: {
    message: 'Praise cannot be a duplicate of itself',
    httpStatusCode: 400,
    code: 1033,
  },
  DUPLICATE_PRAISE_ITEM_NOT_FOUND: {
    message: 'Duplicate praise item not found',
    httpStatusCode: 404,
    code: 1034,
  },
  ORIGINAL_PRAISE_CANT_BE_MARKED_AS_DUPLICATE: {
    message:
      'Praise cannot be marked duplicate when it is the original of another duplicate',
    httpStatusCode: 400,
    code: 1035,
  },
  SCORE_DISMISSED_OR_DUPLICATE_PRAISE_IS_REQUIRED: {
    message: 'Score, dismissed or duplicatePraise is required',
    httpStatusCode: 400,
    code: 1036,
  },
  API_KEY_NOT_FOUND: {
    message: 'API key not found',
    httpStatusCode: 404,
    code: 1037,
  },
  FAILED_TO_GENERATE_NONCE: {
    message: 'Failed to generate nonce.',
    httpStatusCode: 500,
    code: 1038,
  },
  USER_ACCOUNT_WITH_PLATFORM_AND_USER_ALREADY_EXIST: {
    message: 'UserAccount with platform and user already exist',
    httpStatusCode: 400,
    code: 1039,
  },
  USER_ACCOUNT_WITH_PLATFORM_NAME__OR_USERNAME_ALREADY_EXITS: {
    message:
      'UserAccount with platform and accountId, name or user already exists.',
    httpStatusCode: 400,
    code: 1040,
  },
  FAILED_TO_QUERY_EVENT_LOGS: {
    message: 'Failed to query event logs',
    httpStatusCode: 500,
    code: 1041,
  },
  QUANTIFICATION_NOT_FOUND: {
    message: 'Quantification not found.',
    httpStatusCode: 404,
    code: 1042,
  },
  QUANTIFICATION_HAS_NO_ASSOCIATED_PERIOD: {
    message: 'Quantification has no associated period',
    httpStatusCode: 400,
    code: 1043,
  },
  INVALID_SETTING_PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE: {
    message: "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'",
    httpStatusCode: 400,
    code: 1044,
  },
  COULD_NOT_CREATE_EXPORT: {
    message: 'Could not create export.',
    httpStatusCode: 404,
    code: 1055,
  },
  ITS_NOT_ALLOWED_TO_REMOVE_THE_LAST_ADMIN: {
    message: 'It is not allowed to remove the last admin!',
    httpStatusCode: 400,
    code: 1056,
  },
  CAN_NOT_REMOVE_QUANTIFIER: {
    message:
      'Cannot remove quantifier currently assigned to quantification period',
    httpStatusCode: 400,
    code: 1057,
  },
  INVALID_SETTING_VALUE: {
    message: 'Invalid settingValue',
    httpStatusCode: 400,
    code: 1058,
  },
  PERIOD_SETTING_CAN_BE_CHANGED__WHEN_ITS_OPEN: {
    message: 'Period settings can only be changed when period status is OPEN.',
    httpStatusCode: 400,
    code: 1059,
  },
  PERIOD_SETTINGS_ALREADY_EXIST_FOR_THIS_PERIOD: {
    message: 'Period settings already exist for this period.',
    httpStatusCode: 400,
    code: 1060,
  },
  SCORE_IS_NOT_ALLOWED: {
    message: 'Score is not allowed',
    httpStatusCode: 400,
    code: 1061,
  },
  INVALID_ROLE: {
    message: 'Invalid role',
    httpStatusCode: 400,
    code: 1062,
  },
  CANT_ASSIGN_QUANTIFIERS_FOR_A_PERIOD_THAT_HAS_NOT_ENDED: {
    message: 'Can not assign quantifiers for a period that has not ended',
    httpStatusCode: 400,
    code: 1063,
  },
  QUANTIFIERS_CAN_ONLY_BE_ASSIGNED_ON_OPEN_PERIODS: {
    message: 'Quantifiers can only be assigned on OPEN periods.',
    httpStatusCode: 400,
    code: 1064,
  },
  SOME_PERIODS_HAS_ALREADY_BEEN_ASSIGNED_FOR_THIS_PERIOD: {
    message: 'Some praise has already been assigned for this period',
    httpStatusCode: 400,
    code: 1065,
  },
  INVALID_DATE_FILTERING_OPTION: {
    message:
      'Invalid date filtering option. When periodId is set, startDate and endDate should not be set.',
    httpStatusCode: 400,
    code: 1066,
  },
  INVALID_DATE_FILTERING_OPTION_WHEN_PERIOD_IS_NOT_SET: {
    message:
      'Invalid date filtering option. When periodId is not set, both startDate and endDate should be set.',
    httpStatusCode: 400,
    code: 1066,
  },
  FAILED_TO_GENERATE_ASSIGNMENTS: {
    message: 'Failed to generate assignments',
    httpStatusCode: 400,
    code: 1067,
  },
  FAILED_TO_GENERATE_LIST_OF_REDUNDANT_SHUFFLED_RECEIVERS: {
    message: 'Failed to generate list of redundant shuffled receivers',
    httpStatusCode: 400,
    code: 1068,
  },
  FAILED_TO_ASSIGN_QUANTIFIERS: {
    message: 'Failed to assign quantifiers.',
    httpStatusCode: 400,
    code: 1069,
  },
  FAILED_TO_ASSIGN_COLLECTION_OF_PRAISE_TO_QUANTIFIERS: {
    message: 'Failed to assign collection of praise to quantifiers.',
    httpStatusCode: 400,
    code: 1070,
  },
  QUANTIFIERS_CANT_BE_ASSIGNED_TO_QUANTIFY_THEIR_PRAISE: {
    message:
      'Replacement quantifier cannot be assigned to quantify their own received praise.',
    httpStatusCode: 400,
    code: 1071,
  },
  THERE_IS_JUST_ONE_QUANTIFIER_THAT_IS_ALSO_RECEIVER: {
    message:
      'One quantifier is available, but they are also a receiver. Unable to assign quantifiers.',
    httpStatusCode: 400,
    code: 1072,
  },
  UNABLE_TO_ASSIGN_REDUNDANT_QUANTIFICATION_WITHOUT_MORE_MEMBERS_IN_QUANTIFIER_POOL:
    {
      message:
        'Unable to assign redundant quantification without more members in quantifier pool',
      httpStatusCode: 400,
      code: 1073,
    },
  QUANTIFIERS_PER_RECEIVER_IS_TOO_LARGE_FOR_THE_NUMBER_OF_RECEIVERS: {
    message:
      'Quantifiers per Receiver is too large for the number of receivers, unable to prevent duplicate assignments',
    httpStatusCode: 400,
    code: 1074,
  },
  NOT_ALL_REDUNDANT_PRAISE_ASSIGNMENTS_ACCOUNTED: {
    message: `Not all redundant praise assignments accounted`,
    httpStatusCode: 400,
    code: 1075,
  },
  SOME_REDUNDANT_PRAISE_ARE_ASSIGNED_TO_THE_SAME_QUANTIFIER_MULTIPLE_TIMES: {
    message:
      'Some redundant praise are assigned to the same quantifier multiple times',
    httpStatusCode: 400,
    code: 1076,
  },
  QUANTIFIERS_CAN_ONLY_BE_REPLACED_ON_PERIODS_WITH_STATUS_QUANTIFY: {
    message:
      'Quantifiers can only be replaced on periods with status QUANTIFY.',
    httpStatusCode: 400,
    code: 1077,
  },
  BOTH_CURRENT_QUANTIFIER_ID_AND_NEW_QUANTIFIER_ID_MUST_BE_SPECIFIED: {
    message: 'Both currentQuantifierId and newQuantifierId must be specified',
    httpStatusCode: 400,
    code: 1078,
  },
  CANT_REPLACE_A_QUANTIFIER_WITH_THEMSELVES: {
    message: 'Cannot replace a quantifier with themselves',
    httpStatusCode: 400,
    code: 1079,
  },
  CURRENT_QUANTIFIER_DOESNT_EXIST: {
    message: 'Current quantifier does not exist',
    httpStatusCode: 404,
    code: 1080,
  },
  REPLACEMENT_QUANTIFIER_DOESNT_EXIST: {
    message: 'Replacement quantifier does not exist',
    httpStatusCode: 404,
    code: 1081,
  },
  REPLACEMENT_QUANTIFIER_DOESNT_HAVE_ROLE_QUANTIFIER: {
    message: 'Replacement quantifier does not have role QUANTIFIER',
    httpStatusCode: 403,
    code: 1082,
  },
  REPLACEMENT_QUANTIFIER_IS_ALREADY_ASSIGNED_TO_SOME_OF_THE_ORIGINAL_QUANTIFIER:
    {
      message:
        "Replacement quantifier is already assigned to some of the original quantifier's praise",
      httpStatusCode: 400,
      code: 1083,
    },
  FAILED_TO_QUERY_COMMUNITIES: {
    message: 'Failed to query communities',
    httpStatusCode: 500,
    code: 1084,
  },
  NONCE_NOT_FOUND: {
    message: 'Nonce not found',
    httpStatusCode: 404,
    code: 1085,
  },
  PRAISE_IDS_MUST_BE_ARRAY: {
    message: 'praiseIds must be an array',
    httpStatusCode: 400,
    code: 1086,
  },
  UNKNOWN_SETTING_TYPE: {
    message: 'Unknown setting type',
    httpStatusCode: 400,
    code: 1087,
  },
  VALUE_IS_NOT_A_VALID_OBJECT_ID: {
    message: 'Value is not a valid ObjectId',
    httpStatusCode: 400,
    code: 1088,
  },
  INVALID_DATE_FILTERING_PASSING_PROJECT_ID_START_DATE_AND_END_DATE_TOGETHER: {
    message:
      'Invalid date filtering option. When periodId is set, startDate andCommunity is already active endDate should not be set.',
    httpStatusCode: 400,
    code: 1089,
  },
  INVALID_DATE_FILTERING_SHOULD_PATH_DATES_WHEN_PROJECT_ID_IS_NOT_SET: {
    message:
      'Invalid date filtering option. When periodId is not set, both startDate and endDate should be set.',
    httpStatusCode: 400,
    code: 1090,
  },
  INVALID_OWNERS_CREATOR_MUST_BE_INCLUDED_IN_THE_OWNERS: {
    message: 'Invalid owners, creator must be included in the owners.',
    httpStatusCode: 400,
    code: 1091,
  },
  AUTH_FAILED: {
    message: 'Authentication failed. JWT token or API key is required.',
    httpStatusCode: 401,
    code: 1092,
  },
  COMMUNITY_NOT_ALLOWED_SIGNER: {
    message: 'Only creator is allowed to link a community.',
    httpStatusCode: 403,
    code: 1093,
  },
  INVALID_PROJECT_ID_FILTERING_PASSING_PROJECT_ID_START_DATE_AND_END_DATE_TOGETHER:
    {
      message:
        'Invalid project id filtering option. When projectId is set, startDate and endDate should not be set.',
      httpStatusCode: 400,
      code: 1094,
    },
  UNAUTHORIZED: {
    message: 'Unauthorized',
    httpStatusCode: 401,
    code: 1095,
  },
  NO_PERIODS_TO_EXPORT: {
    message: 'Therer are no periods to export.',
    httpStatusCode: 404,
    code: 1096,
  },
  DATABASE_NOT_FOUND: {
    message: 'Database not found',
    httpStatusCode: 400,
    code: 1097,
  },
  MONGO_ADMIN_URI_NOT_SET: {
    message: 'MONGO_ADMIN_URI not set',
    httpStatusCode: 400,
    code: 1098,
  },
  API_KEY_SALT_NOT_SET: {
    message: 'API_KEY_SALT not set',
    httpStatusCode: 400,
    code: 1099,
  },
  COMMUNITY_NAME_NOT_AVAILABLE: {
    message: 'COMMUNITY NAME NOT AVAILABLE',
    code: 1100,
    httpStatusCode: 409,
  },
  REPORTS_LIST_ERROR: {
    message: 'Failed to get reports list',
    httpStatusCode: 500,
    code: 1101,
  },
};
