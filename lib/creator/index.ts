import path from 'path';
import { resolveConfig, error, info, log } from '../../utils/index';

import IOSIconCreator from './ios';
import AndroidIconCreator from './android';

interface CreatorOptions {
  imagePath?: string;
  android?: boolean | string;
  ios?: boolean | string;
  imagePathAndroid?: string;
  imagePathIos?: string;
  flavor?: string;
  adaptiveIconBackground?: string;
  adaptiveIconForeground?: string;
  group?: string;
  disableLauncherIcon?: boolean;
}

export default class Creator {
  private readonly options: CreatorOptions;
  private readonly context: string;

  constructor(opts: CreatorOptions) {
    const context = process.cwd();

    const config = resolveConfig(context);

    const options: CreatorOptions = {
      ...config,
      ...opts
    };

    if (!options.imagePath) {
      options.imagePath = config.imagePath;
    }

    // both android and ios are included by default
    if (!options.android && !options.ios) {
      options.android = true;
      options.ios = true;
    }

    this.context = context;
    this.options = options;

    this.normalizeOptionPaths();
  }

  private normalizeOptionPaths() {
    const context = this.context;

    const options = this.options;

    const paths = [
      'imagePath',
      'imagePathIos',
      'imagePathAndroid',
      'adaptiveIconBackground',
      'adaptiveIconForeground',
    ] as const;

    for (const prop of paths) {
      if (typeof options[prop] !== 'undefined') {
        const value = options[prop];

        if (typeof value === 'string' && !value.match(/^#[0-9A-Za-z]{6}$/)) {
          options[prop] = path.resolve(context, value);
        }
      }
    }
  }

  async run() {
    const options = this.options;

    const context = this.context;

    if (options.android) {
      info('Gerando ícones para Android...');

      const imagePathAndroid = options.imagePathAndroid ?? options.imagePath;

      if (!imagePathAndroid) {
        return error('Nenhum caminho de imagem informado para Android.');
      }

      const androidIconCreator = new AndroidIconCreator(context, {
        flavor: options.flavor,
        android: options.android,
        disableLauncherIcon: options.disableLauncherIcon,
      });

      await androidIconCreator.createAndroidIcons(imagePathAndroid);

      const { adaptiveIconBackground, adaptiveIconForeground } = options;

      if (adaptiveIconBackground && adaptiveIconForeground) {
        await androidIconCreator.createAdaptiveIcons(adaptiveIconBackground, adaptiveIconForeground);
      }
    }

    if (options.ios) {
      info('Gerando ícones para iOS...');

      const iOSIconCreator = new IOSIconCreator(context, {
        ios: options.ios,
        flavor: options.flavor,
        group: options.group,
        disableLauncherIcon: options.disableLauncherIcon,
      });

      const imagePathIos = options.imagePathIos ?? options.imagePath;

      if (!imagePathIos) {
        return error('Nenhum caminho de imagem informado para iOS.');
      }

      await iOSIconCreator.createIosIcons(imagePathIos);
    }

    log();
    log('🎉 Ícones gerados com sucesso.');
  }
}
