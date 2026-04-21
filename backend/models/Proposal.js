const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: String,
  price: Number
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  templateId: { type: String, default: 'einvoicing-proposal' },
  templateName: { type: String, default: 'eInvoicing Proposal' },
  status: { type: String, enum: ['draft', 'active', 'sent', 'accepted', 'rejected'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Dynamic fields
  clientName: { type: String, required: true },
  entityGroupName: String,
  proposalDate: { type: Date, default: Date.now },

  // Services
  selectedServices: [serviceSchema],

  // Business context (page 3)
  industry: String,
  revenueModel: String,
  customerBase: String,
  erpSystem: String,
  transaction: String,

  // Pricing (page 7)
  gapAnalysisPrice: Number,
  implementationPrice: Number,
  annualSubscriptionPrice: Number,
  overagePrice: Number,

  // ERP Names (page 10)
  erpNames: [String],

  // Managed services pricing (page 13)
  monitorPrice: { type: Number, default: 4000 },
  assurePrice: { type: Number, default: 6000 },
  operatePrice: { type: Number, default: 9500 },

  // Currency
  currency: { type: String, enum: ['USD', 'AED', 'EUR'], default: 'USD' },

  // Slide 14 toggle
  includeManagedServices: { type: Boolean, default: true },

  pdfPath: String,
  emailSentAt: Date,
  emailSentTo: String
}, { timestamps: true });

// Auto-generate reference number
proposalSchema.pre('save', async function(next) {
  if (!this.referenceNo) {
    const count = await mongoose.model('Proposal').countDocuments();
    this.referenceNo = `KP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Proposal', proposalSchema);
