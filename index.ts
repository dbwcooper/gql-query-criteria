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

/**
 * Converts an array of criteria into a string representation.
 * @param criterias - The array of criterias to convert.
 * @returns The converted criteria string.
 * 
 * @example
 * combine string criterias
 * ```
 * const criterias = [` id='1'`,`  name='张三' `]
 * // Prints "((id='1') AND (name='张三'))":
 * formatCriteriaToString(criterias)
 * ```
 * 
 * @example
 * combine complex criterias
 * ```
 *  const criterias = [
      `id='1'`,
      null,
      `name='张三'`,
      [`age='1'`, `address='1'`],
    ];
 * // Prints "((id='1') AND (name='张三') AND ((age='1') AND (address='1')))":
 * ```
 * formatCriteriaToString
 */

export function formatCriteriaToString(criterias: Criteria): string {
  if (!Array.isArray(criterias) || !criterias.length) {
    return "";
  }

  function makeObjectCritera(criteria: ObjectCriteria): string {
    const operator = getOperator(criteria.operator);
    const nextCriterias = Object.entries(criteria)
      .filter(([key]) => key !== "operator")
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key} in ${convertArrayToQuotedString(value as string[])}`;
        }
        if (value !== undefined && value !== null) {
          return `${key}='${value}'`;
        }
        return "";
      });
    nextCriterias.unshift(operator);
    const nextCriteriasStr = formatCriteriaToString(nextCriterias);
    return nextCriteriasStr ? `(${nextCriteriasStr})` : "";
  }

  function makeStringCriteria(criteria: string): string | null {
    return criteria.trim().length > 0 ? `(${normalizeString(criteria)})` : null;
  }

  const operator = getOperator(criterias[0]);
  const criteriaString = criterias
    .map((criteria) => {
      // 过滤操作符
      if (criteria === OPERATOR.AND || criteria === OPERATOR.OR) return false;

      if (Array.isArray(criteria)) {
        return formatCriteriaToString(criteria);
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

  return makeStringCriteria(criteriaString) || "";
}
