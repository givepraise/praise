import { StaticModuleRecord } from '@endo/static-module-record';
import { makeClient } from '@/utils/axios';
import { useCompartmentReturn } from '../types/use-compartment-return.type';

/**
 * Converts JSON to a JS object
 */
function convertJSONToJSObject(json: string): string {
  const jsObjectString = json
    .replace(/^\{/, 'export default {')
    .replace(/\}$/, '};');
  return jsObjectString;
}

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
    if (
      !moduleSpecifier.endsWith('.js') &&
      !moduleSpecifier.endsWith('.json')
    ) {
      moduleSpecifier += '.js';
    }

    const client = makeClient();
    const response = await client.get(moduleSpecifier);
    const moduleText = response.data;

    // If it's a JSON file, convert it to a JS object
    const processedModuleText = moduleSpecifier.endsWith('.json')
      ? convertJSONToJSObject(JSON.stringify(moduleText))
      : moduleText;

    return new StaticModuleRecord(processedModuleText, moduleSpecifier);
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
