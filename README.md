[1]: https://www.npmjs.com/package/@moriware/rn-make-icon

<header>
<h1 align="center">
@moriware/rn-make-icon
</h1>
<p align="center">
Gerador de ícones para Android e iOS focado em projetos React Native
</p>
</header>

<h2>⚡️ Início Rápido</h2>

Você pode executar o gerador de ícones com o comando npx (disponível a partir do Node.js 8.2.0).

```bash
$ npx @moriware/rn-make-icon gerar ./caminho/para/icon.png
# Alias em inglês
$ npx @moriware/rn-make-icon create ./caminho/para/icon.png
```

Para versões anteriores do Node, consulte a seção [🚀 Instalação](#-instalação).

<h2>🚀 Instalação</h2>

> **Requisito de versão do Node**
>
> @moriware/rn-make-icon exige Node.js 14.0 ou superior (v16+ recomendado). Use gerenciadores como [n](https://github.com/tj/n), [nvm](https://github.com/creationix/nvm) ou [nvm-windows](https://github.com/coreybutler/nvm-windows) para alternar versões rapidamente.

<h3>Global</h3>

Para instalar o pacote **globalmente**, execute um dos comandos abaixo (talvez seja necessário sudo/admin caso o Node não tenha sido instalado via n/nvm):

```bash
$ npm install -g @moriware/rn-make-icon
# OU
$ yarn global add @moriware/rn-make-icon
```

Após a instalação, o binário `rn-make-icon` ficará disponível no terminal. Teste executando `rn-make-icon --help` para visualizar o menu de ajuda.

Confira a versão instalada com:

```bash
$ rn-make-icon --version
```

<h3>Instalação local</h3>

Para instalar o [`rn-make-icon`][1] **como dependência do seu projeto**, use:

```bash
$ npm install @moriware/rn-make-icon -D
# OU
$ yarn add @moriware/rn-make-icon -D
```

<h2>🧪 Uso</h2>

Para gerar os ícones você precisa de:

- Um PNG para iOS e Android (idealmente 1024x1024). Veja alguns exemplos na pasta [`example`](https://github.com/moriware/rn-make-icon/tree/master/example).
- (Opcional) Imagens para Adaptive Icon no Android: um foreground e um background (cor ou imagem). [Saiba mais na documentação oficial](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive) ou neste [artigo sobre design de adaptive icons](https://medium.com/google-design/designing-adaptive-icons-515af294c783).

A forma mais simples de usar o [`rn-make-icon`][1] é chamar o comando `rn-make-icon gerar` apontando para o arquivo:

```bash
$ rn-make-icon gerar ./icon.png
```

Se preferir, utilize o alias em inglês `rn-make-icon create ./icon.png` — o comportamento é idêntico.

Se instalou como dependência de desenvolvimento, adicione um script no `package.json` e execute com `npm run create-appicon`:

```json5
{
  scripts: {
    'create-appicon': 'rn-make-icon gerar ./icon.png',
  },
}
```

O utilitário gera automaticamente os ícones nas dimensões corretas para Android e iOS.

Quando precisar desfazer mudanças, execute `rn-make-icon remover` (ou o alias em inglês `rn-make-icon remove`) para limpar os ícones criados.

<h2>⚙️ Configuração</h2>

<h3>Comandos disponíveis</h3>

O binário `rn-make-icon` oferece os comandos abaixo. Cada comando possui um alias em inglês para manter compatibilidade com quem prefere essa nomenclatura:

- `gerar` (`create`) — Gera um novo conjunto de ícones para um projeto React Native.
- `remover` (`remove`) — Remove um conjunto de ícones de um projeto React Native.

Utilize `rn-make-icon <comando> --help` para visualizar as opções de cada comando ou alias.

Existem duas formas principais de configurar o [`rn-make-icon`][1]:

- **Parâmetros da CLI** — ajuste as opções diretamente na linha de comando.
- **Arquivos de configuração** — defina um arquivo JavaScript/JSON ou uma chave no `package.json` com as opções desejadas.

<h3>Parâmetros da CLI</h3>

Liste todas as opções disponíveis executando `rn-make-icon <comando> --help`. Exemplo:

```bash
$ rn-make-icon gerar --help

Uso: rn-make-icon gerar [opções] [caminho-imagem]

Gera um novo conjunto de ícones para um projeto React Native

Aliases: create

Opções:
  -d, --disable-launcher-icon                  Impede a troca do ícone principal no iOS e Android
  -A, --android [nome-icone]                   Gera o conjunto de ícones apenas para Android
  -IPA, --image-path-android                   Caminho da imagem para Android
  --flavor [flavor]                            Nome do flavor Android
  -b, --adaptive-icon-background <background>  Cor ou imagem usada no fundo do ícone adaptativo
  -f, --adaptive-icon-foreground <foreground>  Imagem usada como primeiro plano do ícone adaptativo
  -I, --ios                                    Gera o conjunto de ícones apenas para iOS
  --group <group>                              Grupo do projeto iOS
  -IPI, --image-path-ios                       Caminho da imagem para iOS
  -h, --help                                   Exibe este resumo de ajuda
```

<h3>Arquivos de configuração</h3>

O [`@moriware/rn-make-icon`][1] reconhece os seguintes arquivos na raiz do projeto:

- `.rnmakeiconrc.js`
- `.rnmakeiconrc.json`
- `package.json` (propriedade `rnMakeIconConfig`)

Se mais de um arquivo estiver presente, a ordem de prioridade acima é respeitada. Ainda oferecemos suporte retrocompatível às variantes antigas `.iconsetrc.*` e à chave `iconsetConfig`.

Exemplo de configuração em JavaScript:

```js
// .rnmakeiconrc.js
module.exports = {
  imagePath: './assets/icon.png',

  adaptiveIconBackground: './assets/icon-background.png',
  adaptiveIconForeground: './assets/icon-foreground.png',
};
```

<h4>rn-make-icon gerar</h4>

- `imagePath` — Caminho do arquivo de imagem que servirá como ícone principal (ex.: `./assets/icon.png`).
- `disableLauncherIcon` — Gera apenas os ícones sem atualizar os manifests.
- `android` / `ios` — Defina `true`/`false` para habilitar ou desabilitar a geração por plataforma, ou informe o nome do novo ícone (por exemplo `ic_novo_app`).

- `imagePathAndroid` — Caminho de uma imagem específica para Android (opcional; caso ausente, utiliza `imagePath`).
- `imagePathIos` — Caminho de uma imagem específica para iOS (opcional; caso ausente, utiliza `imagePath`).

As opções abaixo são utilizadas apenas durante a geração de ícones adaptativos no Android:

- `adaptiveIconBackground` — Cor (ex.: `"#ffffff"`) ou imagem (ex.: `"assets/images/fundo-claro.png"`) aplicada como fundo do ícone adaptativo.
- `adaptiveIconForeground` — Imagem utilizada como camada frontal do ícone adaptativo.

<h4>rn-make-icon remover</h4>

O comando `remover` (alias `remove`) é útil para desfazer alterações rapidamente:

- `android` — Remove os ícones da plataforma Android.
- `ios` — Remove os ícones da plataforma iOS.
