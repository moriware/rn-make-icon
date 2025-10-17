#!/usr/bin/env node
import leven from 'leven';
import minimist from 'minimist';
import { Command, program } from 'commander';

import IconCreator from './lib/creator/index';

import { chalk, semver } from './utils/index';
import { engines } from './package.json';

const requiredVersion = engines.node;

const checkNodeVersion = (wanted: string, id: string) => {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'Você está utilizando o Node ' + process.version + ', mas esta versão de ' + id +
      ' requer o Node ' + wanted + '.\nAtualize o seu Node antes de continuar.'
    ));

    process.exit(1);
  }
};

checkNodeVersion(requiredVersion, 'rn-make-icon');

const suggestCommands = (unknownCommand: string) => {
  const availableCommands = program.commands.map((cmd: Command) => cmd.name());

  let suggestion = '';

  availableCommands.forEach((cmd: string) => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);

    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    console.log('  ' + chalk.red(`Você quis dizer ${chalk.yellow(suggestion)}?`));
  }
};

program
  .version(`rn-make-icon ${require('./package').version}`)
  .usage('<comando> [opções]');

program
  .command('gerar [caminho-imagem]')
  .alias('create')
  .description('Gera um novo conjunto de ícones para um projeto React Native')

  .option('-d, --disable-launcher-icon', 'Impede a troca do ícone principal no iOS e Android')

  .option('-A, --android [nome-icone]', 'Gera o conjunto de ícones apenas para Android')
  .option('-IPA, --image-path-android', 'Caminho da imagem para Android')
  .option('--flavor [flavor]', 'Nome do flavor Android')
  .option('-b, --adaptive-icon-background <background>', 'Cor (ex: "#ffffff") ou imagem (ex: "assets/images/background.png") usada no fundo do ícone adaptativo.')
  .option('-f, --adaptive-icon-foreground <foreground>', 'Imagem utilizada como primeiro plano do ícone adaptativo')

  .option('-I, --ios', 'Gera o conjunto de ícones apenas para iOS')
  .option('--group <group>', 'Grupo do projeto iOS')
  .option('-IPI, --image-path-ios', 'Caminho da imagem para iOS')
  .action((imagemFonte: string, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Aviso: Você informou mais de um argumento. Apenas o primeiro será utilizado como arquivo de origem; os demais serão ignorados.'));
    }

    const iconCreator = new IconCreator({ ...options, imagePath: imagemFonte });

    iconCreator.run();
  });

program
  .command('remover')
  .alias('remove')
  .description('Remove um conjunto de ícones de um projeto React Native')
  .option('-A, --android', 'Remove ícones do Android')
  .option('-I, --ios', 'Remove ícones do iOS')
  .action((options) => {
    console.log(options);
    // require('../lib/remove')(options);
  });

// output help information on unknown commands
program.on('command:*', ([cmd]) => {
  program.outputHelp();

  console.log('  ' + chalk.red(`Comando desconhecido ${chalk.yellow(cmd)}.`));
  console.log();

  suggestCommands(cmd);

  process.exitCode = 1;
});

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(`  Execute ${chalk.cyan('rn-make-icon <comando> --help')} para ver detalhes de cada comando.`);
  console.log();
});

program.commands.forEach(c => c.on('--help', () => console.log()));

// enhance common error messages
import enhanceErrorMessages from './utils/enhanceErrorMessages';

enhanceErrorMessages('missingArgument', (argName: string) => {
  return `Argumento obrigatório ausente ${chalk.yellow(`<${argName}>`)}.`;
});

enhanceErrorMessages('unknownOption', (optionName: string) => {
  return `Opção desconhecida ${chalk.yellow(optionName)}.`;
});

enhanceErrorMessages('optionMissingArgument', (option: { flags: any; }, flag: string) => {
  return `Faltou o argumento obrigatório para a opção ${chalk.yellow(option.flags)}` + (
    flag ? `; recebido ${chalk.yellow(flag)}` : ''
  );
});

program.parse(process.argv);
