export const mapSettingsResponse = (data) => ({
  company: {
    companyName: data.companyName,
    gstTin: data.gstTin,
    contactNumber: data.contactNumber,
    companyEmail: data.companyEmail,
  },

  billing: {
    fullAddress: data.fullAddress,
    country: data.country,
    state: data.state,
    city: data.city,
    pinCode: data.pinCode,
  },

  other: {
    supportContact: data.supportContact,
    website: data.website,
    termsConditions: data.termsConditions,
    invoicePrefix: data.invoicePrefix,
    enableInvoicePrefix: !!data.enableInvoicePrefix,
    lastInvoiceNumber: data.lastInvoiceNumber,
  },
});
