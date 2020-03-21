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

  it('should handle nest add for default app', async () => {
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

  it('should handle nest add for project', async () => {
    const options: Schema = {
      sourceRoot: '/libs/lib1/src',
      skipInstall: true,
      rootDir: 'src',
      project: 'lib1'
    };
    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'library',
        {
          name: 'lib1',
          prefix: '@app'
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
      '/libs/lib1/tsconfig.lib.json',
      '/libs/lib1/src/index.ts',
      '/libs/lib1/src/lib1.module.ts',
      '/libs/lib1/src/lib1.service.spec.ts',
      '/libs/lib1/src/lib1.service.ts',
      '/libs/lib1/src/.funcignore',
      '/libs/lib1/src/host.json',
      '/libs/lib1/src/local.settings.json',
      '/libs/lib1/src/main.azure.ts',
      '/libs/lib1/src/proxies.json',
      '/libs/lib1/src/webpack.config.js',
      '/libs/lib1/src/main/function.json',
      '/libs/lib1/src/main/index.ts',
      '/libs/lib1/src/main/sample.dat'
    ]);
  });

  it('should have a nest-cli.json for project', async () => {
    const options: Schema = {
      sourceRoot: '/libs/lib1/src',
      skipInstall: true,
      rootDir: 'src',
      project: 'lib1'
    };
    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'library',
        {
          name: 'lib1',
          prefix: '@app'
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(tree, '/nest-cli.json');
    const parsedFile = JSON.parse(fileContent);
    expect(parsedFile.projects.lib1.sourceRoot).toEqual('libs/lib1/src');
  });

  it('should a nest-cli.json for default app', async () => {
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

  it('should import the app.module int main azure file for project', async () => {
    const options: Schema = {
      sourceRoot: '/libs/lib1/src',
      skipInstall: true,
      rootDir: 'src',
      project: 'lib1'
    };
    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'library',
        {
          name: 'lib1',
          prefix: '@app'
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(tree, '/libs/lib1/src/main.azure.ts');

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

  it('should have the root dir for index file in main azure dir for project', async () => {
    const options: Schema = {
      sourceRoot: '/libs/lib1/src',
      skipInstall: true,
      rootDir: 'src',
      project: 'lib1'
    };
    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'library',
        {
          name: 'lib1',
          prefix: '@app'
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();
    const fileContent = getFileContent(tree, '/libs/lib1/src/main/index.ts');

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

  it('should import the webpack config for a project', async () => {
    const options: Schema = {
      sourceRoot: '/libs/lib1/src',
      skipInstall: true,
      rootDir: 'src',
      project: 'lib1'
    };
    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'library',
        {
          name: 'lib1',
          prefix: '@app'
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(
      tree,
      '/libs/lib1/src/webpack.config.js'
    );
    expect(fileContent).toContain(`filename: 'apps/lib1/main/index.js'`);
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

  it('should add a custom webpack config to the compilerOptions for a project', async () => {
    const options: Schema = {
      sourceRoot: '/apps/azure-func-http/src',
      skipInstall: true,
      rootDir: '',
      project: 'azure-func-http'
    };
    // await runner
    //   .runExternalSchematicAsync(
    //     '@nestjs/schematics',
    //     'application',
    //     {
    //       name: 'azure-func-http',
    //       prefix: '@app'
    //     },
    //     nestTree
    //   )
    //   .toPromise();

    await runner
      .runExternalSchematicAsync(
        '@nestjs/schematics',
        'sub-app',
        {
          name: 'azure-func-http'
        },
        nestTree
      )
      .toPromise();

    const tree = await runner
      .runSchematicAsync('nest-add', options, nestTree)
      .toPromise();

    const fileContent = getFileContent(tree, 'nest-cli.json');
    const parsedFile = JSON.parse(fileContent);

    const compilerOptions = parsedFile.projects.lib1.compilerOptions;
    expect(compilerOptions).toContain({
      webpack: 'true',
      webpackConfigPath: 'apps/lib1/src/webpack.config.js',
      tsConfigPath: 'libs/lib1/tsconfig.lib.json'
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
