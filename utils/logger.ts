/* eslint-disable no-debugger, no-console */
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

const format = (label: string, msg: string) => msg.split('\n').map((line, i) => (
  i === 0
    ? `${label} ${line}`
    : line.padStart(stripAnsi(label).length + line.length + 1)
)).join('\n');

const chalkTag = (msg: string) => chalk.bgBlackBright.white.dim(` ${msg} `);

export const log = (msg = '', tag: string | null = null) => (
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg)
);

export const info = (msg: string, tag: string | null = null) => {
  console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg));
};

export const warn = (msg: string, tag: string | null = null) => {
  console.warn(format(chalk.bgYellow.black(' AVISO ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg)));
};

export const error = (msg: string, tag: string | null = null) => {
  console.error(format(chalk.bgRed(' ERRO ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)));
};
