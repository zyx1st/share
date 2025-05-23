// --- Document Management ---

// Displays the list of saved user documents in the UI.
// Fetches documents from chrome.storage.local and dynamically creates list items.
async function displayUserDocuments() {
    const docListDiv = document.getElementById('docList');
    docListDiv.innerHTML = ''; 

    try {
        const data = await chrome.storage.local.get('userDocuments');
        const documents = data.userDocuments || [];

        if (documents.length === 0) {
            docListDiv.textContent = 'No documents saved yet.';
            return;
        }

        const ul = document.createElement('ul');
        documents.forEach((doc, index) => {
            const li = document.createElement('li');
            li.textContent = doc.name;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async () => {
                await deleteDocument(index);
                displayUserDocuments(); 
            });
            li.appendChild(deleteButton);
            ul.appendChild(li);
        });
        docListDiv.appendChild(ul);
    } catch (error) {
        console.error('Error displaying documents:', error);
        docListDiv.textContent = 'Error loading documents.';
    }
}

// Deletes a document from storage at the given index and refreshes the displayed list.
async function deleteDocument(indexToDelete) {
    try {
        const data = await chrome.storage.local.get('userDocuments');
        let documents = data.userDocuments || [];
        documents.splice(indexToDelete, 1); 
        await chrome.storage.local.set({ userDocuments: documents });
    } catch (error) {
        console.error('Error deleting document:', error);
    }
}

// --- Profile Management ---

// Loads the user's profile data from storage and populates the profile textarea.
async function loadUserProfile() {
    const userProfileTextarea = document.getElementById('userProfile');
    try {
        const data = await chrome.storage.local.get('userProfileData');
        if (data.userProfileData) {
            userProfileTextarea.value = data.userProfileData;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// --- Configuration Management (API Key and Local LLM) ---

// Loads and displays the status of the LLM API Key (e.g., "API Key is set." or "API Key not set.").
async function loadApiKeyStatus() {
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    try {
        const data = await chrome.storage.local.get('llmApiKey');
        if (data.llmApiKey && data.llmApiKey.length > 0) {
            apiKeyStatus.textContent = 'API Key is set.';
        } else {
            apiKeyStatus.textContent = 'API Key not set.';
        }
    } catch (error) {
        console.error('Error loading API key status:', error);
        apiKeyStatus.textContent = 'Error checking API key status.';
    }
}

// Loads Local LLM settings (endpoint URL and user preference) from storage.
// Updates the corresponding input fields and status messages in the UI.
// Manages the interplay of status messages: if Local LLM is active, API Key LLM is shown as inactive.
async function loadLocalLlmSettings() {
    const localLlmEndpointInput = document.getElementById('localLlmEndpoint');
    const useLocalLlmCheckbox = document.getElementById('useLocalLlmCheckbox');
    const localLlmStatus = document.getElementById('localLlmStatus');
    const apiKeyStatus = document.getElementById('apiKeyStatus');

    try {
        const data = await chrome.storage.local.get(['localLlmSettings', 'useLocalLlm']);
        
        if (data.localLlmSettings && data.localLlmSettings.endpoint) {
            localLlmEndpointInput.value = data.localLlmSettings.endpoint;
        }

        useLocalLlmCheckbox.checked = !!data.useLocalLlm;

        if (data.useLocalLlm) {
            localLlmStatus.textContent = 'Set to use Local LLM (Experimental - Not yet functional).';
            apiKeyStatus.textContent = 'API Key LLM is inactive.'; 
        } else {
            localLlmStatus.textContent = 'Currently using API Key based LLM.';
            // Refresh API key status in case it was changed
            loadApiKeyStatus(); 
        }
    } catch (error) {
        console.error('Error loading Local LLM settings:', error);
        localLlmStatus.textContent = 'Error loading Local LLM settings.';
    }
}

// --- Event Listeners ---

// Handles the click event for the "Save API Key" button.
// Saves the API key to storage, updates UI status, and ensures Local LLM mode is disabled.
document.getElementById('saveApiKeyButton').addEventListener('click', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const apiKey = apiKeyInput.value.trim();
    const apiKeyStatus = document.getElementById('apiKeyStatus');

    if (!apiKey) {
        alert('API Key cannot be empty.');
        return;
    }

    try {
        await chrome.storage.local.set({ llmApiKey: apiKey });
        apiKeyStatus.textContent = 'API Key saved!';
        apiKeyInput.value = ''; 
        const useLocalLlmCheckbox = document.getElementById('useLocalLlmCheckbox');
        if (useLocalLlmCheckbox.checked) { // If local LLM was active, remind user it's now API key
            useLocalLlmCheckbox.checked = false;
            await chrome.storage.local.set({ useLocalLlm: false });
        }
        loadLocalLlmSettings(); // This will also refresh API key status correctly
        setTimeout(() => loadApiKeyStatus(), 2000); 
    } catch (error) {
        console.error('Error saving API key:', error);
        apiKeyStatus.textContent = 'Error saving API key.';
        alert('Error saving API key.');
    }
});

// Handles the click event for the "Save Local Endpoint" button.
// Saves the Local LLM endpoint URL to storage and updates the UI status.
document.getElementById('saveLocalLlmEndpointButton').addEventListener('click', async () => {
    const localLlmEndpointInput = document.getElementById('localLlmEndpoint');
    const endpoint = localLlmEndpointInput.value.trim();
    const localLlmStatus = document.getElementById('localLlmStatus');

    if (!endpoint) {
        alert('Local LLM Endpoint cannot be empty.');
        return;
    }

    try {
        await chrome.storage.local.set({ localLlmSettings: { endpoint: endpoint } });
        localLlmStatus.textContent = `Local LLM Endpoint saved: ${endpoint}`;
        // Do not clear the input field here, user might want to copy/edit it
    } catch (error) {
        console.error('Error saving Local LLM Endpoint:', error);
        localLlmStatus.textContent = 'Error saving Local LLM Endpoint.';
        alert('Error saving Local LLM Endpoint.');
    }
});

// Handles changes to the "Use Local LLM" checkbox.
// Saves the preference to storage and updates relevant UI status messages.
document.getElementById('useLocalLlmCheckbox').addEventListener('change', async (event) => {
    const useLocalLlm = event.target.checked;
    try {
        // Save the preference for using Local LLM.
        await chrome.storage.local.set({ useLocalLlm: useLocalLlm });
        loadLocalLlmSettings(); // This will update statuses for both local and API key
    } catch (error) {
        console.error('Error saving Local LLM preference:', error);
        alert('Error saving Local LLM preference.');
    }
});

// Handles the click event for the "Save Document" button.
// Saves the document name and content to storage and refreshes the document list.
document.getElementById('saveDocButton').addEventListener('click', async () => {
    const docNameInput = document.getElementById('docName');
    const docContentTextarea = document.getElementById('docContent');
    let docName = docNameInput.value.trim();
    const docContent = docContentTextarea.value.trim();

    if (!docContent) {
        alert('Document content cannot be empty.'); return;
    }
    if (!docName) {
        docName = `Document_${new Date().getTime()}`; 
    }

    try {
        const data = await chrome.storage.local.get('userDocuments');
        const documents = data.userDocuments || [];
        documents.push({ name: docName, content: docContent });
        await chrome.storage.local.set({ userDocuments: documents });
        docNameInput.value = ''; 
        docContentTextarea.value = '';
        displayUserDocuments(); 
        alert('Document saved!');
    } catch (error) {
        console.error('Error saving document:', error); alert('Error saving document.');
    }
});

// Handles the click event for the "Save Profile" button.
// Saves the user's profile data to storage.
document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const userProfileTextarea = document.getElementById('userProfile');
    const profileData = userProfileTextarea.value.trim();
    if (!profileData) {
        alert('Profile content cannot be empty.'); return;
    }
    try {
        await chrome.storage.local.set({ userProfileData: profileData });
        alert('Profile saved!');
    } catch (error) {
        console.error('Error saving profile:', error); alert('Error saving profile.');
    }
});

// Handles the click event for the "Summarize" button.
// Sends a message to the background script to initiate the summarization process.
// Updates the UI with the response (summary, quotes, or error message).
document.getElementById('summarizeButton').addEventListener('click', () => {
    console.log("Side Panel: Summarize button clicked. Sending message to background.");
    const summaryOutputDiv = document.getElementById('summaryOutput');
    const quotesOutputDiv = document.getElementById('quotesOutput');
    
    summaryOutputDiv.innerText = "Processing summary...";
    quotesOutputDiv.innerText = ""; 

    chrome.runtime.sendMessage({ type: "SUMMARIZE_REQUEST" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Side Panel: Error sending/receiving msg:", chrome.runtime.lastError.message || chrome.runtime.lastError);
            summaryOutputDiv.innerText = "Error: Could not connect to background. " + (chrome.runtime.lastError.message || "");
            return;
        }
        
        if (response && response.error) {
            console.error("Side Panel: Received error from background:", response.error);
            summaryOutputDiv.innerText = `Error: ${response.error}`;
        } else if (response && response.status === "success") {
            console.log("Side Panel: Received summary from background:", response);
            summaryOutputDiv.innerText = response.summary; 
            quotesOutputDiv.innerText = response.quotes.join("\n"); 
        } else {
            console.warn("Side Panel: Unexpected response from background:", response);
            summaryOutputDiv.innerText = "Unexpected response from background script.";
        }
    });
});

// --- Initial Setup ---

// This function is executed when the side panel's DOM is fully loaded.
// It calls functions to load user data (profile, documents) and configuration settings (API key, Local LLM).
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    displayUserDocuments();
    loadApiKeyStatus(); 
    loadLocalLlmSettings(); // Load local LLM settings and update related UI statuses
});
