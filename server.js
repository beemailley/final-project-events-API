import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/final-project-events";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();
const allEndpoints = require('express-list-endpoints');

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const {Schema} = mongoose;

const AttendeeSchema = new Schema ({
  username: {
    type: String
  },
  userCountry: {
    type: String
  }
})

const Attendee = mongoose.model("Attendee", AttendeeSchema)

const EventSchema = new Schema ({
  eventName: {
    type: String,
    minLength: 5,
    maxLength: 100
  },
  eventDate: {
    type: Date,
    default: () => new Date ()
  }, 
  // eventTime: {
  //   type: String
  //   // need to figure out how to store time in mongoose/JS
  // }, 
  eventLocation: {
    type: String,
    default: ""
  },
  eventCategory: {
    type: String,
    enum: ["Women", "Children", "Pets", "Arts", "Crafts","Everybody"],
    default: "Everybody"
    // need to come from a specific list that matches the user schema
    // need to create interests/categories list
  },
  eventSummary: {
    type: String,
    // minLength: 20,
    maxLength: 280,
    default: ""
  },
  eventAttendees: {
    type: [AttendeeSchema],
    default: undefined
    // need to figure out how to store arrays of objects
    // https://mongoosejs.com/docs/schematypes.html#arrays
  }
});

const Event = mongoose.model("Event", EventSchema)

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
  // res.json(allEndpoints(app));
});

app.post('/events', async (req, res) => {
  const response = {
    success: true,
    body: {}
  }
  const {eventName} = req.body;
  try {
    const event = await new Event({eventName}).save()
    response.body = event
    res.status(201).json(response)
  } catch (error) {
    response.success = false
    response.body = {message: error}
    res.status(400).json(response)
  }
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
