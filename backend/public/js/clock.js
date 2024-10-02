async function clock() {
    const HOURHAND = document.querySelector("#hour");
    const MINUTEHAND = document.querySelector("#minute");
    const SECONDHAND = document.querySelector("#second");

    var date = new Date();
    let hr = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    let hrPosition = (hr * 360 / 12) + (min * (360 / 60) / 12);
    let minPosition = (min * 360 / 60) + (sec * (360 / 60) / 60);
    let secPosition = sec * 360 / 60;

    function runTheTime() {
        hrPosition = hrPosition + (3 / 360);
        minPosition = minPosition + (6 / 60);
        secPosition = secPosition + 6;

        HOURHAND.style.transform = "rotate(" + hrPosition + "deg)";
        MINUTEHAND.style.transform = "rotate(" + minPosition + "deg)";
        SECONDHAND.style.transform = "rotate(" + secPosition + "deg)";
    }

    var interval = setInterval(runTheTime, 1000);
}

document.addEventListener('DOMContentLoaded', clock);

function printFormattedDate() {
    const days = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];
    const months = ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'];
    
    const currentDate = new Date();
    const day = days[currentDate.getDay()];
    const month = months[currentDate.getMonth()].toLowerCase();
    const date = currentDate.getDate();
    
    const formattedDate = `${day}, ${date}. ${month}`;

    const formattedDateSpan = document.getElementById('formattedDate');
    
    formattedDateSpan.textContent = formattedDate;
   
  }
  
  printFormattedDate();
