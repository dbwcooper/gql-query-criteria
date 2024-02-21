export enum OPERATOR {
  /**
   * 交集
   */
  AND = "AND",

  /**
   * 并集
   */
  OR = "OR",
}

type ObjectCriteria = {
  operator?: keyof typeof OPERATOR;
  [key: string]:
    | Criteria
    | Criteria[]
    | string
    | number
    | boolean
    | null
    | undefined
    | number[];
};

export type Criteria = undefined | null | string | ObjectCriteria | Criteria[];

/**
 * Converts an array of criteria into a string representation.
 * @param criterias - The array of criterias to convert.
 * @returns The converted criteria string.
 * 
 * @example
 * combine string criterias
 * ```
 * const criterias = [` id='1'`,`  name='张三' `]
 * // Prints "(id='1' AND name='张三')":
 * criteriaToString(criterias)
 * ```
 * 
 * @example
 * combine complex criterias
 * ```
 *  const criterias = [
      `id='1'`,
      null,
      ['OR', `name='Tom'`, `address='1'`],
      {
        age: [20, 21, 22]
      }
    ];
 * // Prints "(id='1' AND (age='1' OR address='1') AND age in (20, 21, 22))"
 * ```
 */
export function criteriaToString(criterias: Criteria): string {
  if (!Array.isArray(criterias) && typeof criterias === "object" && criterias) {
    return makeObjectCritera(criterias);
  }

  if (!Array.isArray(criterias) || !criterias.length) {
    return "";
  }

  const operator = getOperator(criterias[0]);
  const criteriaString = criterias
    .map((criteria) => {
      if (criteria === OPERATOR.AND || criteria === OPERATOR.OR) return false;

      if (Array.isArray(criteria)) {
        return criteriaToString(criteria);
      }

      if (typeof criteria === "object" && criteria !== null) {
        return makeObjectCritera(criteria);
      }

      if (typeof criteria === "string") {
        return makeStringCriteria(criteria);
      }
      return false;
    })
    .filter(Boolean)
    .join(` ${operator} `);

  const nextCriteriaStr = makeStringCriteria(criteriaString);
  return nextCriteriaStr ? `(${nextCriteriaStr})` : "";
}

/**
 * Generates string based on the provided criteria object.
 * @example
 *  ```ts
 *  // Prints "id in ('1', '2', '3')"
 *  console.log(makeObjectCritera({ id: [1, 2, 3] }))
 *  ```
 * @param {ObjectCriteria} criteria - The criteria object used to generate string.
 * @return {string} The generated string.
 */
function makeObjectCritera(criteria: ObjectCriteria): string {
  const operator = getOperator(criteria.operator);
  const nextCriterias = Object.entries(criteria)
    .filter(([key]) => key !== "operator")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key} in ${arrayToQuotedString(value as string[])}`;
      }
      if (value !== undefined && value !== null) {
        return `${key}='${value}'`;
      }
      return "";
    });
  nextCriterias.unshift(operator);
  const nextCriteriaStr = criteriaToString(nextCriterias);
  return nextCriteriaStr ? `(${nextCriteriaStr})` : "";
}

/**
 * Generates a string criteria based on the given input.
 *
 * @param {string} criteria - The input criteria string.
 * @return {string | null} - The generated string criteria, or null if the input is empty.
 */
function makeStringCriteria(criteria: string): string | null {
  return criteria.trim().length > 0 ? `${normalizeString(criteria)}` : null;
}

/**
 * Converts an array of strings into a string representation with each element enclosed in single quotes and separated by commas.
 *
 * @param arr The array of strings to convert.
 * @returns The string representation of the array.
 *
 * @example
 *  ```ts
 *  // Prints "('1', '2', '3')"
 *  console.log(arrayToQuotedString([1,2,3]))
 *  ```
 */
function arrayToQuotedString(arr: string[]): string {
  return `(${arr.map((item) => `'${item}'`).join(", ")})`;
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
  return str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(\()\s+|\s+(\))/g, "$1$2");
}

/**
 * Returns the operator based on the given criteria.
 *
 * @param {Criteria} operator - The criteria to determine the operator.
 * @return {OPERATOR} The resulting operator.
 */
function getOperator(operator: Criteria): OPERATOR {
  return operator === OPERATOR.OR ? OPERATOR.OR : OPERATOR.AND;
}

export default criteriaToString;
