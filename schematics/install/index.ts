import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  Rule,
  SchematicContext,
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

function addDependenciesAndScripts(): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@azure/functions',
      version: '^1.0.3'
    });
    return host;
  };
}

export default function(options: AzureOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }
    const rootSource = apply(url('./files/root'), [
      template({
        ...strings,
        ...(options as object),
        rootDir: options.rootDir,
        getRootDirectory: () => options.rootDir,
        stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
        getRootModuleName: () => options.rootModuleClassName,
        getRootModulePath: () => options.rootModuleFileName
      })
    ]);

    return chain([mergeWith(rootSource), addDependenciesAndScripts()]);
  };
}
