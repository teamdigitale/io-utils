/**
 * Exposes a template environment instantiated with custom template functionalities defined specifically for gen-api-models command
 */

// import { HttpStatusCodeEnum } from "@pagopa/ts-commons/lib/responses";
import { createTemplateEnvironment } from "../../lib/templating";
import { IResponse } from "./types";

/**
 * Factory method to create a set of filters bound to a common storage.
 * The storage is in the form (key, true) where the presence of a kye indicates the flag is true
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFlagStorageFilters = () => {
  // eslint-disable-next-line functional/no-let, functional/prefer-readonly-type
  let store: { [key: string]: true } = {};
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, prefer-arrow/prefer-arrow-functions
    reset() {
      store = {};
    },
    // eslint-disable-next-line sort-keys, @typescript-eslint/explicit-function-return-type, prefer-arrow/prefer-arrow-functions
    add(subject: string) {
      // eslint-disable-next-line functional/immutable-data
      store[subject] = true;
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, prefer-arrow/prefer-arrow-functions
    get() {
      return Object.keys(store).join("\n");
    }
  };
};

// filters to handle the import list
const {
  reset: resetImports,
  add: addImport,
  get: getImports
} = createFlagStorageFilters();

// filters to handle the type alias list
const {
  reset: resetTypeAliases,
  add: addTypeAlias,
  get: getTypeAliases
} = createFlagStorageFilters();

/**
 * Given an array of parameter in the form { name: "value" }, it renders a function argument declaration with destructuring
 * example: [{ name: 'foo' }, { name: 'bar' }] -> '({ foo, bar })'
 *
 * @param subject the array of parameters
 *
 * @return the function argument declaration
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toFnArgs = (
  subject: ReadonlyArray<{ readonly name: string }> | undefined
) =>
  typeof subject === "undefined"
    ? "()"
    : `({${subject.map(({ name }) => name).join(", ")}})`;

/**
 * Given an array of parameter in the form { in: "value" }, filter the items based on the provided value
 *
 * @param item
 * @param where
 *
 * @return filtered items
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const paramIn = (
  item: ReadonlyArray<{ readonly in: string }> | undefined,
  where: string
) => (item ? item.filter((e: { readonly in: string }) => e.in === where) : []);

/**
 * Given an array of parameter in the form { in: "value" }, filter the items based on the provided value
 * for taking all except the passed one
 *
 * @param item
 * @param where
 *
 * @return filtered items
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const paramNotIn = (
  item: ReadonlyArray<{ readonly in: string }> | undefined,
  where: string
) => (item ? item.filter((e: { readonly in: string }) => e.in !== where) : []);

/**
 * Removes decorator character from a variable name
 * example: "arg?" -> "arg"
 * example: "arg" -> "arg"
 * example: ["arg1?", "arg2"] -> ["arg1", "arg2"]
 *
 * @param subject
 *
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stripQuestionMark = (subject: ReadonlyArray<string> | string) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type
  const strip_base = (str: string) =>
    str[str.length - 1] === "?" ? str.substring(0, str.length - 1) : str;
  return !subject
    ? undefined
    : typeof subject === "string"
    ? strip_base(subject)
    : subject.map(strip_base);
};

/**
 * Print optional symbol `?` from a variable name
 * example: "arg?" -> "?"
 * example: "arg" -> ""
 * example: ["arg1?", "arg2"] -> ["?", ""]
 *
 * @param subject
 *
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setOptionalSymbol = (subject: ReadonlyArray<string> | string) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type
  const getOptionalSymbol = (str: string) =>
    str[str.length - 1] === "?" ? "?" : "";
  return !subject
    ? undefined
    : typeof subject === "string"
    ? getOptionalSymbol(subject)
    : subject.map(getOptionalSymbol);
};

/**
 * Filter an array based on a paramenter and a value to match
 */
const parameterEqual = <T extends ReadonlyArray<any>>(
  array: T,
  parameterName: string,
  value: any
): any | undefined => array.find(a => a[parameterName] == value);

/**
 * Build the IResponse type based on OpenApi response values
 * @param response
 * @returns
 */
const openapiResponseToTSCommonsResponse = (response: IResponse): string => {
  const returnType = response.e2 ?? "undefined";
  // const statusCode: HttpStatusCodeEnum = +response.e1 as HttpStatusCodeEnum;
  const statusCode = +response.e1;

  // console.log(` ---->  ${statusCode}`);

  switch (statusCode) {
    case 200:
      return `IResponseSuccessJson<${returnType}>`;
    case 201:
      return `IResponseSuccessRedirectToResource<${returnType}, ${returnType}>`;
    case 202:
      return `ResponseSuccessAccepted<${returnType}>`;
    default:
      return "NotImplemented";
      throw Error(`Status code ${response.e1} not implemented`);
  }
};

/**
 *
 */
export default createTemplateEnvironment({
  customFilters: {
    resetImports,
    // eslint-disable-next-line sort-keys
    addImport,
    getImports,
    resetTypeAliases,
    // eslint-disable-next-line sort-keys
    addTypeAlias,
    getTypeAliases,
    toFnArgs,
    // eslint-disable-next-line sort-keys
    paramIn,
    stripQuestionMark,

    // eslint-disable-next-line sort-keys
    paramNotIn,
    parameterEqual,
    setOptionalSymbol,
    // eslint-disable-next-line sort-keys
    openapiResponseToTSCommonsResponse
  }
});
