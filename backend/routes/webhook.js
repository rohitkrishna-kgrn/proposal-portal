const router = require('express').Router();
const { generatePDF } = require('../utils/pdfGenerator');

// Webhook: no auth, returns PDF
router.post('/einvoicing-proposal', async (req, res) => {
  try {
    const data = req.body;
    if (!data.clientName) return res.status(400).json({ message: 'clientName is required' });

    // Build a proposal-like object
    const proposal = {
      referenceNo: data.referenceNo || `WH-${Date.now()}`,
      clientName: data.clientName,
      entityGroupName: data.entityGroupName || '',
      proposalDate: data.proposalDate ? new Date(data.proposalDate) : new Date(),
      selectedServices: data.selectedServices || [],
      industry: data.industry || '',
      revenueModel: data.revenueModel || '',
      customerBase: data.customerBase || '',
      erpSystem: data.erpSystem || '',
      transaction: data.transaction || '',
      gapAnalysisPrice: data.gapAnalysisPrice,
      implementationPrice: data.implementationPrice,
      annualSubscriptionPrice: data.annualSubscriptionPrice,
      overagePrice: data.overagePrice,
      erpNames: data.erpNames || ['Odoo', 'Oracle NetSuite', 'SAP S/4HANA', 'Microsoft Dynamics 365', 'Sage', 'QuickBooks', 'Xero', 'Zoho Books', 'Epicor', 'Infor'],
      monitorPrice: data.monitorPrice || 4000,
      assurePrice: data.assurePrice || 6000,
      operatePrice: data.operatePrice || 9500,
      currency: ['USD', 'AED', 'EUR'].includes(data.currency) ? data.currency : 'USD',
    };

    const pdfBuffer = await generatePDF(proposal);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="einvoicing-proposal-${proposal.clientName}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
