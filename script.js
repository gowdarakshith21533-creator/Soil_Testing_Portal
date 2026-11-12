// =================================
// SOILCARE DATABASE (DEMO)
// =================================

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getUser() {
    return JSON.parse(localStorage.getItem("soilcareUser") || "null");
}

function isAdmin() {
    return sessionStorage.getItem("soilcareAdmin") === "true";
}


// =================================
// PAGE NAVIGATION
// =================================

function showPage(page) {

    const protectedPages = [
        "dashboard",
        "appointment",
        "reports"
    ];

    if (protectedPages.includes(page) && !getUser()) {
        alert("Please login first.");
        page = "login";
    }

    if (page === "adminDashboard" && !isAdmin()) {
        page = "adminLogin";
    }

    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    if (page === "dashboard") loadDashboard();

    if (page === "reports") loadReports();

    if (page === "adminDashboard") loadAdmin();
}


// =================================
// FARMER REGISTRATION
// =================================

document.getElementById("registerForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const user = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim().toLowerCase(),

        phone: document.getElementById("phone").value,

        address: document.getElementById("address").value.trim(),

        password: document.getElementById("password").value

    };

    if (!/^[0-9]{10}$/.test(user.phone)) {
        alert("Enter valid 10 digit mobile number.");
        return;
    }

    if (user.password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }

    let users = getData("soilcareUsers");

    if (users.some(u => u.email === user.email)) {
        alert("Email already registered.");
        return;
    }

    users.push(user);

    saveData("soilcareUsers", users);

    alert("Registration successful!");

    this.reset();

    showPage("login");

});


// =================================
// FARMER LOGIN
// =================================

document.getElementById("loginForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const users = getData("soilcareUsers");

    const user = users.find(u =>
        u.email === email && u.password === password
    );

    if (!user) {
        alert("Invalid email or password.");
        return;
    }

    localStorage.setItem("soilcareUser", JSON.stringify(user));

    alert("Welcome " + user.name);

    this.reset();

    showPage("dashboard");

});


// =================================
// FARMER DASHBOARD
// =================================

function loadDashboard() {

    const user = getUser();

    if (!user) return;

    document.getElementById("farmerName").textContent = user.name;

    const appointments = getData("soilcareAppointments")
        .filter(a => a.email === user.email);

    const reports = getData("soilcareReports")
        .filter(r => r.email === user.email);

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("pendingAppointments").textContent =
        appointments.filter(a => a.status === "Pending" ||
            a.status === "Approved").length;

    document.getElementById("completedAppointments").textContent =
        appointments.filter(a => a.status === "Completed").length;

    document.getElementById("totalReports").textContent =
        reports.length;

}


// =================================
// FARMER LOGOUT
// =================================

function logout() {

    localStorage.removeItem("soilcareUser");

    alert("Logged out successfully.");

    showPage("home");

}


// =================================
// APPOINTMENT BOOKING
// =================================

document.getElementById("appointmentForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const user = getUser();

    if (!user) {
        alert("Please login.");
        showPage("login");
        return;
    }

    const date = document.getElementById("date").value;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!date || new Date(date + "T00:00:00") < today) {
        alert("Please select today or a future date.");
        return;
    }

    let appointments = getData("soilcareAppointments");

    const appointment = {

        id: "SC" + Date.now(),

        email: user.email,

        farmer: user.name,

        phone: user.phone,

        village: document.getElementById("village").value,

        land: document.getElementById("land").value,

        soilType: document.getElementById("soilType").value,

        crop: document.getElementById("crop").value,

        date: date,

        description: document.getElementById("description").value,

        status: "Pending"

    };

    appointments.push(appointment);

    saveData("soilcareAppointments", appointments);

    alert("Appointment booked successfully!\nYour ID: " + appointment.id);

    this.reset();

    showPage("dashboard");

});


// =================================
// FARMER REPORTS
// =================================

function loadReports() {

    const user = getUser();

    if (!user) return;

    const reports = getData("soilcareReports")
        .filter(r => r.email === user.email);

    const table = document.getElementById("reportTable");

    table.innerHTML = "";

    if (reports.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">No reports available.</td>
            </tr>
        `;

        return;

    }

    reports.forEach(r => {

        const row = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = r.id;

        const appointment = document.createElement("td");
        appointment.textContent = r.appointmentId;

        const date = document.createElement("td");
        date.textContent = r.date;

        const downloadCell = document.createElement("td");

        const link = document.createElement("a");

        link.href = r.file;
        link.download = r.fileName;
        link.textContent = "Download PDF";

        downloadCell.appendChild(link);

        row.append(id, appointment, date, downloadCell);

        table.appendChild(row);

    });

}


// =================================
// ADMIN LOGIN
// =================================

document.getElementById("adminLoginForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const email = document.getElementById("adminEmail").value;

    const password = document.getElementById("adminPassword").value;

    if (
        email === "admin@soilcare.com" &&
        password === "Admin@123"
    ) {

        sessionStorage.setItem("soilcareAdmin", "true");

        alert("Admin login successful!");

        this.reset();

        showPage("adminDashboard");

    } else {

        alert("Invalid admin email or password.");

    }

});


// =================================
// ADMIN DASHBOARD
// =================================

function loadAdmin() {

    const users = getData("soilcareUsers");

    const appointments = getData("soilcareAppointments");

    const reports = getData("soilcareReports");

    document.getElementById("adminFarmers").textContent =
        users.length;

    document.getElementById("adminAppointments").textContent =
        appointments.length;

    document.getElementById("adminReports").textContent =
        reports.length;

    const table = document.getElementById("adminAppointmentTable");

    table.innerHTML = "";

    if (appointments.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">No appointments found.</td>
            </tr>
        `;

        return;

    }

    appointments.forEach(a => {

        const row = document.createElement("tr");

        const values = [
            a.id,
            a.farmer,
            a.phone,
            a.village,
            a.soilType,
            a.crop,
            a.date
        ];

        values.forEach(value => {

            const td = document.createElement("td");

            td.textContent = value;

            row.appendChild(td);

        });

        const statusCell = document.createElement("td");

        const select = document.createElement("select");

        ["Pending", "Approved", "Completed", "Rejected"]
            .forEach(status => {

                const option = document.createElement("option");

                option.value = status;
                option.textContent = status;
                option.selected = a.status === status;

                select.appendChild(option);

            });

        select.addEventListener("change", function() {

            let all = getData("soilcareAppointments");

            const appointment = all.find(x => x.id === a.id);

            appointment.status = this.value;

            saveData("soilcareAppointments", all);

            loadAdmin();

        });

        statusCell.appendChild(select);

        row.appendChild(statusCell);

        table.appendChild(row);

    });

}


// =================================
// ADMIN REPORT UPLOAD
// =================================

document.getElementById("uploadForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    if (!isAdmin()) {
        alert("Admin login required.");
        showPage("adminLogin");
        return;
    }

    const appointmentId =
        document.getElementById("uploadAppointmentId").value.trim();

    const file =
        document.getElementById("reportFile").files[0];

    if (!file) {
        alert("Please select a PDF.");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
    }

    // Local Storage has limited capacity.
    if (file.size > 1024 * 1024) {
        alert("Please use a PDF smaller than 1 MB for this demo.");
        return;
    }

    let appointments = getData("soilcareAppointments");

    const appointment = appointments.find(
        a => a.id === appointmentId
    );

    if (!appointment) {
        alert("Appointment ID not found.");
        return;
    }

    let reports = getData("soilcareReports");

    if (reports.some(r => r.appointmentId === appointmentId)) {
        alert("A report has already been uploaded for this appointment.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {

        reports.push({

            id: "RPT" + Date.now(),

            appointmentId: appointment.id,

            email: appointment.email,

            date: new Date().toLocaleDateString(),

            fileName: file.name,

            file: reader.result

        });

        saveData("soilcareReports", reports);

        appointment.status = "Completed";

        saveData("soilcareAppointments", appointments);

        alert("PDF uploaded successfully!");

        document.getElementById("uploadForm").reset();

        loadAdmin();

    };

    reader.onerror = function() {

        alert("PDF upload failed.");

    };

    reader.readAsDataURL(file);

});


// =================================
// ADMIN LOGOUT
// =================================

function adminLogout() {

    sessionStorage.removeItem("soilcareAdmin");

    alert("Admin logged out.");

    showPage("home");

}


// =================================
// INITIAL PAGE
// =================================

showPage("home");