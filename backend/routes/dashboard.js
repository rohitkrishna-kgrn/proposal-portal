const router = require('express').Router();
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalProposals, totalUsers, sentProposals, activeProposals] = await Promise.all([
      Proposal.countDocuments(),
      User.countDocuments(),
      Proposal.countDocuments({ status: 'sent' }),
      Proposal.countDocuments({ status: 'active' })
    ]);

    // Monthly proposals for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthly = await Proposal.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Status distribution
    const statusDist = await Proposal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Services popularity
    const servicesDist = await Proposal.aggregate([
      { $unwind: '$selectedServices' },
      { $group: { _id: '$selectedServices.name', count: { $sum: 1 }, totalRevenue: { $sum: '$selectedServices.price' } } },
      { $sort: { count: -1 } }
    ]);

    // Top proposers
    const topUsers = await Proposal.aggregate([
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', count: 1 } }
    ]);

    res.json({
      totalProposals,
      totalUsers,
      sentProposals,
      activeProposals,
      monthly,
      statusDist,
      servicesDist,
      topUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
