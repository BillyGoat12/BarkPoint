const { Router } = require('express');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const twilio = require('twilio')(accountSid, authToken);

const { Dog, User, Park } = require('../db/models/models');

const dbRouter = Router();
/**
 * Adds a new user into the barkPoint database
 */
dbRouter.post('/data/user', (req, res) =>
  User(req.body)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    })
);
/**
 * Finds all dogs whose user_email field matches the current sessions user's email
 */
dbRouter.get('/data/dog', ({ user }, res) => {
  const { _json } = user;
  Dog.findDogs(_json.email)
    .then((dogs) => {
      if (dogs.length) {
        res.status(200).send(dogs);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
/**
 * Adds a new dog into the barkPoint database.
 *
 * @data is equal to the current sessions user's email
 *
 * @personalitytypes is an array of length 3. It's values are booleans with
 * each value correlating to a personality type. Swiping left equaling false
 * and swiping right equaling false.
 */
dbRouter.post('/data/dog', (req, res) => {
  const {
    size,
    breed,
    number,
    email,
    dogname,
    image,
    personalitytypes,
  } = req.body;
  return Dog.addDog(
    dogname,
    breed,
    size,
    number,
    email,
    image,
    personalitytypes
  )
    .then(() => {
      // Message.addMsg(dogname, breed, size, number, email, image,
      twilio.messages
        .create({
          body: `Welcome to BarkPoint! ${dogname} has been registered. You will now recieve notifications at this number.`,
          from: '+12678677568',
          statusCallback: 'http://postb.in/1234abcd',
          to: `${number}`,
        })
        .then((message) => console.log(message.sid))
        .catch((err) => console.log('TWILIO ERROR==>', err));
      res.sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

/**
 * Adds a new toy into a the currently selected dog's toy field (an array)
 *
 * @id is equal to the current dog's mongo-provided ObjectId
 * @body is equal to an object with the to be added toy's info (see dog.js in models)
 */
dbRouter.put('/data/dog/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req;
  return Dog.addToy(id, body)
    .then(() => {
      // console.log('aanythinh');
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  // return dog.then(console.log('inside dog', dog));
});
/**
 * Removes a toy from the currently selected dog's toy field (an array)
 *
 * @id is equal to the current dog's mongo-provided ObjectId
 * @body is equal to an object with the to be deleted toy's info (see dog.js in models)
 */
dbRouter.delete('/data/toy:id', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  return Dog.removeToy(id, data)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
/**
 * Removes a dog from the barkPoint database
 *
 * @id is equal to the current dog's mongo-provided ObjectId
 */
dbRouter.delete('/data/dog:id', (req, res) => {
  const { id } = req.params;
  return Dog.deleteDog(id)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
dbRouter.get('/data/park', async (req, res) => {
  const allDogs = await Park.getParks();
  console.warn(allDogs);
  res.status(200).send(allDogs);
});
/**
 * Adds a park into the barkPoint database
 */
dbRouter.post('/data/park', (req, res) => {
  const { name, lat, long, comments } = req.body;
  return Park.addPark(name, lat, long, comments)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
/**
 * Updates the comment field of the selected park
 *
 * @name is equal to the name field of the park whose comment you wish to update
 */
dbRouter.put('/data/park', (req, res) => {
  const { name, comment } = req.body;
  return Park.updatePark(name, comment)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

/**
 * Wipes the existing favorite park from the user's history.
 * The params include an @id for the user and an @body for the
 * specified park.
 */

dbRouter.put('/data/unfavpark/:email', (req, res) => {
  const { email } = req.params;
  const { body } = req; // you only need the park name
  console.warn('id in db router for park', email);
  console.warn(body);
  return User.unFavPark(email, body)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
/**
 * Adds a park into a the current users parks field (an array)
 *
 * @id is equal to the current user's mongo-provided ObjectId
 * @body is equal to an object with the to be added park's info
 */
dbRouter.put('/data/favpark/:email', (req, res) => {
  const { email } = req.params;
  const { body } = req; // you only need the park name
  console.warn('id in db router for park', email);
  return User.favPark(email, body)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

/**
 * Below is the getter for favorite parks. This request is made to
 * retrieve the favorite parks from a specific user id @param {string} id .
 *
 * The request outputs the park object data in the form of an @array .
 */
dbRouter.get('/data/favpark', (req, res) => {
  const { id } = req.query;
  User.getFavParks(id)
    .then((parkData) => {
      res.status(200).send(parkData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});
/**
 * Removes a specific park from the barkPoint database based on @name .
 */
dbRouter.delete('/data/park/:id', (req, res) => {
  const { name } = req.params;
  return Park.deletePark(name)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

dbRouter.get('/findUser', (req, res) => {
  User.User.find().then((users) => {
    res.send(users);
  });
});

module.exports = dbRouter;
