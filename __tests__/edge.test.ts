import { expect, test, describe } from "bun:test";
import { criteriaToString } from "../index";

describe("替换用例", () => {
  test("revenueConfirmation-blue-1", () => {
    const isShowExecuted = false;
    const criteriaArray = [
      `revenueConfirmationStatusId != ''`,
      isShowExecuted
        ? null
        : `revenueConfirmationStatusId != 'ENUM_RevenueConfirmationStatusEnum_all'`,
    ];
    expect(criteriaToString(criteriaArray)).toBe(
      "((revenueConfirmationStatusId != '') AND (revenueConfirmationStatusId != 'ENUM_RevenueConfirmationStatusEnum_all'))"
    );
  });

  test("revenueConfirmation-blue-1-isShowExecuted", () => {
    const isShowExecuted = true;
    const criteriaArray = [
      `revenueConfirmationStatusId != ''`,
      isShowExecuted
        ? null
        : `revenueConfirmationStatusId != 'ENUM_RevenueConfirmationStatusEnum_all'`,
    ];
    expect(criteriaToString(criteriaArray)).toBe(
      "((revenueConfirmationStatusId != ''))"
    );
  });

  test("revenueConfirmation-blue-2", () => {
    const criteriaArray = [
      "OR",
      [
        "abs(originRcAmount) > 0",
        "abs(originInvoiceAmount) < abs(originRcAmount)",
      ],
      [`isFreeGift = 't'`, `abs(rcQuantity) > abs(invoiceQuantity)`],
    ];

    expect(criteriaToString(criteriaArray)).toBe(
      "(((abs(originRcAmount) > 0) AND (abs(originInvoiceAmount) < abs(originRcAmount))) OR ((isFreeGift = 't') AND (abs(rcQuantity) > abs(invoiceQuantity))))"
    );
  });

  test("revenueConfirmation-red-2", () => {
    // ((abs(originInvoiceAmount) > 0 AND abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)> 0) or (isFreeGift = 't' and abs(rcQuantity) > 0))
    const criteriaArray = [
      "OR",
      [
        "abs(originInvoiceAmount) > 0",
        "abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)> 0",
      ],
      [`isFreeGift = 't'`, `abs(rcQuantity) > 0`],
    ];

    expect(criteriaToString(criteriaArray)).toBe(
      "(((abs(originInvoiceAmount) > 0) AND (abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)> 0)) OR ((isFreeGift = 't') AND (abs(rcQuantity) > 0)))"
    );
  });

  test("revenueConfirmation-red-3", () => {
    // ((abs(originInvoiceAmount)>0 AND abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)>0) or (isFreeGift = 't' and abs(rcQuantity) > 0)) and "1"
    const criteriaArray = [
      [
        "OR",
        [
          "abs(originInvoiceAmount)>0",
          "abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)>0",
        ],
        [`isFreeGift = 't'`, "abs(rcQuantity) > 0"],
      ],
      "1",
    ];

    expect(criteriaToString(criteriaArray)).toBe(
      "((((abs(originInvoiceAmount)>0) AND (abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)>0)) OR ((isFreeGift = 't') AND (abs(rcQuantity) > 0))) AND (1))"
    );

    const criteriaArray2 = [
      "1",
      [
        "OR",
        [`isFreeGift = 't'`, "abs(rcQuantity) > 0"],
        [
          "abs(originInvoiceAmount) > 0",
          "abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)>0)",
        ],
      ],
    ];

    expect(criteriaToString(criteriaArray2)).toBe(
      "((1) AND (((isFreeGift = 't') AND (abs(rcQuantity) > 0)) OR ((abs(originInvoiceAmount) > 0) AND (abs(case when invoiceQuantity=0 then 1 else invoiceQuantity end)>0)))))"
    );
  });

  test("Invoice-blue-1", () => {
    const criterias = [
      "OR",
      [
        ["OR", "quantity = 0", "productId is null"],
        "abs(originInvoiceAmount) > abs(originRcAmount)",
      ],
      [
        ["quantity != 0", "productId is not null"],
        "abs(invoiceQuantity) > abs(rcQuantity)",
      ],
    ];
    expect(criteriaToString(criterias)).toBe(
      "((((quantity = 0) OR (productId is null)) AND (abs(originInvoiceAmount) > abs(originRcAmount))) OR (((quantity != 0) AND (productId is not null)) AND (abs(invoiceQuantity) > abs(rcQuantity))))"
    );
  });

  test("Invoice-blue-1-2", () => {
    const criterias = [
      "invoiceStatusId != ''",
      null,
      {
        "invoiceStatusId not": [
          "ENUM_InvoiceStatusEnum_all",
          "ENUM_InvoiceStatusEnum_done",
        ],
      },
    ];
    expect(criteriaToString(criterias)).toBe(
      "((invoiceStatusId != '') AND (((invoiceStatusId not in ('ENUM_InvoiceStatusEnum_all', 'ENUM_InvoiceStatusEnum_done')))))"
    );
  });

  test("Invoice-red-2-1", () => {
    const criterias = [
      "OR",
      [["OR", "quantity = 0", "productId is null"], "abs(originRcAmount) > 0"],
      ["abs(rcQuantity) > 0", "quantity != 0", "productId is not null"],
    ];
    expect(criteriaToString(criterias)).toBe(
      "((((quantity = 0) OR (productId is null)) AND (abs(originRcAmount) > 0)) OR ((abs(rcQuantity) > 0) AND (quantity != 0) AND (productId is not null)))"
    );
  });

  test("PurchaseInvoice-blue-1-1", () => {
    const criterias = [
      "OR",
      [
        ["OR", "quantity = 0", "productId is null"],
        "abs(originInvoiceAmount) > abs(originApPaymentAmount)",
      ],
      [
        "quantity != 0",
        "productId is not null",
        "abs(invoiceQuantity) > abs(apPaymentQuantity)",
      ],
    ];
    expect(criteriaToString(criterias)).toBe(
      "((((quantity = 0) OR (productId is null)) AND (abs(originInvoiceAmount) > abs(originApPaymentAmount))) OR ((quantity != 0) AND (productId is not null) AND (abs(invoiceQuantity) > abs(apPaymentQuantity))))"
    );
  });

  test("PurchaseInvoice-red-1-1", () => {
    const criterias = [
      "OR",
      [
        ["OR", "quantity = 0", "productId is null"],
        "abs(originApPaymentAmount) > 0",
      ],
      ["quantity != 0", "productId is not null", "abs(apPaymentQuantity) > 0"],
    ];
    expect(criteriaToString(criterias)).toBe(
      "((((quantity = 0) OR (productId is null)) AND (abs(originApPaymentAmount) > 0)) OR ((quantity != 0) AND (productId is not null) AND (abs(apPaymentQuantity) > 0)))"
    );
  });

  test("PaymentApplication-blue-1-1", () => {
    const criterias = [
      `paymentApplicationStatusId != ''`,
      `paymentStatusId != ''`,
      [
        {
          "paymentApplicationStatusId not": [
            "ENUM_PaymentApplicationStatusEnum_all",
            "ENUM_PaymentApplicationStatusEnum_done",
          ],
        },
        {
          "paymentStatusId not": [
            "ENUM_PaymentStatusEnum_all",
            "ENUM_PaymentStatusEnum_done",
          ],
        },
      ],
    ];

    expect(criteriaToString(criterias)).toBe(
      "((paymentApplicationStatusId != '') AND (paymentStatusId != '') AND ((((paymentApplicationStatusId not in ('ENUM_PaymentApplicationStatusEnum_all', 'ENUM_PaymentApplicationStatusEnum_done')))) AND (((paymentStatusId not in ('ENUM_PaymentStatusEnum_all', 'ENUM_PaymentStatusEnum_done'))))))"
    );
  });
});
