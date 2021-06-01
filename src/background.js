const slotInfoFiltering = (filter,data) => {
    const { min_age, pincode } = filter;
    return data.filter(center => center.pincode == pincode ).filter(centre => {
        const { sessions } = centre;
        const filteredSessions  = sessions.filter(session => session.min_age_limit == min_age && session.available_capacity > 0);
        if(filteredSessions.length > 0) return true;
        return false;
    });
}

const getData = (delay) =>{
    const time = new Date();
    setTimeout(async () => {
        console.log('Current Time', `${time}`)
        const response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=208011&date=${new Date().getDate()}`,{
            method: 'GET',
            headers: {'Accept-Language': 'hi_IN','User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}});
        const slot = await response.json();
        const slotInfo = slotInfoFiltering({pincode:"208011", min_age: 18}, slot.centers);
        console.log("=====",slotInfo);
        if(slotInfo.length > 0) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/get_started16.png',
                title: 'Voila! I got a slot for you.',
                message: 'Vaccine slot available'+JSON.stringify(slotInfo)
            }, function(notificationId) {
                console.log("==N==",notificationId);
            });
        }
        getData(delay + 1);
    },delay * 3000);
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("started");
    getData(1)
});

chrome.runtime.onStartup.addListener(() => {
    console.log("started");
    getData(1)
})