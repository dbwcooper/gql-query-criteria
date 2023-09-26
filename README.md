## gql-query-criteria

A library for converting an array of criteria into a string representation.

### Installation

```
bun install gql-query-criteria
```

### Usage

```
import { formatCriteriaToString } from "gql-query-criteria";

const criterias = [
  ` id='1'`,
  {
    operator: 'OR',
    age: ['18', '22',],
    'select id from Person where code': ['101', '102'],
  }
];

const criteriaString = formatCriteriaToString(criterias);

console.log(criteriaString); // Prints "(id='1') AND ((age in ('18', '22')) OR (select id from Person where code in ('101', '102')))"
```

### Step-by-step explanation

The `formatCriteriaToString` function takes an array of criteria and a default operator as arguments. The default operator is used to combine the criteria together if no operator is specified for a particular criterion.

The function first checks if the array of criteria is empty or not. If it is, then it returns an empty string.

If the array of criteria is not empty, then the function iterates over the criteria and converts each criterion to a string representation.

To convert a string criterion to a string representation, the function simply wraps the criterion in parentheses and normalizes the string.

To convert an object criterion to a string representation, the function first gets the operator for the criterion. If the operator is not specified, then the default operator is used.

The function then iterates over the properties of the object criterion and converts each property to a string representation.

If the property is an array, then the function converts it to a string representation by wrapping it in parentheses and joining the elements of the array with commas.

If the property is a string, then the function simply wraps it in parentheses.

The function then joins all of the string representations of the properties of the object criterion together with the operator.

To convert an array criterion to a string representation, the function simply calls the `formatCriteriaToString` function recursively on the array.

Once all of the criteria have been converted to string representations, the function joins them together with the default operator and returns the resulting string.
