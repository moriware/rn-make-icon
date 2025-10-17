import fs from 'fs';
import path from 'path';
import readPkg from 'read-pkg';

const CONFIG_FILES = [
  '.rnmakeiconrc.js',
  '.rnmakeiconrc.json',
  '.iconsetrc.js',
  '.iconsetrc.json',
];

export default (context: string) => {
  for (const configFile of CONFIG_FILES) {
    const fullPath = path.join(context, configFile);

    if (fs.existsSync(fullPath)) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      return require(fullPath);
    }
  }

  if (fs.existsSync(path.join(context, 'package.json'))) {
    const pkg = readPkg.sync({ cwd: context });

    return pkg?.rnMakeIconConfig || pkg?.iconsetConfig || {};
  }

  return {};
};
