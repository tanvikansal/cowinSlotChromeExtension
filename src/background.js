const getDoseAvailability = (session,dose) => {
    if(dose === "dose1")
        return session.available_capacity_dose1;
    if(dose === "dose2")
        return session.available_capacity_dose2;
    if(dose === "precaution_dose")
        return session.precaution_online_dose_one_available;
}

const slotInfoFiltering = (filter,data) => {
    const { min_age, pincode, dose } = filter;
    return data.filter(center => center.pincode == pincode ).filter(centre => {
        const { sessions } = centre;
        const filteredSessions  = sessions.filter(session => session.min_age_limit == min_age && getDoseAvailability(session,dose) > 0);
        if(filteredSessions.length > 0) return true;
        return false;
    });
}

const getData = (delay) =>{
    const time = new Date();
    setTimeout(async () => {
        console.log('Current Time', `${time}`)
        chrome.storage.local.get(['pincode','date'], async (result) => {
            const {pincode , date} = result;
            const response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`, {
                method: 'GET',
                headers: {
                    'Accept-Language': 'hi_IN',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
                }
            });
            const slot = await response.json();
            chrome.storage.local.get(['age'], result => {
                const {age} = result;
                chrome.storage.local.get(['dose'], result =>{
                    const {dose} = result;
                    const slotInfo = slot.centers ? slotInfoFiltering({pincode, min_age: age, dose}, slot.centers) : [];
                    console.log("===Slot-Info===",slotInfo);
                    if (slotInfo.length > 0) {
                        const finalData = slotInfo.map(slot => {
                            const {sessions} = slot;
                            return sessions.map(session => {return {date: session.date, availability : getDoseAvailability(session,dose)}});
                        })
                        console.log(finalData);
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'images/get_started16.png',
                            title: 'Voila! I got a slot for you.',
                            message: JSON.stringify(finalData)
                        }, function (notificationId) {
                            console.log("notificationId", notificationId);
                        });
                    }
                });
            });

        });
        getData(delay + 1);
    },delay * 6000);
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
    getData(1);
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
    getData(1)
});
