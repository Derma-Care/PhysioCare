export const suppliers = [
  {
    supplierId: 'SUP001',
    supplierName: 'ABC Pharma',
    email: 'abc@gmail.com',
    mobile: '9876543210',
  },
  {
    supplierId: 'SUP002',
    supplierName: 'XYZ Pharma',
    email: 'xyz@gmail.com',
    mobile: '9123456780',
  },
]

export const dummyMedicines = [
  {
    id: '69ba7e4ffdee1c3cf054c0e45',
    barcode: 'BC30043806',
    productName: 'sephora',
    brandName: 'louis ',
    category: 'Injection',
    composition: '400mg',
    manufacturer: 'ght',
    packSize: '10 strip',
    hsnCode: '3004',
    gstPercent: 12.0,
    mrp: 220.0,
    minStock: 4.0,
    status: 'INACTIVE',
    clinicId: '0002',
    branchId: '000201',
    createdAt: '2026-03-04T11:39:23.806',
  },
  {
    id: '69b143a040bee375d1c27d98',
    barcode: 'BC30044832',
    productName: 'Lakme',
    brandName: 'Himalaya',
    category: 'Tablet',
    composition: '200mg',
    manufacturer: 'Himalaya Manufacturers',
    packSize: '10 Tablets',
    hsnCode: '3004',
    gstPercent: 12.0,
    mrp: 450.0,
    minStock: 8.0,
    status: 'ACTIVE',
    clinicId: '0002',
    branchId: '000201',
    createdAt: '2026-03-11T10:27:44.832',
  },
  {
    id: '69b143a040bee375d1c27d99',
    barcode: 'BC30044832',
    productName: 'Lakme',
    brandName: 'Himalaya',
    category: 'Tablet',
    composition: '200mg',
    manufacturer: 'Himalaya Manufacturers',
    packSize: '10 Tablets',
    hsnCode: '3004',
    gstPercent: 12.0,
    mrp: 450.0,
    minStock: 8.0,
    status: 'ACTIVE',
    clinicId: '0002',
    branchId: '000201',
    createdAt: '2026-03-11T10:27:44.832',
  },
]

// ✅ patient data

export const dummyPatients = {
  101: {
    name: 'Ravi Kumar',
    mobilenumber: '9876543210',
    age: 35,
    sex: 'Male',
    consultingDoctor: 'Dr. Ramesh Kumar',
    doctorId: '',
    patientId: '',
    customerId: '',
    medicines: ['69ba7e4ffdee1c3cf054c0e3'],
  },

  102: {
    name: 'Sita Devi',
    mobilenumber: '9999999999',
    age: 28,
    sex: 'Female',
    doctorId: '',
    patientId: '',
    customerId: '',
    consultingDoctor: 'Dr. Priya Sharma',
    medicines: ['69ba7e4ffdee1c3cf054c0e3'],
  },
}

export const dummyOrders = {
  ORD1001: [
    {
      productId: '69a81',
      productName: 'Sephora',
      composition: '400mg',
      hsnCode: '3004',
      packSize: '10x10',
      gstPercent: 12,
      category: 'Tablet',
      mrp: '120',
    },
    {
      productId: '77b92',
      productName: 'Paracetamol',
      composition: '500mg',
      hsnCode: '3004',
      packSize: '10x10',
      gstPercent: 5,
      category: 'Tablet',
      mrp: '160',
    },
  ],

  ORD1002: [
    {
      productId: '88c23',
      productName: 'Amoxicillin',
      composition: '250mg',
      hsnCode: '3004',
      packSize: '6x10',
      gstPercent: 12,
      category: 'Capsule',
      mrp: '180',
    },
  ],
}

export const supplierUsers = [
  {
    supplierId: 'SUP001',
    username: 'abc',
    password: '1234',
  },
  {
    supplierId: 'SUP002',
    username: 'xyz',
    password: '1234',
  },
  {
    supplierId: 'SUP003',
    username: 'health',
    password: '1234',
  },
]

export const ordersData = [
  {
    orderId: 'RO-CLN001-2026-00075',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR001',
      branchName: 'Chennai Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'ABC Pharma',
      supplierEmail: 'abcpharma@gmail.com',
    },
    expectedDeliveryDays: 5,
    expectedDeliveryDate: '2026-03-02',

    overallStatus: 'PENDING',
    overallReason: 'Some medicines not available at supplier',

    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-07T10:30:25Z',
      },
    ],

    products: [
      {
        productId: 'PROD101',
        productName: 'Paracetamol 500mg',
        hsnCode: '30049099',
        packSize: '10 Tablets',
        quantityRequested: 50,
        status: 'PENDING',
        rejectionReason: null,
      },
      {
        productId: 'PROD102',
        productName: 'Amoxicillin 250mg',
        hsnCode: '30042011',
        packSize: '6 Capsules',
        quantityRequested: 30,
        status: 'REJECT',
        rejectionReason: 'Out of stock at supplier',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-24T10:15:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-24T12:00:00',
  },
  {
    orderId: 'RO-CLN001-2026-00076',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR001',
      branchName: 'Chennai Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'ABC Pharma',
      supplierEmail: 'abcpharma@gmail.com',
    },
    expectedDeliveryDays: 5,
    expectedDeliveryDate: '2026-03-02',

    overallStatus: 'PARTIAL_ACCEPT',
    overallReason: 'Some medicines not available at supplier',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        timestamp: '2026-03-08T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD101',
        productName: 'Paracetamol 500mg',
        hsnCode: '30049099',
        packSize: '10 Tablets',
        quantityRequested: 50,
        status: 'PENDING',
        rejectionReason: null,
      },
      {
        productId: 'PROD102',
        productName: 'Amoxicillin 250mg',
        hsnCode: '30042011',
        packSize: '6 Capsules',
        quantityRequested: 30,
        status: 'REJECT',
        rejectionReason: 'Out of stock at supplier',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-24T10:15:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-24T12:00:00',
  },
  {
    orderId: 'RO-CLN001-2026-00077',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR001',
      branchName: 'Chennai Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'ABC Pharma',
      supplierEmail: 'abcpharma@gmail.com',
    },
    expectedDeliveryDays: 5,
    expectedDeliveryDate: '2026-03-02',

    overallStatus: 'DISPATCHED',
    overallReason: 'Null',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        status: 'ACCEPT',
        timestamp: '2026-03-09T10:30:25Z',
      },

      {
        status: 'DISPATCHED',
        timestamp: '2026-03-05T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD101',
        productName: 'Paracetamol 500mg',
        hsnCode: '30049099',
        packSize: '10 Tablets',
        quantityRequested: 50,
        status: 'PENDING',
        rejectionReason: null,
      },
      {
        productId: 'PROD102',
        productName: 'Amoxicillin 250mg',
        hsnCode: '30042011',
        packSize: '6 Capsules',
        quantityRequested: 30,
        status: 'REJECT',
        rejectionReason: 'Out of stock at supplier',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-24T10:15:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-24T12:00:00',
  },
  {
    orderId: 'RO-CLN001-2026-00079',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR001',
      branchName: 'Chennai Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'ABC Pharma',
      supplierEmail: 'abcpharma@gmail.com',
    },
    expectedDeliveryDays: 5,
    expectedDeliveryDate: '2026-03-02',

    overallStatus: 'REJECT',
    overallReason: 'Some medicines not available at supplier',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },

      {
        status: 'REJECT',
        timestamp: '2026-03-05T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD101',
        productName: 'Paracetamol 500mg',
        hsnCode: '30049099',
        packSize: '10 Tablets',
        quantityRequested: 50,
        status: 'PENDING',
        rejectionReason: null,
      },
      {
        productId: 'PROD102',
        productName: 'Amoxicillin 250mg',
        hsnCode: '30042011',
        packSize: '6 Capsules',
        quantityRequested: 30,
        status: 'REJECT',
        rejectionReason: 'Out of stock at supplier',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-24T10:15:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-24T12:00:00',
  },
  {
    orderId: 'RO-CLN001-2026-00080',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR001',
      branchName: 'Chennai Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'ABC Pharma',
      supplierEmail: 'abcpharma@gmail.com',
    },
    expectedDeliveryDays: 5,
    expectedDeliveryDate: '2026-03-02',

    overallStatus: 'PLACED',
    overallReason: 'Some medicines not available at supplier',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        status: 'ACCEPT',
        timestamp: '2026-03-10T10:30:25Z',
      },

      {
        status: 'DISPATCHED',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        status: 'PLACED',
        timestamp: '2026-02-05T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD101',
        productName: 'Paracetamol 500mg',
        hsnCode: '30049099',
        packSize: '10 Tablets',
        quantityRequested: 50,
        status: 'PENDING',
        rejectionReason: null,
      },
      {
        productId: 'PROD102',
        productName: 'Amoxicillin 250mg',
        hsnCode: '30042011',
        packSize: '6 Capsules',
        quantityRequested: 30,
        status: 'REJECT',
        rejectionReason: 'Out of stock at supplier',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-24T10:15:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-24T12:00:00',
  },

  {
    orderId: 'RO-CLN001-2026-00082',
    clinic: {
      clinicId: 'CLN001',
      clinicName: 'Cams Clinic',
    },
    branch: {
      branchId: 'BR002',
      branchName: 'Coimbatore Branch',
    },
    supplier: {
      supplierId: 'SUP-1C51033E',
      supplierName: 'XYZ Pharma',
      supplierEmail: 'xyzpharma@gmail.com',
    },
    expectedDeliveryDays: 3,
    expectedDeliveryDate: '2026-03-01',

    overallStatus: 'ACCEPT',
    overallReason: null,
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        status: 'ACCEPT',
        timestamp: '2026-03-12T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD103',
        productName: 'Azithromycin 500mg',
        hsnCode: '30042012',
        packSize: '3 Tablets',
        quantityRequested: 20,
        status: 'ACCEPT',
        rejectionReason: null,
      },
      {
        productId: 'PROD104',
        productName: 'Cough Syrup 100ml',
        hsnCode: '30049011',
        packSize: 'Bottle',
        quantityRequested: 15,
        status: 'ACCEPT',
        rejectionReason: null,
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-23T09:30:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-23T11:00:00',
  },

  {
    orderId: 'RO-CLN002-2026-00080',
    clinic: {
      clinicId: 'CLN002',
      clinicName: 'City Care Clinic',
    },
    branch: {
      branchId: 'BR003',
      branchName: 'Madurai Branch',
    },
    supplier: {
      supplierId: 'SUP003',
      supplierName: 'HealthPlus Pharma',
      supplierEmail: 'healthplus@gmail.com',
    },
    expectedDeliveryDays: 7,
    expectedDeliveryDate: '2026-03-05',

    overallStatus: 'REJECT',
    overallReason: 'All medicines discontinued',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-05T10:30:25Z',
      },
      {
        status: 'REJECT',
        timestamp: '2026-02-06T10:30:25Z',
      },
    ],
    products: [
      {
        productId: 'PROD105',
        productName: 'Vitamin D Capsules',
        hsnCode: '30045010',
        packSize: '10 Capsules',
        quantityRequested: 40,
        status: 'REJECT',
        rejectionReason: 'Discontinued by manufacturer',
      },
      {
        productId: 'PROD106',
        productName: 'Insulin Injection',
        hsnCode: '30043100',
        packSize: 'Vial',
        quantityRequested: 10,
        status: 'REJECT',
        rejectionReason: 'Stock unavailable',
      },
    ],

    createdBy: 'admin',
    createdAt: '2026-02-22T08:00:00',
    updatedBy: 'manager',
    updatedAt: '2026-02-22T10:15:00',
  },
]
