document.getElementById("Hint").addEventListener("click",()=>{
    const result = document.getElementById("result");
    const hintType= document.getElementById("hint-type").value;

    result.innerHTML = '<div class="loader"></div>';

    chrome.storage.sync.get(['geminiApiKey'], (data) => {
    const apiKey = data.geminiApiKey;
    if (!apiKey) {
        result.textContent = "No API key set. Opening settings...";
        chrome.runtime.openOptionsPage(); // open the options.html
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { type: "GET_TEXT" }, async (response) => {
            if (!response || !response.text) {
                result.textContent = "Couldn't extract text from the page.";
                return;
            }

            try {
                const resp = await getGeminiRes(response.text, hintType, apiKey);
                result.textContent = resp;
            } catch (error) {
                result.textContent = "Error: " + error.message;
            }
            });
        });
    });

});

async function getGeminiRes(rawText,type,apikey) {
  

    const promptMap = {
    "hint-dt": `Give a helpful conceptual hint (not the full solution) for solving the following LeetCode problem:\n\n${rawText}`,

    "code": `Provide a clear and structured pseudocode solution for the following LeetCode problem. Do not use specific language syntax:\n\n${rawText}`,
    };

    const prompt = promptMap[type] || "Give a helpful explanation:\n\n" + rawText;


  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`,{
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({
      contents: [{parts: [{text: prompt}] }],
      generationConfig:{ temperature: 0.2},
    }),
  });

  if (!res.ok){
    const { error } = await res.json();
    throw new Error( error ?.message || "Request Failed");

  }
  const data= await res.json();
  return data.candidates?.[0]?.content?.parts?.[0].text ?? "No summary.";
}    

