const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = GEMINI_MODEL;

    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    } else {
      console.log(`✅ Gemini configured (model: ${this.modelName})`);
    }

    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  getModel() {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }
    return this.genAI.getGenerativeModel({ model: this.modelName });
  }

  shouldUseFallback(error) {
    const message = error?.message || '';
    return (
      error?.status === 503 ||
      error?.status === 429 ||
      error?.status === 400 ||
      message.includes('API_KEY_INVALID') ||
      message.includes('API key not valid') ||
      message.includes('overloaded') ||
      message.includes('quota') ||
      message.includes('fetch failed') ||
      message.includes('UNABLE_TO_VERIFY') ||
      message.includes('certificate') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT')
    );
  }

  async predictFoodWastage(trainingData, predictionInput) {
    if (!this.genAI) {
      return this.getFallbackPrediction(predictionInput, trainingData);
    }

    try {
      const model = this.getModel();
      const dataSummary = this.prepareDataSummary(trainingData);

      const prompt = `You are an AI model specialized in predicting food wastage in hostel cafeterias. 

Based on the following historical training data:
${dataSummary}

Please predict the food wastage for the following scenario:
- Date: ${predictionInput.date}
- Meal Type: ${predictionInput.mealType}
- Students Present: ${predictionInput.studentsPresent}
- Food Prepared: ${predictionInput.foodPrepared} kg
- Weather: ${predictionInput.weather}
- Day of Week: ${predictionInput.dayOfWeek}

IMPORTANT INSTRUCTIONS:
1. predictedWastage: Must be a realistic number in kg (typically 5-30% of food prepared). For ${predictionInput.foodPrepared}kg prepared, predict wastage between ${predictionInput.foodPrepared * 0.05}kg and ${predictionInput.foodPrepared * 0.30}kg.
2. wastagePercentage: Calculate as (predictedWastage / ${predictionInput.foodPrepared}) * 100. Must be between 5 and 30.
3. confidence: Your confidence in this prediction (0-100). Be realistic based on available data.
4. recommendation: Specific, actionable advice to reduce wastage.
5. factors: Top 3 factors influencing your prediction.

Provide your response in ONLY valid JSON format (no markdown, no code blocks, just JSON):
{
  "predictedWastage": <number>,
  "wastagePercentage": <number>,
  "confidence": <number>,
  "recommendation": "<string>",
  "factors": ["<string>", "<string>", "<string>"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      const prediction = JSON.parse(jsonMatch[0]);

      let predictedWastage = parseFloat(prediction.predictedWastage) || 0;
      let confidence = parseFloat(prediction.confidence) || 70;

      const minWastage = predictionInput.foodPrepared * 0.05;
      const maxWastage = predictionInput.foodPrepared * 0.30;
      predictedWastage = Math.max(minWastage, Math.min(maxWastage, predictedWastage));

      const wastagePercentage = predictionInput.foodPrepared > 0
        ? parseFloat(((predictedWastage / predictionInput.foodPrepared) * 100).toFixed(2))
        : 0;

      confidence = Math.max(0, Math.min(100, confidence));

      const finalPrediction = {
        predictedWastage: parseFloat(predictedWastage.toFixed(2)),
        wastagePercentage,
        confidence: Math.round(confidence),
        recommendation: prediction.recommendation || 'Consider monitoring food consumption patterns to optimize preparation.',
        factors: Array.isArray(prediction.factors) && prediction.factors.length > 0
          ? prediction.factors
          : ['Historical consumption patterns', 'Student attendance', 'Weather conditions'],
        model: this.modelName,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Gemini Prediction:', {
        input: `${predictionInput.foodPrepared}kg prepared`,
        output: `${finalPrediction.predictedWastage}kg wasted (${finalPrediction.wastagePercentage}%)`,
        confidence: `${finalPrediction.confidence}%`
      });

      return {
        success: true,
        prediction: finalPrediction
      };
    } catch (error) {
      console.error('Gemini API Error:', error.message);

      if (this.shouldUseFallback(error)) {
        console.log('⚠️  Gemini unavailable, using CSV-based statistical prediction');
        return this.getFallbackPrediction(predictionInput, trainingData);
      }

      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  prepareDataSummary(trainingData) {
    if (!trainingData || trainingData.length === 0) {
      return 'No historical data available';
    }

    const stats = {
      totalRecords: trainingData.length,
      avgWastage: 0,
      avgFoodPrepared: 0,
      avgStudents: 0,
      mealTypeBreakdown: {},
      weatherBreakdown: {},
      dayBreakdown: {}
    };

    trainingData.forEach(record => {
      stats.avgWastage += (record.wastage || 0);
      stats.avgFoodPrepared += (record.food_prepared || 0);
      stats.avgStudents += (record.students_present || 0);

      const meal = record.meal_type || 'unknown';
      stats.mealTypeBreakdown[meal] = (stats.mealTypeBreakdown[meal] || 0) + 1;

      const weather = record.weather || 'unknown';
      stats.weatherBreakdown[weather] = (stats.weatherBreakdown[weather] || 0) + 1;

      const day = record.day_of_week || 'unknown';
      stats.dayBreakdown[day] = (stats.dayBreakdown[day] || 0) + 1;
    });

    if (stats.totalRecords > 0) {
      stats.avgWastage = (stats.avgWastage / stats.totalRecords).toFixed(2);
      stats.avgFoodPrepared = (stats.avgFoodPrepared / stats.totalRecords).toFixed(2);
      stats.avgStudents = Math.round(stats.avgStudents / stats.totalRecords);
    }

    return `
Historical Data Summary (${stats.totalRecords} records):
- Average Wastage: ${stats.avgWastage} kg
- Average Food Prepared: ${stats.avgFoodPrepared} kg
- Average Students Present: ${stats.avgStudents}
- Meal Type Distribution: ${JSON.stringify(stats.mealTypeBreakdown)}
- Weather Distribution: ${JSON.stringify(stats.weatherBreakdown)}
- Day of Week Distribution: ${JSON.stringify(stats.dayBreakdown)}

Sample Records (last 10):
${trainingData.slice(-10).map(r =>
      `Date: ${r.date}, Meal: ${r.meal_type}, Students: ${r.students_present}, Prepared: ${r.food_prepared}kg, Wastage: ${r.wastage}kg`
    ).join('\n')}
    `.trim();
  }

  async analyzeWastageTrends(trainingData) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();
      const dataSummary = this.prepareDataSummary(trainingData);

      const prompt = `Analyze the following food wastage data and provide insights:

${dataSummary}

Provide your analysis in JSON format with:
{
  "trends": ["<trend 1>", "<trend 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "highWastagePeriods": ["<period 1>", "<period 2>", ...],
  "summary": "<overall summary>"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Gemini Analysis Error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async recommendProducts(userId, purchaseHistory, browsingHistory) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `You are a product recommendation AI for a hostel e-commerce platform.

User Purchase History:
${JSON.stringify(purchaseHistory, null, 2)}

Browsing History:
${JSON.stringify(browsingHistory, null, 2)}

Based on this data, recommend 5-10 products that the student might need. Consider:
- Past purchases
- Browsing patterns
- Typical hostel student needs (stationary, snacks, toiletries, etc.)
- Seasonal requirements

Respond in JSON format:
{
  "recommendations": [
    {"productName": "<name>", "category": "<category>", "reason": "<why recommended>", "priority": <1-5>}
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };
    } catch (error) {
      console.error('Gemini Recommendation Error:', error);
      return { recommendations: [] };
    }
  }

  async analyzeAttendancePatterns(attendanceData) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `Analyze student attendance patterns:

${JSON.stringify(attendanceData.slice(-50), null, 2)}

Provide insights in JSON format:
{
  "overallTrend": "<increasing/decreasing/stable>",
  "peakAttendanceDays": ["<day1>", "<day2>"],
  "lowAttendanceDays": ["<day1>", "<day2>"],
  "mealTypeInsights": {"breakfast": "<insight>", "lunch": "<insight>", "dinner": "<insight>"},
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "predictions": "<future attendance prediction>"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { overallTrend: 'stable' };
    } catch (error) {
      console.error('Gemini Attendance Analysis Error:', error);
      return { overallTrend: 'stable', recommendations: [] };
    }
  }

  async optimizeMenuSuggestions(currentMenu, feedbackData, wastageData) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `You are a hostel food menu optimizer.

Current Menu:
${JSON.stringify(currentMenu, null, 2)}

Recent Feedback:
${JSON.stringify(feedbackData.slice(-20), null, 2)}

Wastage Data:
${JSON.stringify(wastageData.slice(-10), null, 2)}

Suggest menu improvements in JSON format:
{
  "suggestedChanges": [
    {"meal": "<meal_type>", "item": "<item_name>", "action": "<add/remove/modify>", "reason": "<reason>"}
  ],
  "popularItems": ["<item1>", "<item2>"],
  "unpopularItems": ["<item1>", "<item2>"],
  "nutritionalBalance": "<assessment>",
  "costOptimization": "<suggestions>"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestedChanges: [] };
    } catch (error) {
      console.error('Gemini Menu Optimization Error:', error);
      return { suggestedChanges: [] };
    }
  }

  async analyzeFeedbackSentiment(feedbackText, category) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `Analyze the sentiment and extract insights from this student feedback:

Category: ${category}
Feedback: "${feedbackText}"

Provide analysis in JSON format:
{
  "sentiment": "<positive/negative/neutral>",
  "sentimentScore": <0-100>,
  "urgency": "<low/medium/high>",
  "keyIssues": ["<issue1>", "<issue2>"],
  "suggestedActions": ["<action1>", "<action2>"],
  "tags": ["<tag1>", "<tag2>"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { sentiment: 'neutral', sentimentScore: 50 };
    } catch (error) {
      console.error('Gemini Sentiment Analysis Error:', error);
      return { sentiment: 'neutral', sentimentScore: 50, urgency: 'low' };
    }
  }

  async generateChatResponse(conversationHistory, studentQuery) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `You are a helpful hostel management assistant. 

Previous conversation:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Student Query: "${studentQuery}"

Provide a helpful, friendly, and professional response. Keep it concise (2-3 sentences).
If the query is about hostel policies, food, attendance, or general issues, provide relevant information.

Respond with just the text (no JSON, no formatting):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini Chat Response Error:', error);
      return "I'm here to help! Could you please provide more details about your query?";
    }
  }

  async forecastProductDemand(productId, historicalSales, seasonality) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `Forecast product demand for inventory management.

Product ID: ${productId}
Historical Sales: ${JSON.stringify(historicalSales)}
Seasonality Data: ${JSON.stringify(seasonality)}

Predict demand for the next 7 days in JSON format:
{
  "forecastedDemand": <number>,
  "confidence": <0-100>,
  "recommendedStockLevel": <number>,
  "trends": "<insight>",
  "factors": ["<factor1>", "<factor2>"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { forecastedDemand: 0, confidence: 50 };
    } catch (error) {
      console.error('Gemini Demand Forecast Error:', error);
      return { forecastedDemand: 0, confidence: 50 };
    }
  }

  async analyzeStudentBehavior(studentData) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.getModel();

      const prompt = `Analyze student behavior patterns:

${JSON.stringify(studentData, null, 2)}

Provide insights in JSON format:
{
  "behaviorSummary": "<summary>",
  "engagementLevel": "<high/medium/low>",
  "riskFactors": ["<factor1>", "<factor2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "strengths": ["<strength1>", "<strength2>"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { behaviorSummary: 'Normal behavior' };
    } catch (error) {
      console.error('Gemini Behavior Analysis Error:', error);
      return { behaviorSummary: 'Analysis unavailable', engagementLevel: 'medium' };
    }
  }

  getFallbackPrediction(predictionInput, trainingData) {
    console.log('🔄 Generating prediction from uploaded CSV training data');

    const mealType = (predictionInput.mealType || '').toLowerCase();
    const weather = (predictionInput.weather || '').toLowerCase();

    let relevantRecords = trainingData || [];
    if (relevantRecords.length > 0) {
      const mealMatches = relevantRecords.filter(r =>
        (r.meal_type || '').toLowerCase() === mealType
      );
      if (mealMatches.length > 0) {
        relevantRecords = mealMatches;
      }
    }

    let avgWastagePercent = 15;

    if (relevantRecords.length > 0) {
      const wastagePercents = relevantRecords
        .map(record => {
          const prepared = record.food_prepared || record.foodPrepared || 0;
          const wastage = record.wastage || 0;
          return prepared > 0 ? (wastage / prepared) * 100 : null;
        })
        .filter(v => v !== null);

      if (wastagePercents.length > 0) {
        avgWastagePercent = wastagePercents.reduce((sum, v) => sum + v, 0) / wastagePercents.length;
      }
    }

    const weatherRecords = relevantRecords.filter(r =>
      (r.weather || '').toLowerCase() === weather
    );
    if (weatherRecords.length > 0) {
      const weatherPercents = weatherRecords
        .map(record => {
          const prepared = record.food_prepared || record.foodPrepared || 0;
          const wastage = record.wastage || 0;
          return prepared > 0 ? (wastage / prepared) * 100 : null;
        })
        .filter(v => v !== null);

      if (weatherPercents.length > 0) {
        avgWastagePercent = weatherPercents.reduce((sum, v) => sum + v, 0) / weatherPercents.length;
      }
    }

    const weatherFactor = weather === 'rainy' ? 1.1 : weather === 'cold' ? 1.05 : 1.0;
    const dayFactor = ['Saturday', 'Sunday'].includes(predictionInput.dayOfWeek) ? 1.15 : 1.0;

    const adjustedPercent = avgWastagePercent * weatherFactor * dayFactor;
    const predictedWastage = (predictionInput.foodPrepared * adjustedPercent) / 100;

    const minWastage = predictionInput.foodPrepared * 0.05;
    const maxWastage = predictionInput.foodPrepared * 0.30;
    const finalWastage = Math.max(minWastage, Math.min(maxWastage, predictedWastage));
    const wastagePercentage = (finalWastage / predictionInput.foodPrepared) * 100;

    const fallbackPrediction = {
      predictedWastage: parseFloat(finalWastage.toFixed(2)),
      wastagePercentage: parseFloat(wastagePercentage.toFixed(2)),
      confidence: Math.min(85, Math.round(55 + Math.min(relevantRecords.length, 30))),
      recommendation: `Based on ${relevantRecords.length} CSV training records (${avgWastagePercent.toFixed(1)}% avg wastage for ${mealType}), consider adjusting food preparation to reduce wastage.`,
      factors: [
        `Historical CSV data (${relevantRecords.length} matching records)`,
        `Weather conditions (${predictionInput.weather})`,
        `Day of week (${predictionInput.dayOfWeek})`
      ],
      model: 'csv-statistical-analysis',
      timestamp: new Date().toISOString()
    };

    console.log('✅ CSV-based Prediction:', {
      input: `${predictionInput.foodPrepared}kg prepared`,
      output: `${fallbackPrediction.predictedWastage}kg wasted (${fallbackPrediction.wastagePercentage}%)`,
      confidence: `${fallbackPrediction.confidence}%`
    });

    return {
      success: true,
      prediction: fallbackPrediction,
      fallback: true
    };
  }
}

module.exports = new GeminiService();
