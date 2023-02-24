import { StaticModuleRecord } from '@endo/static-module-record';
import { makeClient } from '@/utils/axios';
import { useCompartmentReturn } from '../types/use-compartment-return.type';

/**
 * Returns a function to create a SES compartment with a resolver and importer
 * that allows for relative imports.
 */
export function useCompartment(): useCompartmentReturn {
  /**
   * Imports with or without .js extension supported
   */
  async function importModule(
    moduleSpecifier: string
  ): Promise<StaticModuleRecord> {
    // Add .js to end of module specifier if it doesn't already have it
    if (!moduleSpecifier.endsWith('.js')) {
      moduleSpecifier += '.js';
    }
    const client = makeClient();
    const response = await client.get(moduleSpecifier);
    const moduleText = response.data;

    return new StaticModuleRecord(moduleText, moduleSpecifier);
  }

  /**
   * Resolver for SES Compartment, currently only supports relative imports
   */
  function resolveModule(
    moduleSpecifier: string,
    moduleReferrer: string
  ): string {
    const folderName = moduleReferrer.substring(
      0,
      moduleReferrer.lastIndexOf('/')
    );
    const fileNameParts = moduleSpecifier.split('/');
    const path = folderName.split('/');
    for (const part of fileNameParts) {
      if (part === '..') {
        path.pop();
      } else if (part !== '.') {
        path.push(part);
      }
    }
    return path.join('/');
  }

  function create(): Compartment {
    const compartment = new Compartment(
      {
        Math,
      },
      {},
      {
        resolveHook: resolveModule,
        importHook: importModule,
      }
    );

    return compartment;
  }

  return { create };
}
