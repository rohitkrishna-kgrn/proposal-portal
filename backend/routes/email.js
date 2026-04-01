const router = require('express').Router();
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');
const { sendProposalEmail } = require('../utils/emailSender');
const { generatePDF } = require('../utils/pdfGenerator');

router.post('/:id/send', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('createdBy', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const { to, subject, body } = req.body;

    // Generate PDF
    const pdfBuffer = await generatePDF(proposal);

    await sendProposalEmail({ to, subject, body, pdfBuffer, proposal });

    proposal.status = 'sent';
    proposal.emailSentAt = new Date();
    proposal.emailSentTo = to;
    await proposal.save();

    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
