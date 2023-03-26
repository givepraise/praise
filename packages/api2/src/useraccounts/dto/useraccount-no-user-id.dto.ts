// import { OmitType } from '@nestjs/swagger';
// import { UserAccount } from '../schemas/useraccounts.schema';

// Importing this class from another file causes the error:
// TypeError: Cannot read properties of undefined (reading 'prototype')
// TODO: Figure out why this is happening
// export class UserAccountNoUserId extends OmitType(UserAccount, [
//   'user',
// ] as const) {}
