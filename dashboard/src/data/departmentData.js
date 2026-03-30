// Amazon Department taxonomy with opportunity scoring data
// Based on Amazon Best Sellers categories + margin/procurement analysis
// Scoring aligned with product-selection-automation.md criteria

export const amazonDepartments = [
  {
    id: 'pet-supplies',
    name: 'Pet Supplies',
    icon: '🐾',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies',
    marketSize: '$14.69B',
    cagr: '6.0%',
    subcategories: [
      { name: 'Grooming', opportunity: 'high', avgMargin: 54, avgBSR: 2500, competition: 'moderate' },
      { name: 'Toys', opportunity: 'medium', avgMargin: 45, avgBSR: 3000, competition: 'moderate' },
      { name: 'Beds & Furniture', opportunity: 'medium', avgMargin: 38, avgBSR: 5000, competition: 'high' },
      { name: 'Feeding & Watering', opportunity: 'high', avgMargin: 48, avgBSR: 2000, competition: 'moderate' },
      { name: 'Collars, Harnesses & Leashes', opportunity: 'medium', avgMargin: 42, avgBSR: 4000, competition: 'high' },
      { name: 'Health Supplies', opportunity: 'low', avgMargin: 35, avgBSR: 8000, competition: 'high' }
    ],
    scores: { grossProfit: 8, procurementEase: 9, entryCost: 9, demandVolume: 8, competition: 6, dropship: 8 },
    composite: 8.0,
    status: 'active',
    activeProducts: ['Self-Cleaning Pet Slicker Brush'],
    highlights: ['High repeat purchase', 'Low brand loyalty in accessories', 'Growing online penetration', 'Year-round demand'],
    risks: ['Hertzko/FURminator dominance in some niches', 'Quality variance from China suppliers']
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    icon: '🏠',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden',
    marketSize: '$85.6B',
    cagr: '4.5%',
    subcategories: [
      { name: 'Kitchen Utensils & Gadgets', opportunity: 'high', avgMargin: 52, avgBSR: 1500, competition: 'high' },
      { name: 'Storage & Organization', opportunity: 'high', avgMargin: 48, avgBSR: 2000, competition: 'moderate' },
      { name: 'Cleaning Supplies', opportunity: 'medium', avgMargin: 40, avgBSR: 3000, competition: 'moderate' },
      { name: 'Bathroom Accessories', opportunity: 'medium', avgMargin: 45, avgBSR: 3500, competition: 'moderate' },
      { name: 'Home Décor', opportunity: 'medium', avgMargin: 42, avgBSR: 5000, competition: 'high' },
      { name: 'Bedding', opportunity: 'low', avgMargin: 30, avgBSR: 8000, competition: 'high' }
    ],
    scores: { grossProfit: 7, procurementEase: 8, entryCost: 7, demandVolume: 9, competition: 5, dropship: 7 },
    composite: 7.2,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Massive market size', 'Endless niches', 'Gift-friendly products', 'Strong Q4 seasonality'],
    risks: ['Amazon Basics competition', 'Very crowded top categories', 'Higher return rates for furniture']
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    icon: '💄',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty',
    marketSize: '$57.2B',
    cagr: '5.2%',
    subcategories: [
      { name: 'Skin Care Tools', opportunity: 'high', avgMargin: 60, avgBSR: 2000, competition: 'moderate' },
      { name: 'Hair Accessories', opportunity: 'high', avgMargin: 55, avgBSR: 1800, competition: 'moderate' },
      { name: 'Makeup Tools & Brushes', opportunity: 'medium', avgMargin: 50, avgBSR: 3000, competition: 'high' },
      { name: 'Bath & Shower', opportunity: 'medium', avgMargin: 42, avgBSR: 4000, competition: 'moderate' },
      { name: 'Oral Care', opportunity: 'low', avgMargin: 35, avgBSR: 6000, competition: 'high' }
    ],
    scores: { grossProfit: 8, procurementEase: 7, entryCost: 8, demandVolume: 8, competition: 5, dropship: 7 },
    composite: 7.2,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['High margins', 'Influencer marketing potential', 'Strong repeat purchase', 'Low shipping cost'],
    risks: ['FDA regulations on some products', 'Brand-conscious buyers', 'High return rates on skincare']
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    icon: '⚽',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Sports-Outdoors/zgbs/sporting-goods',
    marketSize: '$52.1B',
    cagr: '5.8%',
    subcategories: [
      { name: 'Exercise & Fitness Accessories', opportunity: 'high', avgMargin: 50, avgBSR: 2500, competition: 'moderate' },
      { name: 'Outdoor Recreation Accessories', opportunity: 'medium', avgMargin: 45, avgBSR: 4000, competition: 'moderate' },
      { name: 'Team Sports Accessories', opportunity: 'medium', avgMargin: 40, avgBSR: 5000, competition: 'high' },
      { name: 'Camping & Hiking Gear', opportunity: 'high', avgMargin: 48, avgBSR: 3000, competition: 'moderate' },
      { name: 'Water Sports', opportunity: 'low', avgMargin: 35, avgBSR: 8000, competition: 'high' }
    ],
    scores: { grossProfit: 7, procurementEase: 7, entryCost: 6, demandVolume: 8, competition: 6, dropship: 6 },
    composite: 6.8,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Fitness trend growing', 'Seasonal peaks (Q1 resolutions, summer)', 'Accessory niches less competitive'],
    risks: ['Heavier products = higher shipping', 'Seasonal demand swings', 'Safety liability concerns']
  },
  {
    id: 'tools-home-improvement',
    name: 'Tools & Home Improvement',
    icon: '🔧',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Home-Improvement/zgbs/hi',
    marketSize: '$48.3B',
    cagr: '4.8%',
    subcategories: [
      { name: 'Hand Tools', opportunity: 'medium', avgMargin: 45, avgBSR: 3000, competition: 'moderate' },
      { name: 'Power Tool Accessories', opportunity: 'high', avgMargin: 52, avgBSR: 2000, competition: 'moderate' },
      { name: 'Hardware', opportunity: 'medium', avgMargin: 40, avgBSR: 4000, competition: 'high' },
      { name: 'Bathroom Fixtures', opportunity: 'medium', avgMargin: 42, avgBSR: 5000, competition: 'moderate' },
      { name: 'Light Bulbs', opportunity: 'high', avgMargin: 48, avgBSR: 1500, competition: 'moderate' }
    ],
    scores: { grossProfit: 7, procurementEase: 7, entryCost: 6, demandVolume: 7, competition: 6, dropship: 5 },
    composite: 6.5,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['DIY trend growing', 'Less brand-sensitive accessories', 'Good bundle opportunities'],
    risks: ['Heavier items', 'Returns on precision items', 'Certification needed for some']
  },
  {
    id: 'office-products',
    name: 'Office Products',
    icon: '📎',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Office-Products/zgbs/office-products',
    marketSize: '$33.8B',
    cagr: '3.2%',
    subcategories: [
      { name: 'Desk Accessories & Organizers', opportunity: 'high', avgMargin: 55, avgBSR: 2000, competition: 'moderate' },
      { name: 'Office Supplies', opportunity: 'medium', avgMargin: 40, avgBSR: 3000, competition: 'high' },
      { name: 'Labels & Stickers', opportunity: 'high', avgMargin: 58, avgBSR: 1500, competition: 'low' },
      { name: 'Writing Instruments', opportunity: 'low', avgMargin: 35, avgBSR: 6000, competition: 'high' }
    ],
    scores: { grossProfit: 7, procurementEase: 8, entryCost: 8, demandVolume: 6, competition: 7, dropship: 8 },
    composite: 7.3,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Lightweight products', 'B2B bulk buyers', 'Low shipping cost', 'Year-round demand'],
    risks: ['Amazon Basics dominant', 'Lower price points', 'Slower growth category']
  },
  {
    id: 'baby-products',
    name: 'Baby Products',
    icon: '👶',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Baby/zgbs/baby-products',
    marketSize: '$67.3B',
    cagr: '5.5%',
    subcategories: [
      { name: 'Feeding Accessories', opportunity: 'medium', avgMargin: 45, avgBSR: 3000, competition: 'high' },
      { name: 'Bathing & Grooming', opportunity: 'high', avgMargin: 50, avgBSR: 2500, competition: 'moderate' },
      { name: 'Safety & Health', opportunity: 'low', avgMargin: 38, avgBSR: 5000, competition: 'high' },
      { name: 'Teething & Soothing', opportunity: 'high', avgMargin: 55, avgBSR: 2000, competition: 'moderate' }
    ],
    scores: { grossProfit: 7, procurementEase: 6, entryCost: 7, demandVolume: 7, competition: 5, dropship: 6 },
    composite: 6.4,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['High willingness to pay', 'Gift purchases', 'Strong repeat buying', 'Growing online share'],
    risks: ['Safety certifications required (CPSIA)', 'High quality expectations', 'Brand trust important']
  },
  {
    id: 'garden-outdoor',
    name: 'Patio, Lawn & Garden',
    icon: '🌿',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Garden-Outdoor/zgbs/lawn-garden',
    marketSize: '$42.1B',
    cagr: '4.2%',
    subcategories: [
      { name: 'Gardening Tools', opportunity: 'high', avgMargin: 50, avgBSR: 2500, competition: 'moderate' },
      { name: 'Planters & Pots', opportunity: 'medium', avgMargin: 42, avgBSR: 3500, competition: 'moderate' },
      { name: 'Outdoor Lighting', opportunity: 'high', avgMargin: 48, avgBSR: 2000, competition: 'moderate' },
      { name: 'Pest Control', opportunity: 'medium', avgMargin: 40, avgBSR: 4000, competition: 'high' }
    ],
    scores: { grossProfit: 7, procurementEase: 7, entryCost: 6, demandVolume: 7, competition: 6, dropship: 5 },
    composite: 6.5,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Strong spring/summer peak', 'Good niche depth', 'Low brand loyalty for accessories'],
    risks: ['Heavy seasonal demand', 'Bulky shipping for some items', 'Weather-dependent sales']
  },
  {
    id: 'automotive',
    name: 'Automotive Parts & Accessories',
    icon: '🚗',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Automotive/zgbs/automotive',
    marketSize: '$41.5B',
    cagr: '4.0%',
    subcategories: [
      { name: 'Interior Accessories', opportunity: 'high', avgMargin: 52, avgBSR: 2000, competition: 'moderate' },
      { name: 'Exterior Accessories', opportunity: 'medium', avgMargin: 45, avgBSR: 3000, competition: 'moderate' },
      { name: 'Car Care', opportunity: 'high', avgMargin: 50, avgBSR: 2500, competition: 'moderate' },
      { name: 'Electronics & Gadgets', opportunity: 'medium', avgMargin: 40, avgBSR: 4000, competition: 'high' }
    ],
    scores: { grossProfit: 7, procurementEase: 7, entryCost: 7, demandVolume: 7, competition: 6, dropship: 7 },
    composite: 6.9,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Universal accessories sell across models', 'Good margins', 'Less competitive than electronics'],
    risks: ['Fitment issues = returns', 'Technically complex products', 'Liability for safety items']
  },
  {
    id: 'arts-crafts',
    name: 'Arts, Crafts & Sewing',
    icon: '🎨',
    bsrUrl: 'https://www.amazon.com/Best-Sellers-Arts-Crafts-Sewing/zgbs/arts-crafts',
    marketSize: '$20.5B',
    cagr: '5.0%',
    subcategories: [
      { name: 'Craft Supplies', opportunity: 'high', avgMargin: 55, avgBSR: 2000, competition: 'low' },
      { name: 'Sewing Products', opportunity: 'medium', avgMargin: 48, avgBSR: 3000, competition: 'moderate' },
      { name: 'Painting Supplies', opportunity: 'medium', avgMargin: 45, avgBSR: 3500, competition: 'moderate' },
      { name: 'Beading & Jewelry Making', opportunity: 'high', avgMargin: 58, avgBSR: 1500, competition: 'low' }
    ],
    scores: { grossProfit: 8, procurementEase: 8, entryCost: 9, demandVolume: 6, competition: 8, dropship: 8 },
    composite: 7.8,
    status: 'opportunity',
    activeProducts: [],
    highlights: ['Very low entry cost', 'High margins', 'Less competition', 'Passionate buyers', 'Lightweight products'],
    risks: ['Smaller market size', 'Niche audience', 'Trend-dependent for some crafts']
  }
]

// Scoring criteria weights — aligned with product-selection-automation.md
export const scoringWeights = {
  grossProfit: { weight: 0.25, label: 'Gross Profit Potential', description: '(Selling Price - Landed Cost - Fees) × Volume' },
  procurementEase: { weight: 0.20, label: 'Procurement Ease', description: 'Supplier count, MOQ flexibility, sample availability' },
  entryCost: { weight: 0.15, label: 'Entry Cost', description: 'First order cash requirement (lower = better)' },
  demandVolume: { weight: 0.15, label: 'Demand Volume', description: 'Monthly search volume, BSR, unit velocity' },
  competition: { weight: 0.15, label: 'Competition (inverse)', description: 'Review count, listing age, brand dominance' },
  dropship: { weight: 0.10, label: 'Dropship Viability', description: 'Supplier ships direct, lightweight, low damage risk' }
}

// Validation phases — aligned with product-validation SKILL
export const validationPhases = [
  { id: 'demand', name: 'Demand Validation', agent: 'Market Research Agent', minScore: 6, icon: '📈', description: 'BSR analysis, search volume, Google Trends, seasonal patterns, review velocity' },
  { id: 'competition', name: 'Competition Analysis', agent: 'Competition Analysis Agent', minScore: 5, icon: '🏆', description: 'Top 10 listing audit, review depth, brand dominance, entry barriers' },
  { id: 'pricing', name: 'Pricing Viability', agent: 'Pricing Strategy Agent', minScore: 7, icon: '💰', description: 'Price analysis, fee structure, landed cost, margin scenarios, break-even' },
  { id: 'supply-chain', name: 'Supply Chain Check', agent: 'Amazon Seller Operator', minScore: 6, icon: '🚚', description: 'Supplier availability, MOQ, dropship, quality verification' },
  { id: 'risk', name: 'Risk Assessment', agent: 'Amazon Seller Operator', minScore: 6, icon: '⚠️', description: 'Demand volatility, competition, margin pressure, compliance, seasonality' }
]

// Pass/Fail criteria for investor display
export const validationCriteria = {
  overallThreshold: 35,
  maxScore: 50,
  minConfidence: 75,
  minGrossMargin: 35,
  minContributionMargin: 18,
  maxBudgetExposure: 0.3  // First order < 30% of total budget
}
