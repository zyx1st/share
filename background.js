// --- Constants for LLM API ---
const LLM_API_URL = "https://api.openai.com/v1/chat/completions"; // Example for OpenAI
const LLM_MODEL = "gpt-3.5-turbo"; // Example model

// --- Message Listener for Summarization Requests ---

// Listens for messages from other parts of the extension (e.g., side panel).
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message is a request to summarize.
    if (message.type === "SUMMARIZE_REQUEST") {
        console.log("Background: SUMMARIZE_REQUEST received");
        // Use an Immediately Invoked Function Expression (IIFE) to handle async operations.
        (async () => { 
            try {
                // Fetch all necessary data from storage: documents, profile, API key, and local LLM settings.
                const { userDocuments, userProfileData, llmApiKey, localLlmSettings, useLocalLlm } = await fetchDataFromStorage();

                // Priority 1: Check if Local LLM mode is selected and configured.
                if (useLocalLlm && localLlmSettings && localLlmSettings.endpoint) {
                    console.log("Background: Local LLM mode selected. Endpoint:", localLlmSettings.endpoint);
                    // Placeholder for Local LLM call - currently returns a "not implemented" message.
                    sendResponse({ 
                        error: "Local LLM functionality is not yet implemented. Please uncheck 'Use Local LLM' to use the API key based service.",
                        summary: "Local LLM not implemented.", 
                        quotes: ["Feature coming soon!"] 
                    });
                    return; // Stop further processing for this request.
                }
                
                // Priority 2: If not using Local LLM, proceed with API Key based LLM.
                // Check if the API Key is configured.
                if (!llmApiKey) {
                    console.warn("Background: LLM API Key not configured for API-based LLM.");
                    sendResponse({ error: "API Key not configured. Please set it in the extension settings (or select and configure Local LLM if preferred)." });
                    return; // Stop further processing.
                }
                
                // Check if there is any content (documents or profile) to summarize.
                if ((!userDocuments || userDocuments.length === 0) && !userProfileData) {
                    console.warn("Background: No documents or profile data found for summarization.");
                    sendResponse({ error: "No data available to summarize. Please save a document or provide a user profile." });
                    return; // Stop further processing.
                }

                // Prepare the data (combined text from documents and profile) for the LLM.
                const dataForLlm = prepareDataForLlm(userDocuments, userProfileData);
                console.log("Background: Data prepared for (API) LLM. Length:", dataForLlm.length);
                
                // Call the LLM API to get the summary.
                const llmResult = await getLlmSummary(dataForLlm, llmApiKey);

                console.log("Background: API LLM summary generated:", llmResult);
                // Send a successful response back to the side panel with the summary and quotes.
                sendResponse({ status: "success", summary: llmResult.summary, quotes: llmResult.quotes });

            } catch (error) { // Catch any errors that occurred during the process.
                console.error("Background: Error processing summarization request:", error);
                sendResponse({ error: "Failed to process summary request: " + error.message });
            }
        })();
        // Return true to indicate that sendResponse will be called asynchronously.
        // This is crucial for the message channel to remain open.
        return true; 
    }
});

// --- Data Handling Functions ---

// Fetches all necessary data from chrome.storage.local.
// This includes user documents, user profile, LLM API key, and local LLM settings.
async function fetchDataFromStorage() {
    console.log("Background: Fetching data from storage...");
    // Define all keys to be fetched from storage.
    const keys = [
        'userDocuments', 
        'userProfileData', 
        'llmApiKey',
        'localLlmSettings',
        'useLocalLlm'
    ];
    const result = await chrome.storage.local.get(keys);
    
    // Log the status of fetched data for easier debugging.
    console.log("Background: Data fetched:", { 
        userDocumentsCount: result.userDocuments ? result.userDocuments.length : 0, 
        userProfileDataExists: !!result.userProfileData,
        apiKeyExists: !!result.llmApiKey,
        localLlmSettingsExists: !!result.localLlmSettings,
        useLocalLlmSet: result.hasOwnProperty('useLocalLlm') // Check if 'useLocalLlm' was actually in storage
    });

    // Return an object with all fetched data, providing default values for any missing keys.
    return { 
        userDocuments: result.userDocuments || [], 
        userProfileData: result.userProfileData || "",
        llmApiKey: result.llmApiKey || null,
        localLlmSettings: result.localLlmSettings || null,
        useLocalLlm: result.useLocalLlm || false // Default to false if not set
    };
}

// Prepares the combined text prompt for the LLM from the user's documents and profile.
function prepareDataForLlm(documents, profile) {
    let combinedText = `User Profile/Interests: 
${profile || "Not provided. Please summarize generally."}

--- 
`; // Separator for clarity between profile and documents.

    if (documents && documents.length > 0) {
        combinedText += "Documents to Summarize:\n";
        documents.forEach((doc, index) => {
            // Append each document's name and content.
            combinedText += `Document ${index + 1} (${doc.name || "Untitled"}):\n${doc.content}\n\n---\n`; // Separator for each document.
        });
    } else {
        // If no documents, add a note indicating this.
        combinedText += "No specific documents provided. Summarize based on profile if available, or provide a general greeting.\n";
    }
    return combinedText;
}

// --- LLM Interaction ---

// Calls the configured cloud-based LLM API to get a summary and extracted quotes.
// `dataForLlm` is the combined text, `apiKey` is the user's LLM API key.
async function getLlmSummary(dataForLlm, apiKey) {
    console.log("Background: Calling (Cloud) LLM API...");

    // Define the payload for the LLM API call.
    // This structure is specific to OpenAI's Chat Completions API.
    const payload = {
        model: LLM_MODEL, // e.g., "gpt-3.5-turbo"
        messages: [
            {
                role: "system", // System message defines the assistant's behavior and goals.
                content: "You are a helpful assistant. Your task is to provide a concise summary of the given text. If a user profile is provided, tailor the summary to be particularly relevant to those interests. Also, extract up to three key sentences or phrases from the text that would be significant to the user (based on their profile if available). Format these as a list under a heading 'Key Quotes:'."
            },
            {
                role: "user", // User message provides the content to be processed.
                content: dataForLlm 
            }
        ],
        max_tokens: 300, // Maximum number of tokens (words/sub-words) in the generated response.
        temperature: 0.5 // Controls randomness/creativity. Lower is more deterministic.
    };

    try {
        // Make the asynchronous API call using fetch.
        const response = await fetch(LLM_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}` // Authentication with the API key.
            },
            body: JSON.stringify(payload) // Convert the payload to a JSON string.
        });

        // Check if the API response is successful.
        if (!response.ok) {
            const errorBody = await response.text(); // Try to get more details from the error response.
            console.error("Background: LLM API Error Response:", response.status, errorBody);
            // Throw an error to be caught by the calling function's catch block.
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}. Details: ${errorBody}`);
        }

        const result = await response.json(); // Parse the JSON response from the API.
        console.log("Background: LLM API Raw Response:", result);

        // Validate the structure of the LLM's response to ensure it's as expected.
        if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
            console.error("Background: Invalid LLM API response structure:", result);
            throw new Error("Invalid response structure from LLM API.");
        }

        const llmContent = result.choices[0].message.content; // Extract the main content string.
        
        // Attempt to parse the LLM content into a distinct summary and a list of quotes.
        // This parsing is based on the system prompt asking for a "Key Quotes:" heading.
        let summary = llmContent;
        let quotes = [];
        const quotesHeaderIndex = llmContent.toLowerCase().indexOf("key quotes:");
        if (quotesHeaderIndex !== -1) { // If "Key Quotes:" header is found.
            summary = llmContent.substring(0, quotesHeaderIndex).trim();
            const quotesSection = llmContent.substring(quotesHeaderIndex + "key quotes:".length).trim();
            // Split quotes by newline, remove leading hyphens, and filter out empty lines.
            quotes = quotesSection.split('\n').map(q => q.replace(/^- /, '').trim()).filter(q => q.length > 0);
        } else { 
            // Fallback: If "Key Quotes:" is not found, try to split by sentences.
            // This is a basic approach and might not always yield perfect quotes.
            const sentences = llmContent.split('. ');
            if (sentences.length > 1) {
                // Take most sentences as summary, last few as quotes.
                summary = sentences.slice(0, Math.max(1, sentences.length - 2)).join('. ') + '.'; 
                quotes = sentences.slice(Math.max(1, sentences.length - 2)).filter(s => s.trim().length > 0);
                if (quotes.length === 0 && sentences.length > 0) { 
                    summary = sentences[0]; // If only one sentence overall, use it as summary.
                }
            }
        }
         // If still no quotes extracted and the summary is long, take a snippet of the summary as a quote.
         if (quotes.length === 0 && summary.length > 100) { 
            quotes.push(summary.substring(0, Math.min(summary.length, 75)) + "...");
        }

        console.log("Background: Parsed LLM Summary:", summary);
        console.log("Background: Parsed LLM Quotes:", quotes);
        return { summary, quotes }; // Return the parsed summary and quotes.

    } catch (error) { // Catch errors during the API call or response parsing.
        console.error("Background: Error in getLlmSummary:", error);
        throw error; // Re-throw the error to be handled by the message listener's catch block.
    }
}

// --- Extension Lifecycle ---

// Listener for when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
    console.log("Personalized Summarizer extension installed/updated.");
    // This is a good place for setting up initial storage values or performing migrations in future versions.
});

// Log that the background script has loaded and the configured API URL (for debugging).
console.log("Background script loaded. LLM API URL:", LLM_API_URL);
