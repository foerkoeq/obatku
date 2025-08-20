# APPROVAL WORKFLOW MODULE DOCUMENTATION

## Overview

Modul Approval Workflow menyediakan sistem persetujuan yang komprehensif untuk pengajuan obat pertanian dengan fitur rekomendasi cerdas berdasarkan OPT (Organisme Pengganggu Tumbuhan) dan luas lahan terserang.

## Key Features

### 🎯 Smart Recommendation System
- **OPT-Based Matching**: Pencocokan obat berdasarkan jenis hama/penyakit
- **Quantity Optimization**: Perhitungan jumlah optimal berdasarkan luas lahan terserang
- **Stock Intelligence**: Rekomendasi berdasarkan ketersediaan stok real-time
- **Alternative Suggestions**: Saran obat alternatif jika stok tidak mencukupi
- **Risk Assessment**: Penilaian risiko otomatis untuk setiap persetujuan

### 🔄 Approval Workflow
- **Multi-level Approval**: Sistem persetujuan bertingkat
- **Partial Approval**: Persetujuan sebagian dengan penyesuaian kuantitas
- **Bulk Operations**: Operasi massal untuk efisiensi
- **Assignment System**: Penugasan approval ke petugas tertentu
- **Priority Management**: Manajemen prioritas berdasarkan urgensi

### 📊 Analytics & Reporting
- **Real-time Statistics**: Statistik approval real-time
- **Performance Metrics**: Metrik kinerja approval
- **History Tracking**: Pelacakan riwayat lengkap
- **Risk Analytics**: Analisis risiko dan tren

## Architecture

```
approvals/
├── approvals.types.ts          # Type definitions
├── approvals.validation.ts     # Input validation schemas
├── approvals.repository.ts     # Data access layer
├── recommendation.engine.ts    # Smart recommendation engine
├── approvals.service.ts        # Business logic layer
├── approvals.controller.ts     # API controllers
├── approvals.routes.ts         # Route definitions
├── approvals.test.ts          # Unit tests
└── index.ts                   # Module entry point
```

## API Endpoints

### Approval Queue
```typescript
GET /api/approvals
// Get approval queue with filtering
Query Parameters:
- status: 'pending' | 'in_review' | 'approved' | 'rejected'
- priority: 'low' | 'medium' | 'high' | 'urgent'
- district: string
- assignedTo: string (user ID)
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sortBy: 'createdAt' | 'priority' | 'estimatedValue' | 'daysWaiting'
- sortOrder: 'asc' | 'desc'
```

### Smart Recommendations
```typescript
GET /api/approvals/recommendations/:submissionId
// Get AI-powered recommendations
Query Parameters:
- includeAlternatives: boolean (default: true)
- maxAlternatives: number (default: 3, max: 10)
- riskTolerance: 'low' | 'medium' | 'high'
```

### Approval Actions
```typescript
POST /api/approvals/:submissionId/approve
// Process approval decision
Body: {
  action: 'approve' | 'reject' | 'partial_approve' | 'request_revision',
  notes?: string,
  approvedItems?: [
    {
      submissionItemId: string,
      approvedQuantity: number,
      selectedMedicineId?: string,
      notes?: string
    }
  ],
  rejectionReason?: string,
  requestedRevisions?: string[],
  estimatedDeliveryDate?: string
}
```

## Usage Examples

### 1. Getting Approval Queue

```typescript
// Get pending approvals with high priority
const response = await fetch('/api/approvals?status=pending&priority=high&sortBy=daysWaiting&sortOrder=desc');
const result = await response.json();

if (result.success) {
  console.log('Pending approvals:', result.data.approvals);
  console.log('Summary:', result.data.summary);
}
```

### 2. Getting Smart Recommendations

```typescript
// Get recommendations for a submission
const submissionId = 'submission-123';
const response = await fetch(`/api/approvals/recommendations/${submissionId}?includeAlternatives=true&maxAlternatives=3`);
const result = await response.json();

if (result.success) {
  const recommendations = result.data;
  
  // Display recommended items
  recommendations.recommendedItems.forEach(item => {
    console.log(`Medicine: ${item.optimalChoice.brandName}`);
    console.log(`Recommended Quantity: ${item.optimalChoice.recommendedQuantity} ${item.optimalChoice.unit}`);
    console.log(`Effectiveness Score: ${item.optimalChoice.effectivenessScore}%`);
    console.log(`Total Cost: Rp ${item.optimalChoice.totalCost.toLocaleString()}`);
  });
  
  // Check risk assessment
  if (recommendations.riskAssessment.overallRisk === 'high') {
    console.log('High risk detected:', recommendations.riskAssessment.warnings);
  }
}
```

### 3. Processing Approval

```typescript
// Approve submission with modified quantities
const submissionId = 'submission-123';
const approvalData = {
  action: 'partial_approve',
  notes: 'Approved with stock availability considerations',
  approvedItems: [
    {
      submissionItemId: 'item-1',
      approvedQuantity: 8, // Less than requested due to stock
      selectedMedicineId: 'alt-medicine-1', // Alternative medicine
      notes: 'Using alternative medicine due to better availability'
    }
  ],
  estimatedDeliveryDate: '2025-08-01'
};

const response = await fetch(`/api/approvals/${submissionId}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(approvalData)
});

const result = await response.json();
if (result.success) {
  console.log('Approval processed:', result.message);
}
```

### 4. Bulk Operations

```typescript
// Bulk approve multiple submissions
const bulkData = {
  submissionIds: ['sub-1', 'sub-2', 'sub-3'],
  action: 'approve',
  notes: 'Bulk approval for urgent pest outbreak response'
};

const response = await fetch('/api/approvals/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bulkData)
});

const result = await response.json();
console.log(`Bulk operation: ${result.data.summary.successful} successful, ${result.data.summary.failed} failed`);
```

## Recommendation Engine Details

### OPT-Medicine Matching Algorithm

```typescript
// Effectiveness scoring algorithm
const effectivenessScore = calculateEffectivenessScore(
  medicineTargets: string[],    // Target pests from medicine data
  requestedPests: string[],     // Pests from submission
  medicineCategory: string      // insektisida, fungisida, etc.
);

// Example:
// Medicine targets: ['ulat', 'wereng', 'kutu']
// Requested pests: ['ulat grayak', 'wereng hijau']
// Result: 90% effectiveness (2/2 matches with high compatibility)
```

### Quantity Calculation

```typescript
// Optimal quantity calculation
const calculateOptimalQuantity = (
  requestedQuantity: number,
  affectedArea: number,        // hectares
  medicineCategory: string,    // determines base application rate
  pestTypes: string[]          // affects intensity factor
) => {
  const baseRate = getBaseRate(medicineCategory);     // L/ha
  const intensityFactor = getIntensityFactor(pestTypes); // 1.0-1.5
  const wasteFactor = 1.1;     // 10% waste allowance
  
  return affectedArea * baseRate * intensityFactor * wasteFactor;
};

// Base rates per hectare:
// - Insektisida: 1.5 L/ha
// - Fungisida: 2.0 L/ha  
// - Herbisida: 3.0 L/ha
// - Bakterisida: 1.0 L/ha
```

### Risk Assessment Matrix

```typescript
// Multi-factor risk assessment
const assessRisk = (submission, recommendedItems) => {
  const stockRisk = calculateStockRisk(recommendedItems);
  const expiryRisk = calculateExpiryRisk(recommendedItems);
  const effectivenessRisk = calculateEffectivenessRisk(recommendedItems);
  
  const overallRisk = (stockRisk + expiryRisk + effectivenessRisk) / 3;
  
  return {
    stockRisk,      // Based on availability vs demand
    expiryRisk,     // Based on expiry dates
    effectivenessRisk, // Based on pest-medicine compatibility
    overallRisk,    // Weighted average
    warnings: [],   // Generated warnings
    recommendations: [] // Suggested actions
  };
};
```

## Integration with Frontend

### Modal Approval Component

```typescript
// Example frontend integration
const ApprovalModal = ({ submissionId }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  useEffect(() => {
    // Get recommendations when modal opens
    fetchRecommendations(submissionId).then(setRecommendations);
  }, [submissionId]);
  
  const handleApprove = async () => {
    const approvalData = {
      action: 'approve',
      approvedItems: selectedItems.map(item => ({
        submissionItemId: item.id,
        approvedQuantity: item.approvedQuantity,
        selectedMedicineId: item.selectedMedicineId,
        notes: item.notes
      }))
    };
    
    await processApproval(submissionId, approvalData);
  };
  
  return (
    <Modal>
      {recommendations && (
        <div>
          <h3>Smart Recommendations</h3>
          {recommendations.recommendedItems.map(item => (
            <RecommendationCard 
              key={item.submissionItemId}
              item={item}
              onSelect={handleItemSelect}
            />
          ))}
          
          <RiskAssessment assessment={recommendations.riskAssessment} />
          
          <div className="approval-actions">
            <button onClick={handleApprove}>Approve Selected</button>
            <button onClick={handleReject}>Reject</button>
          </div>
        </div>
      )}
    </Modal>
  );
};
```

## Performance Considerations

### Database Optimization
- Indexed fields: `status`, `priority`, `district`, `created_at`
- Paginated queries to prevent large data loads
- Efficient joins with selective field loading

### Caching Strategy
- Cache recommendation calculations for 15 minutes
- Cache medicine compatibility data for 1 hour
- Cache statistics for 5 minutes

### Background Processing
- Stock availability checks run async
- Risk assessments calculated in background
- Notifications sent via message queue

## Security & Permissions

### Role-Based Access
- **Dinas**: Full approval permissions
- **Admin**: All permissions + bulk operations
- **Supervisor**: Read-only + statistics access
- **PPL**: No approval access (submission only)

### Audit Trail
- All approval actions logged with user ID, timestamp, IP
- Changes tracked in `activity_logs` table
- Approval history maintained indefinitely

## Error Handling

### Common Error Scenarios
1. **Insufficient Stock**: Automatic alternative suggestions
2. **Expired Medicines**: Warning with fresh stock recommendations
3. **Invalid Quantities**: Real-time validation with helpful messages
4. **Permission Denied**: Clear error messages with required role info
5. **Concurrent Modifications**: Optimistic locking with conflict resolution

### Error Response Format
```typescript
{
  success: false,
  message: "User-friendly error description",
  errors: [
    {
      field: "approvedQuantity",
      message: "Approved quantity exceeds available stock"
    }
  ],
  code: "INSUFFICIENT_STOCK",
  details: {
    availableStock: 15,
    requestedQuantity: 20
  }
}
```

## Testing

### Unit Tests
- Service layer business logic
- Recommendation engine algorithms
- Validation schemas
- Repository data access

### Integration Tests
- End-to-end approval workflows
- Database transactions
- External service interactions

### Performance Tests
- Load testing with concurrent approvals
- Database query performance
- Recommendation engine speed

## Monitoring & Metrics

### Key Metrics
- Average approval processing time
- Approval success rate
- Recommendation accuracy
- System availability
- Error rates by type

### Alerts
- High pending approval queue
- System errors > 5%
- Long processing times > 24 hours
- Low stock warnings
- Expiry date alerts

## Future Enhancements

### Planned Features
1. **ML-Powered Recommendations**: Machine learning for better predictions
2. **Mobile Notifications**: Push notifications for urgent approvals
3. **Workflow Automation**: Auto-approval for low-risk submissions
4. **Advanced Analytics**: Predictive analytics for demand forecasting
5. **Integration APIs**: Third-party system integrations

### Technical Improvements
1. **Microservices**: Split into dedicated recommendation service
2. **Event Sourcing**: Event-driven architecture for better scalability
3. **GraphQL**: Flexible API for complex frontend requirements
4. **Real-time Updates**: WebSocket for live approval status updates
