import { expect, test, describe } from "bun:test";
import { formatCriteriaToString } from "../index";
import type { Criteria } from "../index";


describe('object cases', () => {

  test("对象默认使用 = 链接键值对", () => {
    const criterias = [
      ` id='1'`,
      {
        address: '1',
        lang: 'zig'
      }
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND ((address='1') AND (lang='zig'))");
  });

  test("对象使用 OR 链接键值对", () => {
    const criterias: Criteria = [
      ` id='1'`,
      {
        operator: 'OR',
        address: '1',
        lang: 'zig'
      }
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND ((address='1') OR (lang='zig'))");
  });

  test("对象内部 value 为数组时, 默认使用 in 操作符", () => {

    const criterias: Criteria = [
      ` id='1'`,
      {
        operator: 'OR',
        code: ['1', '2', '3'],
        'select age from Person where code': ['1', '2'],
      }
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND ((code in ('1', '2', '3')) OR (select age from Person where code in ('1', '2')))");
  });

})


describe("array cases", () => {

  test("空数组返回空字符串", () => {
    expect(formatCriteriaToString([])).toBe("");
  });

  test("字符串数组默认使用 AND 拼接", () => {
    const criterias = [`id='1'`, `name='张三'`]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND (name='张三')");
  });

  test("数组嵌套数组时, 默认使用 AND 拼接", () => {
    const criterias = [
      `id='1'`,
      `name='张三'`,
      [
        `age='1'`,
        `address='1'`
      ]
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND (name='张三') AND (age='1') AND (address='1')");
  });

  test("数组嵌套数组时, 数组嵌套 对象", () => {
    const criterias = [
      `id='1'`,
      `name='张三'`,
      {
        a: []
      }

    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND (name='张三') AND ((a in ()))");
  });


  test.todo("数组无限嵌套数组和对象", () => {
    // const criterias = [
    //   `name='张三'`,
    //   {
    //     id: [
    //       {

    //         operator: 'where',
    //         'select age from Person': {
    //           code: ['1', '2']
    //         }
    //       }
    //     ]
    //   }

    // ]
    // expect(formatCriteriaToString(criterias)).toBe("(name='张三') AND ((id in (select age from Person where (code in ('1', '2')))))");
  });

})

describe("string cases", () => {
  test("剔除数组中字符串首尾空格", () => {
    const criterias = [
      ` id='1'`,
      `  name='张三' `,
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND (name='张三')");
  });

  test("剔除数组中字符串的换行符", () => {
    const criterias = [
      ` id='1'`,
      `  name='张三' `,
      `id in   
        (select age from Person where    
          (code in ('1', '2'))
        )
    `
    ]
    expect(formatCriteriaToString(criterias)).toBe("(id='1') AND (name='张三') AND (id in (select age from Person where (code in ('1', '2'))))");
  });


})


describe("edge cases", () => {
  test("1", () => {
    expect(formatCriteriaToString([])).toBe("");
  });
});