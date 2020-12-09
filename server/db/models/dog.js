const { Schema, model } = require('mongoose');

const dogSchema = new Schema({
  name: String,
  breed: String,
  size: String,
  number: String,
  email_user: String,
  toys: [],
  image: String,
  /**
   * @personalitytypes contains the persisted results from the personality assessment.
   * The order in which personality types are read are as follows:
   * ------------------------------------------------------------
   * Index: @param {0} = outgoing @param {1} = aggressive @param {2} = active
   */
  personalitytypes: [],
});

const Dog = model('Dog', dogSchema);

/**
 * Adds a new dog instance depending on what options a user sets in the form.
 */

const addDog = (name, breed, size, number, emailUser, image, personalitytypes) => Dog.create({
  name,
  breed,
  size,
  number,
  email_user: emailUser,
  toys: [],
  image,
  personalitytypes,
})
  .then((data) => data);

/**
 * Takes in @param {*} emailUser which is the Id of the recorded user session.
 */

const findDogs = (emailUser) => Dog.find({ email_user: emailUser });

const deleteDog = (id) => Dog.deleteOne({ _id: id });

/**
 *
 * Takes in @param {*} dogId & @param {*} body
 * addToy creates a new toy instances which is then bound to a dog
 * based on Id properties. The @param {*} body is the toy data in which
 * serpwow's API generates.
 */
const addToy = (id, body) => {
  const newToy = {
    name: body.title,
    price: body.price,
    image: body.image,
    url: body.link,
    rating: body.rating,
  };
  // console.log(newToy);
  return Dog.findByIdAndUpdate(
    id,
    { $addToSet: { toys: newToy } },
  );
};

/**
 * Takes in a @param {*} dogId and @param {*} body.
 * should remove a toy from a specific dog depending on id.
 */
const removeToy = (id, body) => Dog.findByIdAndUpdate(
  id,
  { $pull: { toys: body } },
);

/**
 * Takes in a @param {*} dogId and @param {*} body.
 * should change the number of a specific dog depending on id.
 */
const changeNumber = (email, body) => {
  const newNum = { number: body.number };
  return Dog.updateMany(
    { email_user: email }, newNum,
  );
};

module.exports = {
  addDog,
  deleteDog,
  addToy,
  removeToy,
  findDogs,
  changeNumber,
};
