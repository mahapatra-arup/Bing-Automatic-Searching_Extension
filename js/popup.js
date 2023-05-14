import words from '../data/words.js'

chrome.runtime.connect({ name: "popup" });

let andreaCorrigaWebsite = 'https://bing.com'

// Phones for mobile searches Mozilla/5.0 (Linux; Android 8.1.0; Pixel Build/OPM4.171019.021.D1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36 EdgA/42.0.0.2057

var phonesArray = [{
    title: "Google Nexus 4",
    width: 0,
    height: 0,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (Linux; Android 12; SM-N9750) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36 EdgA/111.0.1661.48",
    touch: true,
    mobile: true
}]

var phones = {}

phonesArray.forEach(function (phone) {
    phones[phone.title.replace(/\s+/gi, '')] = phone;
})

// Wait time between searches
let milliseconds = 1503
// Default value
let numberOfSearches = 50
let numberOfSearchesMobile = 45

// Dom Elements for jQuery purpose
const domElements = {
    txtDelaySearchesForm: '#txtDelaySearchesForm',
    currentSearchNumber: '#currentSearchNumber',
    currentSearchMobileNumber: '#currentSearchMobileNumber',
    totSearchesNumber: '#totSearchesNumber',
    totSearchesMobileNumber: '#totSearchesMobileNumber',
    allButton: '#allButton',
    desktopButton: '#desktopButton',
    mobileButton: '#mobileButton',
    totSearchesForm: '#totSearchesForm',
    totSearchesMobileForm: '#totSearchesMobileForm'
}

// Await time between searches
const timer = ms => new Promise(res => setTimeout(res, ms))

// Progressbar object
let progressDesktop = document.querySelector(".progress-bar-desktop")
let progressMobile = document.querySelector(".progress-bar-mobile")

//--------------Delay Of Searches-----------------
// Set Delay Of Searches default values inside the input (Update)
$(domElements.txtDelaySearchesForm).val(milliseconds)
// Update the html with default numberOfSearches number 0/totSearches
$(domElements.txtDelaySearchesForm).html(milliseconds)
// When change the value inside the input
$(domElements.txtDelaySearchesForm).on('change', function () {
    milliseconds = parseInt($(domElements.txtDelaySearchesForm).val())
    $(domElements.txtDelaySearchesForm).html(milliseconds)

})
//------------------------------------------------

// Set numberOfSearches default values inside the input
$(domElements.totSearchesForm).val(numberOfSearches)
$(domElements.totSearchesMobileForm).val(numberOfSearchesMobile)

// Update the html with default numberOfSearches number 0/totSearches
$(domElements.totSearchesNumber).html(numberOfSearches)
$(domElements.totSearchesMobileNumber).html(numberOfSearchesMobile)

// When change the value inside the input
$(domElements.totSearchesForm).on('change', function () {
    numberOfSearches = parseInt($(domElements.totSearchesForm).val())
    $(domElements.totSearchesNumber).html(numberOfSearches)

})

$(domElements.totSearchesMobileForm).on('change', function () {
    numberOfSearchesMobile = parseInt($(domElements.totSearchesMobileForm).val())
    $(domElements.totSearchesMobileNumber).html(numberOfSearchesMobile)

})

//All  pc & mobile both Search
$(domElements.allButton).on('click', async () => {
    
    //pc search
    await doSearchesDesktop()

    //sleep
    await timer(3000)

    //mobile search
    let tabId = await getTabId()
    handleMobileMode(tabId)

})

// Start search desktop
$(domElements.desktopButton).on("click", () => {

    doSearchesDesktop()
    $($('#id_rh').click()); // For Open Rewards Section under Bing.com
})

// Start search mobile
$(domElements.mobileButton).on('click', async () => {

    let tabId = await getTabId()
    handleMobileMode(tabId)
    $('#id_rh').trigger('click'); // For Open Rewards Section under Bing.com
})

/**
 * Perform random searches on Bing
 */
async function doSearchesDesktop() {

    deactivateForms()

    for (var i = 0; i < numberOfSearches; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)


        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`, active: true})

        setProgress(parseInt(((i + 1) / numberOfSearches) * 100), 'desktop')

        $(domElements.currentSearchNumber).html(i + 1)
        await timer(milliseconds + 2) //Increase 2 mili second
    }

    openAndreaCorriga()

    setProgress(0, 'desktop')
    activateForms()
}

/**
 * Perform random searches Mobile on Bing
 */
async function doSearchesMobile() {

    deactivateForms()

    for (var i = 0; i < numberOfSearchesMobile; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`, active: true})

        setProgress(parseInt(((i + 1) / numberOfSearchesMobile) * 100), 'mobile')

        $(domElements.currentSearchMobileNumber).html(i + 1)
        await timer(milliseconds + 2)//Increase 2 mili second
    }

    setProgress(0, 'mobile')
    activateForms()
}

function openAndreaCorriga() {
    chrome.tabs.update({
        url: andreaCorrigaWebsite
    })

}

/**
 * Deactivate Make search button 
 * and Number of Search form
 */
function deactivateForms() {
    $(domElements.txtDelaySearchesForm).prop("disabled", true)
    $(domElements.allButton).prop("disabled", true)
    $(domElements.desktopButton).prop("disabled", true)
    $(domElements.mobileButton).prop("disabled", true)
    $(domElements.totSearchesForm).prop("disabled", true)
    $(domElements.totSearchesMobileForm).prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $(domElements.txtDelaySearchesForm).prop("disabled", false)
    $(domElements.allButton).prop("disabled", false)
    $(domElements.desktopButton).prop("disabled", false)
    $(domElements.mobileButton).prop("disabled", false)
    $(domElements.totSearchesForm).prop("disabled", false)
    $(domElements.totSearchesMobileForm).prop("disabled", false)
    // For Open Rewards Section under Bing.com
    $('#id_rh').trigger('click');

}

/**
 * Update progressbar value
 * @param {*} value 
 */
function setProgress(value, type) {
    if (type == 'desktop') {
        progressDesktop.style.width = value + "%";
        progressDesktop.innerText = value + "%";
    }

    if (type == 'mobile') {
        progressMobile.style.width = value + "%";
        progressMobile.innerText = value + "%";
    }
}

async function getTabId() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0]
            var activeTabId = activeTab.id
            resolve(activeTabId)
        })
    })
}

function handleMobileMode(tabId) {
    enableDebugger(tabId)

    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Network.setUserAgentOverride", {
        userAgent: phones.GoogleNexus4.userAgent
    }, function () {

        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Page.setDeviceMetricsOverride", {
            width: phones.GoogleNexus4.width,
            height: phones.GoogleNexus4.height,
            deviceScaleFactor: phones.GoogleNexus4.deviceScaleFactor,
            mobile: phones.GoogleNexus4.mobile,
            fitWindow: true
        }, async function () {
            await doSearchesMobile()

            disableDebugger(tabId)

            openAndreaCorriga()
        })

    })

}

function enableDebugger(tabId) {
    chrome.debugger.attach({ tabId }, "1.2", function () {
        console.log(`Debugger enabled by tab: ${tabId}`);
    })
}

function disableDebugger(tabId) {
    chrome.debugger.detach({ tabId }, function () {
        console.log(`Debugger disables by tab: ${tabId}`);
    })
}