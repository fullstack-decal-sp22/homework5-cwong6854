const express = require('express');
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(port, () => {
    console.log(`Listenining on http://localhost:${port}`);
})

const mongoose = require('mongoose')

const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

db.once('open', _ => {
    console.log("Database connected: ", url);
})

db.on('error', err => {
    console.error("connection error", err);
})

const Schema = mongoose.Schema
const apodSchema = Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
}, {collection: 'images'})

const APOD = mongoose.model('APOD', apodSchema)

app.get("/", function (req, res) {
  APOD.find().then((images) => {
    res.json({message: "Return all images", images: images})
  })
})

app.get("/favorite", function (req, res) {
    // GET "/favorite" should return our favorite image by highest rating
      APOD.find().sort({'rating': 'desc'}).exec((error, images) => {
      if (error) {
        console.log(error)
        res.send(500)
      } else {
        res.json({favorite: images[0]})
      }
    })
  })

app.post("/add", function (req, res) {
    // POST "/add" adds an APOD image to our database
      const apod = new APOD({
        title: req.body.title,
        url: req.body.url,
        rating: req.body.rating
      })
      apod.save((error) => {
        if (error) {
          res.json({status: "failure"});
        } else {
          res.json({
            status: "success",
            content: req.body
          });
        }
      })
    });
  
app.delete("/delete", function (req, res) {
    // DELETE "/delete" deletes an image according to the title
  APOD.deleteOne(req.params.title, (error) => {
    if (error) {
      res.json({status: "failure"});
    } else {
      res.json({status: "success"})
    }
  })
})

