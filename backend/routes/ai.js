const express = require('express');
const router = express.Router();
const multer = require('multer');

// Setup multer for handling file uploads in memory for mock analysis
const upload = multer({ storage: multer.memoryStorage() });

// Mock endpoint for Report Analysis
router.post('/analyze-report', upload.single('report'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No report file uploaded.' });
        }

        // Mock delay to simulate AI processing time
        setTimeout(() => {
            const mockDiagnosis = [
                {
                    title: "Blood Panel Summary",
                    description: "Anomalies detected: Elevated LDL cholesterol (140 mg/dL). Other markers (WBC, RBC, Hemoglobin) are within normal range."
                },
                {
                    title: "Radiology Scan Notes",
                    description: "No significant abnormalities detected in the provided imaging. Lung fields are clear."
                },
                {
                    title: "Next Step Guidance",
                    description: "Schedule a follow-up consultation in 2 weeks. Recommend dietary adjustments to lower cholesterol."
                }
            ];

            res.json({
                message: "Report successfully analyzed.",
                filename: req.file.originalname,
                diagnosis: mockDiagnosis
            });
        }, 1500); // 1.5 seconds mock delay
    } catch (error) {
        console.error("Error analyzing report:", error);
        res.status(500).json({ error: "Failed to analyze the report." });
    }
});

// Mock endpoint for Symptom Checker
router.post('/symptom-checker', (req, res) => {
    try {
        const { symptoms } = req.body;
        
        if (!symptoms) {
            return res.status(400).json({ error: 'Please provide symptoms.' });
        }

        const lowercaseSymptoms = symptoms.toLowerCase();
        let prediction = "Based on the provided symptoms, we recommend consulting a primary care physician for a thorough evaluation.";
        let conditions = ["General Fatigue", "Viral Infection", "Mild Dehydration"];
        let urgency = "Low";

        // Simple mock symptom matching
        if (lowercaseSymptoms.includes('fever') && lowercaseSymptoms.includes('cough')) {
            prediction = "Symptoms are consistent with a viral respiratory infection (e.g., Influenza, COVID-19 or common cold).";
            conditions = ["Influenza", "Upper Respiratory Infection"];
            urgency = "Medium";
        } else if (lowercaseSymptoms.includes('chest pain') || lowercaseSymptoms.includes('shortness of breath')) {
            prediction = "Warning: These symptoms could indicate a serious cardiovascular or respiratory event. Please seek immediate emergency medical care.";
            conditions = ["Myocardial Infarction", "Pulmonary Embolism", "Severe Asthma"];
            urgency = "High (Emergency)";
        } else if (lowercaseSymptoms.includes('headache') && lowercaseSymptoms.includes('fever')) {
           prediction = "Symptoms suggest a potential infection or migraine.";
           conditions = ["Migraine", "Sinusitis", "Viral Infection"];
           urgency = "Medium";
        }

        setTimeout(() => {
            res.json({
                prediction,
                possible_conditions: conditions,
                urgency
            });
        }, 1200); // 1.2s mock delay
    } catch (error) {
        console.error("Error checking symptoms:", error);
        res.status(500).json({ error: "Failed to check symptoms." });
    }
});

// Mock endpoint for AI Diagnosis
router.post('/ai-diagnosis', (req, res) => {
    try {
        const { indicators } = req.body;
        
        if (!indicators) {
            return res.status(400).json({ error: 'Please provide clinical indicators.' });
        }

        setTimeout(() => {
            res.json({
                diagnosis_summary: "Based on the provided indicators, there are mild deviations from optimal baselines.",
                recommendation: "Ensure adequate rest and hydration. If symptoms persist or worsen, schedule a comprehensive checkup.",
                risk_level: "Low Risk"
            });
        }, 1500); 
    } catch (error) {
        console.error("Error generating diagnosis:", error);
        res.status(500).json({ error: "Failed to generate diagnosis." });
    }
});

module.exports = router;
