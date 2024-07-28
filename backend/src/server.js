const express = require("express");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const app = express();
const port = process.env.PORT || 8000;
require("dotenv").config();

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

google.options({ auth: oauth2Client });

// Endpoint to start the OAuth2 flow
app.get("/google/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.redirect(authUrl);
});

// Endpoint for Google OAuth2 callback
app.get("/google/redirect", (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error("Error retrieving access token", err);
      return res.status(400).send("Error retrieving access token");
    }
    oauth2Client.setCredentials(token);
    // Respond with HTML that redirects to /create-event after 3 seconds
    res.send(`
      <html>
        <body>
          <p>Success! You will be redirected to create an event shortly...</p>
          <button id="redirectButton">Go to Create Event</button>
          <script>
            setTimeout(() => {
              window.location.href = "/create-event";
            }, 3000);
            document.getElementById("redirectButton").onclick = function() {
              window.location.href = "/create-event";
            };
          </script>
        </body>
      </html>
    `);
  });
});

// Function to create an event
app.get("/create-event", (req, res) => {
  const calendar = google.calendar("v3");
  const now = new Date();

  const start = new Date(now);
  start.setHours(start.getHours() + 1);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const event = {
    summary: "Test Event",
    location: "Toronto, ON",
    description: "This is a test event",
    start: {
      dateTime: start.toISOString(),
      timeZone: "America/Toronto",
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: "America/Toronto",
    },
  };

  calendar.events.insert(
    {
      auth: oauth2Client,
      calendarId: "primary",
      resource: event,
    },
    (err, event) => {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        return res.status(500).send(err);
      }
      console.log("Event created: %s", event.data.htmlLink);
      res.send(`
        <html>
          <body>
            <p>Event created: <a href="${event.data.htmlLink}">${event.data.htmlLink}</a></p>
            <p>You will be redirected to create another event shortly...</p>
            <script>
              setTimeout(() => {
                window.location.href = "/create-event";
              }, 10000);
            </script>
          </body>
        </html>
      `);
    }
  );
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
