const router = require('express').Router();
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

// List proposals - users see their own, admins see all
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const proposals = await Proposal.find(filter).populate('createdBy', 'name email').sort('-createdAt');
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const proposal = new Proposal({ ...req.body, createdBy: req.user._id });
    await proposal.save();
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('createdBy', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(proposal.createdBy._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(proposal.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(proposal, req.body);
    await proposal.save();
    res.json(proposal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(proposal.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await proposal.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
