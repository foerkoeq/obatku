# SUBMISSION MODULE DATABASE MIGRATION

## Overview
This migration adds support for enhanced submission system with both PPL and POPT submission types.

## Changes Made

### 1. Schema Updates
- Made `letterNumber`, `letterDate`, and `letterFileUrl` optional (nullable)
- Added POPT-specific fields:
  - `activityType` (POPTActivityType enum)
  - `urgencyReason` (TEXT)
  - `requestedBy` (VARCHAR)
  - `activityDate` (DATETIME)
- Added new enum values:
  - SubmissionStatus: `CANCELLED`, `EXPIRED`
  - POPTActivityType: `PEST_CONTROL`, `SURVEILLANCE`, `EMERGENCY_RESPONSE`, `TRAINING_DEMO`, `FIELD_INSPECTION`

### 2. Migration Steps

#### Step 1: Generate Migration
```bash
cd backend
npx prisma migrate dev --name add-popt-submission-support
```

#### Step 2: Update Existing Data (if any)
Run this SQL to ensure existing submissions have valid data:

```sql
-- Update existing submissions to have default values for new fields
UPDATE submissions 
SET 
  letter_number = COALESCE(letter_number, 'MIGRATED-' + submission_number),
  letter_date = COALESCE(letter_date, created_at),
  letter_file_url = COALESCE(letter_file_url, '')
WHERE letter_number IS NULL OR letter_date IS NULL OR letter_file_url IS NULL;
```

#### Step 3: Verify Migration
```bash
npx prisma db push
npx prisma generate
```

### 3. Rollback Plan (if needed)
```sql
-- Remove new columns (WARNING: Data loss)
ALTER TABLE submissions 
DROP COLUMN activity_type,
DROP COLUMN urgency_reason,
DROP COLUMN requested_by,
DROP COLUMN activity_date;

-- Remove new enum values
-- Note: This requires recreating the enum with old values only
```

### 4. Testing Migration
```sql
-- Test PPL submission (should work as before)
INSERT INTO submissions (
  id, submission_number, district, village, farmer_group, group_leader,
  commodity, total_area, affected_area, pest_types,
  letter_number, letter_date, letter_file_url,
  status, priority, submitter_id
) VALUES (
  'test-ppl-1', 'SUB240001', 'Test District', 'Test Village', 'Test Group',
  'Test Leader', 'Rice', 10.5, 5.0, '["brown planthopper"]',
  'LTR/001/2024', '2024-01-15', '/uploads/test.pdf',
  'PENDING', 'MEDIUM', 'user-ppl-1'
);

-- Test POPT submission (new functionality)
INSERT INTO submissions (
  id, submission_number, district, village, farmer_group, group_leader,
  commodity, total_area, affected_area, pest_types,
  activity_type, urgency_reason, requested_by, activity_date,
  status, priority, submitter_id
) VALUES (
  'test-popt-1', 'SUB240002', 'Test District 2', 'Test Village 2', 'Test Group 2',
  'Test Leader 2', 'Corn', 15.0, 8.0, '["armyworm"]',
  'PEST_CONTROL', 'Emergency outbreak detected', 'Head of Agriculture', '2024-02-01',
  'PENDING', 'HIGH', 'user-popt-1'
);
```

### 5. Data Validation Queries
```sql
-- Check submission type distribution
SELECT 
  CASE 
    WHEN letter_number IS NOT NULL AND letter_date IS NOT NULL THEN 'PPL_REGULAR'
    WHEN activity_type = 'EMERGENCY_RESPONSE' OR activity_type = 'PEST_CONTROL' THEN 'POPT_EMERGENCY'
    WHEN activity_type IS NOT NULL THEN 'POPT_SCHEDULED'
    ELSE 'UNKNOWN'
  END as submission_type,
  COUNT(*) as count
FROM submissions
GROUP BY submission_type;

-- Check data integrity
SELECT 
  id, submission_number,
  CASE 
    WHEN letter_number IS NOT NULL AND (activity_type IS NOT NULL OR urgency_reason IS NOT NULL) THEN 'HYBRID_ERROR'
    WHEN letter_number IS NULL AND activity_type IS NULL THEN 'MISSING_TYPE_INFO'
    ELSE 'OK'
  END as data_status
FROM submissions
WHERE data_status != 'OK';
```

### 6. Performance Impact
- New indexes may be needed:
```sql
CREATE INDEX idx_submissions_activity_type ON submissions(activity_type);
CREATE INDEX idx_submissions_activity_date ON submissions(activity_date);
CREATE INDEX idx_submissions_type_status ON submissions(
  CASE 
    WHEN letter_number IS NOT NULL THEN 'PPL' 
    ELSE 'POPT' 
  END, 
  status
);
```

### 7. Application Code Changes Required
- Update all submission creation logic to handle new fields
- Update validation schemas
- Update API responses to include new fields
- Update frontend forms and displays
- Update report generation

### 8. Backward Compatibility
- Existing PPL submission workflow unchanged
- All existing API endpoints remain functional
- New fields are optional, won't break existing clients
- Database queries remain compatible

## Post-Migration Tasks

1. **Update API Documentation**
   - Add new endpoints for POPT submissions
   - Update request/response examples
   - Document new validation rules

2. **Update Frontend**
   - Add POPT submission forms
   - Update submission listing to show type
   - Add filtering by submission type

3. **Update Tests**
   - Add tests for POPT submission flows
   - Update existing tests to handle optional fields
   - Add integration tests for mixed submission types

4. **Update Monitoring**
   - Add metrics for submission types
   - Monitor approval times by type
   - Track POPT vs PPL usage patterns

## Risk Assessment

**Low Risk:**
- Schema changes are additive
- Existing functionality preserved
- Rollback plan available

**Medium Risk:**
- Application code needs updates
- Users need training on new features

**Mitigation:**
- Thorough testing in staging
- Gradual rollout if possible
- Clear documentation for users

## Success Criteria

✅ **Technical:**
- Migration completes without errors
- All existing submissions remain accessible
- New POPT submissions can be created
- API tests pass

✅ **Functional:**
- PPL users can create submissions as before
- POPT users can create emergency and scheduled submissions
- DINAS users can approve all submission types
- Proper access control enforced

✅ **Performance:**
- No degradation in submission listing performance
- Search and filtering work with new fields
- Statistics calculation includes new types
