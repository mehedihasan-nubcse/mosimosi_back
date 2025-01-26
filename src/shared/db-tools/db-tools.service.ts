import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import { basename } from 'path';
import { google } from 'googleapis';
import * as archiver from 'archiver';
import { ConfigService } from '@nestjs/config';

const GOOGLE_AUTH = new google.auth.GoogleAuth({
  keyFile: `./service-account-key-file.json`,
  scopes: 'https://www.googleapis.com/auth/drive',
});

@Injectable()
export class DbToolsService {
  private logger = new Logger(DbToolsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * MOMENT DATE FUNCTIONS
   * getDateString
   */

  async backupMongoDb() {
    try {
      const dbOptions = {
        username: this.configService.get<string>('dbAdminUsername'),
        password: this.configService.get<string>('dbAdminPassword'),
        host: 'localhost',
        authenticationDatabase: 'admin',
        port: 27017,
        db: this.configService.get<string>('backupDB'),
        out: this.configService.get<string>('backupPath'),
        restorePath: this.configService.get<string>('restorePath'),
      };

      const cmd =
        'mongodump --host ' +
        dbOptions.host +
        ' --port ' +
        dbOptions.port +
        ' --db ' +
        dbOptions.db +
        ' --username ' +
        dbOptions.username +
        ' --password ' +
        dbOptions.password +
        ' --authenticationDatabase ' +
        dbOptions.authenticationDatabase +
        ' --out ' +
        dbOptions.out;

      // Mongo Dump
      await this.execToPromise(cmd);

      // File
      const outputFilePath = `./backup/db/${
        dbOptions.db
      }_${new Date().toISOString()}.zip`;
      const sourceFile = `./backup/db/${dbOptions.db}`;

      // Process
      await this.zipDirectory(sourceFile, outputFilePath);
      const fileName = basename(outputFilePath);
      await this.uploadToGoogleDrive(fileName, outputFilePath);
      this.removeUploadedFile(outputFilePath, sourceFile);
    } catch (error) {
      console.log(error);
    }
  }

  async restoreMongoDb() {
    try {
      const dbOptions = {
        username: this.configService.get<string>('dbAdminUsername'),
        password: this.configService.get<string>('dbAdminPassword'),
        host: 'localhost',
        authenticationDatabase: 'admin',
        port: 27017,
        db: this.configService.get<string>('backupDB'),
        out: this.configService.get<string>('backupPath'),
        restorePath: this.configService.get<string>('restorePath'),
      };

      const cmd =
        'mongorestore --host ' +
        dbOptions.host +
        ' --port ' +
        dbOptions.port +
        ' --db ' +
        dbOptions.db +
        ' ' +
        dbOptions.restorePath +
        ' --username ' +
        dbOptions.username +
        ' --password ' +
        dbOptions.password +
        ' --authenticationDatabase ' +
        dbOptions.authenticationDatabase;


      // Mongo Dump
      const g = await exec(
        'mongorestore --db ek-rate /Users/hello/Documents/MongoDB/ek-rate --host localhost:27017 --authenticationDatabase admin --username ikbalsazib11 --password IKBALsazib11',
      );
    } catch (error) {
      console.log('error', error);
    }
  }

  private async zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', (err) => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve('Success'));
      archive.finalize();
    });
  }

  private async uploadToGoogleDrive(fileName: string, path: string) {
    const fileMetadata = {
      name: fileName,
      parents: ['1wBZQpdHWOJ9j8vKQIRpB2kohMp2qwptM'], // Change it according to your desired parent folder id
    };

    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(path),
    };

    const driveService = google.drive({ version: 'v3', auth: GOOGLE_AUTH });

    return await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });
  }

  private removeUploadedFile(filePath: string, folderPath: string) {
    fs.unlinkSync(filePath);
    fs.rmSync(folderPath, { recursive: true, force: true });
  }

  private execToPromise(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout.trim());
      });
    });
  }
}
