const loadGapiAsync = async() => {
    return new Promise((resolve, reject) => {
        gapi.load("client:auth2", () => {
            gapi.auth2.init({
                    client_id: "406673141797-idjgps1huq10bpu6nd60eks51lgk963a.apps.googleusercontent.com",
                    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
                    fetch_basic_profile: true,
                    ux_mode: "redirect"
                })
                .then(resolve)
                .catch(reject)
        });
    })
}

const loadClientAsync = async() => {
    console.log("Loading client...");
    gapi.client.setApiKey("AIzaSyBH-L4FN8eHqhihuETlel0TLriimhiEU-8");
    await gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest");
    console.log("Client loaded successfully!");
}

const initAsync = async() => {
    try {
        console.log("Loading gapi...");
        await loadGapiAsync();
        console.log("Gapi loaded successfully!");
    } catch (error) {
        console.error("An error occurred", error);
        alert(error.details);
    }
}

const getCalendarId = async(returnNew) => {
    try {
        const calendars = await gapi.client.calendar.calendarList.list()
        const calendar = calendars.result.items.find(item => item.summary.toLowerCase() === "lịch học");
        if (calendar) {
            return calendar.id;
        }
        if (!returnNew) {
            return null;
        }
        console.log("Could not find calendar name \"Lịch học\". Creating...");
        const newCalender = await gapi.client.calendar.calendars.insert({
            summary: "Lịch học"
        })
        return newCalender.result.id;
    } catch (error) {
        console.error("An error occurred", error);
    }
}

const deleteAll = async() => {
    const calendarId = await getCalendarId(false);
    if (!calendarId) {
        return console.log("No calendars found. Skipping...")
    }
    await gapi.client.calendar.calendars.delete({
        calendarId
    })
    return console.log("Calendars deleted successfully!")
}

const syncCalendarAsync = async() => {
    console.log("Start sync calendar....")
    const userId = await document.getElementById("studentId").value;
    if (!/^\d{9}$/gm.test(userId)) {
        return alert("Vui lòng nhập mã sinh viên");
    }
    const button = document.getElementById("sync");
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>Đang đồng bộ</span>';
    button.disabled = true;
    const calenderId = await getCalendarId(true);
    const events = await getAllLhuEvents(userId);
    const batch = gapi.client.newBatch();
    console.log(events)
    events.map((event) => {
        const data = {
            "calendarId": calenderId,
            "sendNotifications": true,
            "sendUpdates": "all",
            "resource": {
                "start": {
                    "dateTime": moment(event.Ngay + " " + event.Tu.replace("<sup>h</sup>", ":"), 'DDMMYYYY HH:mm').toDate()
                },
                "end": {
                    "dateTime": moment(event.Ngay + " " + event.Den.replace("<sup>h</sup>", ":"), 'DDMMYYYY HH:mm').toDate()
                },
                "summary": event.TenMonHoc + " - " + event.TenPhong,
                "description": event.GiaoVien,
                "location": "Đại học Lạc Hồng " + event.TenCoSo
            }
        }
        console.log(data);
        batch.add(gapi.client.calendar.events.insert(data));
    })
    batch.then(() => {
        button.disabled = false;
        button.innerHTML = "Đồng bộ ngay";
    })
}

async function bootstrap() {
    await initAsync();
    await checkUserAsync();
    await loadClientAsync();
}
bootstrap();