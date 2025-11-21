// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API route for Gemini
app.post('/api/narrate', async (req, res) => {
    // ----------------------------------------------------
    // FIX: Declare 'crew' in the wider scope (line 29)
    // This ensures it is accessible in the catch block 
    // for the fallback story generation.
    // ----------------------------------------------------
    let crew;

    try {
        // Assign the value to the outer 'crew' variable
        crew = req.body.crew;

        if (!crew || !Object.values(crew).every(member => member !== null)) {
            return res.status(400).json({ error: "Complete crew required" });
        }

        console.log('Generating story for crew:', Object.values(crew).map(c => c.name));

        const prompt = `
          You are a creative One Piece storyteller in the style of Eiichiro Oda.
          Write an exciting, dramatic pirate adventure about this crew:

          CREW:
          - Captain: ${crew.captain.name} (${crew.captain.description})
          - Vice Captain: ${crew.viceCaptain.name} (${crew.viceCaptain.description}) 
          - Fighter: ${crew.fighter.name} (${crew.fighter.description})
          - Healer: ${crew.healer.name} (${crew.healer.description})
          - Support 1: ${crew.support1.name} (${crew.support1.description})
          - Support 2: ${crew.support2.name} (${crew.support2.description})

          Create a vivid 3-4 paragraph story about their first major voyage in the Grand Line!
          Make it dramatic, adventurous, and include their unique personalities and abilities.
          Write in an engaging, cinematic style that captures the spirit of One Piece!
        `;

        console.log('Calling Gemini API...');

        // Updated Gemini API endpoint list (prioritize modern models)
        const apiEndpoints = [
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, // Recommended
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`
        ];

        let geminiResponse;
        let lastError;

        // Try different API endpoints
        for (const apiUrl of apiEndpoints) {
            try {
                console.log('Trying endpoint:', apiUrl.split('/models/')[1].split(':')[0]);

                geminiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 500,
                            topP: 0.8,
                        }
                    }),
                });

                if (geminiResponse.ok) {
                    console.log('✅ Success with endpoint:', apiUrl.split('/models/')[1].split(':')[0]);
                    break;
                } else {
                    const errorData = await geminiResponse.json();
                    lastError = errorData;
                    console.log(`❌ Failed with ${apiUrl.split('/models/')[1].split(':')[0]}:`, errorData.error?.message);
                }
            } catch (error) {
                lastError = error;
                console.log(`❌ Error with ${apiUrl.split('/models/')[1].split(':')[0]}:`, error.message);
            }
        }

        // If we got a successful response
        if (geminiResponse && geminiResponse.ok) {
            const data = await geminiResponse.json();

            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.error('Unexpected Gemini response structure:', data);
                throw new Error('No story text in Gemini response');
            }

            const story = data.candidates[0].content.parts[0].text.trim();
            console.log('Successfully generated story with Gemini');

            return res.json({ story });
        }

        // If all endpoints failed, use fallback
        console.log('All Gemini endpoints failed, using fallback story');
        // ----------------------------------------------------
        // We no longer need to throw here, as the catch block
        // already contains the fallback logic and has access to 'crew'.
        // We can fall through to the final return if we handle it here,
        // but throwing to reuse the catch block is cleaner for reporting.
        // If we use 'throw new Error("Gemini API unavailable")' it moves 
        // control to the catch block where the fix is implemented.
        // ----------------------------------------------------
        throw new Error('Gemini API unavailable');

    } catch (error) {
        console.error('Server error:', error.message);

        // Enhanced fallback story
        let fallbackStory = "An epic pirate tale awaits, but our message gull got lost in the fog! Try again later.";
        
        // ----------------------------------------------------
        // FIX: Ensure 'crew' is defined before calling the function.
        // The ReferenceError is fixed because 'crew' is declared with 'let' 
        // at the top of the function's scope.
        // We still check if it has content (e.g. if the initial validation passed)
        // ----------------------------------------------------
        if (crew && crew.captain) {
            fallbackStory = generateFallbackStory(crew);
        }
        
        res.json({
            story: fallbackStory,
            note: "AI service temporarily unavailable - here's a custom story!"
        });
    }
});

// ----------------------------------------------------
// The rest of the code is unchanged.
// ----------------------------------------------------
// Enhanced fallback story generator
const generateFallbackStory = (crew) => {
    const scenarios = [
        {
            challenge: "a massive Sea King emerging from the depths",
            action: "battled the colossal beast with coordinated attacks",
            outcome: "emerged victorious and earned the respect of nearby pirates"
        },
        {
            challenge: "a sudden storm that threatened to tear their ship apart",
            action: "worked together to navigate through lightning and tidal waves",
            outcome: "discovered a hidden island full of ancient treasure"
        },
        {
            challenge: "an ambush by Marine warships in the calm belt",
            action: "used clever tactics and their unique abilities to escape",
            outcome: "outsmarted the Marines and found a secret route to the next island"
        },
        {
            challenge: "a rival pirate crew claiming their territory",
            action: "fought with honor and demonstrated their incredible power",
            outcome: "gained new allies and valuable information about the Grand Line"
        }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    return `Captain ${crew.captain.name} stood tall at the helm, eyes fixed on the horizon as the crew embarked on their first great adventure. With ${crew.viceCaptain.name} providing strategic guidance and ${crew.fighter.name} standing ready for combat, they faced the unknown with unwavering determination. ${crew.healer.name} prepared medical supplies while ${crew.support1.name} and ${crew.support2.name} ensured every system was running perfectly.

Their first major test came when they encountered ${scenario.challenge}. The crew ${scenario.action}, each member proving their worth in the heat of battle. ${crew.viceCaptain.name}'s leadership kept everyone focused, while ${crew.fighter.name}'s strength turned the tide. ${crew.healer.name} tended to injuries with remarkable skill, and ${crew.support1.name} and ${crew.support2.name} coordinated their efforts seamlessly under pressure.

After an intense struggle, the crew ${scenario.outcome}. Captain ${crew.captain.name} looked over their extraordinary team with pride - ${crew.viceCaptain.name} already planning their next move, ${crew.fighter.name} standing triumphant, ${crew.healer.name} ensuring everyone was healthy, and ${crew.support1.name} and ${crew.support2.name} having already begun repairs. Together, they knew this was just the beginning of their legendary journey to find the One Piece and become the next Pirate Kings!`;
};

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        geminiKey: process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing'
    });
});

// Test all Gemini endpoints
app.get('/api/test-gemini', async (req, res) => {
    const models = [
        'gemini-2.5-flash', // Added for testing
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-1.5-pro'
    ];

    const results = [];

    for (const model of models) {
        try {
            const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Say 'Ahoy matey!' in a fun pirate voice!"
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 20,
                    }
                }),
            });

            if (testResponse.ok) {
                const data = await testResponse.json();
                results.push({
                    model: model,
                    status: '✅ Working',
                    response: data.candidates[0].content.parts[0].text
                });
            } else {
                const errorData = await testResponse.json();
                results.push({
                    model: model,
                    status: '❌ Failed',
                    error: errorData.error?.message
                });
            }
        } catch (error) {
            results.push({
                model: model,
                status: '❌ Error',
                error: error.message
            });
        }
    }

    res.json({ results });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`🔑 Gemini API Key: ${process.env.REACT_APP_GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`📊 Test Gemini models at: http://localhost:${PORT}/api/test-gemini`);
});