const router = require('express').Router();
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');
const { generatePDF } = require('../utils/pdfGenerator');

router.get('/:id/download', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('createdBy', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(proposal.createdBy._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.log(`[PDF] Generating for proposal ${req.params.id} (${proposal.clientName})`);
    const pdfBuffer = await generatePDF(proposal);
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    console.log(`[PDF] Done — ${buffer.length} bytes`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${proposal.referenceNo}-${proposal.clientName}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    res.status(500).json({ message: err.message || 'PDF generation failed' });
  }
});

module.exports = router;
