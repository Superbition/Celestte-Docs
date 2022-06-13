---
title: Installing Voltis
---

> Voltis is still in beta and being developed under version `1.0.0`, currently a simple install process is only available, a more robust installation process will be provided at a `v1` release.

This project uses composer to manage some dependencies, versioning and install process, you should create a new PHP Voltis project by using the composer command:

```bash
composer create-project superbition/polyel
```

Please make sure you have Swoole installed before trying to make a new Voltis project.

To update Voltis when a new version is released, you can run:

```bash
composer update
```

After creating a new Voltis project, you will want to generate a encryption key:

```bash
php polyel key:generate
```
:::caution Support
If you have any problems trying to install Voltis, please get in touch on GitHub
:::