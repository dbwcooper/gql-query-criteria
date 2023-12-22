(
  (
    (
      (quantity = 0)
      OR (productId is null)
    )
    AND (abs(originInvoiceAmount) > abs(originRcAmount))
  )
  OR (
    (quantity != 0)
    AND (productId is not null)
    AND (abs(invoiceQuantity) > abs(rcQuantity))
  )
)