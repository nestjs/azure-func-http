export interface Schema {
  /**
   * Application root directory
   */
  rootDir?: string;
  /**
   * The name of the root module file
   */
  rootModuleFileName?: string;
  /**
   * The name of the root module class.
   */
  rootModuleClassName?: string;
  /**
   * Skip installing dependency packages.
   */
  skipInstall?: boolean;
}
