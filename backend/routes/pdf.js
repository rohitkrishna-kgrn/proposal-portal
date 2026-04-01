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
    const pdfBuffer = await generatePDF(proposal);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${proposal.referenceNo}-${proposal.clientName}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
