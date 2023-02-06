import * as fs from 'fs';
import * as csv from 'fast-csv';
import duckdb from 'duckdb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountsExportSqlSchema,
} from './schemas/useraccounts.schema';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { parse } from 'json2csv';
import { exec } from '@/shared/duckdb.shared';
import { allExportsDirPath } from '@/shared/fs.shared';
import { ServiceException } from '@/shared/exceptions/service-exception';

@Injectable()
export class UserAccountsService {
  constructor(
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
  ) {}

  getModel(): Model<UserAccountDocument> {
    return this.userAccountModel;
  }

  /**
   * Returns a user account by user ID
   */
  async findOneByUserId(userId: Types.ObjectId): Promise<UserAccount | null> {
    const userAccount = await this.userAccountModel.findOne({ userId }).lean();
    if (!userAccount) return null;
    return userAccount;
  }

  /**
   * returns all of the model in json format
   */
  async export(format = 'csv'): Promise<UserAccount[] | string> {
    const userAccounts = await this.userAccountModel.find().lean();

    if (format !== 'csv') return userAccounts;

    const fields = [
      '_id',
      'accountId',
      'user',
      'name',
      'avatarId',
      'platform',
      'createdAt',
      'updatedAt',
    ];
    return userAccounts.length > 0
      ? parse(userAccounts, { fields })
      : fields.toString();
  }

  async generateCsvExport() {
    // Fields to include in the csv
    const includeFields = [
      '_id',
      'accountId',
      'user',
      'name',
      'avatarId',
      'platform',
      'createdAt',
      'updatedAt',
    ];

    // Serialization rules
    const transform = (doc: UserAccountDocument) => ({
      _id: doc._id,
      accountId: doc.accountId,
      user: doc.user,
      name: doc.name,
      avatarId: doc.avatarId,
      platform: doc.platform,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });

    const exportDirName = await this.getExportDirName();
    const exportDirPath = `${allExportsDirPath}/useraccounts/${exportDirName}`;

    // Create the export folder if it doesn't exist
    if (!fs.existsSync(exportDirPath)) {
      fs.mkdirSync(exportDirPath, { recursive: true });
    }

    // Return a promise that resolves when the csv is done
    return new Promise((resolve) => {
      const cursor = this.userAccountModel
        .find()
        .select(includeFields.join(' '))
        .cursor();

      // Create a csv writer that transforms the data using our rules
      const csvWriter = csv.format({
        headers: true,
        transform,
      });

      // Pipe the csvWriter to a file
      csvWriter.pipe(fs.createWriteStream(`${exportDirPath}/useraccounts.csv`));

      // Resolve promise when csvWriter is done
      csvWriter.on('end', () => {
        resolve(true);
      });

      // Pipe the cursor to the csvWriter
      cursor.pipe(csvWriter);
    });
  }

  /**
   * Generates all export files - csv and parquet
   */
  async generateAllExports() {
    const exportDirName = await this.getExportDirName();
    const exportDirPath = `${allExportsDirPath}/useraccounts/${exportDirName}`;

    await this.generateCsvExport();

    // Create a duckdb database, import the csv file, and export it to parquet
    const db = new duckdb.Database(':memory:');
    await exec(
      db,
      `CREATE TABLE useraccounts (${UserAccountsExportSqlSchema})`,
    );
    await exec(
      db,
      `COPY useraccounts FROM '${exportDirPath}/useraccounts.csv' (AUTO_DETECT TRUE, HEADER TRUE);`,
    );
    await exec(
      db,
      `COPY useraccounts TO '${exportDirPath}/useraccounts.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);`,
    );
  }

  /**
   * The export directory name is the _id of the last inserted document
   */
  async getExportDirName(): Promise<string> {
    const latestAdded = await this.findLatestAdded();
    return latestAdded._id.toString();
  }

  /**
   * Returns a user account by user account ID
   */
  async findOneByUserAccountId(
    userAccountId: string,
  ): Promise<UserAccount | null> {
    const userAccount = await this.userAccountModel
      .findOne({ userAccountId })
      .lean();
    if (!userAccount) return null;
    return userAccount;
  }

  /**
   * Find the latest added user account
   */
  async findLatestAdded(): Promise<UserAccount> {
    const userAccount = await this.userAccountModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!userAccount[0]) throw new ServiceException('UserAccount not found.');
    return userAccount[0];
  }

  /**
   * Update a user account
   */
  async update(
    _id: Types.ObjectId,
    updateUserAccountDto: UpdateUserAccountInputDto,
  ): Promise<UserAccount> {
    const userAccountDocument = await this.userAccountModel.findById(_id);
    if (!userAccountDocument)
      throw new ServiceException('UserAccount not found.');

    for (const [k, v] of Object.entries(updateUserAccountDto)) {
      userAccountDocument.set(k, v);
    }

    await userAccountDocument.save();
    return userAccountDocument.toObject();
  }
}
