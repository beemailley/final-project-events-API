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


const AttendeeSchema = new mongoose.Schema ({ 
  attendeeName: {
    type: String
  },
  attendeeCountry: {
    type: String
  }
})

const Attendee = mongoose.model("Attendee", AttendeeSchema)

const EventSchema = new mongoose.Schema ({
  eventName: {
    type: String,
    minLength: 5,
    maxLength: 100,
    default: "Event"
  },
  eventDateAndTime: {
    type: Date,
    default: () => new Date ()
    // will need to convert any inputs for date and time on frontend to a Date object
  }, 
  eventVenue: {
    type: String,
    default: ""
  },
  eventAddress: {
    type: String,
    default: ""
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
  const {eventName, eventDateAndTime, eventVenue, eventAddress, eventCategory, eventSummary} = req.body;
  try {
    const event = await new Event({eventName, eventDateAndTime, eventVenue, eventAddress, eventCategory, eventSummary}).save()
   res.status(201).json({
    success: true,
    response: event
   })
  } catch (error) {
    res.status(400).json({
      success: false,
      response: {message: error}
    })
  }
})

//get a list of all events
app.get('/events', async (req, res) => {
  try {
    const allEvents = await Event.find();
    if(allEvents){
      res.status(200).json({
        success: true,
        response: allEvents
      });
    } else {
      res.status(404).json({
        success: false,
        response: {message: error}
      })
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
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      eventToEdit.eventName = req.body.eventName || eventToEdit.eventName;
      eventToEdit.eventDateAndTime = req.body.eventDateAndTime || eventToEdit.eventDateAndTime;
      eventToEdit.eventVenue = req.body.eventVenue || eventToEdit.eventVenue;
      eventToEdit.eventAddress = req.body.eventAddress|| eventToEdit.eventAddress;
      eventToEdit.eventCategory = req.body.eventCategory || eventToEdit.eventCategory;
      eventToEdit.eventSummary = req.body.eventSummary || eventToEdit.eventSummary;
      const updatedEvent = await eventToEdit.save()
      res.status(200).json({
        success: true,
        response: updatedEvent
      })
    } else {
      res.status(400).json({
        success: false,
        response: {message: "There is no event with that ID"}
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: {message: error}
    })
  }
})

//delete a single event
app.delete('/events/:eventId', async (req, res) => {
  const { eventId } = req.params
  try {
    const eventToDelete = await Event.findById(eventId)
    if(eventToDelete){
      const deleteEvent = eventToDelete.deleteOne()
      res.status(200).json({
        success: true,
        response: {message: "Event Deleted"}
      })
    } else {
      res.status(400).json({
        success: false,
        response: {message: "There is no event with that ID"}
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: {message: error}
    })
  }
})

//add attendees to an event
app.post('/events/:eventId/attendees', async (req, res) => {
  const { eventId } = req.params
  const {attendeeName, attendeeCountry} = req.body;
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      const editEvent = await Event.updateOne(
        {_id: eventId},
        {
          $push: {
            eventAttendees: {
              $each:[ {attendeeName: attendeeName, attendeeCountry: attendeeCountry}]
            }
        }}
      )
      res.status(200).json({
        success: true,
        response: {message: "Attendee added"}
      })
    } else {
      res.status(400).json({
        success: false,
        response: {message: "There is no event with that ID"}
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: {message: error}
    })
  }
})

//delete an attendee from an event
app.delete('/events/:eventId/attendees/:attendeeId', async (req, res) => {
  const { eventId, attendeeId } = req.params
  try {
    const eventToEdit = await Event.findById(eventId)
    if(eventToEdit){
      const editEvent = await Event.updateOne(
        {_id: eventId},
        {
          $pull: {
            eventAttendees: {_id: attendeeId}
        }}
      )
      res.status(200).json({
        success: true,
        response: {message: "Attendee removed"}
      })
    } else {
      res.status(400).json({
        success: false,
        response: {message: "There is no event or attendee with that ID"}
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      response: {message: error}
    })
  }
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
