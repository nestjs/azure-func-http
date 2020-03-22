import {
  Tree,
  FileEntry,
  CircularCollectionException
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';

const getFileContent = (tree: Tree, path: string): string => {
  const fileEntry: FileEntry = tree.get(path);
  if (!fileEntry) {
    throw new Error(`The file does not exist.`);
  }
  return fileEntry.content.toString();
};
describe('Schematic Tests Nest Add', () => {
  let nestTree: Tree;

  const runner: SchematicTestRunner = new SchematicTestRunner(
    'azure-func-http',
    path.join(process.cwd(), 'schematics/collection.json')
  );

  beforeEach(async () => {
    nestTree = await createTestNest(runner);
  });

  it('should add azure func for default setup', async () => {
    const options: Schema = {
      skipInstall: true,
      rootModuleFileName: 'app.module',
      rootModuleClassName: 'AppModule'
    };

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/.eslintrc.js',
      '/.prettierrc',
      '/nest-cli.json',
      '/package.json',
      '/README.md',
      '/tsconfig.build.json',
      '/tsconfig.json',
      '/.funcignore',
      '/host.json',
      '/local.settings.json',
      '/proxies.json',
      '/src/app.controller.spec.ts',
      '/src/app.controller.ts',
      '/src/app.module.ts',
      '/src/app.service.ts',
      '/src/main.ts',
      '/src/main.azure.ts',
      '/test/app.e2e-spec.ts',
      '/test/jest-e2e.json',
      '/main/function.json',
      '/main/index.ts',
      '/main/sample.dat'
    ]);
  });

  it('should add azure-func for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/.eslintrc.js',
      '/.prettierrc',
      '/nest-cli.json',
      '/package.json',
      '/README.md',
      '/tsconfig.build.json',
      '/tsconfig.json',
      '/src/app.controller.spec.ts',
      '/src/app.controller.ts',
      '/src/app.module.ts',
      '/src/app.service.ts',
      '/src/main.ts',
      '/test/app.e2e-spec.ts',
      '/test/jest-e2e.json',
      '/apps/nestjs-azure-func-http/tsconfig.app.json',
      `/apps/${projectName}/tsconfig.app.json`,
      `/apps/${projectName}/src/app.controller.spec.ts`,
      `/apps/${projectName}/src/app.controller.ts`,
      `/apps/${projectName}/src/app.module.ts`,
      `/apps/${projectName}/src/app.service.ts`,
      `/apps/${projectName}/src/main.ts`,
      `/apps/${projectName}/src/.funcignore`,
      `/apps/${projectName}/src/host.json`,
      `/apps/${projectName}/src/local.settings.json`,
      `/apps/${projectName}/src/main.azure.ts`,
      `/apps/${projectName}/src/proxies.json`,
      `/apps/${projectName}/src/webpack.config.js`,
      `/apps/${projectName}/src/main/function.json`,
      `/apps/${projectName}/src/main/index.ts`,
      `/apps/${projectName}/src/main/sample.dat`,
      `/apps/${projectName}/test/app.e2e-spec.ts`,
      `/apps/${projectName}/test/jest-e2e.json`
    ]);
  });

  it('should have a nest-cli.json for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(tree, '/nest-cli.json');
    const parsedFile = JSON.parse(fileContent);
    expect(parsedFile.projects[projectName].sourceRoot).toEqual(
      `apps/${projectName}/src`
    );
  });

  it('should have a nest-cli.json for default app', async () => {
    const options: Schema = {
      sourceRoot: 'src',
      skipInstall: true,
      rootDir: 'src',
      rootModuleFileName: 'app.module',
      rootModuleClassName: 'AppModule'
    };

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(tree, '/nest-cli.json');
    expect(fileContent).toContain(`"sourceRoot": "src"`);
  });

  it('should import the app.module int main azure file for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(
      tree,
      `/apps/${projectName}/src/main.azure.ts`
    );

    expect(fileContent).toContain(`import { AppModule } from './app.module';`);
  });

  it('should import the app.module int main azure file for default app', async () => {
    const options: Schema = {
      sourceRoot: 'src',
      skipInstall: true,
      rootDir: 'src',
      rootModuleFileName: 'app.module',
      rootModuleClassName: 'AppModule'
    };

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(tree, '/src/main.azure.ts');

    expect(fileContent).toContain(`import { AppModule } from './app.module';`);
  });

  it('should have the root dir for index file in main azure dir for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(
      tree,
      `/apps/${projectName}/src/main/index.ts`
    );

    expect(fileContent).toContain(`import { createApp } from '../main.azure';`);
  });

  it('should have the root dir for index file in main azure dir for default app', async () => {
    const options: Schema = {
      sourceRoot: 'src',
      skipInstall: true,
      rootDir: 'src',
      rootModuleFileName: 'app.module',
      rootModuleClassName: 'AppModule'
    };

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(tree, '/main/index.ts');

    expect(fileContent).toContain(
      `import { createApp } from '../src/main.azure';`
    );
  });

  it('should import the webpack config for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();
    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(
      tree,
      `/apps/${projectName}/src/webpack.config.js`
    );
    expect(fileContent).toContain(
      `filename: 'apps/${projectName}/main/index.js'`
    );
  });

  it('should not import the webpack config for a default app', async () => {
    const options: Schema = {
      sourceRoot: 'src',
      skipInstall: true,
      rootDir: 'src',
      rootModuleFileName: 'app.module',
      rootModuleClassName: 'AppModule'
    };

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = tree.get('webpack.config.js');

    expect(fileContent).toBeNull();
  });

  it('should add a custom webpack config to the compilerOptions for monorepo app', async () => {
    const projectName = 'azure-2';
    const options: Schema = {
      skipInstall: true,
      project: projectName,
      sourceRoot: `apps/${projectName}/src`
    };

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: projectName
        },
        nestTree
      )
      .toPromise();
    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(tree, 'nest-cli.json');
    const parsedFile = JSON.parse(fileContent);
    const compilerOptions = parsedFile.projects[projectName].compilerOptions;
    expect(compilerOptions).toEqual({
      tsConfigPath: `apps/${projectName}/tsconfig.app.json`,
      webpack: true,
      webpackConfigPath: `apps/${projectName}/src/webpack.config.js`
    });
  });

  async function createTestNest(
    runner: SchematicTestRunner,
    tree?: Tree
  ): Promise<UnitTestTree> {
    return await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'application',
        {
          name: 'newproject',
          directory: '.'
        },
        tree
      )
      .toPromise();
  }
});
