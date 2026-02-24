const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greetingMessage = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const noAttendeesMsg = document.getElementById("noAttendeesMsg");

// Display helpers for team names and count elements
const teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const teamDisplayElements = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

let totalAttendees = 0;
const maxCount = 50;

let attendeeEntries = [];

const teamTotals = {
  water: 0,
  zero: 0,
  power: 0,
};

const storageKeys = {
  total: "intelTotalAttendees",
  teams: "intelTeamTotals",
  entries: "intelAttendeeEntries",
};

loadSavedData();
updateAttendanceDisplay();
renderAttendeeList();
updateCelebrationMessage();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = nameInput.value.trim();
  const teamKey = teamSelect.value;

  if (attendeeName === "" || teamKey === "") {
    return;
  }

  totalAttendees += 1;
  teamTotals[teamKey] += 1;
  attendeeEntries.push({
    name: attendeeName,
    team: teamKey,
  });

  updateAttendanceDisplay();
  renderAttendeeList();
  saveData();

  const teamWord = teamTotals[teamKey] === 1 ? "attendee" : "attendees";
  const totalWord = totalAttendees === 1 ? "attendee" : "attendees";

  greetingMessage.textContent = `Welcome, ${attendeeName}! ${teamLabels[teamKey]} now has ${teamTotals[teamKey]} ${teamWord}.`;
  greetingMessage.classList.add("success-message");
  greetingMessage.style.display = "block";

  if (totalAttendees >= maxCount) {
    greetingMessage.textContent += " Attendance goal reached!";
  } else {
    greetingMessage.textContent += ` We have ${totalAttendees} ${totalWord} checked in so far.`;
  }

  updateCelebrationMessage();

  form.reset();
});

function updateAttendanceDisplay() {
  attendeeCount.textContent = totalAttendees;
  teamDisplayElements.water.textContent = teamTotals.water;
  teamDisplayElements.zero.textContent = teamTotals.zero;
  teamDisplayElements.power.textContent = teamTotals.power;

  const cappedAttendees = Math.min(totalAttendees, maxCount);
  const progressPercent = Math.round((cappedAttendees / maxCount) * 100);
  progressBar.style.width = progressPercent + "%";
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendeeEntries.length === 0) {
    noAttendeesMsg.style.display = "block";
    return;
  }

  noAttendeesMsg.style.display = "none";

  attendeeEntries.forEach(function (entry) {
    const listItem = document.createElement("li");
    listItem.className = "attendee-card";

    const attendeeNameSpan = document.createElement("span");
    attendeeNameSpan.className = "attendee-name";
    attendeeNameSpan.textContent = entry.name;

    const attendeeTeamSpan = document.createElement("span");
    attendeeTeamSpan.className = "attendee-team";
    attendeeTeamSpan.textContent = teamLabels[entry.team];

    listItem.appendChild(attendeeNameSpan);
    listItem.appendChild(attendeeTeamSpan);
    attendeeList.appendChild(listItem);
  });
}

function updateCelebrationMessage() {
  if (totalAttendees < maxCount) {
    celebrationMessage.style.display = "none";
    celebrationMessage.textContent = "";
    return;
  }

  const winningTeamKey = getWinningTeamKey();
  const winningTeamName = teamLabels[winningTeamKey];
  celebrationMessage.textContent = `Goal reached! ${winningTeamName} is leading with ${teamTotals[winningTeamKey]} attendees.`;
  celebrationMessage.style.display = "block";
}

function getWinningTeamKey() {
  let winningKey = "water";
  let highestCount = teamTotals[winningKey];

  for (const key in teamTotals) {
    if (Object.prototype.hasOwnProperty.call(teamTotals, key)) {
      if (teamTotals[key] > highestCount) {
        highestCount = teamTotals[key];
        winningKey = key;
      }
    }
  }

  return winningKey;
}

function loadSavedData() {
  const storedTotal = parseInt(localStorage.getItem(storageKeys.total), 10);
  if (!isNaN(storedTotal)) {
    totalAttendees = storedTotal;
  }

  const storedTeams = localStorage.getItem(storageKeys.teams);
  if (storedTeams) {
    try {
      const parsedTeams = JSON.parse(storedTeams);
      if (typeof parsedTeams.water === "number") {
        teamTotals.water = parsedTeams.water;
      }
      if (typeof parsedTeams.zero === "number") {
        teamTotals.zero = parsedTeams.zero;
      }
      if (typeof parsedTeams.power === "number") {
        teamTotals.power = parsedTeams.power;
      }
    } catch (error) {
      console.warn("Unable to parse stored team totals.");
    }
  }

  const storedEntries = localStorage.getItem(storageKeys.entries);
  if (storedEntries) {
    try {
      const parsedEntries = JSON.parse(storedEntries);
      if (Array.isArray(parsedEntries)) {
        attendeeEntries = parsedEntries;
      }
    } catch (error) {
      console.warn("Unable to parse stored attendee list.");
    }
  }
}

function saveData() {
  localStorage.setItem(storageKeys.total, totalAttendees.toString());
  localStorage.setItem(storageKeys.teams, JSON.stringify(teamTotals));
  localStorage.setItem(storageKeys.entries, JSON.stringify(attendeeEntries));
}
