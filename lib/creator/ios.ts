import sharp from 'sharp';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

import { warn, createDirectory } from '../../utils/index';

import {
  iosDefaultIconName,
  iosDefaultCatalogName,
  getIosDefaultIconFolder,
  getIosConfigFile,
  getIosAssetFolder,
  generateContentsFile,
  iosIcons,
  IosIcon,
} from '../utils/ios';

interface IOSCreatorOptions {
  ios?: boolean | string;
  flavor?: string;
  group?: string;
  disableLauncherIcon?: boolean;
}

class IOSIconCreator {
  private readonly context: string;
  private readonly options: IOSCreatorOptions;

  constructor(context: string, opts: IOSCreatorOptions) {
    this.context = context;
    this.options = opts;
  }

  async createIosIcons(imagePath: string): Promise<void> {
    const projectName = this.getIosProjectName();

    if (!projectName) {
      throw new Error('Não encontrei um diretório de projeto iOS válido.');
    }

    const image = await fsPromises.readFile(imagePath);

    let iconName = iosDefaultIconName;
    let catalogName = iosDefaultCatalogName;

    const { flavor, ios, disableLauncherIcon } = this.options;

    if (flavor) {
      catalogName = `AppIcon-${flavor}`;
      iconName = iosDefaultIconName;
    } else if (typeof ios === 'string') {
      iconName = ios;
      catalogName = iconName;
    }

    const flavorPath = path.resolve(this.context, getIosDefaultIconFolder(projectName, flavor));

    await Promise.all(iosIcons.map((iosIcon) => (
      this.saveIosIcon(image, flavorPath, iconName, iosIcon)
    )));

    if (!disableLauncherIcon) {
      await this.changeIosLauncherIcon(catalogName, projectName);
    }

    await this.modifyContentsFile(catalogName, iconName, projectName);
  }

  private getIosProjectName(): string | null {
    const { group } = this.options;

    if (group) {
      return group;
    }

    const appFilePath = path.resolve(this.context, 'app.json');

    if (fs.existsSync(appFilePath)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
      const app = require(appFilePath);

      if (typeof app === 'object' && app.name) {
        return app.name;
      }
    }

    const iosDirectory = path.resolve(this.context, 'ios');

    if (!fs.existsSync(iosDirectory)) {
      return null;
    }

    const directories = fs.readdirSync(iosDirectory, { withFileTypes: true });

    for (const dir of directories) {
      if (!dir.isDirectory()) {
        continue;
      }

      if (fs.existsSync(path.resolve(iosDirectory, dir.name, 'Images.xcassets'))) {
        return dir.name;
      }
    }

    return 'AppName';
  }

  private async saveIosIcon(image: Buffer, iconDirectory: string, iconName: string, iosIcon: IosIcon): Promise<void> {
    createDirectory(iconDirectory);

    await sharp(image)
      .resize(iosIcon.size, iosIcon.size)
      .removeAlpha()
      .toFile(path.resolve(iconDirectory, `${iconName + iosIcon.name}.png`));
  }

  private async changeIosLauncherIcon(catalogName: string, projectName: string): Promise<void> {
    const iOSconfigFile = path.resolve(this.context, getIosConfigFile(projectName));

    try {
      const config = await fsPromises.readFile(iOSconfigFile, 'utf-8');

      const lines = config.split('\n');

      let currentConfig: string | undefined;
      let onConfigurationSection = false;

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];

        if (line.includes('/* Begin XCBuildConfiguration section */')) {
          onConfigurationSection = true;
        }

        if (line.includes('/* End XCBuildConfiguration section */')) {
          onConfigurationSection = false;
        }

        if (!onConfigurationSection) {
          continue;
        }

        const regex = /.*\/* (.*)\.xcconfig \*\/;/;
        const match = regex.exec(line);

        if (match) {
          currentConfig = match[1];
        }

        if (currentConfig && line.includes('ASSETCATALOG_COMPILER_APPICON_NAME')) {
          lines[i] = line.replace(/=(.*);/g, `= ${catalogName};`);
        }
      }

      await fsPromises.writeFile(iOSconfigFile, lines.join('\n'));
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        warn('Arquivo project.pbxproj não encontrado; ícone não foi atualizado. Etapa ignorada.');
        return;
      }

      throw err;
    }
  }

  private async modifyContentsFile(newCatalogName: string, newIconName: string, projectName: string): Promise<void> {
    const newIconDirectory = path.resolve(
      this.context,
      getIosAssetFolder(projectName),
      `${newCatalogName}.appiconset/Contents.json`
    );

    createDirectory(path.dirname(newIconDirectory));

    const contentsFileContent = generateContentsFile(newIconName);

    await fsPromises.writeFile(newIconDirectory, JSON.stringify(contentsFileContent, null, 2));
  }
}

export default IOSIconCreator;
