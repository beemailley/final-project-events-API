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
    maxLength: 100,
    default: "Event"
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
    // need to figure out if location data will be stored any differently than a string
  },
  eventCategory: {
    type: String,
    enum: ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
    default: "Category 1"
    // need to come from a specific list that matches the user schema
    // need to create interests/categories list
  },
  eventSummary: {
    type: String,
    minLength: 20,
    maxLength: 280,
    default: "This is an event for people to gather."
  },
  eventAttendees: {
    type: [AttendeeSchema],
    default: undefined
  }
});

const Event = mongoose.model("Event", EventSchema)

// Start defining your routes here
app.get("/", (req, res) => {
  res.json(allEndpoints(app));
});

//post a new event
app.post('/events', async (req, res) => {
  const response = {
    success: true,
    body: {}
  }
  const {eventName, eventDate, eventLocation, eventCategory, eventSummary} = req.body;
  try {
    const event = await new Event({eventName, eventDate, eventLocation, eventCategory, eventSummary}).save()
    response.body = event
    res.status(201).json(response)
  } catch (error) {
    response.success = false
    response.body = {message: error}
    res.status(400).json(response)
  }
})

//get a list of all events
app.get('/events', async (req, res) => {
  const response = {
    success: true,
    body: {}
  }
  try {
    const allEvents = await Event.find();
    if(allEvents){
      response.body = allEvents;
      res.status(200).json(response);
    } else {
      response.success = false
      response.body = {message: error}
      res.status(404).json(response)
    }
  } catch (error) {
    response.success = false
    response.body={message: error}
    res.status(500).json(response)
  }
})

//edit an existing event
app.patch('/events/:eventId', async (req, res) => {
  const { eventId } = req.params
  const response = {
    success: true,
    body: {}
  }
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      eventToEdit.eventName = req.body.eventName || eventToEdit.eventName;
      eventToEdit.eventDate = req.body.eventDate || eventToEdit.eventDate;
      eventToEdit.eventLocation = req.body.eventLocation || eventToEdit.eventLocation;
      eventToEdit.eventCategory = req.body.eventCategory || eventToEdit.eventCategory;
      eventToEdit.eventSummary = req.body.eventSummary || eventToEdit.eventSummary;
      
      const updatedEvent = await eventToEdit.save()
      response.body = updatedEvent
      res.status(200).json(response)
    } else {
      response.success = false
      response.body = {message: "There is no event with that ID"}
      res.status(400).json(response)
    }

  } catch (error) {
    response.success = false
    response.body = {message: error}
    res.status(400).json(response)
  }
})

//delete a single event
app.delete('/events/:eventId', async (req, res) => {
  const { eventId } = req.params
  const response = {
    success: true,
    body: {}
  }
  try {
    const eventToDelete = await Event.findById(eventId)
    if(eventToDelete){
      const deleteEvent = eventToDelete.deleteOne()
      response.body = {message: "Event Deleted"}
      res.status(200).json(response)
    } else {
      response.success = false
      response.body = {message: "There is no event with that ID"}
      res.status(400).json(response)
    }

  } catch (error) {
    response.success = false
    response.body = {message: error}
    res.status(400).json(response)
  }
})

//add attendees to an event
app.patch('/events/:eventId/attendees', async (req, res) => {
  const { eventId } = req.params
  const response = {
    success: true,
    body: {}
  }
  const {eventAttendees} = req.body;
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      const editEvent = await Event.findByIdAndUpdate(eventId, {eventAttendees: eventAttendees})
      response.body = editEvent
      res.status(200).json(response)
    } else {
      response.success = false
      response.body = {message: "There is no event with that ID"}
      res.status(400).json(response)
    }

  } catch (error) {
    response.success = false
    response.body = {message: error}
    res.status(400).json(response)
  }
})

//delete an attendee from an event
//NOT YET IDENTIFYING THE CORRECT ATTENDEE
// https://mongoosejs.com/docs/subdocs.html
app.delete('/events/:eventId/attendees/:attendeeId', async (req, res) => {
  const { eventId, attendeeId } = req.params
  const response = {
    success: true,
    body: {}
  }
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      console.log(eventToEdit)
      const attendees = eventToEdit.eventAttendees
      // const attendeeToDelete = attendees.findById(attendeeId)
      console.log("attendee to delete:", attendeeToDelete)
      // const deleteEvent = eventToDelete.deleteOne()
      // console.log("event deleted")
      // response.body = {message: "Event Deleted"}
      res.status(200).json(response)
    } else {
      response.success = false
      response.body = {message: "There is no event with that ID"}
      res.status(400).json(response)
    }

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
