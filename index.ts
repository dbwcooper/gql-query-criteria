export enum OPERATOR {

  /**
   * 交集
   */
  AND = "AND",

  /**
   * 并集
   */
  OR = "OR"
}

type ObjectCreiteria = {
  operator?: keyof typeof OPERATOR;
  [key: string]: Criteria | Criteria[] | string | number | boolean | null | undefined | number[];
};

export type Criteria = string | Criteria[] | ObjectCreiteria


/**
 * Converts an array of strings into a string representation with each element enclosed in single quotes and separated by commas.
 * 
 * @example
 *  ```ts
 *  // Prints "('1', '2', '3')"
 *  console.log(convertArrayToQuotedString([1,2,3]))
 *  ```
 * @param arr The array of strings to convert.
 * @returns The string representation of the array.
 */
function convertArrayToQuotedString(arr: string[]): string {
  return `(${arr.map((item) => `'${item}'`).join(', ')})`;
}


/**
 * Removes leading and trailing spaces, replaces multiple spaces with a single space,
 * removes spaces and newlines after opening parentheses, and removes spaces and newlines
 * before closing parentheses.
 * 
 * @param str - The input string.
 * @returns The normalized string.
 */
function normalizeString(str: string): string {
  // return str.trim().replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  return str.trim().replace(/\s+/g, ' ').replace(/(\()\s+|\s+(\))/g, '$1$2');
}

/**
 * Adds two numbers together.
 * @example
 * Here's a simple example:
 * ```
 * // Prints "2":
 * console.log(add(1,1));
 * ```
 * @example
 * Here's an example with negative numbers:
 * ```
 * // Prints "0":
 * console.log(add(1,-1));
 * ```
 */

/**
 * Converts an array of criteria into a string representation.
 * @param criterias - The array of criterias to convert.
 * @param defaultOperator - The default operator to use between criterias.
 * @returns The converted criteria string.
 * 
 * @example
 * combine string criterias
 * ```
 * const criterias = [` id='1'`,`  name='张三' `]
 * // Prints "(id='1') AND (name='张三')":
 * convertCriteriaToString(criterias)
 * ```
 * 
 * @example
 * combine complex criterias
 * ```
 * const criterias: Criteria = [
      ` id='1'`,
      {
        operator: 'OR',
        code: ['1', '2', '3'],
        'select age from Person where code': ['1', '2'],
      }
    ]
 * // Prints "(id='1') AND ((code in ('1', '2', '3')) OR (select age from Person where code in ('1', '2')))":
 * convertCriteriaToString(criterias)
 * ```
 * 
 */
export function formatCriteriaToString(
  criterias: Criteria,
  defaultOperator: string = OPERATOR.AND
): string {
  if (!Array.isArray(criterias) || !criterias.length) {
    return '';
  }

  function makeNestedCriteria(criteria: Criteria): string {
    return formatCriteriaToString(criteria, defaultOperator);
  }

  function makeObjectCritera(criteria: ObjectCreiteria): string {
    const operator = typeof criteria.operator === 'string' ? criteria.operator : OPERATOR.AND;
    const nextCriterias = Object.entries(criteria)
      .filter(([key]) => key !== 'operator')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key} in ${convertArrayToQuotedString(value as string[])}`;
        }
        if (value !== undefined && value !== null) {
          return `${key}='${value}'`;
        }
        return '';
      });
    const nextCriteriasStr = formatCriteriaToString(nextCriterias, operator);
    return nextCriteriasStr ? `(${nextCriteriasStr})` : '';
  }

  function makeStringCriteria(criteria: string): string {
    return `(${normalizeString(criteria)})`;
  }

  return criterias
    .map((criteria) => {
      if (Array.isArray(criteria)) {
        return makeNestedCriteria(criteria);
      }

      if (typeof criteria === 'object' && criteria !== null) {
        return makeObjectCritera(criteria);
      }

      if (typeof criteria === 'string' && criteria.trim().length > 0) {
        return makeStringCriteria(criteria);
      }
      return false;
    })
    .filter(Boolean)
    .join(` ${defaultOperator} `);
}