import { PrismaClient } from '@prisma/client';
import {
  ApprovalRecommendation,
  MedicineRecommendation,
  RecommendedItem,
  QuantityCalculation,
  AlternativeSuggestion,
  RiskAssessment
} from './approvals.types';

// ============================================================================
// RECOMMENDATION ENGINE - SMART MEDICINE RECOMMENDATION SYSTEM
// ============================================================================

export class RecommendationEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate comprehensive recommendations for submission approval
   */
  async generateRecommendations(
    submissionId: string,
    options: {
      includeAlternatives?: boolean;
      maxAlternatives?: number;
      riskTolerance?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ApprovalRecommendation> {
    const {
      includeAlternatives = true,
      maxAlternatives = 3,
      riskTolerance = 'medium'
    } = options;

    // Get submission with all related data
    const submission = await this.getSubmissionWithDetails(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const recommendedItems: RecommendedItem[] = [];
    const alternativeSuggestions: AlternativeSuggestion[] = [];
    let totalEstimatedCost = 0;

    // Process each requested item
    for (const submissionItem of submission.items) {
      const itemRecommendation = await this.generateItemRecommendation(
        submissionItem,
        submission,
        { includeAlternatives, maxAlternatives, riskTolerance }
      );

      recommendedItems.push(itemRecommendation);
      totalEstimatedCost += itemRecommendation.optimalChoice.totalCost;

      // Check for alternatives if stock is insufficient
      if (itemRecommendation.optimalChoice.availableStock < Number(submissionItem.requestedQuantity)) {
        const alternatives = await this.findAlternativeMedicines(
          submissionItem.medicineId,
          submission.pestTypes as string[],
          Number(submissionItem.requestedQuantity),
          maxAlternatives
        );

        if (alternatives.length > 0) {
          alternativeSuggestions.push({
            originalMedicineId: submissionItem.medicineId,
            alternatives,
            reason: 'insufficient_quantity',
            priority: 1
          });
        }
      }
    }

    // Determine availability status
    const availabilityStatus = this.determineAvailabilityStatus(recommendedItems);

    // Generate risk assessment
    const riskAssessment = await this.generateRiskAssessment(
      recommendedItems
    );

    return {
      submissionId,
      recommendedItems,
      totalEstimatedCost,
      availabilityStatus,
      alternativeSuggestions,
      riskAssessment
    };
  }

  /**
   * Generate recommendation for a single submission item
   */
  private async generateItemRecommendation(
    submissionItem: any,
    submission: any,
    options: any
  ): Promise<RecommendedItem> {
    const pestTypes = submission.pestTypes as string[];
    const affectedArea = Number(submission.affectedArea);

    // Get all available medicine options for this item
    const medicineOptions = await this.getMedicineOptions(
      submissionItem.medicineId,
      pestTypes,
      options.includeAlternatives
    );

    // Calculate quantity requirements
    const quantityCalculation = this.calculateOptimalQuantity(
      affectedArea,
      submissionItem.medicine.category,
      pestTypes
    );

    // Score and rank medicine options
    const scoredOptions = await Promise.all(
      medicineOptions.map(option => this.scoreMedicineOption(
        option,
        pestTypes,
        quantityCalculation.calculatedQuantity,
        submissionItem.unit
      ))
    );

    // Sort by effectiveness and availability
    scoredOptions.sort((a, b) => {
      const scoreA = a.effectivenessScore * 0.6 + a.compatibilityScore * 0.4;
      const scoreB = b.effectivenessScore * 0.6 + b.compatibilityScore * 0.4;
      return scoreB - scoreA;
    });

    const optimalChoice = scoredOptions[0] || this.createFallbackRecommendation(submissionItem);

    return {
      submissionItemId: submissionItem.id,
      requestedMedicineId: submissionItem.medicineId,
      requestedQuantity: Number(submissionItem.requestedQuantity),
      recommendedOptions: scoredOptions.slice(0, options.maxAlternatives + 1),
      optimalChoice,
      quantityCalculation
    };
  }

  /**
   * Get medicine options including stock information
   */
  private async getMedicineOptions(
    medicineId: string,
    pestTypes: string[],
    includeAlternatives: boolean = true
  ) {
    const baseQuery = {
      include: {
        stocks: {
          where: {
            currentStock: { gt: 0 },
            expiryDate: { gte: new Date() }
          },
          orderBy: { expiryDate: 'asc' as const }
        }
      }
    };

    // Primary medicine
    const primaryMedicine = await this.prisma.medicine.findUnique({
      where: { id: medicineId },
      ...baseQuery
    });

    const medicines = primaryMedicine ? [primaryMedicine] : [];

    // Alternative medicines if requested
    if (includeAlternatives && pestTypes.length > 0) {
      const alternatives = await this.prisma.medicine.findMany({
        where: {
          id: { not: medicineId },
          status: 'ACTIVE',
          pestTypes: {
            path: '$',
            array_contains: pestTypes
          }
        },
        ...baseQuery,
        take: 5 // Limit alternatives
      });

      medicines.push(...alternatives);
    }

    return medicines;
  }

  /**
   * Calculate optimal quantity based on affected area and pest severity
   */
  private calculateOptimalQuantity(
    affectedArea: number,
    medicineCategory: string,
    pestTypes: string[]
  ): QuantityCalculation {
    // Base application rates per hectare by medicine type
    const baseRates: Record<string, number> = {
      'insektisida': 1.5, // liters per hectare
      'fungisida': 2.0,
      'herbisida': 3.0,
      'bakterisida': 1.0,
      'akarisida': 1.5
    };

    const baseRate = baseRates[medicineCategory.toLowerCase()] || 2.0;

    // Intensity factor based on pest severity
    let intensityFactor = 1.0;
    if (pestTypes.some(pest => pest.includes('parah') || pest.includes('berat'))) {
      intensityFactor = 1.5;
    } else if (pestTypes.some(pest => pest.includes('sedang'))) {
      intensityFactor = 1.2;
    }

    // Waste factor (standard 10% extra)
    const wasteFactor = 1.1;

    const calculatedQuantity = affectedArea * baseRate * intensityFactor * wasteFactor;
    const roundedQuantity = Math.ceil(calculatedQuantity * 4) / 4; // Round to nearest 0.25

    return {
      affectedArea,
      baseApplicationRate: baseRate,
      intensityFactor,
      wasteFactor,
      calculatedQuantity,
      roundedQuantity,
      unit: 'liter',
      calculationNotes: `Based on ${affectedArea} ha affected area, ${baseRate}L/ha application rate, ${intensityFactor}x intensity factor, and ${wasteFactor}x waste factor`
    };
  }

  /**
   * Score medicine option based on effectiveness and compatibility
   */
  private async scoreMedicineOption(
    medicine: any,
    pestTypes: string[],
    requiredQuantity: number,
    unit: string
  ): Promise<MedicineRecommendation> {
    const availableStock = medicine.stocks.reduce(
      (sum: number, stock: any) => sum + Number(stock.currentStock), 0
    );

    // Calculate effectiveness score based on pest compatibility
    const effectivenessScore = this.calculateEffectivenessScore(
      medicine.pestTypes as string[],
      pestTypes,
      medicine.category
    );

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(
      medicine.pestTypes as string[],
      pestTypes
    );

    // Get best stock (earliest expiry with sufficient quantity)
    const bestStock = medicine.stocks[0] || {
      id: 'no-stock',
      currentStock: 0,
      expiryDate: new Date(),
      batchNumber: 'N/A',
      supplier: 'N/A'
    };

    const recommendedQuantity = Math.min(requiredQuantity, availableStock);
    const maxRecommendedQuantity = availableStock;

    return {
      medicineId: medicine.id,
      stockId: bestStock.id,
      brandName: medicine.name,
      activeIngredient: medicine.activeIngredient || 'Unknown',
      concentration: 'Standard', // Default concentration
      availableStock,
      recommendedQuantity,
      maxRecommendedQuantity,
      unitPrice: Number(medicine.pricePerUnit) || 0,
      totalCost: recommendedQuantity * (Number(medicine.pricePerUnit) || 0),
      effectivenessScore,
      compatibilityScore,
      expiryDate: bestStock.expiryDate,
      batchNumber: bestStock.batchNumber || 'N/A',
      supplierInfo: bestStock.supplier || 'Unknown',
      unit: unit,
      applicationRate: this.getApplicationRate(medicine.category),
      coveragePerUnit: this.calculateCoveragePerUnit(medicine.category)
    };
  }

  /**
   * Calculate effectiveness score based on medicine-pest compatibility
   */
  private calculateEffectivenessScore(
    medicineTargets: string[],
    requestedPests: string[],
    medicineCategory: string
  ): number {
    if (!medicineTargets || medicineTargets.length === 0) return 50;

    let matchCount = 0;
    const normalizedTargets = medicineTargets.map(t => t.toLowerCase());
    const normalizedPests = requestedPests.map(p => p.toLowerCase());

    for (const pest of normalizedPests) {
      const hasDirectMatch = normalizedTargets.some(target => 
        target.includes(pest) || pest.includes(target)
      );
      
      if (hasDirectMatch) {
        matchCount++;
      } else {
        // Check for category-level matches
        const hasCategoryMatch = this.checkCategoryMatch(pest, medicineCategory);
        if (hasCategoryMatch) {
          matchCount += 0.5;
        }
      }
    }

    const matchRatio = matchCount / requestedPests.length;
    return Math.min(100, Math.round(matchRatio * 100));
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibilityScore(
    medicineTargets: string[],
    requestedPests: string[]
  ): number {
    if (!medicineTargets || medicineTargets.length === 0) return 30;

    const exactMatches = requestedPests.filter(pest =>
      medicineTargets.some(target => 
        target.toLowerCase().includes(pest.toLowerCase())
      )
    ).length;

    return Math.min(100, (exactMatches / requestedPests.length) * 100);
  }

  /**
   * Check category-level pest-medicine compatibility
   */
  private checkCategoryMatch(pestName: string, medicineCategory: string): boolean {
    const pestCategoryMap: Record<string, string[]> = {
      'insektisida': ['ulat', 'wereng', 'kutu', 'trips', 'penggerek', 'lalat'],
      'fungisida': ['jamur', 'blas', 'hawar', 'busuk', 'antraknos', 'karat'],
      'herbisida': ['gulma', 'rumput', 'teki'],
      'bakterisida': ['bakteri', 'layu', 'busuk bakteri'],
      'akarisida': ['tungau', 'kutu merah']
    };

    const category = medicineCategory.toLowerCase();
    const pestKeywords = pestCategoryMap[category] || [];
    
    return pestKeywords.some(keyword => 
      pestName.toLowerCase().includes(keyword)
    );
  }

  /**
   * Find alternative medicines for insufficient stock scenarios
   */
  private async findAlternativeMedicines(
    originalMedicineId: string,
    pestTypes: string[],
    requiredQuantity: number,
    maxAlternatives: number
  ): Promise<MedicineRecommendation[]> {
    const alternatives = await this.prisma.medicine.findMany({
      where: {
        id: { not: originalMedicineId },
        status: 'ACTIVE',
        pestTypes: {
          path: '$',
          array_contains: pestTypes
        }
      },
      include: {
        stocks: {
          where: {
            currentStock: { gte: requiredQuantity * 0.5 }, // At least 50% of required
            expiryDate: { gte: new Date() }
          }
        }
      },
      take: maxAlternatives
    });

    const scoredAlternatives = await Promise.all(
      alternatives.map((alt: any) => this.scoreMedicineOption(
        alt, pestTypes, requiredQuantity, 'liter'
      ))
    );

    return scoredAlternatives
      .filter(alt => alt.availableStock > 0)
      .sort((a: MedicineRecommendation, b: MedicineRecommendation) => b.effectivenessScore - a.effectivenessScore);
  }

  /**
   * Generate risk assessment for the recommendation
   */
  private async generateRiskAssessment(
    recommendedItems: RecommendedItem[]
  ): Promise<RiskAssessment> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Stock risk assessment
    const lowStockItems = recommendedItems.filter(
      item => item.optimalChoice.availableStock < item.requestedQuantity
    );
    
    const stockRisk = lowStockItems.length > recommendedItems.length * 0.5 ? 'high' :
                    lowStockItems.length > 0 ? 'medium' : 'low';

    if (stockRisk !== 'low') {
      warnings.push(`${lowStockItems.length} item(s) have insufficient stock`);
      recommendations.push('Consider partial approval or alternative medicines');
    }

    // Expiry risk assessment
    const expiringSoonItems = recommendedItems.filter(item => {
      const daysToExpiry = Math.floor(
        (item.optimalChoice.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysToExpiry < 90; // Expiring within 3 months
    });

    const expiryRisk = expiringSoonItems.length > recommendedItems.length * 0.3 ? 'high' :
                      expiringSoonItems.length > 0 ? 'medium' : 'low';

    if (expiryRisk !== 'low') {
      warnings.push(`${expiringSoonItems.length} item(s) expire within 3 months`);
      recommendations.push('Priority distribution for expiring items');
    }

    // Effectiveness risk assessment
    const lowEffectivenessItems = recommendedItems.filter(
      item => item.optimalChoice.effectivenessScore < 70
    );

    const effectivenessRisk = lowEffectivenessItems.length > recommendedItems.length * 0.3 ? 'high' :
                             lowEffectivenessItems.length > 0 ? 'medium' : 'low';

    if (effectivenessRisk !== 'low') {
      warnings.push(`${lowEffectivenessItems.length} item(s) have low effectiveness scores`);
      recommendations.push('Consider alternative medicines with higher effectiveness');
    }

    // Overall risk calculation
    const riskScores = { low: 1, medium: 2, high: 3 };
    const avgRisk = (riskScores[stockRisk] + riskScores[expiryRisk] + riskScores[effectivenessRisk]) / 3;
    
    const overallRisk = avgRisk >= 2.5 ? 'high' : avgRisk >= 1.5 ? 'medium' : 'low';

    return {
      stockRisk,
      expiryRisk,
      effectivenessRisk,
      overallRisk,
      warnings,
      recommendations
    };
  }

  // ==================== HELPER METHODS ====================

  private async getSubmissionWithDetails(submissionId: string) {
    return await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        items: {
          include: {
            medicine: {
              include: {
                stocks: {
                  where: {
                    currentStock: { gt: 0 },
                    expiryDate: { gte: new Date() }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  private determineAvailabilityStatus(recommendedItems: RecommendedItem[]): 'full' | 'partial' | 'unavailable' {
    const totalItems = recommendedItems.length;
    const availableItems = recommendedItems.filter(
      item => item.optimalChoice.availableStock >= item.requestedQuantity
    ).length;

    if (availableItems === totalItems) return 'full';
    if (availableItems === 0) return 'unavailable';
    return 'partial';
  }

  private createFallbackRecommendation(submissionItem: any): MedicineRecommendation {
    return {
      medicineId: submissionItem.medicineId,
      stockId: 'no-stock',
      brandName: submissionItem.medicine.name,
      activeIngredient: 'Unknown',
      concentration: 'Unknown',
      availableStock: 0,
      recommendedQuantity: 0,
      maxRecommendedQuantity: 0,
      unitPrice: 0,
      totalCost: 0,
      effectivenessScore: 0,
      compatibilityScore: 0,
      expiryDate: new Date(),
      batchNumber: 'N/A',
      supplierInfo: 'N/A',
      unit: submissionItem.unit,
      applicationRate: 'Unknown',
      coveragePerUnit: 0
    };
  }

  private getApplicationRate(category: string): string {
    const rates: Record<string, string> = {
      'insektisida': '2-3 ml per liter air',
      'fungisida': '2-4 ml per liter air',
      'herbisida': '5-10 ml per liter air',
      'bakterisida': '2-3 ml per liter air',
      'akarisida': '1-2 ml per liter air'
    };

    return rates[category.toLowerCase()] || '2-3 ml per liter air';
  }

  private calculateCoveragePerUnit(category: string): number {
    // Coverage in hectares per liter
    const coverage: Record<string, number> = {
      'insektisida': 0.5,
      'fungisida': 0.4,
      'herbisida': 0.3,
      'bakterisida': 0.5,
      'akarisida': 0.6
    };

    return coverage[category.toLowerCase()] || 0.5;
  }
}
