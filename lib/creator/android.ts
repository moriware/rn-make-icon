import sharp from 'sharp';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

import { log, warn, createDirectory } from '../../utils/index';

import {
  getAndroidResDirectory,
  getAndroidAdaptiveXmlFolder,
  getAndroidColorsFile,
  isAndroidIconNameCorrectFormat,
  getIcLauncherDrawableBackgroundXml,
  getIcLauncherXml,
  getColorsXmlTemplate,
  getRoundedCornersLayer,
  androidIcons,
  adaptiveAndroidIcons,
  androidManifestFile,
  androidAdaptiveForegroundFileName,
  androidAdaptiveBackgroundFileName,
  AndroidIcon,
} from '../utils/android';

interface AndroidCreatorOptions {
  flavor?: string;
  android?: boolean | string;
  disableLauncherIcon?: boolean;
}

class AndroidIconCreator {
  private readonly context: string;
  private readonly options: AndroidCreatorOptions;

  constructor(context: string, opts: AndroidCreatorOptions) {
    this.context = context;
    this.options = opts;

    if (typeof opts.android === 'string' && !isAndroidIconNameCorrectFormat(opts.android)) {
      throw new Error('O nome do ícone deve conter apenas letras minúsculas, números ou "_" (ex.: "ic_novo_icone").');
    }
  }

  async createAndroidIcons(imagePath: string): Promise<void> {
    const androidResDirectory = path.resolve(this.context, getAndroidResDirectory(this.options.flavor));

    const iconName = this.resolveIconName();

    const image = await fsPromises.readFile(imagePath);

    if (!this.options.disableLauncherIcon) {
      await this.overwriteAndroidManifestIcon(iconName);
    }

    await Promise.all(androidIcons.map(async (androidIcon) => {
      const iconDirectory = path.resolve(androidResDirectory, androidIcon.directoryName);

      await Promise.all([
        this.saveIcon(image, iconDirectory, iconName, androidIcon),
        this.saveRoundedIcon(image, iconDirectory, iconName, androidIcon),
      ]);
    }));

    await sharp(image)
      .resize(512, 512)
      .toFile(path.resolve(androidResDirectory, 'playstore-icon.png'));
  }

  async createAdaptiveIcons(adaptiveIconBackground: string, adaptiveIconForeground: string): Promise<void> {
    const { flavor, android } = this.options;

    const foreground = await fsPromises.readFile(path.resolve(this.context, adaptiveIconForeground));

    const androidResDirectory = path.resolve(this.context, getAndroidResDirectory(flavor));

    const foregroundIconName = typeof android === 'string'
      ? `${android}_foreground`
      : androidAdaptiveForegroundFileName;

    await Promise.all(adaptiveAndroidIcons.map(async (adaptiveIcon) => {
      const iconDirectory = path.resolve(androidResDirectory, adaptiveIcon.directoryName);

      await this.saveIcon(foreground, iconDirectory, foregroundIconName, adaptiveIcon);
    }));

    if (path.extname(adaptiveIconBackground) === '.png') {
      await this.createAdaptiveBackgrounds(adaptiveIconBackground, androidResDirectory);
    } else {
      await this.createAdaptiveIconMipmapXmlFile();
      await this.updateColorsXmlFile(adaptiveIconBackground);
    }
  }

  private async saveRoundedIcon(
    image: Buffer,
    iconDirectory: string,
    iconName: string,
    androidIcon: AndroidIcon
  ): Promise<void> {
    const roundIconName = `${iconName}_round`;
    const { size } = androidIcon;

    createDirectory(iconDirectory);

    await sharp(image)
      .resize(size, size)
      .composite([{
        input: getRoundedCornersLayer(size),
        blend: 'dest-in'
      }])
      .toFile(path.resolve(iconDirectory, `${roundIconName}.png`));
  }

  private async saveIcon(
    image: Buffer,
    iconDirectory: string,
    iconName: string,
    androidIcon: AndroidIcon
  ): Promise<void> {
    createDirectory(iconDirectory);

    await sharp(image)
      .resize(androidIcon.size, androidIcon.size)
      .toFile(path.resolve(iconDirectory, `${iconName}.png`));
  }

  private async updateColorsXmlFile(adaptiveIconBackground: string): Promise<void> {
    const { flavor } = this.options;

    const colorsXml = path.resolve(this.context, getAndroidColorsFile(flavor));

    if (fs.existsSync(colorsXml)) {
      log('📄 Atualizando colors.xml com a cor de fundo do ícone adaptativo');

      await this.updateColorsFile(colorsXml, adaptiveIconBackground);
    } else {
      log('⚠️ Não encontrei um colors.xml no seu projeto Android');
      log('Criando colors.xml e adicionando ao projeto');

      await this.createNewColorsFile(adaptiveIconBackground);
    }
  }

  private async updateColorsFile(colorsXml: string, adaptiveIconBackground: string): Promise<void> {
    const colors = await fsPromises.readFile(colorsXml, 'utf-8');

    const lines = colors.split('\n');

    let foundExisting = false;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      if (line.includes('name="ic_launcher_background"')) {
        foundExisting = true;
        lines[i] = line.replace(/>([^><]*)</g, `>${adaptiveIconBackground}<`);

        break;
      }
    }

    if (!foundExisting) {
      lines.splice(
        lines.length - 1,
        0,
        `\t<color name="ic_launcher_background">${adaptiveIconBackground}</color>`
      );
    }

    await fsPromises.writeFile(colorsXml, lines.join('\n'));
  }

  private async createNewColorsFile(adaptiveIconBackground: string): Promise<void> {
    const colorsXml = path.resolve(this.context, getAndroidColorsFile(this.options.flavor));

    createDirectory(path.dirname(colorsXml));

    const { android } = this.options;

    const iconName = typeof android === 'string'
      ? android
      : 'ic_launcher';

    await fsPromises.writeFile(colorsXml, getColorsXmlTemplate(iconName));

    await this.updateColorsFile(colorsXml, adaptiveIconBackground);
  }

  private async createAdaptiveIconMipmapXmlFile(): Promise<void> {
    const { android, flavor } = this.options;

    const iconName = typeof android === 'string'
      ? android
      : 'ic_launcher';
    const iconFileName = `${iconName}.xml`;

    const directory = path.resolve(this.context, getAndroidAdaptiveXmlFolder(flavor));

    createDirectory(directory);

    await fsPromises.writeFile(path.resolve(directory, iconFileName), getIcLauncherXml(iconName));
  }

  private async createAdaptiveBackgrounds(adaptiveIconBackground: string, androidResDirectory: string): Promise<void> {
    const { android, flavor } = this.options;

    const adaptiveIconBackgroundPath = path.resolve(this.context, adaptiveIconBackground);

    const background = await fsPromises.readFile(adaptiveIconBackgroundPath);

    const backgroundIconName = typeof android === 'string'
      ? `${android}_background`
      : androidAdaptiveBackgroundFileName;

    await Promise.all(adaptiveAndroidIcons.map(async (adaptiveIcon) => {
      const iconDirectory = path.resolve(androidResDirectory, adaptiveIcon.directoryName);

      await this.saveIcon(background, iconDirectory, backgroundIconName, adaptiveIcon);
    }));

    const iconName = typeof android === 'string'
      ? android
      : 'ic_launcher';

    const directory = path.resolve(this.context, getAndroidAdaptiveXmlFolder(flavor));

    createDirectory(directory);

    await fsPromises.writeFile(
      path.resolve(directory, `${iconName}.xml`),
      getIcLauncherDrawableBackgroundXml(iconName)
    );
  }

  private async overwriteAndroidManifestIcon(iconName: string): Promise<void> {
    try {
      const manifest = await fsPromises.readFile(androidManifestFile, 'utf-8');

      log('Atualizando ícone definido no AndroidManifest.xml');

      const newManifest = this.transformAndroidManifestIcon(manifest, iconName);

      await fsPromises.writeFile(androidManifestFile, newManifest);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        warn('AndroidManifest.xml não encontrado; ícone não foi atualizado. Etapa ignorada.');

        return;
      }

      throw err;
    }
  }

  private transformAndroidManifestIcon(oldManifest: string, iconName: string) {
    return oldManifest.split('\n').map((line) => {
      if (line.includes('android:icon')) {
        return line.replace(
          /android:icon="[^"]*(\\"[^"]*)*"/g,
          `android:icon="@mipmap/${iconName}"`
        );
      }

      if (line.includes('android:roundIcon')) {
        return line.replace(
          /android:icon="[^"]*(\\"[^"]*)*"/g,
          `android:roundIcon="@mipmap/${iconName}_round"`
        );
      }

      return line;
    }).join('\n');
  }

  private resolveIconName(): string {
    if (typeof this.options.android === 'string') {
      log('🚀 Adicionando um novo ícone de launcher do Android');
      return this.options.android;
    }

    log('Substituindo o ícone padrão do launcher do Android');
    return 'ic_launcher';
  }
}

export default AndroidIconCreator;
