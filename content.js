function getData(){
    const data =document.querySelector("meta[name=description]");
    
    const prob= data?.getAttribute("content");

    return prob
}

chrome.runtime.onMessage.addListener((req,_sender, sendResponse)=> {
    if (req.type ==='GET_TEXT'){
        const text= getData();
        sendResponse({ text });
        
        return true;
    }
});