import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';

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
      '/README.md',
      '/nest-cli.json',
      '/package.json',
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
      '/README.md',
      '/nest-cli.json',
      '/package.json',
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
      '/libs/lib1/src/main/function.json',
      '/libs/lib1/src/main/index.ts',
      '/libs/lib1/src/main/sample.dat'
    ]);
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
