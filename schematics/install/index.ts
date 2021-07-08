import { parseJson, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  FileEntry,
  forEach,
  mergeWith, noop, Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { Schema as AzureOptions } from './schema';

type UpdateJsonFn<T> = (obj: T) => T | void;

function addDependenciesAndScripts(): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@azure/functions',
      version: '^1.0.3'
    });
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());
    pkg.scripts['start:azure'] = 'npm run build && func host start';

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return host;
  };
}

function updateJsonFile<T>(
  host: Tree,
  path: string,
  callback: UpdateJsonFn<T>
): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = parseJson(sourceText);
    callback((json as {}) as T);
    host.overwrite(path, JSON.stringify(json, null, 2));
  }
  return host;
}
const applyProjectName = (projectName, host) => {
  if (projectName) {
    let nestCliFileExists = host.exists('nest-cli.json');

    if (nestCliFileExists) {
      updateJsonFile(
        host,
        'nest-cli.json',
        (optionsFile: Record<string, any>) => {
          if (optionsFile.projects[projectName].compilerOptions) {
            optionsFile.projects[projectName].compilerOptions = {
              ...optionsFile.projects[projectName].compilerOptions,
              ...{
                webpack: true,
                webpackConfigPath: `${projectName}/webpack.config.js`
              }
            };
          }
        }
      );
    }
  }
};

const rootFiles = [
  '/.funcignore',
  '/host.json',
  '/local.settings.json',
  '/proxies.json'
];

const validateExistingRootFiles = (host: Tree, file: FileEntry) => {
  return rootFiles.includes(file.path) && host.exists(file.path);
};

export default function (options: AzureOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }
    const defaultSourceRoot =
      options.project !== undefined ? options.sourceRoot : options.rootDir;
    const rootSource = apply(
      options.project ? url('./files/project') : url('./files/root'),
      [
        template({
          ...strings,
          ...(options as AzureOptions),
          rootDir: options.rootDir,
          sourceRoot: defaultSourceRoot,
          getRootDirectory: () => options.rootDir,
          getProjectName: () => options.project,
          stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
          getRootModuleName: () => options.rootModuleClassName,
          getRootModulePath: () => options.rootModuleFileName
        }),
        forEach((file: FileEntry) => {
          if (validateExistingRootFiles(host, file)) return null;
          return file;
        })
      ]
    );

    return chain([
      (tree, context) =>
        options.project
          ? applyProjectName(options.project, host)
          : noop()(tree, context),
      addDependenciesAndScripts(),
      mergeWith(rootSource)
    ]);
  };
}
