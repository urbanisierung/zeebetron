# `zeebetron`

![GitHub repo size](https://img.shields.io/github/repo-size/urbanisierung/zeebetron)
![GitHub contributors](https://img.shields.io/github/contributors/urbanisierung/zeebetron)
![GitHub stars](https://img.shields.io/github/stars/urbanisierung/zeebetron?style=social)
![GitHub forks](https://img.shields.io/github/forks/urbanisierung/zeebetron?style=social)
![Twitter Follow](https://img.shields.io/twitter/follow/urbanisierung?style=social)

`zeebetron` is a small frontend to manage different profiles for zeebe instances (cloud or local).

Usually I use `zbctl` or my own small starter project to interact with zeebe. But since I had a lot of zeebe instances and I was switching between them, I wanted to build a small tool to manage profiles.

The added value of zeebetron is

* Manage different profiles including addresses and if necessary oAuth information
* Manage different workflows for deploying or creating new instances

The tool itself is built with [Electron](https://electronjs.org/) and [Angular](https://angular.io/). The communication with zeebe is done via [zeebe-node](https://github.com/creditsenseau/zeebe-client-node-js), the rendering of BPMN diagrams is done using [bpmn-js](https://github.com/bpmn-io/bpmn-js).

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed node.

That's it ;) Admittedly, I didn't test the project on Windows, but it runs fine on Ubuntu and Mac.

## Development

Install all dependencies with

```bash
npm install
```

Run the development version of the app including hot reload:

```bash
npm run start
```

Build a release:

```bash
npm run electron:linux # (or mac or windows)
```

## Contributing to `zeebetron`

To contribute to `zeebetron`, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Create the pull request to this project.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Contact

If you want to contact me you can reach me at [adam.urban@gmail.com](mailto:adamurban@gmail.com).

## License

This project uses the following license: [MIT](./MIT.md).
