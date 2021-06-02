const submit = ()=>{
    const pincode = document.getElementById("pincode").value;
    chrome.storage.local.set({'pincode':pincode}, ()=>{
    });
    document.getElementsByName("age").forEach(element => {
        console.log("==e==",element)
        if(element.checked) {
            console.log(element.value);
            chrome.storage.local.set({'age': element.value}, () => {
            });
        }
    });
    document.getElementsByName("dose").forEach(element => {
        if(element.checked) {
            console.log(element.value);
            chrome.storage.local.set({'dose': element.value}, () => {
            });
        }
    });
}

const register = document.getElementById("register");

if(register){
    register.addEventListener("click", submit);
}

